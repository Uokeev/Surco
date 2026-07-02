"use client";

import { useState, useCallback, type ReactNode } from "react";

interface CalculatorProps {
  tratamientos: string[];
}

type CalcTab = "arbol" | "huerto" | "predio";

interface CalculoProducto {
  nombre: string;
  dosis: number;
  unidad: string;
  medidaCasera: string;
  litrosBase: number;
}

export function Calculator({ tratamientos }: CalculatorProps) {
  const [tab, setTab] = useState<CalcTab>("arbol");
  const [resultado, setResultado] = useState<CalculoProducto[] | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [litrosTotales, setLitrosTotales] = useState(0);

  const [arbolSize, setArbolSize] = useState(15);
  const [arbolCant, setArbolCant] = useState(1);
  const [largo, setLargo] = useState<number>(0);
  const [ancho, setAncho] = useState<number>(0);
  const [equipoHuerto, setEquipoHuerto] = useState("pulverizador_manual");
  const [ha, setHa] = useState<number>(0);
  const [equipoPredio, setEquipoPredio] = useState("espalda");

  const m2Preview = largo > 0 && ancho > 0 ? largo * ancho : null;

  const tabs: { id: CalcTab; label: string; icon: ReactNode }[] = [
    { id: "arbol", label: "Un árbol", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8"/>
        <path d="M6 14c-3 0-5-2-5-5s2-5 5-5c.5 0 1 0 1.5.2C9 1 11.5 0 14 0c2.5 0 4.5 1 5.5 3.5 2 .3 4.5 1.5 4.5 4.5 0 3-2 5-5 5"/>
        <path d="M12 22l-4-4"/>
        <path d="M12 22l4-4"/>
      </svg>
    ) },
    { id: "huerto", label: "Mi huerto", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8"/>
        <path d="M9 4c-2 0-4 2-4 4 0 2 1 3 3 4"/>
        <path d="M15 4c2 0 4 2 4 4 0 2-1 3-3 4"/>
        <path d="M8 16h8"/>
        <path d="M10 22h4"/>
        <path d="M12 16v6"/>
      </svg>
    ) },
    { id: "predio", label: "Predio / ha", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V10"/>
        <path d="M12 10c-2 0-5-2-5-5 0 3 1 5 3 6"/>
        <path d="M12 10c2 0 5-2 5-5 0 3-1 5-3 6"/>
        <path d="M9 14c2 1 4 1 6 0"/>
      </svg>
    ) },
  ];

  const calcularDosis = useCallback(() => {
    let litros = 0;
    let desc = "";
    const litrosHa: Record<string, number> = {
      espalda: 400,
      mochila_motor: 600,
      tractor: 800,
      dron: 15,
    };

    if (tab === "arbol") {
      if (arbolCant < 1) return;
      litros = arbolSize * arbolCant;
      const tamanoLabel =
        arbolSize <= 5
          ? "pequeños"
          : arbolSize <= 15
            ? "medianos"
            : arbolSize <= 30
              ? "grandes"
              : "muy grandes";
      desc = `${arbolCant} árbol${arbolCant > 1 ? "es" : ""} ${tamanoLabel} · ${litros} L totales`;
    } else if (tab === "huerto") {
      if (!largo || !ancho) return;
      const m2 = largo * ancho;
      const hectarea = m2 / 10000;
      const ltsHa =
        equipoHuerto === "pulverizador_manual"
          ? 50
          : equipoHuerto === "mochila_manual"
            ? 150
            : 400;
      litros = Math.max(0.5, ltsHa * hectarea);
      desc = `Huerto de ${m2.toFixed(0)} m² (${largo}×${ancho}m) · ${litros.toFixed(1)} L totales`;
    } else {
      if (!ha || ha <= 0) return;
      litros = (litrosHa[equipoPredio] ?? 400) * ha;
      desc = `${ha} ha con ${equipoPredio.replace("_", " ")} · ${Math.round(litros)} L totales`;
    }

    setLitrosTotales(litros);

    // Calcular productos
    const productos: CalculoProducto[] = tratamientos.map((p, i) => {
      const matchKg = p.match(/(\d+[\.,]?\d*)\s*kg\/100[Ll]/);
      const matchL = p.match(/(\d+[\.,]?\d*)\s*[Ll]\/100[Ll]/);
      const dosis100 = matchKg
        ? parseFloat(matchKg[1]!)
        : matchL
          ? parseFloat(matchL[1]!)
          : null;
      const unidad = matchKg ? "kg" : matchL ? "L" : null;
      const nombre =
        p.split("—")[1]?.split(":")[0]?.trim() ??
        p.split(":")[0]
          ?.replace(/^Paso \d+\s*[-—]?\s*/, "")
          ?.trim() ??
        `Producto ${i + 1}`;

      if (dosis100 && unidad) {
        const total = (dosis100 * litros) / 100;
        let medidaCasera = "";
        if (unidad === "L" && total < 0.1) {
          medidaCasera = `≈ ${Math.round(total * 1000)} ml`;
        } else if (unidad === "kg" && total < 0.1) {
          medidaCasera = `≈ ${Math.round(total * 1000)} g`;
        } else if (unidad === "kg" && total < 0.01) {
          medidaCasera = `≈ ${Math.round(total * 1000 * 5)} cucharaditas`;
        }

        return {
          nombre,
          dosis: total,
          unidad,
          medidaCasera,
          litrosBase: litros,
        };
      }

      return {
        nombre,
        dosis: 0,
        unidad: "",
        medidaCasera: "Consultar etiqueta",
        litrosBase: litros,
      };
    });

    setDescripcion(desc);
    setResultado(productos);
  }, [tab, arbolSize, arbolCant, largo, ancho, equipoHuerto, ha, equipoPredio, tratamientos]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-1">
        Calculadora de dosis
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        ¿Cuánto necesitas? Elige tu situación:
      </p>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setResultado(null);
            }}
            className={`px-2 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all ${
              tab === t.id
                ? "bg-forest-800 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="block text-base mb-0.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel Árbol */}
      {tab === "arbol" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Aplicamos directo al árbol con una cantidad fija de agua
          </p>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Tamaño del árbol
            </label>
            <select
              value={arbolSize}
              onChange={(e) => setArbolSize(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
            >
              <option value={5}>Pequeño — hasta 1.5m → 5 L</option>
              <option value={15}>
                Mediano — 1.5 a 3m (ej: duraznero joven) → 15 L
              </option>
              <option value={30}>
                Grande — 3 a 5m (ej: manzano adulto, palto) → 30 L
              </option>
              <option value={60}>
                Muy grande — más de 5m (ej: nogal, naranjo) → 60 L
              </option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              ¿Cuántos árboles?
            </label>
            <input
              type="number"
              value={arbolCant}
              min={1}
              onChange={(e) => setArbolCant(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
          </div>
        </div>
      )}

      {/* Panel Huerto */}
      {tab === "huerto" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Ingresa las medidas de tu huerto
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Largo (m)
              </label>
              <input
                type="number"
                value={largo || ""}
                placeholder="Ej: 10"
                step={0.5}
                min={0.5}
                onChange={(e) => setLargo(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Ancho (m)
              </label>
              <input
                type="number"
                value={ancho || ""}
                placeholder="Ej: 5"
                step={0.5}
                min={0.5}
                onChange={(e) => setAncho(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
              />
            </div>
          </div>
          {m2Preview && (
            <div className="bg-forest-50 rounded-lg px-3 py-2 text-sm text-forest-800 font-medium">
              Tu huerto tiene {m2Preview.toFixed(1)} m² ({largo}m × {ancho}
              m)
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Equipo que usas
            </label>
            <select
              value={equipoHuerto}
              onChange={(e) => setEquipoHuerto(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
            >
              <option value="pulverizador_manual">
                Pulverizador manual de mano (1–2 L)
              </option>
              <option value="mochila_manual">Mochila manual (8–20 L)</option>
              <option value="espalda">
                Bomba de espalda a presión (400 L/ha)
              </option>
            </select>
          </div>
        </div>
      )}

      {/* Panel Predio */}
      {tab === "predio" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Para producción agrícola con equipos de mayor volumen
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Superficie (ha)
              </label>
              <input
                type="number"
                value={ha || ""}
                placeholder="Ej: 2.5"
                step={0.1}
                min={0.1}
                onChange={(e) => setHa(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Equipo
              </label>
              <select
                value={equipoPredio}
                onChange={(e) => setEquipoPredio(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300"
              >
                <option value="espalda">Bomba de espalda (400 L/ha)</option>
                <option value="mochila_motor">
                  Mochila motor (600 L/ha)
                </option>
                <option value="tractor">Tractor (800 L/ha)</option>
                <option value="dron">Dron agrícola (15 L/ha)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={calcularDosis}
        className="w-full bg-forest-800 text-white rounded-xl py-3 text-sm font-semibold hover:bg-forest-700 transition-colors mt-4"
      >
        Calcular dosis
      </button>

      {resultado && (
        <div className="mt-4 bg-forest-50 rounded-xl p-4 border border-forest-200/50">
          <p className="text-xs font-semibold text-forest-800 mb-3">
            {descripcion}
          </p>
          <div className="divide-y divide-forest-200/50">
            {resultado.map((p, i) => (
              <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-800">
                  {p.nombre}
                </p>
                {p.dosis > 0 ? (
                  <>
                    <p className="text-lg font-bold text-forest-800 mt-0.5">
                      {p.dosis < 0.01
                        ? "< 0.01"
                        : p.dosis.toFixed(p.dosis < 0.1 ? 3 : 2)}{" "}
                      {p.unidad}
                      {p.medidaCasera && (
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          ({p.medidaCasera})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      en {Math.round(p.litrosBase)} litros de agua
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.medidaCasera}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5 mr-1">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Siempre verifica la dosis en la etiqueta del producto. No
            mezclar productos sin consultar.
          </p>
        </div>
      )}
    </div>
  );
}
