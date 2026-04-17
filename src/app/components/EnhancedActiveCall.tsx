import { Phone, Mic, MicOff, Volume2, VolumeX, PhoneOff, Pause, Play, ArrowRightLeft, StickyNote } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CallNotes } from './CallNotes';
import { ScrollArea } from './ui/scroll-area';
import type { Call } from '@twilio/voice-sdk';

interface EnhancedActiveCallProps {
  contact: string;
  phone: string;
  onEndCall: (notes: string, tags: string[]) => void;
  /** Si existe, mute y colgar controlan la llamada WebRTC real. */
  twilioCall?: Call | null;
  callDirection?: "incoming" | "outgoing";
  /** Grabación en servidor Twilio (parámetro TwiML / mensaje SDK). */
  isRecording?: boolean;
}

export function EnhancedActiveCall({
  contact,
  phone,
  onEndCall,
  twilioCall,
  callDirection = "outgoing",
  isRecording = false,
}: EnhancedActiveCallProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (twilioCall) {
      try {
        setIsMuted(twilioCall.isMuted());
      } catch {
        setIsMuted(false);
      }
    }
  }, [twilioCall]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isOnHold) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isOnHold]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const toggleMute = () => {
    if (twilioCall) {
      const next = !twilioCall.isMuted();
      twilioCall.mute(next);
      setIsMuted(next);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const endCall = () => {
    try {
      twilioCall?.disconnect();
    } catch {
      /* ignore */
    }
    onEndCall(notes, tags);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Call Info */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-6 flex flex-col items-center border-b">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarFallback className="text-xl">{getInitials(contact)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-1">{contact}</h2>
          <p className="text-sm text-muted-foreground mb-2">{phone}</p>
          <div className="flex flex-wrap items-center gap-2">
            {isOnHold ? (
              <Badge variant="secondary">En espera</Badge>
            ) : (
              <Badge variant="default" className="bg-green-500">Activa</Badge>
            )}
            {isRecording ? (
              <Badge variant="destructive" className="gap-1 font-normal">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Grabando
              </Badge>
            ) : null}
            <span className="text-lg font-mono">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant={isMuted ? 'default' : 'outline'}
              className="h-14"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isMuted ? 'Activar mic' : 'Silenciar'}
            </Button>
            <Button
              variant={isOnHold ? 'default' : 'outline'}
              className="h-14"
              onClick={() => setIsOnHold(!isOnHold)}
              title={twilioCall ? 'Indicador local (hold en PSTN requiere conferencia en servidor)' : undefined}
            >
              {isOnHold ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
              {isOnHold ? 'Reanudar' : 'Espera'}
            </Button>
            <Button
              variant={isSpeaker ? 'default' : 'outline'}
              className="h-14"
              onClick={() => setIsSpeaker(!isSpeaker)}
            >
              {isSpeaker ? <Volume2 className="h-5 w-5 mr-2" /> : <VolumeX className="h-5 w-5 mr-2" />}
              Altavoz
            </Button>
            <Button
              variant="outline"
              className="h-14"
              type="button"
              disabled
              title="Transferencia en una siguiente fase (conferencia Twilio)"
            >
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              Transferir
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="lg"
            className="w-full h-14"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Colgar
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-6">
          <h3 className="text-sm font-medium mb-3">Acciones rápidas</h3>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('notes')}>
              <StickyNote className="h-4 w-4 mr-2" />
              Notas
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
            <TabsTrigger value="info" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Detalle
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Notas y etiquetas
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="info" className="p-6 mt-0">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium mb-3">Llamada</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dirección</span>
                      <span>{callDirection === "incoming" ? "Entrante" : "Saliente"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grabación</span>
                      <span>{isRecording ? "Servidor (Twilio)" : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inicio</span>
                      <span>{new Date().toLocaleTimeString('es-ES')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <span>{isOnHold ? 'En espera (local)' : 'En curso'}</span>
                    </div>
                    {twilioCall && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Twilio</span>
                        <span className="font-mono text-xs">{twilioCall.status()}</span>
                      </div>
                    )}
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
              <CallNotes
                notes={notes}
                onNotesChange={setNotes}
                tags={tags}
                onTagsChange={setTags}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
