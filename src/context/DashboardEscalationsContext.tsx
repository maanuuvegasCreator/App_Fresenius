import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CallEscalatedDashboardEvent } from "@/types/dashboard-events";

type EscalationsMap = ReadonlyMap<string, CallEscalatedDashboardEvent>;

type DashboardEscalationsContextValue = {
  /** Por CallSid (Twilio). */
  escalationsByCallSid: EscalationsMap;
  recordEscalation: (event: CallEscalatedDashboardEvent) => void;
  clearEscalationForCallSid: (callSid: string) => void;
  getEscalationForCallSid: (callSid: string | undefined) => CallEscalatedDashboardEvent | undefined;
};

const DashboardEscalationsContext = createContext<DashboardEscalationsContextValue | null>(null);

export function DashboardEscalationsProvider({ children }: { children: ReactNode }) {
  const [escalationsByCallSid, setEscalationsByCallSid] = useState<EscalationsMap>(() => new Map());

  const recordEscalation = useCallback((event: CallEscalatedDashboardEvent) => {
    setEscalationsByCallSid((prev) => {
      const next = new Map(prev);
      next.set(event.callSid, event);
      return next;
    });
  }, []);

  const clearEscalationForCallSid = useCallback((callSid: string) => {
    setEscalationsByCallSid((prev) => {
      if (!prev.has(callSid)) return prev;
      const next = new Map(prev);
      next.delete(callSid);
      return next;
    });
  }, []);

  const getEscalationForCallSid = useCallback(
    (callSid: string | undefined) => (callSid ? escalationsByCallSid.get(callSid) : undefined),
    [escalationsByCallSid]
  );

  const value = useMemo(
    () =>
      ({
        escalationsByCallSid,
        recordEscalation,
        clearEscalationForCallSid,
        getEscalationForCallSid,
      }) satisfies DashboardEscalationsContextValue,
    [escalationsByCallSid, recordEscalation, clearEscalationForCallSid, getEscalationForCallSid]
  );

  return (
    <DashboardEscalationsContext.Provider value={value}>{children}</DashboardEscalationsContext.Provider>
  );
}

export function useDashboardEscalations(): DashboardEscalationsContextValue {
  const ctx = useContext(DashboardEscalationsContext);
  if (!ctx) {
    throw new Error("useDashboardEscalations debe usarse dentro de DashboardEscalationsProvider");
  }
  return ctx;
}
