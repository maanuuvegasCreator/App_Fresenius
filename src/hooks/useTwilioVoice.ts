import { useCallback, useEffect, useRef, useState } from "react";
import type { Call, Device } from "@twilio/voice-sdk";
import { fetchVoiceToken } from "@/lib/api-client";

type VoiceHook = {
  ready: boolean;
  error: string | null;
  identity: string | null;
  incoming: Call | null;
  connect: (toE164: string) => Promise<Call>;
  /** Devuelve la misma instancia de llamada aceptada (para enlazar estado UI). */
  acceptIncoming: () => Call | null;
  rejectIncoming: () => void;
};

/**
 * Cliente Twilio Voice (WebRTC) para centralita real.
 * Registra el Device con el JWT de GET /api/token (Supabase Bearer o cookie mock).
 */
export function useTwilioVoice(): VoiceHook {
  const deviceRef = useRef<Device | null>(null);
  const incomingRef = useRef<Call | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Call | null>(null);

  useEffect(() => {
    incomingRef.current = incoming;
  }, [incoming]);

  useEffect(() => {
    let cancelled = false;
    let device: Device | null = null;

    (async () => {
      try {
        const { token, identity: id } = await fetchVoiceToken();
        if (cancelled) return;
        setIdentity(id);

        const { Device: TwilioDevice } = await import("@twilio/voice-sdk");
        device = new TwilioDevice(token, {
          logLevel: "error",
          closeProtection: true,
        });

        device.on("error", (e: { message?: string }) => {
          const msg = e?.message || "Error de Twilio Voice";
          console.error("[TwilioDevice]", e);
          setError(msg);
        });

        device.on("incoming", (call: Call) => {
          incomingRef.current = call;
          setIncoming(call);
        });

        device.on("registered", () => {
          setReady(true);
          setError(null);
        });

        device.on("unregistered", () => setReady(false));

        device.on("tokenWillExpire", async () => {
          try {
            const d = deviceRef.current;
            if (!d) return;
            const next = await fetchVoiceToken();
            d.updateToken(next.token);
          } catch (err) {
            console.error("[TwilioDevice] token refresh", err);
          }
        });

        await device.register();
        if (cancelled) {
          device.destroy();
          return;
        }
        deviceRef.current = device;
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar Twilio Voice");
        }
      }
    })();

    return () => {
      cancelled = true;
      deviceRef.current?.destroy();
      deviceRef.current = null;
      incomingRef.current = null;
      setReady(false);
      setIncoming(null);
    };
  }, []);

  const connect = useCallback(async (toE164: string) => {
    const device = deviceRef.current;
    if (!device) throw new Error("Teléfono no listo. Espera el registro o revisa el token.");
    if (incomingRef.current) throw new Error("Hay una llamada entrante: acéptala o recházala antes.");
    return device.connect({ params: { To: toE164 } });
  }, []);

  const acceptIncoming = useCallback((): Call | null => {
    const call = incomingRef.current;
    if (!call) return null;
    call.accept();
    incomingRef.current = null;
    setIncoming(null);
    return call;
  }, []);

  const rejectIncoming = useCallback(() => {
    const call = incomingRef.current;
    if (!call) return;
    call.reject();
    incomingRef.current = null;
    setIncoming(null);
  }, []);

  return {
    ready,
    error,
    identity,
    incoming,
    connect,
    acceptIncoming,
    rejectIncoming,
  };
}
