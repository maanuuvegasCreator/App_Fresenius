import { useEffect, useRef } from "react";
import { parseDashboardClientEvent } from "@/types/dashboard-events";
import { useDashboardEscalations } from "@/context/DashboardEscalationsContext";
import { getDashboardWebSocketUrl } from "@/lib/api-base";

/**
 * WebSocket al servidor API: recibe `CALL_ESCALATED` y lo guarda en contexto global.
 */
export function useDashboardSocket(enabled: boolean = true): void {
  const { recordEscalation } = useDashboardEscalations();
  const recordRef = useRef(recordEscalation);
  recordRef.current = recordEscalation;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let ws: WebSocket | null = null;
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      const url = getDashboardWebSocketUrl();
      try {
        ws = new WebSocket(url);
      } catch {
        reconnectTimer = setTimeout(connect, 4000);
        return;
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data)) as unknown;
          const parsed = parseDashboardClientEvent(data);
          if (parsed?.type === "CALL_ESCALATED") {
            recordRef.current(parsed);
          }
        } catch {
          /* ignore malformed */
        }
      };

      ws.onclose = () => {
        ws = null;
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3500);
        }
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          /* ignore */
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  }, [enabled]);
}
