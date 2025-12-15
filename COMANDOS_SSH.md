# Comandos SSH para Actualizar y Ejecutar Seed de Prueba

## 🔍 Verificar si está en Docker

Si el proyecto corre en Docker, necesitas ejecutar los comandos dentro del contenedor:

```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Entrar al contenedor del backend (ajusta el nombre)
docker exec -it [nombre-contenedor-backend] bash

# Dentro del contenedor, ejecutar:
cd /app/backend  # o la ruta donde esté el backend en el contenedor
npm run seed:prueba
```

## 📦 Si no está en Docker, verificar Node.js

```bash
# Verificar si Node.js está instalado
which node
which npm

# Ver versión
node --version
npm --version

# Si no está instalado, verificar si hay nvm
nvm --version

# Si hay nvm, usar Node.js
nvm use node
# o
nvm use 18  # o la versión que necesites
```

## 🐳 Si está en Docker Compose

```bash
# Ver servicios
docker-compose ps

# Ejecutar comando en el servicio del backend
docker-compose exec backend npm run seed:prueba

# O si el servicio tiene otro nombre
docker-compose exec [nombre-servicio] npm run seed:prueba
```

## 🔧 Verificar estructura del proyecto

```bash
cd /opt/sigest
ls -la

# Ver si hay docker-compose.yml
cat docker-compose.yml

# Ver si hay Dockerfile
ls -la | grep -i docker
```
