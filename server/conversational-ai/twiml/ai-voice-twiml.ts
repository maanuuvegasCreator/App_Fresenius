import twilio from "twilio";
import { resolveMediaStreamWssUrl } from "../../centralita/config";

/**
 * TwiML para agente IA: Real-Time Transcription (STT Twilio) + Media Stream bidireccional (TTS).
 * Asigna esta URL como webhook de voz de un número de prueba.
 */
export function buildAiConversationalTwiML(opts: {
  transcriptionCallbackUrl: string;
  mediaStreamWssUrl: string;
  transcriptionName?: string;
}): string {
  const twiml = new twilio.twiml.VoiceResponse();

  const start = twiml.start();
  start.transcription({
    statusCallbackUrl: opts.transcriptionCallbackUrl,
    name: opts.transcriptionName || "fresenius_rt",
    languageCode: process.env.TWILIO_TRANSCRIPTION_LANGUAGE?.trim() || "es-ES",
    partialResults: true,
    track: "inbound_track",
    transcriptionEngine: process.env.TWILIO_TRANSCRIPTION_ENGINE?.trim() || "google",
    speechModel: process.env.TWILIO_TRANSCRIPTION_SPEECH_MODEL?.trim() || "telephony",
    enableAutomaticPunctuation: true,
  } as Record<string, unknown>);

  const connect = twiml.connect();
  const stream = connect.stream({
    url: opts.mediaStreamWssUrl,
    name: "fresenius_ai_media",
  });
  stream.parameter({ name: "mode", value: "conversational_ai" });

  return twiml.toString();
}

export function resolveAiMediaWssOrThrow(): string {
  const wss = resolveMediaStreamWssUrl();
  if (!wss) {
    throw new Error("TWILIO_MEDIA_STREAM_WSS_URL o PUBLIC_APP_URL https requerido para el stream IA");
  }
  return wss;
}
