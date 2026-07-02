"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ Cliente Supabase lazy: se crea en el primer uso real (useEffect),
  //    NO durante SSR/SSG. Así evitamos que el build explote si faltan
  //    las variables de entorno en tiempo de build.
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null);
  const getClient = useCallback((): SupabaseClient<Database> => {
    if (!supabaseRef.current) {
      supabaseRef.current = getSupabaseClient();
    }
    return supabaseRef.current;
  }, []);

  useEffect(() => {
    const supabase = getClient();
    // Obtener sesión inicial
    supabase.auth.getUser()
      .then(({ data: { user: u } }) => {
        setUser(u);
        if (u) {
          inicializarUsuario();
        }
      })
      .catch((err) => {
        console.error("[Auth] Error al obtener sesión:", err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === "SIGNED_IN" && session?.user) {
        inicializarUsuario();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Inicializa perfil del usuario (fire-and-forget, no bloquea el login). */
  const inicializarUsuario = useCallback(async () => {
    try {
      await fetch("/api/club/init", { method: "POST" });
    } catch {
      // Silencioso — no bloquear el login del usuario
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const origin = window.location.origin;
    const supabase = getClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
