import { promises as fs } from 'fs';
import path from 'path';

export type RoutingEvent = {
  id: string;
  createdAt: string;
  callSid: string;
  from: string;
  to: string;
  selectedAgent: string | null;
  fallbackUsed: 'none' | 'ai' | 'voicemail';
  steps: Array<{
    agentIdentity: string;
    available: boolean;
    skippedByBusy: boolean;
    routed: boolean;
    reason: string;
  }>;
};

const STORE_PATH = path.join(process.cwd(), 'data', 'routing-events.json');

async function readEvents(): Promise<RoutingEvent[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as RoutingEvent[];
  } catch {
    return [];
  }
}

async function writeEvents(events: RoutingEvent[]) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(events, null, 2), 'utf8');
}

export async function addRoutingEvent(event: RoutingEvent) {
  const current = await readEvents();
  const next = [event, ...current].slice(0, 80);
  await writeEvents(next);
}

export async function listRoutingEvents(limit = 20) {
  const events = await readEvents();
  return events.slice(0, Math.max(1, Math.min(100, limit)));
}

