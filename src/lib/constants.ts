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