# Dockerfile para Frontend React con Vite
# Multi-stage build: construir la app y servirla con nginx

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Argumento de build para la URL de la API
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL

# Copiar archivos de configuración
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/ ./

# Instalar dependencias
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Construir la aplicación
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar los archivos construidos al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
# Usar nginx.prod.conf si existe (producción), sino usar nginx.conf (desarrollo)
COPY nginx.prod.conf* /tmp/
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN if [ -f /tmp/nginx.prod.conf ]; then cp /tmp/nginx.prod.conf /etc/nginx/conf.d/default.conf; fi

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

