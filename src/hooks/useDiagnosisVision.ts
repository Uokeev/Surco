"use client";

import { useState, useCallback } from "react";
import type { DiagnosticoResult, ApiResponse } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface DiagnoseVisionInput {
  detectedPlant: string;
  userQuery: string;
  imageBase64: string;
  imageMime: string;
}

interface UseDiagnosisVisionReturn {
  analyzing: boolean;
  progress: number;
  progressText: string;
  error: string | null;
  result: DiagnosticoResult & { planta_detectada?: string } | null;
  analyze: (input: DiagnoseVisionInput) => Promise<DiagnosticoResult | null>;
  reset: () => void;
}

const PROGRESS_STEPS = [
  { at: 10, text: "Identificando la planta con visión IA..." },
  { at: 30, text: "Consultando manual técnico de la planta..." },
  { at: 50, text: "Analizando síntomas con el manual..." },
  { at: 70, text: "Motor Surco IA generando diagnóstico..." },
  { at: 90, text: "Preparando diagnóstico personalizado..." },
];

export function useDiagnosisVision(): UseDiagnosisVisionReturn {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticoResult & { planta_detectada?: string } | null>(null);

  const simulateProgress = useCallback(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;

      const step = PROGRESS_STEPS.find((s) => current >= s.at);
      if (step) {
        setProgressText(step.text);
      }

      if (current >= 95) {
        clearInterval(interval);
        setProgress(95);
        return;
      }

      setProgress(Math.min(95, Math.round(current)));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const analyze = useCallback(
    async (input: DiagnoseVisionInput): Promise<DiagnosticoResult | null> => {
      setAnalyzing(true);
      setError(null);
      setProgress(0);
      setProgressText("Iniciando análisis con visión IA...");
      setResult(null);

      const stopProgress = simulateProgress();

      try {
        const supabase = getSupabaseClient();
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          throw new Error("Debes iniciar sesión.");
        }

        const res = await fetch("/api/diagnose-vision", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });

        let data: ApiResponse<DiagnosticoResult>;
        try {
          data = await res.json();
        } catch {
          const text = await res.text().catch(() => "No se pudo leer respuesta");
          console.error("[useDiagnosisVision] Respuesta no-JSON:", res.status, text.substring(0, 500));
          throw new Error(`Error del servidor (${res.status}). ${text.substring(0, 200)}`);
        }

        if (!data.ok) {
          throw new Error(data.error ?? "Error al realizar diagnóstico");
        }

        if (!data.data) {
          throw new Error("Respuesta vacía del servidor");
        }

        setProgress(100);
        setProgressText("¡Diagnóstico listo!");
        setResult(data.data as DiagnosticoResult & { planta_detectada?: string });

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        return null;
      } finally {
        stopProgress();
        setTimeout(() => {
          setAnalyzing(false);
        }, 500);
      }
    },
    [simulateProgress]
  );

  const reset = useCallback(() => {
    setAnalyzing(false);
    setProgress(0);
    setProgressText("");
    setError(null);
    setResult(null);
  }, []);

  return { analyzing, progress, progressText, error, result, analyze, reset };
}
