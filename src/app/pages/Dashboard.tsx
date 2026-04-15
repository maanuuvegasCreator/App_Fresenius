import { useCallback, useEffect, useState } from "react";
import { Phone, Users, History, X, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Dialpad } from "../components/Dialpad";
import { EnhancedActiveCall } from "../components/EnhancedActiveCall";
import { ContactList } from "../components/ContactList";
import { CallHistory } from "../components/CallHistory";
import { StatusSelector } from "../components/StatusSelector";
import { useTwilioVoice } from "@/hooks/useTwilioVoice";
import { fetchCalls } from "@/lib/api-client";
import { buildContactsFromCalls, mapToHistoryCalls } from "@/lib/call-mappers";
import type { BackendCall } from "@/types/backend";
import type { SimpleContact } from "@/lib/call-mappers";

function contactRowsFromCalls(calls: BackendCall[]) {
  return buildContactsFromCalls(calls).map((c: SimpleContact) => ({
    id: c.id,
    name: c.name,
    phone: c.mainNumber,
    email: c.emails[0],
    company: c.company === "—" ? undefined : c.company,
    tags: c.lastContact ? [`Último: ${c.lastContact}`] : [],
  }));
}

export function Dashboard() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [activeContact, setActiveContact] = useState("");
  const [activePhone, setActivePhone] = useState("");
  const [activeView, setActiveView] = useState<"dialpad" | "contacts" | "history">("dialpad");
  const [userStatus, setUserStatus] = useState<"available" | "busy" | "away">("available");
  const [calls, setCalls] = useState<BackendCall[]>([]);
  const [callsError, setCallsError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const voice = useTwilioVoice({
    onCallEnded: () => {
      setIsInCall(false);
      setMuted(false);
      setActiveContact("");
      setActivePhone("");
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await fetchCalls(300);
        if (!cancelled) {
          setCalls(c);
          setCallsError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setCalls([]);
          setCallsError(e instanceof Error ? e.message : "No se pudo cargar el historial");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const historyRecords = mapToHistoryCalls(calls);
  const contactRows = contactRowsFromCalls(calls);

  const handleCall = useCallback(
    async (number?: string, name?: string) => {
      const numberToCall = number || phoneNumber;
      if (!numberToCall?.trim()) return;
      setActiveContact(name || numberToCall);
      setActivePhone(numberToCall);
      setIsInCall(true);
      setMuted(false);
      setPhoneNumber("");
      try {
        await voice.connectOutbound(numberToCall);
      } catch {
        setIsInCall(false);
        setActiveContact("");
        setActivePhone("");
      }
    },
    [phoneNumber, voice.connectOutbound],
  );

  const handleEndCall = useCallback(
    (_notes: string, _tags: string[]) => {
      voice.hangUp();
      setIsInCall(false);
      setMuted(false);
      setActiveContact("");
      setActivePhone("");
    },
    [voice.hangUp],
  );

  const handleAcceptIncoming = useCallback(() => {
    const c = voice.pendingIncoming;
    const from = c?.parameters?.From ?? "";
    const label = from.replace(/^client:/, "") || "Entrante";
    setActiveContact(label);
    setActivePhone(from || label);
    setIsInCall(true);
    setMuted(false);
    voice.acceptIncoming();
  }, [voice.pendingIncoming, voice.acceptIncoming]);

  const handleClearInput = () => {
    setPhoneNumber("");
  };

  if (isInCall) {
    return (
      <div className="size-full bg-background">
        <EnhancedActiveCall
          contact={activeContact}
          phone={activePhone}
          onEndCall={handleEndCall}
          twilioCall={voice.activeCall}
          twilioPhase={voice.callPhase}
          twilioError={voice.lastCallError || voice.deviceError}
          isMuted={muted}
          onMuteChange={(m) => {
            voice.setMuted(m);
            setMuted(m);
          }}
        />
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background relative">
      {voice.pendingIncoming ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <p className="text-sm font-medium">Llamada entrante</p>
            <p className="text-lg">{voice.pendingIncoming.parameters?.From ?? "—"}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => voice.rejectIncoming()}>
                Rechazar
              </Button>
              <Button onClick={handleAcceptIncoming}>Aceptar</Button>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="w-20 border-r flex flex-col items-center py-6 gap-6 bg-muted/30">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Phone className="h-5 w-5 text-primary-foreground" />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <Button
            variant={activeView === "dialpad" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView("dialpad")}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === "contacts" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView("contacts")}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === "history" ? "default" : "ghost"}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView("history")}
          >
            <History className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b flex items-center justify-between px-6 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">
              {activeView === "dialpad" && "Marcador"}
              {activeView === "contacts" && "Contactos"}
              {activeView === "history" && "Historial de Llamadas"}
            </h1>
            {voice.identity ? (
              <p className="text-xs text-muted-foreground truncate">Twilio: {voice.identity}</p>
            ) : null}
            {voice.deviceError ? (
              <p className="text-xs text-destructive truncate" title={voice.deviceError}>
                {voice.deviceError}
              </p>
            ) : null}
            {callsError ? (
              <p className="text-xs text-amber-700 truncate" title={callsError}>
                {callsError}
              </p>
            ) : null}
          </div>
          <div className="w-48 shrink-0">
            <StatusSelector status={userStatus} onStatusChange={setUserStatus} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeView === "dialpad" && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="w-full max-w-md p-6">
                <p className="text-xs text-muted-foreground mb-3">
                  Usa prefijo internacional (ej. +34912123456). Requiere TwiML App y variables Twilio en el API.
                </p>
                <div className="mb-6">
                  <div className="relative">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+34 …"
                      className="text-center text-xl h-14 pr-10"
                    />
                    {phoneNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={handleClearInput}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Dialpad value={phoneNumber} onChange={setPhoneNumber} />

                <div className="flex justify-center mt-6">
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16"
                    onClick={() => void handleCall()}
                    disabled={!phoneNumber.trim() || voice.devicePhase === "registering"}
                  >
                    <Phone className="h-6 w-6" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeView === "contacts" && (
            <div className="h-full">
              <ContactList onCall={(phone, name) => void handleCall(phone, name)} contacts={contactRows} />
            </div>
          )}

          {activeView === "history" && (
            <div className="h-full">
              <CallHistory onCall={(phone, name) => void handleCall(phone, name)} records={historyRecords} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
