import type { TranscriptionContentPayload } from "./stt/transcription-callback";

export type { TranscriptionContentPayload };

export interface ConversationSessionSink {
  handleTranscriptionEvent(payload: TranscriptionContentPayload): void;
}

const sessions = new Map<string, ConversationSessionSink>();
const pendingTranscriptions = new Map<string, TranscriptionContentPayload[]>();

export function registerConversationSession(callSid: string, session: ConversationSessionSink): void {
  sessions.set(callSid, session);
  const queued = pendingTranscriptions.get(callSid);
  if (queued?.length) {
    pendingTranscriptions.delete(callSid);
    for (const ev of queued) {
      session.handleTranscriptionEvent(ev);
    }
  }
}

export function unregisterConversationSession(callSid: string): void {
  sessions.delete(callSid);
  pendingTranscriptions.delete(callSid);
}

export function routeTranscriptionToSession(payload: TranscriptionContentPayload): void {
  const s = sessions.get(payload.callSid);
  if (s) {
    s.handleTranscriptionEvent(payload);
    return;
  }
  const arr = pendingTranscriptions.get(payload.callSid) ?? [];
  arr.push(payload);
  pendingTranscriptions.set(payload.callSid, arr);
}
