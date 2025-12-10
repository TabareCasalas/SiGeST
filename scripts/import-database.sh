#!/bin/bash

# Script para importar base de datos en producción
# Uso: ./scripts/import-database.sh [archivo.sql]
# Si no se especifica archivo, usa database_exports/latest.sql

set -e

echo "=========================================="
echo "  Importar Base de Datos en Producción"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que se está ejecutando en la VM de producción
if [ ! -f "/opt/sigest/.env" ]; then
    echo -e "${RED}[ERROR]${NC} Este script debe ejecutarse en la VM de producción"
    echo -e "${RED}[ERROR]${NC} Asegúrate de estar en /opt/sigest"
    exit 1
fi

# Archivo SQL a importar
if [ -z "$1" ]; then
    SQL_FILE="database_exports/latest.sql"
else
    SQL_FILE="$1"
fi

# Verificar que el archivo existe
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}[ERROR]${NC} El archivo $SQL_FILE no existe"
    echo ""
    echo "Uso: $0 [archivo.sql]"
    echo "O copia el archivo SQL a la VM primero:"
    echo "  scp database_exports/latest.sql usuario@IP_VM:/opt/sigest/"
    exit 1
fi

echo -e "${YELLOW}[ADVERTENCIA]${NC} Este script va a:"
echo "  1. ELIMINAR todos los datos actuales de la base de datos"
echo "  2. Importar los datos del archivo: $SQL_FILE"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo -e "${GREEN}[INFO]${NC} Verificando contenedor de PostgreSQL..."
if ! docker ps | grep -q "sgst_postgres_prod"; then
    echo -e "${RED}[ERROR]${NC} El contenedor de PostgreSQL no está corriendo"
    echo -e "${GREEN}[INFO]${NC} Iniciando contenedores..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres
    sleep 10
fi

# Obtener configuración del .env
cd /opt/sigest
source .env 2>/dev/null || true

DB_NAME="${POSTGRES_DB:-sgst_db}"
DB_USER="${POSTGRES_USER:-sgst_user}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}[ERROR]${NC} POSTGRES_PASSWORD no está configurado en .env"
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} Base de datos: $DB_NAME"
echo -e "${GREEN}[INFO]${NC} Usuario: $DB_USER"
echo ""

# Verificar conexión a la base de datos
echo -e "${GREEN}[INFO]${NC} Verificando conexión a la base de datos..."
if ! docker exec sgst_postgres_prod psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} No se pudo conectar a la base de datos"
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} Conexión exitosa"
echo ""

# Hacer backup de la base de datos actual
BACKUP_FILE="database_backup_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${GREEN}[INFO]${NC} Creando backup de la base de datos actual..."
PGPASSWORD=$DB_PASSWORD docker exec sgst_postgres_prod \
  pg_dump -U $DB_USER -d $DB_NAME \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --format=plain \
  > "$BACKUP_FILE" 2>/dev/null || echo -e "${YELLOW}[WARN]${NC} No se pudo crear backup (puede estar vacía)"

if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}[INFO]${NC} Backup guardado en: $BACKUP_FILE"
fi
echo ""

# Importar el archivo SQL
echo -e "${GREEN}[INFO]${NC} Importando base de datos desde: $SQL_FILE"
echo -e "${YELLOW}[INFO]${NC} Esto puede tardar varios minutos..."
echo ""

# Copiar el archivo al contenedor
CONTAINER_FILE="/tmp/import.sql"
docker cp "$SQL_FILE" sgst_postgres_prod:$CONTAINER_FILE

# Importar
PGPASSWORD=$DB_PASSWORD docker exec -i sgst_postgres_prod \
  psql -U $DB_USER -d $DB_NAME < $CONTAINER_FILE

# Limpiar archivo temporal del contenedor
docker exec sgst_postgres_prod rm -f $CONTAINER_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Importación completada exitosamente!${NC}"
    echo ""
    
    # Verificar datos importados
    echo -e "${GREEN}[INFO]${NC} Verificando datos importados..."
    USUARIOS=$(docker exec sgst_postgres_prod psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"Usuario\";" | tr -d ' ')
    TRAMITES=$(docker exec sgst_postgres_prod psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"Tramite\";" | tr -d ' ')
    FICHAS=$(docker exec sgst_postgres_prod psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM \"Ficha\";" | tr -d ' ')
    
    echo "  Usuarios: $USUARIOS"
    echo "  Trámites: $TRAMITES"
    echo "  Fichas: $FICHAS"
    echo ""
    
    echo -e "${GREEN}[INFO]${NC} Reiniciando backend para aplicar cambios..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
    sleep 5
    
    echo ""
    echo -e "${GREEN}✅ Proceso completado!${NC}"
    echo ""
    echo "La base de datos de producción ahora tiene los mismos datos que desarrollo."
else
    echo ""
    echo -e "${RED}❌ Error al importar la base de datos${NC}"
    echo ""
    echo "Si necesitas restaurar el backup:"
    echo "  PGPASSWORD=$DB_PASSWORD docker exec -i sgst_postgres_prod psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
    exit 1
fi

