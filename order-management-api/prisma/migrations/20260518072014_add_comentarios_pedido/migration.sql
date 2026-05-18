-- CreateTable
CREATE TABLE "comentarios_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "usuario" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_comentarios_pedido_pedido" ON "comentarios_pedido"("pedido_id");

-- AddForeignKey
ALTER TABLE "comentarios_pedido" ADD CONSTRAINT "comentarios_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
