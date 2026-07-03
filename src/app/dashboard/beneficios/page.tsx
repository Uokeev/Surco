"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToastHelpers } from "@/components/ui/Toast";
import type { CatalogoBeneficio, CanjeUsuario, ResumenClubSurco } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIAS: Record<string, { label: string; icon: string; color: string }> = {
  quimicos: { label: "Agroquímicos", icon: "quimicos", color: "border-l-amber-500" },
  educacion: { label: "Educación", icon: "educacion", color: "border-l-blue-500" },
  herramientas: { label: "Herramientas", icon: "herramientas", color: "border-l-green-500" },
  descuentos: { label: "Descuentos", icon: "descuentos", color: "border-l-purple-500" },
};

export default function BeneficiosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [catalogo, setCatalogo] = useState<CatalogoBeneficio[]>([]);
  const [canjes, setCanjes] = useState<CanjeUsuario[]>([]);
  const [resumen, setResumen] = useState<ResumenClubSurco | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [canjeando, setCanjeando] = useState<string | null>(null);

  const toast = useToastHelpers();

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = getSupabaseClient();

      // Cargar resumen del club
      const { data: resumenData } = await supabase
        .from("resumen_club_surco")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (resumenData) setResumen(resumenData as unknown as ResumenClubSurco);

      // Cargar catálogo de beneficios
      const { data: catalogoData } = await supabase
        .from("catalogo_beneficios")
        .select("*")
        .eq("activo", true)
        .order("costo_puntos", { ascending: true });

      if (catalogoData) setCatalogo(catalogoData as unknown as CatalogoBeneficio[]);

      // Cargar canjes del usuario
      const { data: canjesData } = await supabase
        .from("canjes_usuario")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (canjesData) setCanjes(canjesData as unknown as CanjeUsuario[]);
    } catch (e) {
      console.warn("Error cargando beneficios:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  const handleCanjear = useCallback(async (beneficio: CatalogoBeneficio) => {
    if (!user || !resumen) return;
    if (resumen.semillas_totales < beneficio.costo_puntos) {
      toast.warning("No tienes suficientes semillas para este beneficio.");
      return;
    }

    setCanjeando(beneficio.id);
    try {
      const supabase = getSupabaseClient();

      // Usar RPC que descuenta de semillas_acumuladas y registra el canje
      const { data, error } = await supabase.rpc("canjear_beneficio", {
        p_user_id: user.id,
        p_beneficio_id: beneficio.id,
      });

      if (error) throw error;

      const result = data as unknown as {
        ok: boolean;
        error?: string;
        codigo_canje?: string;
        item?: string;
        partner?: string;
        costo?: number;
        saldo_restante?: number;
        diagnosticos_extra?: number;
        nuevo_limite?: number;
      };

      if (!result.ok) {
        toast.error(result.error ?? "Error al procesar el canje.");
        return;
      }

      // Mensaje específico para diagnósticos extra
      if (result.diagnosticos_extra && result.diagnosticos_extra > 0) {
        toast.success(
          `¡Canje exitoso! Obtuviste +${result.diagnosticos_extra} diagnósticos extra. ` +
          `Ahora tienes ${result.nuevo_limite} diagnósticos disponibles este mes.`
        );
      } else {
        toast.success(
          `Canje exitoso: ${result.item} (código: ${result.codigo_canje}). ` +
          `Te contactará ${result.partner}.`
        );
      }
      loadData(); // Recargar
    } catch (e) {
      console.error("Error al canjear:", e);
      toast.error("Error al procesar el canje. Intenta de nuevo.");
    } finally {
      setCanjeando(null);
    }
  }, [user, resumen, loadData]);

  if (authLoading || !user) return null;

  const catalogoFiltrado = categoriaFiltro
    ? catalogo.filter((b) => b.categoria === categoriaFiltro)
    : catalogo;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-forest-800 px-5 pt-12 pb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors mb-3"
        >
          ←
        </button>
        <h1 className="font-serif text-xl font-bold text-white">Beneficios</h1>
        <p className="text-xs text-white/50 mt-1">
          Canjea tus semillas por productos y descuentos reales
        </p>

        {/* Puntaje total (semillas acumuladas) */}
        {resumen && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Tu puntaje</p>
              <p className="text-2xl font-bold text-white">{resumen.semillas_totales}</p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Semillas: {resumen.semillas_totales} pts
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Nivel</p>
              <p className="text-lg font-bold text-white capitalize">{resumen.nivel}</p>
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-4" tabIndex={-1}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Filtros de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                type="button"
                onClick={() => setCategoriaFiltro(null)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                  !categoriaFiltro
                    ? "bg-forest-800 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                Todos
              </button>
              {Object.entries(CATEGORIAS).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoriaFiltro(key)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    categoriaFiltro === key
                      ? "bg-forest-800 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de beneficios */}
            {catalogoFiltrado.length === 0 ? (
              <EmptyState
                emoji=""
                title="No hay beneficios disponibles"
                description="No encontramos beneficios en esta categoría."
              />
            ) : (
              catalogoFiltrado.map((beneficio) => {
                const cat = CATEGORIAS[beneficio.categoria] ?? { label: "", icon: "", color: "border-l-gray-500" };
                const puedeCanjear = (resumen?.semillas_totales ?? 0) >= beneficio.costo_puntos;
                return (
                  <div
                    key={beneficio.id}
                    className={`card p-4 border-l-4 ${cat.color} ${
                      !puedeCanjear ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-xs font-bold flex items-center justify-center">{cat.label[0]}</span>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {beneficio.partner}
                          </span>
                        </div>
                        <h3 className="font-serif font-semibold text-gray-900">
                          {beneficio.item}
                        </h3>
                        {beneficio.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {beneficio.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-forest-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a8 8 0 0 0-8 8c0 4 4 6 8 12 4-6 8-8 8-12a8 8 0 0 0-8-8z"/>
                          <circle cx="12" cy="10" r="2" fill="currentColor"/>
                        </svg>
                        <span className="text-sm font-bold text-forest-800">
                          {beneficio.costo_puntos}
                        </span>
                        <span className="text-xs text-gray-500">pts</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCanjear(beneficio)}
                        disabled={!puedeCanjear || canjeando === beneficio.id}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                          puedeCanjear
                            ? "bg-forest-100 text-forest-800 hover:bg-forest-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canjeando === beneficio.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                            Canjeando...
                          </span>
                        ) : (
                          "Canjear"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Historial de canjes */}
            {canjes.length > 0 && (
              <div className="card p-5">
                <h2 className="font-serif font-semibold text-gray-900 mb-3">
                  Tus canjes
                </h2>
                <div className="space-y-2.5">
                  {canjes.map((c) => {
                    const beneficio = catalogo.find((b) => b.id === c.beneficio_id);
                    const estadoClase =
                      c.estado === "aprobado" || c.estado === "entregado"
                        ? "text-green-700 bg-green-50"
                        : c.estado === "rechazado"
                          ? "text-red-700 bg-red-50"
                          : "text-warm-700 bg-warm-50";
                    const fecha = new Date(c.created_at).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    });
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 12 20 22 4 22 4 12"/>
                          <rect x="2" y="7" width="20" height="5" rx="1"/>
                          <line x1="12" y1="7" x2="12" y2="22"/>
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {beneficio?.item ?? "Beneficio"}
                          </p>
                          <p className="text-xs text-gray-500">{fecha}</p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${estadoClase}`}>
                          {c.estado}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          -{c.puntos_gastados}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
