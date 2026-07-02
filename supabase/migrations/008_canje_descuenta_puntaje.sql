-- ─── Migración 008: Canje descuenta del puntaje real ──
--  1. Función RPC canjear_beneficio que descuenta de users.semillas_acumuladas
--  2. Registra en canjes_usuario + transacciones_semillas como gasto

-- ════════════════════════════════════════════════════════════════
-- 1. Función: canjear un beneficio descontando del puntaje real
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
  v_codigo_canje TEXT;
  v_canje_id UUID;
BEGIN
  -- Obtener costo y nombre del beneficio
  SELECT costo_puntos, item, partner
  INTO v_costo, v_item, v_partner
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
    AND semillas_acumuladas >= v_costo;  -- safety check

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'Error al descontar semillas. Intenta de nuevo.');
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
    'saldo_restante', v_saldo_actual - v_costo
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;