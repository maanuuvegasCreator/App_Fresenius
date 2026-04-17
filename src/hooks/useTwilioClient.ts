import { useCallback, useEffect, useRef, useState } from "react";
import type { Call, Device } from "@twilio/voice-sdk";
import { fetchTwilioVoiceToken } from "@/lib/api-client";

function deriveServerRecording(call: Call): boolean {
  try {
    if (call.status() !== "open") return false;
  } catch {
    return false;
  }
  const map = call.customParameters;
  if (map && typeof map.get === "function") {
    const v = map.get("server_recording");
    if (v === "true" || v === "1") return true;
  }
  if (import.meta.env.VITE_ASSUME_SERVER_RECORDING === "true") return true;
  return false;
}

function parseRecordingFromMessage(content: unknown): boolean | null {
  if (!content || typeof content !== "object") return null;
  const o = content as { recordingStatus?: string; recording?: string };
  if (typeof o.recordingStatus === "string") {
    const s = o.recordingStatus.toLowerCase();
    if (s === "in-progress" || s === "recording") return true;
    if (s === "completed" || s === "absent" || s === "stopped") return false;
  }
  if (o.recording === "true" || o.recording === "1") return true;
  if (o.recording === "false" || o.recording === "0") return false;
  return null;
}

export type TwilioClientHook = {
  ready: boolean;
  error: string | null;
  identity: string | null;
  device: Device | null;
  /** Llamada entrante pendiente de aceptar / rechazar. */
  incoming: Call | null;
  /** Llamada activa (entrante aceptada o saliente conectada). */
  activeCall: Call | null;
  isMuted: boolean;
  /** Indicador de grabación en servidor (parámetro TwiML o mensaje SDK / env demo). */
  isRecording: boolean;
  connect: (toE164: string) => Promise<Call>;
  acceptIncoming: () => Call | null;
  rejectIncoming: () => void;
  hangup: () => void;
  toggleMute: () => void;
};

/**
 * Instancia única de {@link Device} Twilio Voice + llamada activa.
 * Token: GET `/api/twilio/token` (API Key + Secret en servidor).
 */
export function useTwilioClient(): TwilioClientHook {
  const deviceRef = useRef<Device | null>(null);
  const incomingRef = useRef<Call | null>(null);
  const activeRef = useRef<Call | null>(null);
  const detachCallListenersRef = useRef<(() => void) | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [incoming, setIncoming] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    incomingRef.current = incoming;
  }, [incoming]);

  useEffect(() => {
    activeRef.current = activeCall;
  }, [activeCall]);

  const attachCallListeners = useCallback((call: Call) => {
    detachCallListenersRef.current?.();
    detachCallListenersRef.current = null;

    const syncMute = () => {
      try {
        setIsMuted(call.isMuted());
      } catch {
        setIsMuted(false);
      }
    };

    const refreshRecording = () => {
      setIsRecording(deriveServerRecording(call));
    };

    const onMute = (muted: boolean) => setIsMuted(muted);
    const onAccept = () => {
      syncMute();
      refreshRecording();
    };
    const onDisconnect = () => {
      detachCallListenersRef.current = null;
      activeRef.current = null;
      setActiveCall(null);
      setIsMuted(false);
      setIsRecording(false);
    };
    const onMessage = (msg: { content?: unknown }) => {
      const parsed = parseRecordingFromMessage(msg?.content);
      if (parsed !== null) setIsRecording(parsed);
      else refreshRecording();
    };

    call.on("mute", onMute);
    call.on("accept", onAccept);
    call.on("disconnect", onDisconnect);
    call.on("messageReceived", onMessage);

    detachCallListenersRef.current = () => {
      call.off("mute", onMute);
      call.off("accept", onAccept);
      call.off("disconnect", onDisconnect);
      call.off("messageReceived", onMessage);
    };

    syncMute();
    refreshRecording();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let twilioDevice: Device | null = null;

    (async () => {
      try {
        const { token, identity: id } = await fetchTwilioVoiceToken();
        if (cancelled) return;
        setIdentity(id);

        const { Device: TwilioDevice } = await import("@twilio/voice-sdk");
        twilioDevice = new TwilioDevice(token, {
          logLevel: "error",
          closeProtection: true,
        });

        twilioDevice.on("error", (e: { message?: string }) => {
          const msg = e?.message || "Error de Twilio Voice";
          console.error("[TwilioDevice]", e);
          setError(msg);
        });

        twilioDevice.on("incoming", (call: Call) => {
          incomingRef.current = call;
          setIncoming(call);

          const clearIncoming = () => {
            if (incomingRef.current !== call) return;
            incomingRef.current = null;
            setIncoming(null);
          };
          call.once("cancel", clearIncoming);
          call.once("reject", clearIncoming);
          call.once("disconnect", () => {
            if (incomingRef.current === call) clearIncoming();
          });
        });

        twilioDevice.on("registered", () => {
          setReady(true);
          setError(null);
        });

        twilioDevice.on("unregistered", () => setReady(false));

        twilioDevice.on("tokenWillExpire", async () => {
          try {
            const d = deviceRef.current;
            if (!d) return;
            const next = await fetchTwilioVoiceToken();
            d.updateToken(next.token);
          } catch (err) {
            console.error("[TwilioDevice] token refresh", err);
          }
        });

        await twilioDevice.register();
        if (cancelled) {
          twilioDevice.destroy();
          return;
        }
        deviceRef.current = twilioDevice;
        setDevice(twilioDevice);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo iniciar Twilio Voice");
        }
      }
    })();

    return () => {
      cancelled = true;
      detachCallListenersRef.current?.();
      detachCallListenersRef.current = null;
      deviceRef.current?.destroy();
      deviceRef.current = null;
      incomingRef.current = null;
      activeRef.current = null;
      setDevice(null);
      setReady(false);
      setIncoming(null);
      setActiveCall(null);
      setIsMuted(false);
      setIsRecording(false);
    };
  }, [attachCallListeners]);

  const connect = useCallback(
    async (toE164: string) => {
      const d = deviceRef.current;
      if (!d) throw new Error("Teléfono no listo. Espera el registro o revisa el token.");
      if (incomingRef.current) throw new Error("Hay una llamada entrante: acéptala o recházala antes.");
      const call = await d.connect({ params: { To: toE164 } });
      activeRef.current = call;
      setActiveCall(call);
      attachCallListeners(call);
      return call;
    },
    [attachCallListeners]
  );

  const acceptIncoming = useCallback((): Call | null => {
    const call = incomingRef.current;
    if (!call) return null;
    call.accept();
    incomingRef.current = null;
    setIncoming(null);
    activeRef.current = call;
    setActiveCall(call);
    attachCallListeners(call);
    return call;
  }, [attachCallListeners]);

  const rejectIncoming = useCallback(() => {
    const call = incomingRef.current;
    if (!call) return;
    call.reject();
    incomingRef.current = null;
    setIncoming(null);
  }, []);

  const hangup = useCallback(() => {
    const call = activeRef.current;
    if (!call) return;
    try {
      call.disconnect();
    } catch {
      /* ignore */
    }
    detachCallListenersRef.current?.();
    detachCallListenersRef.current = null;
    activeRef.current = null;
    setActiveCall(null);
    setIsMuted(false);
    setIsRecording(false);
  }, []);

  const toggleMute = useCallback(() => {
    const call = activeRef.current;
    if (!call) return;
    try {
      const next = !call.isMuted();
      call.mute(next);
      setIsMuted(next);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    ready,
    error,
    identity,
    device,
    incoming,
    activeCall,
    isMuted,
    isRecording,
    connect,
    acceptIncoming,
    rejectIncoming,
    hangup,
    toggleMute,
  };
}
