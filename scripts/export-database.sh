#!/bin/bash

# Script para exportar la base de datos local
# Uso: ./scripts/export-database.sh

set -e

echo "=========================================="
echo "  Exportar Base de Datos Local"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración de la base de datos local (desde docker-compose.yml)
DB_NAME="sgst_db"
DB_USER="sgst_user"
DB_PASSWORD="sgst_password"
DB_HOST="localhost"
DB_PORT="5432"

# Nombre del archivo de exportación
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="database_export_${TIMESTAMP}.sql"
EXPORT_DIR="database_exports"

# Crear directorio de exports si no existe
mkdir -p "$EXPORT_DIR"

echo -e "${GREEN}[INFO]${NC} Exportando base de datos local..."
echo -e "${GREEN}[INFO]${NC} Base de datos: $DB_NAME"
echo -e "${GREEN}[INFO]${NC} Host: $DB_HOST:$DB_PORT"
echo ""

# Verificar que el contenedor de PostgreSQL esté corriendo
CONTAINER_NAME="sgst_postgres"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    # Intentar con el nombre de desarrollo
    CONTAINER_NAME="sgst_postgres_dev"
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${YELLOW}[WARN]${NC} El contenedor de PostgreSQL no está corriendo."
        echo -e "${YELLOW}[WARN]${NC} Iniciando contenedor..."
        docker-compose up -d postgres
        sleep 5
        CONTAINER_NAME="sgst_postgres"
    fi
fi

echo -e "${GREEN}[INFO]${NC} Usando contenedor: $CONTAINER_NAME"

# Exportar la base de datos
echo -e "${GREEN}[INFO]${NC} Ejecutando pg_dump..."
PGPASSWORD=$DB_PASSWORD docker exec $CONTAINER_NAME \
  pg_dump -U $DB_USER -d $DB_NAME \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --format=plain \
  > "$EXPORT_DIR/$EXPORT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Exportación completada exitosamente!${NC}"
    echo -e "${GREEN}[INFO]${NC} Archivo guardado en: $EXPORT_DIR/$EXPORT_FILE"
    echo ""
    
    # Mostrar tamaño del archivo
    FILE_SIZE=$(du -h "$EXPORT_DIR/$EXPORT_FILE" | cut -f1)
    echo -e "${GREEN}[INFO]${NC} Tamaño del archivo: $FILE_SIZE"
    echo ""
    
    # Crear un enlace simbólico al último export
    ln -sf "$EXPORT_FILE" "$EXPORT_DIR/latest.sql"
    echo -e "${GREEN}[INFO]${NC} Enlace simbólico creado: $EXPORT_DIR/latest.sql"
    echo ""
    echo "Para importar en producción, usa:"
    echo "  ./scripts/import-database.sh $EXPORT_DIR/$EXPORT_FILE"
else
    echo ""
    echo -e "${YELLOW}❌ Error al exportar la base de datos${NC}"
    exit 1
fi

