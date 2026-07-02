"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlantas } from "@/hooks/usePlanta";
import { PlantaCuidado } from "@/components/Plantas/PlantaCuidado";
import type { CatalogoPlanta } from "@/types";

export default function PlantaDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { fetchPlanta, plantaActual, loadingDetalle, error } = usePlantas();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (params?.id && !loaded) {
      const nombre = decodeURIComponent(params.id);
      let cancelled = false;
      fetchPlanta(nombre).then(() => {
        if (cancelled) return;
      });
      setLoaded(true);
      return () => {
        cancelled = true;
      };
    }
  }, [params?.id, fetchPlanta, loaded]);

  // Loading state
  if (loadingDetalle && !plantaActual) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest-500" />
          <span className="text-sm text-gray-500">Cargando ficha técnica...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!loadingDetalle && error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-6 bg-red-50 border border-red-200 text-center">
          <p className="text-red-700 font-medium text-sm">No se pudo cargar la planta</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 text-sm font-medium text-forest-600 hover:text-forest-700 underline underline-offset-2"
          >
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Not found
  if (!loadingDetalle && !plantaActual && !error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-6 text-center">
          <p className="text-gray-700 font-medium">Planta no encontrada</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/plantas")}
            className="mt-4 text-sm font-medium text-forest-600 hover:text-forest-700 underline underline-offset-2"
          >
            ← Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  if (!plantaActual) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navegación */}
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Ficha técnica */}
      <PlantaCuidado planta={plantaActual} />
    </div>
  );
}
