/**
 * Contrato de salida estructurada del LLM (arquitectura Fresenius).
 */

export type FreseniusDatosInternos = {
  requiere_redireccion: boolean;
  motivo_transferencia: string | null;
  resumen_contexto: string;
};

export type FreseniusLlmEnvelope = {
  respuesta_usuario: string;
  datos_internos: FreseniusDatosInternos;
};

export type ParsedFreseniusLlm = {
  ok: true;
  envelope: FreseniusLlmEnvelope;
} | {
  ok: false;
  /** Texto seguro para TTS si el JSON falla. */
  fallbackSpeech: string;
  transferRequested: false;
};

function stripCodeFence(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/\s*```\s*$/i, "");
  }
  return t.trim();
}

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  return false;
}

function asNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v.trim() || null;
  return String(v);
}

function normalizeEnvelope(data: unknown): ParsedFreseniusLlm {
  if (!data || typeof data !== "object") {
    return { ok: false, fallbackSpeech: "Un momento, por favor.", transferRequested: false };
  }
  const o = data as Record<string, unknown>;
  const ru = o.respuesta_usuario;
  if (typeof ru !== "string" || !ru.trim()) {
    return { ok: false, fallbackSpeech: "Disculpe, no he entendido bien. ¿Puede repetir?", transferRequested: false };
  }
  const diRaw = o.datos_internos;
  if (!diRaw || typeof diRaw !== "object") {
    return {
      ok: true,
      envelope: {
        respuesta_usuario: ru.trim(),
        datos_internos: {
          requiere_redireccion: false,
          motivo_transferencia: null,
          resumen_contexto: "",
        },
      },
    };
  }
  const di = diRaw as Record<string, unknown>;
  const envelope: FreseniusLlmEnvelope = {
    respuesta_usuario: ru.trim(),
    datos_internos: {
      requiere_redireccion: asBool(di.requiere_redireccion),
      motivo_transferencia: asNullableString(di.motivo_transferencia),
      resumen_contexto: typeof di.resumen_contexto === "string" ? di.resumen_contexto.trim() : "",
    },
  };
  return { ok: true, envelope };
}

/** Parsea la salida del modelo; nunca lanza. */
export function parseFreseniusLlmJson(raw: string): ParsedFreseniusLlm {
  const text = stripCodeFence(raw);
  if (!text) {
    return { ok: false, fallbackSpeech: "Un momento, por favor.", transferRequested: false };
  }
  try {
    const data = JSON.parse(text) as unknown;
    return normalizeEnvelope(data);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const data = JSON.parse(text.slice(start, end + 1)) as unknown;
        return normalizeEnvelope(data);
      } catch {
        /* fall through */
      }
    }
  }
  const speech = text.length > 500 ? `${text.slice(0, 497)}...` : text;
  return {
    ok: false,
    fallbackSpeech: speech || "Un momento, por favor.",
    transferRequested: false,
  };
}
