-- ─── Migración 007: Unificar sistema de puntaje ─────────
-- Elimina la duplicidad entre semillas_usuario.puntaje_total
-- y users.semillas_acumuladas.
-- El campo fuente de verdad pasa a ser users.semillas_acumuladas

-- ============================================================
-- 1. Sincronizar puntaje_total existente → semillas_acumuladas
-- ============================================================
UPDATE users
SET semillas_acumuladas = COALESCE(
  (SELECT SUM(s.puntaje_total) FROM semillas_usuario s WHERE s.user_id = users.id::uuid),
  0
)
WHERE semillas_acumuladas = 0;

-- ============================================================
-- 2. Eliminar columna redundante puntaje_total
-- ============================================================
ALTER TABLE semillas_usuario
  DROP COLUMN IF EXISTS puntaje_total;

-- ============================================================
-- 3. Actualizar función agregar_semillas (sin puntaje_total)
-- ============================================================
CREATE OR REPLACE FUNCTION agregar_semillas(
  p_user_id UUID,
  p_tipo TEXT,
  p_cantidad INT,
  p_razon TEXT,
  p_referencia_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_nueva_cantidad INT;
BEGIN
  -- Asegurar que existe el registro
  INSERT INTO semillas_usuario (user_id, tipo, cantidad)
  VALUES (p_user_id, p_tipo, 0)
  ON CONFLICT (user_id, tipo) DO NOTHING;

  -- Actualizar cantidad
  UPDATE semillas_usuario
  SET cantidad = cantidad + p_cantidad, updated_at = now()
  WHERE user_id = p_user_id AND tipo = p_tipo
  RETURNING cantidad INTO v_nueva_cantidad;

  -- Registrar transacción
  INSERT INTO transacciones_semillas (user_id, tipo, semilla_tipo, cantidad, razon, referencia_id)
  VALUES (p_user_id, 'ganancia', p_tipo, p_cantidad, p_razon, p_referencia_id);

  RETURN v_nueva_cantidad;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
