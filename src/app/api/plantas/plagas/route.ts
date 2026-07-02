import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse, PlagaRelacionada } from "@/types";

export const dynamic = "force-dynamic";

const PlagasSchema = z.object({
  nombre_planta: z.string().min(1, "Nombre de planta requerido"),
});

/**
 * POST /api/plantas/plagas
 * Retorna las plagas y enfermedades asociadas a una planta.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PlagaRelacionada[]>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = PlagasSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Nombre de planta inválido." },
        { status: 400 }
      );
    }

    const { nombre_planta } = parsed.data;
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("obtener_plagas_por_planta", {
      p_nombre_planta: nombre_planta,
    });

    if (error) {
      console.error("[Plantas Plagas API] Error:", error);
      return NextResponse.json(
        { ok: false, error: "Error al obtener plagas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []) as PlagaRelacionada[],
    });
  } catch (error) {
    console.error("[Plantas Plagas API] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
