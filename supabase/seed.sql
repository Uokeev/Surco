-- ────────────────────────────────────────────────────────
-- seed.sql — Datos de ejemplo para enfermedades SAG
-- Idempotente: usa ON CONFLICT DO NOTHING
-- ────────────────────────────────────────────────────────

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
-- Tomate
('Tomate', 'Oídio del tomate', 'Leveillula taurica', 'Manchas amarillas en hojas superiores que luego se cubren de polvo blanco. Las hojas se enrollan y caen prematuramente.', 'Hongo favorecido por alta humedad (60-80%) y temperaturas entre 15-25°C. Mala ventilación del invernadero.', 'Media', ARRAY['Azufre micronizado (2-3 kg/ha)', 'Penconazol 10% (0.3 L/ha)', 'Triadimenol 25% (0.5 L/ha)'], 'Azufre en polvo espolvoreado cada 7 días. Bicarbonato de sodio 5g/L + jabón potásico.'),
('Tomate', 'Tizón tardío', 'Phytophthora infestans', 'Manchas acuosas verde-oscuras en hojas y tallos, con margen pálido. En frutos aparecen manchas marrones firmes. Moho blanco en envés en alta humedad.', 'Hongo oomiceto favorecido por lluvias frecuentes, temperaturas 10-20°C y alta humedad nocturna.', 'Alta', ARRAY['Metalaxil-M + Mancozeb (2.5 kg/ha)', 'Dimetomorf (1 L/ha)', 'Cimoxanil + Famoxadona (0.4 kg/ha)'], 'No recomendado para huerto casero. Eliminar plantas afectadas y mejorar drenaje.'),
('Tomate', 'Mosquita blanca', 'Trialeurodes vaporariorum', 'Pequeños insectos blancos en el envés de las hojas. Las hojas se ponen pegajosas (mielecilla) y aparece fumagina negra. Debilidad general.', 'Insecto que prolifera en temperaturas cálidas (>25°C). Se refugia en malezas cercanas.', 'Media', ARRAY['Imidacloprid 35% (0.5 L/ha)', 'Buprofezin 25% (1 L/ha)', 'Beauveria bassiana (2 kg/ha)'], 'Trampas pegajosas amarillas. Jabón potásico 20ml/L cada 3 días durante 2 semanas.'),

-- Lechuga
('Lechuga', 'Mildiú velloso', 'Bremia lactucae', 'Manchas verde pálido a amarillas en hojas, limitadas por nervaduras. En el envés aparece un moho blanco-grisáceo. Las hojas se necrosan.', 'Hongo favorecido por temperaturas 10-20°C, alta humedad relativa (>85%) y rocío nocturno.', 'Media', ARRAY['Fosetil-Al (3 L/ha)', 'Metalaxil-M (1 L/ha)', 'Cobre oxicloruro (3 kg/ha)'], 'Caldo bordelés 10g/L cada 7 días. Espaciar riego y evitar mojar hojas.'),

-- Vid / Uva
('Vid / Uva', 'Oídio de la vid', 'Erysiphe necator', 'Polvo blanco-grisáceo en hojas, brotes y racimos. Los racimos infectados jóvenes se deforman y parten. Las bayas agrietadas.', 'Hongo que ataca con temperaturas 20-30°C y humedad moderada. No requiere agua libre para germinar.', 'Alta', ARRAY['Azufre mojable (3 kg/ha)', 'Miclobutanil (0.3 L/ha)', 'Triadimefon (0.5 L/ha)'], 'Azufre en polvo cada 10 días. Infusión de cola de caballo (Equisetum) al 10%.'),

('Vid / Uva', 'Botritis', 'Botrytis cinerea', 'Moho gris-oscuro en racimos, bayas acuosas y arrugadas. En hojas: manchas necróticas con anillos concéntricos. Olor a humedad.', 'Hongo que entra por heridas. Favorecido por lluvias en floración/envero, racimos compactos y baja ventilación.', 'Alta', ARRAY['Fenhexamida (1.5 L/ha)', 'Ciprodinil + Fludioxonil (1.2 kg/ha)', 'Boscalida (0.8 kg/ha)'], 'Eliminar racimos dañados. Ventilar parronales. No mojar flores.'),

-- Aguacate / Palto
('Palto / Aguacate', 'Tristeza del palto (Phytophthora)', 'Phytophthora cinnamomi', 'Hojas pequeñas, pálidas y caída prematura. Ramas delgadas con entrenudos cortos. Raíces negras y quebradizas. Árbol decae lentamente.', 'Hongo del suelo favorecido por mal drenaje y exceso de riego. Ataca raíces finas impidiendo absorción.', 'Alta', ARRAY['Fosetil-Al (5 L/ha en drench)', 'Metalaxil-M (2 L/ha en drench)', 'Ácido fosforoso (3 L/ha foliar)'], 'Mejorar drenaje. Ácido fosforoso 3ml/L al follaje y suelo cada 30 días. No encharcar.'),

('Palto / Aguacate', 'Trips del palto', 'Heliothrips haemorrhoidalis', 'Raspado y bronceado de hojas jóvenes. Manchas plateadas con puntos negros (excrementos). Hojas se deforman y caen.', 'Insecto favorecido por clima cálido-seco. Se esconde en grietas de corteza.', 'Media', ARRAY['Spinosad (0.5 L/ha)', 'Abamectina (0.6 L/ha)', 'Aceite mineral parafínico (10 L/ha)'], 'Aceite de neem 5ml/L cada 15 días. Lavar hojas con agua jabonosa.'),

-- Frutilla
('Frutilla', 'Oídio de la frutilla', 'Podosphaera aphanis', 'Polvo blanco en hojas y frutos. Hojas se enrollan hacia arriba. Frutos pequeños y cubiertos de moho blanco. Sabor desagradable.', 'Hongo favorecido por temperatura 20-25°C y alta humedad nocturna. Aireación deficiente.', 'Media', ARRAY['Azufre micronizado (2 kg/ha)', 'Penconazol (0.3 L/ha)', 'Bupirimate (0.6 L/ha)'], 'Azufre en polvo cada 7 días. Leche diluida 1:10 cada 5 días.'),

('Frutilla', 'Podredumbre gris', 'Botrytis cinerea', 'Moho gris-oscuro en frutos y flores. Frutos se ponen blandos y acuosos. Manchas marrones en hojas.', 'Hongo que ataca en floración y fructificación. Favorecido por lluvias y humedad (>80%). Frutos en contacto con suelo.', 'Alta', ARRAY['Fenhexamida (1.5 L/ha)', 'Ciprodinil + Fludioxonil (1.2 kg/ha)', 'Bacillus amyloliquefaciens (3 L/ha)'], 'Mulch de paja para evitar contacto fruto-suelo. Ventilar. Infusión de ajo 50g/L.'),

-- Maíz
('Maíz', 'Tizón foliar del maíz', 'Exserohilum turcicum', 'Lesiones elípticas grande de color marrón-grisáceo en hojas inferiores. Avanza hacia arriba. Pérdida de área fotosintética.', 'Hongo favorecido por temperatura 20-25°C, alta humedad y siembra continua de maíz.', 'Media', ARRAY['Azoxistrobina (0.6 L/ha)', 'Propiconazol (0.5 L/ha)', 'Trifloxistrobina + Ciproconazol (0.8 L/ha)'], 'Rotación de cultivos. Eliminar rastrojo infectado.')
ON CONFLICT DO NOTHING;
