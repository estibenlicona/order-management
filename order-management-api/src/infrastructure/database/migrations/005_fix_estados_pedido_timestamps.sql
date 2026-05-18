-- ============================================================
-- Fix: deduplicar empates de `created_at` en estados_pedido
--
-- Los CSV cargados antes del fix de microsegundos dejaron
-- múltiples estados por pedido con el mismo `created_at`, lo
-- que hace que el orden de "estado actual" sea no determinístico
-- entre el filtro del listado y el badge mostrado.
--
-- Este script reasigna `created_at` con offset en microsegundos
-- preservando el orden cronológico lógico:
--   1. Estados con `fecha` NOT NULL ordenados por `fecha ASC`
--      (los del histórico Fecha_1, Fecha_2, Fecha_3)
--   2. Estado con `fecha` NULL al final (es el "main" / estado
--      actual reportado por el CSV)
--
-- Es idempotente: solo afecta grupos con empate de timestamp.
-- ============================================================

BEGIN;

WITH ordered_estados AS (
  SELECT
    id,
    pedido_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY pedido_id, created_at
      ORDER BY
        CASE WHEN fecha IS NULL THEN 1 ELSE 0 END,  -- fecha NULL al final (más reciente)
        fecha ASC,                                   -- históricos por fecha asc
        id                                            -- tiebreaker estable
    ) - 1 AS order_offset,
    COUNT(*) OVER (PARTITION BY pedido_id, created_at) AS group_size
  FROM estados_pedido
)
UPDATE estados_pedido ep
SET created_at = ep.created_at + (oe.order_offset * INTERVAL '1 microsecond')
FROM ordered_estados oe
WHERE ep.id = oe.id
  AND oe.group_size > 1
  AND oe.order_offset > 0;

-- Verificación: contar grupos restantes con empate (debería ser 0)
DO $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining FROM (
    SELECT pedido_id, created_at
    FROM estados_pedido
    GROUP BY pedido_id, created_at
    HAVING COUNT(*) > 1
  ) t;
  RAISE NOTICE 'Grupos con empate de timestamp restantes: %', remaining;
END $$;

COMMIT;
