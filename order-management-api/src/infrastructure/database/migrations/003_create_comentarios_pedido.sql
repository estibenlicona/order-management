-- ============================================================
-- Comentarios libres por pedido (separados de estados_pedido)
-- Permiten dejar observaciones sin cambiar el estado del pedido.
-- ============================================================

CREATE TABLE comentarios_pedido (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id  UUID         NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  contenido  TEXT         NOT NULL,
  usuario    VARCHAR(100),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comentarios_pedido_pedido ON comentarios_pedido (pedido_id);
