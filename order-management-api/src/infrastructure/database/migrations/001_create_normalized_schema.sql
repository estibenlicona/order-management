-- ============================================================
-- Schema normalizado: clientes, medicamentos, pedidos, estados_pedido
-- Ejecutar en Supabase SQL Editor (reemplaza cualquier tabla anterior)
-- ============================================================

-- Clientes (pacientes)
CREATE TABLE clientes (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  identificacion VARCHAR(20)  NOT NULL,
  nombre         VARCHAR(200) NOT NULL,
  direccion      TEXT,
  telefono       VARCHAR(30),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_clientes_identificacion UNIQUE (identificacion)
);

-- Medicamentos / productos
CREATE TABLE medicamentos (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      VARCHAR(80)  NOT NULL,
  nombre      VARCHAR(400) NOT NULL,
  tipo_medica VARCHAR(20),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_medicamentos_codigo UNIQUE (codigo)
);

-- Pedidos (una fila del CSV = un pedido)
CREATE TABLE pedidos (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  formula            VARCHAR(100) NOT NULL,
  cliente_id         UUID         NOT NULL REFERENCES clientes(id),
  medicamento_id     UUID         NOT NULL REFERENCES medicamentos(id),
  fecha              DATE         NOT NULL,
  cantidad_pendiente INTEGER      NOT NULL DEFAULT 0,
  cantidad_entregada INTEGER      NOT NULL DEFAULT 0,
  existencia         INTEGER      NOT NULL DEFAULT 0,
  sucursal           VARCHAR(100),
  condicionado       BOOLEAN      NOT NULL DEFAULT false,
  modalidad          VARCHAR(50),
  contrato           VARCHAR(50),
  clasificacion      VARCHAR(10),
  cp                 VARCHAR(80),
  cl                 VARCHAR(20),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_pedidos_formula UNIQUE (formula)
);

CREATE INDEX idx_pedidos_cliente     ON pedidos (cliente_id);
CREATE INDEX idx_pedidos_medicamento ON pedidos (medicamento_id);

-- Historial de estados por pedido (incluye hasta 3 entradas del CSV + nuevas)
CREATE TABLE estados_pedido (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   UUID        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estado      VARCHAR(50) NOT NULL,
  fecha       DATE,
  observacion TEXT,
  usuario     VARCHAR(100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_estados_pedido_pedido ON estados_pedido (pedido_id);
