import { useEffect, useMemo, useState } from 'react';
import { fetchAgents, fetchCalls } from '@/lib/api-client';
import { buildAnalyticsCharts } from '@/lib/analytics-from-calls';
import type { AgentRow, BackendCall } from '@/types/backend';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  LabelList,
  Cell
} from 'recharts';

type ViewType = 'supervisor' | 'agent';
type SubTab = 'global' | 'inbound' | 'outbound';

// Colores exactos del HTML original
const B4 = '#3B6CFF';  // Blue 4
const B2 = '#90ABFF';  // Blue 2
const V4 = '#8544FF';  // Violet 4
const V2 = '#C1A0FF';  // Violet 2
const V = '#5900FF';   // Violet
const B6 = '#001963';  // Blue 6
const OR = '#ea580c';  // Orange
const GR = '#16a34a';  // Green
const RD = '#dc2626';  // Red

// Data exacta del HTML
const FALLBACK_weekDayCallsData = [
  { day: 'Lun', inbound: 180, outbound: 60, classified: 20, lostPct: 3.1, total: 260 },
  { day: 'Mar', inbound: 240, outbound: 80, classified: 30, lostPct: 4.2, total: 350 },
  { day: 'Mie', inbound: 230, outbound: 70, classified: 25, lostPct: 5.8, total: 325 },
  { day: 'Jue', inbound: 220, outbound: 75, classified: 28, lostPct: 4.9, total: 323 },
  { day: 'Vie', inbound: 200, outbound: 65, classified: 22, lostPct: 5.2, total: 287 },
  { day: 'Sab', inbound: 80, outbound: 30, classified: 12, lostPct: 2.1, total: 122 },
  { day: 'Dom', inbound: 60, outbound: 20, classified: 8, lostPct: 1.4, total: 88 },
];

const FALLBACK_dailyEvolutionData = [
  { date: 'Mar 9', inbound: 1304, outbound: 400, total: 1704 },
  { date: 'Mar 10', inbound: 1942, outbound: 600, total: 2542 },
  { date: 'Mar 11', inbound: 1524, outbound: 480, total: 2004 },
  { date: 'Mar 12', inbound: 1663, outbound: 520, total: 2183 },
  { date: 'Mar 13', inbound: 768, outbound: 240, total: 1008 },
];

const FALLBACK_callsHistoryData = [
  { day: 'Lun', inbound: 283, outbound: 98, missed: 28, total: 409 },
  { day: 'Mar', inbound: 312, outbound: 112, missed: 22, total: 446 },
  { day: 'Mie', inbound: 298, outbound: 104, missed: 31, total: 433 },
  { day: 'Jue', inbound: 271, outbound: 95, missed: 19, total: 385 },
  { day: 'Vie', inbound: 265, outbound: 90, missed: 24, total: 379 },
  { day: 'Sab', inbound: 75, outbound: 28, missed: 8, total: 111 },
  { day: 'Dom', inbound: 42, outbound: 15, missed: 5, total: 62 },
];

const FALLBACK_abandonRateAgentsData = [
  { day: 'Lun', abandonPct: 5.2, agents: 18 },
  { day: 'Mar', abandonPct: 4.8, agents: 22 },
  { day: 'Mie', abandonPct: 6.1, agents: 20 },
  { day: 'Jue', abandonPct: 5.4, agents: 24 },
  { day: 'Vie', abandonPct: 5.9, agents: 19 },
  { day: 'Sab', abandonPct: 3.2, agents: 8 },
  { day: 'Dom', abandonPct: 2.1, agents: 4 },
];

const FALLBACK_realtimeMonitorData = [
  { time: '8h', active: 22, onHold: 4, agents: 12 },
  { time: '9h', active: 35, onHold: 8, agents: 10 },
  { time: '10h', active: 42, onHold: 11, agents: 9 },
  { time: '11h', active: 38, onHold: 9, agents: 8 },
  { time: '12h', active: 28, onHold: 5, agents: 10 },
  { time: '13h', active: 24, onHold: 4, agents: 11 },
  { time: '14h', active: 45, onHold: 14, agents: 7 },
  { time: '15h', active: 41, onHold: 12, agents: 6 },
  { time: '16h', active: 32, onHold: 7, agents: 9 },
  { time: '17h', active: 27, onHold: 6, agents: 10 },
  { time: '18h', active: 18, onHold: 3, agents: 12 },
];

const FALLBACK_agentPerformanceData = [
  { agent: 'Agente 1', total: 40, answered: 30, avgSpeed: '87.1s', resolution: 87.1, trend: 'up', sparkline: [70,74,78,80,84,87] },
  { agent: 'Agente 2', total: 41, answered: 38, avgSpeed: '68s', resolution: 79.5, trend: 'down', sparkline: [88,85,83,81,80,79] },
  { agent: 'Agente 3', total: 51, answered: 45, avgSpeed: '80.1s', resolution: 71.0, trend: 'down', sparkline: [80,77,74,72,71,71] },
  { agent: 'Agente 4', total: 46, answered: 36, avgSpeed: '61.5s', resolution: 71.2, trend: 'down', sparkline: [78,75,73,72,71,71] },
  { agent: 'Agente 5', total: 50, answered: 30, avgSpeed: '62.6s', resolution: 91.6, trend: 'up', sparkline: [80,83,86,88,90,91] },
];

const FALLBACK_callsHandledByAgent = [
  { name: 'Agente 1', total: 148, answered: 118, color: B4 },
  { name: 'Agente 2', total: 162, answered: 134, color: B4 },
  { name: 'Agente 3', total: 105, answered: 82, color: V4 },
  { name: 'Agente 4', total: 89, answered: 68, color: V4 },
  { name: 'Agente 5', total: 134, answered: 112, color: B4 },
  { name: 'Agente 6', total: 97, answered: 74, color: V4 },
  { name: 'Agente 7', total: 72, answered: 55, color: B2 },
];

const FALLBACK_callsAbandonedByAgent = [
  { name: 'Agente 1', value: 32, percentage: 25, color: B6 },
  { name: 'Agente 2', value: 25, percentage: 20, color: B4 },
  { name: 'Agente 3', value: 22, percentage: 17, color: V4 },
  { name: 'Agente 4', value: 21, percentage: 17, color: V },
  { name: 'Agente 5', value: 18, percentage: 14, color: B2 },
  { name: 'Agente 6', value: 10, percentage: 8, color: V2 },
  { name: 'Agente 7', value: 8, percentage: 6, color: '#9ca3af' },
];

const FALLBACK_hourlyDistributionData = [
  { hour: '08h', received: 112, made: 48, lost: 4.2, agents: 12 },
  { hour: '09h', received: 198, made: 67, lost: 6.1, agents: 11 },
  { hour: '10h', received: 321, made: 89, lost: 9.3, agents: 10 },
  { hour: '11h', received: 287, made: 74, lost: 8.7, agents: 9 },
  { hour: '12h', received: 243, made: 61, lost: 5.8, agents: 11 },
  { hour: '13h', received: 189, made: 52, lost: 4.9, agents: 10 },
  { hour: '14h', received: 378, made: 91, lost: 14.2, agents: 7 },
  { hour: '15h', received: 355, made: 87, lost: 12.8, agents: 6 },
  { hour: '16h', received: 298, made: 76, lost: 7.4, agents: 9 },
  { hour: '17h', received: 267, made: 69, lost: 6.9, agents: 10 },
  { hour: '18h', received: 156, made: 43, lost: 3.8, agents: 11 },
  { hour: '19h', received: 98, made: 31, lost: 2.1, agents: 12 },
];

const FALLBACK_occupancyBySlot = [
  { slot: '08–10h', pct: 55, color: B2 },
  { slot: '10–12h', pct: 84, color: B4 },
  { slot: '12–14h', pct: 61, color: B2 },
  { slot: '14–16h', pct: 91, color: B6, critical: true },
  { slot: '16–18h', pct: 78, color: B4 },
  { slot: '18–20h', pct: 44, color: B2 },
];

const FALLBACK_slotDetailData = [
  { slot: '08–09h', received: 112, made: 48, agents: 12, lost: '4.2%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
  { slot: '09–10h', received: 198, made: 67, agents: 11, lost: '6.1%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
  { slot: '10–11h', received: 321, made: 89, agents: 10, lost: '9.3%', status: 'Alerta', statusColor: '#fef3c7', textColor: '#92400e' },
  { slot: '11–12h', received: 287, made: 74, agents: 9, lost: '8.7%', status: 'Alerta', statusColor: '#fef3c7', textColor: '#92400e' },
  { slot: '12–13h', received: 243, made: 61, agents: 11, lost: '5.8%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
  { slot: '13–14h', received: 189, made: 52, agents: 10, lost: '4.9%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
  { slot: '14–15h', received: 378, made: 91, agents: 7, lost: '14.2%', status: 'Critico', statusColor: '#fee2e2', textColor: '#b91c1c' },
  { slot: '15–16h', received: 355, made: 87, agents: 6, lost: '12.8%', status: 'Critico', statusColor: '#fee2e2', textColor: '#b91c1c' },
  { slot: '16–17h', received: 298, made: 76, agents: 9, lost: '7.4%', status: 'Alerta', statusColor: '#fef3c7', textColor: '#92400e' },
  { slot: '17–18h', received: 267, made: 69, agents: 10, lost: '6.9%', status: 'Alerta', statusColor: '#fef3c7', textColor: '#92400e' },
  { slot: '18–19h', received: 156, made: 43, agents: 11, lost: '3.8%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
  { slot: '19–20h', received: 98, made: 31, agents: 12, lost: '2.1%', status: 'OK', statusColor: '#dcfce7', textColor: '#15803d' },
];

// Custom label for stacked bars - shows value inside bar if space allows
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || height < 14) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} fill="white" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold">
      {value}
    </text>
  );
};

// Custom label for agents bar (on top)
const AgentLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 5} fill={V} textAnchor="middle" dominantBaseline="bottom" fontSize="10" fontWeight="bold">
      {value}
    </text>
  );
};

// Custom label for line points showing percentage
const LinePointLabel = (props: any) => {
  const { x, y, value } = props;
  if (!value) return null;
  return (
    <text x={x} y={y + 15} fill={OR} textAnchor="middle" dominantBaseline="top" fontSize="10" fontWeight="bold">
      {value.toFixed(1)}%
    </text>
  );
};

// Component to render total above each stacked bar
const StackTotalLabel = (props: any) => {
  const { x, y, width, value, index } = props;
  // value viene del LabelList con el campo 'total' del data
  return (
    <text 
      x={x + width / 2}
      y={y - 6}
      fill="#03091D"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

export default function Analytics() {
  const [viewType, setViewType] = useState<ViewType>('supervisor');
  const [subTab, setSubTab] = useState<SubTab>('global');
  const [capacityPeriod, setCapacityPeriod] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const [selectedAgent, setSelectedAgent] = useState<string>('todos');
  const [apiCalls, setApiCalls] = useState<BackendCall[]>([]);
  const [apiAgents, setApiAgents] = useState<AgentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, a] = await Promise.all([fetchCalls(2000), fetchAgents()]);
        if (!cancelled) {
          setApiCalls(c);
          setApiAgents(a);
        }
      } catch {
        if (!cancelled) {
          setApiCalls([]);
          setApiAgents([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const charts = useMemo(() => buildAnalyticsCharts(apiCalls, apiAgents), [apiCalls, apiAgents]);
  const useLive = apiCalls.length > 0;
  const weekDayCallsData = useLive ? charts.weekDayCallsData : FALLBACK_weekDayCallsData;
  const dailyEvolutionData = useLive ? charts.dailyEvolutionData : FALLBACK_dailyEvolutionData;
  const callsHistoryData = useLive ? charts.callsHistoryData : FALLBACK_callsHistoryData;
  const abandonRateAgentsData = useLive ? charts.abandonRateAgentsData : FALLBACK_abandonRateAgentsData;
  const realtimeMonitorData = useLive ? charts.realtimeMonitorData : FALLBACK_realtimeMonitorData;
  const agentPerformanceData = useLive ? charts.agentPerformanceData : FALLBACK_agentPerformanceData;
  const callsHandledByAgent = useLive ? charts.callsHandledByAgent : FALLBACK_callsHandledByAgent;
  const callsAbandonedByAgent = useLive ? charts.callsAbandonedByAgent : FALLBACK_callsAbandonedByAgent;
  const hourlyDistributionData = useLive ? charts.hourlyDistributionData : FALLBACK_hourlyDistributionData;
  const occupancyBySlot = useLive ? charts.occupancyBySlot : FALLBACK_occupancyBySlot;
  const slotDetailData = useLive ? charts.slotDetailData : FALLBACK_slotDetailData;

  const maxHandled = Math.max(0, ...callsHandledByAgent.map((a) => a.total));

  return (
    <div className="size-full flex flex-col" style={{ background: '#f2f3f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Top Navigation */}
      <div className="bg-white flex items-center justify-between px-5 h-[50px]" style={{ borderBottom: '1.5px solid #e8eaf0' }}>
        <div className="flex items-center">
          <span className="text-[15px] font-extrabold" style={{ color: '#03091D' }}>Analytics</span>
          <div className="flex ml-6">
            <button
              onClick={() => setViewType('supervisor')}
              className={`flex items-center gap-[5px] px-3.5 h-[50px] text-xs font-medium cursor-pointer ${
                viewType === 'supervisor' ? 'font-bold' : ''
              }`}
              style={{
                color: viewType === 'supervisor' ? B4 : '#6b7280',
                borderBottom: viewType === 'supervisor' ? `2.5px solid ${B4}` : '2.5px solid transparent'
              }}
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0" style={{ background: viewType === 'supervisor' ? '#eef1fb' : '#f4f5f9' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={viewType === 'supervisor' ? B4 : '#9ca3af'} strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </span>
              Vista supervisor
            </button>
            <button
              onClick={() => setViewType('agent')}
              className={`flex items-center gap-[5px] px-3.5 h-[50px] text-xs font-medium cursor-pointer ${
                viewType === 'agent' ? 'font-bold' : ''
              }`}
              style={{
                color: viewType === 'agent' ? B4 : '#6b7280',
                borderBottom: viewType === 'agent' ? `2.5px solid ${B4}` : '2.5px solid transparent'
              }}
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0" style={{ background: viewType === 'agent' ? '#eef1fb' : '#f4f5f9' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={viewType === 'agent' ? B4 : '#9ca3af'} strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              Vista agente
            </button>
          </div>
        </div>
        <button className="text-white text-[11px] font-bold px-3.5 py-[7px] rounded-lg border-none cursor-pointer flex items-center gap-[5px]" style={{ background: '#03091D' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Export
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white flex px-5" style={{ borderBottom: '1px solid #eef0f6' }}>
        {[
          { id: 'global', label: 'Visión global' },
          { id: 'inbound', label: 'Entrantes' },
          { id: 'outbound', label: 'Salientes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as SubTab)}
            className="text-xs px-4 py-[11px] font-medium cursor-pointer"
            style={{
              color: subTab === tab.id ? B6 : '#6b7280',
              borderBottom: subTab === tab.id ? `2px solid ${B6}` : '2px solid transparent',
              fontWeight: subTab === tab.id ? 700 : 500
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: '#f2f3f8' }}>
        <span className="text-[11px] font-semibold text-slate-700 mr-1">Filtrar:</span>
        <button className="text-[11px] px-3 py-[5px] rounded-[20px] border cursor-pointer font-medium inline-flex items-center gap-[5px] text-white" style={{ background: '#03091D', borderColor: '#03091D' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Hoy
        </button>

        {viewType === 'supervisor' && (
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-[11px] px-3 py-[5px] rounded-[20px] border cursor-pointer font-medium"
            style={{ background: 'white', borderColor: '#d1d5db', color: '#374151' }}
          >
            <option value="todos">Todos los agentes</option>
            <option value="agente1">Agente 1</option>
            <option value="agente2">Agente 2</option>
            <option value="agente3">Agente 3</option>
            <option value="agente4">Agente 4</option>
            <option value="agente5">Agente 5</option>
            <option value="agente6">Agente 6</option>
          </select>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex flex-col gap-3.5 overflow-auto">
        
        {/* KPI Row 1 - 4 columns */}
        <div className="grid grid-cols-4 gap-2.5">
          <KPICard 
            icon={<PhoneIcon />}
            iconBg="#eef1fb"
            label="Total llamadas"
            value="8,783"
            trend="↑ +16% vs periodo anterior"
            trendColor={GR}
          />
          <KPICard 
            icon={<PhoneIncomingIcon />}
            iconBg="#e8f5e9"
            label="Llamadas entrantes"
            value="1,962"
            trend="↓ -4.4% vs periodo anterior"
            trendColor={RD}
          />
          <KPICard 
            icon={<ClockVioletIcon />}
            iconBg="#f0eeff"
            label="Tiempo conv. medio"
            value="1:33"
            valueSize="18px"
            valueSuffix="min"
            trend="Sin cambios"
            trendColor="#9ca3af"
          />
          <KPICard 
            icon={<PhoneOutgoingIcon />}
            iconBg="#eef1fb"
            label="Llamadas salientes"
            value="6,841"
            trend="↑ +9.9% vs periodo anterior"
            trendColor={GR}
          />
        </div>

        {/* KPI Row 2 - 5 columns */}
        <div className="grid grid-cols-5 gap-2.5">
          <KPICard 
            icon={<ClockWarningIcon />}
            iconBg="#fef3c7"
            label="Tiempo max. espera"
            value="1:10"
            valueSize="18px"
            valueSuffix="min"
            trend="Llamada mas larga"
            trendColor="#9ca3af"
          />
          <KPICard 
            icon={<PhoneMissedIcon />}
            iconBg="#fee2e2"
            label="Llamadas en espera"
            value="11"
            valueColor={RD}
            trend="↑ +3 vs hace 1h"
            trendColor={RD}
          />
          <KPICard 
            icon={<UsersIcon />}
            iconBg="#eef1fb"
            label="Agentes conectados"
            value="34"
            trend="En el sistema ahora"
            trendColor="#9ca3af"
          />
          <KPICard 
            icon={<UserAvailableIcon />}
            iconBg="#e8f5e9"
            label="Agentes disponibles"
            value="4"
            valueColor={GR}
            trend="↓ -2 vs hora anterior"
            trendColor={RD}
          />
          <KPICard 
            icon={<ActivityIcon />}
            iconBg="#f0eeff"
            label="ASA vel. respuesta"
            value="28"
            valueSize="18px"
            valueColor={V}
            valueSuffix="seg"
            trend="↓ -4s mejor que ayer"
            trendColor={GR}
          />
        </div>

        {/* SLA Card */}
        <div className="bg-white rounded-xl border p-[18px_20px] flex items-center gap-5" style={{ borderColor: '#eef0f6' }}>
          <div className="w-[42px] h-[42px] rounded-[11px] flex-shrink-0 flex items-center justify-center" style={{ background: '#eef1fb' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B4} strokeWidth="1.8">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#9ca3af', letterSpacing: '0.05em' }}>
              Llamadas respondidas en menos de 179 segundos
            </p>
            <p className="text-4xl font-extrabold leading-none" style={{ color: B4 }}>41.9%</p>
          </div>
          <div className="w-px h-12 flex-shrink-0" style={{ background: '#eef0f6' }}></div>
          <div className="flex gap-7">
            <div>
              <p className="text-[22px] font-extrabold" style={{ color: '#03091D' }}>43</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>SLA 17</p>
            </div>
            <div>
              <p className="text-[22px] font-extrabold" style={{ color: RD }}>6</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Abandonadas</p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-2.5">
          <ChartCard title="Llamadas por dia de la semana">
            <div className="flex flex-wrap gap-2.5 mb-2.5">
              <ChartLegend color={B4} label="Entrantes" />
              <ChartLegend color={B2} label="Salientes" />
              <ChartLegend color={V4} label="Clasificadas" />
              <ChartLegendLine color={OR} label="% Perdidas" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={weekDayCallsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 400]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 10, fill: OR }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar yAxisId="left" dataKey="inbound" stackId="a" fill={B4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar yAxisId="left" dataKey="outbound" stackId="a" fill={B2} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar yAxisId="left" dataKey="classified" stackId="a" fill={V4} radius={[3, 3, 0, 0]} label={<CustomLabel />}>
                  <LabelList dataKey="total" position="top" content={<StackTotalLabel />} />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="lostPct" stroke={OR} strokeWidth={2.5} dot={{ fill: OR, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Evolucion total de llamadas por dia" subtitle="Ultima semana">
            <div className="flex flex-wrap gap-2.5 mb-2.5 mt-1.5">
              <ChartLegend color={B4} label="Entrantes" />
              <ChartLegend color={B2} label="Salientes" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 3200]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="inbound" stackId="a" fill={B4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar dataKey="outbound" stackId="a" fill={B2} radius={[4, 4, 0, 0]} label={<CustomLabel />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-2.5">
          <ChartCard title="Historial de llamadas por dia">
            <div className="flex flex-wrap gap-2.5 mb-2.5">
              <ChartLegend color={B4} label="Entrantes" />
              <ChartLegend color={V4} label="Salientes" />
              <ChartLegend color={V2} label="No atendidas" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={callsHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="inbound" stackId="a" fill={B4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar dataKey="outbound" stackId="a" fill={V4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar dataKey="missed" stackId="a" fill={V2} radius={[3, 3, 0, 0]} label={<CustomLabel />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Tasa de abandono y agentes disponibles por dia" subtitle="% abandono (izda.) — agentes disponibles (dcha.)">
            <div className="flex flex-wrap gap-2.5 mb-2.5">
              <ChartLegendLine color={OR} label="% Abandono" />
              <ChartLegend color={B4} label="Agentes disponibles" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={abandonRateAgentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 10]} tick={{ fontSize: 10, fill: OR }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tick={{ fontSize: 10, fill: B4 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar yAxisId="right" dataKey="agents" fill="rgba(59,108,255,0.15)" stroke={B4} strokeWidth={1} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="abandonPct" stroke={OR} strokeWidth={2.5} dot={{ fill: OR, r: 6, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Monitor RT */}
        <ChartCard title="Monitor de llamadas — Tiempo real">
          <div className="flex flex-wrap gap-2.5 mb-2.5">
            <ChartLegend color={B4} label="Llamadas activas" />
            <ChartLegend color={V4} label="En espera" />
            <ChartLegendLine color={GR} label="Agentes disponibles" />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={realtimeMonitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 20]} tick={{ fontSize: 10, fill: GR }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
              <Bar yAxisId="left" dataKey="active" stackId="a" fill={B4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
              <Bar yAxisId="left" dataKey="onHold" stackId="a" fill={V4} radius={[3, 3, 0, 0]} label={<CustomLabel />} />
              <Line yAxisId="right" type="monotone" dataKey="agents" stroke={GR} strokeWidth={2} dot={{ fill: GR, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Agent Performance Table */}
        <ChartCard title="Rendimiento de agentes" subtitle="Metricas individuales del dia actual">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Agente</th>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Total</th>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Atendidas</th>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Vel. respuesta</th>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Resolución</th>
                <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformanceData.map((row, i) => (
                <tr key={i}>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.agent}</td>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.total}</td>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.answered}</td>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.avgSpeed}</td>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>
                    <span className="font-bold" style={{ color: row.trend === 'up' ? GR : RD }}>
                      {row.resolution}%
                    </span> {row.trend === 'up' ? '↑' : '↓'}
                  </td>
                  <td className="text-xs px-2 py-[7px] border-b align-middle" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>
                    <div className="w-16 h-5.5">
                      <ResponsiveContainer width={64} height={22}>
                        <LineChart data={row.sparkline.map((v, i) => ({ v }))}>
                          <Line type="monotone" dataKey="v" stroke={row.trend === 'up' ? GR : RD} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>

        {/* Agent Charts */}
        <div className="grid grid-cols-2 gap-2.5">
          <ChartCard title="Llamadas gestionadas por agente" subtitle="Volumen total y tasa de atencion">
            <div style={{ marginTop: '4px' }}>
              {callsHandledByAgent.map((agent, i) => {
                const pct = Math.round((agent.answered / agent.total) * 100);
                const widthPct = Math.round((agent.total / maxHandled) * 100);
                return (
                  <div key={i} className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-[11px] font-semibold min-w-[58px]" style={{ color: '#03091D' }}>{agent.name}</span>
                    <div className="flex-1 h-2.5 rounded-[5px] overflow-hidden" style={{ background: '#f0f1f5' }}>
                      <div className="h-full rounded-[5px]" style={{ width: `${widthPct}%`, background: agent.color }}></div>
                    </div>
                    <span className="text-[11px] font-bold min-w-[28px] text-right" style={{ color: '#03091D' }}>{agent.total}</span>
                    <span className="text-[10px] font-semibold min-w-[32px] text-right" style={{ color: pct >= 80 ? GR : '#b45309' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Llamadas abandonadas por agente" subtitle="Volumen y % del total (126 total)">
            <div className="grid grid-cols-4 gap-2">
              {callsAbandonedByAgent.map((agent, i) => (
                <div key={i} className="rounded-[10px] border text-center p-[12px_10px]" style={{ borderColor: '#eef0f6' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9ca3af', letterSpacing: '0.04em' }}>{agent.name}</p>
                  <p className="text-2xl font-extrabold leading-none mb-0.5" style={{ color: agent.color }}>{agent.value}</p>
                  <p className="text-[10px] mb-2" style={{ color: '#9ca3af' }}>{agent.percentage}% del total</p>
                  <div className="h-1 rounded-sm overflow-hidden" style={{ background: '#f0f1f5' }}>
                    <div className="h-full rounded-sm" style={{ width: `${agent.percentage}%`, background: agent.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Capacity Management Section - Only for Supervisor */}
        {viewType === 'supervisor' && (
          <div className="pt-3.5 mt-1.5" style={{ borderTop: `2.5px solid ${B4}` }}>
            <p className="text-[10px] font-extrabold uppercase tracking-wider mb-3 flex items-center gap-[7px]" style={{ color: B6, letterSpacing: '0.08em' }}>
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ background: '#eef1fb' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={B6} strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                </svg>
              </span>
              Gestion de capacidad de agentes
            </p>

          {/* Capacity KPIs */}
          <div className="grid grid-cols-4 gap-2.5 mb-3.5">
            <KPICard 
              icon={<UsersIcon />}
              iconBg="#eef1fb"
              label="Agentes en turno"
              value="34"
              trend="↑ +3 vs ayer"
              trendColor={GR}
            />
            <KPICard 
              icon={<ClockGreenIcon />}
              iconBg="#e8f5e9"
              label="Ocupacion media"
              value="72%"
              trend="Sin cambios"
              trendColor="#9ca3af"
            />
            <KPICard 
              icon={<AlertTriangleIcon />}
              iconBg="#fee2e2"
              label="% Llamadas perdidas"
              value="8.4%"
              valueColor={RD}
              trend="↑ +1.2pp vs ayer"
              trendColor={RD}
            />
            <KPICard 
              icon={<StarIcon />}
              iconBg="#fef3c7"
              label="Franja critica"
              value="14–16h"
              valueSize="16px"
              valueColor="#b45309"
              trend="91% ocup. — +4 ag. necesarios"
              trendColor={RD}
            />
          </div>

          {/* Hourly Distribution Chart */}
          <div className="bg-white rounded-xl border p-4 mb-3.5" style={{ borderColor: '#eef0f6' }}>
            <div className="flex items-flex-start justify-between mb-2">
              <div>
                <p className="text-[13px] font-bold mb-0.5" style={{ color: '#03091D' }}>Distribucion horaria — recibidas, realizadas y % perdidas</p>
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>Con columna diferenciada de agentes disponibles por franja</p>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setCapacityPeriod('hoy')}
                  className="text-[11px] px-3 py-[5px] rounded-[20px] border cursor-pointer font-medium"
                  style={{
                    background: capacityPeriod === 'hoy' ? B6 : '#fff',
                    color: capacityPeriod === 'hoy' ? '#fff' : '#6b7280',
                    borderColor: capacityPeriod === 'hoy' ? B6 : '#dde1ee'
                  }}
                >
                  Hoy
                </button>
                <button 
                  onClick={() => setCapacityPeriod('semana')}
                  className="text-[11px] px-3 py-[5px] rounded-[20px] border cursor-pointer font-medium"
                  style={{
                    background: capacityPeriod === 'semana' ? B6 : '#fff',
                    color: capacityPeriod === 'semana' ? '#fff' : '#6b7280',
                    borderColor: capacityPeriod === 'semana' ? B6 : '#dde1ee'
                  }}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setCapacityPeriod('mes')}
                  className="text-[11px] px-3 py-[5px] rounded-[20px] border cursor-pointer font-medium"
                  style={{
                    background: capacityPeriod === 'mes' ? B6 : '#fff',
                    color: capacityPeriod === 'mes' ? '#fff' : '#6b7280',
                    borderColor: capacityPeriod === 'mes' ? B6 : '#dde1ee'
                  }}
                >
                  Mes
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-2.5">
              <ChartLegend color={B4} label="Recibidas" />
              <ChartLegend color={B2} label="Realizadas" />
              <ChartLegend color={V2} label="Agentes disp. (eje dcha.)" />
              <ChartLegendLine color={OR} label="% Perdidas (eje dcha.)" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={hourlyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 20]} tick={{ fontSize: 10, fill: V4 }} tickFormatter={(v) => `${v} ag`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: B6, border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar yAxisId="left" dataKey="received" stackId="calls" fill={B4} radius={[0, 0, 0, 0]} label={<CustomLabel />} />
                <Bar yAxisId="left" dataKey="made" stackId="calls" fill={B2} radius={[3, 3, 0, 0]} label={<CustomLabel />} />
                <Bar yAxisId="right" dataKey="agents" fill={V2} radius={[3, 3, 0, 0]} barSize={20} label={<AgentLabel />} />
                <Line yAxisId="right" type="monotone" dataKey="lost" stroke={OR} strokeWidth={2.5} dot={{ fill: OR, r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} label={<LinePointLabel />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy and Detail Tables */}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            <ChartCard title="Ocupacion por franja" subtitle="% tiempo en llamada activa">
              {occupancyBySlot.map((slot, i) => (
                <div key={i} className="flex items-center gap-2.5 mb-2">
                  <span className="text-[11px] font-semibold min-w-[50px]" style={{ color: '#03091D' }}>{slot.slot}</span>
                  <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ background: '#f0f1f5' }}>
                    <div className="h-full rounded-sm" style={{ width: `${slot.pct}%`, background: slot.color }}></div>
                  </div>
                  <span className="text-[11px] font-bold min-w-[34px] text-right" style={{ color: slot.critical ? RD : (slot.pct >= 75 ? B4 : '#6b7280') }}>{slot.pct}%</span>
                </div>
              ))}
              <div className="mt-3 pt-3 flex gap-5" style={{ borderTop: '1px solid #f0f1f5' }}>
                <div>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>Franja critica</p>
                  <p className="text-[13px] font-extrabold" style={{ color: B6 }}>14–16h</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>Pico perdidas</p>
                  <p className="text-[13px] font-extrabold" style={{ color: RD }}>14.2%</p>
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>Deficit est.</p>
                  <p className="text-[13px] font-extrabold" style={{ color: '#03091D' }}>+4 ag.</p>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Detalle por franja horaria" subtitle="Volumen, cobertura y estado">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Franja</th>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Recib.</th>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Realiz.</th>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Ag.</th>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>% Perd.</th>
                    <th className="text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 text-left border-b" style={{ color: '#9ca3af', borderColor: '#f0f1f5', letterSpacing: '0.04em' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {slotDetailData.map((row, i) => (
                    <tr key={i}>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.slot}</td>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.received}</td>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.made}</td>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.agents}</td>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>{row.lost}</td>
                      <td className="text-xs px-2 py-[7px] border-b" style={{ color: '#03091D', borderColor: '#f8f9fb' }}>
                        <span className="inline-block px-[7px] py-[2px] rounded-[10px] text-[10px] font-bold" style={{ 
                          background: row.statusColor,
                          color: row.textColor
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}

// Helper Components
interface KPICardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueSize?: string;
  valueColor?: string;
  valueSuffix?: string;
  trend: string;
  trendColor: string;
}

function KPICard({ icon, iconBg, label, value, valueSize = '22px', valueColor = '#03091D', valueSuffix, trend, trendColor }: KPICardProps) {
  return (
    <div className="rounded-xl border p-[14px_16px]" style={{ background: '#fafbfc', borderColor: '#eef0f6' }}>
      <div className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 mb-2.5" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-[3px]" style={{ color: '#9ca3af', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p className="font-extrabold leading-tight mb-1" style={{ fontSize: valueSize, color: valueColor, lineHeight: '1.1' }}>
        {value} {valueSuffix && <span className="text-[11px] font-normal" style={{ color: '#9ca3af' }}>{valueSuffix}</span>}
      </p>
      <p className="text-[10px] font-semibold" style={{ color: trendColor }}>
        {trend}
      </p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#eef0f6' }}>
      {subtitle ? (
        <div className="flex justify-between items-center mb-0.5">
          <p className="text-[13px] font-bold" style={{ color: '#03091D' }}>{title}</p>
          <span className="text-[10px]" style={{ color: '#9ca3af' }}>{subtitle}</span>
        </div>
      ) : (
        <p className="text-[13px] font-bold mb-0.5" style={{ color: '#03091D' }}>{title}</p>
      )}
      {subtitle && <p className="text-[11px] mb-2.5" style={{ color: '#9ca3af' }}></p>}
      {children}
    </div>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[5px] text-[11px]" style={{ color: '#6b7280' }}>
      <span className="w-[9px] h-[9px] rounded-sm flex-shrink-0" style={{ background: color }}></span>
      {label}
    </span>
  );
}

function ChartLegendLine({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[5px] text-[11px]" style={{ color: '#6b7280' }}>
      <span className="inline-flex items-center gap-[2px]">
        <span className="w-[14px] h-[2px] rounded-[1px] inline-block align-middle" style={{ background: color }}></span>
        <span className="w-[5px] h-[5px] rounded-full inline-block align-middle" style={{ background: color }}></span>
      </span>
      {label}
    </span>
  );
}

// Icons
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B4} strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 5.18 2 2 0 015.07 3h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 17.92z"/>
    </svg>
  );
}

function PhoneIncomingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="1.8">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

function PhoneOutgoingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B4} strokeWidth="1.8">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
      <polyline points="16 17 22 17 22 11"/>
    </svg>
  );
}

function PhoneMissedIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.08 5.18 2 2 0 015.07 3h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 17.92z"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ClockVioletIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ClockWarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ClockGreenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B6} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function UserAvailableIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth="1.8">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}