import twilio from "twilio";
import type { DialTarget, StaticQueueId } from "../queues/static-queues";

const VOICE_LANG = "es-ES";

export type InboundTwiMLOptions = {
  welcomeText: string;
  /** POST absoluto del menú IVR (tras Gather). */
  ivrActionUrl: string;
  /** POST vuelta al saludo si no hay dígitos. */
  inboundVoiceUrl: string;
  /** wss opcional; si null, no se abre Media Stream. */
  mediaStreamWssUrl: string | null;
  streamName?: string;
};

export function buildInboundWelcomeTwiML(opts: InboundTwiMLOptions): string {
  const twiml = new twilio.twiml.VoiceResponse();

  if (opts.mediaStreamWssUrl) {
    const start = twiml.start();
    start.stream({
      url: opts.mediaStreamWssUrl,
      name: opts.streamName || "centralita-inbound",
      track: "inbound_track",
    });
  }

  twiml.say({ language: VOICE_LANG, voice: "Polly.Lucia" }, opts.welcomeText);

  const gather = twiml.gather({
    input: "dtmf",
    numDigits: 1,
    timeout: 10,
    action: opts.ivrActionUrl,
    method: "POST",
  });
  gather.say(
    { language: VOICE_LANG, voice: "Polly.Lucia" },
    "Para Atención General pulse 1. Para Incidencias pulse 2."
  );

  twiml.say({ language: VOICE_LANG, voice: "Polly.Lucia" }, "No hemos recibido su selección. Intentaremos de nuevo.");
  twiml.redirect({ method: "POST" }, opts.inboundVoiceUrl);

  return twiml.toString();
}

export function buildIvrDialQueueTwiML(target: DialTarget | null, retryInboundUrl: string): string {
  const twiml = new twilio.twiml.VoiceResponse();

  if (!target) {
    twiml.say({ language: VOICE_LANG, voice: "Polly.Lucia" }, "Esta cola no está configurada en el servidor. Contacte con administración.");
    twiml.pause({ length: 1 });
    twiml.redirect({ method: "POST" }, retryInboundUrl);
    return twiml.toString();
  }

  const callerId = (process.env.TWILIO_CALLER_ID || process.env.TWILIO_FROM_NUMBER || "").trim();
  const dial = twiml.dial({
    timeout: 55,
    answerOnBridge: true,
    ...(callerId ? { callerId } : {}),
  });

  if (target.kind === "client") {
    const clientNoun = dial.client({});
    clientNoun.identity(target.identity);
    clientNoun.parameter({ name: "server_recording", value: "true" });
  } else {
    dial.number(target.e164);
  }

  twiml.say({ language: VOICE_LANG, voice: "Polly.Lucia" }, "No hay respuesta en este momento. Volviendo al menú principal.");
  twiml.redirect({ method: "POST" }, retryInboundUrl);

  return twiml.toString();
}

export function queueFromDigit(digit: string | null): StaticQueueId | null {
  if (digit === "1") return "general";
  if (digit === "2") return "incidencias";
  return null;
}

/**
 * TwiML mínimo solo con &lt;Dial&gt; hacia un destino (p. ej. escalado desde REST `calls.update`).
 */
export function buildDialTargetTwiml(target: DialTarget | null): string {
  const twiml = new twilio.twiml.VoiceResponse();

  if (!target) {
    twiml.say({ language: VOICE_LANG, voice: "Polly.Lucia" }, "En este momento no podemos completar el traspaso. Gracias por su paciencia.");
    twiml.hangup();
    return twiml.toString();
  }

  const callerId = (process.env.TWILIO_CALLER_ID || process.env.TWILIO_FROM_NUMBER || "").trim();
  const dial = twiml.dial({
    timeout: 55,
    answerOnBridge: true,
    ...(callerId ? { callerId } : {}),
  });

  if (target.kind === "client") {
    const clientNoun = dial.client({});
    clientNoun.identity(target.identity);
    clientNoun.parameter({ name: "server_recording", value: "true" });
  } else {
    dial.number(target.e164);
  }

  return twiml.toString();
}
