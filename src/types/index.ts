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
