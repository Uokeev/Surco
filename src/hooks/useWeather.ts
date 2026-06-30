"use client";

import { useState, useCallback } from "react";
import type { CondicionesClimaticas, Coordenadas } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface UseWeatherReturn {
  weather: CondicionesClimaticas | null;
  loading: boolean;
  error: string | null;
  coords: Coordenadas | null;
  requestLocation: () => Promise<void>;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<CondicionesClimaticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordenadas | null>(null);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            enableHighAccuracy: false,
          });
        }
      );

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setCoords({ lat, lon });

      // Llamar a nuestra API route (oculta la lógica del lado servidor)
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();

      const res = await fetch("/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ lat, lon }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Error al obtener clima");
      }

      setWeather(data.data as CondicionesClimaticas);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al obtener ubicación";
      setError(message);
      console.warn("Weather error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, coords, requestLocation };
}
