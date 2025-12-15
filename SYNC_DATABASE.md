# Sincronizar Base de Datos Local a Producción

Esta guía explica cómo copiar tu base de datos de desarrollo local a producción.

## 📋 Requisitos

- Base de datos local corriendo (Docker Compose)
- Acceso SSH a la VM de producción
- Contraseña SSH o clave configurada
- **Windows**: Git Bash, WSL, o PowerShell con scp/ssh instalado

## 🚀 Opción 1: Script Automático (Recomendado)

### En Windows (PowerShell)

```powershell
# Desde tu máquina local (en la raíz del proyecto)
.\scripts\sync-database-to-production.ps1 [IP_VM] [USUARIO_SSH]

# Ejemplo:
.\scripts\sync-database-to-production.ps1 34.95.166.160 root
```

### En Linux/Mac (Bash)

```bash
# Desde tu máquina local
chmod +x scripts/sync-database-to-production.sh
./scripts/sync-database-to-production.sh [IP_VM] [USUARIO_SSH]

# Ejemplo:
./scripts/sync-database-to-production.sh 34.95.166.160 root
```

Este script:
1. ✅ Exporta tu base de datos local
2. ✅ La copia a la VM de producción
3. ✅ La importa en producción (eliminando datos actuales)

## 🔧 Opción 2: Pasos Manuales

### Paso 1: Exportar Base de Datos Local

**Windows (PowerShell):**
```powershell
.\scripts\export-database.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/export-database.sh
./scripts/export-database.sh
```

Esto creará un archivo en `database_exports/database_export_YYYYMMDD_HHMMSS.sql`

### Paso 2: Copiar a la VM

```bash
# Copiar el archivo a la VM
scp database_exports/latest.sql root@34.95.166.160:/opt/sigest/
```

### Paso 3: Importar en Producción

```bash
# Conectarse a la VM
ssh root@34.95.166.160

# Ejecutar el script de importación
cd /opt/sigest
chmod +x scripts/import-database.sh
bash scripts/import-database.sh database_import.sql
```

O si ya copiaste el archivo con otro nombre:

```bash
bash scripts/import-database.sh latest.sql
```

## ⚠️ Advertencias Importantes

1. **El script de importación ELIMINA todos los datos actuales** en producción antes de importar
2. **Se crea un backup automático** antes de importar (por si necesitas restaurar)
3. **Asegúrate de tener un backup** de producción si hay datos importantes

## 📝 Detalles de los Scripts

### `export-database.ps1` / `export-database.sh`

- Exporta la base de datos local usando `pg_dump`
- Guarda el archivo en `database_exports/`
- Crea un archivo `latest.sql` con el último export

**Configuración:**
- Base de datos: `sgst_db`
- Usuario: `sgst_user`
- Contraseña: `sgst_password` (desde docker-compose.yml)
- Host: `localhost:5432`

### `import-database.sh`

- **Elimina todos los datos actuales** de la base de datos
- Importa el archivo SQL especificado
- Crea un backup antes de importar
- Reinicia el backend después de importar

**Configuración:**
- Lee las variables del archivo `.env` en producción
- Base de datos: `POSTGRES_DB` (default: `sgst_db`)
- Usuario: `POSTGRES_USER` (default: `sgst_user`)
- Contraseña: `POSTGRES_PASSWORD` (desde `.env`)

### `sync-database-to-production.ps1` / `sync-database-to-production.sh`

- Script maestro que ejecuta los 3 pasos automáticamente
- Requiere acceso SSH a la VM
- Puede solicitar contraseña SSH

## 🔍 Verificar la Importación

Después de importar, verifica los datos:

```bash
# En la VM de producción
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT COUNT(*) as total_usuarios FROM \"Usuario\";"
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT COUNT(*) as total_tramites FROM \"Tramite\";"
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT COUNT(*) as total_fichas FROM \"Ficha\";"
```

## 🔄 Restaurar Backup

Si necesitas restaurar el backup creado automáticamente:

```bash
# En la VM de producción
cd /opt/sigest
PGPASSWORD=TU_PASSWORD docker exec -i sgst_postgres_prod psql -U sgst_user -d sgst_db < database_backup_YYYYMMDD_HHMMSS.sql
```

## 🐛 Solución de Problemas

### Error: "El contenedor de PostgreSQL no está corriendo"

```bash
# En local
docker-compose up -d postgres

# En producción
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres
```

### Error: "No se pudo conectar a la base de datos"

Verifica que:
- El contenedor esté corriendo: `docker ps | grep postgres`
- Las credenciales en `.env` sean correctas
- La base de datos exista

### Error al copiar archivo (SSH)

Si tienes problemas con SSH:
1. Verifica que tengas acceso: `ssh root@34.95.166.160`
2. Usa el método manual (copiar archivo manualmente)
3. Verifica que el directorio `/opt/sigest` exista en la VM

### Windows: "scp no se reconoce"

En Windows, puedes usar:
- **Git Bash** (incluido con Git for Windows)
- **WSL** (Windows Subsystem for Linux)
- **PuTTY** (pscp.exe)
- O copiar el archivo manualmente usando WinSCP o similar

### El archivo SQL es muy grande

Si el archivo es muy grande (>100MB), considera:
- Comprimir antes de copiar: `gzip database_exports/latest.sql`
- Descomprimir en la VM: `gunzip latest.sql.gz`
- O usar `rsync` en lugar de `scp` para transferencias más eficientes

## 📊 Tamaño Típico de Exports

- Base de datos vacía: ~50 KB
- Con usuarios y grupos: ~100-500 KB
- Con trámites y fichas: ~1-10 MB
- Base de datos completa: Depende de los datos

## 🔐 Seguridad

- Los archivos SQL contienen datos sensibles
- No subas los exports a Git (están en `.gitignore`)
- Elimina los archivos después de importar si no los necesitas
- Los backups en producción también contienen datos sensibles
