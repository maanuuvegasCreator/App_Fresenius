import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import type { DashboardServerEvent } from "./types";

const clients = new Set<WebSocket>();

export const DASHBOARD_WS_PATH = "/api/dashboard/ws";

export function broadcastDashboardEvent(event: DashboardServerEvent): void {
  const raw = JSON.stringify(event);
  for (const ws of clients) {
    if (ws.readyState === 1) {
      try {
        ws.send(raw);
      } catch {
        clients.delete(ws);
      }
    }
  }
}

/**
 * WebSocket ligero para eventos del panel (p. ej. escalado IA → agente humano).
 */
export function attachDashboardEventsServer(server: Server, path: string = DASHBOARD_WS_PATH): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const host = request.headers.host || "localhost";
      const u = new URL(request.url || "/", `http://${host}`);
      if (u.pathname !== path) {
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        clients.add(ws);
        ws.send(
          JSON.stringify({
            type: "DASHBOARD_CONNECTED",
            serverTime: new Date().toISOString(),
          } satisfies DashboardServerEvent)
        );
        ws.on("close", () => {
          clients.delete(ws);
        });
        ws.on("error", () => {
          clients.delete(ws);
        });
      });
    } catch {
      socket.destroy();
    }
  });

  return wss;
}
