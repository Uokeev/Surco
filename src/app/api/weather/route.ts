import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { obtenerClima } from "@/lib/weather";
import type { ApiResponse, CondicionesClimaticas } from "@/types";

const WeatherSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CondicionesClimaticas>>> {
  try {
    // Verificar auth
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    // Validar
    const body = await request.json();
    const parsed = WeatherSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Coordenadas inválidas." },
        { status: 400 }
      );
    }

    const { lat, lon } = parsed.data;

    const clima = await obtenerClima({ lat, lon });

    if (!clima) {
      return NextResponse.json(
        { ok: false, error: "No se pudo obtener el clima." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data: clima });
  } catch (error) {
    console.error("Error en weather API:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
