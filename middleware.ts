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
      pathname.startsWith("/api/"));

  let sessionUser = null;
  let sessionResponse = NextResponse.next();

  if (isProtectedRoute) {
    try {
      const result = await updateSession(request);
      sessionUser = result.user;
      sessionResponse = result.supabaseResponse;
    } catch (e) {
      console.error("[Middleware] Error al refrescar sesión:", e);
      if (isApiRoute) {
        return NextResponse.json(
          { ok: false, error: "Error de autenticación." },
          { status: 500 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
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

  // ─── 3. Rate limiting para TODAS las API routes ────
  if (isApiRoute) {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // Límites diferenciados por tipo de endpoint
    const limits: Record<string, { max: number; window: number }> = {
      "/api/diagnose": { max: 5, window: 60_000 },      // 5/min — intensivo IA
      "/api/weather": { max: 15, window: 60_000 },       // 15/min — datos externos
      "/api/club/puntos": { max: 10, window: 60_000 },   // 10/min — no abusar
      "/api/club/init": { max: 5, window: 60_000 },      // 5/min — solo al login
      "/api/sag": { max: 20, window: 60_000 },            // 20/min — consultas
      "/api/alerts": { max: 20, window: 60_000 },         // 20/min — consultas
    };

    // Buscar límite específico o usar default
    const matchedRoute = Object.keys(limits).find((route) =>
      pathname.startsWith(route)
    );
    const { max: maxRequests, window: windowMs } = matchedRoute
      ? limits[matchedRoute]!
      : { max: 30, window: 60_000 }; // default: 30/min

    const result = await checkRateLimit(ipKey(clientIp), {
      maxRequests,
      windowMs,
    });

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      const errorMsg =
        maxRequests <= 5
          ? "Demasiadas solicitudes. Espera un momento antes de intentar de nuevo."
          : "Demasiadas solicitudes. Intenta en 1 minuto.";

      return NextResponse.json(
        { ok: false, error: errorMsg },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
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
