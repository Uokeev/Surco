/**
 * Comprime una imagen a un máximo de dimensiones y calidad JPEG.
 * Retorna Base64 sin el prefijo data URL.
 */
export function comprimirImagen(
  file: File,
  options?: { maxDimension?: number; quality?: number }
): Promise<{ base64: string; mime: string; width: number; height: number }> {
  const MAX = options?.maxDimension ?? 1200;
  const QUALITY = options?.quality ?? 0.8;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Escalar manteniendo aspecto
        if (w > h && w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else if (h > w && h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        } else if (w > MAX) {
          w = MAX;
          h = MAX;
        }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

        const compressed = canvas.toDataURL("image/jpeg", QUALITY);
        const base64 = compressed.split(",")[1]!;
        resolve({ base64, mime: "image/jpeg", width: w, height: h });
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Extrae la IP real del cliente desde los headers de Next.js.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Valida que una imagen Base64 no exceda un tamaño máximo.
 */
export function validarImagenBase64(base64: string, maxBytes = 3 * 1024 * 1024): boolean {
  const bytes = (base64.length * 3) / 4;
  return bytes <= maxBytes;
}

/**
 * Sanitiza un texto para evitar inyección en prompts.
 */
export function sanitizarTexto(texto: string): string {
  return texto
    .replace(/[\x00-\x1F]/g, " ") // caracteres de control
    .replace(/{|}|`|\\/g, "") // caracteres que interfieren con JSON
    .trim()
    .substring(0, 500); // límite de longitud
}

/**
 * Mapea nombre de región desde Nominatim al valor del select.
 */
export function normalizarRegion(nombre: string): string {
  const mapa: Record<string, string> = {
    maule: "Región del Maule",
    biobío: "Región del Biobío",
    "biobio": "Región del Biobío",
    "o'higgins": "Región de O'Higgins",
    "ohiggins": "Región de O'Higgins",
    valparaíso: "Región de Valparaíso",
    "valparaiso": "Región de Valparaíso",
    metropolitana: "Región Metropolitana",
    araucanía: "Región de La Araucanía",
    "araucania": "Región de La Araucanía",
    "los lagos": "Región de Los Lagos",
  };

  const lower = nombre.toLowerCase().replace("región del ", "").replace("región de ", "").replace("región ", "").trim();
  return mapa[lower] ?? nombre;
}

/**
 * Sleep utility.
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
