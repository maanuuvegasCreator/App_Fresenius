import { useEffect, useMemo, useState } from 'react';
import { Phone, Users, History, X, BarChart3 } from 'lucide-react';
import type { Call } from '@twilio/voice-sdk';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialpad } from '../components/Dialpad';
import { EnhancedActiveCall } from '../components/EnhancedActiveCall';
import { ContactList } from '../components/ContactList';
import { CallHistory } from '../components/CallHistory';
import { StatusSelector } from '../components/StatusSelector';
import { fetchCalls } from '@/lib/api-client';
import { DEMO_BACKEND_CALLS } from '@/lib/demo-backend-calls';
import { buildContactsFromCalls, mapToHistoryCalls } from '@/lib/call-mappers';
import type { BackendCall } from '@/types/backend';
import { useTwilioVoice } from '@/hooks/useTwilioVoice';
import { toE164 } from '@/lib/phone-e164';

const USE_LIVE_CALLS = import.meta.env.VITE_USE_LIVE_CALLS === 'true';

type DashboardContact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
};

type DashboardHistoryRow = {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  timestamp: string;
  tags: string[];
  notes?: string;
};

type UiStatus = 'available' | 'unavailable' | 'do-not-disturb' | 'be-right-back' | 'appear-away';

function rowsFromCalls(calls: BackendCall[]): DashboardHistoryRow[] {
  return mapToHistoryCalls(calls).map((h) => ({
    id: h.id,
    contact: h.contact,
    phone: h.phone,
    type: h.type,
    duration: h.duration,
    timestamp: h.timestamp,
    tags: h.tags,
    notes: h.notes || h.description || undefined,
  }));
}

function contactsFromApi(calls: BackendCall[]): DashboardContact[] {
  return buildContactsFromCalls(calls).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.mainNumber,
    email: c.emails[0],
    company: c.company === '—' ? undefined : c.company,
    tags: c.lastContact ? [c.lastContact] : [],
  }));
}

export function Dashboard() {
  const voice = useTwilioVoice();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [activeContact, setActiveContact] = useState('');
  const [activePhone, setActivePhone] = useState('');
  const [activeView, setActiveView] = useState<'dialpad' | 'contacts' | 'history'>('dialpad');
  const [userStatus, setUserStatus] = useState<UiStatus>('available');
  const [rawCalls, setRawCalls] = useState<BackendCall[]>(() =>
    USE_LIVE_CALLS ? [] : DEMO_BACKEND_CALLS
  );
  const [twilioCall, setTwilioCall] = useState<Call | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [dialError, setDialError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!USE_LIVE_CALLS) {
        if (!cancelled) setRawCalls(DEMO_BACKEND_CALLS);
        return;
      }
      try {
        const c = await fetchCalls(300);
        if (!cancelled) setRawCalls(c);
      } catch {
        if (!cancelled) setRawCalls([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!twilioCall) return;
    const onDisconnect = () => {
      setTwilioCall(null);
      setIsInCall(false);
      setActiveContact('');
      setActivePhone('');
    };
    twilioCall.on('disconnect', onDisconnect);
    return () => {
      twilioCall.off('disconnect', onDisconnect);
    };
  }, [twilioCall]);

  const historyRows = useMemo(() => rowsFromCalls(rawCalls), [rawCalls]);
  const contactRows = useMemo(() => contactsFromApi(rawCalls), [rawCalls]);

  const handleCall = async (number?: string, name?: string) => {
    const raw = (number ?? phoneNumber).trim();
    if (!raw) return;
    setDialError(null);
    setConnecting(true);
    try {
      const e164 = toE164(raw);
      const call = await voice.connect(e164);
      setTwilioCall(call);
      setActiveContact(name || raw);
      setActivePhone(e164);
      setIsInCall(true);
      setPhoneNumber('');
    } catch (e) {
      setDialError(e instanceof Error ? e.message : 'No se pudo iniciar la llamada');
    } finally {
      setConnecting(false);
    }
  };

  const handleEndCall = (_notes: string, _tags: string[]) => {
    try {
      twilioCall?.disconnect();
    } catch {
      /* ignore */
    }
    setTwilioCall(null);
    setIsInCall(false);
    setActiveContact('');
    setActivePhone('');
  };

  const handleClearInput = () => {
    setPhoneNumber('');
  };

  if (isInCall) {
    return (
      <div className="size-full bg-background">
        <EnhancedActiveCall
          contact={activeContact}
          phone={activePhone}
          twilioCall={twilioCall}
          onEndCall={handleEndCall}
        />
      </div>
    );
  }

  return (
    <div className="relative size-full flex bg-background">
      {voice.incoming ? (
        <div className="absolute inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Llamada entrante</p>
              <p className="text-xs text-muted-foreground">Twilio Voice</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => voice.rejectIncoming()}>
                Rechazar
              </Button>
              <Button
                onClick={() => {
                  const c = voice.acceptIncoming();
                  if (!c) return;
                  setTwilioCall(c);
                  setIsInCall(true);
                  setActiveContact('Entrante');
                  setActivePhone(c.parameters?.From || '');
                }}
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Sidebar */}
      <div className="w-20 border-r flex flex-col items-center py-6 gap-6 bg-muted/30">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Phone className="h-5 w-5 text-primary-foreground" />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <Button
            variant={activeView === 'dialpad' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('dialpad')}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === 'contacts' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('contacts')}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === 'history' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('history')}
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">
              {activeView === 'dialpad' && 'Marcador'}
              {activeView === 'contacts' && 'Contactos'}
              {activeView === 'history' && 'Historial de Llamadas'}
            </h1>
            {voice.identity ? (
              <p className="text-xs text-muted-foreground">
                Agente Twilio: <span className="font-mono">{voice.identity}</span>
                {voice.ready ? ' · Registrado' : ' · Registrando…'}
              </p>
            ) : null}
          </div>
          <div className="w-48">
            <StatusSelector status={userStatus} onStatusChange={setUserStatus} />
          </div>
        </div>

        {voice.error ? (
          <div className="border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-sm text-destructive">
            Voz: {voice.error}
          </div>
        ) : null}
        {dialError ? (
          <div className="border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-sm text-destructive">
            {dialError}
          </div>
        ) : null}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'dialpad' && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="w-full max-w-md p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ingresa número de teléfono"
                      className="text-center text-xl h-14 pr-10"
                      readOnly
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
                    disabled={!phoneNumber || connecting || !voice.ready}
                    title={!voice.ready ? 'Esperando registro de Twilio Voice…' : undefined}
                  >
                    <Phone className="h-6 w-6" />
                  </Button>
                </div>
                {!voice.ready && !voice.error ? (
                  <p className="mt-3 text-center text-xs text-muted-foreground">Conectando con Twilio…</p>
                ) : null}
              </Card>
            </div>
          )}

          {activeView === 'contacts' && (
            <div className="h-full">
              <ContactList onCall={(n, name) => void handleCall(n, name)} contacts={contactRows} />
            </div>
          )}

          {activeView === 'history' && (
            <div className="h-full">
              <CallHistory onCall={(n, name) => void handleCall(n, name)} records={historyRows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
