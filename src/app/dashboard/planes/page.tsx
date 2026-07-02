"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface PlanCard {
  id: string;
  nombre: string;
  precio: string;
  periodo: string;
  color: string;
  bgBadge: string;
  destacado: boolean;
  caracteristicas: { texto: string; incluido: boolean }[];
}

const PLANES: PlanCard[] = [
  {
    id: "gratuito",
    nombre: "Gratuito",
    precio: "$0",
    periodo: "/mes",
    color: "text-gray-700",
    bgBadge: "bg-gray-100",
    destacado: false,
    caracteristicas: [
      { texto: "10 diagnósticos por mes", incluido: true },
      { texto: "1 foto por diagnóstico", incluido: true },
      { texto: "Historial básico", incluido: true },
      { texto: "Alertas en tu zona", incluido: false },
      { texto: "Análisis prioritario", incluido: false },
      { texto: "Soporte prioritario", incluido: false },
    ],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: "$4.990",
    periodo: "/mes",
    color: "text-forest-800",
    bgBadge: "bg-forest-100",
    destacado: true,
    caracteristicas: [
      { texto: "100 diagnósticos por mes", incluido: true },
      { texto: "3 fotos por diagnóstico", incluido: true },
      { texto: "Historial completo", incluido: true },
      { texto: "Alertas en tu zona", incluido: true },
      { texto: "Análisis prioritario", incluido: false },
      { texto: "Soporte prioritario", incluido: false },
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: "$9.990",
    periodo: "/mes",
    color: "text-amber-800",
    bgBadge: "bg-amber-100",
    destacado: false,
    caracteristicas: [
      { texto: "Diagnósticos ilimitados", incluido: true },
      { texto: "5 fotos por diagnóstico", incluido: true },
      { texto: "Historial completo + exportar PDF", incluido: true },
      { texto: "Alertas en tu zona en tiempo real", incluido: true },
      { texto: "Análisis prioritario", incluido: true },
      { texto: "Soporte prioritario 24/7", incluido: true },
    ],
  },
];

export default function PlanesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) return null;

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
        <h1 className="font-serif text-xl font-bold text-white">Planes</h1>
        <p className="text-xs text-white/50 mt-1">
          Elige el plan ideal para tu campo
        </p>
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-6 pb-8 overflow-y-auto space-y-4" tabIndex={-1}>
        {PLANES.map((plan) => (
          <div
            key={plan.id}
            className={`relative card p-5 ${
              plan.destacado
                ? "ring-2 ring-forest-500 shadow-lg shadow-forest-500/10"
                : ""
            }`}
          >
            {plan.destacado && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                Más popular
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`font-serif text-lg font-bold ${plan.color}`}>
                  {plan.nombre}
                </h2>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {plan.precio}
                  </span>
                  <span className="text-sm text-gray-500">{plan.periodo}</span>
                </div>
              </div>
              <span
                className={`text-3xl ${plan.destacado ? "opacity-100" : "opacity-40"}`}
              >
                {plan.id === "gratuito" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V8"/>
                    <path d="M12 8c-2.5 0-5-2-5-5 0 3 1 5 5 6"/>
                    <path d="M12 8c2.5 0 5-2 5-5 0 3-1 5-5 6"/>
                  </svg>
                ) : plan.id === "pro" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V8"/>
                    <path d="M6 14c-3 0-5-2-5-5s2-5 5-5c.5 0 1 0 1.5.2C9 1 11.5 0 14 0c2.5 0 4.5 1 5.5 3.5 2 .3 4.5 1.5 4.5 4.5 0 3-2 5-5 5"/>
                    <path d="M12 22l-4-4"/>
                    <path d="M12 22l4-4"/>
                  </svg>
                )}
              </span>
            </div>

            <div className="space-y-2.5 mb-5">
              {plan.caracteristicas.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span
                    className={`text-base ${
                      c.incluido ? "text-forest-600" : "text-gray-300"
                    }`}
                  >
                    {c.incluido ? "✓" : "—"}
                  </span>
                  <span
                    className={`text-sm ${
                      c.incluido ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {c.texto}
                  </span>
                </div>
              ))}
            </div>

            {plan.id === "gratuito" ? (
              <div className="w-full bg-gray-100 text-gray-500 rounded-xl py-3.5 text-center text-sm font-semibold cursor-default">
                Plan actual
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary !rounded-xl !py-3.5"
              >
                Suscribirse
              </button>
            )}
          </div>
        ))}

        {/* Nota */}
        <p className="text-xs text-gray-400 text-center leading-relaxed pt-2">
          Cancela cuando quieras. Los pagos se procesan de forma segura.
          <br />
          Próximamente: pago con Webpay / Mercado Pago.
        </p>
      </main>
    </div>
  );
}
