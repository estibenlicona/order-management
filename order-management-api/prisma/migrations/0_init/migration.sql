-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "identificacion" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(80) NOT NULL,
    "nombre" VARCHAR(400) NOT NULL,
    "tipo_medica" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "formula" VARCHAR(100) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "medicamento_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "cantidad_pendiente" INTEGER NOT NULL DEFAULT 0,
    "cantidad_entregada" INTEGER NOT NULL DEFAULT 0,
    "existencia" INTEGER NOT NULL DEFAULT 0,
    "sucursal" VARCHAR(100),
    "condicionado" BOOLEAN NOT NULL DEFAULT false,
    "modalidad" VARCHAR(50),
    "contrato" VARCHAR(50),
    "clasificacion" VARCHAR(10),
    "cp" VARCHAR(80),
    "cl" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "fecha" DATE,
    "observacion" TEXT,
    "usuario" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estados_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uk_clientes_identificacion" ON "clientes"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "uk_medicamentos_codigo" ON "medicamentos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "uk_pedidos_formula" ON "pedidos"("formula");

-- CreateIndex
CREATE INDEX "idx_pedidos_cliente" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_pedidos_medicamento" ON "pedidos"("medicamento_id");

-- CreateIndex
CREATE INDEX "idx_estados_pedido_pedido" ON "estados_pedido"("pedido_id");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_pedido" ADD CONSTRAINT "estados_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

