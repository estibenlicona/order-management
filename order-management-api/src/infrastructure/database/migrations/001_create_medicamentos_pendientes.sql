CREATE TABLE IF NOT EXISTS medicamentos_pendientes (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  documento     VARCHAR(20)  NOT NULL,
  nombre        VARCHAR(200) NOT NULL,
  medicamento   VARCHAR(200) NOT NULL,
  fecha         DATE         NOT NULL,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_documento_medicamento UNIQUE (documento, medicamento),
  CONSTRAINT chk_estado CHECK (estado IN ('Pendiente', 'Entregado', 'Cancelado', 'En proceso'))
);

CREATE INDEX IF NOT EXISTS idx_med_pendientes_documento ON medicamentos_pendientes (documento);
CREATE INDEX IF NOT EXISTS idx_med_pendientes_estado    ON medicamentos_pendientes (estado);
