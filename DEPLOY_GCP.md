# Guía de Despliegue en Google Cloud Platform (GCP)

Esta guía te ayudará a desplegar SiGeST en una VM de Ubuntu en Google Cloud.

## 📋 Requisitos Previos

1. Cuenta de Google Cloud Platform activa
2. Proyecto creado en GCP
3. Acceso a la consola de GCP o gcloud CLI instalado
4. Repositorio Git con tu código (o archivos listos para copiar)

---

## 🚀 Paso 1: Crear la VM en Google Cloud

### Opción A: Desde la Consola Web

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Navega a **Compute Engine** > **VM instances**
4. Haz clic en **Create Instance**
5. Configura la instancia:
   - **Name**: `sigest-vm` (o el nombre que prefieras)
   - **Region**: Elige la región más cercana a tus usuarios
   - **Zone**: Cualquier zona de la región seleccionada
   - **Machine type**: 
     - Mínimo: `e2-medium` (2 vCPU, 4 GB RAM) para desarrollo/pruebas
     - Recomendado: `e2-standard-2` (2 vCPU, 8 GB RAM) o superior para producción
   - **Boot disk**: 
     - **OS**: Ubuntu
     - **Version**: Ubuntu 22.04 LTS (recomendado)
     - **Size**: Mínimo 20 GB (recomendado 30-50 GB)
   - **Firewall**: 
     - ✅ Allow HTTP traffic
     - ✅ Allow HTTPS traffic
6. Haz clic en **Create**

### Opción B: Desde la CLI (gcloud)

```bash
# Configurar proyecto
gcloud config set project TU_PROJECT_ID

# Crear VM
gcloud compute instances create sigest-vm \
  --zone=us-central1-a \
  --machine-type=e2-standard-2 \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server
```

---

## 🔥 Paso 2: Configurar Firewall

Necesitas abrir los puertos 80 (HTTP) y 3001 (Backend API opcional, si quieres acceso directo).

### Opción A: Desde la Consola Web

1. Ve a **VPC network** > **Firewall**
2. Haz clic en **Create Firewall Rule**
3. Configura:
   - **Name**: `sigest-http-https`
   - **Direction**: Ingress
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0` (o restringe a IPs específicas)
   - **Protocols and ports**: 
     - ✅ TCP: `80, 443, 3001`
4. Haz clic en **Create**

### Opción B: Desde la CLI

```bash
# Permitir HTTP (puerto 80)
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP traffic"

# Permitir HTTPS (puerto 443) - para SSL más adelante
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTPS traffic"

# Permitir Backend API (puerto 3001) - opcional, solo si necesitas acceso directo
gcloud compute firewall-rules create allow-backend-api \
  --allow tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow Backend API direct access"
```

---

## 🔐 Paso 3: Conectarte a la VM

### Opción A: SSH desde la Consola Web

1. Ve a **Compute Engine** > **VM instances**
2. Encuentra tu instancia
3. Haz clic en **SSH** (se abrirá una ventana de terminal en el navegador)

### Opción B: SSH desde tu máquina local

```bash
# Obtener IP externa de la VM
gcloud compute instances describe sigest-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Conectarse por SSH
gcloud compute ssh sigest-vm --zone=us-central1-a

# O usando SSH tradicional (si tienes la clave configurada)
ssh usuario@IP_EXTERNA
```

---

## 📦 Paso 4: Preparar el Código en la VM

Tienes dos opciones:

### Opción A: Clonar desde Git (Recomendado)

```bash
# Instalar Git si no está instalado
sudo apt-get update
sudo apt-get install -y git

# Clonar tu repositorio
cd /opt
sudo git clone TU_REPOSITORIO_GIT sigest
cd sigest

# Si es privado, necesitarás configurar autenticación:
# - SSH keys, o
# - Personal Access Token
```

### Opción B: Copiar archivos manualmente

```bash
# Crear directorio
sudo mkdir -p /opt/sigest
sudo chown $USER:$USER /opt/sigest

# Desde tu máquina local, usar SCP:
scp -r /ruta/local/sigest/* usuario@IP_EXTERNA:/opt/sigest/
```

---

## ⚙️ Paso 5: Configurar Variables de Entorno

```bash
cd /opt/sigest

# Copiar archivo de ejemplo
cp env.example .env

# Editar el archivo .env
sudo nano .env
```

**Configura estas variables importantes:**

```env
# Base de datos
POSTGRES_DB=sgst_db
POSTGRES_USER=sgst_user
POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI  # ⚠️ Cambia esto

# Backend
JWT_SECRET=TU_JWT_SECRET_MUY_SEGURO_AQUI  # ⚠️ Genera una clave segura
REFRESH_SECRET=TU_REFRESH_SECRET_MUY_SEGURO_AQUI  # ⚠️ Genera otra clave segura
CORS_ORIGIN=http://TU_IP_O_DOMINIO  # Ejemplo: http://34.123.45.67

# Frontend
VITE_API_URL=http://TU_IP_O_DOMINIO/api  # Ejemplo: http://34.123.45.67/api

# Email (opcional pero recomendado)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=SGST Sistema
```

**Generar contraseñas seguras:**

```bash
# Generar contraseña segura para PostgreSQL
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -base64 64

# Generar REFRESH_SECRET
openssl rand -base64 64
```

---

## 🚀 Paso 6: Ejecutar el Script de Despliegue

```bash
cd /opt/sigest

# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar el script (requiere sudo)
sudo bash deploy.sh
```

El script hará:
- ✅ Actualizar el sistema
- ✅ Instalar Docker y Docker Compose
- ✅ Construir las imágenes Docker
- ✅ Levantar los contenedores
- ✅ Ejecutar migraciones de base de datos
- ✅ Verificar que todo funcione

---

## ✅ Paso 7: Verificar el Despliegue

```bash
# Ver estado de los contenedores
cd /opt/sigest
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Ver logs del backend
docker logs sgst_backend_prod

# Ver logs del frontend
docker logs sgst_frontend_prod

# Ver logs de la base de datos
docker logs sgst_postgres_prod

# Ver todos los logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

**Probar desde tu navegador:**
- Frontend: `http://TU_IP_EXTERNA`
- Backend Health: `http://TU_IP_EXTERNA:3001/health`

---

## 🔄 Paso 8: Actualizar la Aplicación (Futuro)

Cuando necesites actualizar el código:

```bash
cd /opt/sigest

# Si usas Git:
git pull

# Reconstruir y reiniciar
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🌐 Paso 9: Configurar Dominio y SSL (Opcional pero Recomendado)

Si tienes un dominio, puedes configurar SSL con Let's Encrypt:

### 1. Configurar DNS

En tu proveedor de DNS, agrega un registro A apuntando a la IP externa de tu VM:
```
A    @    34.123.45.67    (tu IP externa)
A    www  34.123.45.67    (opcional)
```

### 2. Instalar Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### 3. Configurar Nginx para SSL

Necesitarás modificar la configuración de nginx para usar el dominio. Puedes crear un archivo de configuración adicional o modificar `nginx.prod.conf`.

### 4. Obtener certificado SSL

```bash
# Si tienes nginx corriendo en el host (no en Docker)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Si usas Docker, necesitarás configurar nginx en el host como reverse proxy
```

**Nota:** Configurar SSL con Docker requiere una configuración más avanzada. Puedes usar Traefik o configurar nginx en el host como reverse proxy.

---

## 🛠️ Comandos Útiles

```bash
# Ver estado de contenedores
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Reiniciar un servicio específico
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Detener todo
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Iniciar todo
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Acceder a la base de datos
docker exec -it sgst_postgres_prod psql -U sgst_user -d sgst_db

# Ejecutar migraciones manualmente
docker exec -it sgst_backend_prod npx prisma migrate deploy

# Ver uso de recursos
docker stats
```

---

## 🔍 Solución de Problemas

### El backend no inicia

```bash
# Ver logs
docker logs sgst_backend_prod

# Verificar variables de entorno
docker exec sgst_backend_prod env | grep -E "DATABASE_URL|JWT_SECRET"

# Verificar conexión a la base de datos
docker exec sgst_backend_prod npx prisma db pull
```

### El frontend no carga

```bash
# Ver logs
docker logs sgst_frontend_prod

# Verificar que nginx esté corriendo
docker exec sgst_frontend_prod nginx -t

# Verificar configuración de nginx
docker exec sgst_frontend_prod cat /etc/nginx/conf.d/default.conf
```

### La base de datos no conecta

```bash
# Ver logs
docker logs sgst_postgres_prod

# Verificar que el contenedor esté corriendo
docker ps | grep postgres

# Probar conexión
docker exec -it sgst_postgres_prod psql -U sgst_user -d sgst_db
```

### Problemas de permisos

```bash
# Verificar permisos del directorio uploads
ls -la /opt/sigest/backend/uploads

# Corregir permisos si es necesario
sudo chown -R 1000:1000 /opt/sigest/backend/uploads
```

---

## 📝 Notas Importantes

1. **Seguridad:**
   - ⚠️ Cambia todas las contraseñas por defecto
   - ⚠️ No expongas el puerto 3001 públicamente si no es necesario
   - ⚠️ Configura SSL/HTTPS para producción
   - ⚠️ Usa firewall rules restrictivas

2. **Backups:**
   - Configura backups regulares de la base de datos
   - Considera usar Google Cloud SQL en lugar de PostgreSQL en Docker para producción

3. **Monitoreo:**
   - Configura alertas en Google Cloud
   - Considera usar herramientas de monitoreo como Prometheus/Grafana

4. **Escalabilidad:**
   - Para producción con mucho tráfico, considera usar:
     - Google Cloud SQL para la base de datos
     - Google Cloud Load Balancer
     - Múltiples instancias de la aplicación

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker logs <nombre_contenedor>`
2. Verifica las variables de entorno en `.env`
3. Asegúrate de que los puertos estén abiertos en el firewall
4. Verifica que Docker esté corriendo: `sudo systemctl status docker`

---

¡Listo! Tu aplicación debería estar funcionando en `http://TU_IP_EXTERNA` 🎉

