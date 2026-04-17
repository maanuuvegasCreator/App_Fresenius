import { parseFreseniusLlmJson } from "./schemas/fresenius-llm-output";
import { generateAssistantReply } from "./llm/llm-router";

export const FRESENIUS_SYSTEM_PROMPT =
  "Eres el asistente virtual de Fresenius Medical Care. Tu objetivo es gestionar pedidos de material de hemodiálisis domiciliaria de forma amable, clara y profesional. Simula que estás hablando con un paciente habitual. Mantén respuestas cortas y conversacionales.";

const FRESENIUS_JSON_CONTRACT = `
Tu salida debe ser **exclusivamente** un objeto JSON válido (UTF-8), sin markdown, sin comentarios, sin texto antes ni después del JSON. Esquema obligatorio:
{
  "respuesta_usuario": "Texto que la voz (TTS) dirá al paciente, breve y natural en español.",
  "datos_internos": {
    "requiere_redireccion": false,
    "motivo_transferencia": null,
    "resumen_contexto": "Breve resumen de lo hablado hasta ahora."
  }
}

Reglas para datos_internos:
- "requiere_redireccion": true si el paciente pide explícitamente hablar con una persona/agente, si reporta una avería grave o urgente del material/equipo/reparto que no puedas resolver con orientación básica, o si describe síntomas o malestar grave posiblemente ligados al tratamiento y necesita valoración humana.
- "motivo_transferencia": cadena corta en español explicando el motivo cuando requiere_redireccion es true; null si no aplica.
- "resumen_contexto": siempre un string conciso (aunque sea vacío si acaba de empezar la conversación).

Si requiere_redireccion es true, respuesta_usuario debe ser una frase muy breve de traspaso (ej. que le pasas con un compañero) antes de que el sistema le transfiera a la cola de Atención General.
`.trim();

export const FRESENIUS_SYSTEM_PROMPT_JSON = `${FRESENIUS_SYSTEM_PROMPT}\n\n${FRESENIUS_JSON_CONTRACT}`;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type StructuredAgentTurnResult = {
  /** Texto enviado a ElevenLabs (solo voz al paciente). */
  speech: string;
  transferRequested: boolean;
  motivoTransferencia: string | null;
  resumenContexto: string;
  /** true si el JSON no era válido y se usó recuperación heurística. */
  usedFallbackJson: boolean;
};

export async function runStructuredAgentTurn(userText: string, history: ChatTurn[]): Promise<StructuredAgentTurnResult> {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      speech: "¿En qué puedo ayudarle con su material de hemodiálisis a domicilio?",
      transferRequested: false,
      motivoTransferencia: null,
      resumenContexto: "",
      usedFallbackJson: false,
    };
  }

  const context =
    history.length === 0
      ? trimmed
      : `${history
          .slice(-8)
          .map((h) => `${h.role === "user" ? "Paciente" : "Asistente"}: ${h.content}`)
          .join("\n")}\nPaciente: ${trimmed}`;

  let raw: string;
  try {
    raw = await generateAssistantReply(FRESENIUS_SYSTEM_PROMPT_JSON, context, { jsonMode: true });
  } catch (e) {
    console.error("[ai-agent] LLM request failed", e);
    return {
      speech: "Disculpe, tengo un problema técnico momentáneo. Inténtelo de nuevo en unos segundos.",
      transferRequested: false,
      motivoTransferencia: null,
      resumenContexto: "",
      usedFallbackJson: true,
    };
  }

  const parsed = parseFreseniusLlmJson(raw);
  if (!parsed.ok) {
    console.warn("[ai-agent] JSON malformado o incompleto, usando fallback de voz. Raw (trunc):", raw.slice(0, 400));
    return {
      speech: parsed.fallbackSpeech,
      transferRequested: false,
      motivoTransferencia: null,
      resumenContexto: "",
      usedFallbackJson: true,
    };
  }

  const { respuesta_usuario, datos_internos } = parsed.envelope;
  return {
    speech: respuesta_usuario,
    transferRequested: Boolean(datos_internos.requiere_redireccion),
    motivoTransferencia: datos_internos.motivo_transferencia,
    resumenContexto: datos_internos.resumen_contexto || "",
    usedFallbackJson: false,
  };
}
