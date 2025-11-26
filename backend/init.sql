-- Script de inicialización de las bases de datos SiGeST
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor PostgreSQL

-- Crear base de datos para Camunda
CREATE DATABASE camunda_db;

-- La base de datos sigest_db se crea automáticamente por las variables de entorno POSTGRES_DB
-- Conectar a la base de datos sigest_db (si existe, si no, se creará automáticamente)
-- Nota: PostgreSQL crea automáticamente la base de datos especificada en POSTGRES_DB
-- así que solo necesitamos conectarnos si ya existe

-- Crear extensiones útiles para SiGeST en la base de datos sigest_db
-- Usamos DO block para manejar la conexión de forma segura
DO $$
BEGIN
    -- Intentar crear extensiones en la base de datos sigest_db
    -- Si la base de datos no existe aún, esto fallará silenciosamente
    -- pero se creará automáticamente por POSTGRES_DB
    PERFORM 1;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Las extensiones se crearán cuando Prisma ejecute las migraciones
-- o se pueden crear manualmente después de que la BD esté lista