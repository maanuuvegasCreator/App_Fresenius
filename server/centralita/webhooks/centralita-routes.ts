import { Hono } from "hono";
import twilio from "twilio";
import { issueTwilioVoiceAccessToken } from "../../twilio-voice-token";
import { buildWebhookUrl, resolveMediaStreamWssUrl } from "../config";
import { getQueueTarget } from "../queues/static-queues";
import { buildInboundWelcomeTwiML, buildIvrDialQueueTwiML, queueFromDigit } from "../twiml/ivr-responses";
import { isValidTwilioWebhookRequest } from "./validate-twilio";
import { parseTranscriptionFormBody } from "../../conversational-ai/stt/transcription-callback";
import { routeTranscriptionToSession } from "../../conversational-ai/session-registry";
import { buildAiConversationalTwiML, resolveAiMediaWssOrThrow } from "../../conversational-ai/twiml/ai-voice-twiml";

const twimlHeaders = { "Content-Type": "text/xml; charset=utf-8" };

function inboundPath(): string {
  return "/api/twilio/voice/inbound";
}

function ivrPath(): string {
  return "/api/twilio/voice/ivr";
}

function transcriptionPath(): string {
  return "/api/twilio/voice/transcription";
}

/**
 * Rutas Twilio de la centralita cloud (TwiML + callbacks).
 * Montaje: `app.route("/twilio", centralitaTwilioRoutes)` sobre app con `basePath("/api")` → `/api/twilio/...`.
 */
export const centralitaTwilioRoutes = new Hono();

const tokenCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
} as const;

centralitaTwilioRoutes.options("/token", (c) => c.body(null, 204, tokenCors));

/** JWT Voice SDK (cliente Web) — misma emisión que GET /api/token, bajo ruta de centralita. */
centralitaTwilioRoutes.get("/token", async (c) => {
  const pushCredentialSid = c.req.query("pushCredentialSid");
  const result = await issueTwilioVoiceAccessToken(c.req.raw, pushCredentialSid);
  if (!result.ok) {
    return c.json({ error: result.error }, result.status, tokenCors);
  }
  return c.json({ identity: result.identity, token: result.token }, 200, tokenCors);
});

centralitaTwilioRoutes.post("/voice/inbound", async (c) => {
  const raw = await c.req.text();
  if (!isValidTwilioWebhookRequest(c.req.raw, raw)) {
    return c.body("Forbidden", 403);
  }

  const req = c.req.raw;
  const ivrActionUrl = buildWebhookUrl(req, ivrPath());
  const inboundVoiceUrl = buildWebhookUrl(req, inboundPath());
  const mediaWss = resolveMediaStreamWssUrl();

  const welcome =
    process.env.CENTRALITA_WELCOME_MESSAGE?.trim() ||
    "Bienvenido a la centralita. Gracias por llamar.";

  const xml = buildInboundWelcomeTwiML({
    welcomeText: welcome,
    ivrActionUrl,
    inboundVoiceUrl,
    mediaStreamWssUrl: mediaWss,
  });

  return c.body(xml, 200, twimlHeaders);
});

centralitaTwilioRoutes.post("/voice/ivr", async (c) => {
  const raw = await c.req.text();
  if (!isValidTwilioWebhookRequest(c.req.raw, raw)) {
    return c.body("Forbidden", 403);
  }

  const params = new URLSearchParams(raw);
  const digit = params.get("Digits");
  const queue = queueFromDigit(digit);
  const req = c.req.raw;
  const inboundVoiceUrl = buildWebhookUrl(req, inboundPath());

  if (!queue) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "es-ES", voice: "Polly.Lucia" }, "Opción no válida.");
    twiml.redirect({ method: "POST" }, inboundVoiceUrl);
    return c.body(twiml.toString(), 200, twimlHeaders);
  }

  const target = getQueueTarget(queue);
  const xml = buildIvrDialQueueTwiML(target, inboundVoiceUrl);
  return c.body(xml, 200, twimlHeaders);
});

/** Real-Time Transcription (STT Twilio) → orquestador IA por CallSid. */
centralitaTwilioRoutes.post("/voice/transcription", async (c) => {
  const raw = await c.req.text();
  if (!isValidTwilioWebhookRequest(c.req.raw, raw)) {
    return c.body("Forbidden", 403);
  }
  const parsed = parseTranscriptionFormBody(raw);
  if (parsed) routeTranscriptionToSession(parsed);
  return c.body(null, 204);
});

/**
 * Webhook de voz: entra en bucle IA (Connect + Stream bidireccional + Transcription).
 * Configura un número Twilio con esta URL (POST) para pruebas del agente.
 */
centralitaTwilioRoutes.post("/voice/ai/connect", async (c) => {
  const raw = await c.req.text();
  if (!isValidTwilioWebhookRequest(c.req.raw, raw)) {
    return c.body("Forbidden", 403);
  }
  try {
    const req = c.req.raw;
    const wss = resolveAiMediaWssOrThrow();
    const xml = buildAiConversationalTwiML({
      transcriptionCallbackUrl: buildWebhookUrl(req, transcriptionPath()),
      mediaStreamWssUrl: wss,
    });
    return c.body(xml, 200, twimlHeaders);
  } catch (e) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "es-ES", voice: "Polly.Lucia" }, e instanceof Error ? e.message.slice(0, 120) : "Error de configuración IA.");
    return c.body(twiml.toString(), 200, twimlHeaders);
  }
});

centralitaTwilioRoutes.post("/voice/status", async (c) => {
  try {
    const raw = await c.req.text();
    if (!isValidTwilioWebhookRequest(c.req.raw, raw)) {
      return c.body("Forbidden", 403);
    }
    const params = new URLSearchParams(raw);
    const summary = {
      CallSid: params.get("CallSid"),
      CallStatus: params.get("CallStatus"),
      From: params.get("From"),
      To: params.get("To"),
      Direction: params.get("Direction"),
    };
    console.log("[centralita-status]", JSON.stringify(summary));
  } catch {
    /* ignore */
  }
  return c.body(null, 204);
});
