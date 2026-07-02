import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

const PUNTOS_POR_CODIGO: Record<string, number> = {
  DIAGNOSTICO: 50,
  RACHA_7_DIAS: 100,
  REFERIDO: 200,
  RESEÑA: 80,
  PERFIL_PARCELA: 150,
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ puntos: number; total: number }>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { codigo, referencia_id } = body;

    if (!codigo || !PUNTOS_POR_CODIGO[codigo]) {
      return NextResponse.json(
        { ok: false, error: `Código de acción inválido: ${codigo}` },
        { status: 400 }
      );
    }

    const puntos = PUNTOS_POR_CODIGO[codigo];
    const supabase = await createSupabaseServerClient();

    // Otorgar puntos usando la función de base de datos con idempotencia
    const { data: nuevoTotal, error } = await supabase.rpc("otorgar_puntos_accion", {
      p_user_id: user.id,
      p_codigo_accion: codigo,
      p_referencia_id: referencia_id ?? null,
    });

    if (error) {
      console.error("[Club Puntos] Error en RPC:", error);
      return NextResponse.json(
        { ok: false, error: "Error al otorgar puntos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { puntos, total: nuevoTotal as unknown as number },
    });
  } catch (error) {
    console.error("[Club Puntos] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
