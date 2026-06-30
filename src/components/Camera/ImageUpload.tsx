"use client";

import { useRef, useState, useCallback } from "react";
import { comprimirImagen } from "@/lib/utils";

interface ImageUploadProps {
  onImageReady: (base64: string, mime: string, file: File) => void;
  onClear: () => void;
}

export function ImageUpload({ onImageReady, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

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
        alert("Error al procesar la imagen. Intenta con otra foto.");
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

  const handleZoneClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div>
      {!preview ? (
        <button
          type="button"
          onClick={handleZoneClick}
          disabled={compressing}
          className="w-full border-2 border-dashed border-forest-300/50 rounded-2xl py-10 px-5 text-center cursor-pointer hover:bg-forest-50/50 transition-colors relative overflow-hidden disabled:opacity-60"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFile}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="text-5xl mb-3">
            {compressing ? "⏳" : "📷"}
          </div>
          <div className="text-base font-semibold text-forest-800 mb-1">
            {compressing ? "Comprimiendo imagen..." : "Fotografiar planta"}
          </div>
          <div className="text-sm text-gray-500">
            o elige desde la galería
          </div>
        </button>
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
            ↩ Cambiar
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
