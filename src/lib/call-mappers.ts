import type { AgentRow, BackendCall } from "@/types/backend";
import type { Team, TeamMember } from "@/types/teams-ui";

const LOST = new Set(["failed", "busy", "no-answer", "canceled", "cancelled"]);

export function fmtDurationSec(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseDuration(c: BackendCall): number {
  const n = Number(c.duration || 0);
  return Number.isFinite(n) ? n : 0;
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const diffSec = Math.floor((Date.now() - t) / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  if (diffSec < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  const diffDay = Math.floor(diffHr / 24);
  return rtf.format(-diffDay, "day");
}

export function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLost(c: BackendCall) {
  const s = (c.status || "").toLowerCase();
  if (LOST.has(s)) return true;
  if ((c.handler || "").toLowerCase() === "blocked") return true;
  return false;
}

function isInbound(c: BackendCall) {
  return (c.direction || "").toLowerCase() === "inbound";
}

function isOutbound(c: BackendCall) {
  return (c.direction || "").toLowerCase() === "outbound";
}

/** Número “externo” para mostrar en listas. */
export function displayNumber(c: BackendCall): string {
  if (isInbound(c)) return c.from || "—";
  if (isOutbound(c)) return c.to || "—";
  return c.from || c.to || "—";
}

export function displayContactLabel(c: BackendCall): string {
  const num = displayNumber(c);
  if (c.handler === "ai") return `IA · ${num}`;
  return num;
}

/** Registro Centro de llamadas (UI actual). */
export type CallCenterRecord = {
  id: string;
  type: "inbound" | "outbound" | "missed";
  number: string;
  contact: string;
  createdBy: string;
  time: string;
  duration: string;
  status: "closed" | "owned" | "pending";
  date: string;
  hasNote: boolean;
  reason?: string | null;
};

export function mapToCallCenterRecords(calls: BackendCall[]): CallCenterRecord[] {
  return calls.map((c) => {
    const dur = parseDuration(c);
    const completed = (c.status || "").toLowerCase() === "completed";
    const missed = isLost(c) && isInbound(c);
    const type: CallCenterRecord["type"] = missed ? "missed" : isOutbound(c) ? "outbound" : "inbound";
    const status: CallCenterRecord["status"] = completed ? "closed" : "pending";
    return {
      id: c.sid,
      type,
      number: displayNumber(c),
      contact: displayContactLabel(c),
      createdBy: c.agentIdentity ? String(c.agentIdentity).replace(/_/g, " ") : (c.handler || "human"),
      time: fmtTime(c.startTime),
      duration: fmtDurationSec(dur),
      status,
      date: c.startTime ? new Date(c.startTime).toLocaleDateString("es-ES") : "—",
      hasNote: Boolean(c.reason?.trim()),
      reason: c.reason,
    };
  });
}

/** Historial (página CallHistory.tsx). */
export type HistoryCall = {
  id: string;
  contact: string;
  phone: string;
  type: "missed" | "incoming" | "outgoing";
  status: "missed" | "callback" | "followup" | "closed";
  duration: string;
  timestamp: string;
  description: string;
  tags: string[];
  hasRecording: boolean;
  summary?: string;
  notes?: string;
};

export function mapToHistoryCalls(calls: BackendCall[]): HistoryCall[] {
  return calls.map((c) => {
    const dur = parseDuration(c);
    const completed = (c.status || "").toLowerCase() === "completed";
    const lost = isLost(c);
    const incoming = isInbound(c);
    const type: HistoryCall["type"] = lost && incoming ? "missed" : incoming ? "incoming" : "outgoing";
    let status: HistoryCall["status"] = "closed";
    if (lost) status = "missed";
    else if (!completed) status = "followup";
    return {
      id: c.sid,
      contact: displayContactLabel(c),
      phone: displayNumber(c),
      type,
      status,
      duration: fmtDurationSec(dur),
      timestamp: fmtRelative(c.startTime),
      description: c.reason || "",
      tags: c.handler === "ai" ? ["IA"] : [],
      hasRecording: Boolean(c.recordingUrl || c.recordingSid),
      summary: c.reason || undefined,
      notes: c.reason || undefined,
    };
  });
}

export type SimpleContact = {
  id: string;
  name: string;
  company: string;
  mainNumber: string;
  otherNumbers: string[];
  emails: string[];
  integrations: Array<{ name: string; icon: string }>;
  lastContact?: string;
};

export function buildContactsFromCalls(calls: BackendCall[]): SimpleContact[] {
  const byPhone = new Map<string, { last: string; count: number }>();
  for (const c of calls) {
    const phone = displayNumber(c);
    if (!phone || phone === "—") continue;
    const prev = byPhone.get(phone);
    const iso = c.startTime || "";
    if (!prev || (iso && (!prev.last || new Date(iso) > new Date(prev.last)))) {
      byPhone.set(phone, { last: iso || prev?.last || "", count: (prev?.count || 0) + 1 });
    } else {
      byPhone.set(phone, { ...prev, count: prev.count + 1 });
    }
  }
  return Array.from(byPhone.entries()).map(([mainNumber, meta]) => ({
    id: mainNumber.replace(/\W/g, "") || mainNumber,
    name: mainNumber,
    company: "—",
    mainNumber,
    otherNumbers: [],
    emails: [],
    integrations: [] as SimpleContact["integrations"],
    lastContact: meta.last ? fmtRelative(meta.last) : undefined,
  }));
}

function parsePresence(raw: string | null | undefined): string {
  if (!raw?.startsWith("{")) return raw || "";
  try {
    const p = JSON.parse(raw) as { __presence?: string };
    return p.__presence || "";
  } catch {
    return "";
  }
}

export function mapAgentsToTeammates(agents: AgentRow[]): SimpleContact[] {
  return agents.map((a) => {
    const email = identityToEmail(a.identity);
    return {
      id: a.identity,
      name: identityDisplayName(a.identity),
      company: "Thinkia",
      mainNumber: "—",
      otherNumbers: [],
      emails: [email],
      integrations: [{ name: "Directorio", icon: "📇" }],
      lastContact: a.updated_at ? fmtRelative(a.updated_at) : undefined,
    };
  });
}

function identityDisplayName(identity: string): string {
  const base = identity.replace(/_thinkia_com$/i, "").replace(/_/g, " ").trim();
  if (!base) return identity;
  return base
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function identityToEmail(identity: string): string {
  const base = identity.replace(/_thinkia_com$/i, "");
  const parts = base.split("_").filter(Boolean);
  if (parts.length < 2) return `${identity}@thinkia.com`;
  const [first, ...rest] = parts;
  return `${first}.${rest.join(".")}@thinkia.com`.toLowerCase();
}

export function deriveTeam(identity: string): string {
  const parts = identity.replace(/_thinkia_com$/i, "").split("_").filter(Boolean);
  if (parts.length >= 2) return parts.slice(1).join(" ");
  return "General";
}

function deriveRole(identity: string): TeamMember["role"] {
  const d = deriveTeam(identity).toLowerCase();
  if (d.includes("admin")) return "administrador";
  if (d.includes("ventas") || d.includes("tech")) return "supervisor";
  return "agente";
}

export function mapAgentsToTeams(agents: AgentRow[], numbers: string[]): Team[] {
  const byTeam = new Map<string, AgentRow[]>();
  for (const a of agents) {
    const t = deriveTeam(a.identity);
    if (!byTeam.has(t)) byTeam.set(t, []);
    byTeam.get(t)!.push(a);
  }
  const teams: Team[] = [];
  let idx = 0;
  for (const [name, members] of byTeam) {
    const teamIdx = idx;
    teams.push({
      id: `team-${idx++}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description: `Equipo ${name}`,
      assignedNumbers: teamIdx === 0 ? numbers : [],
      members: members.map((m) => {
        const presence = parsePresence(m.offline_message ?? undefined);
        const avail: TeamMember["availability"] =
          m.is_available === false ? "unavailable" : presence === "dnd" || presence === "busy" ? "auto" : "accept";
        return {
          id: m.identity,
          name: identityDisplayName(m.identity),
          email: identityToEmail(m.identity),
          role: deriveRole(m.identity),
          availability: avail,
          lastUpdated: m.updated_at ? fmtRelative(m.updated_at) : undefined,
        };
      }),
    });
  }
  if (teams.length === 0) {
    teams.push({
      id: "empty",
      name: "Sin agentes",
      description: "No hay filas en agent_settings o error de API",
      members: [],
      assignedNumbers: numbers,
    });
  }
  return teams;
}
