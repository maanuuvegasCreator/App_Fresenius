import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { ConversationMediaSession } from "../../conversational-ai/media/conversation-media-session";
import { CENTRALITA_MEDIA_WS_PATH } from "../config";
import type { MediaStreamHooks } from "./media-stream-session";
import { TwilioMediaStreamSession } from "./media-stream-session";

let globalHooks: MediaStreamHooks = {};

/** Punto de extensión para IA: registrar callbacks sobre el audio en tiempo real. */
export function setCentralitaMediaStreamHooks(hooks: MediaStreamHooks): void {
  globalHooks = hooks;
}

function conversationalAiMediaEnabled(): boolean {
  if (process.env.CENTRALITA_AI_MEDIA_HANDLER === "passthrough") return false;
  if (process.env.CENTRALITA_AI_MEDIA_HANDLER === "conversation") return true;
  const el = process.env.ELEVENLABS_API_KEY?.trim();
  const llm =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  return Boolean(el && llm);
}

function handleConnection(ws: WebSocket): void {
  if (conversationalAiMediaEnabled()) {
    new ConversationMediaSession(ws);
    return;
  }
  new TwilioMediaStreamSession(ws, {
    onConnected: () => {
      globalHooks.onConnected?.();
      console.log("[centralita-media] connected");
    },
    onStart: (meta) => {
      globalHooks.onStart?.(meta);
      console.log("[centralita-media] start", meta);
    },
    onMulawPayload: (chunk) => {
      globalHooks.onMulawPayload?.(chunk);
    },
    onStop: (reason) => {
      globalHooks.onStop?.(reason);
      console.log("[centralita-media] stop", reason ?? "");
    },
  });
}

/**
 * Enlaza el WebSocket de Media Streams al mismo `http.Server` que Hono.
 * Ruta: {@link CENTRALITA_MEDIA_WS_PATH} (por defecto `/api/twilio/media-stream`).
 */
export function attachTwilioMediaStreamServer(server: Server, path: string = CENTRALITA_MEDIA_WS_PATH): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const host = request.headers.host || "localhost";
      const u = new URL(request.url || "/", `http://${host}`);
      if (u.pathname !== path) {
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleConnection(ws);
      });
    } catch {
      socket.destroy();
    }
  });

  return wss;
}
