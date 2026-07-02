"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CustomMobileNet } from "@teachablemachine/image";

const TM_URL = "https://teachablemachine.withgoogle.com/models/PXWMc86KW/";

/** Mapea las labels del modelo TM a los nombres de cultivo en la app */
const LABEL_TO_CROP: Record<string, string> = {
  Singonio_Confetti: "Singonio Confetti",
  filodendro_micans: "Filodendro Micans",
  pothos_njoy: "Potus N'Joy",
};

export interface PlantPrediction {
  className: string;
  cropName: string;
  probability: number;
}

interface UsePlantIdentifierReturn {
  /** Cargando el modelo */
  loadingModel: boolean;
  /** Error al cargar el modelo */
  modelError: string | null;
  /** El modelo está listo para predecir */
  modelReady: boolean;
  /** Última predicción */
  lastPrediction: PlantPrediction | null;
  /** Ejecuta predicción sobre un canvas/video/img */
  predict: (
    source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ) => Promise<PlantPrediction | null>;
  /** Porcentaje de confianza de la predicción */
  confidence: number;
  /** Reiniciar estado */
  reset: () => void;
}

export function usePlantIdentifier(): UsePlantIdentifierReturn {
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<PlantPrediction | null>(null);

  const modelRef = useRef<CustomMobileNet | null>(null);

  // Cargar modelo al montar
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const modelURL = TM_URL + "model.json";
        const metadataURL = TM_URL + "metadata.json";

        // Carga dinámica de la librería TM (evita SSR)
        const { load: tmLoad } = await import("@teachablemachine/image");

        const model = await tmLoad(modelURL, metadataURL);
        if (cancelled) return;

        modelRef.current = model as unknown as CustomMobileNet;
        setModelReady(true);
        setLoadingModel(false);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.warn("[PlantIdentifier] Error loading model:", err);
        setModelError(msg);
        setLoadingModel(false);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      // Liberar memoria del modelo
      if (modelRef.current) {
        modelRef.current.dispose();
        modelRef.current = null;
      }
    };
  }, []);

  const predict = useCallback(
    async (
      source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    ): Promise<PlantPrediction | null> => {
      const model = modelRef.current;
      if (!model || !source) return null;

      try {
        const predictions = await model.predict(source);

        if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
          return null;
        }

        // Encontrar la clase con mayor probabilidad
        let best: { className: string; probability: number } | null = null;
        for (const p of predictions) {
          if (!best || p.probability > best.probability) {
            best = { className: p.className, probability: p.probability };
          }
        }

        if (!best || best.probability < 0.01) return null;

        const result: PlantPrediction = {
          className: best.className,
          cropName: LABEL_TO_CROP[best.className] ?? best.className,
          probability: best.probability,
        };

        setLastPrediction(result);
        return result;
      } catch (err) {
        console.warn("[PlantIdentifier] Error predict:", err);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setLastPrediction(null);
  }, []);

  return {
    loadingModel,
    modelError,
    modelReady,
    lastPrediction,
    predict,
    confidence: lastPrediction?.probability ?? 0,
    reset,
  };
}
