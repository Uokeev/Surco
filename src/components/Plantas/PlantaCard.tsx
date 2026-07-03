"use client";

import type { CatalogoPlanta } from "@/types";

interface PlantaCardProps {
  planta: CatalogoPlanta;
  onClick: () => void;
}

const DIFICULTAD_COLOR: Record<string, string> = {
  facil: "bg-green-50 text-green-700 border-green-200",
  media: "bg-warm-50 text-warm-700 border-warm-200",
  dificil: "bg-red-50 text-red-700 border-red-200",
};

const LUZ_ICONO: Record<string, string> = {
  baja: "🌑",
  media: "🌤",
  brillante: "☀️",
  directa: "🔆",
};

const TOXICIDAD_ICONO: Record<string, string> = {
  ninguna: "✅",
  baja: "⚠️",
  alta: "☠️",
};

const CRECIMIENTO_ICONO: Record<string, string> = {
  colgante: "🪴",
  trepador: "🌿",
  rastrero: "🌱",
  arbustivo: "🌳",
  erecto: "🌵",
};

export function PlantaCard({ planta, onClick }: PlantaCardProps) {
  const diffColor = DIFICULTAD_COLOR[planta.dificultad] ?? "bg-gray-50 text-gray-700";
  const dificultadLabel = { facil: "Fácil", media: "Media", dificil: "Difícil" }[planta.dificultad] ?? planta.dificultad;

  const propagacionLabel = {
    agua: "Agua",
    sphagnum: "Sphagnum",
    sustrato: "Sustrato",
    division: "División",
  }[planta.propagacion_metodo] ?? planta.propagacion_metodo;

  return (
    <button
      type="button"
      onClick={onClick}
      className="card p-4 w-full text-left hover:bg-forest-50/50 active:bg-forest-100/50 transition-all"
    >
      {/* Nombre + dificultad */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-gray-900 text-sm">
            {planta.nombre}
          </h3>
          {planta.nombre_cientifico && (
            <p className="text-[10px] text-gray-500 italic mt-0.5 truncate">
              {planta.nombre_cientifico}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffColor}`}>
          {dificultadLabel}
        </span>
      </div>

      {/* Descripción corta */}
      {planta.descripcion_corta && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
          {planta.descripcion_corta}
        </p>
      )}

      {/* Primera fila: datos esenciales */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5">
        <span title="Luz">{LUZ_ICONO[planta.luz] ?? "💡"} {planta.luz}</span>
        <span title="Humedad mínima">💧 {planta.humedad_min}%</span>
        <span title="Toxicidad">{TOXICIDAD_ICONO[planta.toxicidad]}</span>
        <span title="Crecimiento">{CRECIMIENTO_ICONO[planta.crecimiento] ?? "🌱"}</span>
      </div>

      {/* Segunda fila: temperatura, propagación, origen */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span title="Temperatura">🌡 {planta.temp_min}°–{planta.temp_optima_max}°C</span>
        <span title="Propagación">🌱 {propagacionLabel}</span>
        {planta.origen && <span title="Origen">🗺 {planta.origen}</span>}
      </div>
    </button>
  );
}
