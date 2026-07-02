"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { REGLAS_SEMILLAS } from "@/types";
import type { SemillaUsuario, TransaccionSemilla, ResumenClubSurco } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

const SEMILLA_INFO: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  basica: { label: "Básica", emoji: "🌰", color: "text-amber-800", bg: "bg-amber-100" },
  rara: { label: "Rara", emoji: "💎", color: "text-blue-800", bg: "bg-blue-100" },
  epica: { label: "Épica", emoji: "🌟", color: "text-purple-800", bg: "bg-purple-100" },
};

function semillaInfo(tipo: string) {
  return SEMILLA_INFO[tipo] ?? { label: tipo, emoji: "❓", color: "text-gray-800", bg: "bg-gray-100" };
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
  const totalBasicas = semillas.find((s) => s.tipo === "basica")?.cantidad ?? 0;
  const totalRaras = semillas.find((s) => s.tipo === "rara")?.cantidad ?? 0;
  const totalEpicas = semillas.find((s) => s.tipo === "epica")?.cantidad ?? 0;

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
      {/* Header */}
      <header className="bg-gradient-to-b from-forest-800 to-forest-900 px-5 pt-12 pb-8">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors mb-3"
        >
          ←
        </button>
        <h1 className="font-serif text-xl font-bold text-white">Mis Semillas</h1>
        <p className="text-xs text-white/50 mt-1">
          Gana puntos y canjea por beneficios reales
        </p>

        {/* Contador principal — puntaje real desde resumen_club_surco */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs text-white/60">Puntaje total</p>
          <p className="text-3xl font-bold text-white">{resumen?.semillas_acumuladas ?? 0}</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { tipo: "basica", cantidad: totalBasicas },
              { tipo: "rara", cantidad: totalRaras },
              { tipo: "epica", cantidad: totalEpicas },
            ].map((s) => {
              const info = semillaInfo(s.tipo);
              return (
                <div key={s.tipo} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg">{info.emoji}</div>
                  <div className="text-sm font-bold text-white">{s.cantidad}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wider">{info.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rachas y nivel */}
        {resumen && (
          <div className="flex gap-2 mt-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-lg font-bold text-white leading-none">{resumen.racha_actual}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Racha (días)</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-2">
              <span className="text-lg">{resumen.nivel === "oro" ? "🏆" : "🌾"}</span>
              <div>
                <p className="text-lg font-bold text-white leading-none capitalize">{resumen.nivel}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Nivel</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-2">
              <span className="text-lg">📷</span>
              <div>
                <p className="text-lg font-bold text-white leading-none">{resumen.total_diagnosticos}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Diags.</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-5" tabIndex={-1}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !tieneSemillas && (resumen?.semillas_acumuladas ?? 0) === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Aún no tienes semillas"
            description="Realiza diagnósticos para ganar puntos y canjear por descuentos y productos reales."
            action={
              <button
                type="button"
                onClick={() => router.push("/dashboard/camera")}
                className="btn-primary !rounded-xl !py-3"
              >
                📷 Hacer un diagnóstico
              </button>
            }
          />
        ) : (
          <>
            {/* Progreso nivel Oro */}
            {resumen && resumen.nivel !== "oro" && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/perfil")}
                className="card p-4 w-full text-left hover:bg-forest-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif font-semibold text-gray-900">
                    🌾 Progreso nivel Oro
                  </h2>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    {progresoOro}/4
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${(progresoOro / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Completa los requisitos para desbloquear beneficios exclusivos →
                </p>
              </button>
            )}

            {/* Cómo ganar puntos */}
            <div className="card p-5">
              <h2 className="font-serif font-semibold text-gray-900 mb-3">
                📈 Gana puntos
              </h2>
              <div className="space-y-3">
                {REGLAS_SEMILLAS.map((regla, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{regla.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{regla.accion}</p>
                      <p className="text-xs text-gray-500">{regla.descripcion}</p>
                    </div>
                    <span className="text-sm font-bold text-forest-700 shrink-0">
                      +{regla.puntos}
                    </span>
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
              🎁 Canjear por beneficios
            </button>

            {/* Últimas transacciones */}
            {transacciones.length > 0 && (
              <div className="card p-5">
                <h2 className="font-serif font-semibold text-gray-900 mb-3">
                  📜 Últimas transacciones
                </h2>
                <div className="space-y-2.5">
                  {transacciones.map((t) => {
                    const info = semillaInfo(t.semilla_tipo);
                    const esGanancia = t.tipo === "ganancia" || t.tipo === "bonus";
                    const fecha = new Date(t.created_at).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    });
                    return (
                      <div key={t.id} className="flex items-center gap-3">
                        <span className="text-lg shrink-0">{info.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {t.razon.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fecha} · {info.label}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            esGanancia ? "text-forest-700" : "text-red-600"
                          }`}
                        >
                          {esGanancia ? "+" : "-"}
                          {t.cantidad} pts
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
