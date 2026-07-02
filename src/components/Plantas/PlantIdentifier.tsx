"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlantIdentifier } from "@/hooks/usePlantIdentifier";
import type { PlantPrediction } from "@/hooks/usePlantIdentifier";

interface PlantIdentifierProps {
  /** Canvas o imagen a analizar (cuando haya foto) */
  sourceElement: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | null;
  /** Callback cuando se identifica una planta con confianza */
  onIdentified: (prediction: PlantPrediction) => void;
  /** Callback cuando hay error */
  onError?: (error: string) => void;
  /** Callback cuando termina el primer intento de predicción (haya encontrado algo o no) */
  onComplete?: () => void;
  /** Solo disparar una vez (útil para auto-detect al tomar foto) */
  autoDetect?: boolean;
}

export function PlantIdentifier({
  sourceElement,
  onIdentified,
  onError,
  onComplete,
  autoDetect = true,
}: PlantIdentifierProps) {
  const { loadingModel, modelError, modelReady, predict, lastPrediction, confidence } =
    usePlantIdentifier();
  const detectedRef = useRef(false);

  const handlePredict = useCallback(async () => {
    if (!sourceElement || !modelReady || detectedRef.current) return;

    const result = await predict(sourceElement);
    if (result && result.probability > 0.3) {
      detectedRef.current = true;
      onIdentified(result);
    }
    // Llamar onComplete después del primer intento (haya encontrado algo o no)
    onComplete?.();
  }, [sourceElement, modelReady, predict, onIdentified, onComplete]);

  // Auto-detectar cuando haya source y modelo listo
  useEffect(() => {
    if (autoDetect && sourceElement && modelReady && !detectedRef.current) {
      handlePredict();
    }
  }, [autoDetect, sourceElement, modelReady, handlePredict]);

  // Mostrar error del modelo
  useEffect(() => {
    if (modelError && onError) {
      onError(modelError);
    }
  }, [modelError, onError]);

  // No renderizar nada visual — solo lógica
  // El badge de resultado se muestra en el padre via lastPrediction
  return null;
}

/** Badge visual opcional para mostrar el resultado de identificación */
export function PlantIdentificationBadge({
  prediction,
  onClear,
}: {
  prediction: PlantPrediction | null;
  onClear?: () => void;
}) {
  if (!prediction) return null;

  const confidencePct = (prediction.probability * 100).toFixed(0);
  const isHigh = prediction.probability > 0.7;
  const isMedium = prediction.probability > 0.4;

  return (
    <div
      className={`card p-3 flex items-center gap-3 ${
        isHigh
          ? "bg-green-50 border-green-200"
          : isMedium
          ? "bg-warm-50 border-warm-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Icono */}
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          isHigh
            ? "bg-green-100 text-green-700"
            : isMedium
            ? "bg-warm-100 text-warm-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {isHigh ? "🌿" : isMedium ? "🔍" : "🤔"}
      </span>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {isHigh
            ? `Planta identificada: ${prediction.cropName}`
            : isMedium
            ? `Probable: ${prediction.cropName}`
            : `¿${prediction.cropName}?`}
        </p>
        <p className="text-xs text-gray-500">
          Confianza: {confidencePct}%
          {!isHigh && " — verifica manualmente"}
        </p>
      </div>

      {/* Botón limpiar */}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
          title="Descartar identificación"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
