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
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {" "}{weather.ciudad} — {weather.temperatura}°C
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {" "}Detectar ubicación y clima
          </>
        )}
      </button>

      {weather && (
        <div className="mt-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-semibold text-sm text-gray-900">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5 mr-1">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {weather.ciudad}
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
            {(weather.humedad > 80 && weather.temperatura > 15) ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5 mr-1">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg> Condiciones favorables para hongos</>
            ) : weather.humedad > 70 ? (
              "Humedad moderada — monitorear"
            ) : (
              "✓ Condiciones normales"
            )}
          </div>
        </div>
      )}
    </div>
  );
}
