-- ============================================================
-- Vincular trazabilidad con auth.users
-- Cada estado y comentario queda enlazado al usuario que lo creó.
-- ============================================================

ALTER TABLE estados_pedido
  ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE comentarios_pedido
  ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_estados_pedido_usuario     ON estados_pedido     (usuario_id);
CREATE INDEX idx_comentarios_pedido_usuario ON comentarios_pedido (usuario_id);
