-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ESTUDIANTE', 'DOCENTE', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "ModoIntento" AS ENUM ('FISICO', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "ResultadoIntento" AS ENUM ('ACIERTO', 'ESPEJO', 'FALTANTE', 'SOBRANTE', 'MIXTO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ESTUDIANTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "ejercicio" TEXT NOT NULL,
    "esperada" INTEGER NOT NULL,
    "recibida" INTEGER NOT NULL,
    "resultado" "ResultadoIntento" NOT NULL,
    "duracion_ms" INTEGER NOT NULL,
    "modo" "ModoIntento" NOT NULL,
    "realizado_en" TIMESTAMP(3) NOT NULL,
    "recibido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "intentos_usuario_id_realizado_en_idx" ON "intentos"("usuario_id", "realizado_en");

-- AddForeignKey
ALTER TABLE "intentos" ADD CONSTRAINT "intentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
