export type CallEscalatedDashboardEvent = {
  type: "CALL_ESCALATED";
  callSid: string;
  callerNumber: string;
  motivo_transferencia: string | null;
  resumen_contexto: string;
};

export type DashboardClientEvent =
  | CallEscalatedDashboardEvent
  | {
      type: "DASHBOARD_CONNECTED";
      serverTime: string;
    };

export function parseDashboardClientEvent(raw: unknown): DashboardClientEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const t = (raw as { type?: string }).type;
  if (t === "CALL_ESCALATED") {
    const callSid = (raw as { callSid?: string }).callSid;
    if (typeof callSid !== "string") return null;
    const rawMotivo = (raw as { motivo_transferencia?: unknown }).motivo_transferencia;
    const motivo_transferencia =
      rawMotivo === null ? null : typeof rawMotivo === "string" ? rawMotivo : null;
    return {
      type: "CALL_ESCALATED",
      callSid,
      callerNumber: typeof (raw as { callerNumber?: string }).callerNumber === "string" ? (raw as { callerNumber: string }).callerNumber : "",
      motivo_transferencia,
      resumen_contexto:
        typeof (raw as { resumen_contexto?: string }).resumen_contexto === "string"
          ? (raw as { resumen_contexto: string }).resumen_contexto
          : "",
    };
  }
  if (t === "DASHBOARD_CONNECTED") {
    const serverTime = (raw as { serverTime?: string }).serverTime;
    if (typeof serverTime !== "string") return null;
    return { type: "DASHBOARD_CONNECTED", serverTime };
  }
  return null;
}
