import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse, EnfermedadSAG } from "@/types";

const SagSchema = z.object({
  cultivo: z.string().min(1).max(100),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<EnfermedadSAG[]>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = SagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Cultivo inválido." },
        { status: 400 }
      );
    }

    const { cultivo } = parsed.data;

    const supabase = await createSupabaseServerClient();

    // Buscar por cultivo exacto y también enfermedades polifágas
    const { data: especificas } = await supabase
      .from("enfermedades_sag")
      .select("*")
      .eq("cultivo", cultivo);

    const { data: polifagas } = await supabase
      .from("enfermedades_sag")
      .select("*")
      .eq("cultivo", "Otro");

    const todas = [...(especificas ?? []), ...(polifagas ?? [])];

    return NextResponse.json({ ok: true, data: todas as EnfermedadSAG[] });
  } catch (error) {
    console.error("Error en SAG API:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
