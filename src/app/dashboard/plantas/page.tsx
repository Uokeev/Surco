"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePlantas } from "@/hooks/usePlanta";
import { PlantaCard } from "@/components/Plantas/PlantaCard";
import type { CatalogoPlanta } from "@/types";

const DIFICULTAD_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "dificil", label: "Difícil" },
];

const LUZ_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "baja", label: "Sombra / baja" },
  { value: "media", label: "Luz media" },
  { value: "brillante", label: "Luz brillante" },
  { value: "directa", label: "Sol directo" },
];

export default function CatalogoPlantasPage() {
  const router = useRouter();
  const { plantas, loading, error, fetchPlantas } = usePlantas();
  const [search, setSearch] = useState("");
  const [filtroDificultad, setFiltroDificultad] = useState("todas");
  const [filtroLuz, setFiltroLuz] = useState("todas");

  useEffect(() => {
    let cancelled = false;
    fetchPlantas().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPlantas]);

  const plantasFiltradas = useMemo(() => {
    let filtered = plantas;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.nombre_cientifico?.toLowerCase().includes(q) ||
          p.descripcion_corta?.toLowerCase().includes(q)
      );
    }

    if (filtroDificultad !== "todas") {
      filtered = filtered.filter((p) => p.dificultad === filtroDificultad);
    }

    if (filtroLuz !== "todas") {
      filtered = filtered.filter((p) => p.luz === filtroLuz);
    }

    return filtered;
  }, [plantas, search, filtroDificultad, filtroLuz]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors mb-3"
          aria-label="Volver atrás"
        >
          ←
        </button>
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Catálogo de Plantas de Interior 🌿
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Explora nuestra guía completa de cuidados.
          {plantas.length > 0 && ` ${plantas.length} plantas disponibles.`}
        </p>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 bg-white">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Buscar planta
            </label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por nombre, científico o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* Filtro dificultad */}
          <select
            value={filtroDificultad}
            onChange={(e) => setFiltroDificultad(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            {DIFICULTAD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Dificultad: {opt.label}
              </option>
            ))}
          </select>

          {/* Filtro luz */}
          <select
            value={filtroLuz}
            onChange={(e) => setFiltroLuz(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            {LUZ_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Luz: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-500" />
          <span className="ml-3 text-sm text-gray-500">Cargando plantas...</span>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 text-red-700">
          <p className="font-medium text-sm">Error</p>
          <p className="text-xs mt-1">{error}</p>
          <button
            type="button"
            onClick={fetchPlantas}
            className="mt-2 text-xs font-medium underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && plantasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            {search || filtroDificultad !== "todas" || filtroLuz !== "todas"
              ? "No se encontraron plantas con esos filtros."
              : "No hay plantas disponibles en el catálogo."}
          </p>
        </div>
      )}

      {/* Grid de plantas */}
      {!loading && !error && plantasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantasFiltradas.map((planta) => (
            <PlantaCard
              key={planta.id}
              planta={planta}
              onClick={() => router.push(`/dashboard/planta/${encodeURIComponent(planta.nombre)}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
