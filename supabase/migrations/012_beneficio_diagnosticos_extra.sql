-- ─── Migración 012: Beneficio de diagnósticos extra ────
--  1. Agrega columna tipo_beneficio y valor_beneficio a catalogo_beneficios
--  2. Inserta el beneficio "+5 Diagnósticos Extra"
--  3. Modifica canjear_beneficio para que incremente diagnosticos_limite

-- ════════════════════════════════════════════════════════════════
-- 1. Nuevas columnas en catalogo_beneficios
-- ════════════════════════════════════════════════════════════════
ALTER TABLE catalogo_beneficios
  ADD COLUMN IF NOT EXISTS tipo_beneficio TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS valor_beneficio INT DEFAULT NULL;

COMMENT ON COLUMN catalogo_beneficios.tipo_beneficio IS 'Tipo especial: null = normal, diagnosticos_extra = suma diagnosticos_limite';
COMMENT ON COLUMN catalogo_beneficios.valor_beneficio IS 'Cantidad que otorga (ej: +5 diagnósticos)';

-- ════════════════════════════════════════════════════════════════
-- 2. Insertar beneficio de diagnósticos extra
-- ════════════════════════════════════════════════════════════════
INSERT INTO catalogo_beneficios (item, partner, descripcion, costo_puntos, categoria, tipo_beneficio, valor_beneficio)
SELECT '+5 Diagnósticos Extra', 'Surco', 'Aumenta tu límite mensual en 5 diagnósticos adicionales', 200, 'descuentos', 'diagnosticos_extra', 5
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_beneficios WHERE item = '+5 Diagnósticos Extra'
);

-- ════════════════════════════════════════════════════════════════
-- 3. Función actualizada: canjear_beneficio con soporte para diagnosticos_extra
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION canjear_beneficio(
  p_user_id UUID,
  p_beneficio_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_costo INT;
  v_saldo_actual INT;
  v_item TEXT;
  v_partner TEXT;
  v_tipo TEXT;
  v_valor INT;
  v_codigo_canje TEXT;
  v_canje_id UUID;
BEGIN
  -- Obtener datos del beneficio
  SELECT costo_puntos, item, partner, tipo_beneficio, valor_beneficio
  INTO v_costo, v_item, v_partner, v_tipo, v_valor
  FROM catalogo_beneficios
  WHERE id = p_beneficio_id AND activo = TRUE;

  IF v_costo IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Beneficio no disponible o inactivo.');
  END IF;

  -- Verificar saldo en semillas_acumuladas (puntaje real)
  SELECT semillas_acumuladas INTO v_saldo_actual
  FROM users
  WHERE id = p_user_id::text;

  IF v_saldo_actual IS NULL OR v_saldo_actual < v_costo THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'error', 'No tienes suficientes semillas. Necesitas ' || v_costo || ', tienes ' || COALESCE(v_saldo_actual, 0) || '.'
    );
  END IF;

  -- ═══ Descontar del puntaje real ═══
  UPDATE users
  SET semillas_acumuladas = semillas_acumuladas - v_costo,
      updated_at = now()
  WHERE id = p_user_id::text
    AND semillas_acumuladas >= v_costo;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Error al descontar semillas. Intenta de nuevo.');
  END IF;

  -- ═══ Si es diagnóstico extra, incrementar límite ═══
  IF v_tipo = 'diagnosticos_extra' AND v_valor IS NOT NULL AND v_valor > 0 THEN
    UPDATE users
    SET diagnosticos_limite = diagnosticos_limite + v_valor,
        updated_at = now()
    WHERE id = p_user_id::text;
  END IF;

  -- Generar código de canje único
  v_codigo_canje := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  -- Registrar en canjes_usuario
  INSERT INTO canjes_usuario (user_id, beneficio_id, puntos_gastados, codigo_canje, estado)
  VALUES (p_user_id, p_beneficio_id, v_costo, v_codigo_canje, 'pendiente')
  RETURNING id INTO v_canje_id;

  -- Registrar transacción como gasto
  INSERT INTO transacciones_semillas (user_id, tipo, semilla_tipo, cantidad, razon, referencia_id)
  VALUES (p_user_id, 'gasto', 'basica', v_costo, 'canje: ' || v_item, p_beneficio_id);

  -- Verificar si perdió nivel Oro (baja de 2000)
  PERFORM verificar_nivel_oro(p_user_id);

  RETURN jsonb_build_object(
    'ok', TRUE,
    'canje_id', v_canje_id,
    'codigo_canje', v_codigo_canje,
    'item', v_item,
    'partner', v_partner,
    'costo', v_costo,
    'saldo_restante', v_saldo_actual - v_costo,
    'diagnosticos_extra', CASE WHEN v_tipo = 'diagnosticos_extra' THEN v_valor ELSE 0 END,
    'nuevo_limite', CASE WHEN v_tipo = 'diagnosticos_extra' THEN (SELECT diagnosticos_limite FROM users WHERE id = p_user_id::text) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
