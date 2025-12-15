# Script para exportar la base de datos local (PowerShell)
# Uso: .\scripts\export-database.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Exportar Base de Datos Local" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Configuración de la base de datos local
$DB_NAME = "sgst_db"
# Intentar primero con sgst_user, si no existe usar postgres
$DB_USER = "sgst_user"
$DB_PASSWORD = "sgst_password"
$DB_HOST = "localhost"
$DB_PORT = "5432"

# Nombre del archivo de exportación
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$EXPORT_FILE = "database_export_$TIMESTAMP.sql"
$EXPORT_DIR = "database_exports"

# Crear directorio de exports si no existe
if (-not (Test-Path $EXPORT_DIR)) {
    New-Item -ItemType Directory -Path $EXPORT_DIR | Out-Null
}

Write-Host "[INFO] Exportando base de datos local..." -ForegroundColor Green
Write-Host "[INFO] Base de datos: $DB_NAME" -ForegroundColor Green
Write-Host "[INFO] Host: $DB_HOST`:$DB_PORT" -ForegroundColor Green
Write-Host ""

# Verificar que el contenedor de PostgreSQL esté corriendo
$containerName = "sgst_postgres"
$containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern $containerName

if (-not $containerRunning) {
    $containerName = "sgst_postgres_dev"
    $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern $containerName
    
    if (-not $containerRunning) {
        Write-Host "[WARN] El contenedor de PostgreSQL no está corriendo." -ForegroundColor Yellow
        Write-Host "[WARN] Iniciando contenedor..." -ForegroundColor Yellow
        docker-compose up -d postgres
        Start-Sleep -Seconds 5
        $containerName = "sgst_postgres"
    }
}

Write-Host "[INFO] Usando contenedor: $containerName" -ForegroundColor Green

# Verificar qué usuario existe
Write-Host "[INFO] Verificando usuario de base de datos..." -ForegroundColor Green
$testUser = docker exec $containerName psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN] Usuario $DB_USER no existe, intentando con 'postgres'..." -ForegroundColor Yellow
    $DB_USER = "postgres"
    $DB_PASSWORD = $null  # postgres por defecto no tiene contraseña o usa la del contenedor
}

# Exportar la base de datos
Write-Host "[INFO] Ejecutando pg_dump con usuario: $DB_USER..." -ForegroundColor Green

if ($DB_PASSWORD) {
    $env:PGPASSWORD = $DB_PASSWORD
}
docker exec $containerName pg_dump -U $DB_USER -d $DB_NAME --clean --if-exists --no-owner --no-acl --format=plain | Out-File -FilePath "$EXPORT_DIR\$EXPORT_FILE" -Encoding utf8

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Exportación completada exitosamente!" -ForegroundColor Green
    Write-Host "[INFO] Archivo guardado en: $EXPORT_DIR\$EXPORT_FILE" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar tamaño del archivo
    $fileSize = (Get-Item "$EXPORT_DIR\$EXPORT_FILE").Length / 1KB
    Write-Host "[INFO] Tamaño del archivo: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
    Write-Host ""
    
    # Crear un enlace simbólico al último export (copiar en Windows)
    Copy-Item "$EXPORT_DIR\$EXPORT_FILE" "$EXPORT_DIR\latest.sql" -Force
    Write-Host "[INFO] Archivo latest.sql creado: $EXPORT_DIR\latest.sql" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para importar en producción, usa:" -ForegroundColor Cyan
    Write-Host "  scp $EXPORT_DIR\latest.sql root@34.95.166.160:/opt/sigest/" -ForegroundColor Cyan
    Write-Host "  Luego en la VM: bash scripts/import-database.sh latest.sql" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error al exportar la base de datos" -ForegroundColor Red
    exit 1
}

