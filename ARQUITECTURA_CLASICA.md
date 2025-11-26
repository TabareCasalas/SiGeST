# 5.4 Arquitectura de la Versión Clásica

La versión clásica implementa la gestión de trámites mediante una arquitectura tradicional de tres capas, donde toda la lógica de negocio y el control del flujo de estados se encuentra centralizada en el backend. Esta arquitectura fue desarrollada con el objetivo de proporcionar una solución robusta y mantenible, priorizando la simplicidad y el control directo sobre el comportamiento del sistema.

A diferencia de la versión Camunda —que delega la orquestación del proceso a un motor BPMN— en esta versión el backend contiene toda la lógica de transiciones de estado, validaciones de negocio y coordinación entre componentes, actuando como el único punto de control del ciclo de vida del trámite.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                           │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React + Vite)                     │   │
│  │                                                                  │   │
│  │  • Componentes React (TypeScript)                                │   │
│  │  • Contextos de autenticación y notificaciones                   │   │
│  │  • Servicios API para comunicación con backend                   │   │
│  │  • Validación de formularios                                    │   │
│  │  • Interfaz de usuario reactiva                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↕ HTTP/HTTPS                               │
│                              (REST API)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE APLICACIÓN                                │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Nginx (Reverse Proxy)                        │   │
│  │                                                                  │   │
│  │  • Proxy reverso para frontend (puerto 80/443)                  │   │
│  │  • Proxy para API backend (/api → localhost:3001)               │   │
│  │  • Servicio de archivos estáticos                               │   │
│  │  • Balanceo de carga (si aplica)                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    ↕                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Backend (Node.js + Express + TypeScript)            │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              Capa de Controladores                        │   │   │
│  │  │                                                            │   │   │
│  │  │  • tramiteController    → Gestión de trámites             │   │   │
│  │  │  • fichaController      → Gestión de fichas                │   │   │
│  │  │  • usuarioController    → Gestión de usuarios             │   │   │
│  │  │  • grupoController      → Gestión de grupos                │   │   │
│  │  │  • authController       → Autenticación                    │   │   │
│  │  │  • documentoController  → Gestión documental              │   │   │
│  │  │  • reporteController    → Generación de reportes           │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                            ↕                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │            Capa de Lógica de Negocio                       │   │   │
│  │  │                                                            │   │   │
│  │  │  • Validación de transiciones de estado                    │   │   │
│  │  │  • Reglas de negocio (validaciones, permisos)             │   │   │
│  │  │  • Generación de números de carpeta                        │   │   │
│  │  │  • Coordinación de acciones (iniciar trámite, etc.)       │   │   │
│  │  │  • Gestión del ciclo de vida del trámite                   │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                            ↕                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              Capa de Servicios                             │   │   │
│  │  │                                                            │   │   │
│  │  │  • NotificacionService  → Envío de notificaciones         │   │   │
│  │  │  • AuditoriaService     → Registro de auditoría           │   │   │
│  │  │  • EmailService         → Envío de correos (Resend)       │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                            ↕                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              Capa de Middleware                            │   │   │
│  │  │                                                            │   │   │
│  │  │  • authMiddleware          → Autenticación JWT             │   │   │
│  │  │  • adminMiddleware         → Validación de roles          │   │   │
│  │  │  • adminSistemaMiddleware  → Validación admin sistema     │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    ↕                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                                    │   │
│  │                                                                  │   │
│  │  • Mapeo objeto-relacional                                      │   │
│  │  • Migraciones de base de datos                                  │   │
│  │  • Validación de esquema                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE DATOS                                    │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL 15                                       │   │
│  │                                                                  │   │
│  │  • Usuario, Consultante, Grupo                                  │   │
│  │  • Tramite, Ficha                                               │   │
│  │  • DocumentoAdjunto, HojaRuta                                   │   │
│  │  • Notificacion, Auditoria                                      │   │
│  │  • SolicitudReactivacion                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Descripción General de la Arquitectura

La arquitectura clásica se organiza en tres capas principales:

### 1. Capa de Presentación (Frontend)

El frontend es una aplicación React construida con Vite, que proporciona una interfaz de usuario reactiva y moderna. Esta capa se comunica exclusivamente con el backend a través de una API REST, sin conocimiento directo de la base de datos o la lógica de negocio.

**Componentes principales:**
- **Componentes React**: Interfaz de usuario modular y reutilizable
- **Contextos**: Gestión de estado global (autenticación, notificaciones)
- **Servicios API**: Abstracción de las llamadas HTTP al backend
- **Validación de formularios**: Validación en el cliente antes de enviar datos

### 2. Capa de Aplicación (Backend)

El backend es el núcleo del sistema, conteniendo toda la lógica de negocio y el control del flujo de estados. Está estructurado en múltiples capas internas:

#### 2.1 Capa de Controladores
Recibe las peticiones HTTP, valida los datos de entrada y delega la ejecución a la lógica de negocio. Cada controlador maneja un dominio específico (trámites, fichas, usuarios, etc.).

#### 2.2 Capa de Lógica de Negocio
Contiene las reglas de negocio y el control del ciclo de vida de las entidades. En esta capa se implementan:
- **Validación de transiciones de estado**: Control de qué cambios de estado son permitidos según el estado actual
- **Reglas de negocio**: Validaciones complejas, cálculos y transformaciones de datos
- **Coordinación de acciones**: Orquestación de múltiples operaciones relacionadas (ej: iniciar trámite desde ficha)

#### 2.3 Capa de Servicios
Proporciona funcionalidades transversales:
- **NotificacionService**: Gestión y envío de notificaciones a usuarios
- **AuditoriaService**: Registro de todas las acciones realizadas en el sistema
- **EmailService**: Envío de correos electrónicos mediante Resend

#### 2.4 Capa de Middleware
Intercepta las peticiones para aplicar validaciones y transformaciones:
- **Autenticación**: Verificación de tokens JWT
- **Autorización**: Validación de roles y permisos
- **Validación de datos**: Verificación de formato y contenido

### 3. Capa de Datos (Base de Datos)

PostgreSQL almacena toda la información del sistema. Prisma ORM actúa como intermediario, proporcionando:
- **Mapeo objeto-relacional**: Traducción entre modelos de datos y tablas SQL
- **Migraciones**: Control de versiones del esquema de base de datos
- **Validación de esquema**: Garantía de consistencia de datos

## Flujo de Gestión del Trámite

El ciclo de vida del trámite en la versión clásica se gestiona completamente dentro del backend, siguiendo este flujo:

```
1. Inicio del Trámite
   └─> Frontend: Usuario inicia trámite desde ficha
       └─> Backend: fichaController.iniciarTramite()
           ├─> Validar que la ficha puede iniciarse
           ├─> Generar número de carpeta único
           ├─> Crear registro de trámite (estado: 'en_tramite')
           ├─> Actualizar estado de ficha a 'iniciada'
           ├─> Registrar auditoría
           └─> Enviar notificación al consultante

2. Gestión del Ciclo de Vida
   └─> Frontend: Usuario realiza acción (cambiar estado, agregar documento, etc.)
       └─> Backend: tramiteController.update() o acción específica
           ├─> Validar transición de estado permitida
           ├─> Aplicar reglas de negocio
           ├─> Actualizar entidad en base de datos
           ├─> Registrar auditoría
           └─> Enviar notificaciones si corresponde

3. Finalización del Trámite
   └─> Frontend: Usuario cambia estado a 'finalizado' o 'desistido'
       └─> Backend: tramiteController.update()
           ├─> Validar transición permitida
           ├─> Registrar fecha de cierre y motivo (si aplica)
           ├─> Actualizar estado en base de datos
           ├─> Registrar auditoría
           └─> Enviar notificación al consultante
```

## Integración entre Componentes

En esta versión, la coordinación entre componentes ocurre de la siguiente forma:

### Backend
- **Recibe peticiones HTTP** del frontend a través de Nginx
- **Valida y procesa** la lógica de negocio internamente
- **Persiste cambios** en la base de datos mediante Prisma
- **Coordina servicios** (notificaciones, auditoría, correos) de forma síncrona
- **Responde al frontend** con el resultado de la operación

### Frontend
- **No interactúa directamente** con la base de datos
- **Envía peticiones HTTP** al backend a través de la API REST
- **Refleja el estado** actualizado recibido del backend
- **Maneja la presentación** y la experiencia de usuario

### Nginx
- **Sirve el frontend** compilado (archivos estáticos)
- **Hace proxy** de las peticiones `/api/*` al backend en `localhost:3001`
- **Maneja SSL/TLS** si está configurado
- **Optimiza** la entrega de contenido estático

## Ventajas de la Arquitectura Clásica

1. **Simplicidad**: Toda la lógica está en un solo lugar (backend), facilitando la comprensión y mantenimiento
2. **Control directo**: El desarrollador tiene control total sobre el flujo y las validaciones
3. **Rendimiento**: Sin overhead de comunicación con motores externos
4. **Debugging**: Más fácil de depurar al tener toda la lógica en código
5. **Flexibilidad**: Cambios rápidos sin necesidad de modificar diagramas BPMN

## Limitaciones

1. **Escalabilidad del flujo**: Modificar el flujo requiere cambios en código y despliegue
2. **Visibilidad**: No hay representación visual del proceso de negocio
3. **Versionado del proceso**: El control de versiones del flujo depende del control de versiones del código
4. **Complejidad del código**: Toda la lógica concentrada puede hacer el código más complejo

## Comparación con la Versión Camunda

| Aspecto | Versión Clásica | Versión Camunda |
|---------|----------------|-----------------|
| **Control del flujo** | Backend (código) | Motor BPMN (Camunda) |
| **Modificación del proceso** | Cambio de código + despliegue | Modificación de diagrama BPMN |
| **Visibilidad del proceso** | Documentación/código | Diagrama BPMN visual |
| **Complejidad inicial** | Menor | Mayor (requiere Camunda) |
| **Flexibilidad de cambios** | Requiere desarrollo | Cambios sin código |
| **Overhead** | Mínimo | Comunicación con motor BPMN |

## Módulos y Funcionalidades

La versión clásica incluye los siguientes módulos principales:

### Gestión de Trámites
- Creación, consulta, actualización y eliminación de trámites
- Control de transiciones de estado con validación de reglas de negocio
- Generación automática de números de carpeta
- Gestión de observaciones y motivos de cierre

### Gestión de Fichas
- Creación y gestión de fichas de consulta
- Asignación de fichas a grupos de estudiantes
- Inicio de trámites desde fichas
- Estados: pendiente, aprobado, standby, asignada, iniciada

### Gestión de Usuarios
- CRUD completo de usuarios
- Roles: estudiante, docente, consultante, administrador
- Niveles de acceso para administradores (administrativo, sistema)
- Solicitudes de reactivación de cuentas

### Gestión de Grupos
- Creación y gestión de grupos de trabajo
- Asignación de responsables, asistentes y estudiantes
- Relación con trámites y fichas

### Gestión Documental
- Subida y descarga de documentos adjuntos a trámites
- Almacenamiento en sistema de archivos
- Metadatos de documentos

### Hoja de Ruta
- Registro de actuaciones realizadas por estudiantes
- Historial cronológico del trámite
- Relación con usuarios y trámites

### Notificaciones
- Sistema de notificaciones en tiempo real
- Notificaciones por correo electrónico (opcional)
- Tipos: info, success, warning, error

### Auditoría
- Registro de todas las acciones realizadas en el sistema
- Trazabilidad completa de cambios
- Consulta de historial de auditoría

### Reportes
- Reportes de trámites por estado
- Estadísticas de desistimientos
- Métricas de rendimiento por docente
- Exportación a PDF y Excel



