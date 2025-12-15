# Comandos SSH para Actualizar y Ejecutar Seed de Prueba

## 🔍 Buscar el proyecto en lugares comunes

Ejecuta estos comandos para encontrar dónde está el proyecto:

```bash
# Buscar en todo el sistema (puede tardar un poco)
find / -name "SiGeST" -type d 2>/dev/null | head -10

# Buscar en lugares comunes
find /opt /var/www /home /root -name "SiGeST" -type d 2>/dev/null

# Buscar archivos característicos del proyecto
find / -name "package.json" -path "*/SiGeST/*" 2>/dev/null | head -5
find / -name "prisma" -type d -path "*/SiGeST/*" 2>/dev/null | head -5
```

## 📋 Si el proyecto está en Docker

Si el proyecto corre en Docker, puede estar en un contenedor:

```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores
docker ps -a

# Si hay un contenedor, entrar a él
docker exec -it [nombre-contenedor] bash

# Dentro del contenedor, buscar el proyecto
find / -name "SiGeST" -type d 2>/dev/null
```

## 🚀 Si necesitas clonar el proyecto

Si no encuentras el proyecto, puede que necesites clonarlo:

```bash
# Ir a un directorio apropiado
cd /home/tabare_casalas

# Clonar el repositorio (ajusta la URL)
git clone [URL_DEL_REPOSITORIO] SiGeST

# O si ya tienes el repositorio configurado
git clone git@github.com:[usuario]/SiGeST.git
# o
git clone https://github.com/[usuario]/SiGeST.git
```

## 📋 Comandos una vez encontrado el proyecto

Una vez que encuentres la ruta, ejecuta:

```bash
# Reemplaza [RUTA] con la ruta encontrada
cd [RUTA]/SiGeST && git fetch origin && git pull origin main && cd backend && npm install && npm run seed:prueba
```

## 🔧 Verificar dónde corre la aplicación

Si la aplicación ya está corriendo, puedes encontrar dónde está:

```bash
# Ver procesos de Node
ps aux | grep node

# Ver procesos relacionados con SiGeST
ps aux | grep -i sigest

# Ver puertos en uso
netstat -tulpn | grep -E '3000|5000|8000'
# o
ss -tulpn | grep -E '3000|5000|8000'
```

## 📁 Lugares comunes donde puede estar

```bash
# Verificar estos directorios comunes
ls -la /opt/
ls -la /var/www/
ls -la /home/
ls -la /root/
ls -la /srv/
```
