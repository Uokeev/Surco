import type { EnfermedadSAG, UsoTipo } from "@/types";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * Busca enfermedades SAG/INIA para un cultivo específico.
 * Incluye enfermedades polifágas (cultivo = 'Otro').
 */
export async function buscarEnfermedadesSAG(
  crop: string,
  usoTipo: UsoTipo
): Promise<{
  contexto: string;
  lista: EnfermedadSAG[];
}> {
  const supabase = await createSupabaseServerClient();

  const { data: cultivoData } = await supabase
    .from("enfermedades_sag")
    .select("*")
    .eq("cultivo", crop);

  const { data: polifagoData } = await supabase
    .from("enfermedades_sag")
    .select("*")
    .eq("cultivo", "Otro");

  const todasLasEnfermedades = [
    ...(cultivoData ?? []),
    ...(polifagoData ?? []),
  ];

  if (todasLasEnfermedades.length === 0) {
    return {
      contexto: "",
      lista: [],
    };
  }

  const contextoUsuario =
    usoTipo === "hogar"
      ? "El usuario es una persona común con huerto doméstico o jardín. Priorizar soluciones caseras, orgánicas y simples."
      : "El usuario es un agricultor profesional chileno. Incluir productos certificados SAG con dosis exactas.";

  const lista = todasLasEnfermedades
    .map((e) => {
      const productos =
        usoTipo === "hogar"
          ? (e.alternativa_hogar ?? e.productos_certificados_sag?.[0] ?? "")
          : (e.productos_certificados_sag ?? []).join(" | ");
      return `- ${e.nombre} (${e.nombre_cientifico}): ${e.sintomas} | Causa: ${e.causa} | Tratamiento: ${productos} | Urgencia: ${e.urgencia}`;
    })
    .join("\n");

  const contexto = `
${contextoUsuario}

BASE SAG/INIA PARA ${crop.toUpperCase()}:
${lista}`;

  return {
    contexto,
    lista: todasLasEnfermedades as EnfermedadSAG[],
  };
}

/**
 * Construye el prompt para el modelo de IA con el contexto SAG.
 */
export function construirPromptDiagnostico(params: {
  crop: string;
  region: string;
  symptoms: string;
  usoTipo: UsoTipo;
  contextoSAG: string;
  condicionesClimaticas?: string;
}): string {
  const { crop, region, symptoms, usoTipo, contextoSAG, condicionesClimaticas } =
    params;

  const climaCtx = condicionesClimaticas
    ? `\nCONDICIONES CLIMÁTICAS ACTUALES:\n${condicionesClimaticas}\nConsidera estas condiciones para evaluar riesgo de propagación y urgencia del tratamiento.`
    : "";

  return `Eres el motor de diagnóstico fitosanitario de Surco, aplicación oficial para agricultores chilenos basada en normativas SAG e INIA.

DATOS DEL AGRICULTOR:
- Región: ${region}
- Cultivo: ${crop}
- Síntomas observados: ${symptoms || "No especificados"}
- Adjunta foto real de la planta afectada${contextoSAG}${climaCtx}

INSTRUCCIONES:
1. Analiza DETALLADAMENTE la imagen adjunta buscando: color de manchas, forma, patrón, tejido afectado (hoja/tallo/fruto/raíz), distribución en la planta.
2. Compara lo que ves con la base SAG/INIA del cultivo indicado.
3. Si no puedes ver claramente la planta o la imagen es de mala calidad, indícalo en sintomas_detectados.
4. Explica TODO en lenguaje simple como si hablaras con un agricultor sin formación técnica.
5. Los productos deben estar disponibles en agroveterinarias de Chile.

Responde ÚNICAMENTE con JSON válido sin texto adicional ni backticks:
{
  "enfermedad": "nombre común en español",
  "nombre_cientifico": "nombre científico",
  "severidad": "Alta",
  "confianza": 85,
  "que_veo": "descripción detallada de lo que observas en la imagen: colores, manchas, tejidos afectados, 2-3 oraciones",
  "causa": "por qué ocurre esto, explicado simple para un agricultor, 2 oraciones máximo",
  "sintomas_detectados": "síntomas visuales específicos detectados en esta foto, 2 oraciones",
  "tratamiento": [
    "Paso 1 — Producto principal: nombre comercial disponible en Chile, dosis exacta y frecuencia",
    "Paso 2 — Alternativa: otro producto con dosis",
    "Paso 3 — Acción cultural: qué hacer además del producto"
  ],
  "alerta_propagacion": "¿puede contagiar otras plantas? ¿con qué velocidad? 1 oración clara",
  "cuando_actuar": "urgencia: hoy/esta semana/puede esperar, y por qué",
  "donde_comprar": "tipo de tienda o agroveterinaria donde conseguir el producto en Chile"
}

Si la imagen no muestra planta enferma o no hay enfermedad: enfermedad "Sin enfermedad detectada", confianza bajo 70.
Severidad debe ser EXACTAMENTE "Alta", "Media" o "Baja". Confianza entre 55 y 97.`;
}
