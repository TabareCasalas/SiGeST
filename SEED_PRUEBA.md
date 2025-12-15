# Script de Seed de Datos de Prueba

Este script crea un conjunto completo de datos de prueba en la base de datos, incluyendo usuarios, grupos, trámites, hojas de ruta y fichas.

## 📋 Contenido del Seed

El script realiza las siguientes operaciones:

1. **Limpia completamente la base de datos** (elimina todos los datos existentes)
2. **Crea usuarios de prueba** según el archivo `USUARIOS_PRUEBA.md`:
   - 2 Administrativos
   - 3 Docentes
   - 1 Docente/Administrativa (Valeria Porta)
   - 6 Estudiantes
   - 3 Consultantes
3. **Crea 2 grupos**:
   - **Grupo 1 (Prof. Salazar)**:
     - Responsable: Fernando SALAZAR GETINI
     - Asistente: Roberto MARTINEZ GARCIA
     - Estudiantes: María SANTOS PEREZ, Juan TORRES GARCIA, Lucía RAMIREZ CASTRO
   - **Grupo 2 (Prof. Amado)**:
     - Responsable: Adriana AMADO RODRIGUEZ
     - Asistente: Valeria Sabrina PORTA BORBA
     - Estudiantes: Diego MORALES VEGA, Sofía HERRERA MENDEZ, Andrés JIMENEZ RUIZ
4. **Crea trámites activos**:
   - 3 trámites para Grupo 1
   - 3 trámites para Grupo 2
   - Cada trámite tiene estado "en_tramite"
5. **Crea hojas de ruta**:
   - 6-8 actuaciones por trámite
   - Cada actuación es registrada por un solo estudiante (distribuidas rotando entre los estudiantes del grupo)
   - Ejemplos de actuaciones: "El consultante presentó partida de nacimiento", "Se revisó la documentación presentada", etc.
6. **Crea fichas**:
   - 4 fichas en estado "standby" (listas para asignar a grupos)
   - 2 fichas asignadas al docente del Grupo 1
   - 2 fichas asignadas al docente del Grupo 2

## 🚀 Ejecución

### Desde SSH en la VM de Google Cloud

1. Conectarse a la VM mediante SSH:
   ```bash
   gcloud compute ssh [NOMBRE_INSTANCIA] --zone=[ZONA]
   ```

2. Navegar al directorio del proyecto:
   ```bash
   cd /ruta/al/proyecto/SiGeST
   ```

3. Ejecutar el script:
   ```bash
   ./scripts/seed-prueba-ssh.sh
   ```

   O directamente con npm:
   ```bash
   cd backend
   npm run seed:prueba
   ```

### Desde el entorno local (desarrollo)

```bash
cd backend
npm run seed:prueba
```

## ⚠️ Advertencias

- **Este script elimina TODOS los datos existentes** en la base de datos antes de crear los datos de prueba.
- Asegúrate de tener una copia de seguridad si necesitas conservar datos existentes.
- El script está diseñado para ejecutarse en un entorno de desarrollo o pruebas.

## 🔐 Credenciales de Prueba

Todos los usuarios tienen como contraseña su CI (cédula de identidad).

**Ejemplos:**
- Usuario: `50000000` → Password: `50000000`
- Usuario: `18449999` → Password: `18449999`
- Usuario: `43092878` → Password: `43092878`

Ver el archivo `USUARIOS_PRUEBA.md` para la lista completa de usuarios y sus credenciales.

## 📊 Datos Creados

Después de ejecutar el script, tendrás:

- **15 usuarios** (2 administrativos, 4 docentes, 6 estudiantes, 3 consultantes)
- **2 grupos** con 5 miembros cada uno
- **6 trámites** activos (3 por grupo)
- **~42-48 hojas de ruta** (6-8 por trámite)
- **4 fichas** en estado standby

## 🔧 Solución de Problemas

### Error: "No se encontró package.json"
- Asegúrate de estar en el directorio correcto del proyecto
- Verifica que el archivo `backend/package.json` existe

### Error: "No se encontró el script seed-completo-prueba.ts"
- Verifica que el archivo existe en `backend/scripts/seed-completo-prueba.ts`
- Si no existe, verifica que se haya creado correctamente

### Error: "node_modules no encontrado"
- El script intentará instalar las dependencias automáticamente
- Si falla, ejecuta manualmente: `cd backend && npm install`

### Error de conexión a la base de datos
- Verifica que la variable de entorno `DATABASE_URL` esté configurada correctamente
- Verifica que la base de datos esté accesible desde la VM

## 📝 Notas

- El script genera CIs válidas con dígito verificador para usuarios de prueba
- Los números de carpeta siguen el formato `T001/25` (T + número secuencial + año)
- Los números de consulta siguen el formato `F001/25` (F + número secuencial + año)
- Las fechas de las actuaciones se distribuyen en el pasado para simular un flujo real
- Las fichas tienen fechas de cita futuras

