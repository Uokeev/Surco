"use client";

import { useState } from "react";
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

export function DiagnosisResult({
  result,
  crop,
  region,
  previewImage,
  weather,
  usoTipo,
}: DiagnosisResultProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const pasos = result.tratamiento ?? [];

  const severidadColor =
    result.severidad === "Alta"
      ? "bg-red-500/10 text-red-700 border-red-200"
      : result.severidad === "Media"
        ? "bg-warm-50 text-warm-700 border-warm-200"
        : "bg-green-50 text-green-700 border-green-200";

  const mapsQuery = `https://www.google.com/maps/search/agroveterinaria+productos+fitosanitarios+Chile`;

  const stepForward = () =>
    setCurrentStep((p) => Math.min(pasos.length - 1, p + 1));
  const stepBackward = () => setCurrentStep((p) => Math.max(0, p - 1));

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
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest-500 to-forest-700 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${result.confianza || 0}%` }}
          />
        </div>
      </div>

      {/* Cuándo actuar */}
      {result.cuando_actuar && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">🕐</span>
          <div className="text-sm text-gray-800">
            <strong>¿Cuándo actuar?</strong> {result.cuando_actuar}
          </div>
        </div>
      )}

      {/* Pasos de tratamiento */}
      {pasos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            💊 Qué hacer — paso a paso
          </h3>

          <div className="text-xs text-gray-500 mb-3 text-center">
            Paso {currentStep + 1} de {pasos.length}
          </div>

          <div
            key={currentStep}
            className="bg-forest-50 rounded-xl p-4 min-h-[80px] flex items-start gap-3 transition-all duration-300"
          >
            <span className="bg-forest-800 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
              {currentStep + 1}
            </span>
            <p className="text-sm text-gray-800 leading-relaxed">
              {pasos[currentStep]}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <button
              type="button"
              onClick={stepBackward}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1.5">
              {pasos.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? "bg-forest-800" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={stepForward}
              disabled={currentStep === pasos.length - 1}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-forest-800 text-white hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Calculadora de dosis */}
      <Calculator tratamientos={pasos} />

      {/* Links de búsqueda */}
      {pasos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            🛒 Buscar productos online
          </h3>
          <div className="space-y-3">
            {pasos.map((paso, i) => {
              const nombreProducto =
                paso.split("—")[1]?.split(":")[0]?.trim() ??
                paso.split(":")[0]?.replace(/^Paso \d+/, "").trim() ??
                paso.substring(0, 40);
              const queryML = encodeURIComponent(
                nombreProducto + " fungicida plaguicida Chile"
              );
              const queryGoo = encodeURIComponent(
                nombreProducto + " precio Chile"
              );

              return (
                <div
                  key={i}
                  className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    Paso {i + 1}: {nombreProducto}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={`https://listado.mercadolibre.cl/${queryML}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#fff159] text-gray-800 rounded-lg px-3 py-1.5 text-xs font-semibold hover:brightness-95 transition-all"
                    >
                      🛍 MercadoLibre
                    </a>
                    <a
                      href={`https://www.google.com/search?q=${queryGoo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 transition-all"
                    >
                      🔍 Google
                    </a>
                    <a
                      href={`https://www.mercadopublico.cl/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-forest-50 text-forest-800 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-forest-100 transition-all"
                    >
                      🌱 Tienda agrícola
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agroveterinarias cercanas */}
      <a
        href={mapsQuery}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-forest-800 text-white rounded-xl py-3.5 px-5 text-sm font-semibold text-center hover:bg-forest-700 transition-colors"
      >
        📍 Agroveterinarias cercanas
      </a>

      {/* Alerta propagación */}
      {result.alerta_propagacion && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm text-gray-800">
            <strong>¿Se contagia?</strong> {result.alerta_propagacion}
          </div>
        </div>
      )}

      {/* Clima al diagnóstico */}
      {weather && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">🌡️</span>
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
