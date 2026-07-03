import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

const PLAN_CONFIG: Record<string, { label: string; limite: number }> = {
  gratuito: { label: "Gratuito", limite: 10 },
  pro: { label: "Pro", limite: 100 },
  premium: { label: "Premium", limite: 9999 },
};

const SetPlanSchema = z.object({
  plan: z.enum(["gratuito", "pro", "premium"]),
  userId: z.string().optional(), // si no se envía, aplica al usuario autenticado
});

/**
 * POST /api/admin/plan
 * Cambia el plan de un usuario.
 *
 * Uso:
 *   curl -X POST /api/admin/plan \
 *     -H "Authorization: Bearer <token>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"plan": "pro"}'
 *
 *   Para cambiar otro usuario (solo el mismo usuario o mediante RPC):
 *     -d '{"plan": "premium", "userId": "uuid-del-usuario"}'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ plan: string; diagnosticos_limite: number }>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SetPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Plan inválido. Usa: gratuito, pro o premium." },
        { status: 400 }
      );
    }

    const { plan, userId } = parsed.data;
    const targetUserId = userId ?? user.id;

    // Solo permitir cambiar al propio usuario (seguridad básica)
    if (targetUserId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Solo puedes cambiar tu propio plan." },
        { status: 403 }
      );
    }

    const config = PLAN_CONFIG[plan];
    if (!config) {
      return NextResponse.json(
        { ok: false, error: `Plan "${plan}" no reconocido.` },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("users")
      .update({
        plan,
        diagnosticos_limite: config.limite,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (error) {
      console.error("[Admin Plan] Error al actualizar:", error);
      return NextResponse.json(
        { ok: false, error: "Error al actualizar el plan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { plan, diagnosticos_limite: config.limite },
    });
  } catch (error) {
    console.error("[Admin Plan] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/plan
 * Devuelve la configuración de planes disponibles.
 */
export async function GET(): Promise<NextResponse<ApiResponse<typeof PLAN_CONFIG>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
    }

    return NextResponse.json({ ok: true, data: PLAN_CONFIG });
  } catch (error) {
    console.error("[Admin Plan] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
