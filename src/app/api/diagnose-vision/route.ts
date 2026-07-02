import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { validarImagenBase64, sanitizarTexto } from "@/lib/utils";
import { checkRateLimit, userKey } from "@/lib/rate-limit";
import { buscarManual } from "@/data/manuales-plantas";
import type { ApiResponse, DiagnosticoResult } from "@/types";

// ─── Validación ─────────────────────────────────
const DiagnoseVisionSchema = z.object({
  detectedPlant: z.string().min(1, "Planta detectada requerida").max(100),
  userQuery: z.string().min(1, "Consulta del usuario requerida").max(1000),
  imageBase64: z.string().min(1, "Imagen requerida"),
  imageMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DiagnosticoResult>>> {
  try {
    // ─── 1. Autenticación ────────────────────────
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // ─── 2. Rate limiting ────────────────────────
    const rateResult = await checkRateLimit(userKey(user.id), {
      maxRequests: 8,
      windowMs: 60_000,
    });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { ok: false, error: "Has alcanzado el límite. Espera un momento." },
        { status: 429 }
      );
    }

    // ─── 3. Validar body ─────────────────────────
    let body: unknown;
    try {
      const raw = await request.text();
      if (!raw || raw.trim().length === 0) {
        return NextResponse.json(
          { ok: false, error: "Cuerpo vacío." },
          { status: 400 }
        );
      }
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "JSON inválido." },
        { status: 400 }
      );
    }

    const parsed = DiagnoseVisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Datos inválidos: ${parsed.error.issues
            .map((i) => i.path.join(".") + ": " + i.message)
            .join("; ")}`,
        },
        { status: 400 }
      );
    }

    const { detectedPlant, userQuery, imageBase64, imageMime } = parsed.data;

    // Validar tamaño de imagen
    if (!validarImagenBase64(imageBase64)) {
      return NextResponse.json(
        { ok: false, error: "La imagen es demasiado grande (máx 3MB)." },
        { status: 400 }
      );
    }

    const plantSanitized = sanitizarTexto(detectedPlant);
    const querySanitized = sanitizarTexto(userQuery);

    // ─── 4. Buscar manual RAG ────────────────────
    const manual = buscarManual(plantSanitized);

    if (!manual) {
      return NextResponse.json(
        {
          ok: false,
          error: `No tengo información técnica sobre "${detectedPlant}". Prueba con el diagnóstico general.`,
        },
        { status: 404 }
      );
    }

    // ─── 5. Construir prompt RAG ─────────────────
    const prompt = `Actúa como el agrónomo experto de la app Surco, especializado en plantas de interior y jardín.

El sistema de visión ha detectado que la planta del usuario es una **${manual.nombre}** (${manual.nombreCientifico}).

Usa ESTRICTAMENTE el siguiente manual técnico para responder. NO inventes datos, dosis, síntomas ni tratamientos fuera de este contexto:

--- INICIO MANUAL TÉCNICO ---
${manual.textoManual}
--- FIN MANUAL TÉCNICO ---

El usuario reporta el siguiente problema en su ${manual.nombre}:
"${querySanitized}"

Analiza la imagen adjunta junto con el problema reportado. Genera un diagnóstico amigable, rápido y preciso.

Responde ÚNICAMENTE con JSON válido (sin texto adicional ni backticks):
{
  "enfermedad": "nombre descriptivo del problema en español (máx 50 chars)",
  "nombre_cientifico": "nombre científico del patógeno o condición si aplica, o vacío",
  "severidad": "Alta" | "Media" | "Baja",
  "confianza": 85,
  "que_veo": "descripción de lo que observas en la imagen relacionado al problema reportado, 2-3 oraciones en lenguaje simple",
  "causa": "por qué ocurre este problema según el manual, explicado simple, 2 oraciones máximo",
  "sintomas_detectados": "síntomas específicos que coinciden con el manual y la imagen, 2 oraciones",
  "tratamiento": [
    "Paso 1 — Acción inmediata: qué hacer primero (basado ESTRICTAMENTE en el manual)",
    "Paso 2 — Tratamiento específico: producto o cuidado específico con detalles",
    "Paso 3 — Prevención: cómo evitar que vuelva a ocurrir"
  ],
  "alerta_propagacion": "¿puede afectar otras plantas? basado en la plaga/condición identificada",
  "cuando_actuar": "urgencia basada en severidad: hoy / esta semana / puede esperar",
  "donde_comprar": "recomendación de tipo de tienda"
}

Severidad debe ser EXACTAMENTE "Alta", "Media" o "Baja". Confianza entre 55 y 97.
Si la imagen no muestra un problema claro o no hay suficiente información para diagnosticar, usa enfermedad "No se detecta problema claro" con confianza menor a 65.`;

    // ─── 6. Llamar al Worker de IA ──────────────
    const workerUrl = process.env.AI_WORKER_URL;
    const workerSecret = process.env.AI_WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      console.error("[DiagnoseVision] Faltan AI_WORKER_URL o AI_WORKER_SECRET");
      return NextResponse.json(
        { ok: false, error: "Error de configuración del servidor de IA." },
        { status: 500 }
      );
    }

    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerSecret}`,
        "X-Surco-Source": "nextjs-api-vision",
      },
      body: JSON.stringify({
        imageBase64,
        imageMime,
        prompt,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!workerResponse.ok) {
      const errorBody = await workerResponse.text().catch(() => "Unknown error");
      console.error("[DiagnoseVision] Worker error:", workerResponse.status, errorBody);
      return NextResponse.json(
        { ok: false, error: `Error del motor de IA (${workerResponse.status}). Intenta de nuevo.` },
        { status: 502 }
      );
    }

    // ─── 7. Parsear respuesta ────────────────────
    let workerData: unknown;
    try {
      workerData = await workerResponse.json();
    } catch {
      const rawBody = await workerResponse.text().catch(() => "No se pudo leer");
      console.error("[DiagnoseVision] Worker no devolvió JSON:", rawBody.substring(0, 500));
      return NextResponse.json(
        { ok: false, error: "Error al procesar el diagnóstico. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // Extraer texto del Worker (mismos formatos que diagnose route)
    const wd = workerData as Record<string, unknown>;
    let rawText: string | null = null;

    if (wd.content && Array.isArray(wd.content)) {
      rawText = wd.content.map((b: Record<string, unknown>) => String(b.text ?? "")).join("");
    } else if (wd.result && typeof wd.result === "object") {
      const r = wd.result as Record<string, unknown>;
      rawText = String(r.response ?? r.text ?? "");
    } else if (wd.response && typeof wd.response === "string") {
      rawText = wd.response;
    } else if (wd.text && typeof wd.text === "string") {
      rawText = wd.text;
    } else if (wd.enfermedad) {
      rawText = JSON.stringify(wd);
    }

    if (!rawText) {
      rawText = JSON.stringify(wd);
    }

    const cleanedText = rawText.replace(/```(?:json)?/gi, "").trim();

    let result: DiagnosticoResult;
    try {
      result = JSON.parse(cleanedText) as DiagnosticoResult;
    } catch {
      console.error("[DiagnoseVision] Error parseando respuesta:", cleanedText.substring(0, 500));
      return NextResponse.json(
        { ok: false, error: "Error al procesar el diagnóstico. Intenta de nuevo." },
        { status: 502 }
      );
    }

    if (!result.enfermedad) {
      return NextResponse.json(
        { ok: false, error: "El diagnóstico no identificó un problema válido." },
        { status: 422 }
      );
    }

    // ─── 8. Guardar en base de datos ────────────
    let diagnosticoId: string | undefined;
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = await createSupabaseServerClient();

      const { data: inserted } = await supabase
        .from("diagnosticos")
        .insert({
          user_id: user.id,
          user_name: user.user_metadata?.full_name ?? null,
          crop: plantSanitized,
          region: "—",
          symptoms: querySanitized || null,
          enfermedad: result.enfermedad,
          nombre_cientifico: result.nombre_cientifico ?? null,
          severidad: result.severidad ?? "Media",
          confianza: result.confianza ?? 70,
          causa: result.causa ?? null,
          sintomas_detectados: result.sintomas_detectados ?? null,
          tratamiento: result.tratamiento ?? null,
          alerta_propagacion: result.alerta_propagacion ?? null,
          cuando_actuar: result.cuando_actuar ?? null,
          donde_comprar: result.donde_comprar ?? null,
        })
        .select("id")
        .single();

      diagnosticoId = inserted?.id;
    } catch (e) {
      console.warn("[DiagnoseVision] Error guardando:", e);
    }

    // ─── 9. Responder ───────────────────────────
    return NextResponse.json(
      {
        ok: true,
        data: {
          ...result,
          id: diagnosticoId,
          planta_detectada: plantSanitized,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error("[DiagnoseVision] Error inesperado:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor.";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
