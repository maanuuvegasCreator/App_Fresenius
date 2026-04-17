import { createTwilioRestClient } from "../twilio-rest-client";
import { broadcastDashboardEvent } from "./dashboard-ws-hub";

export async function fetchCallerNumberForCallSid(callSid: string): Promise<string> {
  try {
    const client = createTwilioRestClient();
    const call = await client.calls(callSid).fetch();
    return (call.from as string) || "";
  } catch (err) {
    console.warn("[dashboard-events] No se pudo obtener From del CallSid", callSid, err);
    return "";
  }
}

/** Emite a los clientes del dashboard antes de transferir la llamada a humano. */
export async function notifyCallEscalatedToDashboard(params: {
  callSid: string;
  motivo_transferencia: string | null;
  resumen_contexto: string;
}): Promise<void> {
  const callerNumber = await fetchCallerNumberForCallSid(params.callSid);
  broadcastDashboardEvent({
    type: "CALL_ESCALATED",
    callSid: params.callSid,
    callerNumber,
    motivo_transferencia: params.motivo_transferencia,
    resumen_contexto: params.resumen_contexto,
  });
}
