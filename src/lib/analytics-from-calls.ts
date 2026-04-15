import type { AgentRow, BackendCall } from "@/types/backend";
import { parseDuration } from "@/lib/call-mappers";

const LOST = new Set(["failed", "busy", "no-answer", "canceled", "cancelled"]);

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

function isCompleted(c: BackendCall) {
  return (c.status || "").toLowerCase() === "completed";
}

function isClassified(c: BackendCall) {
  return (c.handler || "").toLowerCase() === "ai" || Boolean(c.reason?.trim());
}

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function weekdayIdx(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function agentLabel(identity: string | null | undefined): string {
  if (!identity) return "Sin agente";
  const base = identity.replace(/_thinkia_com$/i, "").replace(/_/g, " ").trim();
  if (!base) return identity;
  return base
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const PALETTE = ["#3B6CFF", "#8544FF", "#90ABFF", "#C1A0FF", "#001963", "#5900FF", "#9ca3af"];

export type AnalyticsCharts = {
  weekDayCallsData: Array<{
    day: string;
    inbound: number;
    outbound: number;
    classified: number;
    lostPct: number;
    total: number;
  }>;
  dailyEvolutionData: Array<{ date: string; inbound: number; outbound: number; total: number }>;
  callsHistoryData: Array<{
    day: string;
    inbound: number;
    outbound: number;
    missed: number;
    total: number;
  }>;
  abandonRateAgentsData: Array<{ day: string; abandonPct: number; agents: number }>;
  realtimeMonitorData: Array<{ time: string; active: number; onHold: number; agents: number }>;
  agentPerformanceData: Array<{
    agent: string;
    total: number;
    answered: number;
    avgSpeed: string;
    resolution: number;
    trend: "up" | "down";
    sparkline: number[];
  }>;
  callsHandledByAgent: Array<{ name: string; total: number; answered: number; color: string }>;
  callsAbandonedByAgent: Array<{ name: string; value: number; percentage: number; color: string }>;
  hourlyDistributionData: Array<{
    hour: string;
    received: number;
    made: number;
    lost: number;
    agents: number;
  }>;
  occupancyBySlot: Array<{ slot: string; pct: number; color: string; critical?: boolean }>;
  slotDetailData: Array<{
    slot: string;
    received: number;
    made: number;
    agents: number;
    lost: string;
    status: string;
    statusColor: string;
    textColor: string;
  }>;
};

function fmtShortDate(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function sparkFromCounts(counts: number[]): number[] {
  if (counts.length === 0) return [0, 0, 0, 0, 0, 0];
  const max = Math.max(1, ...counts);
  return counts.map((n) => Math.round((n / max) * 100));
}

export function buildAnalyticsCharts(calls: BackendCall[], _agents: AgentRow[]): AnalyticsCharts {
  const weekInbound = DAY_LABELS.map(() => 0);
  const weekOutbound = DAY_LABELS.map(() => 0);
  const weekClassified = DAY_LABELS.map(() => 0);
  const weekLostInbound = DAY_LABELS.map(() => 0);
  const weekTotal = DAY_LABELS.map(() => 0);
  const historyMissed = DAY_LABELS.map(() => 0);

  const byDayKey = new Map<string, { inbound: number; outbound: number; lostIn: number; agents: Set<string> }>();
  const byHour = new Map<number, { received: number; made: number; lostIn: number; agents: Set<string> }>();
  const byAgent = new Map<
    string,
    { total: number; answered: number; lost: number; durSum: number; durN: number; byDay: number[] }
  >();

  for (const c of calls) {
    const iso = c.startTime;
    const d = iso ? new Date(iso) : null;
    const widx = d ? weekdayIdx(d) : null;
    const dayKey = d ? d.toISOString().slice(0, 10) : "";

    const inbound = isInbound(c);
    const outbound = isOutbound(c);
    const lost = isLost(c);
    const completed = isCompleted(c);
    const classified = isClassified(c);
    const agent = c.agentIdentity || "—";

    if (widx !== null) {
      if (inbound) weekInbound[widx]++;
      if (outbound) weekOutbound[widx]++;
      if (classified) weekClassified[widx]++;
      if (lost && inbound) {
        weekLostInbound[widx]++;
        historyMissed[widx]++;
      }
      weekTotal[widx]++;
    }

    if (dayKey) {
      if (!byDayKey.has(dayKey)) {
        byDayKey.set(dayKey, { inbound: 0, outbound: 0, lostIn: 0, agents: new Set() });
      }
      const row = byDayKey.get(dayKey)!;
      if (inbound) row.inbound++;
      if (outbound) row.outbound++;
      if (lost && inbound) row.lostIn++;
      if (c.agentIdentity) row.agents.add(c.agentIdentity);
    }

    const h = d ? d.getHours() : null;
    if (h !== null) {
      if (!byHour.has(h)) {
        byHour.set(h, { received: 0, made: 0, lostIn: 0, agents: new Set() });
      }
      const hr = byHour.get(h)!;
      if (inbound) hr.received++;
      if (outbound) hr.made++;
      if (lost && inbound) hr.lostIn++;
      if (c.agentIdentity) hr.agents.add(c.agentIdentity);
    }

    if (!byAgent.has(agent)) {
      byAgent.set(agent, { total: 0, answered: 0, lost: 0, durSum: 0, durN: 0, byDay: DAY_LABELS.map(() => 0) });
    }
    const ag = byAgent.get(agent)!;
    ag.total++;
    if (completed) ag.answered++;
    if (lost) ag.lost++;
    const dur = parseDuration(c);
    if (dur > 0) {
      ag.durSum += dur;
      ag.durN++;
    }
    if (widx !== null) ag.byDay[widx]++;
  }

  const weekDayCallsData = DAY_LABELS.map((day, i) => {
    const inbound = weekInbound[i];
    const outbound = weekOutbound[i];
    const classified = weekClassified[i];
    const total = weekTotal[i];
    const lostIn = weekLostInbound[i];
    const lostPct = total > 0 ? Math.round((lostIn / total) * 1000) / 10 : 0;
    return { day, inbound, outbound, classified, lostPct, total };
  });

  const callsHistoryData = DAY_LABELS.map((day, i) => ({
    day,
    inbound: weekInbound[i],
    outbound: weekOutbound[i],
    missed: historyMissed[i],
    total: weekTotal[i],
  }));

  const abandonRateAgentsData = DAY_LABELS.map((day, i) => {
    const total = weekTotal[i];
    const lostIn = weekLostInbound[i];
    const abandonPct = total > 0 ? Math.round((lostIn / total) * 1000) / 10 : 0;
    const agents = new Set<string>();
    for (const c of calls) {
      if (!c.startTime || !c.agentIdentity) continue;
      const di = weekdayIdx(new Date(c.startTime));
      if (di === i) agents.add(c.agentIdentity);
    }
    return { day, abandonPct, agents: agents.size || 1 };
  });

  const sortedKeys = [...byDayKey.keys()].sort();
  const lastKeys = sortedKeys.slice(-5);
  const dailyEvolutionData = lastKeys.map((k) => {
    const row = byDayKey.get(k)!;
    const dt = new Date(k + "T12:00:00");
    return {
      date: fmtShortDate(dt),
      inbound: row.inbound,
      outbound: row.outbound,
      total: row.inbound + row.outbound,
    };
  });

  const realtimeMonitorData: AnalyticsCharts["realtimeMonitorData"] = [];
  for (let h = 8; h <= 18; h++) {
    const row = byHour.get(h) || { received: 0, made: 0, lostIn: 0, agents: new Set<string>() };
    realtimeMonitorData.push({
      time: `${h}h`,
      active: row.received + row.made,
      onHold: row.lostIn,
      agents: row.agents.size || 0,
    });
  }

  const hourlyDistributionData: AnalyticsCharts["hourlyDistributionData"] = [];
  for (let h = 8; h <= 19; h++) {
    const row = byHour.get(h) || { received: 0, made: 0, lostIn: 0, agents: new Set<string>() };
    const denom = row.received + row.made || 1;
    const lost = Math.round((row.lostIn / denom) * 1000) / 10;
    hourlyDistributionData.push({
      hour: `${String(h).padStart(2, "0")}h`,
      received: row.received,
      made: row.made,
      lost,
      agents: row.agents.size || 0,
    });
  }

  const slots: Array<{ label: string; from: number; to: number; color: string; critical?: boolean }> = [
    { label: "08–10h", from: 8, to: 9, color: "#90ABFF" },
    { label: "10–12h", from: 10, to: 11, color: "#3B6CFF" },
    { label: "12–14h", from: 12, to: 13, color: "#90ABFF" },
    { label: "14–16h", from: 14, to: 15, color: "#001963", critical: true },
    { label: "16–18h", from: 16, to: 17, color: "#3B6CFF" },
    { label: "18–20h", from: 18, to: 19, color: "#90ABFF" },
  ];

  const occupancyBySlot = slots.map((s) => {
    let vol = 0;
    let lost = 0;
    for (let h = s.from; h <= s.to; h++) {
      const row = byHour.get(h);
      if (row) {
        vol += row.received + row.made;
        lost += row.lostIn;
      }
    }
    const pct = vol ? Math.min(99, 35 + Math.round((lost / Math.max(1, vol)) * 200)) : 20;
    return { slot: s.label, pct, color: s.color, critical: s.critical };
  });

  const slotDetailData: AnalyticsCharts["slotDetailData"] = [];
  for (let h = 8; h <= 19; h++) {
    const row = byHour.get(h) || { received: 0, made: 0, lostIn: 0, agents: new Set<string>() };
    const denom = row.received + row.made || 1;
    const lostPct = (row.lostIn / denom) * 100;
    const lostStr = `${Math.round(lostPct * 10) / 10}%`;
    let status = "OK";
    let statusColor = "#dcfce7";
    let textColor = "#15803d";
    if (lostPct >= 12) {
      status = "Critico";
      statusColor = "#fee2e2";
      textColor = "#b91c1c";
    } else if (lostPct >= 6) {
      status = "Alerta";
      statusColor = "#fef3c7";
      textColor = "#92400e";
    }
    slotDetailData.push({
      slot: `${String(h).padStart(2, "0")}–${String(h + 1).padStart(2, "0")}h`,
      received: row.received,
      made: row.made,
      agents: row.agents.size || 0,
      lost: lostStr,
      status,
      statusColor,
      textColor,
    });
  }

  const agentEntries = [...byAgent.entries()].filter(([k]) => k !== "—").sort((a, b) => b[1].total - a[1].total);
  const topAgents = agentEntries.slice(0, 12);

  const callsHandledByAgent = topAgents.map(([id, v], i) => ({
    name: agentLabel(id),
    total: v.total,
    answered: v.answered,
    color: PALETTE[i % PALETTE.length],
  }));

  const abandonAgents = [...byAgent.entries()]
    .filter(([k]) => k !== "—")
    .map(([id, v]) => ({ id, lost: v.lost }))
    .filter((x) => x.lost > 0)
    .sort((a, b) => b.lost - a.lost)
    .slice(0, 7);
  const sumLost = abandonAgents.reduce((s, x) => s + x.lost, 0) || 1;
  const callsAbandonedByAgent = abandonAgents.map((x, i) => ({
    name: agentLabel(x.id),
    value: x.lost,
    percentage: Math.round((x.lost / sumLost) * 100),
    color: PALETTE[i % PALETTE.length],
  }));

  const agentPerformanceData: AnalyticsCharts["agentPerformanceData"] = topAgents.slice(0, 8).map(([id, v]) => {
    const avgSec = v.durN ? Math.round(v.durSum / v.durN) : 0;
    const avgSpeed = `${avgSec}s`;
    const resolution = v.total ? Math.round((v.answered / v.total) * 1000) / 10 : 0;
    const sparkline = sparkFromCounts(v.byDay);
    const trend: "up" | "down" = resolution >= 70 ? "up" : "down";
    return {
      agent: agentLabel(id),
      total: v.total,
      answered: v.answered,
      avgSpeed,
      resolution,
      trend,
      sparkline,
    };
  });

  return {
    weekDayCallsData,
    dailyEvolutionData: dailyEvolutionData.length
      ? dailyEvolutionData
      : [{ date: "—", inbound: 0, outbound: 0, total: 0 }],
    callsHistoryData,
    abandonRateAgentsData,
    realtimeMonitorData,
    agentPerformanceData:
      agentPerformanceData.length > 0
        ? agentPerformanceData
        : [{ agent: "Sin datos", total: 0, answered: 0, avgSpeed: "0s", resolution: 0, trend: "down" as const, sparkline: [0, 0, 0, 0, 0, 0] }],
    callsHandledByAgent: callsHandledByAgent.length
      ? callsHandledByAgent
      : [{ name: "Sin datos", total: 0, answered: 0, color: PALETTE[0] }],
    callsAbandonedByAgent: callsAbandonedByAgent.length
      ? callsAbandonedByAgent
      : [{ name: "Sin datos", value: 0, percentage: 100, color: "#9ca3af" }],
    hourlyDistributionData,
    occupancyBySlot,
    slotDetailData,
  };
}
