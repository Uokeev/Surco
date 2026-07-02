-- ─── Migración 002: Sistema de Semillas y Planes ─────────
-- Crea las tablas para gamificación y suscripciones.
-- Ejecutar: psql -f supabase/migrations/002_semillas.sql

-- ============================================================
-- 1. Tabla: planes de suscripción
-- ============================================================
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,           -- gratuito, pro, premium
  precio_mensual INT NOT NULL DEFAULT 0, -- en CLP ($)
  precio_anual INT,                      -- en CLP ($), NULL si no tiene
  diagnosticos_limite INT NOT NULL DEFAULT 10,  -- por mes
  diagnostico_max_fotos INT DEFAULT 1,
  tiene_historial BOOLEAN DEFAULT TRUE,
  tiene_alertas BOOLEAN DEFAULT FALSE,
  tiene_prioritario BOOLEAN DEFAULT FALSE,
  semillas_bonus INT DEFAULT 0,          -- semillas que regala al suscribirse
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar los 3 planes por defecto (solo si no existen)
INSERT INTO planes (nombre, precio_mensual, precio_anual, diagnosticos_limite, tiene_alertas, tiene_prioritario, semillas_bonus)
VALUES
  ('gratuito', 0, NULL, 10, FALSE, FALSE, 5),
  ('pro', 4990, 49900, 100, TRUE, FALSE, 50),
  ('premium', 9990, 99900, -1, TRUE, TRUE, 200)  -- -1 = ilimitado
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 2. Tabla: suscripción del usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS suscripciones_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id),
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'expirada', 'trial')),
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, plan_id)
);

ALTER TABLE suscripciones_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_ven_su_suscripcion" ON suscripciones_usuario;
CREATE POLICY "usuarios_ven_su_suscripcion"
  ON suscripciones_usuario FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_user ON suscripciones_usuario(user_id);

-- ============================================================
-- 3. Tabla: semillas del usuario (gamificación)
-- ============================================================
CREATE TABLE IF NOT EXISTS semillas_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'basica',    -- común
    'rara',      -- menos común
    'epica'      -- difícil de conseguir
  )),
  cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tipo)
);

ALTER TABLE semillas_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_ven_sus_semillas" ON semillas_usuario;
CREATE POLICY "usuarios_ven_sus_semillas"
  ON semillas_usuario FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sistema_actualiza_semillas" ON semillas_usuario;
CREATE POLICY "sistema_actualiza_semillas"
  ON semillas_usuario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sistema_actualiza_semillas_update" ON semillas_usuario;
CREATE POLICY "sistema_actualiza_semillas_update"
  ON semillas_usuario FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_semillas_user ON semillas_usuario(user_id);

-- ============================================================
-- 4. Tabla: historial de transacciones de semillas
-- ============================================================
CREATE TABLE IF NOT EXISTS transacciones_semillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ganancia', 'gasto', 'bonus')),
  semilla_tipo TEXT NOT NULL CHECK (semilla_tipo IN ('basica', 'rara', 'epica')),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  razon TEXT NOT NULL,  -- 'diagnostico_completado', 'login_diario', 'compartir_app', 'canje_beneficio', etc.
  referencia_id UUID,   -- opcional: id del diagnóstico que generó la semilla
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transacciones_semillas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_ven_sus_transacciones" ON transacciones_semillas;
CREATE POLICY "usuarios_ven_sus_transacciones"
  ON transacciones_semillas FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transacciones_user ON transacciones_semillas(user_id);

-- ============================================================
-- 5. Función: obtener o crear semillas del usuario
-- ============================================================
CREATE OR REPLACE FUNCTION obtener_semillas_usuario(p_user_id UUID)
RETURNS TABLE (tipo TEXT, cantidad INT) AS $$
BEGIN
  -- Asegurar que existan los 3 tipos
  INSERT INTO semillas_usuario (user_id, tipo, cantidad)
  VALUES (p_user_id, 'basica', 0), (p_user_id, 'rara', 0), (p_user_id, 'epica', 0)
  ON CONFLICT (user_id, tipo) DO NOTHING;

  RETURN QUERY
  SELECT su.tipo, su.cantidad
  FROM semillas_usuario su
  WHERE su.user_id = p_user_id
  ORDER BY
    CASE su.tipo
      WHEN 'basica' THEN 1
      WHEN 'rara' THEN 2
      WHEN 'epica' THEN 3
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Función: agregar semillas al usuario
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

-- ============================================================
-- 7. Función: canjear semillas por un beneficio
-- ============================================================
CREATE OR REPLACE FUNCTION canjear_semillas(
  p_user_id UUID,
  p_tipo TEXT,
  p_cantidad INT,
  p_beneficio TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_saldo INT;
BEGIN
  SELECT cantidad INTO v_saldo
  FROM semillas_usuario
  WHERE user_id = p_user_id AND tipo = p_tipo;

  IF v_saldo IS NULL OR v_saldo < p_cantidad THEN
    RETURN FALSE;
  END IF;

  UPDATE semillas_usuario
  SET cantidad = cantidad - p_cantidad, updated_at = now()
  WHERE user_id = p_user_id AND tipo = p_tipo;

  INSERT INTO transacciones_semillas (user_id, tipo, semilla_tipo, cantidad, razon)
  VALUES (p_user_id, 'gasto', p_tipo, p_cantidad, 'canje: ' || p_beneficio);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. Función semilla bonus por diagnóstico completado
-- ============================================================
CREATE OR REPLACE FUNCTION semilla_por_diagnostico()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo TEXT;
  v_cantidad INT;
BEGIN
  -- Aleatorio ponderado: 70% básica, 25% rara, 5% épica
  v_tipo := CASE
    WHEN random() < 0.70 THEN 'basica'
    WHEN random() < 0.95 THEN 'rara'
    ELSE 'epica'
  END;

  v_cantidad := CASE v_tipo
    WHEN 'basica' THEN 1
    WHEN 'rara' THEN 2
    WHEN 'epica' THEN 5
  END;

  PERFORM agregar_semillas(NEW.user_id, v_tipo, v_cantidad, 'diagnostico_completado', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: cuando se inserta un diagnóstico, dar semillas
DROP TRIGGER IF EXISTS trg_semilla_por_diagnostico ON diagnosticos;
CREATE TRIGGER trg_semilla_por_diagnostico
  AFTER INSERT ON diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION semilla_por_diagnostico();

-- ============================================================
-- 9. Generar semilla bonus de bienvenida al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION semilla_bienvenida()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM agregar_semillas(NEW.id, 'basica', 5, 'bienvenida');
  PERFORM agregar_semillas(NEW.id, 'rara', 1, 'bienvenida');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: cuando se crea un usuario, dar semillas de bienvenida
DROP TRIGGER IF EXISTS trg_semilla_bienvenida ON auth.users;
CREATE TRIGGER trg_semilla_bienvenida
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION semilla_bienvenida();

-- ============================================================
-- 10. Inicializar plan gratuito para usuarios existentes
-- ============================================================
INSERT INTO suscripciones_usuario (user_id, plan_id)
SELECT
  u.id,
  (SELECT id FROM planes WHERE nombre = 'gratuito' LIMIT 1)
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM suscripciones_usuario su WHERE su.user_id = u.id::uuid
)
ON CONFLICT (user_id, plan_id) DO NOTHING;
