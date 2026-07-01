"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { WeatherWidget } from "@/components/Weather/WeatherWidget";
import { useWeather } from "@/hooks/useWeather";
import type { Diagnostico, AlertaZona } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { weather, loading: weatherLoading, requestLocation } = useWeather();
  const [historial, setHistorial] = useState<Diagnostico[]>([]);
  const [historialLoading, setHistorialLoading] = useState(true);
  const [alertas, setAlertas] = useState<AlertaZona[]>([]);

  const userName = user?.user_metadata?.full_name as string | undefined;
  const userPhoto = user?.user_metadata?.avatar_url as string | undefined;
  const firstName = userName?.split(" ")[0] ?? "Agricultor";

  // Cargar historial
  const loadHistory = useCallback(async () => {
    if (!user) return;
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
      console.warn("Error cargando historial:", e);
    } finally {
      setHistorialLoading(false);
    }
  }, [user]);

  // Cargar alertas
  const loadAlertas = useCallback(async () => {
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
      }
    } catch (e) {
      console.warn("Error cargando alertas:", e);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }
    if (user) {
      loadHistory();
      loadAlertas();
    }
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
      <main className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-5">
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
          📷 Nueva consulta
        </button>

        {/* Alertas de zona */}
        {alertas.length > 0 && (
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
                      {esLocal ? "⚠️" : "📍"}
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
          ) : historial.length === 0 ? (
            <div className="card border-dashed p-8 text-center">
              <p className="text-sm text-gray-500 leading-relaxed">
                Aún no tienes diagnósticos.
                <br />
                ¡Saca tu primera foto!
              </p>
            </div>
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
