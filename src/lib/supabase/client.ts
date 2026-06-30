"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Cliente de Supabase para usar EXCLUSIVAMENTE en el navegador.
 *  Se crea una vez y se reusa mediante React Context o singletons.
 *  ⚠️ NUNCA importar en Server Components ni Server Actions. */
let _client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }

  _client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return _client;
}

/** Hook simple para React. Preferir useSupabase del provider. */
export function useSupabase(): SupabaseClient<Database> {
  return getSupabaseClient();
}
