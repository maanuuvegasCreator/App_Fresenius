/** Respuesta de GET /api/calls (Twilio + ElevenLabs + metadatos Supabase). */
export type BackendCall = {
  sid: string;
  from: string | null;
  to: string | null;
  status: string | null;
  startTime: string | null;
  duration: string | null;
  direction: string | null;
  recordingUrl?: string | null;
  recordingSid?: string | null;
  handler?: string | null;
  reason?: string | null;
  agentIdentity?: string | null;
};

export type AgentRow = {
  identity: string;
  is_available?: boolean | null;
  offline_message?: string | null;
  updated_at?: string | null;
  blocked_periods?: unknown;
};

export type TwilioNumber = {
  sid: string;
  name: string;
  number: string;
  countryCode: string | null;
  voiceUrl: string | null;
  smsUrl: string | null;
  updatedAt: string | null;
};
