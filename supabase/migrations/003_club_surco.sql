-- ─── Migración 003: Club Surco — Gamificación Fitosanitaria ──
-- Sistema de puntos, niveles, rachas, referidos, catálogo de canje.
-- Ejecutar después de 002_semillas.sql

-- ============================================================
-- 1. NUEVAS COLUMNAS en tablas existentes
-- ============================================================

-- Extender semillas_usuario con puntaje total acumulado (vida)
ALTER TABLE semillas_usuario
  ADD COLUMN IF NOT EXISTS puntaje_total INT NOT NULL DEFAULT 0;

-- Perfil de usuario (tabla pública "users" o la que corresponda)
-- Asumiendo que existe la tabla "users" con user_id = auth.users.id
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nivel TEXT NOT NULL DEFAULT 'cosecha'
    CHECK (nivel IN ('cosecha', 'oro'));
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rut_verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS telefono_verificado BOOLEAN DEFAULT FALSE;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rut TEXT UNIQUE;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS datos_parcela_completos BOOLEAN DEFAULT FALSE;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS parcela_region TEXT;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS parcela_cultivo_principal TEXT;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS parcela_hectareas NUMERIC(8,2);
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS semillas_acumuladas INT DEFAULT 0; -- total histórico para nivel Oro
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 2. TABLA: Rachas de uso diario
-- ============================================================
CREATE TABLE IF NOT EXISTS rachas_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  racha_actual INT NOT NULL DEFAULT 0,       -- días consecutivos hoy
  racha_maxima INT NOT NULL DEFAULT 0,       -- mejor racha histórica
  ultimo_acceso DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE rachas_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rachas_propias_select" ON rachas_usuario;
CREATE POLICY "rachas_propias_select"
  ON rachas_usuario FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rachas_propias_insert" ON rachas_usuario;
CREATE POLICY "rachas_propias_insert"
  ON rachas_usuario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rachas_propias_update" ON rachas_usuario;
CREATE POLICY "rachas_propias_update"
  ON rachas_usuario FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rachas_user ON rachas_usuario(user_id);

-- ============================================================
-- 3. TABLA: Referidos
-- ============================================================
CREATE TABLE IF NOT EXISTS referidos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- quien refiere
  referido_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- quien se registró
  codigo_referido TEXT NOT NULL,
  puntos_ganados INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (referido_id)
);

ALTER TABLE referidos_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referidos_ven_sus_referidos" ON referidos_usuario;
CREATE POLICY "referidos_ven_sus_referidos"
  ON referidos_usuario FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE INDEX IF NOT EXISTS idx_referidos_usuario ON referidos_usuario(usuario_id);

-- ============================================================
-- 4. TABLA: Catálogo de Beneficios (partners reales)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  partner TEXT NOT NULL,           -- Syngenta Chile, INIA Chile, etc.
  descripcion TEXT,
  costo_puntos INT NOT NULL,       -- cuántas semillas cuesta
  categoria TEXT NOT NULL CHECK (categoria IN ('quimicos', 'educacion', 'herramientas', 'descuentos')),
  imagen_url TEXT,
  stock INT DEFAULT -1,            -- -1 = ilimitado
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE catalogo_beneficios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalogo_visible_para_todos" ON catalogo_beneficios;
CREATE POLICY "catalogo_visible_para_todos"
  ON catalogo_beneficios FOR SELECT
  USING (activo = TRUE);

-- Insertar catálogo base (solo si no existe)
INSERT INTO catalogo_beneficios (item, partner, descripcion, costo_puntos, categoria)
SELECT * FROM (VALUES
  ('Fungicida Amistar 10%% off',   'Syngenta Chile',  'Descuento en fungicida sistémico para cultivos',      500, 'quimicos'),
  ('Herbicida Roundup 15%% off',   'Syngenta Chile',  'Descuento en herbicida no selectivo',                 300, 'quimicos'),
  ('Insecticida Karate 20%% off',  'Syngenta Chile',  'Descuento en insecticida de amplio espectro',          800, 'quimicos'),
  ('Fertilizante foliar 12%% off', 'Syngenta Chile',  'Descuento en fertilizante foliar líquido',             400, 'quimicos'),
  ('Curso MIP (Online)',           'INIA Chile',      'Curso de manejo integrado de plagas certificado',      600, 'educacion'),
  ('Kit de monitoreo básico',      'Surco',           'Lupa 20x + trampas cromáticas + guía rápida',          350, 'herramientas'),
  ('Diagnóstico prioritario x1',   'Surco',           'Salta la fila de análisis IA por 1 diagnóstico',       150, 'descuentos'),
  ('Reporte PDF premium x5',       'Surco',           'Descarga 5 diagnósticos en PDF formateado',            200, 'descuentos')
) AS t(item, partner, descripcion, costo_puntos, categoria)
WHERE NOT EXISTS (SELECT 1 FROM catalogo_beneficios LIMIT 1);

-- ============================================================
-- 5. TABLA: Canjes de usuario (historial de redención)
-- ============================================================
CREATE TABLE IF NOT EXISTS canjes_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficio_id UUID NOT NULL REFERENCES catalogo_beneficios(id),
  puntos_gastados INT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aprobado', 'entregado', 'rechazado')),
  codigo_canje TEXT UNIQUE,        -- código para usar en el partner
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE canjes_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "canjes_propios_select" ON canjes_usuario;
CREATE POLICY "canjes_propios_select"
  ON canjes_usuario FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "canjes_propios_insert" ON canjes_usuario;
CREATE POLICY "canjes_propios_insert"
  ON canjes_usuario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_canjes_user ON canjes_usuario(user_id);

-- ============================================================
-- 6. FUNCIÓN: Actualizar racha diaria
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_racha(p_user_id UUID)
RETURNS TABLE (racha_actual INT, racha_maxima INT) AS $$
DECLARE
  v_ayer DATE;
  v_hoy DATE := CURRENT_DATE;
  v_racha_actual INT;
  v_racha_maxima INT;
BEGIN
  -- Obtener o crear registro de racha
  INSERT INTO rachas_usuario (user_id, racha_actual, racha_maxima, ultimo_acceso)
  VALUES (p_user_id, 1, 1, v_hoy)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT r.racha_actual, r.racha_maxima, r.ultimo_acceso
  INTO v_racha_actual, v_racha_maxima, v_ayer
  FROM rachas_usuario r
  WHERE r.user_id = p_user_id;

  IF v_ayer IS NULL THEN
    v_ayer := v_hoy;
  END IF;

  IF v_ayer = v_hoy THEN
    -- Ya accedió hoy, no incrementar
    NULL;
  ELSIF v_ayer = v_hoy - 1 THEN
    -- Día consecutivo
    v_racha_actual := v_racha_actual + 1;
  ELSE
    -- Se rompió la racha
    v_racha_actual := 1;
  END IF;

  -- Actualizar racha máxima
  IF v_racha_actual > v_racha_maxima THEN
    v_racha_maxima := v_racha_actual;
  END IF;

  UPDATE rachas_usuario
  SET racha_actual = v_racha_actual,
      racha_maxima = v_racha_maxima,
      ultimo_acceso = v_hoy,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_racha_actual, v_racha_maxima;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. FUNCIÓN: Otorgar puntos por acción
-- ============================================================
-- codigo acción → puntos:
--   DIAGNOSTICO → 50
--   RACHA_7_DIAS → 100
--   REFERIDO → 200
--   RESEÑA → 80
--   PERFIL_PARCELA → 150
CREATE OR REPLACE FUNCTION otorgar_puntos_accion(
  p_user_id UUID,
  p_codigo_accion TEXT,
  p_referencia_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_puntos INT;
  v_tipo_semilla TEXT;
  v_cantidad_semilla INT;
BEGIN
  -- Mapear código a puntos
  v_puntos := CASE p_codigo_accion
    WHEN 'DIAGNOSTICO' THEN 50
    WHEN 'RACHA_7_DIAS' THEN 100
    WHEN 'REFERIDO' THEN 200
    WHEN 'RESEÑA' THEN 80
    WHEN 'PERFIL_PARCELA' THEN 150
    ELSE 0
  END;

  IF v_puntos = 0 THEN
    RETURN 0;
  END IF;

  -- NOTA: No actualizamos puntaje_total por fila (se triplicaría).
  -- El único registro real del puntaje está en users.semillas_acumuladas.
  -- Actualizar contador histórico en users (id es TEXT, p_user_id es UUID)
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

  -- Registrar transacción (cantidad = puntos reales, no semillas cosméticas)
  INSERT INTO transacciones_semillas (user_id, tipo, semilla_tipo, cantidad, razon, referencia_id)
  VALUES (p_user_id, 'ganancia', v_tipo_semilla, v_puntos, p_codigo_accion, p_referencia_id);

  -- Verificar si cumple para nivel Oro
  PERFORM verificar_nivel_oro(p_user_id);

  RETURN v_puntos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. FUNCIÓN: Verificar nivel Oro
-- ============================================================
CREATE OR REPLACE FUNCTION verificar_nivel_oro(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_rut_verificado BOOLEAN;
  v_telefono_verificado BOOLEAN;
  v_total_diagnosticos INT;
  v_semillas_acumuladas INT;
  v_datos_parcela BOOLEAN;
  v_nivel_actual TEXT;
BEGIN
  -- Obtener datos del usuario
  SELECT
    u.rut_verificado,
    u.telefono_verificado,
    u.datos_parcela_completos,
    u.semillas_acumuladas,
    u.nivel
  INTO
    v_rut_verificado,
    v_telefono_verificado,
    v_datos_parcela,
    v_semillas_acumuladas,
    v_nivel_actual
  FROM users u
  WHERE u.id = p_user_id::text;

  -- Contar diagnósticos
  SELECT COUNT(*) INTO v_total_diagnosticos
  FROM diagnosticos d
  WHERE d.user_id = p_user_id::text;

  -- Verificar 5 condiciones para Oro
  IF (v_rut_verificado = TRUE OR v_telefono_verificado = TRUE)
     AND v_total_diagnosticos >= 10
     AND v_semillas_acumuladas >= 2000
     AND v_datos_parcela = TRUE
     AND v_nivel_actual = 'cosecha'
  THEN
    UPDATE users
    SET nivel = 'oro',
        updated_at = now()
    WHERE id = p_user_id::text;

    -- Bonus de bienvenida a Oro
    PERFORM otorgar_puntos_accion(p_user_id, 'BONUS_ORO');
    -- Bonus: 5 semillas épicas
    INSERT INTO semillas_usuario (user_id, tipo, cantidad)
    VALUES (p_user_id, 'epica', 5)
    ON CONFLICT (user_id, tipo) DO UPDATE
    SET cantidad = semillas_usuario.cantidad + 5;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. TRIGGER: Puntos automáticos al insertar diagnóstico
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_diagnostico_puntos()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM otorgar_puntos_accion(NEW.user_id::uuid, 'DIAGNOSTICO', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reemplazar trigger anterior (002_semillas) por el nuevo con puntos
DROP TRIGGER IF EXISTS trg_semilla_por_diagnostico ON diagnosticos;
DROP TRIGGER IF EXISTS trg_diagnostico_puntos ON diagnosticos;
CREATE TRIGGER trg_diagnostico_puntos
  AFTER INSERT ON diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_diagnostico_puntos();

-- ============================================================
-- 9b. Columnas de tipo de terreno (también en 005, pero aquí para orden-independiente)
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_terreno TEXT
  CHECK (tipo_terreno IN ('parcela', 'huerto', 'invernadero'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS terreno_size NUMERIC(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terreno_unidad TEXT
  DEFAULT 'hectareas'
  CHECK (terreno_unidad IN ('hectareas', 'm2'));

-- ============================================================
-- 10. VISTA: Resumen Club Surco por usuario
-- ============================================================
DROP VIEW IF EXISTS resumen_club_surco;
CREATE OR REPLACE VIEW resumen_club_surco AS
SELECT
  u.id AS user_id,
  u.nivel,
  u.semillas_acumuladas,
  u.rut_verificado,
  u.telefono_verificado,
  u.datos_parcela_completos,
  u.tipo_terreno,
  u.parcela_region,
  u.parcela_cultivo_principal,
  u.parcela_hectareas,
  u.terreno_size,
  u.terreno_unidad,
  COALESCE(r.racha_actual, 0) AS racha_actual,
  COALESCE(r.racha_maxima, 0) AS racha_maxima,
  (SELECT COUNT(*) FROM diagnosticos d WHERE d.user_id = u.id) AS total_diagnosticos,
  (SELECT COUNT(*) FROM referidos_usuario rf WHERE rf.usuario_id = u.id::uuid) AS total_referidos,
  (SELECT COALESCE(SUM(s.cantidad), 0) FROM semillas_usuario s WHERE s.user_id = u.id::uuid) AS semillas_totales,
  -- Verificar si cumple Oro (para frontend)
  CASE WHEN
    (u.rut_verificado = TRUE OR u.telefono_verificado = TRUE)
    AND (SELECT COUNT(*) FROM diagnosticos d WHERE d.user_id = u.id) >= 10
    AND u.semillas_acumuladas >= 2000
    AND u.datos_parcela_completos = TRUE
  THEN TRUE ELSE FALSE END AS puede_ser_oro
FROM users u
LEFT JOIN rachas_usuario r ON r.user_id = u.id::uuid;

-- ============================================================
-- 11. Inicializar racha para usuarios existentes
-- ============================================================
INSERT INTO rachas_usuario (user_id, racha_actual, racha_maxima, ultimo_acceso)
SELECT u.id, 0, 0, CURRENT_DATE
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM rachas_usuario r WHERE r.user_id = u.id::uuid)
ON CONFLICT (user_id) DO NOTHING;
