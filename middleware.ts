import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, ipKey } from "@/lib/rate-limit";

// Rutas públicas que no requieren auth
const PUBLIC_PATHS = ["/", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Refrescar sesión Supabase (todas las rutas protegidas) ──
  const isApiRoute = pathname.startsWith("/api/");
  const isProtectedRoute =
    !PUBLIC_PATHS.includes(pathname) &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/diagnostico") ||
      pathname.startsWith("/api/diagnose") ||
      pathname.startsWith("/api/weather") ||
      pathname.startsWith("/api/sag") ||
      pathname.startsWith("/api/alerts"));

  let sessionUser = null;
  let sessionResponse = NextResponse.next();

  if (isProtectedRoute) {
    const result = await updateSession(request);
    sessionUser = result.user;
    sessionResponse = result.supabaseResponse;
  }

  // ─── 2. Verificar auth en rutas protegidas ──────────
  if (isProtectedRoute && !sessionUser) {
    if (isApiRoute) {
      return NextResponse.json(
        { ok: false, error: "No autorizado. Inicia sesión." },
        { status: 401 }
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ─── 3. Rate limiting para API routes específicas ────
  if (
    isApiRoute &&
    (pathname.startsWith("/api/diagnose") || pathname.startsWith("/api/weather"))
  ) {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const result = await checkRateLimit(ipKey(clientIp), {
      maxRequests: 10,
      windowMs: 60_000,
    });

    if (!result.allowed) {
      return NextResponse.json(
        { ok: false, error: "Demasiadas solicitudes. Intenta en 1 minuto." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((result.resetAt - Date.now()) / 1000)
            ),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    sessionResponse.headers.set(
      "X-RateLimit-Remaining",
      String(result.remaining)
    );
    sessionResponse.headers.set("X-RateLimit-Reset", String(result.resetAt));
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    // Middleware se ejecuta en todas estas rutas
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)",
  ],
};
