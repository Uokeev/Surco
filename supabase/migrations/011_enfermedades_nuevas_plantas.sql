-- ─── Migración 011: Enfermedades SAG para nuevas plantas de interior ──
-- Syngonium Confetti, Philodendron Micans, Pothos N'Joy
-- Idempotente: usa ON CONFLICT DO NOTHING

-- ═══ Syngonium Confetti ═══
INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Singonio Confetti', 'Pudrición de raíces por exceso de riego', 'Phytophthora spp., Pythium spp.', 'Hojas inferiores amarillas, tallos blandos y marchitamiento generalizado a pesar de que el sustrato está húmedo. Raíces oscuras y blandas con mal olor.', 'Sustrato encharcado, maceta sin drenaje o riego demasiado frecuente. Las raíces se asfixian por anoxia.', 'Alta', ARRAY['Oxicloruro de Cobre Anasac', 'Fungicida Captan Anasac'], 'Extraer la planta, lavar raíces, cortar todas las raíces podridas con tijeras esterilizadas. Sumergir raíces sanas 5 min en agua oxigenada 1:10. Trasplantar a sustrato Aroid Mix nuevo. Suspender riego hasta nuevos brotes.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Singonio Confetti', 'Pérdida de variegación rosada', 'Déficit de luz', 'Hojas nuevas completamente verdes sin las manchas rosadas características. La planta se vuelve toda verde.', 'Iluminación insuficiente. La planta produce más clorofila y deja de expresar la variegación rosada para sobrevivir.', 'Media', ARRAY['Fertilizante para plantas variegadas'], 'Trasladar a un lugar con luz brillante indirecta (800-3000 fc). Podar las hojas completamente verdes para estimular crecimiento nuevo con variegación.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Singonio Confetti', 'Trips del singonio', 'Thysanoptera spp.', 'Manchas plateadas o blancas con brillo metálico en hojas, diminutos puntos negros, hojas nuevas deformes.', 'Insectos alargados de 1-3 mm que raspan la superficie foliar y succionan la savia. Favorecidos por ambiente seco.', 'Media', ARRAY['Spinosad (0.5 L/ha)', 'Beauveria bassiana (2 kg/ha)'], 'Lavar hojas en la ducha. Aplicar Jabón Potásico (10-15 ml/L) + Aceite de Neem (3-5 ml/L) cada 7 días. Usar trampas adhesivas azules.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Singonio Confetti', 'Cochinilla algodonosa', 'Pseudococcus spp.', 'Masas blancas algodonosas en tallos, nudos y envés de hojas. Melaza pegajosa y fumagina secundaria.', 'Insecto chupador de savia que excreta melaza. Favorecido por ambientes cálidos.', 'Alta', ARRAY['Jabón potásico con neem', 'Dimetoato Plus Anasac'], 'Retirar manualmente con alcohol isopropílico al 70% diluido 1:1. Aplicar jabón potásico cada 5 días por 3 semanas.')
ON CONFLICT DO NOTHING;

-- ═══ Philodendron Micans ═══
INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Filodendro Micans', 'Pudrición de raíces del Micans', 'Phytophthora spp., Pythium spp.', 'Hojas amarillas, tallos blandos, marchitamiento con sustrato húmedo. Las hojas aterciopeladas pierden su color cobrizo.', 'Sustrato encharcado que asfixia las raíces. El Micans es muy sensible al exceso de agua.', 'Alta', ARRAY['Oxicloruro de Cobre Anasac', 'Fungicida Captan Anasac'], 'Extraer y lavar raíces. Cortar raíces podridas. Sumergir en agua oxigenada diluida 1:10 por 5 min. Trasplantar a sustrato Aroid Mix. NO regar hasta que aparezcan nuevos brotes.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Filodendro Micans', 'Crecimiento desgarbado y hojas pequeñas', 'Déficit de luz', 'Tallos largos con mucho espacio entre hojas, hojas nuevas muy pequeñas (menos de 5 cm), pérdida del color cobrizo.', 'Iluminación insuficiente. La planta se estira buscando luz y las hojas se vuelven más verdes y pequeñas.', 'Media', ARRAY['Fertilizante líquido para plantas verdes'], 'Trasladar a luz brillante indirecta. Podar los tallos más largos para estimular crecimiento compacto. No esperar hojas grandes sin un tutor.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Filodendro Micans', 'Arañita roja del Micans', 'Tetranychus urticae', 'Punteado amarillo fino en el haz de las hojas aterciopeladas, telarañas finas en uniones, aspecto opaco y bronceado.', 'Ácaros microscópicos favorecidos por aire seco de calefacción o aire acondicionado. El Micans es muy susceptible.', 'Alta', ARRAY['Acaricida para arañitas Anasac', 'Kai Repel Whenua'], 'Aumentar humedad ambiental URGENTE. Aplicar Tierra de Diatomeas 10-15 g/L cada 7-10 días. NO pulverizar las hojas directamente — mantener humedad ambiental con humidificador.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Filodendro Micans', 'Cochinilla algodonosa en Micans', 'Pseudococcus spp.', 'Masas algodonosas blancas en axilas de hojas y nudos. Melaza pegajosa. Hojas amarillentas.', 'Insecto chupador que ataca cuando la planta está debilitada por estrés.', 'Media', ARRAY['Jabón Potásico con Neem Plusagro', 'Alcohol isopropílico 70°'], 'Retirar con hisopo de alcohol isopropílico diluido 1:1. Aplicar Jabón Potásico + Neem cada 5-7 días. Revisar axilas de todas las hojas.')
ON CONFLICT DO NOTHING;

-- ═══ Pothos N'Joy ═══
INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Potus N''Joy', 'Manchas marrones en zonas blancas', 'Quemadura por sol o daño por humedad', 'Manchas marrones secas exclusivamente en las partes blancas (variegas) de las hojas. Las zonas verdes permanecen sanas.', 'Las áreas blancas no tienen clorofila para protegerse del sol directo. También ocurre por gotas de agua que actúan como lupa sobre las zonas blancas.', 'Alta', ARRAY['Fertilizante para plantas variegadas'], 'Alejar de ventanas con sol directo. NO pulverizar las hojas — limpiar el polvo con paño ligeramente húmedo. Podar hojas con más del 50% dañado.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Potus N''Joy', 'Pérdida de variegación (reversión)', 'Déficit de luz', 'La planta produce hojas completamente verdes. Las nuevas hojas no tienen blanco. La planta se vuelve un potus común.', 'Iluminación insuficiente. Las áreas blancas no fotosintetizan, por lo que en sombra la planta prioriza hojas verdes para sobrevivir.', 'Media', ARRAY['Fertilizante para plantas variegadas'], 'Trasladar a luz brillante indirecta (1000-4000 fc). Podar las hojas completamente verdes para estimular crecimiento variegado. La reversión es progresiva.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Potus N''Joy', 'Pudrición de raíces del Potus N''Joy', 'Erwinia spp., Pythium spp.', 'Hojas amarillas, tallos blandos y acuosos, raíces marrones y mal olor. Es la principal causa de muerte de esta planta.', 'Riego excesivo. El N''Joy es más sensible al encharcamiento que el potus común.', 'Alta', ARRAY['Oxicloruro de Cobre Anasac'], 'Extraer, cortar raíces podridas, desinfectar con agua oxigenada 1:10, trasplantar a sustrato Aroid Mix con buen drenaje. Regar solo cuando el primer tercio esté seco.')
ON CONFLICT DO NOTHING;

INSERT INTO public.enfermedades_sag (cultivo, nombre, nombre_cientifico, sintomas, causa, urgencia, productos_certificados_sag, alternativa_hogar)
VALUES
('Potus N''Joy', 'Crecimiento muy lento o detenido', 'Baja luminosidad o invierno', 'La planta no produce nuevas hojas por semanas o meses. Las hojas existentes se mantienen sanas pero no hay crecimiento.', 'En invierno es normal (reposo vegetativo). Si es primavera/verano, la causa es falta de luz. El N''Joy crece más lento que el potus común.', 'Baja', ARRAY['Fertilizante líquido para plantas verdes'], 'En invierno: no preocuparse, es normal. En primavera/verano: trasladar a más luz. Fertilizar mensual en temporada de crecimiento. Paciencia — su metabolismo es lento.')
ON CONFLICT DO NOTHING;
