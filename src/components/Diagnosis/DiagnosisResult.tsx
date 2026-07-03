"use client";

import type { DiagnosticoResult, CondicionesClimaticas, UsoTipo } from "@/types";
import { Calculator } from "@/components/Calculator/Calculator";

interface DiagnosisResultProps {
  result: DiagnosticoResult;
  crop: string;
  region: string;
  previewImage: string | null;
  weather: CondicionesClimaticas | null;
  usoTipo: UsoTipo;
}

/** Extrae el nombre del producto de un texto de paso tipo "Paso N — Producto: instrucción" */
function extraerProducto(paso: string): string {
  const sinPaso = paso.replace(/^Paso\s*\d+\s*[—\-:]\s*/i, "").trim();
  // Si tiene ":" tomamos lo que va antes del primer ":"
  const partes = sinPaso.split(":");
  return partes[0]?.trim() ?? sinPaso.substring(0, 50);
}

/** Extrae la instrucción después del nombre del producto */
function extraerInstruccion(paso: string): string {
  const sinPaso = paso.replace(/^Paso\s*\d+\s*[—\-:]\s*/i, "").trim();
  const partes = sinPaso.split(":");
  if (partes.length > 1) {
    return partes.slice(1).join(":").trim();
  }
  return "";
}

export function DiagnosisResult({
  result,
  crop,
  region,
  previewImage,
  weather,
  usoTipo,
}: DiagnosisResultProps) {
  const pasos = result.tratamiento ?? [];

  const severidadColor =
    result.severidad === "Alta"
      ? "bg-red-500/10 text-red-700 border-red-200"
      : result.severidad === "Media"
        ? "bg-warm-50 text-warm-700 border-warm-200"
        : "bg-green-50 text-green-700 border-green-200";

  const mapsQuery = `https://www.google.com/maps/search/agroveterinaria+productos+fitosanitarios+Chile`;

  return (
    <div className="space-y-4">
      {/* Imagen preview */}
      {previewImage && (
        <div className="rounded-2xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="Planta diagnosticada"
            className="w-full max-h-56 object-cover"
          />
        </div>
      )}

      {/* Encabezado del diagnóstico */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {result.enfermedad || "Sin diagnóstico"}
            </h2>
            {result.nombre_cientifico && (
              <p className="text-sm text-gray-500 italic mt-0.5">
                {result.nombre_cientifico}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-forest-800 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
                SAG Chile 2025
              </span>
              <span className="bg-forest-50 text-forest-800 text-[10px] font-medium px-2.5 py-0.5 rounded">
                Registro vigente
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-lg border ${severidadColor}`}
          >
            {result.severidad || "—"}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Lo que veo en la foto
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {result.que_veo || result.sintomas_detectados || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              ¿Por qué ocurre?
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {result.causa || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de confianza */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-gray-600">Confianza del diagnóstico</span>
          <span className="text-sm font-bold text-forest-800">
            {result.confianza || 0}%
          </span>
        </div>
        <div
          className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={result.confianza || 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${result.confianza || 0}% de confianza`}
        >
          <div
            className="h-full bg-gradient-to-r from-forest-500 to-forest-700 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${result.confianza || 0}%` }}
          />
        </div>
      </div>

      {/* Cuándo actuar */}
      {result.cuando_actuar && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div className="text-sm text-gray-800">
            <strong>¿Cuándo actuar?</strong> {result.cuando_actuar}
          </div>
        </div>
      )}

      {/* Pasos de tratamiento — versión lista vertical */}
      {pasos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            📋 Qué hacer — paso a paso
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Sigue estos pasos en orden
          </p>

          <div className="space-y-3">
            {pasos.map((paso, i) => {
              const producto = extraerProducto(paso);
              const instruccion = extraerInstruccion(paso);
              const queryML = encodeURIComponent(producto + " Chile");

              return (
                <div
                  key={i}
                  className="bg-forest-50 rounded-xl p-4 flex items-start gap-3"
                >
                  {/* Número de paso grande */}
                  <span className="bg-forest-800 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Producto en negrita */}
                    {producto && (
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {producto}
                      </p>
                    )}

                    {/* Instrucción */}
                    {instruccion ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {instruccion}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {paso.replace(/^Paso\s*\d+\s*[—\-:]\s*/i, "")}
                      </p>
                    )}

                    {/* Link a MercadoLibre */}
                    {producto && (
                      <a
                        href={`https://listado.mercadolibre.cl/${queryML}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-[#8f7e00] bg-[#fff159] rounded-lg px-3 py-1.5 hover:brightness-95 transition-all active:scale-[0.97]"
                      >
                        Ver en MercadoLibre →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calculadora de dosis */}
      <Calculator tratamientos={pasos} />

      {/* Links de búsqueda — versión mobile-friendly */}
      {pasos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            🛒 Dónde comprar
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Toque un producto para buscarlo en MercadoLibre Chile
          </p>

          <div className="space-y-2">
            {pasos.map((paso, i) => {
              const producto = extraerProducto(paso);
              const queryML = encodeURIComponent(producto + " Chile");

              return (
                <a
                  key={i}
                  href={`https://listado.mercadolibre.cl/${queryML}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#fff159]/80 hover:bg-[#fff159] border border-yellow-300 rounded-xl px-4 py-3.5 transition-colors active:scale-[0.98]"
                >
                  <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-base shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {producto}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ver en MercadoLibre →
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Pie con Google como alternativa secundaria */}
          <p className="text-xs text-gray-400 text-center mt-3">
            ¿No encuentras?{' '}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                pasos.map(p => extraerProducto(p)).filter(Boolean).join(" ")
              )} Chile`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 underline underline-offset-2 hover:text-forest-800 font-medium"
            >
              Buscar en Google
            </a>
          </p>
        </div>
      )}

      {/* Agroveterinarias cercanas */}
      <a
        href={mapsQuery}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 bg-forest-800 text-white rounded-xl py-4 px-5 text-sm font-semibold text-center hover:bg-forest-700 transition-colors active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Agroveterinarias cercanas
      </a>

      {/* Alerta propagación */}
      {result.alerta_propagacion && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="text-sm text-gray-800">
            <strong>¿Se contagia?</strong> {result.alerta_propagacion}
          </div>
        </div>
      )}

      {/* Clima al diagnóstico */}
      {weather && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
          <div className="text-sm text-gray-700">
            <strong>Clima al diagnóstico</strong>
            <br />
            {weather.ciudad} · {weather.temperatura}°C · {weather.humedad}%
            humedad · {weather.precipitacion}mm
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center py-3">
        Basado en guías SAG / INIA · {crop} · {region}
      </p>
    </div>
  );
}
