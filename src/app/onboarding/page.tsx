"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { REGIONES } from "@/lib/constants";

type UsoPrincipal = "hogar" | "produccion" | "ambos";
type Step = "bienvenida" | "uso" | "region" | "listo";

export default function OnboardingPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("bienvenida");
  const [nombre, setNombre] = useState(user?.user_metadata?.full_name ?? "");
  const [usoPrincipal, setUsoPrincipal] = useState<UsoPrincipal | null>(null);
  const [region, setRegion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sincronizar nombre cuando carga user
  if (user && !nombre && user.user_metadata?.full_name) {
    setNombre(user.user_metadata.full_name);
  }

  const handleSubmit = useCallback(async () => {
    if (!usoPrincipal || !region || saving) return;

    setSaving(true);
    setError("");

    try {
      // Guardar en DB via API
      const supabase = getSupabaseClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usoPrincipal, region, telefono }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Error al guardar");

      // Actualizar metadata local como respaldo
      if (user) {
        await supabase.auth.updateUser({
          data: {
            onboarding_completado: true,
            uso_principal: usoPrincipal,
            region_preferida: region,
          },
        });
      }

      setStep("listo");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSaving(false);
    }
  }, [usoPrincipal, region, telefono, saving, router, user]);

  // Si está cargando auth, mostrar spinner
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-forest-800">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay sesión, mostrar pantalla de login
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-gradient-to-b from-forest-800 to-forest-900 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
          <span className="text-3xl">🌱</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">Surco</h1>
        <p className="text-sm text-white/60 mb-8 max-w-xs">
          Diagnóstico fitosanitario con IA para agricultores chilenos
        </p>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full max-w-xs bg-white text-gray-800 rounded-xl py-3.5 px-5 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-100 transition-colors shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>
        <p className="text-xs text-white/40 mt-4 max-w-xs">
          Al continuar, aceptas nuestros Términos y Política de Privacidad
        </p>
      </div>
    );
  }

  // ─── Progreso ─────────────────────────────────
  const stepIndex = step === "bienvenida" ? 0 : step === "uso" ? 1 : step === "region" ? 2 : 3;
  const totalPasos = 3;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header con progreso */}
      <header className="bg-gradient-to-b from-forest-800 to-forest-900 px-6 pt-14 pb-8">
        <div className="flex items-center gap-1.5 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= stepIndex ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <h1 className="font-serif text-xl font-bold text-white">
          {step === "bienvenida" && "¡Bienvenido a Surco!"}
          {step === "uso" && "¿Para qué usarás la app?"}
          {step === "region" && "¿Dónde estás ubicado?"}
          {step === "listo" && "¡Todo listo!"}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          Paso {stepIndex + 1} de {totalPasos}
        </p>
      </header>

      {/* Body */}
      <main className="flex-1 px-6 pt-8 pb-8 overflow-y-auto">
        {step === "bienvenida" && (
          <div className="space-y-6 animate-[fadeSlideIn_0.3s_ease-out]  ">
            <div className="text-center">
              <span className="text-5xl block mb-3">🌱</span>
              <p className="text-base text-gray-700 leading-relaxed">
                Te vamos a ayudar a cuidar tus plantas con inteligencia artificial.
                Solo necesitamos algunos datos para empezar.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="input-field"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep("uso")}
              disabled={!nombre.trim()}
              className="btn-primary !rounded-2xl !py-4 !text-base disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        )}

        {step === "uso" && (
          <div className="space-y-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <p className="text-sm text-gray-500">
              Esto nos ayuda a darte recomendaciones más precisas.
            </p>

            {([
              { value: "hogar", emoji: "🏡", label: "Hogar / Jardín", desc: "Plantas de interior, jardín o huerto casero" },
              { value: "produccion", emoji: "🌾", label: "Producción agrícola", desc: "Cultivos comerciales, campo o invernadero" },
              { value: "ambos", emoji: "🌿", label: "Ambos", desc: "Tengo plantas en casa y también produzco" },
            ] as const).map((opcion) => (
              <button
                key={opcion.value}
                type="button"
                onClick={() => { setUsoPrincipal(opcion.value); setStep("region"); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  usoPrincipal === opcion.value
                    ? "border-forest-600 bg-forest-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opcion.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{opcion.label}</p>
                    <p className="text-xs text-gray-500">{opcion.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "region" && (
          <div className="space-y-5 animate-[fadeSlideIn_0.3s_ease-out]">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Región
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="select-field"
              >
                <option value="">— Selecciona tu región —</option>
                {REGIONES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Para enviarte alertas de plagas y recordatorios
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!region || saving}
              className="btn-primary !rounded-2xl !py-4 !text-base disabled:opacity-40"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                "¡Empezar!"
              )}
            </button>
          </div>
        )}

        {step === "listo" && (
          <div className="flex flex-col items-center justify-center py-12 animate-[fadeSlideIn_0.3s_ease-out]">
            <span className="text-6xl mb-4">🎉</span>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
              ¡Listo, {nombre || "agricultor"}!
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Ya puedes diagnosticar tus plantas con IA
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
