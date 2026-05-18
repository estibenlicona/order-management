-- CreateTable
CREATE TABLE "csv_staging" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "row_index" INTEGER NOT NULL,
    "identificacion" TEXT,
    "paciente" TEXT,
    "formula" TEXT,
    "fecha" TEXT,
    "producto" TEXT,
    "codigo" TEXT,
    "estado" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "tipo_medica" TEXT,
    "condicionado" TEXT,
    "sucursal" TEXT,
    "modalidad" TEXT,
    "contrato" TEXT,
    "clasificacion" TEXT,
    "cp" TEXT,
    "cl" TEXT,
    "pendiente" TEXT,
    "entregado" TEXT,
    "existencia" TEXT,
    "fecha_1" TEXT,
    "observacion_1" TEXT,
    "usuario_1" TEXT,
    "fecha_2" TEXT,
    "observacion_2" TEXT,
    "usuario_2" TEXT,
    "fecha_3" TEXT,
    "observacion_3" TEXT,
    "usuario_3" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ingreso_del_producto" TEXT,

    CONSTRAINT "csv_staging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_csv_staging_batch" ON "csv_staging"("batch_id");
