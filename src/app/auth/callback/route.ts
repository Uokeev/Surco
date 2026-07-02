import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Ruta de callback para OAuth de Supabase.
 * Después del login con Google, Supabase redirige aquí con un código.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // ── Error devuelto por Supabase/Google ──
  if (errorParam) {
    console.error(
      "[Auth Callback] Error desde el proveedor OAuth:",
      errorParam,
      errorDescription
    );
    return NextResponse.redirect(
      `${origin}/?error=auth_failed&detail=${encodeURIComponent(errorDescription ?? errorParam)}`
    );
  }

  // ── Intercambiar código por sesión ──
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Error al intercambiar el código
    console.error(
      "[Auth Callback] exchangeCodeForSession falló:",
      error.message,
      error.status
    );
  } else {
    console.error("[Auth Callback] No se recibió 'code' en la URL");
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
