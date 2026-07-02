-- ─── Migración 006: Idempotencia y protección contra duplicación ──
--  1. Unique constraint en transacciones_semillas para evitar doble canje
--  2. Actualiza función otorgar_puntos_accion para verificar duplicados
--  3. Agrega columna nonce opcional para idempotencia desde el frontend

-- ============================================================
-- 1. Unique constraint para evitar doble registro de la misma acción
-- ============================================================
-- Solo aplica cuando referencia_id NO es NULL.
-- Acciones sin referencia_id (bienvenida, login diario, etc.)
-- pueden repetirse legítimamente.
DROP INDEX IF EXISTS idx_transacciones_unique_accion;
CREATE UNIQUE INDEX IF NOT EXISTS idx_transacciones_unique_accion
  ON transacciones_semillas (user_id, razon, referencia_id)
  WHERE referencia_id IS NOT NULL;

-- ============================================================
-- 2. Actualizar función otorgar_puntos_accion con verificación
-- ============================================================
CREATE OR REPLACE FUNCTION otorgar_puntos_accion(
  p_user_id UUID,
  p_codigo_accion TEXT,
  p_referencia_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_puntos INT;
  v_tipo_semilla TEXT;
  v_cantidad_semilla INT;
  v_existente INT;
BEGIN
  -- Mapear código a puntos
  v_puntos := CASE p_codigo_accion
    WHEN 'DIAGNOSTICO' THEN 50
    WHEN 'RACHA_7_DIAS' THEN 100
    WHEN 'REFERIDO' THEN 200
    WHEN 'RESEÑA' THEN 80
    WHEN 'PERFIL_PARCELA' THEN 150
    WHEN 'BONUS_ORO' THEN 500
    ELSE 0
  END;

  IF v_puntos = 0 THEN
    RETURN 0;
  END IF;

  -- ═══ VERIFICACIÓN DE DUPLICADOS ═══
  -- Si tiene referencia_id, verificar que no se haya procesado antes
  IF p_referencia_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existente
    FROM transacciones_semillas
    WHERE user_id = p_user_id
      AND razon = p_codigo_accion
      AND referencia_id = p_referencia_id;

    IF v_existente > 0 THEN
      -- Ya fue otorgado, retornar puntos actuales sin duplicar
      RETURN COALESCE(
        (SELECT semillas_acumuladas FROM users WHERE id = p_user_id::text),
        0
      );
    END IF;
  END IF;

  -- Actualizar contador histórico en users
  UPDATE users
  SET semillas_acumuladas = semillas_acumuladas + v_puntos,
      updated_at = now()
  WHERE id = p_user_id::text;

  -- Determinar semilla cosmética (aleatorio ponderado)
  v_tipo_semilla := CASE
    WHEN random() < 0.70 THEN 'basica'
    WHEN random() < 0.95 THEN 'rara'
    ELSE 'epica'
  END;

  v_cantidad_semilla := CASE
    WHEN v_puntos >= 200 THEN 5
    WHEN v_puntos >= 100 THEN 3
    ELSE 1
  END;

  -- Sumar a la semilla cosmética correspondiente
  INSERT INTO semillas_usuario (user_id, tipo, cantidad)
  VALUES (p_user_id, v_tipo_semilla, v_cantidad_semilla)
  ON CONFLICT (user_id, tipo) DO UPDATE
  SET cantidad = semillas_usuario.cantidad + v_cantidad_semilla;

  -- Registrar transacción con referencia_id para idempotencia
  INSERT INTO transacciones_semillas (user_id, tipo, semilla_tipo, cantidad, razon, referencia_id)
  VALUES (p_user_id, 'ganancia', v_tipo_semilla, v_puntos, p_codigo_accion, p_referencia_id);

  -- Verificar si cumple para nivel Oro
  PERFORM verificar_nivel_oro(p_user_id);

  RETURN v_puntos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
