-- ────────────────────────────────────────────────────────
-- 001_initial.sql — Esquema completo de Surco
-- Migración inicial: tablas, RLS, índices, funciones
-- ────────────────────────────────────────────────────────

-- ════ 1. USUARIOS ════
CREATE TABLE IF NOT EXISTS public.users (
  id          TEXT PRIMARY KEY,                    -- = auth.users.id
  name        TEXT,
  email       TEXT,
  photo       TEXT,
  plan        TEXT        NOT NULL DEFAULT 'gratuito'
                          CHECK (plan IN ('gratuito', 'pro')),
  diagnosticos_usados  INTEGER NOT NULL DEFAULT 0,
  diagnosticos_limite  INTEGER NOT NULL DEFAULT 999,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS: cada usuario solo ve/edita su propio perfil
DROP POLICY IF EXISTS "users_own" ON public.users;
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid()::text = id);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, photo)
  VALUES (
    NEW.id::text,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name      = EXCLUDED.name,
    email     = EXCLUDED.email,
    photo     = EXCLUDED.photo,
    last_login = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ════ 2. DIAGNÓSTICOS ════
CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             TEXT        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name           TEXT,
  crop                TEXT        NOT NULL,
  region              TEXT        NOT NULL,
  symptoms            TEXT,
  clima               JSONB,
  enfermedad          TEXT        NOT NULL,
  nombre_cientifico   TEXT,
  severidad           TEXT        NOT NULL
                                  CHECK (severidad IN ('Alta', 'Media', 'Baja')),
  confianza           INTEGER     NOT NULL CHECK (confianza BETWEEN 0 AND 100),
  causa               TEXT,
  sintomas_detectados TEXT,
  tratamiento         TEXT[],
  alerta_propagacion  TEXT,
  cuando_actuar       TEXT,
  donde_comprar       TEXT,
  photo_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- RLS: usuarios ven solo sus propios diagnósticos
DROP POLICY IF EXISTS "diagnosticos_own" ON public.diagnosticos;
CREATE POLICY "diagnosticos_own" ON public.diagnosticos
  FOR ALL USING (auth.uid()::text = user_id);

-- RLS: admins/analistas pueden leer agregados (opcional)
-- CREATE POLICY "diagnosticos_admin_read" ON public.diagnosticos
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_diagnosticos_user_id   ON public.diagnosticos (user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_created_at ON public.diagnosticos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_crop_region ON public.diagnosticos (crop, region);

-- ════ 3. ENFERMEDADES SAG ════
CREATE TABLE IF NOT EXISTS public.enfermedades_sag (
  id                        UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cultivo                   TEXT        NOT NULL,
  nombre                    TEXT        NOT NULL,
  nombre_cientifico         TEXT        NOT NULL DEFAULT '',
  sintomas                  TEXT        NOT NULL DEFAULT '',
  causa                     TEXT        NOT NULL DEFAULT '',
  urgencia                  TEXT        NOT NULL DEFAULT 'Media'
                                        CHECK (urgencia IN ('Alta', 'Media', 'Baja')),
  productos_certificados_sag TEXT[]      NOT NULL DEFAULT '{}',
  alternativa_hogar         TEXT
);

ALTER TABLE public.enfermedades_sag ENABLE ROW LEVEL SECURITY;

-- RLS: las enfermedades SAG son públicas (solo lectura para autenticados)
DROP POLICY IF EXISTS "enfermedades_sag_read" ON public.enfermedades_sag;
CREATE POLICY "enfermedades_sag_read" ON public.enfermedades_sag
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_enfermedades_cultivo ON public.enfermedades_sag (cultivo);

-- ════ 4. ZONAS (agregado regional) ════
CREATE TABLE IF NOT EXISTS public.zonas (
  id                    TEXT        NOT NULL PRIMARY KEY, -- "region__crop"
  region                TEXT        NOT NULL,
  crop                  TEXT        NOT NULL,
  total_diagnosticos    INTEGER     NOT NULL DEFAULT 0,
  enfermedades          JSONB       NOT NULL DEFAULT '{}',
  ultima_actualizacion  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;

-- RLS: zonas es público (solo lectura)
DROP POLICY IF EXISTS "zonas_read" ON public.zonas;
CREATE POLICY "zonas_read" ON public.zonas
  FOR SELECT USING (auth.role() = 'authenticated');

-- ════ 5. ALERTAS DE ZONA ════
CREATE TABLE IF NOT EXISTS public.alertas_zona (
  id              TEXT        NOT NULL PRIMARY KEY, -- "alerta_region_cultivo"
  enfermedad      TEXT        NOT NULL,
  cultivo         TEXT        NOT NULL,
  region          TEXT        NOT NULL,
  lat             REAL,
  lon             REAL,
  reportes        INTEGER     NOT NULL DEFAULT 1,
  ultimo_reporte  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alertas_zona ENABLE ROW LEVEL SECURITY;

-- RLS: alertas es público (lectura para autenticados, upsert para cualquiera autenticado)
DROP POLICY IF EXISTS "alertas_zona_read" ON public.alertas_zona;
CREATE POLICY "alertas_zona_read" ON public.alertas_zona
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "alertas_zona_write" ON public.alertas_zona;
CREATE POLICY "alertas_zona_write" ON public.alertas_zona
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "alertas_zona_update" ON public.alertas_zona;
CREATE POLICY "alertas_zona_update" ON public.alertas_zona
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_alertas_region ON public.alertas_zona (region);
CREATE INDEX IF NOT EXISTS idx_alertas_reportes ON public.alertas_zona (reportes DESC);

-- ════ 6. FUNCIÓN: incrementar diagnóstico en zona ════
CREATE OR REPLACE FUNCTION public.incrementar_zona(
  p_region TEXT,
  p_crop TEXT,
  p_enfermedad TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  zona_id TEXT := regexp_replace(p_region || '__' || p_crop, '[^a-zA-Z0-9_]', '_', 'g');
  enf_key TEXT := regexp_replace(COALESCE(p_enfermedad, 'desconocida'), '[^a-zA-Z0-9]', '_', 'g');
BEGIN
  INSERT INTO public.zonas (id, region, crop, total_diagnosticos, enfermedades, ultima_actualizacion)
  VALUES (
    zona_id,
    p_region,
    p_crop,
    1,
    jsonb_build_object(enf_key, 1),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    total_diagnosticos   = public.zonas.total_diagnosticos + 1,
    enfermedades         = jsonb_set(
                             COALESCE(public.zonas.enfermedades, '{}'),
                             ARRAY[enf_key],
                             COALESCE(
                               (public.zonas.enfermedades ->> enf_key)::int,
                               0
                             )::text::jsonb
                           ),
    ultima_actualizacion = now();
END;
$$;

-- ════ 7. FUNCIÓN: incrementar alerta de zona ════
CREATE OR REPLACE FUNCTION public.registrar_alerta_zona(
  p_enfermedad TEXT,
  p_cultivo TEXT,
  p_region TEXT,
  p_lat REAL,
  p_lon REAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  alerta_id TEXT := regexp_replace('alerta_' || p_region || '_' || p_cultivo, '[^a-zA-Z0-9_]', '_', 'g');
BEGIN
  INSERT INTO public.alertas_zona (id, enfermedad, cultivo, region, lat, lon, reportes, ultimo_reporte)
  VALUES (alerta_id, p_enfermedad, p_cultivo, p_region, p_lat, p_lon, 1, now())
  ON CONFLICT (id) DO UPDATE SET
    reportes       = public.alertas_zona.reportes + 1,
    ultimo_reporte = now();
END;
$$;

-- ════ 8. FUNCIÓN: actualizar contador de diagnósticos del usuario ════
CREATE OR REPLACE FUNCTION public.incrementar_diagnosticos_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users
  SET diagnosticos_usados = diagnosticos_usados + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_diagnostico_created ON public.diagnosticos;
CREATE TRIGGER on_diagnostico_created
  AFTER INSERT ON public.diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION public.incrementar_diagnosticos_usuario();
