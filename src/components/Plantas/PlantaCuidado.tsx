"use client";

import { useState, useEffect } from "react";
import type { CatalogoPlanta, PlagaRelacionada, AlertaTemporada } from "@/types";
import { usePlantas } from "@/hooks/usePlanta";

interface PlantaCuidadoProps {
  planta: CatalogoPlanta;
}

const LUZ_LABEL: Record<string, string> = {
  baja: "Sombra / luz baja",
  media: "Luz media indirecta",
  brillante: "Luz brillante indirecta",
  directa: "Sol directo",
};

const LUZ_RANGOS: Record<string, string> = {
  baja: "20–100 FC (esquina de la sala)",
  media: "100–200 FC (ventana este)",
  brillante: "200–500 FC (ventana sur/oeste con filtro)",
  directa: "500+ FC (ventana directa)",
};

const RIESGO_TRIGGER_LABEL: Record<string, string> = {
  seco_tercio: "Solo cuando el tercio superior de la tierra esté seco (usa el dedo)",
  seco_total: "Solo cuando toda la maceta esté seca (verifica con palillo)",
  casi_seco: "Cuando la tierra esté casi completamente seca",
};

const TOXICIDAD_LABEL: Record<string, string> = {
  ninguna: "No tóxica para mascotas ni humanos",
  baja: "Baja toxicidad — puede causar molestias digestivas leves si se ingiere",
  alta: "Tóxica — mantener fuera del alcance de mascotas y niños",
};

export function PlantaCuidado({ planta }: PlantaCuidadoProps) {
  const { fetchPlagas, fetchAlertas, plagasActuales, alertas, errorPlagas, errorAlertas } = usePlantas();
  const [showPlagas, setShowPlagas] = useState(false);
  const [loadingPlagas, setLoadingPlagas] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAlertas().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAlertas]);

  const handleLoadPlagas = async () => {
    setLoadingPlagas(true);
    setShowPlagas(true);
    await fetchPlagas(planta.nombre);
    setLoadingPlagas(false);
  };

  const difLabel = { facil: "Fácil", media: "Media", dificil: "Difícil" }[planta.dificultad];
  const difColor = {
    facil: "bg-green-50 text-green-700",
    media: "bg-warm-50 text-warm-700",
    dificil: "bg-red-50 text-red-700",
  }[planta.dificultad];

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900">{planta.nombre}</h2>
            {planta.nombre_cientifico && (
              <p className="text-sm text-gray-500 italic">{planta.nombre_cientifico}</p>
            )}
          </div>
          <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${difColor}`}>
            {difLabel}
          </span>
        </div>

        {planta.descripcion_larga && (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {planta.descripcion_larga}
          </p>
        )}

        {planta.origen && (
          <p className="text-xs text-gray-400 mt-2">
            Origen: {planta.origen}
          </p>
        )}
      </div>

      {/* Grid de cuidados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Luz */}
        <div className="card p-4 bg-yellow-50/40 border-yellow-100">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">☀️ Luz</h4>
          <p className="text-sm font-medium text-gray-800">{LUZ_LABEL[planta.luz]}</p>
          <p className="text-xs text-gray-500 mt-1">{LUZ_RANGOS[planta.luz]}</p>
          <p className="text-xs text-gray-400 mt-1">
            Rango ideal: {planta.luz_fc_min}–{planta.luz_fc_max} FC
          </p>
        </div>

        {/* Riego */}
        <div className="card p-4 bg-blue-50/40 border-blue-100">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">💧 Riego</h4>
          <p className="text-sm font-medium text-gray-800">
            Trigger: {RIESGO_TRIGGER_LABEL[planta.riego_trigger]}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Regar hasta que el agua salga por el drenaje
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Profundidad de maceta: ~{planta.riego_profundidad_cm} cm de tierra seca
          </p>
        </div>

        {/* Humedad */}
        <div className="card p-4 bg-teal-50/40 border-teal-100">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">🌫 Humedad</h4>
          <p className="text-sm font-medium text-gray-800">
            Mínimo: {planta.humedad_min}% — Óptimo: {planta.humedad_optima_min}%–{planta.humedad_optima_max}%
          </p>
          {(planta.humedad_optima_min ?? 0) > 60 && (
            <p className="text-xs text-teal-600 mt-1">
              💡 Requiere humidificador o bandeja de guijarros
            </p>
          )}
        </div>

        {/* Temperatura */}
        <div className="card p-4 bg-orange-50/40 border-orange-100">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">🌡 Temperatura</h4>
          <p className="text-sm font-medium text-gray-800">
            Mínimo: {planta.temp_min}°C — Óptimo: {planta.temp_optima_min}°C–{planta.temp_optima_max}°C
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Evitar corrientes de aire frío y cambios bruscos
          </p>
        </div>
      </div>

      {/* Consejos clave */}
      {planta.consejos_clave && planta.consejos_clave.length > 0 && (
        <div className="card p-4 border-forest-200">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">📋 Consejos clave</h4>
          <ul className="space-y-2">
            {planta.consejos_clave.map((consejo, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-forest-500 shrink-0">•</span>
                <span>{consejo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Problemas comunes */}
      {planta.problemas_comunes && (
        <div className="card p-4 border-red-200 bg-red-50/40">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">⚠️ Problemas comunes</h4>
          <p className="text-sm text-gray-700">{planta.problemas_comunes}</p>
        </div>
      )}

      {/* Toxicidad */}
      <div className="card p-4 border-warm-200 bg-warm-50/40">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">
          {planta.toxicidad === "alta" ? "☠️" : planta.toxicidad === "baja" ? "⚠️" : "✅"} Toxicidad
        </h4>
        <p className="text-sm text-gray-700">
          {TOXICIDAD_LABEL[planta.toxicidad]}
        </p>
      </div>

      {/* Diferenciador */}
      {planta.diferenciador && (
        <div className="card p-4 bg-forest-50/40 border-forest-200">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">✨ Diferenciador</h4>
          <p className="text-sm text-gray-700">{planta.diferenciador}</p>
        </div>
      )}

      {/* Propagación */}
      <div className="card p-4 border-purple-200 bg-purple-50/40">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">🌱 Propagación</h4>
        <p className="text-sm font-medium text-gray-800 capitalize">
          Método: {planta.propagacion_metodo}
        </p>
        <p className="text-sm text-gray-700 mt-2">{planta.propagacion_detalle}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>Tiempo de enraizamiento: {planta.propagacion_tiempo_raiz}</span>
          <span>·</span>
          <span>
            Dificultad:{" "}
            {planta.propagacion_dificultad === "facil"
              ? "Fácil"
              : planta.propagacion_dificultad === "media"
              ? "Media"
              : "Difícil"}
          </span>
        </div>
      </div>

      {/* Plagas y enfermedades */}
      <div className="card p-4 border-red-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-gray-900">🐛 Plagas y enfermedades</h4>
          <button
            type="button"
            onClick={handleLoadPlagas}
            className="text-xs font-medium text-forest-600 hover:text-forest-700 underline underline-offset-2"
          >
            {showPlagas ? "Recargar" : "Ver plagas asociadas"}
          </button>
        </div>

        {loadingPlagas && (
          <p className="text-sm text-gray-500">Cargando plagas...</p>
        )}

        {showPlagas && !loadingPlagas && errorPlagas && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
            <p className="text-sm text-red-700 font-medium">⚠️ Error al cargar plagas</p>
            <p className="text-xs text-red-600 mt-1">{errorPlagas}</p>
          </div>
        )}

        {showPlagas && !loadingPlagas && !errorPlagas && plagasActuales.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 font-medium">✅ No se encontraron plagas asociadas</p>
            <p className="text-xs text-green-600 mt-1">
              Esta planta no tiene registros de plagas comunes en la base de datos.
            </p>
          </div>
        )}

        {showPlagas && !loadingPlagas && plagasActuales.length > 0 && (
          <div className="space-y-3">
            {plagasActuales.map((plaga) => (
              <div
                key={plaga.plaga_id}
                className="border border-gray-200 rounded-lg p-3 bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {plaga.plaga_nombre}
                  </h5>
                  <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize
                    bg-red-50 text-red-700 border border-red-200"
                  >
                    {plaga.plaga_tipo}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Síntomas:</span> {plaga.sintomas}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    🩺 {plaga.tratamiento_principal}
                  </span>
                  {plaga.frecuencia && (
                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                      Frecuencia: {plaga.frecuencia}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alertas de temporada */}
      {errorAlertas && (
        <div className="card p-4 border-red-200 bg-red-50/40" role="alert">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">📅 Alertas de temporada</h4>
          <p className="text-xs text-red-600">{errorAlertas}</p>
        </div>
      )}
      {!errorAlertas && alertas.length > 0 && (
        <div className="card p-4 border-warm-200 bg-warm-50/40">
          <h4 className="font-semibold text-sm text-gray-900 mb-3">📅 Alertas de temporada</h4>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="bg-white rounded-lg p-3 border border-warm-100">
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">
                    {alerta.temporada === "invierno" ? "❄️" : alerta.temporada === "primavera" ? "🌸" : alerta.temporada === "verano" ? "☀️" : "🍂"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {alerta.titulo}
                    </p>
                    <p className="text-xs text-gray-600">{alerta.mensaje}</p>
                    {alerta.acciones && alerta.acciones.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {alerta.acciones.map((accion, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <span className="text-forest-500 mt-0.5">→</span>
                            <span>{accion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
