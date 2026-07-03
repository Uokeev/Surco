import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";

const OnboardingSchema = z.object({
  usoPrincipal: z.enum(["hogar", "produccion", "ambos"]),
  region: z.string().min(1, "Región requerida").max(100),
  telefono: z.string().max(20).optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
    }

    const parsed = OnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") },
        { status: 400 }
      );
    }

    const { usoPrincipal, region, telefono } = parsed.data;

    // Guardar en user_metadata (funciona siempre, sin migraciones DB)
    const supabase = await createSupabaseServerClient();
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        onboarding_completado: true,
        uso_principal: usoPrincipal,
        region_preferida: region,
        telefono_contacto: telefono || undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Onboarding] Error inesperado:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/** GET: verifica si el usuario completó onboarding */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    // Revisar metadata del auth user (fuente de verdad)
    if (user.user_metadata?.onboarding_completado) {
      return NextResponse.json({ ok: true, completado: true });
    }

    return NextResponse.json({ ok: true, completado: false });
  } catch (error) {
    console.error("[Onboarding] Error checking:", error);
    return NextResponse.json({ ok: false, completado: false });
  }
}
