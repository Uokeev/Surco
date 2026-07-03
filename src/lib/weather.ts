import type { CondicionesClimaticas, Coordenadas } from "@/types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Obtiene condiciones climáticas actuales para unas coordenadas.
 * Usa Open-Meteo (gratis, sin API key). El nombre de ciudad se
 * obtiene desde las coordenadas sin depender de APIs externas frágiles.
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const weatherRes = await fetch(weatherUrl.toString(), {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!weatherRes.ok) {
      console.warn("Open-Meteo error:", weatherRes.status);
      return null;
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    if (!current) {
      console.warn("Open-Meteo: respuesta sin current", JSON.stringify(weatherData).slice(0, 200));
      return null;
    }

    // 2. Nombre de ciudad desde las coordenadas (formato lat,lon)
    const latDir = coords.lat >= 0 ? "S" : "N";
    const lonDir = coords.lon >= 0 ? "O" : "E";
    const ciudad = `${Math.abs(coords.lat).toFixed(2)}°${latDir}, ${Math.abs(coords.lon).toFixed(2)}°${lonDir}`;
    const region = `${Math.abs(coords.lat).toFixed(1)}°${latDir}`;

    // 3. Armar resultado
    const lluvia3dias = (weatherData.daily?.precipitation_sum ?? [])
      .slice(0, 3)
      .reduce((a: number, b: number | null) => a + (b ?? 0), 0)
      .toFixed(1);

    return {
      temperatura: Math.round(current.temperature_2m ?? 0),
      humedad: Math.round(current.relative_humidity_2m ?? 0),
      precipitacion: current.precipitation != null
        ? Math.round(current.precipitation * 10) / 10
        : 0,
      viento: Math.round(current.wind_speed_10m ?? 0),
      ciudad,
      region,
      lluvia_3dias: lluvia3dias,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    console.warn("Error obteniendo clima:", msg);
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
