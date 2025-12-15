# Script maestro para sincronizar base de datos local a producción (PowerShell)
# Uso: .\scripts\sync-database-to-production.ps1 [IP_VM] [USUARIO_SSH]

param(
    [string]$VM_IP = "34.95.166.160",
    [string]$SSH_USER = "root"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Sincronizar BD Local -> Producción" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

$VM_PATH = "/opt/sigest"

Write-Host "[INFO] IP de la VM: $VM_IP" -ForegroundColor Green
Write-Host "[INFO] Usuario SSH: $SSH_USER" -ForegroundColor Green
Write-Host ""

# Paso 1: Exportar base de datos local
Write-Host "[PASO 1/3] Exportando base de datos local..." -ForegroundColor Green
if (Test-Path ".\scripts\export-database.ps1") {
    & ".\scripts\export-database.ps1"
} else {
    Write-Host "[ERROR] No se encontró el script export-database.ps1" -ForegroundColor Red
    exit 1
}

# Obtener el archivo más reciente
$latestExport = Get-ChildItem -Path "database_exports" -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $latestExport) {
    Write-Host "[ERROR] No se encontró ningún archivo de exportación" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[INFO] Archivo a copiar: $($latestExport.FullName)" -ForegroundColor Green
Write-Host ""

# Paso 2: Copiar a la VM
Write-Host "[PASO 2/3] Copiando archivo a la VM..." -ForegroundColor Green
Write-Host "[INFO] Se solicitará la contraseña SSH si es necesario" -ForegroundColor Yellow
Write-Host ""

$remotePath = "${SSH_USER}@${VM_IP}:${VM_PATH}/database_import.sql"

# Usar scp (requiere tener scp instalado, o usar pscp de PuTTY)
if (Get-Command scp -ErrorAction SilentlyContinue) {
    scp $latestExport.FullName $remotePath
} elseif (Get-Command pscp -ErrorAction SilentlyContinue) {
    pscp $latestExport.FullName $remotePath
} else {
    Write-Host "[ERROR] No se encontró scp ni pscp. Por favor copia el archivo manualmente:" -ForegroundColor Red
    Write-Host "  scp $($latestExport.FullName) $remotePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Luego ejecuta en la VM:" -ForegroundColor Yellow
    Write-Host "  cd /opt/sigest" -ForegroundColor Yellow
    Write-Host "  bash scripts/import-database.sh database_import.sql" -ForegroundColor Yellow
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Archivo copiado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al copiar el archivo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Puedes copiarlo manualmente con:" -ForegroundColor Yellow
    Write-Host "  scp $($latestExport.FullName) $remotePath" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 3: Importar en producción
Write-Host "[PASO 3/3] Importando base de datos en producción..." -ForegroundColor Green
Write-Host "[ADVERTENCIA] Esto eliminará todos los datos actuales en producción" -ForegroundColor Yellow
Write-Host ""

$confirmacion = Read-Host "¿Estás seguro de continuar? (escribe 'SI' para confirmar)"

if ($confirmacion -ne "SI") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

# Ejecutar script de importación en la VM
$sshCommand = "cd $VM_PATH && bash scripts/import-database.sh database_import.sql"

if (Get-Command ssh -ErrorAction SilentlyContinue) {
    ssh "${SSH_USER}@${VM_IP}" $sshCommand
} elseif (Get-Command plink -ErrorAction SilentlyContinue) {
    plink -ssh "${SSH_USER}@${VM_IP}" $sshCommand
} else {
    Write-Host "[ERROR] No se encontró ssh ni plink. Por favor ejecuta manualmente:" -ForegroundColor Red
    Write-Host "  ssh ${SSH_USER}@${VM_IP}" -ForegroundColor Yellow
    Write-Host "  $sshCommand" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Sincronización completada!" -ForegroundColor Green
Write-Host ""
Write-Host "La base de datos de producción ahora tiene los mismos datos que desarrollo." -ForegroundColor Green


