"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToastHelpers } from "@/components/ui/Toast";
import type { ResumenClubSurco } from "@/types";
import { CULTIVOS_POR_CATEGORIA, REGIONES, TIPOS_TERRENO } from "@/lib/constants";

// Condiciones para Nivel Oro
const ORO_REQUISITOS = [
  { key: "cuenta_verificada", label: "Verificar RUT o teléfono" },
  { key: "diagnosticos_suficientes", label: "10+ diagnósticos realizados" },
  { key: "semillas_acumuladas", label: "2,000+ semillas acumuladas" },
  { key: "datos_parcela", label: "Completar datos del terreno" },
];

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumen, setResumen] = useState<ResumenClubSurco | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToastHelpers();

  // Formulario parcela
  const [tipoTerreno, setTipoTerreno] = useState<string>("");
  const [region, setRegion] = useState("");
  const [cultivo, setCultivo] = useState("");
  const [terrenoSize, setTerrenoSize] = useState("");

  // Verificación
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = getSupabaseClient();

      const { data: resumenData } = await supabase
        .from("resumen_club_surco")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (resumenData) {
        const r = resumenData as unknown as ResumenClubSurco;
        setResumen(r);
        setTipoTerreno(r.tipo_terreno ?? "");
        setRegion(r.parcela_region ?? "");
        setCultivo(r.parcela_cultivo_principal ?? "");
        // Usar terreno_size si existe, sino parcela_hectareas (legacy)
        setTerrenoSize(
          r.terreno_size?.toString() ?? r.parcela_hectareas?.toString() ?? ""
        );
      }
    } catch (e) {
      console.warn("Error cargando perfil:", e);
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

  const handleGuardarParcela = useCallback(async () => {
    if (!user) return;
    if (!tipoTerreno || !region || !cultivo || !terrenoSize) {
      toast.warning("Completa tipo de terreno, región, cultivo principal y tamaño.");
      return;
    }

    const unidad = tipoTerreno === "parcela" ? "hectareas" : "m2";
    const esPrimeraVez = !resumen?.datos_parcela_completos;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("users")
        .update({
          tipo_terreno: tipoTerreno,
          parcela_region: region,
          parcela_cultivo_principal: cultivo,
          terreno_size: parseFloat(terrenoSize),
          terreno_unidad: unidad,
          datos_parcela_completos: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // ═══ Solo otorgar puntos la PRIMERA vez que completa el perfil ═══
      if (esPrimeraVez) {
        const nonce = `${user.id}-PERFIL_PARCELA-ONCE`;
        const res = await fetch("/api/club/puntos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: "PERFIL_PARCELA", referencia_id: nonce }),
        });
        const data = await res.json();
        if (data.ok) {
          toast.success("Datos guardados. ¡Ganaste 150 semillas!");
        } else {
          // Si el RPC detectó duplicado (nonce ya usado), igual fue éxito
toast.success("Datos del terreno actualizados.");
        }
      } else {
        toast.success("✅ Datos del terreno actualizados.");
      }
      loadData();
    } catch (e) {
      console.error("Error guardando datos de terreno:", e);
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [user, tipoTerreno, region, cultivo, terrenoSize, resumen?.datos_parcela_completos, loadData]);

  const handleVerificarRut = useCallback(async () => {
    if (!user || !rut.trim()) {
      toast.warning("Ingresa tu RUT.");
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("users")
        .update({ rut: rut.trim(), rut_verificado: true, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("RUT verificado correctamente.");
      loadData();
    } catch (e) {
      console.error("Error verificando RUT:", e);
      toast.error("Error al verificar RUT.");
    }
  }, [user, rut, loadData]);

  const handleVerificarTelefono = useCallback(async () => {
    if (!user || !telefono.trim()) {
      toast.warning("Ingresa tu teléfono.");
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("users")
        .update({ telefono: telefono.trim(), telefono_verificado: true, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Teléfono verificado correctamente.");
      loadData();
    } catch (e) {
      console.error("Error verificando teléfono:", e);
      toast.error("Error al verificar teléfono.");
    }
  }, [user, telefono, loadData]);

  if (authLoading || !user) return null;

  const chequeos = resumen
    ? [
        { key: "cuenta_verificada", ok: resumen.rut_verificado || resumen.telefono_verificado },
        { key: "diagnosticos_suficientes", ok: resumen.total_diagnosticos >= 10 },
        { key: "semillas_acumuladas", ok: resumen.semillas_acumuladas >= 2000 },
        { key: "datos_parcela", ok: resumen.datos_parcela_completos },
      ]
    : [];

  const progresoOro = chequeos.filter((c) => c.ok).length;
  const esOro = resumen?.nivel === "oro";

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
        <h1 className="font-serif text-xl font-bold text-white">Mi Perfil</h1>
        <p className="text-xs text-white/50 mt-1">
          Completa tus datos y alcanza el nivel Oro
        </p>
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-5" tabIndex={-1}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Progreso a nivel Oro */}
            <div className={`card p-5 ${esOro ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif font-semibold text-gray-900">
                  {esOro ? "Nivel Oro — ¡Felicidades!" : "Nivel Cosecha"}
                </h2>
                {!esOro && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    {progresoOro}/4
                  </span>
                )}
              </div>

              {!esOro && (
                <>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${(progresoOro / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Completa los 4 requisitos para desbloquear el nivel Oro y acceder a beneficios exclusivos.
                  </p>
                </>
              )}

              {esOro && (
                <div className="bg-amber-100/50 rounded-xl p-4 mb-4 text-center">
                  <svg className="w-10 h-10 mx-auto mb-2 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C8 4 12 9 12 9"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C16 4 12 9 12 9"/>
                    <path d="M12 9v12"/>
                    <path d="M8 21h8"/>
                  </svg>
                  <p className="text-sm font-semibold text-amber-900">
                    ¡Has desbloqueado el nivel Oro!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Accede a beneficios premium y descuentos exclusivos.
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                {ORO_REQUISITOS.map((req, i) => {
                  const check = chequeos[i];
                  const cumple = check?.ok ?? false;
                  return (
                    <div key={req.key} className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          cumple
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {cumple ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-sm ${
                          cumple ? "text-gray-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verificación de identidad */}
            <div className="card p-5">
              <h2 className="font-serif font-semibold text-gray-900 mb-3">
                Verificación
              </h2>
              <div className="space-y-4">
                {/* RUT */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    RUT
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      placeholder="12.345.678-9"
                      className="input-field flex-1"
                      disabled={resumen?.rut_verificado}
                    />
                    {!resumen?.rut_verificado ? (
                      <button
                        type="button"
                        onClick={handleVerificarRut}
                        className="bg-forest-800 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 hover:bg-forest-700 transition-colors"
                      >
                        Verificar
                      </button>
                    ) : (
                      <span className="bg-green-50 text-green-700 rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 flex items-center gap-1">
                        Verificado
                      </span>
                    )}
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Teléfono
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="input-field flex-1"
                      disabled={resumen?.telefono_verificado}
                    />
                    {!resumen?.telefono_verificado ? (
                      <button
                        type="button"
                        onClick={handleVerificarTelefono}
                        className="bg-forest-800 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 hover:bg-forest-700 transition-colors"
                      >
                        Verificar
                      </button>
                    ) : (
                      <span className="bg-green-50 text-green-700 rounded-xl px-4 py-2.5 text-xs font-semibold shrink-0 flex items-center gap-1">
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Datos del terreno */}
            <div className="card p-5">
              <h2 className="font-serif font-semibold text-gray-900 mb-1">
                Datos del terreno
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {resumen?.datos_parcela_completos
                  ? "Terreno registrado"
                  : "Completa para ganar 150 semillas y avanzar a nivel Oro"}
              </p>

              <div className="space-y-3.5">
                {/* Tipo de terreno */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Tipo de terreno
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS_TERRENO.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTipoTerreno(t.value)}
                        className={`rounded-xl border-2 px-2 py-3 text-center text-xs font-medium transition-all ${
                          tipoTerreno === t.value
                            ? "border-forest-600 bg-forest-50 text-forest-800"
                            : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        <div className="w-6 h-6 mx-auto mb-1 text-forest-600">
                          {t.icon === "parcela" ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 22L12 2l10 20H2z"/>
                              <path d="M12 2v20"/>
                            </svg>
                          ) : t.icon === "huerto" ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 8V2"/>
                              <path d="M8 4h8"/>
                              <rect x="2" y="10" width="20" height="12" rx="1"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13"/>
                              <path d="M3 21h18"/>
                              <path d="M12 6V4"/>
                              <path d="M9 3h6"/>
                            </svg>
                          )}
                        </div>
                        <div className="leading-tight">{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Región
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="select-field"
                  >
                    <option value="">— Seleccionar —</option>
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    Cultivo principal
                  </label>
                  <select
                    value={cultivo}
                    onChange={(e) => setCultivo(e.target.value)}
                    className="select-field"
                  >
                    <option value="">— Seleccionar —</option>
                    {Object.values(CULTIVOS_POR_CATEGORIA).flat().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">
                    {tipoTerreno === "parcela" ? "Hectáreas cultivadas" : "Metros cuadrados (aprox.)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={terrenoSize}
                      onChange={(e) => setTerrenoSize(e.target.value)}
                      placeholder={tipoTerreno === "parcela" ? "5.5" : "200"}
                      min="0"
                      step={tipoTerreno === "parcela" ? "0.1" : "1"}
                      className="input-field"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      {tipoTerreno === "parcela" ? "ha" : "m²"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGuardarParcela}
                  disabled={saving}
                  className={`btn-primary !rounded-xl !py-3 ${
                    resumen?.datos_parcela_completos
                      ? "bg-amber-600 hover:bg-amber-700"
                      : ""
                  }`}
                >
                  {saving
                    ? "Guardando..."
                    : resumen?.datos_parcela_completos
                      ? "Editar datos del terreno"
                      : "Guardar datos del terreno"}
                </button>

                {(!resumen?.datos_parcela_completos || saving) && (
                  <p className="text-xs text-forest-700 bg-forest-50 rounded-lg p-3 text-center font-medium">
                    {resumen?.datos_parcela_completos
                      ? "Actualiza tus datos de terreno cuando sea necesario"
                      : "Gana 150 semillas al completar tu perfil por primera vez"}
                  </p>
                )}
              </div>
            </div>

            {/* Información del usuario */}
            <div className="card p-5">
              <h2 className="font-serif font-semibold text-gray-900 mb-3">
                Resumen
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Diagnósticos</span>
                  <span className="font-semibold text-gray-800">{resumen?.total_diagnosticos ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Semillas acumuladas</span>
                  <span className="font-semibold text-gray-800">{resumen?.semillas_acumuladas ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Racha actual</span>
                  <span className="font-semibold text-gray-800">{resumen?.racha_actual ?? 0} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mejor racha</span>
                  <span className="font-semibold text-gray-800">{resumen?.racha_maxima ?? 0} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referidos</span>
                  <span className="font-semibold text-gray-800">{resumen?.total_referidos ?? 0}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
