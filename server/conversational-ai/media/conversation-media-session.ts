import type { WebSocket } from "ws";
import type { RawData } from "ws";
import { runStructuredAgentTurn, type ChatTurn } from "../ai-agent";
import { transferActiveCallToGeneralQueue } from "../twilio/escalate-to-human";
import { notifyCallEscalatedToDashboard } from "../../dashboard-events/notify-call-escalated";
import { getInboundEnergyBargeThreshold } from "../config";
import type { ConversationSessionSink } from "../session-registry";
import { registerConversationSession, unregisterConversationSession } from "../session-registry";
import type { TranscriptionContentPayload } from "../stt/transcription-callback";
import { streamElevenLabsUlaw } from "../tts/elevenlabs-ulaw-stream";
import { sendTwilioClear, sendTwilioOutboundMedia, TWILIO_MULAW_FRAME_BYTES } from "../twilio-ws-protocol";

type TwilioWsEvent = { event?: string; start?: { callSid?: string }; streamSid?: string; media?: { track?: string; payload?: string } };

function parseWsJson(raw: RawData): TwilioWsEvent | null {
  try {
    const text = typeof raw === "string" ? raw : raw.toString("utf8");
    return JSON.parse(text) as TwilioWsEvent;
  } catch {
    return null;
  }
}

function mulawChunkAverageDeviation(buf: Buffer): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    sum += Math.abs((buf[i]! ^ 0xff) - 127);
  }
  return buf.length ? sum / buf.length : 0;
}

async function pumpUlawStreamToTwilio(
  stream: ReadableStream<Uint8Array>,
  ws: WebSocket,
  streamSid: string,
  signal: AbortSignal
): Promise<void> {
  const reader = stream.getReader();
  let carry = Buffer.alloc(0);
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.length) {
        carry = Buffer.concat([carry, Buffer.from(value)]);
      }
      while (carry.length >= TWILIO_MULAW_FRAME_BYTES) {
        const frame = carry.subarray(0, TWILIO_MULAW_FRAME_BYTES);
        carry = carry.subarray(TWILIO_MULAW_FRAME_BYTES);
        sendTwilioOutboundMedia(ws, streamSid, frame.toString("base64"));
      }
    }
    if (carry.length > 0 && !signal.aborted) {
      const padded = Buffer.alloc(TWILIO_MULAW_FRAME_BYTES, 0x7f);
      carry.copy(padded);
      sendTwilioOutboundMedia(ws, streamSid, padded.toString("base64"));
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Sesión por llamada: audio WS Twilio + orquestación STT (HTTP) + LLM + ElevenLabs.
 */
export class ConversationMediaSession implements ConversationSessionSink {
  private ended = false;
  private callSid: string | null = null;
  private streamSid: string | null = null;
  private history: ChatTurn[] = [];
  private ttsAbort: AbortController | null = null;
  private ttsPlaying = false;
  private processing = false;
  private utteranceDebounce: ReturnType<typeof setTimeout> | null = null;
  private pendingUtterance: string | null = null;

  constructor(private readonly ws: WebSocket) {
    ws.on("message", (data) => void this.onMessage(data));
    ws.on("close", () => this.dispose());
    ws.on("error", () => this.dispose());
  }

  private dispose(): void {
    if (this.ended) return;
    this.ended = true;
    if (this.utteranceDebounce) {
      clearTimeout(this.utteranceDebounce);
      this.utteranceDebounce = null;
    }
    this.bargeIn("ws_close");
    if (this.callSid) unregisterConversationSession(this.callSid);
    this.callSid = null;
    this.streamSid = null;
  }

  handleTranscriptionEvent(payload: TranscriptionContentPayload): void {
    const ev = payload.transcriptionEvent;
    if (ev === "transcription-started" || ev === "transcription-stopped") {
      console.log("[ai-stt]", ev, payload.callSid);
      return;
    }
    if (ev !== "transcription-content") return;

    const inbound =
      !payload.track || payload.track === "inbound_track" || payload.track === "inbound";
    if (!inbound) return;

    const text = (payload.transcript || "").trim();
    const isFinal = payload.final === true;

    if (this.ttsPlaying && !isFinal && text.length >= 2) {
      const stable = payload.stability ?? 0;
      if (stable >= 0.45 || text.length >= 6) {
        this.bargeIn("stt_partial");
      }
    }

    if (isFinal && text) {
      this.pendingUtterance = text;
      if (this.utteranceDebounce) clearTimeout(this.utteranceDebounce);
      this.utteranceDebounce = setTimeout(() => {
        this.utteranceDebounce = null;
        const u = this.pendingUtterance;
        this.pendingUtterance = null;
        if (u) void this.runUserTurn(u);
      }, 320);
    }
  }

  private bargeIn(reason: string): void {
    if (!this.ttsPlaying && !this.ttsAbort) return;
    console.log("[ai-agent] barge-in", reason);
    try {
      this.ttsAbort?.abort();
    } catch {
      /* ignore */
    }
    this.ttsAbort = null;
    this.ttsPlaying = false;
    if (this.streamSid && this.ws.readyState === 1) {
      sendTwilioClear(this.ws, this.streamSid);
    }
  }

  private async onMessage(raw: RawData): Promise<void> {
    const msg = parseWsJson(raw);
    if (!msg?.event) return;

    switch (msg.event) {
      case "start": {
        this.streamSid = msg.streamSid || msg.start?.streamSid || null;
        this.callSid = msg.start?.callSid || null;
        if (this.callSid && this.streamSid) {
          registerConversationSession(this.callSid, this);
          console.log("[ai-media] start", { callSid: this.callSid, streamSid: this.streamSid });
          void this.playAgentTts(
            "Hola, soy el asistente virtual de Fresenius Medical Care. ¿En qué puedo ayudarle con su material de hemodiálisis a domicilio?"
          );
        }
        break;
      }
      case "media": {
        const track = msg.media?.track || "";
        if (track !== "inbound" && track !== "inbound_track") break;
        const b64 = msg.media?.payload;
        if (!b64 || !this.streamSid) break;
        let buf: Buffer;
        try {
          buf = Buffer.from(b64, "base64");
        } catch {
          break;
        }
        if (this.ttsPlaying && buf.length > 0) {
          const e = mulawChunkAverageDeviation(buf);
          if (e >= getInboundEnergyBargeThreshold()) {
            this.bargeIn("inbound_energy");
          }
        }
        break;
      }
      case "stop":
        this.dispose();
        break;
      default:
        break;
    }
  }

  private async runUserTurn(userText: string): Promise<void> {
    if (this.processing || !this.streamSid) return;
    this.processing = true;
    try {
      this.history.push({ role: "user", content: userText });
      const prior = this.history.slice(0, -1);
      const turn = await runStructuredAgentTurn(userText, prior);
      this.history.push({ role: "assistant", content: turn.speech });

      await this.playAgentTts(turn.speech);

      if (turn.transferRequested && this.callSid) {
        console.log("[ai-escalado] Transferencia a Atención General", {
          callSid: this.callSid,
          motivo: turn.motivoTransferencia,
          resumen: turn.resumenContexto?.slice(0, 200),
        });
        try {
          await notifyCallEscalatedToDashboard({
            callSid: this.callSid,
            motivo_transferencia: turn.motivoTransferencia,
            resumen_contexto: turn.resumenContexto,
          });
          await transferActiveCallToGeneralQueue(this.callSid);
        } catch (err) {
          console.error("[ai-escalado] Fallo REST Twilio", err);
          await this.playAgentTts(
            "No hemos podido completar el traspaso automático. Por favor, permanezca en línea o vuelva a llamar al número de atención."
          );
          return;
        }
        this.shutdownAfterHumanTransfer();
      }
    } catch (err) {
      console.error("[ai-agent] turn error", err);
      await this.playAgentTts("Disculpe, ha ocurrido un error. ¿Podría repetir, por favor?");
    } finally {
      this.processing = false;
    }
  }

  /** Tras `calls.update` a cola humana: deja de procesar STT y cierra el WebSocket de Media Stream. */
  private shutdownAfterHumanTransfer(): void {
    if (this.ended) return;
    if (this.utteranceDebounce) {
      clearTimeout(this.utteranceDebounce);
      this.utteranceDebounce = null;
    }
    this.pendingUtterance = null;
    if (this.callSid) unregisterConversationSession(this.callSid);
    this.callSid = null;
    this.bargeIn("human_transfer");
    this.streamSid = null;
    this.ended = true;
    try {
      if (this.ws.readyState === 1) this.ws.close();
    } catch {
      /* ignore */
    }
  }

  private async playAgentTts(text: string): Promise<void> {
    if (!this.streamSid || this.ws.readyState !== 1) return;

    this.bargeIn("replace_tts");
    sendTwilioClear(this.ws, this.streamSid);

    const ac = new AbortController();
    this.ttsAbort = ac;
    this.ttsPlaying = true;

    try {
      const body = await streamElevenLabsUlaw(text, { signal: ac.signal });
      await pumpUlawStreamToTwilio(body, this.ws, this.streamSid, ac.signal);
    } catch (err) {
      if (!ac.signal.aborted) {
        console.error("[ai-agent] ElevenLabs stream failed", err);
      }
    } finally {
      this.ttsPlaying = false;
      this.ttsAbort = null;
    }
  }
}
