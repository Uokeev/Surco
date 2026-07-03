-- ─── Migración 013: Fix diagnosticos_limite — default 999 → 10 ──
--  1. Cambia el default de la columna
--  2. Corrige usuarios existentes que tienen 999
--  3. Ajusta trigger handle_new_user para que siempre ponga 10

-- ════════════════════════════════════════════════════════════════
-- 1. Cambiar default de la columna
-- ════════════════════════════════════════════════════════════════
ALTER TABLE users
  ALTER COLUMN diagnosticos_limite SET DEFAULT 10;

-- ════════════════════════════════════════════════════════════════
-- 2. Corregir usuarios existentes que heredaron el default 999
-- ════════════════════════════════════════════════════════════════
UPDATE users
SET diagnosticos_limite = 10
WHERE diagnosticos_limite = 999
  AND plan = 'gratuito';

-- ════════════════════════════════════════════════════════════════
-- 3. Recrear el trigger handle_new_user con límite correcto
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, photo, diagnosticos_limite)
  VALUES (
    NEW.id::text,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url',
    10
  )
  ON CONFLICT (id) DO UPDATE SET
    name      = EXCLUDED.name,
    email     = EXCLUDED.email,
    photo     = EXCLUDED.photo,
    last_login = now();
  RETURN NEW;
END;
$$;
