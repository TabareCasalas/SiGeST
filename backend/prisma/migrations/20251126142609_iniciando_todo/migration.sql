-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_desactivacion_automatica" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SolicitudReactivacion" (
    "id_solicitud" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "motivo" TEXT,
    "respuesta" TEXT,
    "id_administrador" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudReactivacion_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudReactivacion_id_usuario_key" ON "SolicitudReactivacion"("id_usuario");

-- CreateIndex
CREATE INDEX "SolicitudReactivacion_estado_idx" ON "SolicitudReactivacion"("estado");

-- CreateIndex
CREATE INDEX "SolicitudReactivacion_created_at_idx" ON "SolicitudReactivacion"("created_at");

-- AddForeignKey
ALTER TABLE "SolicitudReactivacion" ADD CONSTRAINT "SolicitudReactivacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudReactivacion" ADD CONSTRAINT "SolicitudReactivacion_id_administrador_fkey" FOREIGN KEY ("id_administrador") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
