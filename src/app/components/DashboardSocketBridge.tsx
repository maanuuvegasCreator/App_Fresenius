import { useDashboardSocket } from "@/hooks/useDashboardSocket";

/** Conecta el WebSocket de eventos del dashboard mientras el layout principal está montado. */
export function DashboardSocketBridge() {
  useDashboardSocket(true);
  return null;
}
