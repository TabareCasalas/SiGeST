# Relevamiento Completo de Notificaciones en SiGeST

Este documento detalla todas las situaciones en las que se envían notificaciones automáticas en el sistema.

## 📋 Índice
1. [Fichas](#fichas)
2. [Trámites](#trámites)
3. [Hoja de Ruta](#hoja-de-ruta)
4. [Solicitudes de Reactivación](#solicitudes-de-reactivación)

---

## 📄 Fichas

### 1. Creación de Ficha
**Ubicación:** `backend/src/controllers/fichaController.ts` - Función `create()`

**Situación:** Cuando un administrativo crea una nueva ficha de consulta.

**Notificaciones enviadas:**
- **Para el docente asignado:**
  - Título: "Nueva ficha asignada"
  - Mensaje: "Se te ha asignado una nueva ficha de consulta: [número]. Consultante: [nombre]. Tema: [tema]"
  - Tipo: `info`
  - Entidad: `ficha`
  - Emisor: Administrativo que creó la ficha

- **Para el consultante:**
  - Título: "Ficha de consulta creada"
  - Mensaje: "Se ha creado tu ficha de consulta: [número]. [Estado pendiente o fecha de cita]"
  - Tipo: `warning` (si está pendiente) o `success` (si está aprobada)
  - Entidad: `ficha`
  - Emisor: Administrativo que creó la ficha

---

### 2. Asignación de Ficha a Grupo
**Ubicación:** `backend/src/controllers/fichaController.ts` - Función `asignarAGrupo()`

**Situación:** Cuando un docente o administrativo asigna una ficha en estado "standby" a un grupo.

**Notificaciones enviadas:**
- **Para todos los miembros del grupo:**
  - Título: "Nueva ficha asignada a tu grupo"
  - Mensaje: "Se ha asignado la ficha de consulta [número] a tu grupo '[nombre del grupo]'. Consultante: [nombre]. Tema: [tema]. [Fecha de cita si existe]"
  - Tipo: `info`
  - Entidad: `ficha`
  - Emisor: Docente o administrativo que asignó la ficha
  - Método: `crearParaGrupo()` - Crea notificaciones para todos los miembros del grupo

---

### 3. Inicio de Trámite desde Ficha
**Ubicación:** `backend/src/controllers/fichaController.ts` - Función `iniciarTramite()`

**Situación:** Cuando un estudiante del grupo inicia un trámite desde una ficha asignada.

**Notificaciones enviadas:**
- **Para el consultante:**
  - Título: "Trámite iniciado desde tu ficha"
  - Mensaje: "Se ha iniciado un trámite desde tu ficha de consulta [número]. Número de carpeta: [número]. Grupo responsable: [nombre del grupo]. El trámite está ahora en proceso."
  - Tipo: `success`
  - Entidad: `tramite`
  - Emisor: Estudiante que inició el trámite

---

## 📋 Trámites

### 4. Cambio de Estado de Trámite
**Ubicación:** `backend/src/controllers/tramiteController.ts` - Función `update()`

**Situación:** Cuando se actualiza el estado de un trámite (por ejemplo: de "en_proceso" a "finalizado", "desistido", etc.).

**Notificaciones enviadas:**
- **Para todos los miembros del grupo (excepto quien hizo el cambio):**
  - Título: "Estado del trámite actualizado"
  - Mensaje: "[Nombre del usuario] ha cambiado el estado del trámite [número de carpeta] de '[estado anterior]' a '[estado nuevo]'. [Motivo si existe]"
  - Tipo: `success` (si finalizado), `warning` (si desistido), `info` (otros casos)
  - Entidad: `tramite`
  - Emisor: Usuario que cambió el estado
  - Método: `crearMultiple()` - Crea notificaciones para múltiples usuarios

- **Para el consultante (si no es quien hizo el cambio):**
  - Título: "Estado de tu trámite actualizado"
  - Mensaje: "El estado de tu trámite [número de carpeta] ha cambiado de '[estado anterior]' a '[estado nuevo]'. [Motivo si existe]"
  - Tipo: `success` (si finalizado), `warning` (si desistido), `info` (otros casos)
  - Entidad: `tramite`
  - Emisor: Usuario que cambió el estado

---

## 📝 Hoja de Ruta

### 5. Creación de Actuación en Hoja de Ruta
**Ubicación:** `backend/src/controllers/hojaRutaController.ts` - Función `create()`

**Situación:** Cuando un estudiante del grupo agrega una nueva actuación a la hoja de ruta de un trámite.

**Notificaciones enviadas:**
- **Para todos los miembros del grupo:**
  - Título: "Nueva actualización en hoja de ruta"
  - Mensaje: "[Nombre del estudiante] ha agregado una nueva actuación en la hoja de ruta del trámite [número de carpeta]. Descripción: [descripción corta]"
  - Tipo: `info`
  - Entidad: `tramite`
  - Emisor: Estudiante que creó la actuación
  - Método: `crearParaGrupo()` - Crea notificaciones para todos los miembros del grupo

---

## 🔄 Solicitudes de Reactivación

### 6. Solicitud de Reactivación Creada
**Ubicación:** `backend/src/controllers/solicitudReactivacionController.ts` - Función `create()`

**Situación:** Cuando un usuario desactivado solicita la reactivación de su cuenta.

**Notificaciones enviadas:**
- **Para todos los administrativos (nivel_acceso = 1):**
  - Título: "Nueva solicitud de reactivación"
  - Mensaje: "El usuario [nombre] (CI: [ci]) ha solicitado la reactivación de su cuenta. [Motivo si existe]"
  - Tipo: `warning`
  - Entidad: `solicitud_reactivacion`
  - Emisor: No especificado (solicitud del usuario)
  - Método: `crear()` - Se crea una notificación para cada administrativo

---

### 7. Solicitud de Reactivación Aprobada
**Ubicación:** `backend/src/controllers/solicitudReactivacionController.ts` - Función `aprobar()`

**Situación:** Cuando un administrativo aprueba una solicitud de reactivación.

**Notificaciones enviadas:**
- **Para el usuario que solicitó la reactivación:**
  - Título: "Solicitud de reactivación aprobada"
  - Mensaje: "Su solicitud de reactivación ha sido aprobada. Su cuenta ha sido reactivada y ya puede iniciar sesión. [Observación si existe]"
  - Tipo: `success`
  - Entidad: `solicitud_reactivacion`
  - Emisor: Administrativo que aprobó la solicitud

---

### 8. Solicitud de Reactivación Rechazada
**Ubicación:** `backend/src/controllers/solicitudReactivacionController.ts` - Función `rechazar()`

**Situación:** Cuando un administrativo rechaza una solicitud de reactivación.

**Notificaciones enviadas:**
- **Para el usuario que solicitó la reactivación:**
  - Título: "Solicitud de reactivación rechazada"
  - Mensaje: "Su solicitud de reactivación ha sido rechazada. [Motivo si existe]"
  - Tipo: `error`
  - Entidad: `solicitud_reactivacion`
  - Emisor: Administrativo que rechazó la solicitud

---

## 📊 Resumen por Tipo de Entidad

### Fichas (tipo_entidad: 'ficha')
1. Creación de ficha → Docente y Consultante
2. Asignación a grupo → Todos los miembros del grupo
3. Inicio de trámite desde ficha → Consultante

### Trámites (tipo_entidad: 'tramite')
1. Cambio de estado → Miembros del grupo y Consultante
2. Nueva actuación en hoja de ruta → Todos los miembros del grupo

### Solicitudes de Reactivación (tipo_entidad: 'solicitud_reactivacion')
1. Solicitud creada → Todos los administrativos
2. Solicitud aprobada → Usuario solicitante
3. Solicitud rechazada → Usuario solicitante

---

## 🔧 Métodos del Servicio de Notificaciones

El servicio `NotificacionService` (`backend/src/utils/notificacionService.ts`) proporciona tres métodos:

1. **`crear(params)`**: Crea una notificación individual para un usuario
2. **`crearMultiple(id_usuarios, params)`**: Crea notificaciones para múltiples usuarios
3. **`crearParaGrupo(id_grupo, params)`**: Crea notificaciones para todos los miembros de un grupo

---

## ⚠️ Notas Importantes

- Todas las notificaciones se crean dentro de bloques `try-catch` para que los errores en la creación de notificaciones no afecten la operación principal.
- Los errores de notificación se registran en la consola pero no interrumpen el flujo de la aplicación.
- Las notificaciones incluyen información contextual como IDs de entidades y trámites para permitir navegación directa desde la notificación.

---

## 📝 Notificaciones Manuales

Además de las notificaciones automáticas, existe un endpoint para crear notificaciones manualmente:

**Endpoint:** `POST /api/notificaciones`
**Ubicación:** `backend/src/controllers/notificacionController.ts` - Función `create()`

Este endpoint permite a los usuarios crear notificaciones personalizadas para otros usuarios, pero requiere autenticación y validación de permisos.






