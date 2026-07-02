-- ─── Migración 004: Fix trigger auth.users + sync public.users ──
--  1. Elimina el trigger de bienvenida sobre auth.users (causa error al registrar)
--  2. Crea un trigger que asegura que public.users tenga un registro
--  3. La lógica de bienvenida se maneja desde la app (AuthProvider)

-- ============================================================
-- 1. Eliminar trigger problemático sobre auth.users
-- ============================================================
DROP TRIGGER IF EXISTS trg_semilla_bienvenida ON auth.users;
DROP FUNCTION IF EXISTS semilla_bienvenida;

-- ============================================================
-- 2. Trigger: sincronizar auth.users → public.users
-- ============================================================
-- Se ejecuta AFTER INSERT en auth.users para asegurar que
-- exista un registro en public.users.
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, photo, plan, diagnosticos_usados, diagnosticos_limite, created_at, last_login)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    'gratuito',
    0,
    10,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_auth_user ON auth.users;
CREATE TRIGGER trg_sync_auth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_public();

-- ============================================================
-- 3. Inicializar semillas y racha para usuarios existentes
--    que no los tengan (migración de datos existentes)
-- ============================================================
INSERT INTO semillas_usuario (user_id, tipo, cantidad, puntaje_total)
SELECT u.id, 'basica', 5, 50
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM semillas_usuario s WHERE s.user_id = u.id AND s.tipo = 'basica');

INSERT INTO semillas_usuario (user_id, tipo, cantidad)
SELECT u.id, 'rara', 1
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM semillas_usuario s WHERE s.user_id = u.id AND s.tipo = 'rara');

INSERT INTO rachas_usuario (user_id, racha_actual, racha_maxima, ultimo_acceso)
SELECT u.id, 0, 0, CURRENT_DATE
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM rachas_usuario r WHERE r.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 4. Asegurar plan gratuito para usuarios que no tengan
-- ============================================================
INSERT INTO suscripciones_usuario (user_id, plan_id)
SELECT
  u.id,
  (SELECT id FROM planes WHERE nombre = 'gratuito' LIMIT 1)
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM suscripciones_usuario su WHERE su.user_id = u.id
)
ON CONFLICT (user_id, plan_id) DO NOTHING;
