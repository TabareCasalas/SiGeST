#!/bin/bash

# Script maestro para sincronizar base de datos local a producción
# Este script:
# 1. Exporta la BD local
# 2. La copia a la VM de producción
# 3. La importa en producción
#
# Uso: ./scripts/sync-database-to-production.sh [IP_VM] [USUARIO_SSH]

set -e

echo "=========================================="
echo "  Sincronizar BD Local -> Producción"
echo "=========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parámetros
VM_IP="${1:-34.95.166.160}"
SSH_USER="${2:-root}"
VM_PATH="/opt/sigest"

echo -e "${GREEN}[INFO]${NC} IP de la VM: $VM_IP"
echo -e "${GREEN}[INFO]${NC} Usuario SSH: $SSH_USER"
echo ""

# Paso 1: Exportar base de datos local
echo -e "${GREEN}[PASO 1/3]${NC} Exportando base de datos local..."
if [ -f "./scripts/export-database.sh" ]; then
    bash ./scripts/export-database.sh
else
    echo -e "${RED}[ERROR]${NC} No se encontró el script export-database.sh"
    exit 1
fi

# Obtener el archivo más reciente
LATEST_EXPORT=$(ls -t database_exports/*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_EXPORT" ]; then
    echo -e "${RED}[ERROR]${NC} No se encontró ningún archivo de exportación"
    exit 1
fi

echo ""
echo -e "${GREEN}[INFO]${NC} Archivo a copiar: $LATEST_EXPORT"
echo ""

# Paso 2: Copiar a la VM
echo -e "${GREEN}[PASO 2/3]${NC} Copiando archivo a la VM..."
echo -e "${YELLOW}[INFO]${NC} Se solicitará la contraseña SSH si es necesario"
echo ""

scp "$LATEST_EXPORT" "$SSH_USER@$VM_IP:$VM_PATH/database_import.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Archivo copiado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al copiar el archivo${NC}"
    echo ""
    echo "Puedes copiarlo manualmente con:"
    echo "  scp $LATEST_EXPORT $SSH_USER@$VM_IP:$VM_PATH/database_import.sql"
    exit 1
fi

echo ""

# Paso 3: Importar en producción
echo -e "${GREEN}[PASO 3/3]${NC} Importando base de datos en producción..."
echo -e "${YELLOW}[ADVERTENCIA]${NC} Esto eliminará todos los datos actuales en producción"
echo ""

ssh "$SSH_USER@$VM_IP" "cd $VM_PATH && bash -s" << 'ENDSSH'
# Script a ejecutar en la VM
if [ -f "./scripts/import-database.sh" ]; then
    bash ./scripts/import-database.sh database_import.sql
else
    echo "El script import-database.sh no existe en la VM"
    echo "Ejecuta manualmente:"
    echo "  cd /opt/sigest"
    echo "  bash scripts/import-database.sh database_import.sql"
fi
ENDSSH

echo ""
echo -e "${GREEN}✅ Sincronización completada!${NC}"
echo ""
echo "La base de datos de producción ahora tiene los mismos datos que desarrollo."


