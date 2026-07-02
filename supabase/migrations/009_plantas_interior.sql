-- ─── Migración 009: Plantas de Interior ──────────────────────────
-- Agrega 30 plantas de interior con sus fitopatologías al catálogo SAG.
-- Ejecutar DESPUÉS de haber corrido seed.sql y seed_expanded.sql

-- ═══════════════════════════════════════════════════════════════════
-- 1. Monstera deliciosa (Costilla de Adán)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Monstera (Costilla de Adán)', 'Pudrición radicular', 'Phytophthora spp., Pythium spp.', 'Raíces blandas y oscuras, hojas amarillas, tallos caídos, olor fétido del sustrato', 'Exceso de riego y sustrato compactado que genera anoxia radicular', 'Alta', '{"Oxicloruro de Cobre Anasac", "Fungicida Captan Anasac"}', 'Retirar la planta, eliminar raíces podridas, sumergir en agua oxigenada al 3% (1:3), aplicar canela molida, trasplantar a sustrato nuevo con perlita')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Monstera (Costilla de Adán)', 'Clorosis férrica', 'Bloqueo de hierro (Fe)', 'Hojas jóvenes amarillas con nervaduras verdes, detención del crecimiento', 'Riego continuo con agua dura (pH alto) que precipita el hierro del sustrato', 'Media', '{"Ferrilene (Valagro)", "Hierro quelatado EDDHA"}', 'Regar con agua reposada 48h acidificada con ácido cítrico o vinagre (pH 5.5-6.5)')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Monstera (Costilla de Adán)', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Masas algodonosas blancas en tallos, nudos y envés de hojas, melaza pegajosa, fumagina secundaria', 'Insecto chupador de savia que excreta melaza', 'Alta', '{"Kai Repel Whenua", "Jabón potásico con neem", "Dimetoato Plus Anasac"}', 'Retirar manualmente con alcohol isopropílico al 70%, aplicar jabón potásico cada 5 días por 3 semanas')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Sansevieria trifasciata (Lengua de Suegra)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Sansevieria (Lengua de Suegra)', 'Pudrición blanda del rizoma', 'Phytophthora spp., Erwinia spp.', 'Rizoma blando y acuoso, hojas amarillas que se doblan desde la base, olor desagradable', 'Exceso de humedad crónico y sustrato que no drena', 'Alta', '{"Azufre fungicida Anasac"}', 'Desenterrar, cortar partes podridas, aplicar canela o azufre, dejar secar 4-5 días, replantar en sustrato seco de cactus. Como rescate: cortar hojas sanas en secciones de 8-10cm, dejar cicatrizar y replantar')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Sansevieria (Lengua de Suegra)', 'Cochinilla harinosa de raíz', 'Rhizoecus spp.', 'Insectos blancos algodonosos bajo la superficie del sustrato, hojas que pierden turgencia sin causa aparente', 'Humedad constante que favorece la proliferación subterránea', 'Media', '{"Asedio (NK ProEssence)", "Jabón potásico con Neem Plusagro"}', 'Sumergir sistema radicular en agua con jabón potásico y neem por 20 min para disolver secreción cerosa')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. Ficus lyrata (Gomero Pera)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Ficus lyrata (Gomero Pera)', 'Antracnosis', 'Colletotrichum spp.', 'Manchas grandes marrones oscuro o negras de contorno irregular en centro y bordes de hojas', 'Exceso de humedad combinado con agua estancada en el plato', 'Alta', '{"Oxicloruro de Cobre Anasac", "Fungicida Captan Anasac"}', 'Podar hojas con más de 40% de necrosis, suspender riego, retirar plato inferior, regar con agua atemperada (18-20°C)')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Ficus lyrata (Gomero Pera)', 'Edema celular y caída de hojas', 'Estrés hídrico y térmico', 'Caída de hojas basales, ampollas acuosas en el envés', 'Estrés por corrientes de aire frío/calefacción directa o exceso de riego', 'Media', '{}', 'Ubicar en lugar estable (18-26°C), aumentar humedad pasiva con plato de arlita y agua sin que toque la base')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Ficus lyrata (Gomero Pera)', 'Cochinilla en nudos', 'Planococcus spp.', 'Algodoncillo blanco en uniones de hojas y tallo, melaza pegajosa', 'Insecto chupador', 'Media', '{"Alcohol isopropílico 70°", "Dimetoato Plus Anasac"}', 'Retirar con hisopo de alcohol isopropílico, aplicar insecticida natural')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 4. Epipremnum aureum (Pothos / Potus)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Pothos / Potus', 'Amarillamiento masivo', 'Asfixia radicular', 'Hojas amarillas generalizadas, tallos blandos, raíces marrones', 'Riego excesivo que encharca el sustrato', 'Alta', '{}', 'Suspender riego, propagar esquejes sanos en agua desclorada, desechar cepellón dañado')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Pothos / Potus', 'Arañita roja', 'Tetranychus urticae', 'Punteado amarillo en hojas, telarañas finas en envés, hojas que se secan', 'Ambiente cálido y seco por calefacción', 'Media', '{"Kai Repel Whenua", "Acaricida para arañitas Anasac"}', 'Lavar bajo la ducha, elevar humedad, aplicar acaricida natural cada 5 días')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 5. Zamioculcas zamiifolia (Zamioculca / ZZ)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Zamioculca (ZZ)', 'Pudrición húmeda del rizoma', 'Erwinia spp., Pythium spp.', 'Tallos blandos y caídos, hojas amarillas, rizoma marrón y blando, rizoma marrón y acuoso', 'Riego excesivo en invierno', 'Alta', '{"Azufre mineral Anasac"}', 'Cortar partes podridas, aplicar azufre en cortes, dejar secar rizoma 48h al aire antes de replantar en sustrato seco')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Zamioculca (ZZ)', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Masas blancas en axilas foliares y tallos, melaza', 'Insecto chupador', 'Media', '{"NK ProEssence", "Aceite de neem"}', 'Retirar con algodón humedecido en alcohol isopropílico al 70%, aplicar aceite de neem')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 6. Spathiphyllum spp. (Cuna de Moisés / Lirio de la Paz)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Spathiphyllum (Cuna de Moisés)', 'Necrosis apical química', 'Toxicidad por cloro y flúor', 'Puntas y bordes de hojas secas y negras, necrosis marginal', 'Acumulación de cloro y flúor del agua potable', 'Media', '{}', 'Regar con agua reposada 24-48h para evaporar cloro, o usar agua purificada')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Spathiphyllum (Cuna de Moisés)', 'Marchitez y caída de hojas', 'Deshidratación por baja humedad', 'Hojas caídas y lacias, falta de turgencia', 'Humedad ambiental inferior al 40% o riego insuficiente', 'Alta', '{}', 'Sumergir maceta en agua reposada 30 min hasta que dejen de salir burbujas, nebulizar con agua desclorada')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Spathiphyllum (Cuna de Moisés)', 'Falta de floración', 'Deficiencia de potasio y hierro', 'Ausencia de flores, flores verdes pequeñas, hojas cloróticas', 'Sustrato agotado o falta de nutrientes específicos', 'Baja', '{"Ferrilene (Valagro)"}', 'Enterrar clavos de hierro no galvanizados en bordes de maceta, regar con abono de cáscara de plátano hervida')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 7. Calathea / Maranta / Stromanthe
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Calathea / Maranta', 'Necrosis por sequedad ambiental', 'Estrés hídrico por baja HR', 'Márgenes rizados y bordes marrones crujientes en las hojas', 'Humedad ambiental inferior al 50% por calefacción o clima seco', 'Alta', '{}', 'Usar humidificador ultrasónico, regar con agua destilada o desclorada, agrupar con otras plantas para microclima')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Calathea / Maranta', 'Quemadura química por cloro', 'Toxicidad por halógenos', 'Bordes y puntas secos, necrosis irreversible desde el ápice', 'Acumulación de cloro y flúor del agua de red', 'Alta', '{}', 'Regar solo con agua destilada, desmineralizada o acidificada (pH 5.5-6.0 con ácido cítrico o vinagre)')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Calathea / Maranta', 'Arañita roja', 'Tetranychus urticae', 'Punteado amarillo fino, telarañas bajo las hojas, decoloración', 'Clima seco y cálido que favorece la plaga', 'Alta', '{"Acaricida para arañitas Anasac", "Kai Repel Whenua"}', 'Limpiar hojas con paño húmedo bajo la ducha, aplicar acaricida cada 7 días por 3 semanas en el envés')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 8. Crassula ovata (Árbol de Jade)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Crassula ovata (Árbol de Jade)', 'Pudrición del tallo', 'Erwinia spp., Phytophthora spp.', 'Tallo blando y oscuro, caída de hojas turgentes verdes, base del tallo negra', 'Exceso de riego y sustrato que no drena', 'Alta', '{"Azufre fungicida Anasac"}', 'Suspender riego total en invierno, extraer y cortar partes blandas, desinfectar con azufre, replantar en sustrato seco de cactus')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Crassula ovata (Árbol de Jade)', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Algodón blanco en axilas de hojas y tallos jóvenes, fumagina', 'Insecto chupador', 'Media', '{"Proteus Anasac", "Kai Repel Whenua"}', 'Retirar con hisopo de alcohol isopropílico 70% diluido 1:1, aplicar insecticida al atardecer')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 9. Helecho de Boston (Nephrolepis exaltata)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Helecho de Boston', 'Secado masivo de frondes', 'Baja temperatura', 'Frondes se secan y caen, helecho se vuelve marrón y quebradizo', 'Corrientes de aire seco, calefacción directa o baja humedad', 'Alta', '{}', 'Nebulizar diariamente con agua desclorada, agrupar con otras plantas, humidificador pasivo o ultrasónico')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Helecho de Boston', 'Mosca blanca y trips', 'Trialeurodes vaporariorum, Frankliniella occidentalis', 'Pequeños insectos blancos voladores, manchas plateadas en hojas, amarillamiento', 'Ambiente seco y cálido', 'Media', '{"Jabón Potásico Eco Anasac", "Horoi Protect Whenua", "Trampas cromáticas amarillas Anasac"}', 'Instalar trampas adhesivas amarillas, pulverizar con jabón potásico cada 5 días cubriendo haz y envés')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 10. Maranta leuconeura (Planta de la Oración)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Maranta leuconeura (Planta Oración)', 'Mancha foliar fúngica', 'Alternaria spp., Botrytis cinerea', 'Manchas marrones necróicas de aspecto irregular en hojas', 'Exceso de humedad foliar estancada con mala ventilación', 'Alta', '{"Hongos foliares Eco Opción Anasac", "Fungicida Captan Anasac"}', 'Podar hojas afectadas, suspender pulverizaciones directas, mejorar ventilación, aplicar fungicida')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Maranta leuconeura (Planta Oración)', 'Puntas secas por cloro', 'Toxicidad hídrica', 'Puntas de hojas secas y marrones, bordes enrollados', 'Agua corriente con cloro y sales', 'Media', '{}', 'Regar solo con agua destilada o filtrada reposada 48h')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 11. Peperomia (Cucharita, Caperata)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Peperomia', 'Pudrición de tallo basal', 'Phytophthora spp.', 'Tallo blando y negro en la base, caída de hojas verdes', 'Sustrato encharcado y frío', 'Alta', '{"Azufre fungicida Anasac"}', 'Suspender riego, extraer y cortar partes blandas, desinfectar con canela, trasplantar a maceta de barro con sustrato seco')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Peperomia', 'Oídio', 'Erysiphe spp.', 'Polvo blanquecino en las hojas, aspecto harinoso', 'Alta humedad con nula ventilación', 'Media', '{"Fungicida Oídio Anasac"}', 'Retirar hojas dañadas, mejorar ventilación, aplicar fungicida en haz y envés')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 12. Schefflera arboricola (Cheflera)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Schefflera (Cheflera)', 'Pulgones y fumagina', 'Myzus persicae, Capnodium spp.', 'Pulgones en brotes tiernos, melaza pegajosa, costra negra en las hojas que bloquea la fotosíntesis', 'Insectos chupadores + hongo sobre melaza', 'Alta', '{"Insecticida de Pulgones Anasac", "Dimetoato Plus Anasac", "Fungicida Fumagina Anasac"}', 'Aplicar insecticida al atardecer al aire libre, una vez controlado lavar hojas con agua jabonosa templada para remover fumagina')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 13. Philodendron (Imperial Golden, Paraguayo)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Philodendron', 'Antracnosis', 'Colletotrichum spp.', 'Manchas amarillas y marrones concéntricas en hojas', 'Exceso de humedad con aire estancado', 'Alta', '{"Fungicida para plantas Anasac", "Oxicloruro de Cobre Anasac"}', 'Podar hojas enfermas, aislar planta, aplicar fungicida, usar Trichoderma preventivo en sustrato')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Philodendron', 'Clorosis férrica', 'Bloqueo de Fe', 'Hojas jóvenes amarillas con nervaduras verdes', 'Riego con agua dura que alcaliniza el sustrato', 'Media', '{"Ferrilene (Valagro)"}', 'Aplicar hierro quelatado EDDHA 10-20g/L agua en zona radicular')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Philodendron', 'Trips del brote', 'Frankliniella occidentalis', 'Hojas nuevas deformadas, manchas plateadas, enrollamiento', 'Insecto trips en brotes tiernos', 'Media', '{"Kai Repel Whenua"}', 'Aplicar insecticida cada 15 días preventivamente, limpiar con paño húmedo')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 14. Orquídea Phalaenopsis
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Orquídea Phalaenopsis', 'Pudredión bacteriana de corona', 'Erwinia spp.', 'Corona marrón y acuosa, raíces negras y podridas, olor fétido', 'Agua estancada entre las hojas en la corona', 'Alta', '{"Oxicloruro de Cobre Anasac"}', 'Desmontar, cortar raíces negras con tijeras desinfectadas, rociar agua oxigenada 3% o canela, trasplantar a corteza de pino nueva')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Orquídea Phalaenopsis', 'Cochinilla en flores', 'Pseudococcus spp.', 'Algodón blanco en racimos de flores y varas florales', 'Insecto chupador', 'Alta', '{"Horoi Protect Whenua", "Jabón Potásico Listo Usar Best Garden"}', 'Limpiar con hisopo de alcohol 70°, evitar mojar flores abiertas al aplicar insecticida')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 15. Oxalis triangularis (Trébol Africano)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Trébol Africano (Oxalis)', 'Roya', 'Puccinia spp.', 'Pústulas naranjas brillantes bajo las hojas, manchas en el haz', 'Exceso de humedad foliar y mala circulación de aire', 'Alta', '{"Oxicloruro de Cobre Anasac", "Azufre Fungicida Anasac"}', 'Cortar hojas afectadas desde la base, suspender pulverizaciones, aplicar fungicida')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Trébol Africano (Oxalis)', 'Pudredión de bulbos', 'Fusarium spp.', 'Bulbos blandos, hojas que se caen, mal olor del sustrato', 'Encharcamiento en época de latencia invernal', 'Alta', '{}', 'Suspender riego, desenterrar bulbos, descartar blandos, lavar sanos con agua con cloro, replantar en sustrato seco')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 16. Singonium (Syngonium podophyllum / Singonio Plateado)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Singonio (Syngonium)', 'Trips y arañita roja', 'Franliniella occidentalist, Tetranychus urticae', 'Deformación de hojas nuevas, punteado amarillo, telerañas', 'Sequedad ambiental por calefacción invernal', 'Alta', '{"Kai Repel Whenua", "Insecticida Pulgones Anasac"}', 'Pulverizar cada 5 días por 15 días, limpiar hojas con paño húmedo, propagar esquejes como rescate')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 17. Begonia Rex
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Begonia Rex', 'Oídio y Moho Gris', 'Erysiphe spp., Botrytis cinerea', 'Manchas polvorientas blancas/grises en hojas, pudrición de hojas tiernas', 'Agua estancada en hojas texturizadas sin ventilación', 'Alta', '{"Fungicida Oídio Anasac", "Hongos Foliares Eco Opción Anasac"}', 'Eliminar hojas afectadas y caídas, mejorar ventilación, aplicar fungicida preventivo')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Begonia Rex', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Algodón blanco en uniones de tallos basales', 'Insecto chupador', 'Media', '{"Aceite Springhill Anasac"}', 'Retirar con pincel fino con alcohol+agua, aplicar aceite mineral en dosis mínima para asfixiar ninfas')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 18. Alocasia (Manto de Eva / Oreja de Elefante)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Alocasia (Manto de Eva)', 'Pérdida invernal de hojas', 'Reposo fisiológico por frío', 'Caída de todas las hojas en invierno, la planta parece muerta', 'Temperaturas bajo 10°C, reposo invernal natural', 'Baja', '{}', 'Trasladar a habitación cálida en junio-julio, reducir riego al mínimo, fertilizar solo en primavera cuando rebrote')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Alocasia (Manto de Eva)', 'Cochinilla y arañita roja', 'Pseudococcus spp., Tetranychus urticae', 'Plagas en el envés de hojas grandes, amarillamiento', 'Falta de humedad ambiental', 'Alta', '{"Insectos Chupadores Eco Opción Anasac", "Horoi Protect Whenua"}', 'Limpiar polvo de hojas con paño húmedo, pulverizar envés cada 7 días con insecticida')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 19. Chlorophytum comosum (Cinta / Mala Madre / Lazo de Amor)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Cinta (Mala Madre)', 'Puntas de hojas secas', 'Necrosis por sales y cloro', 'Puntas marrones en las hojas alargadas', 'Acumulación de cloro y sales del agua urbana', 'Baja', '{}', 'Recortar puntas secas en ángulo dejando borde marrón, regar con agua reposada')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Cinta (Mala Madre)', 'Pudredión de raíces', 'Erwinia spp.', 'Raíces blandas y mal olor, hojas amarillas en la vase', 'Encharcamiento por riego excesivo', 'Media', '{}', 'Retirar de maceta, cortar raíces podridas, trasplantar a sustrato con perlita Anasac')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 20. Ficus elastica (Gomero Burgundy)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Ficus elastica (Gomero Burgundy)', 'Caída de hojas por estrés', 'Estrés ambiental', 'Caída de hojas basales verdes, shock por cambio de ubicación', 'Corrientes de aire frío o cambios bruscos de ubicación', 'Media', '{}', 'Evitar mover de sitio, mantener alejado de puertas/ventanas en invierno, limpiar polvo cada 15 días')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Ficus elastica (Gomero Burgundy)', 'Cochinilla en nudos', 'Planococcus spp.', 'Algodón blanco en nudos foliares', 'Insecto chupador', 'Media', '{"Dimetoato Plus Anasac"}', 'Retirar con alcohol isopropílico 70%, aplicar Dimetoato al aire libre como preventivo')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 21. Dypsis lutescens (Palmera Areca)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Palmera Areca', 'Secado de puntas de frondes', 'Baja humedad ambiental', 'Puntas de palmeras secas y marrones', 'Temperatura baja por calefacción o verano seco', 'Media', '{}', 'Rociar con agua desclorada cada 2 días, agrupar con otras plantas, plato con agua + guijarros bajo la maceta')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Palmera Areca', 'Arañita roja', 'Tetranychus urticae', 'Decoloración de frondes, telarañas finas', 'Ambiente seco', 'Media', '{"Acaricida para arañitas Anasac"}', 'Aplicar acaricida en polvo mojable según instrucciones del envase')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 22. Chamaedorea elegants (Nante Bella / Palma de Salón)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Chamaedorea (Palma de Salón)', 'Arañita roja y puntas secas', 'Tetranychus urticae', 'Punteado amarillo, telarañas en frondes, puntas marrones', 'Aire seco de la Región Metropolitana', 'Alta', '{"Kai Repel Whenua", "Aceite Springhill Anasac"}', 'Limpiar con agua tibia jabonosa en ducha, aplicar acaricida en envés, nebulizar constantemente')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 23. Anthurium andreanum (Anturio)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Anturio', 'Mancha foliar bacteriana', 'Xanthomonas spp.', 'Aureolas amarillas húmedas en hojas, manchas acuosas', 'Alta humedad combinada con mala ventilación', 'Alta', '{"Oxicloruro de Cobre Anasac"}', 'Cortar hojas afectadas con tijeras esterilizadas, aplicar fungicida/bactericida cúprico, lavar raíces con bicarbonato si la base está afectada')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Anturio', 'Clorosis por sales', 'Estrés osmótico por sales', 'Quemaduras en raíces, hojas cloradas, puntas secas', 'Acumulación de sales minerales del agua dura', 'Media', '{}', 'Realizar riegos de lavado con abundante agua destilada para arrastrar sales acumuladas')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 24. Aglaonema spp.
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Aglaonema', 'Pudredión de raíces', 'Pityum spp.', 'Raíces podridas, hojas con amarillamiento, tallos blandos en base', 'Sustrato encharcado y frío invernal', 'Alta', '{}', 'Colocar en lugar cálido en invierno, retirar sustrato húmedo, desinfectar raíces con canela, replantar en maceta con drenaje óptimo')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Aglaonema', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Algodón blanco en tallos basales y axilas', 'Insecto chupador', 'Media', '{"Jabón Potásico con Neem Plusagro"}', 'Pulverizar con jabón potásico cada 5 días')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 25. Codiaeum variegatum (Croton)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Croton', 'Caída masiva de hojas', 'Choque térmico', 'Caída de hojas verdes y sanas tras cambio de temperatura', 'Aire acondicionado, calefacción directa o corrientes de aire frío', 'Alta', '{}', 'Ubicar en lugar estable entre 18-24°C, no mover la maceta de sitio, mantener humedad pulverizando con agua desclorada')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Croton', 'Arañita roja', 'Tetranychus urticae', 'Decoloración de hojas, telarañas, hojas que pierden color', 'Ambientes secos', 'Media', '{"Acaritas Acaricida Anasac"}', 'Pulverizar regularmente con agua desclorada, aplicar acaricida cubriendo envés de todas las hojas')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 26. Pilea peperomioides (Planta China del Dinero)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Pilea (Planta del Dinero)', 'Deformación de hojas', 'Exceso de radiación', 'Hojas rizadas y deformadas hacia adentro, color pálido', 'Sol directo de la tarde que quema y deforma', 'Baja', '{}', 'Alejar de ventana luminosa o tamizar luz con cortina fina')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Pilea (Planta del Dinero)', 'Mosquita del sustrato', 'Fungus Gnats (Sciradae)', 'Pequeñas mosquitas negras volando alrededor de la maceta, larvas en suelo húmedo', 'Sustrato constantemente húmedo', 'Media', '{"Tierra de Diatomeas Whenua", "Trampas adhesivas amarillas Anasac"}', 'Dejar secar el sustrato completamente entre riegos, espolvorear Tierra de Diatomeas en superficie, colocar trampas amarillas cerca')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 27. Senecio rowleyanus (Senecio Rosario)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Senecio Rosario', 'Pudrecion de tallos y esferas', 'Erwinia spp.', 'Tallos marrones blandos, esferas que se vuelven acuosas y transparentes', 'Exceso de agua y sustrato no drenante', 'Alta', '{}', 'Cortar guías sanas, dejar secar 48h, replantar esquejes en arena de cuarzo casi seca, humedecer con aspersor solo tras una semana')
ON CONFLICT DO NOTHING;

INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Senecio Rosario', 'Pulgones en puntas', 'Myzus persicae', 'Colonias de pulgones en puntas de tallos en crecimiento', 'Primavera, brotes tiernos', 'Baja', '{"Jabón Potásico con Neem Mohican"}', 'Aplicar jabón potásico listo para usar directamente sobre las colonias')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 28. Tradescantia zebrina (Amor de Hombre)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Tradescantia (Amor de Hombre)', 'Planta hilada y pálida', 'Falta de luz', 'Tallos delgados, largos y débiles, hojas muy distanciadas, color lavado', 'Iluminación insuficiente', 'Baja', '{}', 'Trasladar a ventana muy iluminada sin sol directo, podar tallos débiles desde la base, introducir esquejes en el mismo macetero para mayor densidad')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 29. Dieffenbachia amoena (Amoena)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Dieffenbachia (Amoena)', 'Tallos blandos y hojas amarillas', 'Erwinia spp. por frío+exceso agua', 'Tallos basales blandos, hojas inferiores amarillas, caída', 'Riego excesivo combinado con frío invernal', 'Alta', '{"Insecticida Chupadores Eco Opción Anasac"}', 'Trasladar a rincón cálido alejado de corrientes de aire, suspender riegos en invierno, limpiar hojas con paño húmedo jabonoso')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 30. Aspidistra elatior (Aspidistra / Planta de Hierro)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Aspidistra (Planta de Hierro)', 'Manchas marrones por sol', 'Quemadura solar', 'Manchas marrones secas en hojas', 'Exposición a luz solar directa', 'Baja', '{}', 'Mantener en sombra o semisombra, alejada de ventanas con sol directo')
ON CONFLICT DO NOTHING;

INSERT INTO ENFERMEDADES_SAG (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar) VALUES
('Aspidistra (Planta de Hierro)', 'Conchuela y cochinilla', 'Diaspis boisduvali, Pseudococcus spp.', 'Insectos de caparazón duro en pecíolos basales, melaza', 'Poca ventilación', 'Media', '{"Aceite Springhill Anasac"}', 'Limpiar con cepillo suave humedecido en agua jabonosa con alcohol 70°, aplicar aceite mineral para asfixiar larvas')
ON CONFLICT DO NOTHING;