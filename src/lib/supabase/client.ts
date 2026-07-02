"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Cliente de Supabase para usar EXCLUSIVAMENTE en el navegador.
 *  Se crea una vez y se reusa mediante React Context o singletons.
 *  ⚠️ NUNCA importar en Server Components ni Server Actions. */
let _client: SupabaseClient<Database> | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Verifica que las variables de entorno de Supabase estén definidas.
 *  NO lanza durante build (next build puede correr sin ellas para SSG). */
function assertEnvVars(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "❌ Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.\n\n" +
      "En Vercel: Project Dashboard → Settings → Environment Variables → agregarlas como 'Plaintext' para Production.\n" +
      "En local: copiar .env.example a .env.local y completar los valores."
    );
  }
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (_client) return _client;
  assertEnvVars();
  // Las aserciones ya validaron que son string — TS no puede inferirlo, casteamos
  _client = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
  return _client;
}

/** Hook simple para React. Preferir useSupabase del provider. */
export function useSupabase(): SupabaseClient<Database> {
  return getSupabaseClient();
}
