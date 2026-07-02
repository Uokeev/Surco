-- ─── Migración 005: Tipo de terreno flexible ──
--  1. Agrega columna tipo_terreno (parcela / huerto / invernadero)
--  2. Agrega columnas terreno_size + terreno_unidad
--  3. Recrea la vista resumen_club_surco con los nuevos campos
--  4. Actualiza la función verificar_nivel_oro (datos_parcela_completos sigue siendo el flag)

-- ============================================================
-- 1. Nuevas columnas en users
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tipo_terreno TEXT
    CHECK (tipo_terreno IN ('parcela', 'huerto', 'invernadero'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terreno_size NUMERIC(10,2);   -- tamaño en la unidad indicada

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terreno_unidad TEXT
    DEFAULT 'hectareas'
    CHECK (terreno_unidad IN ('hectareas', 'm2'));

-- ============================================================
-- 2. Recrear vista con los nuevos campos
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
  u.semillas_acumuladas AS semillas_totales,
  -- Verificar si cumple Oro
  CASE WHEN
    (u.rut_verificado = TRUE OR u.telefono_verificado = TRUE)
    AND (SELECT COUNT(*) FROM diagnosticos d WHERE d.user_id = u.id) >= 10
    AND u.semillas_acumuladas >= 2000
    AND u.datos_parcela_completos = TRUE
  THEN TRUE ELSE FALSE END AS puede_ser_oro
FROM users u
LEFT JOIN rachas_usuario r ON r.user_id = u.id::uuid;

COMMENT ON VIEW resumen_club_surco IS 'Resumen de gamificación Club Surco por usuario';
