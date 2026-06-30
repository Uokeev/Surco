import type { CondicionesClimaticas, Coordenadas } from "@/types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Obtiene condiciones climáticas actuales para unas coordenadas.
 * Usa Open-Meteo (gratis, sin API key) + Nominatim (geocoding inverso).
 */
export async function obtenerClima(
  coords: Coordenadas
): Promise<CondicionesClimaticas | null> {
  try {
    // 1. Datos meteorológicos
    const weatherUrl = new URL(OPEN_METEO_URL);
    weatherUrl.searchParams.set("latitude", String(coords.lat));
    weatherUrl.searchParams.set("longitude", String(coords.lon));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code"
    );
    weatherUrl.searchParams.set("daily", "precipitation_sum");
    weatherUrl.searchParams.set("timezone", "auto");
    weatherUrl.searchParams.set("forecast_days", "3");

    const weatherRes = await fetch(weatherUrl.toString(), {
      next: { revalidate: 300 }, // cache por 5 min en server components
    });

    if (!weatherRes.ok) {
      console.warn("Open-Meteo error:", weatherRes.status);
      return null;
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    if (!current) return null;

    // 2. Geocoding inverso (nombre de ciudad)
    const geoUrl = new URL(NOMINATIM_URL);
    geoUrl.searchParams.set("lat", String(coords.lat));
    geoUrl.searchParams.set("lon", String(coords.lon));
    geoUrl.searchParams.set("format", "json");

    const geoRes = await fetch(geoUrl.toString(), {
      headers: {
        "User-Agent": "SurcoApp/1.0 (diagnostico@surco.cl)",
      },
      next: { revalidate: 86400 }, // cache por 24h
    });

    let ciudad = "Chile";
    let region = "Chile";

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      ciudad =
        geoData.address?.city ??
        geoData.address?.town ??
        geoData.address?.village ??
        "Chile";
      region = geoData.address?.state ?? "Chile";
    }

    // 3. Armar resultado
    const lluvia3dias = (weatherData.daily?.precipitation_sum ?? [])
      .slice(0, 3)
      .reduce((a: number, b: number | null) => a + (b ?? 0), 0)
      .toFixed(1);

    return {
      temperatura: Math.round(current.temperature_2m),
      humedad: Math.round(current.relative_humidity_2m),
      precipitacion: Math.round(current.precipitation * 10) / 10,
      viento: Math.round(current.wind_speed_10m),
      ciudad,
      region,
      lluvia_3dias,
    };
  } catch (error) {
    console.warn("Error obteniendo clima:", error);
    return null;
  }
}

/**
 * Prepara string de contexto climático para el prompt.
 */
export function formatearClimaContexto(
  clima: CondicionesClimaticas
): string {
  return `
CONDICIONES CLIMÁTICAS ACTUALES EN ${clima.ciudad}:
- Temperatura: ${clima.temperatura}°C
- Humedad relativa: ${clima.humedad}%
- Precipitación hoy: ${clima.precipitacion}mm
- Lluvia últimos 3 días: ${clima.lluvia_3dias}mm
- Viento: ${clima.viento} km/h
Considera estas condiciones para evaluar riesgo de propagación y urgencia del tratamiento.`;
}
