// ─── Constantes compartidas de la aplicación Surco ─────────────────

/** Todos los cultivos soportados, organizados por categoría */
export const CULTIVOS_POR_CATEGORIA: Record<string, string[]> = {
  Hortalizas: [
    "Tomate", "Lechuga", "Papa", "Pepino", "Pimiento", "Zapallo",
    "Brócoli / Repollo", "Maíz",
  ],
  "Frutales": [
    "Manzana", "Peral", "Cerezo", "Duraznero", "Ciruelo",
    "Palto / Aguacate", "Arándano", "Frutilla", "Nogal",
    "Vid / Uva", "Naranjo / Limón",
  ],
  "Cereales": ["Trigo"],
  "Plantas de interior": [
    "Monstera (Costilla de Adán)",
    "Sansevieria (Lengua de Suegra)",
    "Ficus lyrata (Gomero Pera)",
    "Pothos / Potus",
    "Zamioculca (ZZ)",
    "Spathiphyllum (Cuna de Moisés)",
    "Calathea / Maranta",
    "Crassula ovata (Árbol de Jade)",
    "Helecho de Boston",
    "Maranta leuconeura (Planta Oración)",
    "Peperomia",
    "Schefflera (Cheflera)",
    "Philodendron",
    "Orquídea Phalaenopsis",
    "Trébol Africano (Oxalis)",
    "Singonio (Syngonium)",
    "Begonia Rex",
    "Alocasia (Manto de Eva)",
    "Cinta (Mala Madre)",
    "Ficus elastica (Gomero Burgundy)",
    "Palmera Areca",
    "Chamaedorea (Palma de Salón)",
    "Anturio",
    "Aglaonema",
    "Croton",
    "Pilea (Planta del Dinero)",
    "Senecio Rosario",
    "Tradescantia (Amor de Hombre)",
    "Dieffenbachia (Amoena)",
    "Aspidistra (Planta de Hierro)",
    "Singonio Confetti",
    "Filodendro Micans",
    "Potus N'Joy",
  ],
  Otros: ["Planta ornamental", "Otro"],
};

/** Lista plana de todos los cultivos (para select simple) */
export const CULTIVOS: string[] = Object.values(CULTIVOS_POR_CATEGORIA).flat();

/** Regiones soportadas */
export const REGIONES = [
  "Región del Maule", "Región del Biobío", "Región de O'Higgins",
  "Región de Valparaíso", "Región Metropolitana", "Región de La Araucanía",
  "Región de Los Lagos", "Otra región",
];

/** Tipos de terreno para perfil */
export const TIPOS_TERRENO = [
  { value: "parcela", label: "Parcela", icon: "parcela", desc: "Terreno extenso para cultivo" },
  { value: "huerto", label: "Huerto", icon: "huerto", desc: "Jardín o espacio pequeño de cultivo" },
  { value: "invernadero", label: "Invernadero", icon: "invernadero", desc: "Estructura techada para cultivo controlado" },
] as const;

// ─── Niveles de luz para plantas de interior ──────────────
export const NIVELES_LUZ = [
  { value: "baja", label: "Baja", desc: "Sombra, sin luz directa", icon: "🌑" },
  { value: "media", label: "Media", desc: "Luz filtrada o indirecta suave", icon: "🌤" },
  { value: "brillante", label: "Brillante indirecta", desc: "Cerca de ventana sin sol directo", icon: "☀️" },
  { value: "directa", label: "Sol directo", desc: "Varias horas de sol directo al día", icon: "🔆" },
] as const;

/** Niveles de humedad */
export const NIVELES_HUMEDAD = [
  { value: "baja", label: "Baja (< 40%)", desc: "Aire seco, común con calefacción" },
  { value: "media", label: "Media (40-60%)", desc: "Hogar promedio sin humidificador" },
  { value: "alta", label: "Alta (> 60%)", desc: "Con humidificador o agrupando plantas" },
] as const;

/** Dificultad de cuidado */
export const DIFICULTAD_CUIDADO = [
  { value: "facil", label: "Fácil", desc: "Perdona errores de principiante" },
  { value: "media", label: "Media", desc: "Requiere atención regular" },
  { value: "dificil", label: "Difícil", desc: "Necesita condiciones muy específicas" },
] as const;

/** Tipo de propagación */
export const TIPOS_PROPAGACION = [
  { value: "agua", label: "En agua", desc: "Enraizar en frasco con agua" },
  { value: "sphagnum", label: "Musgo Sphagnum", desc: "Enraizar en musgo húmedo" },
  { value: "sustrato", label: "Directo en sustrato", desc: "Plantar directamente en tierra" },
  { value: "division", label: "División de mata", desc: "Separar la planta en varias" },
] as const;

/** Hábitos de crecimiento */
export const HABITOS_CRECIMIENTO = [
  { value: "colgante", label: "Colgante", desc: "Ideal para maceta colgante" },
  { value: "trepador", label: "Trepador", desc: "Crece hacia arriba con tutor" },
  { value: "rastrero", label: "Rastrero", desc: "Se extiende horizontalmente" },
  { value: "arbustivo", label: "Arbustivo", desc: "Forma un arbusto compacto" },
  { value: "erecto", label: "Erecto", desc: "Crece vertical sin soporte" },
] as const;

/** Niveles de toxicidad */
export const TOXICIDAD = [
  { value: "ninguna", label: "No tóxica", desc: "Segura para mascotas y niños" },
  { value: "baja", label: "Baja", desc: "Puede causar molestias leves" },
  { value: "alta", label: "Alta", desc: "Tóxica — mantener fuera del alcance" },
] as const;

/** Meses del año en español */
export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;