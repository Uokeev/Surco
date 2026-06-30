import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import { buscarEnfermedadesSAG, construirPromptDiagnostico } from "@/lib/sag";
import { formatearClimaContexto } from "@/lib/weather";
import { getClientIP, validarImagenBase64, sanitizarTexto } from "@/lib/utils";
import { checkRateLimit, userKey, ipKey } from "@/lib/rate-limit";
import type { DiagnosticoResult, ApiResponse } from "@/types";

// ─── Validación con Zod ──────────────────────────────
const DiagnoseSchema = z.object({
  imageBase64: z.string().min(1, "Imagen requerida"),
  imageMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  crop: z.string().min(1, "Cultivo requerido").max(100),
  region: z.string().min(1, "Región requerida").max(100),
  symptoms: z.string().max(500).optional().default(""),
  usoTipo: z.enum(["hogar", "produccion"]),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DiagnosticoResult>>> {
  try {
    // ─── 1. Verificar autenticación ─────────────────
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión para diagnosticar." },
        { status: 401 }
      );
    }

    // ─── 2. Rate limiting por usuario ──────────────
    const rateResult = await checkRateLimit(userKey(user.id), {
      maxRequests: 5, // 5 diagnósticos por minuto por usuario
      windowMs: 60_000,
    });
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Has alcanzado el límite de diagnósticos. Espera un momento.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateResult.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // ─── 3. Validar cuerpo ─────────────────────────
    const body = await request.json();
    const parsed = DiagnoseSchema.safeParse(body);

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

    const { imageBase64, imageMime, crop, region, symptoms, usoTipo, lat, lon } =
      parsed.data;

    // Validar tamaño de imagen
    if (!validarImagenBase64(imageBase64)) {
      return NextResponse.json(
        { ok: false, error: "La imagen es demasiado grande (máx 3MB)." },
        { status: 400 }
      );
    }

    // Sanitizar inputs
    const cropSanitized = sanitizarTexto(crop);
    const regionSanitized = sanitizarTexto(region);
    const symptomsSanitized = sanitizarTexto(symptoms);

    // ─── 4. Obtener contexto SAG ──────────────────
    const { contexto: contextoSAG } = await buscarEnfermedadesSAG(
      cropSanitized,
      usoTipo
    );

    // ─── 5. Obtener clima (si hay coordenadas) ────
    let climaStr: string | undefined;
    if (lat !== undefined && lon !== undefined) {
      try {
        const { obtenerClima } = await import("@/lib/weather");
        const clima = await obtenerClima({ lat, lon });
        if (clima) {
          climaStr = formatearClimaContexto(clima);
        }
      } catch {
        console.warn("Error obteniendo clima para el prompt");
      }
    }

    // ─── 6. Construir prompt ──────────────────────
    const prompt = construirPromptDiagnostico({
      crop: cropSanitized,
      region: regionSanitized,
      symptoms: symptomsSanitized,
      usoTipo,
      contextoSAG,
      condicionesClimaticas: climaStr,
    });

    // ─── 7. Llamar al Worker de IA (desde servidor) ──
    // ═══════════════════════════════════════════════════
    //  La URL del Worker y la API key están en .env.local
    //  El cliente NUNCA ve esta URL ni la key
    // ═══════════════════════════════════════════════════
    const workerUrl = process.env.AI_WORKER_URL;
    const workerSecret = process.env.AI_WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      console.error("Faltan AI_WORKER_URL o AI_WORKER_SECRET en .env.local");
      return NextResponse.json(
        { ok: false, error: "Error de configuración del servidor de IA." },
        { status: 500 }
      );
    }

    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerSecret}`, // Autenticación servidor-a-servidor
        "X-Surco-Source": "nextjs-api",
      },
      body: JSON.stringify({
        imageBase64,
        imageMime,
        prompt,
      }),
      // Timeout de 30s para la IA
      signal: AbortSignal.timeout(30_000),
    });

    if (!workerResponse.ok) {
      const errorBody = await workerResponse.text().catch(() => "Unknown error");
      console.error("Worker error:", workerResponse.status, errorBody);
      return NextResponse.json(
        {
          ok: false,
          error: `Error del motor de IA (${workerResponse.status}). Intenta de nuevo.`,
        },
        { status: 502 }
      );
    }

    const workerData = await workerResponse.json();

    // ─── 8. Parsear respuesta del Worker ──────────
    // El Worker devuelve: { content: [{ text: "..." }] } (OpenAI-compatible)
    // o directamente { enfermedad: "...", ... }
    let rawText: string;
    if (workerData.content && Array.isArray(workerData.content)) {
      rawText = workerData.content.map((b: { text?: string }) => b.text ?? "").join("");
    } else if (workerData.text) {
      rawText = workerData.text;
    } else if (workerData.enfermedad) {
      // Ya viene parseado
      rawText = JSON.stringify(workerData);
    } else {
      rawText = JSON.stringify(workerData);
    }

    // Limpiar posibles backticks JSON
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    let result: DiagnosticoResult;
    try {
      result = JSON.parse(cleanedText) as DiagnosticoResult;
    } catch {
      console.error("Error parseando respuesta de IA:", cleanedText.substring(0, 300));
      return NextResponse.json(
        { ok: false, error: "Error al procesar el diagnóstico. Intenta de nuevo." },
        { status: 502 }
      );
    }

    // Validar campos esenciales
    if (!result.enfermedad) {
      return NextResponse.json(
        { ok: false, error: "El diagnóstico no identificó una enfermedad válida." },
        { status: 422 }
      );
    }

    // ─── 9. Guardar en base de datos ──────────────
    const supabase = await createSupabaseServerClient();

    const { data: diagnosticoInsertado, error: dbError } = await supabase
      .from("diagnosticos")
      .insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name ?? null,
        crop: cropSanitized,
        region: regionSanitized,
        symptoms: symptomsSanitized || null,
        clima: climaStr ? { ...JSON.parse(climaStr) } : null,
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

    if (dbError) {
      console.error("Error guardando diagnóstico:", dbError);
      // No bloqueamos la respuesta, pero logueamos
    }

    // ─── 10. Actualizar zona y alerta (fire-and-forget) ──
    const diagnosticoId = diagnosticoInsertado?.id;

    try {
      const supabaseAdmin = await createSupabaseServerClient();

      // Incrementar zona
      await supabaseAdmin.rpc("incrementar_zona", {
        p_region: regionSanitized,
        p_crop: cropSanitized,
        p_enfermedad: result.enfermedad,
      });

      // Registrar alerta si es una enfermedad real
      if (
        result.enfermedad !== "Sin enfermedad detectada" &&
        result.enfermedad !== ""
      ) {
        await supabaseAdmin.rpc("registrar_alerta_zona", {
          p_enfermedad: result.enfermedad,
          p_cultivo: cropSanitized,
          p_region: regionSanitized,
          p_lat: lat ?? null,
          p_lon: lon ?? null,
        });
      }
    } catch (e) {
      console.warn("Error actualizando agregados:", e);
    }

    // ─── 11. Responder ────────────────────────────
    return NextResponse.json(
      {
        ok: true,
        data: {
          ...result,
          id: diagnosticoId,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateResult.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Error en diagnose API:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, error: "Cuerpo de solicitud inválido." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
