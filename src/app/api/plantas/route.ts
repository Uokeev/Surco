import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse, CatalogoPlanta, PlagaRelacionada, AlertaTemporada } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/plantas
 * Retorna el catálogo completo de plantas de interior con fichas técnicas.
 * Query params: ?nombre=xxx (opcional) para filtrar por nombre exacto.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CatalogoPlanta[]>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get("nombre");

    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("catalogo_plantas")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (nombre) {
      query = query.eq("nombre", nombre);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Plantas API] Error:", error);
      return NextResponse.json(
        { ok: false, error: "Error al obtener catálogo de plantas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []) as CatalogoPlanta[],
    });
  } catch (error) {
    console.error("[Plantas API] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
