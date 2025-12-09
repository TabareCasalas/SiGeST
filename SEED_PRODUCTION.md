# Scripts de Seed para Producción

Hay dos scripts disponibles para poblar la base de datos en producción:

## 🎯 Script Completo (Recomendado)

El script `seed-completo-production.ts` crea **TODOS** los datos:

- **3 Administradores** (con diferentes niveles de acceso)
- **7 Docentes** (2 responsables, 5 asistentes)
- **6 Estudiantes** (asignados a grupos)
- **3 Consultantes**
- **2 Grupos** (con sus miembros)
- **6 Trámites** (3 por grupo, con hojas de ruta)
- **30-42 Hojas de ruta** (5-7 por trámite, distribuidas entre estudiantes)
- **6 Fichas** (con diferentes estados: pendiente, asignada, iniciada)
- **Notificaciones** (para docentes y estudiantes)
- **Registros de auditoría**

## 📋 Script Básico

El script `seed-production.ts` crea solo:
- Usuarios, grupos, estudiantes, consultantes y auditorías básicas
- **NO incluye** trámites, hojas de ruta ni fichas

## 🚀 Ejecución en Producción

### Opción 1: Script Completo (Recomendado)

```bash
# Ejecutar el seed completo dentro del contenedor del backend
docker exec sgst_backend_prod npm run seed:completo
```

### Opción 2: Script Básico

```bash
# Ejecutar el seed básico dentro del contenedor del backend
docker exec sgst_backend_prod npm run seed:production
```

### Opción 3: Desde la VM (si tienes acceso directo)

```bash
cd /opt/sigest/backend

# Script completo
npm run seed:completo

# O script básico
npm run seed:production
```

## 🔐 Credenciales de Prueba

**Todas las contraseñas son: `password123`**

### Administradores

1. **Admin Sistema** (Nivel 3)
   - CI: `12345678`
   - Correo: `admin@sistema.com`

2. **Admin Docente** (Nivel 2)
   - CI: `87654321`
   - Correo: `directora@universidad.com`

3. **Admin Administrativo** (Nivel 1)
   - CI: `34567890`
   - Correo: `secretario@universidad.com`

### Docentes

1. **Dr. Roberto Fernández** (Responsable Grupo A)
   - CI: `11111111`
   - Correo: `roberto.fernandez@universidad.com`

2. **Dra. Ana Martínez** (Responsable Grupo B)
   - CI: `22222222`
   - Correo: `ana.martinez@universidad.com`

3. **Lic. Pedro García** (Asistente)
   - CI: `33333333`
   - Correo: `pedro.garcia@universidad.com`

4. **Lic. Laura Rodríguez** (Asistente)
   - CI: `44444444`
   - Correo: `laura.rodriguez@universidad.com`

5. **Lic. Diego Sánchez** (Asistente)
   - CI: `10101010`
   - Correo: `diego.sanchez@universidad.com`

6. **Lic. Sofía Pérez** (Asistente)
   - CI: `20202020`
   - Correo: `sofia.perez@universidad.com`

7. **Lic. Martín López** (Asistente)
   - CI: `30303030`
   - Correo: `martin.lopez@universidad.com`

### Estudiantes

1. **Lucía González** (Grupo A)
   - CI: `55555555`
   - Correo: `lucia.gonzalez@estudiantes.com`

2. **Mateo Silva** (Grupo A)
   - CI: `66666666`
   - Correo: `mateo.silva@estudiantes.com`

3. **Valentina Castro** (Grupo A)
   - CI: `77777777`
   - Correo: `valentina.castro@estudiantes.com`

4. **Santiago Ramírez** (Grupo B)
   - CI: `88888888`
   - Correo: `santiago.ramirez@estudiantes.com`

5. **Camila Torres** (Grupo B)
   - CI: `99999999`
   - Correo: `camila.torres@estudiantes.com`

6. **Federico Morales** (Grupo B)
   - CI: `15151515`
   - Correo: `federico.morales@estudiantes.com`

### Consultantes

1. **Andrés Méndez**
   - CI: `40404040`
   - Correo: `andres.mendez@email.com`
   - Estado Civil: Soltero
   - Nro. Padrón: 12345

2. **Patricia Vega**
   - CI: `50505050`
   - Correo: `patricia.vega@email.com`
   - Estado Civil: Casada
   - Nro. Padrón: 23456

3. **Ricardo Núñez**
   - CI: `60606060`
   - Correo: `ricardo.nunez@email.com`
   - Estado Civil: Divorciado
   - Nro. Padrón: 34567

## ⚠️ Notas Importantes

1. **El script usa `upsert`**: Si los datos ya existen (mismo CI, número de carpeta, etc.), los actualiza en lugar de crear duplicados.

2. **No elimina datos existentes**: A diferencia del seed de desarrollo, este script NO elimina datos existentes.

3. **Contraseñas**: Todas las contraseñas son `password123`. **IMPORTANTE**: Cambia las contraseñas en producción después de crear los usuarios.

4. **Grupos**: Los grupos se crean con IDs fijos (1 y 2). Si ya existen, se actualizan.

5. **Trámites**: Se crean 6 trámites (3 por grupo) con números de carpeta únicos generados aleatoriamente.

6. **Hojas de ruta**: Cada trámite tiene entre 5 y 7 hojas de ruta distribuidas entre los estudiantes del grupo.

7. **Fichas**: Se crean 6 fichas con diferentes estados:
   - 2 fichas en estado "pendiente" (sin grupo asignado)
   - 2 fichas en estado "asignada" (con grupo asignado)
   - 2 fichas en estado "iniciada" (con grupo asignado)

## 🔄 Ejecutar Scripts Adicionales

Si necesitas crear más datos (grupos con usuarios reales, trámites, etc.), puedes ejecutar los otros scripts:

```bash
# Crear grupos con usuarios reales (busca usuarios por nombre)
docker exec sgst_backend_prod ts-node scripts/create-grupos.ts

# Crear trámites y hojas de ruta
docker exec sgst_backend_prod ts-node scripts/create-tramites-y-hojas-ruta.ts

# Crear usuarios reales (con CIs reales)
docker exec sgst_backend_prod ts-node scripts/create-users.ts
```

## 📊 Verificar Datos Creados

```bash
# Ver usuarios creados
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT id_usuario, nombre, ci, correo, rol FROM \"Usuario\" ORDER BY id_usuario;"

# Ver grupos creados
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT id_grupo, nombre, activo FROM \"Grupo\";"

# Ver consultantes
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT c.id_consultante, u.nombre, u.ci, c.est_civil, c.nro_padron FROM \"Consultante\" c JOIN \"Usuario\" u ON c.id_usuario = u.id_usuario;"

# Ver trámites creados
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT id_tramite, num_carpeta, estado, id_grupo FROM \"Tramite\" ORDER BY id_tramite;"

# Ver hojas de ruta
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT COUNT(*) as total_hojas_ruta FROM \"HojaRuta\";"

# Ver fichas creadas
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT id_ficha, numero_consulta, estado, id_grupo FROM \"Ficha\" ORDER BY id_ficha;"

# Ver notificaciones
docker exec sgst_postgres_prod psql -U sgst_user -d sgst_db -c "SELECT COUNT(*) as total_notificaciones, COUNT(*) FILTER (WHERE leida = false) as no_leidas FROM \"Notificacion\";"
```

