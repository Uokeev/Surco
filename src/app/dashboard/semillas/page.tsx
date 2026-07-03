"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { REGLAS_SEMILLAS } from "@/types";
import type { SemillaUsuario, TransaccionSemilla, ResumenClubSurco } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

const NIVEL_INFO: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  cosecha: { label: "Cosecha", emoji: "🌾", color: "text-amber-800", bg: "bg-amber-100" },
  oro: { label: "Oro", emoji: "🏆", color: "text-yellow-800", bg: "bg-yellow-100" },
};

function nivelInfo(nivel: string) {
  return NIVEL_INFO[nivel] ?? { label: nivel, emoji: "🌱", color: "text-gray-800", bg: "bg-gray-100" };
}

/** Explica cada tipo de semilla en lenguaje simple */
function explicarTipoSemilla(tipo: string): string {
  const map: Record<string, string> = {
    basica: "Se ganan con cada diagnóstico que realices",
    rara: "Se ganan por mantener rachas de uso y logros especiales",
    epica: "Se ganan por hitos importantes y objetivos cumplidos",
  };
  return map[tipo] ?? "";
}

export default function SemillasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [semillas, setSemillas] = useState<SemillaUsuario[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionSemilla[]>([]);
  const [resumen, setResumen] = useState<ResumenClubSurco | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = getSupabaseClient();

      const { data: semillasData } = await supabase
        .from("semillas_usuario")
        .select("tipo, cantidad, puntaje_total")
        .eq("user_id", user.id);

      if (semillasData) {
        setSemillas(semillasData as unknown as SemillaUsuario[]);
      }

      const { data: transData } = await supabase
        .from("transacciones_semillas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);

      if (transData) {
        setTransacciones(transData as unknown as TransaccionSemilla[]);
      }

      const { data: resumenData } = await supabase
        .from("resumen_club_surco")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (resumenData) setResumen(resumenData as unknown as ResumenClubSurco);
    } catch (e) {
      console.warn("Error cargando semillas:", e);
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

  if (authLoading || !user) return null;

  const tieneSemillas = semillas.some((s) => s.cantidad > 0);
  const totalPuntos = resumen?.semillas_acumuladas ?? 0;

  const semillasPorTipo = [
    { tipo: "basica", cantidad: semillas.find((s) => s.tipo === "basica")?.cantidad ?? 0, emoji: "🟢" },
    { tipo: "rara", cantidad: semillas.find((s) => s.tipo === "rara")?.cantidad ?? 0, emoji: "⭐" },
    { tipo: "epica", cantidad: semillas.find((s) => s.tipo === "epica")?.cantidad ?? 0, emoji: "💎" },
  ];

  const nivelActual = resumen?.nivel ?? "cosecha";
  const infoNivel = nivelInfo(nivelActual);

  const progresoOro = resumen
    ? [
        resumen.rut_verificado || resumen.telefono_verificado,
        resumen.total_diagnosticos >= 10,
        resumen.semillas_acumuladas >= 2000,
        resumen.datos_parcela_completos,
      ].filter(Boolean).length
    : 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header — simplificado */}
      <header className="bg-gradient-to-b from-forest-800 to-forest-900 px-5 pt-12 pb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors mb-3"
          aria-label="Volver al inicio"
        >
          ←
        </button>
        <h1 className="font-serif text-xl font-bold text-white">Club Surco</h1>
        <p className="text-xs text-white/50 mt-1">
          Gana puntos por usar la app y canjéalos por beneficios
        </p>

        {/* Puntaje total — ÚNICO número importante */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-xs text-white/50">Tus puntos</p>
          <p className="text-4xl font-bold text-white mt-0.5">{totalPuntos}</p>

          {/* Barra de nivel */}
          {resumen && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm">{infoNivel.emoji}</span>
              <span className={`text-xs font-semibold capitalize ${infoNivel.color} ${infoNivel.bg} px-2.5 py-0.5 rounded-full`}>
                {infoNivel.label}
              </span>
              <span className="text-xs text-white/40">
                · {resumen.racha_actual} días seguidos
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-4" tabIndex={-1}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !tieneSemillas && totalPuntos === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Todavía no tienes puntos"
            description="Cada vez que hagas un diagnóstico o uses la app, ganarás puntos que podrás canjear por descuentos y productos."
            action={
              <button
                type="button"
                onClick={() => router.push("/dashboard/camera")}
                className="btn-primary !rounded-xl !py-3"
              >
                Hacer un diagnóstico
              </button>
            }
          />
        ) : (
          <>
            {/* Tipos de semilla — explicados uno por uno */}
            <div className="card p-4">
              <h2 className="font-serif font-semibold text-gray-900 mb-3 text-sm">
                Tus semillas
              </h2>
              <div className="space-y-2.5">
                {semillasPorTipo.map((s) => (
                  <div key={s.tipo} className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">
                      {s.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 capitalize">{s.tipo}</p>
                        <span className="text-sm font-bold text-forest-700">{s.cantidad}</span>
                      </div>
                      <p className="text-xs text-gray-500">{explicarTipoSemilla(s.tipo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso de nivel */}
            {resumen && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif font-semibold text-gray-900 text-sm">
                    {infoNivel.emoji} Nivel {infoNivel.label}
                  </h2>
                  <span className="text-xs text-gray-500">{progresoOro}/4</span>
                </div>

                {nivelActual === "cosecha" ? (
                  <>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                        style={{ width: `${(progresoOro / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {nivelActual === "cosecha"
                        ? "Completa los requisitos para llegar a nivel Oro y desbloquear beneficios exclusivos"
                        : "Sigue así, cada vez más cerca del nivel Oro"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 font-medium">
                    ✅ Tienes todos los beneficios desbloqueados
                  </p>
                )}
              </div>
            )}

            {/* Cómo ganar puntos */}
            <div className="card p-4">
              <h2 className="font-serif font-semibold text-gray-900 mb-3 text-sm">
                Cómo ganar puntos
              </h2>
              <div className="space-y-2.5">
                {REGLAS_SEMILLAS.map((regla, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold shrink-0">
                      +{regla.puntos}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{regla.accion}</p>
                      <p className="text-xs text-gray-500">{regla.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ir a beneficios */}
            <button
              type="button"
              onClick={() => router.push("/dashboard/beneficios")}
              className="btn-primary !rounded-2xl !py-4 !text-base"
            >
              Canjear mis puntos por beneficios
            </button>

            {/* Últimas transacciones */}
            {transacciones.length > 0 && (
              <div className="card p-4">
                <h2 className="font-serif font-semibold text-gray-900 mb-3 text-sm">
                  Historial
                </h2>
                <div className="space-y-2.5">
                  {transacciones.map((t) => {
                    const esGanancia = t.tipo === "ganancia" || t.tipo === "bonus";
                    const fecha = new Date(t.created_at).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    });
                    return (
                      <div key={t.id} className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                          esGanancia ? "bg-green-100" : "bg-red-50"
                        }`}>
                          {esGanancia ? "➕" : "➖"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {t.razon.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-gray-500">{fecha}</p>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            esGanancia ? "text-forest-700" : "text-red-600"
                          }`}
                        >
                          {esGanancia ? "+" : "-"}
                          {t.cantidad}
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
