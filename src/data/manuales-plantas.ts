// ─── Fichas técnicas de plantas para RAG exprés ─────────────────────
// Cada manual es texto plano estructurado para inyectar directamente
// al prompt del Worker de IA como contexto estricto.

export interface ManualPlanta {
  nombre: string;
  nombreCientifico: string;
  /** Texto plano listo para inyectar al prompt */
  textoManual: string;
}

export const MANUALES_PLANTAS: Record<string, ManualPlanta> = {
  "Singonio Confetti": {
    nombre: "Singonio Confetti",
    nombreCientifico: "Syngonium podophyllum 'Confetti'",
    textoManual: `FICHA TÉCNICA — Syngonium podophyllum 'Confetti' (Singonio Confetti)
ORIGEN: Selvas tropicales de América Central y del Sur.
TIPO: Planta de interior trepadora / colgante.

RIEGO: Moderado. Regar cuando el tercio superior de la tierra esté seco (meter dedo). Cada 5-7 días en crecimiento, cada 10-14 días en invierno. Evitar encharcamiento — las raíces se pudren fácilmente. Usar agua a temperatura ambiente, sin cloro (dejar reposar 24h).

LUZ: Luz brillante indirecta (200-500 FC). TOLERA luz media (100-200 FC). Pierde el variegado (manchas rosadas) si recibe poca luz. NO tolerar sol directo — las hojas se queman.

HUMEDAD: Alta (60-80%). En interiores secos: agrupar con otras plantas, usar bandeja con guijarros y agua, o humidificador. Las puntas marrones indican humedad baja.

SUSTRATO: Mezcla aireada: 50% turba, 30% perlita, 20% corteza de pino. Drenaje excelente obligatorio. Maceta con agujeros.

TEMPERATURA: 18-28°C ideal. Mínimo 15°C. CORRIENTES DE AIRE FRÍO dañan la planta. No dejar cerca de ventanas en invierno ni cerca de aire acondicionado.

FERTILIZACIÓN: Cada 15-30 días en primavera-verano con fertilizante líquido balanceado (NPK 10-10-10) a media dosis. Suspender en invierno.

PODA: Podar tallos largos para promover densidad. Las esquejes enraízan fácilmente en agua (2-3 semanas).

PLAGAS COMUNES: Pulgones (áfidos), cochinilla algodonosa, araña roja (ácaros). Tratar con jabón potásico o aceite de neem. El exceso de riego atrae hongos en raíces.

TOXICIDAD: Alta — contiene cristales de oxalato de calcio. Tóxico para mascotas y humanos si se ingiere (irritación oral, vómitos). Mantener fuera del alcance.

HOJAS AMARILLAS: Causa #1: exceso de riego. Causa #2: falta de luz. Causa #3: fertilización excesiva.
HOJAS MARRONES EN PUNTAS: Humedad ambiental demasiado baja o acumulación de sales por fertilizante.
HOJAS PEQUEÑAS SIN VARIEGADO: Poca luz.
TALLOS LARGOS Y HOJAS SEPARADAS: Necesita más luz o poda de formación.`,
  },

  "Filodendro Micans": {
    nombre: "Filodendro Micans",
    nombreCientifico: "Philodendron hederaceum var. micans (sin. Philodendron micans)",
    textoManual: `FICHA TÉCNICA — Philodendron hederaceum var. micans (Filodendro Micans)
ORIGEN: Selvas tropicales de México y Centroamérica, crece como epífita trepando árboles.
TIPO: Planta de interior colgante / trepadora. Hojas aterciopeladas de color verde cobrizo.

RIEGO: Moderado. Regar cuando la capa superficial de 2-3 cm esté seca. Cada 5-7 días en crecimiento activo, cada 10-12 días en invierno. El Micans es más tolerante a sequía ligera que al exceso de agua. Hojas caídas y lacias = sed; hojas amarillas y tierra mojada = exceso de riego.

LUZ: Luz brillante INDIRECTA (300-500 FC). Tolera luz media (100-200 FC) pero pierde el color cobrizo característico. LUZ DIRECTA quema las hojas dejando marcas marrones. El color cobrizo intenso es señal de luz adecuada.

HUMEDAD: Alta (70-85%). Es la planta más sensible a humedad baja de las tres. En interiores: humidificador es ideal. Las hojas nuevas deformes o con bordes marrones indican humedad insuficiente. Pulverizar solo con agua destilada (el agua dura deja manchas en las hojas aterciopeladas). NO pulverizar en exceso para evitar hongos.

SUSTRATO: Mezcla muy aireada: 30% turba, 30% perlita, 30% corteza de orquídea, 10% carbón activado. Necesita oxígeno en raíces. Maceta con drenaje y agujeros laterales ideal.

TEMPERATURA: 20-30°C ideal. Mínimo 15°C. MUY SENSIBLE al frío. No colocar cerca de puertas exteriores, ventanas mal selladas o salidas de aire acondicionado.

FERTILIZACIÓN: Cada 2-4 semanas en primavera-verano con fertilizante líquido rico en nitrógeno (NPK 20-10-10 o similar) a 1/4 de dosis. NO fertilizar en invierno ni en sustrato seco (quema raíces).

PODA: Podar tallos largos para estimular crecimiento denso. Esquejes enraízan en agua (1-2 semanas).

PLAGAS COMUNES: Araña roja (ácaros) — MUY PROPENSA en ambientes secos. Tratamiento: limpiar hojas con jabón potásico, aumentar humedad. También trips y cochinilla. Revisar envés de hojas regularmente.

TOXICIDAD: Alta — cristales de oxalato de calcio. Tóxico para mascotas y niños.

HOJAS AMARILLAS CON MANCHAS MARRONES: Exceso de riego.
HOJAS ENROLLADAS O CRESPAS: Humedad muy baja o ácaros.
HOJAS VERDES SIN TONO COBRIZO: Poca luz.
HOJAS PEQUEÑAS: Falta de fertilizante o luz.
MANCHAS MARRONES SECAS: Sol directo o fertilizante excesivo.`,
  },

  "Potus N'Joy": {
    nombre: "Potus N'Joy",
    nombreCientifico: "Epipremnum aureum 'N'Joy'",
    textoManual: `FICHA TÉCNICA — Epipremnum aureum 'N'Joy' (Potus N'Joy, Poto N'Joy)
ORIGEN: Islas Salomón, Polinesia Francesa. Cultivar seleccionado por su variegado blanco-crema.
TIPO: Planta de interior colgante / trepadora. Crecimiento moderado. Hojas con manchas blancas y verdes.

RIEGO: Escaso a moderado. MUY TOLERANTE a sequía. Regar SOLO cuando toda la maceta esté seca (verificar con palillo o dedo a 5 cm de profundidad). Cada 7-10 días en crecimiento, cada 14-21 días en invierno. Es la más resistente al olvido de riego de las tres. El exceso de agua es su peor enemigo — causa pudrición de raíz.

LUZ: Luz brillante INDIRECTA (200-400 FC). TOLERA LUZ BAJA (50-100 FC) pero PIERDE EL VARIEGADO (las hojas nuevas salen completamente verdes). Para mantener las manchas blancas: necesita buena luz. Luz directa suave de mañana o atardecer tolerable pocas horas. Luz directa intensa quema las partes blancas porque no tienen clorofila.

HUMEDAD: Moderada (40-60%). Tolera ambientes secos mucho mejor que las otras dos. En humedad muy baja (<30%) las puntas blancas se vuelven marrones.

SUSTRATO: Universal con buen drenaje: 60% turba, 20% perlita, 20% vermiculita. NO compactado. Maceta con agujeros obligatorio.

TEMPERATURA: 18-30°C ideal. Soporta hasta 10°C por períodos cortos. Es la más tolerante al frío de las tres.

FERTILIZACIÓN: Cada 4-6 semanas en primavera-verano con fertilizante líquido balanceado (NPK 10-10-10 o 20-20-20) a media dosis. MUY PROPENSO a quemadura por fertilizante — menos es más. Suspender en invierno.

PODA: Podar tallos largos para densidad. Enraíza en agua fácilmente (1 semana).

PLAGAS COMUNES: Cochinilla algodonosa (aparece en axilas de hojas), pulgones, trips. Tratar con jabón potásico o alcohol al 70% con cotonete. Las partes blancas dañadas no se recuperan.

TOXICIDAD: Alta — cristales de oxalato de calcio. Tóxico para mascotas (perros, gatos) si se ingiere.

VARIEGADO BLANCO PERDIÉNDOSE: Necesita más luz.
HOJAS AMARILLAS GENERALIZADAS: Exceso de riego (#1 causa de muerte).
BORDES MARRONES EN PARTES BLANCAS: Estrés por luz directa o baja humedad.
HOJAS CAÍDAS Y BLANDAS: Exceso de agua. Revisar raíces (podridas = olor, marrones, babosas).
CRECIMIENTO LENTO O NULO: Falta de luz o de fertilizante.
PUNTAS MARRONES EN HOJAS NUEVAS: Humedad baja o fluctuaciones de temperatura.
MANCHAS NEGRAS EN TALLOS: Hongo por exceso de humedad ambiente. Mejorar ventilación.`,
  },
};

/** Busca el manual de una planta por nombre (case-insensitive, fuzzy) */
export function buscarManual(nombrePlanta: string): ManualPlanta | null {
  const normalizado = nombrePlanta.trim().toLowerCase();

  // Búsqueda exacta primero
  const exacto = Object.values(MANUALES_PLANTAS).find(
    (m) => m.nombre.toLowerCase() === normalizado
  );
  if (exacto) return exacto;

  // Búsqueda parcial: si el nombre contiene parte del manual o viceversa
  const parcial = Object.values(MANUALES_PLANTAS).find(
    (m) =>
      normalizado.includes(m.nombre.toLowerCase()) ||
      m.nombre.toLowerCase().includes(normalizado) ||
      m.nombreCientifico.toLowerCase().includes(normalizado)
  );
  if (parcial) return parcial;

  return null;
}
