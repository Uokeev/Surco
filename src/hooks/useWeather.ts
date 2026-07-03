"use client";

import { useState, useCallback, useEffect } from "react";
import type { CondicionesClimaticas, Coordenadas } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface UseWeatherReturn {
  weather: CondicionesClimaticas | null;
  loading: boolean;
  error: string | null;
  coords: Coordenadas | null;
  requestLocation: () => Promise<void>;
}

/**
 * Hook de clima que persiste la ubicación en user_metadata.
 * - Al montar, carga coordenadas guardadas y auto-fetch del clima.
 * - Al detectar ubicación, guarda lat/lon para uso futuro.
 * Así el clima persiste entre páginas y sesiones.
 */
export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<CondicionesClimaticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordenadas | null>(null);

  // ─── Helper: llama a /api/weather y persiste resultado ───
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    const supabase = getSupabaseClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lon }),
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error ?? "Error al obtener clima");
    }

    const clima = data.data as CondicionesClimaticas;
    setWeather(clima);

    // Persistir coordenadas + región en user_metadata
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            saved_lat: lat,
            saved_lon: lon,
            saved_region: clima.region || user.user_metadata?.saved_region,
          },
        });
      }
    } catch {
      // Silencioso — metadata es best-effort
    }

    return clima;
  }, []);

  // ─── Al montar, restaurar ubicación guardada ───
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;

        const savedLat = user?.user_metadata?.saved_lat as number | undefined;
        const savedLon = user?.user_metadata?.saved_lon as number | undefined;

        if (savedLat && savedLon) {
          setCoords({ lat: savedLat, lon: savedLon });
          // Auto-fetch clima en segundo plano
          await fetchWeather(savedLat, savedLon);
        }
      } catch {
        // Silencioso
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [fetchWeather]);

  // ─── Detectar ubicación manual ───
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

      // fetchWeather ya persiste todo en metadata
      await fetchWeather(lat, lon);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al obtener ubicación";
      setError(message);
      console.warn("Weather error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWeather]);

  return { weather, loading, error, coords, requestLocation };
}
