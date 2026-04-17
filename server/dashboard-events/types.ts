export type DashboardServerEvent =
  | {
      type: "CALL_ESCALATED";
      callSid: string;
      callerNumber: string;
      motivo_transferencia: string | null;
      resumen_contexto: string;
    }
  | {
      type: "DASHBOARD_CONNECTED";
      serverTime: string;
    };
