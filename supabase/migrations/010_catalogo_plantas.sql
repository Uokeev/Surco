-- ─── Migración 010: Catálogo de Plantas de Interior ──────────
-- Fichas técnicas completas para el cuidado de plantas
-- Ejecutar DESPUÉS de 009_plantas_interior.sql

-- ============================================================
-- 1. TABLA: catálogo de plantas (fichas técnicas)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_plantas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,                       -- nombre común en la app
  nombre_cientifico TEXT NOT NULL DEFAULT '',
  origen TEXT DEFAULT '',
  luz TEXT NOT NULL DEFAULT 'brillante'               -- baja, media, brillante, directa
    CHECK (luz IN ('baja', 'media', 'brillante', 'directa')),
  luz_fc_min INT DEFAULT 0,                          -- foot-candles mínimo
  luz_fc_max INT DEFAULT 0,                          -- foot-candles máximo
  riego_trigger TEXT NOT NULL DEFAULT 'seco_tercio'  -- seco_tercio, seco_total, casi_seco
    CHECK (riego_trigger IN ('seco_tercio', 'seco_total', 'casi_seco')),
  riego_profundidad_cm INT DEFAULT 3,                -- profundidad para verificar sequedad
  humedad_min INT DEFAULT 40,                        -- humedad relativa mínima %
  humedad_optima_min INT DEFAULT 50,                 -- humedad óptima mínima %
  humedad_optima_max INT DEFAULT 70,                 -- humedad óptima máxima %
  temp_min REAL DEFAULT 12,                          -- temperatura mínima °C
  temp_optima_min REAL DEFAULT 18,                   -- temperatura óptima mínima °C
  temp_optima_max REAL DEFAULT 27,                   -- temperatura óptima máxima °C
  toxicidad TEXT NOT NULL DEFAULT 'ninguna'           -- ninguna, baja, alta
    CHECK (toxicidad IN ('ninguna', 'baja', 'alta')),
  dificultad TEXT NOT NULL DEFAULT 'facil'            -- facil, media, dificil
    CHECK (dificultad IN ('facil', 'media', 'dificil')),
  crecimiento TEXT NOT NULL DEFAULT 'colgante'        -- colgante, trepador, rastrero, arbustivo, erecto
    CHECK (crecimiento IN ('colgante', 'trepador', 'rastrero', 'arbustivo', 'erecto')),
  descripcion_corta TEXT DEFAULT '',
  descripcion_larga TEXT DEFAULT '',
  consejos_clave TEXT[] DEFAULT '{}',                -- tips importantes
  problemas_comunes TEXT DEFAULT '',                  -- qué suele pasar
  diferenciador TEXT DEFAULT '',                      -- cómo distinguirla de otras similares
  propagacion_metodo TEXT NOT NULL DEFAULT 'agua'     -- agua, sphagnum, sustrato, division
    CHECK (propagacion_metodo IN ('agua', 'sphagnum', 'sustrato', 'division')),
  propagacion_detalle TEXT DEFAULT '',
  propagacion_tiempo_raiz TEXT DEFAULT '2-4 semanas',
  propagacion_dificultad TEXT DEFAULT 'facil'
    CHECK (propagacion_dificultad IN ('facil', 'media', 'dificil')),
  activo BOOLEAN DEFAULT TRUE,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE catalogo_plantas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalogo_plantas_read" ON catalogo_plantas;
CREATE POLICY "catalogo_plantas_read" ON catalogo_plantas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_catalogo_plantas_nombre ON catalogo_plantas (nombre);

-- ============================================================
-- 2. TABLA: plagas y enfermedades (protocolos de tratamiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS plagas_enfermedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nombre_cientifico TEXT DEFAULT '',
  tipo TEXT NOT NULL CHECK (tipo IN ('plaga', 'enfermedad', 'fisiopatia')),
  sintomas TEXT NOT NULL DEFAULT '',
  causa TEXT NOT NULL DEFAULT '',
  identificacion TEXT DEFAULT '',
  factor_critico TEXT DEFAULT '',
  primeros_auxilios TEXT DEFAULT '',
  tratamiento_principal TEXT DEFAULT '',
  tratamiento_frecuencia TEXT DEFAULT '',
  preventivo TEXT DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE plagas_enfermedades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plagas_enfermedades_read" ON plagas_enfermedades;
CREATE POLICY "plagas_enfermedades_read" ON plagas_enfermedades
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. TABLA: relación plagas ↔ plantas
-- ============================================================
CREATE TABLE IF NOT EXISTS plagas_por_planta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planta_id UUID NOT NULL REFERENCES catalogo_plantas(id) ON DELETE CASCADE,
  plaga_id UUID NOT NULL REFERENCES plagas_enfermedades(id) ON DELETE CASCADE,
  UNIQUE (planta_id, plaga_id)
);

ALTER TABLE plagas_por_planta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plagas_por_planta_read" ON plagas_por_planta;
CREATE POLICY "plagas_por_planta_read" ON plagas_por_planta
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. TABLA: alertas estacionales
-- ============================================================
CREATE TABLE IF NOT EXISTS alertas_temporada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temporada TEXT NOT NULL CHECK (temporada IN ('invierno', 'primavera', 'verano', 'otonio')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  acciones TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE alertas_temporada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alertas_temporada_read" ON alertas_temporada;
CREATE POLICY "alertas_temporada_read" ON alertas_temporada
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. INSERTAR FICHAS TÉCNICAS DE LAS 3 NUEVAS ESPECIES
-- ============================================================

-- 5a. Syngonium podophyllum 'Confetti'
INSERT INTO catalogo_plantas (nombre, nombre_cientifico, origen, luz, luz_fc_min, luz_fc_max, riego_trigger, riego_profundidad_cm, humedad_min, humedad_optima_min, humedad_optima_max, temp_min, temp_optima_min, temp_optima_max, toxicidad, dificultad, crecimiento, descripcion_corta, descripcion_larga, consejos_clave, problemas_comunes, diferenciador, propagacion_metodo, propagacion_detalle, propagacion_tiempo_raiz, propagacion_dificultad)
VALUES (
  'Singonio Confetti',
  'Syngonium podophyllum ''Confetti''',
  'Selección hortícola de Syngonium podophyllum, especie hemiepífita nativa de selvas tropicales de América Central y del Sur.',
  'brillante', 800, 3000,
  'seco_tercio', 4,
  50, 50, 70,
  12, 18, 27,
  'alta', 'facil', 'rastrero',
  'Singonio con hojas en forma de punta de flecha salpicadas de manchas rosadas. Perfecto para principiantes.',
  'El Singonio Confetti es una variedad compacta y de crecimiento moderado. Sus hojas jóvenes tienen forma de flecha y al madurar se dividen en 3-5 segmentos. La característica más llamativa son las manchas rosadas irregulares que salpican el haz verde claro. Tolera condiciones de interior pero necesita luz brillante para mantener su variegación rosada. En condiciones de poca luz, las hojas nuevas saldrán completamente verdes.',
  ARRAY['Pierde la variegación rosada si no recibe suficiente luz', 'No tolera el encharcamiento — mejor quedarse corto que pasarse', 'Crece más frondoso si se podan los tallos largos', 'Ideal para terrarios por su amor a la humedad'],
  'Hojas amarillas = exceso de riego. Hojas verdes sin manchas = falta de luz. Hojas con puntas marrones = baja humedad.',
  'Se confunde con Syngonium ''Milk Confetti''. El ''Confetti'' común tiene haz verde claro con manchas rosa y pecíolos de color verde sólido. El ''Milk Confetti'' tiene fondo verde lechoso pálido y la vaina del pecíolo tiene manchas rosadas.',
  'agua',
  'Cortar tallo con 2-3 hojas y al menos un nudo con raíz aérea. Cortar a 45° media pulgada debajo del nudo. Enraizar en agua filtrada o musgo Sphagnum húmedo, asegurando que el nudo esté sumergido pero las hojas queden fuera.',
  '2-4 semanas',
  'facil'
)
ON CONFLICT (nombre) DO NOTHING;

-- 5b. Philodendron hederaceum 'Micans'
INSERT INTO catalogo_plantas (nombre, nombre_cientifico, origen, luz, luz_fc_min, luz_fc_max, riego_trigger, riego_profundidad_cm, humedad_min, humedad_optima_min, humedad_optima_max, temp_min, temp_optima_min, temp_optima_max, toxicidad, dificultad, crecimiento, descripcion_corta, descripcion_larga, consejos_clave, problemas_comunes, diferenciador, propagacion_metodo, propagacion_detalle, propagacion_tiempo_raiz, propagacion_dificultad)
VALUES (
  'Filodendro Micans',
  'Philodendron hederaceum var. hederaceum ''Micans''',
  'Regiones neotropicales húmedas; de hábito epífito y trepador.',
  'brillante', 500, 2500,
  'casi_seco', 5,
  45, 60, 80,
  12, 18, 27,
  'alta', 'media', 'colgante',
  'Filodendro de hojas aterciopeladas con tonos cobrizos y verde oscuro. Una joya para coleccionistas.',
  'El Micans es uno de los filodendros más buscados por su textura aterciopelada única y sus hojas en forma de corazón con iridiscentes tonos cobrizos, bronce y verde oscuro. Es una planta de crecimiento moderado que luce espectacular en macetas colgantes o trepando por un tutor de musgo. Sus hojas pueden alcanzar 10-15 cm de largo en condiciones óptimas.',
  ARRAY['Las hojas aterciopeladas NO deben pulverizarse directamente — retienen agua y se pudren', 'Las pequeñas gotas pegajosas en el envés son nectarios extraflorales (normales), NO plagas', 'Necesita un tutor para que las hojas crezcan más grandes', 'No exponer a temperaturas bajo 12°C'],
  'Tallos largos y hojas pequeñas = falta de luz. Hojas amarillas = exceso de riego. Crecimiento lento en invierno es normal.',
  'Es normal que aparezcan pequeñas gotas pegajosas en el envés de las hojas. Son nectarios extraflorales que segregan azúcares para atraer insectos benéficos. No confundir con plagas a menos que vayan acompañados de deformaciones u hojas amarillentas.',
  'sphagnum',
  'Tomar esqueje con 2 hojas maduras y un nudo con raíz aérea visible. Plantar en maceta pequeña con fibra de coco húmeda y perlita. Cubrir con bolsa plástica transparente (cámara de propagación) para mantener humedad al 90%. Ventilar 5 min cada 3 días. Asegurar que el follaje aterciopelado no toque el plástico húmedo.',
  '3-4 semanas',
  'media'
)
ON CONFLICT (nombre) DO NOTHING;

-- 5c. Epipremnum aureum 'N'Joy'
INSERT INTO catalogo_plantas (nombre, nombre_cientifico, origen, luz, luz_fc_min, luz_fc_max, riego_trigger, riego_profundidad_cm, humedad_min, humedad_optima_min, humedad_optima_max, temp_min, temp_optima_min, temp_optima_max, toxicidad, dificultad, crecimiento, descripcion_corta, descripcion_larga, consejos_clave, problemas_comunes, diferenciador, propagacion_metodo, propagacion_detalle, propagacion_tiempo_raiz, propagacion_dificultad)
VALUES (
  'Potus N''Joy',
  'Epipremnum aureum ''N''Joy''',
  'Cultivar seleccionado del potus común (Epipremnum aureum), nativo del sudeste asiático y las Islas Salomón.',
  'brillante', 1000, 4000,
  'seco_tercio', 4,
  40, 50, 70,
  10, 18, 29,
  'alta', 'media', 'colgante',
  'Potus variegado con manchas blancas y verdes. Más delicado que el potus común pero igual de versátil.',
  'El Potus N''Joy es una variedad compacta de potus con una variegación única en blanco crema y verde. Las áreas blancas no tienen clorofila, por lo que requiere más luz que los potus verdes comunes. Su crecimiento es más lento pero más denso y frondoso. Es ideal para macetas colgantes o para trepar por tutores pequeños.',
  ARRAY['Las partes blancas se queman fácilmente con el sol directo — siempre luz indirecta', 'Las gotas de agua sobre las zonas blancas actúan como lupa y causan manchas marrones', 'Si la planta se vuelve completamente verde, necesita más luz', 'Crece más lento que el potus común — paciencia'],
  'Manchas marrones en zonas blancas = sol directo o agua retenida. Hojas completamente verdes = falta de luz. Crecimiento detenido en invierno es normal.',
  'A diferencia del Potus Común, el N''Joy tiene manchas blancas que NO son salpicaduras sino bloques definidos de color. Es más compacto y de crecimiento más lento.',
  'agua',
  'Cortar segmento de tallo de 10-15 cm con 2-3 nudos. Retirar la hoja del nudo basal para evitar que se pudra en el agua. Colocar en frasco de vidrio oscuro (la oscuridad estimula enraizamiento). Cambiar el agua una vez por semana.',
  '3-4 semanas',
  'media'
)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- 6. INSERTAR PLAGAS Y ENFERMEDADES COMUNES
-- ============================================================

INSERT INTO plagas_enfermedades (nombre, nombre_cientifico, tipo, sintomas, causa, identificacion, factor_critico, primeros_auxilios, tratamiento_frecuencia, preventivo)
VALUES
(
  'Trips',
  'Thysanoptera spp.',
  'plaga',
  'Manchas plateadas o blancas con brillo metálico en hojas, diminutos puntos negros (excrementos), hojas nuevas deformes.',
  'Insectos alargados muy pequeños (1-3 mm) que raspan la superficie foliar y succionan la savia.',
  'Adultos: color negro o marrón. Larvas: amarillo/translúcido. Se mueven rápido al destaparlos.',
  'Lavar las hojas en la ducha para desprender adultos y larvas.',
  'Aplicar Jabón Potásico (10-15 ml/L) + Aceite de Neem (3-5 ml/L) emulsificados. Pulverizar haz y envés al atardecer.',
  'Cada 7 días durante 4 semanas consecutivas.',
  'Usar trampas adhesivas azules para monitoreo temprano. Mantener humedad ambiental arriba del 50%.'
),
(
  'Cochinilla Algodonosa',
  'Pseudococcidae spp.',
  'plaga',
  'Masas blancas algodonosas en envés de hojas, uniones de tallos, pecíolos y nudos. Melaza pegajosa. Debilitamiento general.',
  'Insectos de cuerpo blando cubiertos por capa cerosa blanca que succionan savia.',
  'Masas blancas que parecen algodón. Al aplastarlas dejan mancha anaranjada.',
  'Retirar manualmente con hisopo o paño humedecido en alcohol isopropílico diluido al 50% en agua. Esto elimina adultos y limpia la melaza.',
  'Aplicar Jabón Potásico + Aceite de Neem cada 5-7 días hasta control total. Cubrir bien nudos y envés.',
  'Cada 5-7 días hasta erradicación.',
  'Inspeccionar nudos y envés cada 15 días. Cuarentena para plantas nuevas.'
),
(
  'Arañita Roja',
  'Tetranychus urticae',
  'plaga',
  'Punteado clorótico amarillo muy fino en el haz, aspecto bronceado y opaco, telarañas finas en uniones de tallos y envés.',
  'Ácaros microscópicos (0.2-0.5 mm) que perforan células vegetales y succionan contenido.',
  'Punteado amarillo + telarañas. Sacudir hoja sobre papel blanco — se ven puntos moviéndose.',
  'Aumentar la humedad ambiental inmediatamente (humidificador o ducha). Las arañitas odian la humedad.',
  'Tierra de Diatomeas: diluir 10-15 g/L agua, agitar constantemente, pulverizar cubriendo bien el envés. Efecto comienza al secarse.',
  'Cada 7-10 días hasta erradicar.',
  'Mantener humedad > 60%. Rociar las hojas con agua periódicamente. Aire acondicionado y calefacción son sus aliados.'
),
(
  'Fumagina (Negrilla)',
  'Capnodium spp.',
  'enfermedad',
  'Capa de polvo negro similar al hollín cubriendo la superficie de las hojas.',
  'Hongo no parásito que se alimenta de la melaza azucarada excretada por cochinillas, pulgones y otras plagas.',
  'Polvo negro que se desprende al tacto. NO es el problema real — es síntoma de plagas.',
  'NO atacar el hongo directamente. Primero identificar y tratar la plaga que produce la melaza.',
  'Limpiar el hollín negro con paño de microfibra humedecido en agua con jabón potásico (10 ml/L). Esto devuelve la capacidad fotosintética a la hoja.',
  'Aplicación única de limpieza después de controlar la plaga.',
  'Controlar poblaciones de cochinillas y pulgones antes de que aparezca.'
),
(
  'Pudrición de Raíces',
  'Anoxia por exceso de agua',
  'enfermedad',
  'Hojas inferiores amarillas, tallos blandos, marchitamiento generalizado a pesar de sustrato húmedo. Olor fétido.',
  'Sustrato encharcado, maceta sin drenaje o riego demasiado frecuente. Las raíces se asfixian y proliferan hongos anaeróbicos.',
  'Raíces oscuras, blandas y con mal olor. Sustrato permanentemente mojado.',
  'Extraer la planta, lavar raíces con agua. Cortar con tijeras esterilizadas todas las raíces oscuras, blandas y con mal olor.',
  'Sumergir raíces sanas 5 minutos en agua oxigenada diluida 1:10. Trasplantar a maceta desinfectada con sustrato Aroid Mix NUEVO. Suspender riego hasta nuevos brotes.',
  'Urgente — intervención única.',
  'Usar macetas con múltiples agujeros de drenaje. Sustrato aireado. Verificar humedad antes de regar.'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. RELACIONAR PLAGAS CON PLANTAS
-- ============================================================
-- Singonio Confetti → todas las plagas
INSERT INTO plagas_por_planta (planta_id, plaga_id)
SELECT p.id, pl.id
FROM catalogo_plantas p, plagas_enfermedades pl
WHERE p.nombre = 'Singonio Confetti'
  AND pl.nombre IN ('Trips', 'Cochinilla Algodonosa', 'Arañita Roja', 'Fumagina (Negrilla)', 'Pudrición de Raíces')
ON CONFLICT DO NOTHING;

-- Filodendro Micans → todas las plagas
INSERT INTO plagas_por_planta (planta_id, plaga_id)
SELECT p.id, pl.id
FROM catalogo_plantas p, plagas_enfermedades pl
WHERE p.nombre = 'Filodendro Micans'
  AND pl.nombre IN ('Trips', 'Cochinilla Algodonosa', 'Arañita Roja', 'Fumagina (Negrilla)', 'Pudrición de Raíces')
ON CONFLICT DO NOTHING;

-- Potus N'Joy → todas las plagas
INSERT INTO plagas_por_planta (planta_id, plaga_id)
SELECT p.id, pl.id
FROM catalogo_plantas p, plagas_enfermedades pl
WHERE p.nombre = 'Potus N''Joy'
  AND pl.nombre IN ('Trips', 'Cochinilla Algodonosa', 'Arañita Roja', 'Fumagina (Negrilla)', 'Pudrición de Raíces')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. INSERTAR ALERTAS ESTACIONALES
-- ============================================================

INSERT INTO alertas_temporada (temporada, titulo, mensaje, acciones)
VALUES
(
  'invierno',
  '⚠️ Calefacción = peligro de Arañita Roja',
  '¡Atención! La calefacción reseca el aire en casa y esto debilita a tus plantas. Es el momento perfecto para la Arañita Roja.',
  ARRAY[
    'Alejar las plantas de radiadores y estufas.',
    'NO aumentar el riego (la planta consume menos agua en invierno).',
    'Aumentar humedad ambiental: agrupar plantas, usar humidificador o platos con piedras y agua.',
    'Ventilar la habitación 10 min al día en horas templadas.',
    'Pausar la fertilización por completo.'
  ]
),
(
  'primavera',
  '🌱 ¡Tus plantas despiertan! Es hora de nutrirlas',
  'Tus plantas están saliendo del reposo invernal. Es momento de prepararlas para su temporada de crecimiento activo.',
  ARRAY[
    'Iniciar fertilización mensual con abono líquido para plantas verdes diluido a la mitad de la dosis.',
    'Revisar si las raíces sobresalen de los agujeros de drenaje (señal de trasplante).',
    'Ajustar frecuencia de riego (el sustrato se secará más rápido).',
    'Limpiar el polvo de las hojas una vez por semana con paño húmedo.'
  ]
),
(
  'verano',
  '☀️ Protege tus plantas del sol intenso',
  'El sol de verano puede ser demasiado fuerte incluso para plantas de interior. Las ventanas sin filtro pueden quemar las hojas.',
  ARRAY[
    'Alejar las plantas de ventanas con sol directo en horas pico (12:00-16:00).',
    'Aumentar frecuencia de riego — el sustrato se seca más rápido.',
    'Mantener humedad ambiental con nebulizaciones en horas frescas.',
    'Revisar semanalmente en busca de plagas (el calor acelera su reproducción).'
  ]
),
(
  'otonio',
  '🍂 Prepara tus plantas para el invierno',
  'Los días se acortan y las temperaturas bajan. Tus plantas se preparan para el reposo invernal.',
  ARRAY[
    'Reducir gradualmente la frecuencia de riego.',
    'Dejar de fertilizar a mediados de otoño.',
    'Revisar que no entren corrientes de aire frío por ventanas.',
    'Podar solo lo necesario — guardar podas grandes para primavera.'
  ]
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. FUNCIÓN: obtener plagas de una planta por nombre
-- ============================================================
CREATE OR REPLACE FUNCTION obtener_plagas_por_planta(p_nombre_planta TEXT)
RETURNS TABLE (
  plaga_id UUID,
  plaga_nombre TEXT,
  plaga_tipo TEXT,
  sintomas TEXT,
  tratamiento_principal TEXT,
  frecuencia TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.nombre,
    pe.tipo,
    pe.sintomas,
    pe.tratamiento_principal,
    pe.tratamiento_frecuencia
  FROM plagas_por_planta ppp
  JOIN plagas_enfermedades pe ON pe.id = ppp.plaga_id
  JOIN catalogo_plantas cp ON cp.id = ppp.planta_id
  WHERE cp.nombre = p_nombre_planta
    AND pe.activo = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
