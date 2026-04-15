import { useState, useCallback, useRef } from "react";
import { Clock, Calendar, Volume2, Grid3x3, Timer, Phone, Voicemail, ArrowRight, Sparkles } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

interface NodeType {
  type: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  color: string;
  desc: string;
  tag?: string;
}

interface Preset {
  id: string;
  name: string;
  dur: string;
  text: string;
  rec?: string;
}

interface Schedule {
  days: string;
  from: string;
  to: string;
}

interface NodeConfig {
  name: string;
  schedules?: Schedule[];
  preset?: string;
  target?: string;
  timeout?: number;
  music?: string;
  showQueue?: boolean;
}

interface FlowNode {
  id: string;
  type: string;
  config: NodeConfig;
}

interface Branch {
  id: string;
  label: string;
  color: string;
  nodes: FlowNode[];
}

interface Flow {
  entryNumbers: string[];
  root: {
    id: string;
    type: string;
    config: NodeConfig;
    branches: Branch[];
  };
}

const NODE_TYPES: NodeType[] = [
  { type: "time_rule", icon: Clock, label: "Regla de tiempo", color: "#03091D", desc: "Define horarios de atención" },
  { type: "date_rule", icon: Calendar, label: "Regla de fecha", color: "#03091D", desc: "Festivos y excepciones" },
  { type: "audio_message", icon: Volume2, label: "Mensaje de audio", color: "#03091D", desc: "Bienvenida, avisos, locuciones" },
  { type: "standard_ivr", icon: Grid3x3, label: "IVR estándar", color: "#03091D", desc: "Menú con teclas 1, 2, 3…" },
  { type: "waiting", icon: Timer, label: "Experiencia de espera", color: "#03091D", desc: "Música + mensajes en cola" },
  { type: "ring_to", icon: Phone, label: "Ring to", color: "#03091D", desc: "Llamar a agente o grupo" },
  { type: "voicemail", icon: Voicemail, label: "Buzón de voz", color: "#03091D", desc: "El paciente deja mensaje" },
  { type: "redirect", icon: ArrowRight, label: "Redirect to", color: "#03091D", desc: "Transferir a otro número" },
  { type: "ai_agent", icon: Sparkles, label: "AI Voice Agent", color: "#03091D", desc: "Agente IA conversacional", tag: "Nuevo" },
  { type: "end", icon: ArrowRight, label: "Fin", color: "#6B7280", desc: "Fin de la llamada" },
];

const PRESETS: Record<string, Preset[]> = {
  audio_message: [
    { id: "eq", name: "Equilibrado", dur: "~15 seg", text: "Gracias por contactar con Fresenius Medical Care. Esta llamada puede ser grabada para mejorar nuestro servicio. Si tiene alguna incidencia con su máquina, por favor contacte con el número XXXX. En breve le atenderemos.", rec: "best" },
    { id: "emp", name: "Empático (healthcare)", dur: "~15 seg", text: "Gracias por llamar a Fresenius Medical Care. Estamos aquí para ayudarle en todo lo relacionado con su tratamiento. Esta llamada puede ser grabada. Si tiene alguna incidencia con su máquina, por favor contacte con el número XXXX. En breve le atenderemos.", rec: "best" },
    { id: "corp", name: "Clásico corporativo", dur: "~25 seg", text: "Bienvenido a Fresenius Medical Care. Para garantizar la calidad del servicio, le informamos de que su llamada puede ser grabada. Puede consultar información sobre el tratamiento de sus datos personales y ejercer sus derechos en www.fresenius.es/rgpd. Si tiene una incidencia técnica con su máquina, por favor contacte con el número XXXX. En breve le atenderemos, permanezca a la espera." },
    { id: "short", name: "Corto y eficiente", dur: "~10 seg", text: "Bienvenido a Fresenius Medical Care. Esta llamada puede ser grabada. Si tiene una incidencia con su máquina, contacte con el número XXXX. En breve le atenderemos.", rec: "good" },
    { id: "prem", name: "Premium (top CX)", dur: "~15 seg", text: "Bienvenido a Fresenius Medical Care. Queremos acompañarle y ayudarle en todo momento. Esta llamada puede ser grabada. Si tiene alguna incidencia con su máquina, por favor contacte con el número XXXX. Permanezca a la espera." },
    { id: "legal", name: "Legal extendido", dur: "~25 seg", text: "Bienvenido a Fresenius Medical Care. Esta llamada puede ser grabada. Sus datos serán tratados para gestionar su solicitud. Puede ejercer sus derechos en www.fresenius.es/rgpd. Si tiene una incidencia con su máquina, por favor contacte con el número XXXX. En breve le atenderemos." },
    { id: "conv", name: "Conversacional (moderno)", dur: "~10 seg", text: "Gracias por llamar a Fresenius Medical Care. ¿En qué podemos ayudarle? Esta llamada puede ser grabada. Si tiene una incidencia con su máquina, contacte con el número XXXX. Permanezca a la espera." },
  ],
  waiting: [
    { id: "e1", name: "Corporativo clásico", dur: "~15 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento todos nuestros agentes están atendiendo otras llamadas. Por favor, permanezca en la línea y le atenderemos en breves momentos. Si tiene alguna incidencia con su máquina, por favor contacte con el número XXXX. Gracias." },
    { id: "e2", name: "Empático con prioridad clínica", dur: "~20 seg", text: "Gracias por llamar a Fresenius Medical Care. Sabemos que cuando usted llama, es importante. En este momento todos nuestros profesionales están ocupados, pero le atenderemos lo antes posible. Si su llamada está relacionada con una incidencia en su máquina, contacte con el número XXXX. En otro caso, espere en línea. Gracias.", rec: "best" },
    { id: "e3", name: "Callback / sin espera", dur: "~25 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento nuestros agentes están ocupados. Para no hacerle esperar, pulse 1 y le devolveremos la llamada en los próximos minutos sin perder su turno. Si prefiere esperar en línea, permanezca al teléfono. Si se trata de una incidencia con la máquina, por favor llame al XXXX. Gracias.", rec: "best" },
    { id: "e4", name: "Posición en cola", dur: "~20 seg", text: "Gracias por llamar a Fresenius Medical Care. Usted es el [número] llamante en la fila. Tiempo estimado de espera: [X] minutos. Si prefiere que le devolvamos la llamada, pulse 1. Para incidencias con su máquina, contacte con el XXXX. Gracias.", rec: "best" },
    { id: "e5", name: "Corto y directo", dur: "~10 seg", text: "Fresenius Medical Care, gracias por su llamada. Le atenderemos en breves instantes. En caso de incidencias con la máquina, llame al XXXX. Gracias.", rec: "good" },
    { id: "e6", name: "Empático + buzón de voz", dur: "~25 seg", text: "Gracias por llamar a Fresenius Medical Care. Sentimos no poder atenderle en este momento. Si lo desea, pulse 1 para dejar un mensaje de voz con su nombre, teléfono y el motivo de su llamada, y le contactaremos a la mayor brevedad. Si prefiere esperar, permanezca en la línea. Para incidencias con su máquina, por favor contacte con el número XXXX. Gracias." },
  ],
  voicemail: [
    { id: "v1", name: "Corporativo clásico", dur: "~20 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento no podemos atender su llamada. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y motivo de la consulta tras la señal. Si tiene alguna incidencia con su máquina, por favor contacte con el número XXXX." },
    { id: "v2", name: "Estándar", dur: "~15 seg", text: "En estos momentos no podemos atenderle. Por favor, deja un mensaje en el buzón y en breve contactaremos contigo.", rec: "best" },
    { id: "v3", name: "Equilibrado", dur: "~20 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento no podemos atenderle. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada y nos pondremos en contacto con usted lo antes posible. Si tiene alguna incidencia con su máquina, contacte con el número XXXX.", rec: "best" },
    { id: "v4", name: "Empático", dur: "~25 seg", text: "Gracias por llamar a Fresenius Medical Care. Sentimos no poder atenderle en este momento. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada, especialmente si está relacionado con su tratamiento o equipo, y le llamaremos lo antes posible. Si tiene una incidencia con su máquina, por favor contacte con el número XXXX.", rec: "best" },
    { id: "v5", name: "Corto y directo", dur: "~15 seg", text: "Gracias por llamar a Fresenius Medical Care. No podemos atenderle en este momento. Nuestro horario es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Deje su nombre y teléfono tras la señal. Para incidencias con su máquina, llame al XXXX." },
    { id: "v6", name: "Premium", dur: "~25 seg", text: "Gracias por contactar con Fresenius Medical Care. En este momento no podemos atenderle, pero queremos ayudarle lo antes posible. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada y nos pondremos en contacto con usted a la mayor brevedad. Si tiene alguna incidencia con su máquina, contacte con el número XXXX." },
  ],
};

const MUSIC_OPTIONS = ["Ringing Tone (Europe)", "Instrumental suave", "Ambiente clínico"];
const AGENT_TARGETS = [
  { id: "g1", name: "Grupo principal", agents: 4 },
  { id: "g2", name: "Cola general", agents: 8 },
  { id: "a1", name: "Agente 1 Principal", role: "Dynamics" },
  { id: "a2", name: "Agente secundario", role: "Dynamics" },
  { id: "a3", name: "Enfermera 1", role: "Clínico" },
  { id: "a4", name: "Enfermera 2", role: "Clínico" },
  { id: "a5", name: "Supervisor", role: "Supervisora" },
];

const mkId = () => "n" + Math.random().toString(36).slice(2, 8);

interface DayScheduleConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface BusinessHoursSchedule {
  [key: string]: DayScheduleConfig;
}

// Convierte el horario de configuración al formato IVR
function convertScheduleToIVRFormat(schedule: BusinessHoursSchedule): Schedule[] {
  const dayMap: { [key: string]: string } = {
    lunes: 'L',
    martes: 'M',
    miercoles: 'X',
    jueves: 'J',
    viernes: 'V',
    sabado: 'S',
    domingo: 'D',
  };

  const dayOrder = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const schedules: Schedule[] = [];

  let currentGroup: { days: string[]; from: string; to: string } | null = null;

  for (const day of dayOrder) {
    const config = schedule[day];

    if (!config || !config.enabled) {
      if (currentGroup) {
        schedules.push({
          days: currentGroup.days.length === 1
            ? dayMap[currentGroup.days[0]]
            : `${dayMap[currentGroup.days[0]]}-${dayMap[currentGroup.days[currentGroup.days.length - 1]]}`,
          from: currentGroup.from,
          to: currentGroup.to,
        });
        currentGroup = null;
      }
      continue;
    }

    if (!currentGroup) {
      currentGroup = { days: [day], from: config.startTime, to: config.endTime };
    } else if (currentGroup.from === config.startTime && currentGroup.to === config.endTime) {
      currentGroup.days.push(day);
    } else {
      schedules.push({
        days: currentGroup.days.length === 1
          ? dayMap[currentGroup.days[0]]
          : `${dayMap[currentGroup.days[0]]}-${dayMap[currentGroup.days[currentGroup.days.length - 1]]}`,
        from: currentGroup.from,
        to: currentGroup.to,
      });
      currentGroup = { days: [day], from: config.startTime, to: config.endTime };
    }
  }

  if (currentGroup) {
    schedules.push({
      days: currentGroup.days.length === 1
        ? dayMap[currentGroup.days[0]]
        : `${dayMap[currentGroup.days[0]]}-${dayMap[currentGroup.days[currentGroup.days.length - 1]]}`,
      from: currentGroup.from,
      to: currentGroup.to,
    });
  }

  return schedules.length > 0 ? schedules : [
    { days: "L-J", from: "08:00", to: "17:00" },
    { days: "V", from: "08:00", to: "15:00" },
  ];
}

const getInitialFlow = (businessHoursSchedule?: BusinessHoursSchedule): Flow => {
  const schedules = businessHoursSchedule
    ? convertScheduleToIVRFormat(businessHoursSchedule)
    : [
        { days: "L-J", from: "08:00", to: "17:00" },
        { days: "V", from: "08:00", to: "15:00" },
      ];

  return {
    entryNumbers: ["91 327 66 64", "900 12 19 89"],
    root: {
      id: "root", type: "time_rule",
      config: { name: "Horario laboral", schedules },
      branches: [
        { id: "b_in", label: "En horario", color: "#10B981", nodes: [
          { id: "n_welcome", type: "audio_message", config: { name: "Bienvenida", preset: "eq" } },
          { id: "n_wait", type: "waiting", config: { name: "Experiencia de espera", music: "Ringing Tone (Europe)", preset: "e2" } },
          { id: "n_a1", type: "ring_to", config: { name: "Agente 1 Principal", target: "a1", timeout: 15 } },
          { id: "n_a2", type: "ring_to", config: { name: "Agente secundario", target: "a2", timeout: 15 } },
          { id: "n_queue", type: "ring_to", config: { name: "Cola general", target: "g2", timeout: 15 } },
          { id: "n_vm1", type: "voicemail", config: { name: "Buzón de Voz", preset: "v2" } },
          { id: "n_screen_popup", type: "redirect", config: { name: "Abrir Ficha paciente/Screen Pop Up -Dynamics" } },
          { id: "n_recording", type: "redirect", config: { name: "Grabación, transcripción en Dynamics/AI Contact Experience" } },
          { id: "n_end", type: "end", config: { name: "Fin llamada" } },
        ]},
        { id: "b_out", label: "Fuera de horario", color: "#F59E0B", nodes: [
          { id: "n_fh_vm", type: "voicemail", config: { name: "Buzón fuera de horario", preset: "v3" } },
          { id: "n_fh_end", type: "end", config: { name: "Fin" } },
        ]},
      ],
    },
  };
};

// ─── Micro-components ────────────────────────────────────────────────────────

function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", borderRadius: 4, background: color + "18", color }}>{text}</span>;
}

function RecBadge({ rec }: { rec?: string }) {
  if (!rec) return null;
  const m: Record<string, { t: string; c: string }> = { best: { t: "Muy recomendada", c: "#059669" }, good: { t: "Recomendada", c: "#0284C7" } };
  const d = m[rec];
  return d ? <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: d.c + "14", color: d.c, marginLeft: 6 }}>{d.t}</span> : null;
}

function Connector({ short }: { short?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: 1.5, height: short ? 10 : 18, background: "#D1D5DB" }} />
      <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #D1D5DB" }} />
    </div>
  );
}

function AddNodeBtn({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }} ref={ref}>
      <div style={{ width: 1.5, height: 10, background: "#D1D5DB" }} />
      <button onClick={() => setOpen(!open)} style={{
        width: 26, height: 26, borderRadius: 13, border: "1.5px dashed #9CA3AF", background: open ? "#F0FDF4" : "#fff",
        cursor: "pointer", fontSize: 15, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
      }}>+</button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: 42, left: "50%", transform: "translateX(-50%)", zIndex: 50,
            background: "#fff", borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,.14)", border: "1px solid #E5E7EB",
            width: 236, padding: 6, maxHeight: 380, overflowY: "auto",
          }}>
            <div style={{ padding: "6px 10px 4px", fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8 }}>Añadir nodo</div>
            {NODE_TYPES.map(nt => {
              const IconComponent = nt.icon;
              return (
                <div key={nt.type} onClick={() => { onAdd(nt.type); setOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                  transition: "background .1s",
                }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: nt.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    <IconComponent style={{ width: 14, height: 14, color: "#fff" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937", display: "flex", alignItems: "center", gap: 4 }}>
                      {nt.label}{nt.tag && <Badge text={nt.tag} color="#D97706" />}
                    </div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nt.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Node card ───────────────────────────────────────────────────────────────

interface NodeCardProps {
  node: FlowNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function NodeCard({ node, selected, onSelect, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: NodeCardProps) {
  const meta = NODE_TYPES.find(t => t.type === node.type) || NODE_TYPES[0];
  const IconComponent = meta.icon;
  const [hover, setHover] = useState(false);

  // For ring_to nodes, get the agent name from the target
  const getAgentInfo = () => {
    if (node.type === "ring_to" && node.config.target) {
      const agent = AGENT_TARGETS.find(a => a.id === node.config.target);
      return {
        name: agent ? agent.name : node.config.name,
        isDynamics: agent?.role === "Dynamics"
      };
    }
    return { name: node.config.name, isDynamics: false };
  };

  const agentInfo = getAgentInfo();

  // For time_rule nodes, format the schedule display
  const formatSchedule = () => {
    if (node.type === "time_rule" && node.config.schedules) {
      return node.config.schedules.map(s => `${s.days} ${s.from}-${s.to}h`).join(", ");
    }
    return null;
  };

  const scheduleText = formatSchedule();

  // Nodos sin configuración
  const isNonConfigurable = (node.type === "redirect" && (node.config.name?.includes("Dynamics") || node.config.name?.includes("Grabación"))) || node.type === "end";

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div onClick={() => !isNonConfigurable && onSelect(node.id)} style={{
        display: "flex", flexDirection: "column", gap: node.type === "time_rule" ? 8 : 0, padding: "10px 13px",
        background: selected ? "#E6F0FF" : "#fff",
        border: selected ? "2px solid #03091D" : "1.5px solid #E5E7EB",
        borderRadius: 10, cursor: isNonConfigurable ? "default" : "pointer", transition: "all .12s",
        boxShadow: selected ? "0 0 0 3px rgba(3, 9, 29, 0.1)" : "0 1px 3px rgba(0,0,0,.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
            <IconComponent style={{ width: 18, height: 18, color: "#fff" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{agentInfo.name}</div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>
              {node.type === "ring_to" && agentInfo.isDynamics ? "Ring to" : meta.label}
              {node.config.timeout ? ` · ${node.config.timeout}s` : ""}
            </div>
          </div>
          {node.type === "ai_agent" && <Badge text="AI" color="#D97706" />}
        </div>
        {scheduleText && (
          <div style={{ paddingLeft: 45, fontSize: 11, color: "#6B7280", background: "#F9FAFB", padding: "6px 10px", borderRadius: 6, marginTop: 4 }}>
            {scheduleText}
          </div>
        )}
      </div>
      {hover && (
        <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2, zIndex: 5 }}>
          {!isFirst && <button onClick={(e) => { e.stopPropagation(); onMoveUp(node.id); }} style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", border: "1px solid #E5E7EB", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>↑</button>}
          {!isLast && <button onClick={(e) => { e.stopPropagation(); onMoveDown(node.id); }} style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", border: "1px solid #E5E7EB", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>↓</button>}
          <button onClick={(e) => { e.stopPropagation(); onRemove(node.id); }} style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", border: "1px solid #FCA5A5", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>×</button>
        </div>
      )}
    </div>
  );
}

// ─── Config panel ────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  node: FlowNode;
  onClose: () => void;
  onSave: (node: FlowNode) => void;
}

function ConfigPanel({ node, onClose, onSave }: ConfigPanelProps) {
  const meta = NODE_TYPES.find(t => t.type === node.type)!;
  const IconComponent = meta.icon;
  const [cfg, setCfg] = useState<NodeConfig>({ ...node.config });
  const presets = PRESETS[node.type];
  const up = (k: string, v: any) => setCfg(prev => ({ ...prev, [k]: v }));

  const Label = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, marginTop: 18 }}>{children}</div>;
  const Input = ({ value, onChange, ...props }: any) => <input value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none", transition: "border .15s" }} onFocus={e => (e.target as HTMLInputElement).style.borderColor = meta.color} onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E5E7EB"} {...props} />;

  return (
    <div style={{ width: 360, background: "#fff", borderLeft: "1px solid #E5E7EB", height: "100%", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>
            <IconComponent style={{ width: 18, height: 18, color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{meta.label}</div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{meta.desc}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9CA3AF", padding: 4 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 24px" }}>
        {node.type !== "waiting" && node.type !== "ring_to" && node.type !== "end" && node.type !== "voicemail" && !(node.type === "redirect" && (node.config.name?.includes("Dynamics") || node.config.name?.includes("Grabación"))) && (
          <>
            <Label>Nombre</Label>
            <Input value={cfg.name} onChange={(v: string) => up("name", v)} />
          </>
        )}

        {node.type === "ring_to" && node.config.name !== "Cola general" && (node.config.name === "Agente 1 Principal" || node.config.name === "Agente secundario") && (
          <>
            <Label style={{ color: "#9CA3AF", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18 }}>Nombre</Label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>{cfg.name}</span>
              <button style={{ background: "none", border: "none", color: "#2563EB", fontSize: 12, fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
                Poder modificar el nombre
              </button>
            </div>
          </>
        )}

        {node.type === "ring_to" && node.config.name !== "Cola general" && node.config.name !== "Agente 1 Principal" && node.config.name !== "Agente secundario" && (
          <>
            <Label>Nombre</Label>
            <Input value={cfg.name} onChange={(v: string) => up("name", v)} />
          </>
        )}

        {node.type === "time_rule" && cfg.schedules && (
          <>
            <Label>Horarios</Label>
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #F3F4F6" }}>
              {cfg.schedules.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: i < cfg.schedules!.length - 1 ? 8 : 0 }}>
                  <input value={s.days} onChange={e => { const ns = [...cfg.schedules!]; ns[i] = { ...s, days: e.target.value }; up("schedules", ns); }} style={{ width: 44, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                  <input value={s.from} onChange={e => { const ns = [...cfg.schedules!]; ns[i] = { ...s, from: e.target.value }; up("schedules", ns); }} style={{ width: 56, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>–</span>
                  <input value={s.to} onChange={e => { const ns = [...cfg.schedules!]; ns[i] = { ...s, to: e.target.value }; up("schedules", ns); }} style={{ width: 56, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                </div>
              ))}
              <button onClick={() => up("schedules", [...cfg.schedules!, { days: "S", from: "09:00", to: "13:00" }])} style={{ marginTop: 8, background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>+ Añadir horario</button>
            </div>
          </>
        )}

        {(node.type === "ring_to" || node.type === "redirect") && (
          <>
            {node.config.name === "Cola general" ? (
              <>
                <Label>Agentes en la cola</Label>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #F3F4F6", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>Agentes disponibles en la cola:</div>
                  {AGENT_TARGETS.filter(a => !a.agents && a.role !== "Dynamics").map(agent => (
                    <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "#fff", borderRadius: 6, marginBottom: 4, border: "1px solid #E5E7EB" }}>
                      <input type="checkbox" defaultChecked style={{ width: 14, height: 14, cursor: "pointer" }} />
                      <span style={{ fontSize: 12, color: "#111827" }}>{agent.name}</span>
                      {agent.role && <span style={{ fontSize: 10, color: "#9CA3AF" }}>({agent.role})</span>}
                    </div>
                  ))}
                </div>

                <Label>Timeout entre agentes (segundos)</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={5} max={60} step={5} value={cfg.timeout || 15} onChange={e => up("timeout", Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 42, textAlign: "right" }}>{cfg.timeout || 15}s</span>
                </div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 3 }}>
                  Tiempo de espera antes de pasar al siguiente agente en la cola
                </div>
              </>
            ) : (
              <>
                {node.config.name === "Agente 1 Principal" || node.config.name === "Agente secundario" ? (
                  <>
                    <Label style={{ color: "#2563EB", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18 }}>Configurar</Label>
                    <select value={cfg.target || ""} onChange={e => {
                      const targetId = e.target.value;
                      up("target", targetId);
                      const agent = AGENT_TARGETS.find(a => a.id === targetId);
                      if (agent) {
                        up("name", agent.name);
                      }
                    }} style={{ width: "100%", padding: "10px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 14, fontFamily: "inherit", background: "#fff", boxSizing: "border-box", color: "#2563EB", fontWeight: 500, marginBottom: 18 }}>
                      <option value="a1">Dynamics - Agente Principal</option>
                      <option value="a2">Dynamics - Agente Secundario</option>
                    </select>

                    <Label style={{ color: "#2563EB", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Siguiente paso:</Label>
                    <select defaultValue={cfg.target === "a1" ? "a2" : "g2"} style={{ width: "100%", padding: "10px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 14, fontFamily: "inherit", background: "#fff", boxSizing: "border-box", color: "#2563EB", fontWeight: 500, marginBottom: 18 }}>
                      {cfg.target === "a1" || node.config.name === "Agente 1 Principal" ? (
                        <>
                          <option value="a2">Dynamics - Agente Secundario</option>
                          <option value="g2">Cola General | — 4 agentes</option>
                          <option value="vm">Buzón de voz</option>
                        </>
                      ) : (
                        <>
                          <option value="g2">Cola General | — 4 agentes</option>
                          <option value="vm">Buzón de voz</option>
                          <option value="a3">Enfermera 1</option>
                          <option value="a4">Enfermera 2</option>
                        </>
                      )}
                    </select>
                  </>
                ) : (
                  <>
                    <Label>Tipo de agente</Label>
                    <select value={cfg.target || ""} onChange={e => {
                      const targetId = e.target.value;
                      up("target", targetId);
                      const agent = AGENT_TARGETS.find(a => a.id === targetId);
                      if (agent) {
                        up("name", agent.name);
                      }
                    }} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
                      {AGENT_TARGETS.map(a => {
                        const label = a.role === "Dynamics"
                          ? `Dynamics - ${a.name}`
                          : `${a.name}${a.role ? ` (${a.role})` : ""}${a.agents ? ` — ${a.agents} agentes` : ""}`;
                        return <option key={a.id} value={a.id}>{label}</option>;
                      })}
                    </select>
                  </>
                )}

                <Label style={{ color: "#9CA3AF", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Timeout (segundos)</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <input type="range" min={5} max={60} step={5} value={cfg.timeout || 15} onChange={e => up("timeout", Number(e.target.value))} style={{ flex: 1, accentColor: "#2563EB" }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", minWidth: 42, textAlign: "right" }}>{cfg.timeout || 15}s</span>
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                  Si no responde, pasa al siguiente nodo del flujo
                </div>
              </>
            )}
          </>
        )}

        {node.type === "waiting" && (
          <>
            <Label>Música de espera o tonos</Label>
            <select value={cfg.music || MUSIC_OPTIONS[0]} onChange={e => up("music", e.target.value)} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              {MUSIC_OPTIONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </>
        )}

        {node.type === "ai_agent" && (
          <>
            <Label>Modelo de IA</Label>
            <select defaultValue="sonnet" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              <option value="sonnet">Claude Sonnet 4.6</option>
              <option value="gpt4o">GPT-4o Realtime</option>
              <option value="gemini">Gemini 2.5 Flash</option>
            </select>
            <Label>Comportamiento</Label>
            <div style={{ background: "#FFFBEB", borderRadius: 8, padding: 12, border: "1px solid #FDE68A", fontSize: 11.5, color: "#92400E", lineHeight: 1.6 }}>
              El agente IA atiende la llamada, identifica al paciente por nombre/DNI, resuelve consultas frecuentes (horarios, citas, suministros) y escala a agente humano si detecta urgencia clínica o incidencia de máquina.
            </div>
            <Label>Idioma</Label>
            <select defaultValue="es" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              <option value="es">Español</option>
              <option value="ca">Catalán</option>
              <option value="en">English</option>
            </select>
            <Label>Máx. duración conversación IA</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min={30} max={300} step={30} defaultValue={120} style={{ flex: 1 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 42, textAlign: "right" }}>120s</span>
            </div>
          </>
        )}

        {node.type === "standard_ivr" && (
          <>
            <Label>Opciones del menú</Label>
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #F3F4F6" }}>
              {[
                { key: "1", label: "Incidencia técnica" },
                { key: "2", label: "Citas y tratamiento" },
                { key: "3", label: "Facturación y seguros" },
              ].map(opt => (
                <div key={opt.key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "#03091D", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{opt.key}</div>
                  <input defaultValue={opt.label} style={{ flex: 1, padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit" }} />
                </div>
              ))}
              <button style={{ marginTop: 4, background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>+ Añadir opción</button>
            </div>
          </>
        )}

        {presets && node.type !== "waiting" && node.type !== "voicemail" && (
          <>
            <Label>Configuración del mensaje</Label>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Mensajes recomendados</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {presets.map(p => (
                  <div key={p.id} onClick={() => up("preset", p.id)} style={{
                    padding: "9px 11px", borderRadius: 8,
                    border: cfg.preset === p.id ? `2px solid #03091D` : "1.5px solid #E5E7EB",
                    background: cfg.preset === p.id ? "rgba(3, 9, 29, 0.05)" : "#fff",
                    cursor: "pointer", transition: "all .1s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{p.dur}</span>
                      <RecBadge rec={p.rec} />
                    </div>
                    <div style={{ fontSize: 10.5, color: "#6B7280", lineHeight: 1.5, marginTop: 3, maxHeight: cfg.preset === p.id ? 200 : 32, overflow: "hidden", transition: "max-height .3s" }}>{p.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Mensaje personalizado</div>

              <Label>Escribir texto</Label>
              <textarea
                placeholder="Escribe tu mensaje personalizado aquí..."
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: "8px 11px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 7,
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                  resize: "vertical",
                }}
              />

              <Label>Idioma</Label>
              <select defaultValue="es" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
                <option value="es">Español</option>
                <option value="ca">Catalán</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>

              <Label>Voz</Label>
              <select defaultValue="lucia" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
                <option value="lucia">Lucía (europea)</option>
                <option value="miguel">Miguel (latinoamericana)</option>
                <option value="marta">Marta (europea)</option>
                <option value="carlos">Carlos (europea)</option>
              </select>
            </div>
          </>
        )}

        {node.type === "voicemail" && node.config.name === "Buzón de Voz" && (
          <>
            <Label style={{ color: "#2563EB", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18 }}>Botón activación</Label>
            <Input type="number" value="1" onChange={(v: string) => {}} style={{ marginBottom: 18 }} />

            <Label style={{ color: "#6B7280", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 18, marginBottom: 8 }}>Mensaje en espera</Label>
            <div style={{ marginBottom: 12 }}>
              <button style={{
                background: "none",
                border: "none",
                color: "#2563EB",
                fontSize: 13,
                fontWeight: 400,
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
                lineHeight: 1.5,
              }}>
                Poder Todos nuestros agentes están ocupados, pulsa 1 para dejar un mensaje en el buzón o te llamaremos a la mayor brevedad
              </button>
            </div>

            <Label style={{ marginTop: 8 }}>Voz</Label>
            <select defaultValue="lucia" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              <option value="lucia">Lucía (europea)</option>
              <option value="miguel">Miguel (latinoamericana)</option>
              <option value="marta">Marta (europea)</option>
              <option value="carlos">Carlos (europea)</option>
            </select>
          </>
        )}

        {node.type === "voicemail" && node.config.name !== "Buzón de Voz" && (
          <>
            <Label>Nombre</Label>
            <Input value={cfg.name} onChange={(v: string) => up("name", v)} />

            <Label>Configuración del mensaje</Label>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Mensajes recomendados</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {presets.map(p => (
                  <div key={p.id} onClick={() => up("preset", p.id)} style={{
                    padding: "9px 11px", borderRadius: 8,
                    border: cfg.preset === p.id ? `2px solid #03091D` : "1.5px solid #E5E7EB",
                    background: cfg.preset === p.id ? "rgba(3, 9, 29, 0.05)" : "#fff",
                    cursor: "pointer", transition: "all .1s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{p.dur}</span>
                      <RecBadge rec={p.rec} />
                    </div>
                    <div style={{ fontSize: 10.5, color: "#6B7280", lineHeight: 1.5, marginTop: 3, maxHeight: cfg.preset === p.id ? 200 : 32, overflow: "hidden", transition: "max-height .3s" }}>{p.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginTop: 12 }}>
              <Label>Mensaje en espera</Label>
              <textarea
                defaultValue="Por favor, permanezca a la espera. Un agente le atenderá en breve."
                style={{
                  width: "100%",
                  minHeight: 60,
                  padding: "8px 11px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 7,
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                  resize: "vertical",
                  marginBottom: 8,
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Label>Voz</Label>
                <select defaultValue="lucia" style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
                  <option value="lucia">Lucía (europea)</option>
                  <option value="miguel">Miguel (latinoamericana)</option>
                  <option value="marta">Marta (europea)</option>
                  <option value="carlos">Carlos (europea)</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "14px 18px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => { onSave({ ...node, config: cfg }); onClose(); }} style={{
          flex: 1, padding: "9px", background: "#03091D", color: "#fff", border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s",
        }}>Guardar cambios</button>
        <button onClick={onClose} style={{
          padding: "9px 14px", background: "#fff", color: "#6B7280", border: "1.5px solid #E5E7EB", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── Main app ────────────────────────────────────────────────────────────────

interface IVRFlowBuilderProps {
  businessHoursSchedule?: BusinessHoursSchedule;
}

export default function IVRFlowBuilder({ businessHoursSchedule }: IVRFlowBuilderProps = {}) {
  const [flow, setFlow] = useState<Flow>(() => getInitialFlow(businessHoursSchedule));
  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const findNode = useCallback((id: string) => {
    if (flow.root.id === id) return flow.root;
    for (const b of flow.root.branches) {
      const f = b.nodes.find(n => n.id === id);
      if (f) return f;
    }
    return null;
  }, [flow]);

  const updateNode = (updated: FlowNode) => {
    setDirty(true);
    if (flow.root.id === updated.id) {
      setFlow(prev => ({ ...prev, root: { ...prev.root, config: updated.config } }));
    } else {
      setFlow(prev => ({
        ...prev,
        root: {
          ...prev.root,
          branches: prev.root.branches.map(b => ({
            ...b,
            nodes: b.nodes.map(n => n.id === updated.id ? updated : n),
          })),
        },
      }));
    }
  };

  const removeNode = (id: string) => {
    setDirty(true);
    setFlow(prev => ({
      ...prev,
      root: { ...prev.root, branches: prev.root.branches.map(b => ({ ...b, nodes: b.nodes.filter(n => n.id !== id) })) },
    }));
    if (selected === id) setSelected(null);
  };

  const addNode = (type: string, branchIdx: number) => {
    setDirty(true);
    const meta = NODE_TYPES.find(t => t.type === type)!;
    let nodeName = meta.label;
    let target = undefined;

    // For ring_to nodes, use the first agent as default
    if (type === "ring_to" && AGENT_TARGETS.length > 0) {
      target = AGENT_TARGETS[0].id;
      nodeName = AGENT_TARGETS[0].name;
    }

    const nn: FlowNode = { id: mkId(), type, config: { name: nodeName, timeout: type === "ring_to" ? 20 : undefined, target } };
    setFlow(prev => ({
      ...prev,
      root: { ...prev.root, branches: prev.root.branches.map((b, i) => i === branchIdx ? { ...b, nodes: [...b.nodes, nn] } : b) },
    }));
  };

  const moveNode = (id: string, dir: "up" | "down") => {
    setDirty(true);
    setFlow(prev => ({
      ...prev,
      root: {
        ...prev.root,
        branches: prev.root.branches.map(b => {
          const idx = b.nodes.findIndex(n => n.id === id);
          if (idx < 0) return b;
          const ns = [...b.nodes];
          const swap = dir === "up" ? idx - 1 : idx + 1;
          if (swap < 0 || swap >= ns.length) return b;
          [ns[idx], ns[swap]] = [ns[swap], ns[idx]];
          return { ...b, nodes: ns };
        }),
      },
    }));
  };

  const selectedNode = selected ? findNode(selected) : null;
  const totalNodes = flow.root.branches.reduce((s, b) => s + b.nodes.length, 1);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#F8F9FB", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />

      <div style={{ height: 50, background: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Configuración IVR</span>
          {dirty && <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600, background: "#FFFBEB", padding: "2px 8px", borderRadius: 4 }}>Sin publicar</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{totalNodes} nodos · 2 ramas</span>
          <div style={{ height: 20, width: 1, background: "#E5E7EB" }} />
          <button onClick={() => setDirty(false)} style={{ padding: "6px 14px", background: "#03091D", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: dirty ? 1 : 0.5 }}>Publicar</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 60px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", background: "#fff", borderRadius: 18, border: "1.5px solid #E5E7EB" }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: "#03091D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Phone style={{ width: 12, height: 12, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>Llamada entrante</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                {flow.entryNumbers.map((num, i) => (
                  <span key={i} style={{ fontSize: 10.5, color: "#2563EB", fontWeight: 500 }}>{num}</span>
                ))}
              </div>
            </div>

            <Connector />

            <div style={{ width: 280 }}>
              <NodeCard node={flow.root} selected={selected === flow.root.id} onSelect={setSelected} onRemove={() => {}} onMoveUp={() => {}} onMoveDown={() => {}} isFirst isLast />
            </div>

            <div style={{ display: "flex", gap: 40, marginTop: 0, justifyContent: "center", width: "100%" }}>
              {flow.root.branches.map((branch, bi) => (
                <div key={branch.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 280 }}>
                  <Connector />
                  <div style={{ padding: "3px 14px", borderRadius: 10, background: branch.color + "14", border: `1px solid ${branch.color}33`, fontSize: 11, fontWeight: 700, color: branch.color }}>
                    {branch.label}
                  </div>

                  {branch.nodes.map((node, ni) => (
                    <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                      <Connector />
                      <div style={{ width: "100%" }}>
                        <NodeCard
                          node={node}
                          selected={selected === node.id}
                          onSelect={setSelected}
                          onRemove={removeNode}
                          onMoveUp={(id) => moveNode(id, "up")}
                          onMoveDown={(id) => moveNode(id, "down")}
                          isFirst={ni === 0}
                          isLast={ni === branch.nodes.length - 1}
                        />
                      </div>
                    </div>
                  ))}

                  <AddNodeBtn onAdd={(type) => addNode(type, bi)} />
                </div>
              ))}
            </div>

          </div>
        </div>

        {selectedNode && (
          <ConfigPanel node={selectedNode} onClose={() => setSelected(null)} onSave={updateNode} />
        )}
      </div>
    </div>
  );
}
