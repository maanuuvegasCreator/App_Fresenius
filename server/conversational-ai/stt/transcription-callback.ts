/**
 * Twilio Real-Time Transcription envía eventos por HTTP POST (application/x-www-form-urlencoded),
 * no por el WebSocket de Media Streams.
 */

export type TranscriptionContentPayload = {
  transcriptionEvent: string;
  callSid: string;
  track?: string;
  transcript?: string;
  final?: boolean;
  stability?: number;
  raw: Record<string, string>;
};

function get(params: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = params[k] ?? params[k.toLowerCase()];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

export function parseTranscriptionFormBody(body: string): TranscriptionContentPayload | null {
  const params: Record<string, string> = {};
  new URLSearchParams(body).forEach((value, key) => {
    params[key] = value;
  });

  const transcriptionEvent = get(params, "TranscriptionEvent", "transcriptionEvent");
  const callSid = get(params, "CallSid", "callSid");
  if (!transcriptionEvent || !callSid) return null;

  const track = get(params, "Track", "track") || undefined;
  let transcript: string | undefined;
  let final: boolean | undefined;
  let stability: number | undefined;

  const dataRaw = get(params, "TranscriptionData", "transcriptionData");
  if (dataRaw) {
    try {
      const parsed = JSON.parse(dataRaw) as { transcript?: string; confidence?: number };
      transcript = typeof parsed.transcript === "string" ? parsed.transcript : undefined;
    } catch {
      /* ignore */
    }
  }

  const finalStr = get(params, "Final", "final");
  if (finalStr === "true" || finalStr === "True") final = true;
  else if (finalStr === "false" || finalStr === "False") final = false;

  const stabStr = get(params, "Stability", "stability");
  if (stabStr) {
    const n = Number(stabStr);
    if (Number.isFinite(n)) stability = n;
  }

  return {
    transcriptionEvent,
    callSid,
    track,
    transcript,
    final,
    stability,
    raw: params,
  };
}
