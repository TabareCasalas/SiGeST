#!/bin/bash

# Script para ejecutar el seed de datos de prueba desde SSH en la VM de Google Cloud
# Uso: ./scripts/seed-prueba-ssh.sh

set -e  # Salir si hay algún error

echo "🌱 Iniciando seed de datos de prueba..."
echo "=========================================="
echo ""

# Navegar al directorio del backend
cd "$(dirname "$0")/../backend" || exit 1

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar que existe el script de seed
if [ ! -f "scripts/seed-completo-prueba.ts" ]; then
    echo "❌ Error: No se encontró el script seed-completo-prueba.ts"
    exit 1
fi

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no encontrado. Instalando dependencias..."
    npm install
fi

echo ""
echo "🔄 Ejecutando script de seed..."
echo ""

# Ejecutar el script de seed
npm run seed:prueba

echo ""
echo "✅ Seed completado exitosamente!"
echo ""

