-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "rol_activo" TEXT;

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,
    "nivel_acceso" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsuarioRol_id_usuario_idx" ON "UsuarioRol"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_id_usuario_rol_key" ON "UsuarioRol"("id_usuario", "rol");

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
