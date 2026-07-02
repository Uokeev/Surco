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
          nivel: string;
          rut_verificado: boolean;
          telefono_verificado: boolean;
          telefono: string | null;
          rut: string | null;
          datos_parcela_completos: boolean;
          parcela_region: string | null;
          parcela_cultivo_principal: string | null;
          parcela_hectareas: number | null;
          semillas_acumuladas: number;
          tipo_terreno: string | null;
          terreno_size: number | null;
          terreno_unidad: string | null;
          updated_at: string;
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
          nivel?: string;
          rut_verificado?: boolean;
          telefono_verificado?: boolean;
          telefono?: string | null;
          rut?: string | null;
          datos_parcela_completos?: boolean;
          parcela_region?: string | null;
          parcela_cultivo_principal?: string | null;
          parcela_hectareas?: number | null;
          semillas_acumuladas?: number;
          tipo_terreno?: string | null;
          terreno_size?: number | null;
          terreno_unidad?: string | null;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          photo?: string | null;
          plan?: string;
          diagnosticos_usados?: number;
          diagnosticos_limite?: number;
          last_login?: string;
          nivel?: string;
          rut_verificado?: boolean;
          telefono_verificado?: boolean;
          telefono?: string | null;
          rut?: string | null;
          datos_parcela_completos?: boolean;
          parcela_region?: string | null;
          parcela_cultivo_principal?: string | null;
          parcela_hectareas?: number | null;
          semillas_acumuladas?: number;
          tipo_terreno?: string | null;
          terreno_size?: number | null;
          terreno_unidad?: string | null;
          updated_at?: string;
        };
        Relationships: [];
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
        Update: {
          user_name?: string | null;
          crop?: string;
          region?: string;
          symptoms?: string | null;
          clima?: unknown | null;
          enfermedad?: string;
          nombre_cientifico?: string | null;
          severidad?: string;
          confianza?: number;
          causa?: string | null;
          sintomas_detectados?: string | null;
          tratamiento?: string[] | null;
          alerta_propagacion?: string | null;
          cuando_actuar?: string | null;
          donde_comprar?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
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
        Insert: {
          cultivo: string;
          nombre: string;
          nombre_cientifico?: string;
          sintomas?: string;
          causa?: string;
          urgencia?: string;
          productos_certificados_sag?: string[];
          alternativa_hogar?: string | null;
        };
        Update: {
          cultivo?: string;
          nombre?: string;
          nombre_cientifico?: string;
          sintomas?: string;
          causa?: string;
          urgencia?: string;
          productos_certificados_sag?: string[];
          alternativa_hogar?: string | null;
        };
        Relationships: [];
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
        Insert: {
          id: string;
          region: string;
          crop: string;
          total_diagnosticos?: number;
          enfermedades?: Record<string, number>;
          ultima_actualizacion?: string;
        };
        Update: {
          region?: string;
          crop?: string;
          total_diagnosticos?: number;
          enfermedades?: Record<string, number>;
          ultima_actualizacion?: string;
        };
        Relationships: [];
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
        Insert: {
          id: string;
          enfermedad: string;
          cultivo: string;
          region: string;
          lat?: number | null;
          lon?: number | null;
          reportes?: number;
          ultimo_reporte?: string;
        };
        Update: {
          enfermedad?: string;
          cultivo?: string;
          region?: string;
          lat?: number | null;
          lon?: number | null;
          reportes?: number;
          ultimo_reporte?: string;
        };
        Relationships: [];
      };
      semillas_usuario: {
        Row: {
          id: string;
          user_id: string;
          tipo: string;
          cantidad: number;
          puntaje_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tipo: string;
          cantidad?: number;
          puntaje_total?: number;
        };
        Update: {
          cantidad?: number;
          puntaje_total?: number;
        };
        Relationships: [];
      };
      transacciones_semillas: {
        Row: {
          id: string;
          user_id: string;
          tipo: string;
          semilla_tipo: string;
          cantidad: number;
          razon: string;
          referencia_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          tipo: string;
          semilla_tipo: string;
          cantidad: number;
          razon: string;
          referencia_id?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      planes: {
        Row: {
          id: string;
          nombre: string;
          precio_mensual: number;
          precio_anual: number | null;
          diagnosticos_limite: number;
          diagnostico_max_fotos: number;
          tiene_historial: boolean;
          tiene_alertas: boolean;
          tiene_prioritario: boolean;
          semillas_bonus: number;
          created_at: string;
        };
        Insert: {
          nombre: string;
          precio_mensual?: number;
          precio_anual?: number | null;
          diagnosticos_limite?: number;
          diagnostico_max_fotos?: number;
          tiene_historial?: boolean;
          tiene_alertas?: boolean;
          tiene_prioritario?: boolean;
          semillas_bonus?: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      suscripciones_usuario: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          estado: string;
          fecha_inicio: string;
          fecha_fin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan_id: string;
          estado?: string;
          fecha_fin?: string | null;
        };
        Update: {
          estado?: string;
          fecha_fin?: string | null;
        };
        Relationships: [];
      };
      rachas_usuario: {
        Row: {
          id: string;
          user_id: string;
          racha_actual: number;
          racha_maxima: number;
          ultimo_acceso: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          racha_actual?: number;
          racha_maxima?: number;
          ultimo_acceso?: string;
        };
        Update: {
          racha_actual?: number;
          racha_maxima?: number;
          ultimo_acceso?: string;
        };
        Relationships: [];
      };
      referidos_usuario: {
        Row: {
          id: string;
          usuario_id: string;
          referido_id: string;
          codigo_referido: string;
          puntos_ganados: number;
          created_at: string;
        };
        Insert: {
          usuario_id: string;
          referido_id: string;
          codigo_referido: string;
          puntos_ganados?: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      catalogo_beneficios: {
        Row: {
          id: string;
          item: string;
          partner: string;
          descripcion: string | null;
          costo_puntos: number;
          categoria: string;
          imagen_url: string | null;
          stock: number;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          item: string;
          partner: string;
          descripcion?: string | null;
          costo_puntos: number;
          categoria: string;
          imagen_url?: string | null;
          stock?: number;
          activo?: boolean;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      canjes_usuario: {
        Row: {
          id: string;
          user_id: string;
          beneficio_id: string;
          puntos_gastados: number;
          estado: string;
          codigo_canje: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          beneficio_id: string;
          puntos_gastados: number;
          estado?: string;
          codigo_canje?: string | null;
        };
        Update: {
          estado?: string;
          codigo_canje?: string | null;
        };
        Relationships: [];
      };
      catalogo_plantas: {
        Row: {
          id: string;
          nombre: string;
          nombre_cientifico: string;
          origen: string;
          luz: string;
          luz_fc_min: number;
          luz_fc_max: number;
          riego_trigger: string;
          riego_profundidad_cm: number;
          humedad_min: number;
          humedad_optima_min: number;
          humedad_optima_max: number;
          temp_min: number;
          temp_optima_min: number;
          temp_optima_max: number;
          toxicidad: string;
          dificultad: string;
          crecimiento: string;
          descripcion_corta: string;
          descripcion_larga: string;
          consejos_clave: string[];
          problemas_comunes: string;
          diferenciador: string;
          propagacion_metodo: string;
          propagacion_detalle: string;
          propagacion_tiempo_raiz: string;
          propagacion_dificultad: string;
          activo: boolean;
          imagen_url: string | null;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      plagas_enfermedades: {
        Row: {
          id: string;
          nombre: string;
          nombre_cientifico: string;
          tipo: string;
          sintomas: string;
          causa: string;
          identificacion: string;
          factor_critico: string;
          primeros_auxilios: string;
          tratamiento_principal: string;
          tratamiento_frecuencia: string;
          preventivo: string;
          activo: boolean;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      plagas_por_planta: {
        Row: {
          id: string;
          planta_id: string;
          plaga_id: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "plagas_por_planta_planta_id_fkey";
            columns: ["planta_id"];
            isOneToOne: false;
            referencedRelation: "catalogo_plantas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plagas_por_planta_plaga_id_fkey";
            columns: ["plaga_id"];
            isOneToOne: false;
            referencedRelation: "plagas_enfermedades";
            referencedColumns: ["id"];
          },
        ];
      };
      alertas_temporada: {
        Row: {
          id: string;
          temporada: string;
          titulo: string;
          mensaje: string;
          acciones: string[];
          activo: boolean;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      resumen_club_surco: {
        Row: {
          user_id: string;
          nivel: string;
          semillas_acumuladas: number;
          rut_verificado: boolean;
          telefono_verificado: boolean;
          datos_parcela_completos: boolean;
          tipo_terreno: string | null;
          parcela_region: string | null;
          parcela_cultivo_principal: string | null;
          parcela_hectareas: number | null;
          terreno_size: number | null;
          terreno_unidad: string | null;
          racha_actual: number;
          racha_maxima: number;
          total_diagnosticos: number;
          total_referidos: number;
          semillas_totales: number;
          puede_ser_oro: boolean;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Functions: {
      incrementar_zona: {
        Args: {
          p_region: string;
          p_crop: string;
          p_enfermedad: string;
        };
        Returns: void;
      };
      registrar_alerta_zona: {
        Args: {
          p_enfermedad: string;
          p_cultivo: string;
          p_region: string;
          p_lat: number | null;
          p_lon: number | null;
        };
        Returns: void;
      };
      obtener_semillas_usuario: {
        Args: {
          p_user_id: string;
        };
        Returns: Array<{
          tipo: string;
          cantidad: number;
        }>;
      };
      agregar_semillas: {
        Args: {
          p_user_id: string;
          p_tipo: string;
          p_cantidad: number;
          p_razon: string;
          p_referencia_id?: string | null;
        };
        Returns: number;
      };
      canjear_semillas: {
        Args: {
          p_user_id: string;
          p_tipo: string;
          p_cantidad: number;
          p_beneficio: string;
        };
        Returns: boolean;
      };
      actualizar_racha: {
        Args: {
          p_user_id: string;
        };
        Returns: Array<{
          racha_actual: number;
          racha_maxima: number;
        }>;
      };
      otorgar_puntos_accion: {
        Args: {
          p_user_id: string;
          p_codigo_accion: string;
          p_referencia_id?: string | null;
        };
        Returns: number;
      };
      verificar_nivel_oro: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      canjear_beneficio: {
        Args: {
          p_user_id: string;
          p_beneficio_id: string;
        };
        Returns: Record<string, unknown>;
      };
      obtener_plagas_por_planta: {
        Args: {
          p_nombre_planta: string;
        };
        Returns: Array<{
          plaga_id: string;
          plaga_nombre: string;
          plaga_tipo: string;
          sintomas: string;
          tratamiento_principal: string;
          frecuencia: string;
        }>;
      };
    };
    Enums: Record<string, never>;
  };
}
