import {
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Pause,
  Play,
  ArrowRightLeft,
  StickyNote,
} from "lucide-react";
import type { Call } from "@twilio/voice-sdk";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CallNotes } from "./CallNotes";
import { ScrollArea } from "./ui/scroll-area";
import type { TwilioCallPhase } from "@/hooks/useTwilioVoice";

interface EnhancedActiveCallProps {
  contact: string;
  phone: string;
  onEndCall: (notes: string, tags: string[]) => void;
  /** Llamada WebRTC de Twilio Client (si existe, mute/cuelgue son reales). */
  twilioCall?: Call | null;
  twilioPhase?: TwilioCallPhase;
  twilioError?: string | null;
  isMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}

export function EnhancedActiveCall({
  contact,
  phone,
  onEndCall,
  twilioCall,
  twilioPhase = "open",
  twilioError,
  isMuted = false,
  onMuteChange,
}: EnhancedActiveCallProps) {
  const [duration, setDuration] = useState(0);
  const [localMuted, setLocalMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);

  const muted = twilioCall ? isMuted : localMuted;
  const setMuted = (v: boolean) => {
    if (twilioCall && onMuteChange) onMuteChange(v);
    else setLocalMuted(v);
  };

  useEffect(() => {
    if (!twilioCall) {
      setAnsweredAt(null);
      return;
    }
    const onAccept = () => setAnsweredAt(Date.now());
    twilioCall.on("accept", onAccept);
    try {
      if (twilioCall.status() === "open") setAnsweredAt(Date.now());
    } catch {
      /* ignore */
    }
    return () => {
      twilioCall.off("accept", onAccept);
    };
  }, [twilioCall]);

  useEffect(() => {
    if (twilioPhase === "open" && twilioCall && !answeredAt) {
      setAnsweredAt(Date.now());
    }
  }, [twilioCall, twilioPhase, answeredAt]);

  useEffect(() => {
    if (twilioCall) {
      if (!answeredAt) {
        setDuration(0);
        return;
      }
      if (isOnHold) return;
      const i = setInterval(() => {
        setDuration(Math.floor((Date.now() - answeredAt) / 1000));
      }, 1000);
      return () => clearInterval(i);
    }
    if (isOnHold) return;
    const i = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(i);
  }, [twilioCall, answeredAt, isOnHold]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const statusLabel = () => {
    if (twilioError) return "Error";
    if (twilioPhase === "connecting") return "Conectando…";
    if (twilioPhase === "ringing") return "Timbre";
    if (twilioPhase === "error") return "Error";
    if (isOnHold) return "En espera";
    return twilioCall ? "En curso" : "Activa";
  };

  const directionLabel = twilioCall ? "Saliente (Twilio Client)" : "Saliente";

  return (
    <div className="flex h-full">
      <div className="w-96 border-r flex flex-col">
        <div className="p-6 flex flex-col items-center border-b">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarFallback className="text-xl">{getInitials(contact)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-1">{contact}</h2>
          <p className="text-sm text-muted-foreground mb-2">{phone}</p>
          {twilioError ? (
            <p className="text-xs text-destructive text-center mb-2">{twilioError}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <Badge variant={twilioPhase === "open" || !twilioCall ? "default" : "secondary"} className="bg-green-500">
              {statusLabel()}
            </Badge>
            <span className="text-lg font-mono">{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant={muted ? "default" : "outline"}
              className="h-14"
              onClick={() => setMuted(!muted)}
              disabled={twilioCall ? twilioPhase !== "open" && twilioPhase !== "ringing" : false}
              title={twilioCall ? undefined : "Sin Twilio: solo estado local"}
            >
              {muted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {muted ? "Activar mic" : "Silenciar"}
            </Button>
            <Button
              variant={isOnHold ? "default" : "outline"}
              className="h-14"
              title="La retención real requiere Conferencia Twilio; aquí solo pausa el cronómetro."
              onClick={() => setIsOnHold(!isOnHold)}
            >
              {isOnHold ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
              {isOnHold ? "Reanudar" : "Espera"}
            </Button>
            <Button variant={isSpeaker ? "default" : "outline"} className="h-14" onClick={() => setIsSpeaker(!isSpeaker)}>
              {isSpeaker ? <Volume2 className="h-5 w-5 mr-2" /> : <VolumeX className="h-5 w-5 mr-2" />}
              Altavoz
            </Button>
            <Button variant="outline" className="h-14" disabled title="Transferencia no configurada en esta vista.">
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              Transferir
            </Button>
          </div>

          <Button
            variant="destructive"
            size="lg"
            className="w-full h-14"
            onClick={() => onEndCall(notes, tags)}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Colgar
          </Button>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium mb-3">Acciones</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("notes")}>
              <StickyNote className="h-4 w-4 mr-2" />
              Notas
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Información
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Notas y etiquetas
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="info" className="p-6 mt-0">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Detalle de llamada</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dirección</span>
                      <span>{directionLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <span>{statusLabel()}</span>
                    </div>
                    {twilioCall?.sid ? (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Call SID</span>
                        <span className="truncate font-mono text-xs">{twilioCall.sid}</span>
                      </div>
                    ) : null}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Contacto</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre</span>
                      <span>{contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono</span>
                      <span>{phone}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-6 mt-0">
              <CallNotes notes={notes} onNotesChange={setNotes} tags={tags} onTagsChange={setTags} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
