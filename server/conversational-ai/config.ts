/** Configuración del agente IA (sin CRM). */

export function getAiProvider(): "gemini" | "openai" {
  const v = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  return v === "openai" ? "openai" : "gemini";
}

export function getGeminiApiKey(): string {
  return process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || "";
}

export function getOpenAiApiKey(): string {
  return process.env.OPENAI_API_KEY?.trim() || "";
}

export function getElevenLabsApiKey(): string {
  return process.env.ELEVENLABS_API_KEY?.trim() || "";
}

export function getElevenLabsVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
}

export function getElevenLabsModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";
}

/** Umbral simple de energía μ-law para barge-in si STT va retrasado (0–255 por muestra aprox.). */
export function getInboundEnergyBargeThreshold(): number {
  const n = Number(process.env.AI_BARGE_IN_ENERGY_THRESHOLD);
  if (Number.isFinite(n) && n > 0) return n;
  return 28;
}
