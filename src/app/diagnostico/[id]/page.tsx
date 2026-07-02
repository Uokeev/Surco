"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { DiagnosisResult } from "@/components/Diagnosis/DiagnosisResult";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Diagnostico, UsoTipo } from "@/types";

export default function DiagnosticoDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiagnostico = useCallback(async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      const { data, error: dbError } = await supabase
        .from("diagnosticos")
        .select("*")
        .eq("id", id)
        .single();

      if (dbError) {
        if (dbError.code === "PGRST116") {
          setError("Diagnóstico no encontrado.");
        } else {
          setError("Error al cargar el diagnóstico.");
        }
        return;
      }

      if (!data) {
        setError("Diagnóstico no encontrado.");
        return;
      }

      // Verificar que pertenece al usuario
      if (data.user_id !== user.id) {
        setError("No tienes permiso para ver este diagnóstico.");
        return;
      }

      setDiagnostico(data as unknown as Diagnostico);
    } catch (e) {
      console.error("Error loading diagnostico:", e);
      setError("Error al cargar el diagnóstico.");
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    if (user && id) {
      loadDiagnostico();
    }
  }, [user, authLoading, router, id, loadDiagnostico]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-forest-600/30 border-t-forest-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Cargando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (error || !diagnostico) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-gray-100">
        <div className="text-4xl mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        <p className="text-gray-600 text-center mb-6">{error ?? "Diagnóstico no encontrado."}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="btn-primary !w-auto !px-8"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const result = {
    enfermedad: diagnostico.enfermedad,
    nombre_cientifico: diagnostico.nombre_cientifico ?? "",
    severidad: diagnostico.severidad as "Alta" | "Media" | "Baja",
    confianza: diagnostico.confianza,
    que_veo: diagnostico.sintomas_detectados ?? "",
    causa: diagnostico.causa ?? "",
    sintomas_detectados: diagnostico.sintomas_detectados ?? "",
    tratamiento: diagnostico.tratamiento ?? [],
    alerta_propagacion: diagnostico.alerta_propagacion ?? "",
    cuando_actuar: diagnostico.cuando_actuar ?? "",
    donde_comprar: diagnostico.donde_comprar ?? "",
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-forest-800 px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors shrink-0"
        >
          ←
        </button>
        <div>
          <h1 className="font-serif text-lg font-semibold text-white">
            Diagnóstico
          </h1>
          <p className="text-xs text-white/50">
            {new Date(diagnostico.created_at).toLocaleDateString("es-CL", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto" tabIndex={-1}>
        <DiagnosisResult
          result={result}
          crop={diagnostico.crop}
          region={diagnostico.region}
          previewImage={null}
          weather={diagnostico.clima as Diagnostico["clima"]}
          usoTipo="hogar"
        />
      </main>
    </div>
  );
}
