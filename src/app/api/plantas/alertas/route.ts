import { NextResponse } from "next/server";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse, AlertaTemporada } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/plantas/alertas
 * Retorna las alertas de temporada activas.
 * Query: ?temporada=invierno (opcional)
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<AlertaTemporada[]>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const temporada = searchParams.get("temporada");

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("alertas_temporada")
      .select("*")
      .eq("activo", true);

    if (temporada) {
      query = query.eq("temporada", temporada);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Alertas API] Error:", error);
      return NextResponse.json(
        { ok: false, error: "Error al obtener alertas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []) as AlertaTemporada[],
    });
  } catch (error) {
    console.error("[Alertas API] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
