"use client";

import { useState, useCallback } from "react";
import type { CatalogoPlanta, PlagaRelacionada, AlertaTemporada, ApiResponse } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface UsePlantasReturn {
  plantas: CatalogoPlanta[];
  loading: boolean;
  error: string | null;
  fetchPlantas: () => Promise<void>;
  fetchPlanta: (nombre: string) => Promise<CatalogoPlanta | null>;
  fetchPlagas: (nombrePlanta: string) => Promise<PlagaRelacionada[]>;
  alertas: AlertaTemporada[];
  fetchAlertas: (temporada?: string) => Promise<void>;
  plantaActual: CatalogoPlanta | null;
  plagasActuales: PlagaRelacionada[];
  loadingDetalle: boolean;
}

export function usePlantas(): UsePlantasReturn {
  const [plantas, setPlantas] = useState<CatalogoPlanta[]>([]);
  const [plantaActual, setPlantaActual] = useState<CatalogoPlanta | null>(null);
  const [plagasActuales, setPlagasActuales] = useState<PlagaRelacionada[]>([]);
  const [alertas, setAlertas] = useState<AlertaTemporada[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlantas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/plantas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiResponse<CatalogoPlanta[]> = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Error al cargar plantas");
      }

      setPlantas(data.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlanta = useCallback(async (nombre: string): Promise<CatalogoPlanta | null> => {
    setLoadingDetalle(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(`/api/plantas?nombre=${encodeURIComponent(nombre)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiResponse<CatalogoPlanta[]> = await res.json();

      if (!data.ok || !data.data || data.data.length === 0) {
        throw new Error(data.error ?? "Planta no encontrada");
      }

      const planta = data.data[0]!;
      setPlantaActual(planta);
      return planta;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      return null;
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const fetchPlagas = useCallback(async (nombrePlanta: string): Promise<PlagaRelacionada[]> => {
    try {
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/plantas/plagas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre_planta: nombrePlanta }),
      });

      const data: ApiResponse<PlagaRelacionada[]> = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Error al cargar plagas");
      }

      setPlagasActuales(data.data ?? []);
      return data.data ?? [];
    } catch (err) {
      console.warn("Error fetching plagas:", err);
      return [];
    }
  }, []);

  const fetchAlertas = useCallback(async (temporada?: string) => {
    try {
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const url = temporada
        ? `/api/plantas/alertas?temporada=${encodeURIComponent(temporada)}`
        : "/api/plantas/alertas";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiResponse<AlertaTemporada[]> = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "Error al cargar alertas");
      }

      setAlertas(data.data ?? []);
    } catch (err) {
      console.warn("Error fetching alertas:", err);
    }
  }, []);

  return {
    plantas,
    loading,
    error,
    fetchPlantas,
    fetchPlanta,
    fetchPlagas,
    alertas,
    fetchAlertas,
    plantaActual,
    plagasActuales,
    loadingDetalle,
  };
}
