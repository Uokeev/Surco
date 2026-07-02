// ─── Usuario ────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  plan: "gratuito" | "pro";
  diagnosticosUsados: number;
  diagnosticosLimite: number;
  createdAt: string;
  lastLogin: string;
}

// ─── Diagnóstico ────────────────────────────────────────
export type Severidad = "Alta" | "Media" | "Baja";
export type UsoTipo = "hogar" | "produccion";

export interface DiagnosticoInput {
  imageBase64: string;
  imageMime: string;
  crop: string;
  region: string;
  symptoms: string;
  usoTipo: UsoTipo;
  lat?: number;
  lon?: number;
}

export interface DiagnosticoResult {
  enfermedad: string;
  nombre_cientifico: string;
  severidad: Severidad;
  confianza: number;
  que_veo: string;
  causa: string;
  sintomas_detectados: string;
  tratamiento: string[];
  alerta_propagacion: string;
  cuando_actuar: string;
  donde_comprar: string;
}

export interface Diagnostico extends DiagnosticoResult {
  id: string;
  user_id: string;
  user_name: string | null;
  crop: string;
  region: string;
  symptoms: string | null;
  clima: CondicionesClimaticas | null;
  created_at: string;
  photo_url?: string | null;
}

// ─── Clima ──────────────────────────────────────────────
export interface CondicionesClimaticas {
  temperatura: number;
  humedad: number;
  precipitacion: number;
  viento: number;
  ciudad: string;
  region: string;
  lluvia_3dias: string;
}

export interface Coordenadas {
  lat: number;
  lon: number;
}

// ─── SAG / Enfermedad ─────────────────────────────────
export interface EnfermedadSAG {
  id: string;
  cultivo: string;
  nombre: string;
  nombre_cientifico: string;
  sintomas: string;
  causa: string;
  urgencia: "Alta" | "Media" | "Baja";
  productos_certificados_sag: string[];
  alternativa_hogar: string | null;
}

// ─── Alerta de zona ───────────────────────────────────
export interface AlertaZona {
  id: string;
  enfermedad: string;
  cultivo: string;
  region: string;
  lat: number | null;
  lon: number | null;
  reportes: number;
  ultimo_reporte: string;
}

// ─── Historial ─────────────────────────────────────────
export interface HistorialItem {
  id: string;
  enfermedad: string;
  severidad: Severidad;
  crop: string;
  region: string;
  timestamp: string;
}

// ─── Calculadora de dosis ─────────────────────────────
export type CalcTab = "arbol" | "huerto" | "predio";
export type EquipoHuerto = "pulverizador_manual" | "mochila_manual" | "espalda";
export type EquipoPredio = "espalda" | "mochila_motor" | "tractor" | "dron";

export interface CalculoDosisInput {
  tab: CalcTab;
  // Árbol
  arbolSize?: number;
  arbolCant?: number;
  // Huerto
  largo?: number;
  ancho?: number;
  equipoHuerto?: EquipoHuerto;
  // Predio
  ha?: number;
  equipoPredio?: EquipoPredio;
}

export interface CalculoDosisProducto {
  nombre: string;
  dosis: number;
  unidad: string;
  medidaCasera: string;
  litrosBase: number;
}

export interface CalculoDosisResult {
  productos: CalculoDosisProducto[];
  litrosTotales: number;
  descripcion: string;
}

// ─── Catálogo de Plantas de Interior ───────────────────
export interface CatalogoPlanta {
  id: string;
  nombre: string;
  nombre_cientifico: string;
  origen: string;
  luz: "baja" | "media" | "brillante" | "directa";
  luz_fc_min: number;
  luz_fc_max: number;
  riego_trigger: "seco_tercio" | "seco_total" | "casi_seco";
  riego_profundidad_cm: number;
  humedad_min: number;
  humedad_optima_min: number;
  humedad_optima_max: number;
  temp_min: number;
  temp_optima_min: number;
  temp_optima_max: number;
  toxicidad: "ninguna" | "baja" | "alta";
  dificultad: "facil" | "media" | "dificil";
  crecimiento: "colgante" | "trepador" | "rastrero" | "arbustivo" | "erecto";
  descripcion_corta: string;
  descripcion_larga: string;
  consejos_clave: string[];
  problemas_comunes: string;
  diferenciador: string;
  propagacion_metodo: "agua" | "sphagnum" | "sustrato" | "division";
  propagacion_detalle: string;
  propagacion_tiempo_raiz: string;
  propagacion_dificultad: "facil" | "media" | "dificil";
  imagen_url: string | null;
}

export interface PlagaEnfermedad {
  id: string;
  nombre: string;
  nombre_cientifico: string;
  tipo: "plaga" | "enfermedad" | "fisiopatia";
  sintomas: string;
  causa: string;
  identificacion: string;
  factor_critico: string;
  primeros_auxilios: string;
  tratamiento_principal: string;
  tratamiento_frecuencia: string;
  preventivo: string;
}

export interface AlertaTemporada {
  id: string;
  temporada: "invierno" | "primavera" | "verano" | "otonio";
  titulo: string;
  mensaje: string;
  acciones: string[];
}

export interface PlagaRelacionada {
  plaga_id: string;
  plaga_nombre: string;
  plaga_tipo: string;
  sintomas: string;
  tratamiento_principal: string;
  frecuencia: string;
}

export interface SustratoReceta {
  nombre: string;
  componentes: { nombre: string; porcentaje: number; funcion: string }[];
  descripcion: string;
}

// ─── Niveles / Club Surco ─────────────────────────────
export type NivelUsuario = "cosecha" | "oro";
export type TipoTerreno = "parcela" | "huerto" | "invernadero";

// ─── Planes / Suscripción ──────────────────────────────
export interface Plan {
  id: string;
  nombre: "gratuito" | "pro" | "premium";
  precio_mensual: number;
  precio_anual: number | null;
  diagnosticos_limite: number;
  diagnostico_max_fotos: number;
  tiene_historial: boolean;
  tiene_alertas: boolean;
  tiene_prioritario: boolean;
  semillas_bonus: number;
}

export interface SuscripcionUsuario {
  id: string;
  user_id: string;
  plan_id: string;
  estado: "activa" | "cancelada" | "expirada" | "trial";
  fecha_inicio: string;
  fecha_fin: string | null;
  plan?: Plan;
}

// ─── Semillas / Gamificación ──────────────────────────
export type SemillaTipo = "basica" | "rara" | "epica";

export interface SemillaUsuario {
  tipo: SemillaTipo;
  cantidad: number;
  puntaje_total?: number;
}

export interface TransaccionSemilla {
  id: string;
  user_id: string;
  tipo: "ganancia" | "gasto" | "bonus";
  semilla_tipo: SemillaTipo;
  cantidad: number;
  razon: string;
  referencia_id: string | null;
  created_at: string;
}

// ─── Reglas de puntaje ────────────────────────────────
export interface ReglaSemilla {
  accion: string;
  puntos: number;
  codigo: string;
  emoji: string;
  descripcion: string;
}

export const REGLAS_SEMILLAS: ReglaSemilla[] = [
  { accion: "Diagnóstico de cultivo", puntos: 50, codigo: "DIAGNOSTICO", emoji: "📷", descripcion: "Por cada diagnóstico completado" },
  { accion: "Racha de 7 días de uso", puntos: 100, codigo: "RACHA_7_DIAS", emoji: "🔥", descripcion: "Usa Surco 7 días seguidos" },
  { accion: "Referir a otro agricultor", puntos: 200, codigo: "REFERIDO", emoji: "👥", descripcion: "Invita a otro agricultor a registrarse" },
  { accion: "Dejar reseña en la app", puntos: 80, codigo: "RESEÑA", emoji: "⭐", descripcion: "Califica Surco en la tienda de apps" },
  { accion: "Completar perfil de parcela", puntos: 150, codigo: "PERFIL_PARCELA", emoji: "🌾", descripcion: "Ingresa datos de tu terreno" },
];

// ─── Catalogo de beneficios ────────────────────────────
export interface CatalogoBeneficio {
  id: string;
  item: string;
  partner: string;
  descripcion: string | null;
  costo_puntos: number;
  categoria: "quimicos" | "educacion" | "herramientas" | "descuentos";
  imagen_url: string | null;
  stock: number;
  activo: boolean;
}

export interface CanjeUsuario {
  id: string;
  user_id: string;
  beneficio_id: string;
  puntos_gastados: number;
  estado: "pendiente" | "aprobado" | "entregado" | "rechazado";
  codigo_canje: string | null;
  created_at: string;
  beneficio?: CatalogoBeneficio;
}

// ─── Rachas ────────────────────────────────────────────
export interface RachaUsuario {
  id: string;
  user_id: string;
  racha_actual: number;
  racha_maxima: number;
  ultimo_acceso: string;
}

// ─── Referidos ─────────────────────────────────────────
export interface ReferidoUsuario {
  id: string;
  usuario_id: string;
  referido_id: string;
  codigo_referido: string;
  puntos_ganados: number;
  created_at: string;
}

// ─── Resumen Club Surco (desde la vista) ──────────────
export interface ResumenClubSurco {
  user_id: string;
  nivel: NivelUsuario;
  semillas_acumuladas: number;
  rut_verificado: boolean;
  telefono_verificado: boolean;
  datos_parcela_completos: boolean;
  tipo_terreno: TipoTerreno | null;
  parcela_region: string | null;
  parcela_cultivo_principal: string | null;
  parcela_hectareas: number | null;
  terreno_size: number | null;
  terreno_unidad: "hectareas" | "m2" | null;
  racha_actual: number;
  racha_maxima: number;
  total_diagnosticos: number;
  total_referidos: number;
  semillas_totales: number;
  puede_ser_oro: boolean;
}

// ─── API Responses ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  hasMore: boolean;
}
