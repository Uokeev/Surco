"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ImageUpload } from "@/components/Camera/ImageUpload";
import { WeatherWidget } from "@/components/Weather/WeatherWidget";
import { DiagnosisResult } from "@/components/Diagnosis/DiagnosisResult";
import { useWeather } from "@/hooks/useWeather";
import { useDiagnosis } from "@/hooks/useDiagnosis";
import { useToastHelpers } from "@/components/ui/Toast";
import type { DiagnosticoResult, UsoTipo } from "@/types";

const CULTIVOS = [
  "Tomate", "Lechuga", "Papa", "Pepino", "Pimiento", "Zapallo",
  "Brócoli / Repollo", "Manzana", "Peral", "Cerezo", "Duraznero",
  "Ciruelo", "Palto / Aguacate", "Arándano", "Frutilla", "Nogal",
  "Vid / Uva", "Naranjo / Limón", "Maíz", "Trigo",
  "Planta ornamental", "Otro",
];

const REGIONES = [
  "Región del Maule", "Región del Biobío", "Región de O'Higgins",
  "Región de Valparaíso", "Región Metropolitana", "Región de La Araucanía",
  "Región de Los Lagos", "Otra región",
];

export default function CameraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { weather, loading: weatherLoading, coords, requestLocation } = useWeather();
  const { analyzing, progress, progressText, error, result, analyze, reset } = useDiagnosis();

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [crop, setCrop] = useState("");
  const [region, setRegion] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [usoTipo, setUsoTipo] = useState<UsoTipo>("hogar");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [view, setView] = useState<"form" | "analyzing" | "result">("form");
  const [lastResult, setLastResult] = useState<DiagnosticoResult | null>(null);

  const toast = useToastHelpers();

  const previewImage = imageBase64 ? `data:${imageMime};base64,${imageBase64}` : null;

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  // Voice recognition
  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.warning("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.warning("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "es-CL";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const texto = e.results[0]?.[0]?.transcript ?? "";
      setSymptoms(texto);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      recognitionRef.current = null;
      if (e.error !== "no-speech") {
        console.warn("Voice error:", e.error);
      }
    };
    recognition.start();
  }, [isListening]);

  const handleImageReady = useCallback(
    (base64: string, mime: string, _file: File) => {
      setImageBase64(base64);
      setImageMime(mime);
    },
    []
  );

  const handleClearImage = useCallback(() => {
    setImageBase64(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64 || !crop || !region) {
      toast.warning("Completa la foto, el cultivo y la región.");
      return;
    }

    setView("analyzing");

    const input = {
      imageBase64,
      imageMime,
      crop,
      region,
      symptoms,
      usoTipo,
      lat: coords?.lat,
      lon: coords?.lon,
    };

    const r = await analyze(input);

    if (r) {
      setLastResult(r);
      setView("result");
    } else {
      setView("form"); // Error: regresar al formulario
    }
  }, [imageBase64, imageMime, crop, region, symptoms, usoTipo, coords, analyze]);

  const handleNewQuery = useCallback(() => {
    reset();
    setImageBase64(null);
    setLastResult(null);
    setView("form");
    setCrop("");
    setRegion("");
    setSymptoms("");
  }, [reset]);

  if (authLoading || !user) return null;

  // ─── Pantalla de análisis ──────────────────────────
  if (view === "analyzing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 bg-white">
        <div className="text-center max-w-xs mx-auto">
          {/* Logo animado */}
          <div className="w-20 h-20 rounded-2xl bg-forest-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 2.5-1 4.8-2.5 6.5" />
              <path d="M12 2a10 10 0 0 0-10 10c0 5 3.6 9.2 8.4 10" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>

          <h2 className="font-serif text-xl font-bold text-gray-900 mb-1">
            Motor Surco IA activo
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Analizando tu planta
          </p>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            La IA estudia la imagen y prepara
            <br />
            tu diagnóstico personalizado
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-forest-500 to-forest-700 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3 text-left">
            {[
              { done: true, text: "Subiendo foto al servidor seguro" },
              { done: progress >= 30, text: "Consultando catálogo SAG / INIA" },
              { done: progress >= 50, text: "Analizando síntomas visuales" },
              { done: progress >= 75, text: "Guardando en tu historial" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step.done
                      ? "bg-forest-500 text-white"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm ${
                    step.done ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Pantalla de resultado ─────────────────────────
  if (view === "result" && lastResult) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="bg-forest-800 px-5 pt-12 pb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleNewQuery}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors shrink-0"
          >
            ←
          </button>
          <div>
            <h1 className="font-serif text-lg font-semibold text-white">
              Diagnóstico listo
            </h1>
            <p className="text-xs text-white/50">Guardado en tu historial</p>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto" tabIndex={-1}>
          <DiagnosisResult
            result={lastResult}
            crop={crop}
            region={region}
            previewImage={previewImage}
            weather={weather}
            usoTipo={usoTipo}
          />
        </main>
      </div>
    );
  }

  // ─── Pantalla de formulario (cámara) ────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* Topbar */}
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
            Analiza tu cultivo
          </h1>
          <p className="text-xs text-white/50">Nueva consulta</p>
        </div>
      </header>

      {/* Body */}
      <main id="main-content" className="flex-1 px-5 pt-5 pb-8 overflow-y-auto space-y-4" tabIndex={-1}>
        {/* Ubicación y clima */}
        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          onRequestLocation={requestLocation}
        />

        {/* Imagen */}
        <ImageUpload onImageReady={handleImageReady} onClear={handleClearImage} />

        {/* Contexto del cultivo */}
        <div className="card p-5">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">
            Contexto del cultivo
          </h2>

          <div className="space-y-3.5">
            {/* Tipo de cultivo */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Tipo de cultivo
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="select-field"
              >
                <option value="">— Seleccionar —</option>
                {CULTIVOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Región */}
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
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Uso */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                ¿Para qué usas la planta?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUsoTipo("hogar")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    usoTipo === "hogar"
                      ? "bg-forest-800 text-white border-forest-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  🏡 Huerto doméstico / jardín
                </button>
                <button
                  type="button"
                  onClick={() => setUsoTipo("produccion")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    usoTipo === "produccion"
                      ? "bg-forest-800 text-white border-forest-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  🌾 Producción agrícola
                </button>
              </div>
            </div>

            {/* Síntomas */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                ¿Qué observas? (opcional)
              </label>
              <div className="relative">
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe los síntomas: manchas, color, textura..."
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none pr-10"
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    isListening
                      ? "bg-warm-50 text-warm-700"
                      : "bg-white text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Dictar por voz"
                >
                  {isListening ? "⏹" : "🎤"}
                </button>
              </div>
              {isListening && (
                <p className="text-xs text-warm-600 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warm-500 animate-pulse" />
                  Escuchando... habla los síntomas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Botón analizar */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!imageBase64 || !crop || !region || analyzing}
          className="btn-primary !rounded-2xl !py-4 !text-base"
        >
          {analyzing ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </>
          ) : (
            "Analizar con IA"
          )}
        </button>
      </main>
    </div>
  );
}
