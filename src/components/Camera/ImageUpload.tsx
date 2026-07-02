"use client";

import { useRef, useState, useCallback } from "react";
import { comprimirImagen } from "@/lib/utils";
import { useToastHelpers } from "@/components/ui/Toast";

interface ImageUploadProps {
  onImageReady: (base64: string, mime: string, file: File) => void;
  onClear: () => void;
}

export function ImageUpload({ onImageReady, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const toast = useToastHelpers();

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setCompressing(true);

      try {
        const { base64, mime } = await comprimirImagen(file, {
          maxDimension: 1200,
          quality: 0.8,
        });

        const previewUrl = `data:${mime};base64,${base64}`;
        setPreview(previewUrl);
        setFileName(file.name);
        onImageReady(base64, mime, file);
      } catch (err) {
        console.error("Error comprimiendo imagen:", err);
        toast.error("Error al procesar la imagen. Intenta con otra foto.");
      } finally {
        setCompressing(false);
      }
    },
    [onImageReady]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }, [onClear]);

  return (
    <div>
      {!preview ? (
        /* ⚠️ Usamos <label> en vez de <button> porque <input type="file">
             dentro de <button> es HTML inválido y no funciona en Safari/Chrome móvil */
        <label
          className={`w-full border-2 border-dashed border-forest-300/50 rounded-2xl py-10 px-5 text-center cursor-pointer hover:bg-forest-50/50 transition-colors block relative overflow-hidden ${
            compressing ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <div className="text-5xl mb-3">
            {compressing ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M5 22h14"/>
                <path d="M5 2h14"/>
                <path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/>
                <path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </div>
          <div className="text-base font-semibold text-forest-800 mb-1">
            {compressing ? "Comprimiendo imagen..." : "Fotografiar planta"}
          </div>
          <div className="text-sm text-gray-500">
            o elige desde la galería
          </div>
        </label>
      ) : (
        <div className="relative mb-4 rounded-2xl overflow-hidden bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa"
            className="w-full max-h-64 object-cover block"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-semibold text-forest-800">
            ✓ Lista
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 left-2 bg-black/50 hover:bg-black/60 text-white rounded-lg px-3 py-1 text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5 mr-1">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Cambiar
          </button>
          {fileName && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/80 truncate">
              {fileName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
