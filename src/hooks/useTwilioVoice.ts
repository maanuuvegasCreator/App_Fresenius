import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Device, type Call } from "@twilio/voice-sdk";
import { fetchVoiceToken } from "@/lib/api-client";
import { toE164 } from "@/lib/phone-e164";

export type TwilioCallPhase = "idle" | "registering" | "ready" | "connecting" | "ringing" | "open" | "error";

export type UseTwilioVoiceOptions = {
  onCallEnded?: () => void;
};

export function useTwilioVoice(options: UseTwilioVoiceOptions = {}) {
  const { onCallEnded } = options;
  const onCallEndedRef = useRef(onCallEnded);
  onCallEndedRef.current = onCallEnded;

  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<Call | null>(null);
  const pendingIncomingRef = useRef<Call | null>(null);

  const [devicePhase, setDevicePhase] = useState<TwilioCallPhase>("idle");
  const [identity, setIdentity] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callPhase, setCallPhase] = useState<TwilioCallPhase>("idle");
  const [pendingIncoming, setPendingIncoming] = useState<Call | null>(null);
  const [lastCallError, setLastCallError] = useState<string | null>(null);

  const wireCall = useCallback((call: Call) => {
    activeCallRef.current = call;
    setActiveCall(call);
    setCallPhase("ringing");

    const onAccept = () => setCallPhase("open");
    const onDisconnect = () => {
      activeCallRef.current = null;
      setActiveCall(null);
      setCallPhase("idle");
      onCallEndedRef.current?.();
    };
    const onCancel = () => {
      activeCallRef.current = null;
      setActiveCall(null);
      setCallPhase("idle");
    };
    const onReject = () => {
      activeCallRef.current = null;
      setActiveCall(null);
      setCallPhase("idle");
    };
    const onError = (err: { message?: string } | Error) => {
      const msg = err instanceof Error ? err.message : err?.message || "Error de llamada";
      setLastCallError(msg);
      setCallPhase("error");
    };

    call.on("accept", onAccept);
    call.on("disconnect", onDisconnect);
    call.on("cancel", onCancel);
    call.on("reject", onReject);
    call.on("error", onError);

    try {
      if (call.status() === "open") setCallPhase("open");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      setDevicePhase("registering");
      setDeviceError(null);
      try {
        const { token, identity: id } = await fetchVoiceToken();
        if (cancelled) return;

        setIdentity(id || null);
        const device = new Device(token, {
          logLevel: import.meta.env.DEV ? 1 : 0,
        });

        device.on("registered", () => {
          if (!cancelled) setDevicePhase("ready");
        });
        device.on("unregistered", () => {
          if (!cancelled) setDevicePhase("idle");
        });
        device.on("error", (e: Error & { message?: string }) => {
          if (!cancelled) setDeviceError(e?.message || "Error de Twilio Device");
        });
        device.on("tokenWillExpire", async () => {
          try {
            const { token: t2 } = await fetchVoiceToken();
            await device.updateToken(t2);
          } catch {
            /* ignore */
          }
        });
        device.on("incoming", (call: Call) => {
          if (cancelled) return;
          pendingIncomingRef.current = call;
          setPendingIncoming(call);
        });

        await device.register();
        if (cancelled) {
          device.destroy();
          return;
        }
        deviceRef.current = device;
        setDevicePhase("ready");
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "No se pudo registrar Twilio";
        setDeviceError(msg);
        setDevicePhase("error");
      }
    }

    void setup();

    return () => {
      cancelled = true;
      try {
        activeCallRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      activeCallRef.current = null;
      const d = deviceRef.current;
      deviceRef.current = null;
      if (d) {
        try {
          d.destroy();
        } catch {
          /* ignore */
        }
      }
    };
  }, [wireCall]);

  const connectOutbound = useCallback(
    async (rawNumber: string) => {
      setLastCallError(null);
      const device = deviceRef.current;
      if (!device) throw new Error("Twilio no está listo. Espera el registro o revisa el token.");
      const to = toE164(rawNumber);
      if (!to || to.length < 8) {
        throw new Error("Número inválido. Usa formato internacional con prefijo (ej. +34912…).");
      }
      setCallPhase("connecting");
      try {
        const call = await device.connect({ params: { To: to } });
        wireCall(call);
        return call;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "No se pudo iniciar la llamada";
        setLastCallError(msg);
        setCallPhase("error");
        throw e;
      }
    },
    [wireCall],
  );

  const hangUp = useCallback(() => {
    try {
      activeCallRef.current?.disconnect();
    } catch {
      /* ignore */
    }
    activeCallRef.current = null;
    setActiveCall(null);
    setCallPhase("idle");
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    const c = activeCallRef.current;
    if (!c) return;
    try {
      c.mute(muted);
    } catch {
      /* ignore */
    }
  }, []);

  const acceptIncoming = useCallback(() => {
    const c = pendingIncomingRef.current;
    if (!c) return;
    pendingIncomingRef.current = null;
    setPendingIncoming(null);
    try {
      c.accept();
      wireCall(c);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo aceptar";
      setLastCallError(msg);
    }
  }, [wireCall]);

  const rejectIncoming = useCallback(() => {
    const c = pendingIncomingRef.current;
    if (!c) return;
    pendingIncomingRef.current = null;
    setPendingIncoming(null);
    try {
      c.reject();
    } catch {
      /* ignore */
    }
  }, []);

  return useMemo(
    () => ({
      identity,
      devicePhase,
      deviceError,
      activeCall,
      callPhase,
      pendingIncoming,
      lastCallError,
      connectOutbound,
      hangUp,
      setMuted,
      acceptIncoming,
      rejectIncoming,
    }),
    [
      identity,
      devicePhase,
      deviceError,
      activeCall,
      callPhase,
      pendingIncoming,
      lastCallError,
      connectOutbound,
      hangUp,
      setMuted,
      acceptIncoming,
      rejectIncoming,
    ],
  );
}
