# Comandos SSH para Actualizar y Ejecutar Seed de Prueba

## 🔍 Paso 1: Encontrar el directorio del proyecto

Si no sabes dónde está el proyecto, ejecuta:

```bash
# Buscar el directorio SiGeST
find /home -name "SiGeST" -type d 2>/dev/null

# O buscar desde la raíz (puede tardar más)
find / -name "SiGeST" -type d 2>/dev/null | head -5
```

## 📋 Comandos una vez encontrado el directorio

### Si el proyecto está en `/home/tabare_casalas/SiGeST`:

```bash
cd /home/tabare_casalas/SiGeST && git fetch origin && git pull origin main && cd backend && npm install && npm run seed:prueba
```

### Si el proyecto está en otro lugar:

```bash
# Reemplaza [RUTA] con la ruta encontrada
cd [RUTA]/SiGeST && git fetch origin && git pull origin main && cd backend && npm install && npm run seed:prueba
```

## 🚀 Comandos paso a paso (más seguro)

```bash
# 1. Ir al directorio del proyecto
cd /home/tabare_casalas/SiGeST
# (o la ruta que encuentres)

# 2. Verificar que estás en el lugar correcto
ls -la
# Deberías ver: backend/, frontend/, package.json, etc.

# 3. Actualizar desde Git
git fetch origin
git pull origin main

# 4. Ir al backend
cd backend

# 5. Instalar dependencias
npm install

# 6. Ejecutar el seed
npm run seed:prueba
```

## 🔧 Si el proyecto no existe o necesitas clonarlo

Si no encuentras el proyecto, puede que necesites clonarlo:

```bash
cd /home/tabare_casalas
git clone [URL_DEL_REPOSITORIO] SiGeST
cd SiGeST/backend
npm install
npm run seed:prueba
```

## ⚠️ Verificar la rama correcta

Antes de hacer pull, verifica qué rama estás usando:

```bash
cd /home/tabare_casalas/SiGeST
git branch
# Si muestra otra rama (no main), ajusta el comando:
git pull origin [nombre-de-la-rama]
```
