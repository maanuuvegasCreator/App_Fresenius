import { getElevenLabsApiKey, getElevenLabsModelId, getElevenLabsVoiceId } from "../config";

/**
 * ElevenLabs TTS en streaming con salida **ulaw_8000** (compatible Twilio Media Streams).
 */
export async function streamElevenLabsUlaw(
  text: string,
  options: { signal?: AbortSignal } = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");

  const voiceId = getElevenLabsVoiceId();
  const modelId = getElevenLabsModelId();
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`);
  url.searchParams.set("output_format", "ulaw_8000");
  url.searchParams.set("optimize_streaming_latency", "3");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/x-ulaw, audio/basic, application/octet-stream, */*",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
    }),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${res.status}: ${errText.slice(0, 200)}`);
  }

  return res.body;
}
