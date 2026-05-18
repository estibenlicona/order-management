-- AlterTable
ALTER TABLE "comentarios_pedido" ADD COLUMN     "usuario_id" UUID;

-- AlterTable
ALTER TABLE "estados_pedido" ADD COLUMN     "usuario_id" UUID;

-- CreateIndex
CREATE INDEX "idx_comentarios_pedido_usuario" ON "comentarios_pedido"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_estados_pedido_usuario" ON "estados_pedido"("usuario_id");
