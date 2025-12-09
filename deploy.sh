#!/bin/bash

# Script de despliegue para SiGeST en Ubuntu (Google Cloud)
# Este script automatiza la mayor parte del proceso de despliegue

set -e  # Salir si hay algún error

echo "=========================================="
echo "  Script de Despliegue SiGeST"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se está ejecutando como root o con sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor ejecuta este script con sudo: sudo bash deploy.sh"
    exit 1
fi

# Actualizar sistema
print_info "Actualizando sistema..."
apt-get update -y
apt-get upgrade -y

# Instalar dependencias básicas
print_info "Instalando dependencias básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
print_info "Verificando instalación de Docker..."
if ! command -v docker &> /dev/null; then
    print_info "Instalando Docker..."
    # Agregar repositorio oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    print_info "Docker instalado correctamente"
else
    print_info "Docker ya está instalado"
fi

# Instalar Docker Compose (standalone si no está incluido)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_info "Instalando Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_info "Docker Compose instalado correctamente"
else
    print_info "Docker Compose ya está instalado"
fi

# Crear directorio de la aplicación
APP_DIR="/opt/sigest"
print_info "Creando directorio de la aplicación en $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Verificar si ya existe el código
if [ -d "$APP_DIR/.git" ]; then
    print_warn "El código ya existe. ¿Deseas actualizarlo? (s/n)"
    read -r response
    if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        print_info "Actualizando código desde Git..."
        git pull
    else
        print_info "Manteniendo código existente"
    fi
else
    print_warn "No se encontró código en $APP_DIR"
    print_warn "Por favor, clona tu repositorio manualmente o copia los archivos a $APP_DIR"
    print_warn "Ejemplo: git clone <tu-repositorio> $APP_DIR"
    exit 1
fi

# Crear archivo .env si no existe
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_info "Creando archivo .env desde env.example..."
    if [ -f "$APP_DIR/env.example" ]; then
        cp "$APP_DIR/env.example" "$ENV_FILE"
        print_warn "IMPORTANTE: Debes editar $ENV_FILE con tus valores de producción"
        print_warn "Especialmente:"
        print_warn "  - POSTGRES_PASSWORD (genera una contraseña segura)"
        print_warn "  - JWT_SECRET (genera una clave secreta segura)"
        print_warn "  - REFRESH_SECRET (genera otra clave secreta segura)"
        print_warn "  - RESEND_API_KEY (si usas envío de correos)"
        print_warn "  - VITE_API_URL (URL de tu API en producción)"
        print_warn "  - CORS_ORIGIN (dominio de tu frontend)"
    else
        print_error "No se encontró env.example. Debes crear .env manualmente"
    fi
else
    print_info "Archivo .env ya existe"
fi

# Actualizar nginx.conf de producción
if [ -f "$APP_DIR/nginx.prod.conf" ]; then
    print_info "Actualizando Dockerfile para usar nginx.prod.conf..."
    # El Dockerfile necesita ser actualizado para usar nginx.prod.conf
    if [ -f "$APP_DIR/Dockerfile" ]; then
        # Verificar si ya está configurado
        if ! grep -q "nginx.prod.conf" "$APP_DIR/Dockerfile"; then
            print_warn "Necesitas actualizar el Dockerfile para usar nginx.prod.conf en producción"
        fi
    fi
fi

# Construir y levantar contenedores
print_info "Construyendo y levantando contenedores..."
cd $APP_DIR

# Usar docker compose (nuevo) o docker-compose (antiguo)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Detener contenedores existentes si los hay
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true

# Construir imágenes
print_info "Construyendo imágenes Docker..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# Levantar contenedores
print_info "Levantando contenedores..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
print_info "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
print_info "Verificando estado de los contenedores..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml ps

# Ejecutar migraciones de Prisma
print_info "Ejecutando migraciones de base de datos..."
$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || print_warn "Las migraciones pueden haberse ejecutado automáticamente"

# Verificar salud de los servicios
print_info "Verificando salud de los servicios..."
sleep 5

# Verificar backend
if curl -f http://localhost:3001/health &> /dev/null; then
    print_info "✅ Backend está funcionando correctamente"
else
    print_warn "⚠️  Backend no responde. Revisa los logs: docker logs sgst_backend_prod"
fi

# Verificar frontend
if curl -f http://localhost &> /dev/null; then
    print_info "✅ Frontend está funcionando correctamente"
else
    print_warn "⚠️  Frontend no responde. Revisa los logs: docker logs sgst_frontend_prod"
fi

# Mostrar información útil
echo ""
echo "=========================================="
echo "  Despliegue completado"
echo "=========================================="
echo ""
print_info "La aplicación está disponible en:"
echo "  - Frontend: http://$(curl -s ifconfig.me || hostname -I | awk '{print $1}')"
echo "  - Backend API: http://$(curl -s ifconfig.me || hostname -I | awk '{print $1}'):3001"
echo ""
print_info "Comandos útiles:"
echo "  - Ver logs: $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  - Detener: $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down"
echo "  - Reiniciar: $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml restart"
echo "  - Ver estado: $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml ps"
echo ""
print_warn "IMPORTANTE:"
echo "  1. Configura el firewall de Google Cloud para permitir tráfico en puertos 80 y 3001"
echo "  2. Si tienes un dominio, configura DNS y SSL (Let's Encrypt)"
echo "  3. Revisa el archivo .env y asegúrate de que todas las variables estén configuradas"
echo "  4. Revisa los logs si algo no funciona: docker logs <nombre_contenedor>"
echo ""

