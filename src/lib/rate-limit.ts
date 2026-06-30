/**
 * Rate Limiter — Soporta dos backends:
 * 1. Upstash Redis (escalable, multi-instancia)
 * 2. In-memory Map (simple, desarrollo / single-instance)
 *
 * Se selecciona automáticamente según la presencia de UPSTASH_REDIS_REST_URL.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp ms
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests por minuto por defecto

// ─── Backend In-Memory ──────────────────────────────
const store = new Map<string, RateLimitEntry>();

// Limpieza periódica del store (cada 5 min) para evitar memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 300_000);
}

function checkInMemory(
  key: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Backend Upstash Redis ──────────────────────────
async function checkUpstash(
  key: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Fallback a in-memory si Upstash no está configurado
    return checkInMemory(key, maxRequests, windowMs);
  }

  try {
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);
    const identifier = `ratelimit:${key}`;

    const response = await fetch(`${url}/lua/EVALSHA`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: `
          local key = KEYS[1]
          local max = tonumber(ARGV[1])
          local window = tonumber(ARGV[2])
          local now = tonumber(ARGV[3])
          
          local reset_at = now + window
          local count = redis.call("INCR", key)
          if count == 1 then
            redis.call("EXPIRE", key, window)
          end
          
          local remaining = max - count
          if remaining < 0 then remaining = 0 end
          
          return {count, remaining, reset_at}
        `,
        keys: [identifier],
        args: [String(maxRequests), String(windowSeconds), String(Math.floor(now / 1000))],
      }),
    });

    if (!response.ok) throw new Error("Upstash error");

    const result = await response.json();
    const count = Number(result.data?.[0] || 0);

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: now + windowMs,
    };
  } catch {
    // Fallback silencioso a in-memory
    return checkInMemory(key, maxRequests, windowMs);
  }
}

// ─── API Pública ─────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Verifica rate limiting para una clave (ej: IP, userId).
 * Usa Upstash Redis si está configurado, sino in-memory.
 */
export async function checkRateLimit(
  key: string,
  options?: { maxRequests?: number; windowMs?: number }
): Promise<RateLimitResult> {
  const maxRequests = options?.maxRequests ?? RATE_LIMIT_MAX_REQUESTS;
  const windowMs = options?.windowMs ?? RATE_LIMIT_WINDOW_MS;

  const hasUpstash =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    return checkUpstash(key, maxRequests, windowMs);
  }

  return checkInMemory(key, maxRequests, windowMs);
}

/**
 * Genera una clave de rate limit para una IP.
 */
export function ipKey(ip: string): string {
  return `ip:${ip}`;
}

/**
 * Genera una clave de rate limit para un usuario.
 */
export function userKey(userId: string): string {
  return `user:${userId}`;
}
