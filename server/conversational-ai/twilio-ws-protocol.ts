import type { WebSocket } from "ws";

/** ~20 ms a 8 kHz μ-law = 160 bytes por frame Twilio. */
export const TWILIO_MULAW_FRAME_BYTES = 160;

export function sendTwilioClear(ws: WebSocket, streamSid: string): void {
  if (ws.readyState !== 1 /* OPEN */) return;
  ws.send(JSON.stringify({ event: "clear", streamSid }));
}

export function sendTwilioOutboundMedia(ws: WebSocket, streamSid: string, payloadBase64: string): void {
  if (ws.readyState !== 1) return;
  ws.send(
    JSON.stringify({
      event: "media",
      streamSid,
      media: { payload: payloadBase64 },
    })
  );
}

export function sendTwilioMark(ws: WebSocket, streamSid: string, name: string): void {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify({ event: "mark", streamSid, mark: { name } }));
}

/** Particiona audio μ-law continuo en frames de 160 B para Twilio. */
export function* chunkUlawToTwilioFrames(buf: Buffer): Generator<string> {
  let offset = 0;
  while (offset + TWILIO_MULAW_FRAME_BYTES <= buf.length) {
    const slice = buf.subarray(offset, offset + TWILIO_MULAW_FRAME_BYTES);
    yield slice.toString("base64");
    offset += TWILIO_MULAW_FRAME_BYTES;
  }
  if (offset < buf.length) {
    const rest = buf.subarray(offset);
    const padded = Buffer.alloc(TWILIO_MULAW_FRAME_BYTES, 0x7f);
    rest.copy(padded);
    yield padded.toString("base64");
  }
}
