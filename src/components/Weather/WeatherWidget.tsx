"use client";

import { useEffect } from "react";
import type { CondicionesClimaticas } from "@/types";

interface WeatherWidgetProps {
  weather: CondicionesClimaticas | null;
  loading: boolean;
  onRequestLocation: () => void;
}

export function WeatherWidget({
  weather,
  loading,
  onRequestLocation,
}: WeatherWidgetProps) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onRequestLocation}
        disabled={loading}
        className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium text-forest-800 flex items-center justify-center gap-2 hover:bg-forest-50/50 transition-colors disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
            Obteniendo ubicación...
          </>
        ) : weather ? (
          <>📍 {weather.ciudad} — {weather.temperatura}°C</>
        ) : (
          <>📍 Detectar ubicación y clima</>
        )}
      </button>

      {weather && (
        <div className="mt-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-semibold text-sm text-gray-900">
              📍 {weather.ciudad}
            </span>
            <span className="text-xs text-gray-500">Clima actual</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {weather.temperatura}°
              </div>
              <div className="text-xs text-gray-500">Temp.</div>
            </div>
            <div className="text-center">
              <div
                className="text-xl font-bold"
                style={{
                  color:
                    weather.humedad > 80
                      ? "#b85c1a"
                      : weather.humedad > 60
                        ? "#3d7a52"
                        : "#6b6b6b",
                }}
              >
                {weather.humedad}%
              </div>
              <div className="text-xs text-gray-500">Humedad</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {weather.precipitacion}
              </div>
              <div className="text-xs text-gray-500">mm hoy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {weather.lluvia_3dias}
              </div>
              <div className="text-xs text-gray-500">mm 3d</div>
            </div>
          </div>

          <div
            className={`rounded-lg px-3 py-2 text-xs ${
              weather.humedad > 80
                ? "bg-warm-50 text-warm-800"
                : "bg-forest-50 text-gray-700"
            }`}
          >
            {weather.humedad > 80 && weather.temperatura > 15
              ? "⚠️ Condiciones favorables para hongos"
              : weather.humedad > 70
                ? "🌿 Humedad moderada — monitorear"
                : "✓ Condiciones normales"}
          </div>
        </div>
      )}
    </div>
  );
}
