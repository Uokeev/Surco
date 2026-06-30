import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse, AlertaZona } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AlertaZona[]>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("alertas_zona")
      .select("*")
      .gte("reportes", 2) // Solo alertas con 2+ reportes
      .order("reportes", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Error al obtener alertas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []) as AlertaZona[],
    });
  } catch (error) {
    console.error("Error en alerts API:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
