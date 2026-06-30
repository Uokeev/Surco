// ─── Tipos generados para la base de datos de Supabase ───
// Estos tipos deberían generarse con `supabase gen types typescript --local`
// Por ahora los definimos manualmente para la migración.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          photo: string | null;
          plan: string;
          diagnosticos_usados: number;
          diagnosticos_limite: number;
          created_at: string;
          last_login: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          photo?: string | null;
          plan?: string;
          diagnosticos_usados?: number;
          diagnosticos_limite?: number;
          created_at?: string;
          last_login?: string;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          photo?: string | null;
          plan?: string;
          diagnosticos_usados?: number;
          diagnosticos_limite?: number;
          last_login?: string;
        };
      };
      diagnosticos: {
        Row: {
          id: string;
          user_id: string;
          user_name: string | null;
          crop: string;
          region: string;
          symptoms: string | null;
          clima: unknown | null;
          enfermedad: string;
          nombre_cientifico: string | null;
          severidad: string;
          confianza: number;
          causa: string | null;
          sintomas_detectados: string | null;
          tratamiento: string[] | null;
          alerta_propagacion: string | null;
          cuando_actuar: string | null;
          donde_comprar: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          user_name?: string | null;
          crop: string;
          region: string;
          symptoms?: string | null;
          clima?: unknown | null;
          enfermedad: string;
          nombre_cientifico?: string | null;
          severidad: string;
          confianza: number;
          causa?: string | null;
          sintomas_detectados?: string | null;
          tratamiento?: string[] | null;
          alerta_propagacion?: string | null;
          cuando_actuar?: string | null;
          donde_comprar?: string | null;
          photo_url?: string | null;
        };
      };
      enfermedades_sag: {
        Row: {
          id: string;
          cultivo: string;
          nombre: string;
          nombre_cientifico: string;
          sintomas: string;
          causa: string;
          urgencia: string;
          productos_certificados_sag: string[];
          alternativa_hogar: string | null;
        };
      };
      zonas: {
        Row: {
          id: string;
          region: string;
          crop: string;
          total_diagnosticos: number;
          enfermedades: Record<string, number>;
          ultima_actualizacion: string;
        };
      };
      alertas_zona: {
        Row: {
          id: string;
          enfermedad: string;
          cultivo: string;
          region: string;
          lat: number | null;
          lon: number | null;
          reportes: number;
          ultimo_reporte: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
