import { NextResponse } from "next/server";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

/**
 * POST /api/club/init
 * Inicializa el perfil del usuario en Surco Club (fire-and-forget):
 *   - Sincroniza auth.users → public.users si no existe
 *   - Otorga semillas de bienvenida (5 básicas + 1 rara) si es nuevo
 *   - Inicializa la racha diaria
 * Se llama desde AuthProvider después del login, sin bloquear al usuario.
 */
export async function POST(): Promise<NextResponse<ApiResponse<{ ok: boolean }>>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // ─── 1. Asegurar que existe en public.users ──────────
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingUser) {
      await supabase.from("users").insert({
        id: user.id,
        name: user.user_metadata?.full_name ?? null,
        email: user.email,
        photo: user.user_metadata?.avatar_url ?? null,
        plan: "gratuito",
        diagnosticos_usados: 0,
        diagnosticos_limite: 10,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      });
    }

    // ─── 2. Verificar si ya tiene semillas de bienvenida ──
    const { data: semillasBasicas } = await supabase
      .from("semillas_usuario")
      .select("cantidad")
      .eq("user_id", user.id)
      .eq("tipo", "basica")
      .single();

    if (!semillasBasicas) {
      // Primera vez — dar semillas de bienvenida
      await supabase.rpc("agregar_semillas", {
        p_user_id: user.id,
        p_tipo: "basica",
        p_cantidad: 5,
        p_razon: "bienvenida",
      });
      await supabase.rpc("agregar_semillas", {
        p_user_id: user.id,
        p_tipo: "rara",
        p_cantidad: 1,
        p_razon: "bienvenida",
      });
    }

    // ─── 3. Actualizar racha diaria ────────────────────
    await supabase.rpc("actualizar_racha", { p_user_id: user.id });

    // ─── 4. Actualizar last_login ──────────────────────
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, data: { ok: true } });
  } catch (error) {
    console.error("[Club Init] Error:", error);
    // Siempre responder ok para no bloquear al usuario
    return NextResponse.json({ ok: true, data: { ok: true } });
  }
}
