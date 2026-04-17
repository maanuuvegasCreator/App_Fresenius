import type { RawData, WebSocket } from "ws";
import type { TwilioStreamInboundEvent, TwilioStreamMediaEvent, TwilioStreamStartEvent } from "./twilio-stream-types";

export type MediaStreamHooks = {
  onConnected?: () => void;
  onStart?: (meta: { streamSid: string; callSid: string; encoding: string; sampleRate: number }) => void;
  /** Audio μ-law (G.711), 8 kHz mono — listo para encadenar con STT/IA. */
  onMulawPayload?: (chunk: { track: string; timestamp: string; payload: Buffer }) => void;
  onStop?: (reason?: string) => void;
};

function parseJson(raw: RawData): TwilioStreamInboundEvent | null {
  try {
    const text = typeof raw === "string" ? raw : raw.toString("utf8");
    return JSON.parse(text) as TwilioStreamInboundEvent;
  } catch {
    return null;
  }
}

/**
 * Una sesión WebSocket = un stream de Twilio (p. ej. audio entrante de la llamada).
 */
export class TwilioMediaStreamSession {
  private mediaChunks = 0;

  constructor(
    private readonly ws: WebSocket,
    private readonly hooks: MediaStreamHooks = {}
  ) {
    ws.on("message", (data) => this.onMessage(data));
    ws.on("close", () => this.hooks.onStop?.("close"));
    ws.on("error", (err) => this.hooks.onStop?.(err.message));
  }

  private onMessage(raw: RawData): void {
    const msg = parseJson(raw);
    if (!msg || typeof msg !== "object" || !("event" in msg)) return;

    switch (msg.event) {
      case "connected":
        this.hooks.onConnected?.();
        break;
      case "start": {
        const s = msg as TwilioStreamStartEvent;
        const fmt = s.start?.mediaFormat;
        this.hooks.onStart?.({
          streamSid: s.streamSid || "",
          callSid: s.start?.callSid || "",
          encoding: fmt?.encoding || "audio/x-mulaw",
          sampleRate: fmt?.sampleRate || 8000,
        });
        break;
      }
      case "media": {
        const m = msg as TwilioStreamMediaEvent;
        const b64 = m.media?.payload;
        if (!b64) break;
        let buf: Buffer;
        try {
          buf = Buffer.from(b64, "base64");
        } catch {
          break;
        }
        this.mediaChunks += 1;
        this.hooks.onMulawPayload?.({
          track: m.media.track,
          timestamp: m.media.timestamp,
          payload: buf,
        });
        break;
      }
      case "stop":
        this.hooks.onStop?.("stop");
        break;
      default:
        break;
    }
  }

  get chunkCount(): number {
    return this.mediaChunks;
  }
}
