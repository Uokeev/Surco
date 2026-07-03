"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { WeatherWidget } from "@/components/Weather/WeatherWidget";
import { useWeather } from "@/hooks/useWeather";
import type { Diagnostico, AlertaZona } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { weather, loading: weatherLoading, requestLocation } = useWeather();
  const [historial, setHistorial] = useState<Diagnostico[]>([]);
  const [historialLoading, setHistorialLoading] = useState(true);
  const [historialError, setHistorialError] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<AlertaZona[]>([]);
  const [alertasError, setAlertasError] = useState<string | null>(null);

  const userName = user?.user_metadata?.full_name as string | undefined;
  const userPhoto = user?.user_metadata?.avatar_url as string | undefined;
  const firstName = userName?.split(" ")[0] ?? "Agricultor";

  // Cargar historial
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistorialError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("diagnosticos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setHistorial((data ?? []) as unknown as Diagnostico[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar historial";
      setHistorialError(msg);
    } finally {
      setHistorialLoading(false);
    }
  }, [user]);

  // Cargar alertas
  const loadAlertas = useCallback(async () => {
    setAlertasError(null);
    try {
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok && data.data) {
        setAlertas(data.data as unknown as AlertaZona[]);
      } else {
        throw new Error(data.error ?? "Error al cargar alertas");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar alertas";
      setAlertasError(msg);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }
    // Redirigir a onboarding si no lo ha completado
    if (user && !user.user_metadata?.onboarding_completado) {
      router.replace("/onboarding");
      return;
    }
    let cancelled = false;
    if (user) {
      loadHistory().then(() => {
        if (cancelled) return;
      });
      loadAlertas().then(() => {
        if (cancelled) return;
      });
    }
    return () => {
      cancelled = true;
    };
  }, [user, loading, router, loadHistory, loadAlertas]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-forest-800">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const inicial = (userName ?? "U")[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* Header */}
      <header className="bg-forest-800 px-5 pt-14 pb-7 text-white">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="font-serif text-2xl font-bold">Surco</div>
          <span className="text-xs text-white/40 italic">Cultiva inteligencia, cosecha resultados</span>
          <button
            type="button"
            onClick={signOut}
            className="ml-auto bg-white/15 hover:bg-white/25 text-white rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
          >
            Salir
          </button>
        </div>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
            {userPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              inicial
            )}
          </div>
          <span className="text-xs text-white/70">Hola, {firstName}</span>
        </div>
        <h1 className="font-serif text-2xl font-semibold leading-tight">
          ¿Cómo están tus cultivos hoy?
        </h1>
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-5" tabIndex={-1}>
        {/* Plan card */}
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Tu plan</p>
            <p className="font-serif font-semibold text-gray-900">
              Gratuito · Demo
            </p>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl font-bold text-forest-800 leading-none">
              ∞
            </div>
            <p className="text-xs text-gray-500">diagnósticos en demo</p>
          </div>
        </div>

        {/* Weather */}
        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          onRequestLocation={requestLocation}
        />

        {/* Nueva consulta */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/camera")}
          className="btn-primary !rounded-2xl !py-4 !text-base"
        >
          <svg className="w-5 h-5 inline-block mr-1.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Nueva consulta
        </button>

        {/* Catálogo de Plantas de Interior */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/plantas")}
          className="card p-4 w-full text-left hover:bg-forest-50/50 active:bg-forest-100/50 transition-all flex items-center gap-3"
        >
          <span className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M12 2v8m0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
              <path d="M2 12h8m0 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0z"/>
              <path d="M12 22v-8m0 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
              <path d="M22 12h-8m0 0a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/>
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Catálogo de Plantas de Interior 🌿</p>
            <p className="text-xs text-gray-500">Fichas técnicas, plagas y alertas estacionales</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Menú de navegación rápida — Surco Club */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-100">
            <NavButton
              svgPath={<SeedSvg />}
              label="Mis Semillas"
              sub="Puntos y rachas"
              onClick={() => router.push("/dashboard/semillas")}
            />
            <NavButton
              svgPath={<GiftSvg />}
              label="Beneficios"
              sub="Canjea descuentos"
              onClick={() => router.push("/dashboard/beneficios")}
            />
          </div>
          <div className="grid grid-cols-2">
            <NavButton
              svgPath={<ProfileSvg />}
              label="Mi Perfil"
              sub="Nivel Oro"
              onClick={() => router.push("/dashboard/perfil")}
            />
            <NavButton
              svgPath={<PlansSvg />}
              label="Planes"
              sub="Suscripciones"
              onClick={() => router.push("/dashboard/planes")}
            />
          </div>
        </div>

        {/* Alertas de zona */}
        {alertasError && (
          <section>
            <h2 className="sec-label">Alertas en tu zona</h2>
            <div className="card p-4 border-red-200 bg-red-50" role="alert">
              <p className="text-sm text-red-700 font-medium">Error al cargar alertas</p>
              <p className="text-xs text-red-600 mt-1">{alertasError}</p>
            </div>
          </section>
        )}
        {!alertasError && alertas.length > 0 && (
          <section>
            <h2 className="sec-label">Alertas en tu zona</h2>
            <div className="space-y-2">
              {alertas.map((a, i) => {
                const esLocal =
                  weather?.region &&
                  a.region
                    ?.toLowerCase()
                    .includes(weather.region.toLowerCase().replace("región del ", "").replace("región de ", "").replace("región ", ""));
                return (
                  <div
                    key={i}
                    className={`card p-3.5 flex items-start gap-2.5 ${
                      esLocal ? "bg-warm-50 border-warm-200" : ""
                    }`}
                  >
                    <span className="text-xl shrink-0">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {esLocal ? (
                        <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                      ) : (
                        <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>
                      )}
                    </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {a.enfermedad} en {a.cultivo}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.region} · {a.reportes} reporte
                        {a.reportes > 1 ? "s" : ""} reciente
                        {a.reportes > 1 ? "s" : ""}
                      </p>
                      {esLocal && (
                        <p className="text-xs font-semibold text-warm-700 mt-1">
                          Alerta en tu región — revisa tus cultivos
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Historial */}
        <section>
          <h2 className="sec-label">Historial reciente</h2>
          {historialLoading ? (
            <div className="card p-8 text-center">
              <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando historial...</p>
            </div>
          ) : historialError ? (
            <div className="card p-4 border-red-200 bg-red-50" role="alert">
              <p className="text-sm text-red-700 font-medium">Error al cargar historial</p>
              <p className="text-xs text-red-600 mt-1">{historialError}</p>
            </div>
          ) : historial.length === 0 ? (
            <EmptyState
              emoji=""
              title="Aún no tienes diagnósticos"
              description="Realiza tu primer diagnóstico"
            />
          ) : (
            <div className="space-y-2">
              {historial.map((h) => {
                const sevClass =
                  h.severidad === "Alta"
                    ? "bg-red-500"
                    : h.severidad === "Media"
                      ? "bg-warm-600"
                      : "bg-forest-500";
                const fecha = h.created_at
                  ? new Date(h.created_at).toLocaleDateString("es-CL")
                  : "—";

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => router.push(`/diagnostico/${h.id}`)}
                    className="card p-4 w-full text-left hover:bg-forest-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${sevClass}`}
                        />
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {h.enfermedad || "—"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {fecha}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500">
                        {h.crop} · {h.region}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-400"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

/** Botón cuadrado para el menú de navegación rápida. */
function NavButton({
  svgPath,
  label,
  sub,
  onClick,
}: {
  svgPath: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 flex flex-col items-center gap-1.5 hover:bg-forest-50/50 active:bg-forest-100/50 transition-colors"
    >
      <span className="w-7 h-7 text-forest-700">{svgPath}</span>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <span className="text-[10px] text-gray-500">{sub}</span>
    </button>
  );
}

/** SVGs inline para navegación */
function SeedSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 4 4 6 8 12 4-6 8-8 8-12a8 8 0 0 0-8-8z"/>
      <circle cx="12" cy="10" r="2" fill="currentColor"/>
    </svg>
  );
}

function GiftSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="22"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

function ProfileSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M3 21c0-5 4-9 9-9s9 4 9 9"/>
      <line x1="18" y1="3" x2="21" y2="6"/>
      <line x1="21" y1="3" x2="18" y2="6"/>
    </svg>
  );
}

function PlansSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
