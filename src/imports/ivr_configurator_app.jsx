import { useState, useCallback, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NODE_TYPES = [
  { type: "time_rule", icon: "🕐", label: "Regla de tiempo", color: "#6366F1", desc: "Define horarios de atención" },
  { type: "date_rule", icon: "📅", label: "Regla de fecha", color: "#6366F1", desc: "Festivos y excepciones" },
  { type: "audio_message", icon: "▶", label: "Mensaje de audio", color: "#10B981", desc: "Bienvenida, avisos, locuciones" },
  { type: "standard_ivr", icon: "⊞", label: "IVR estándar", color: "#6366F1", desc: "Menú con teclas 1, 2, 3…" },
  { type: "waiting", icon: "⏳", label: "Experiencia de espera", color: "#10B981", desc: "Música + mensajes en cola" },
  { type: "ring_to", icon: "📞", label: "Ring to", color: "#0EA5E9", desc: "Llamar a agente o grupo" },
  { type: "voicemail", icon: "📩", label: "Buzón de voz", color: "#EF4444", desc: "El paciente deja mensaje" },
  { type: "redirect", icon: "↗", label: "Redirect to", color: "#0EA5E9", desc: "Transferir a otro número" },
  { type: "ai_agent", icon: "✦", label: "AI Voice Agent", color: "#F59E0B", desc: "Agente IA conversacional", tag: "Nuevo" },
];

const PRESETS = {
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
    { id: "v2", name: "Equilibrado", dur: "~20 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento no podemos atenderle. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada y nos pondremos en contacto con usted lo antes posible. Si tiene alguna incidencia con su máquina, contacte con el número XXXX.", rec: "best" },
    { id: "v3", name: "Empático", dur: "~25 seg", text: "Gracias por llamar a Fresenius Medical Care. Sentimos no poder atenderle en este momento. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada, especialmente si está relacionado con su tratamiento o equipo, y le llamaremos lo antes posible. Si tiene una incidencia con su máquina, por favor contacte con el número XXXX.", rec: "best" },
    { id: "v4", name: "Corto y directo", dur: "~15 seg", text: "Gracias por llamar a Fresenius Medical Care. No podemos atenderle en este momento. Nuestro horario es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Deje su nombre y teléfono tras la señal. Para incidencias con su máquina, llame al XXXX." },
    { id: "v5", name: "Premium", dur: "~25 seg", text: "Gracias por contactar con Fresenius Medical Care. En este momento no podemos atenderle, pero queremos ayudarle lo antes posible. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Por favor, deje su nombre, teléfono y el motivo de su llamada y nos pondremos en contacto con usted a la mayor brevedad. Si tiene alguna incidencia con su máquina, contacte con el número XXXX." },
    { id: "v6", name: "Enfoque incidencias", dur: "~25 seg", text: "Gracias por llamar a Fresenius Medical Care. En este momento no podemos atenderle. Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 horas y los viernes de 8:00 a 15:00 horas. Si su llamada está relacionada con una incidencia de su equipo o tratamiento, por favor indíquelo en su mensaje junto con su nombre y teléfono. Para incidencias urgentes con su máquina, contacte con el número XXXX." },
  ],
};

const MUSIC_OPTIONS = ["Ringing Tone (Europe)", "Instrumental suave", "Ambiente clínico", "Solo mensajes (sin música)", "Audio personalizado…"];
const AGENT_TARGETS = [
  { id: "g1", name: "Grupo principal", agents: 4 },
  { id: "g2", name: "Cola general", agents: 8 },
  { id: "a1", name: "María López", role: "Agente" },
  { id: "a2", name: "Carlos Ruiz", role: "Agente" },
  { id: "a3", name: "Enfermera 1", role: "Clínico" },
  { id: "a4", name: "Enfermera 2", role: "Clínico" },
  { id: "a5", name: "Sandra V.", role: "Supervisora" },
];

const mkId = () => "n" + Math.random().toString(36).slice(2, 8);

const INITIAL_FLOW = {
  entryNumbers: ["91 327 66 64", "900 12 19 89"],
  root: {
    id: "root", type: "time_rule",
    config: { name: "Horario laboral", schedules: [
      { days: "L-J", from: "08:00", to: "17:00" },
      { days: "V", from: "08:00", to: "15:00" },
    ]},
    branches: [
      { id: "b_in", label: "En horario", color: "#10B981", nodes: [
        { id: "n_welcome", type: "audio_message", config: { name: "Bienvenida", preset: "eq" } },
        { id: "n_wait", type: "waiting", config: { name: "Experiencia de espera", preset: "e2", music: "Ringing Tone (Europe)", showQueue: true } },
        { id: "n_a1", type: "ring_to", config: { name: "Agente 1", target: "g1", timeout: 15 } },
        { id: "n_a2", type: "ring_to", config: { name: "Agente 2", target: "g2", timeout: 15 } },
        { id: "n_vm1", type: "voicemail", config: { name: "Buzón de voz", preset: "v2" } },
      ]},
      { id: "b_out", label: "Fuera de horario", color: "#F59E0B", nodes: [
        { id: "n_fh_msg", type: "audio_message", config: { name: "Mensaje fuera de horario", preset: "corp" } },
        { id: "n_fh_vm", type: "voicemail", config: { name: "Buzón fuera de horario", preset: "v3" } },
      ]},
    ],
  },
};

// ─── Micro-components ────────────────────────────────────────────────────────

function Badge({ text, color }) {
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", borderRadius: 4, background: color + "18", color }}>{text}</span>;
}

function RecBadge({ rec }) {
  if (!rec) return null;
  const m = { best: { t: "Muy recomendada", c: "#059669" }, good: { t: "Recomendada", c: "#0284C7" } };
  const d = m[rec];
  return d ? <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: d.c + "14", color: d.c, marginLeft: 6 }}>{d.t}</span> : null;
}

function Connector({ short }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: 1.5, height: short ? 10 : 18, background: "#D1D5DB" }} />
      <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #D1D5DB" }} />
    </div>
  );
}

function AddNodeBtn({ onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
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
            {NODE_TYPES.map(nt => (
              <div key={nt.type} onClick={() => { onAdd(nt.type); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                transition: "background .1s",
              }} onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: nt.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{nt.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1F2937", display: "flex", alignItems: "center", gap: 4 }}>
                    {nt.label}{nt.tag && <Badge text={nt.tag} color="#D97706" />}
                  </div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Node card ───────────────────────────────────────────────────────────────

function NodeCard({ node, selected, onSelect, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const meta = NODE_TYPES.find(t => t.type === node.type) || NODE_TYPES[0];
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div onClick={() => onSelect(node.id)} style={{
        display: "flex", alignItems: "center", gap: 11, padding: "10px 13px",
        background: selected ? "#F0FDFA" : "#fff",
        border: selected ? "2px solid #0D9488" : "1.5px solid #E5E7EB",
        borderRadius: 10, cursor: "pointer", transition: "all .12s",
        boxShadow: selected ? "0 0 0 3px #0D948818" : "0 1px 3px rgba(0,0,0,.04)",
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{node.config.name}</div>
          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>{meta.label}{node.config.timeout ? ` · ${node.config.timeout}s` : ""}</div>
        </div>
        {node.type === "ai_agent" && <Badge text="AI" color="#D97706" />}
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

function ConfigPanel({ node, onClose, onSave }) {
  const meta = NODE_TYPES.find(t => t.type === node.type);
  const [cfg, setCfg] = useState({ ...node.config });
  const presets = PRESETS[node.type];
  const up = (k, v) => setCfg(prev => ({ ...prev, [k]: v }));

  const Label = ({ children }) => <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, marginTop: 18 }}>{children}</div>;
  const Input = ({ value, onChange, ...props }) => <input value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none", transition: "border .15s" }} onFocus={e => e.target.style.borderColor = meta.color} onBlur={e => e.target.style.borderColor = "#E5E7EB"} {...props} />;

  return (
    <div style={{ width: 360, background: "#fff", borderLeft: "1px solid #E5E7EB", height: "100%", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>{meta.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{meta.label}</div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{meta.desc}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9CA3AF", padding: 4 }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 24px" }}>
        <Label>Nombre</Label>
        <Input value={cfg.name} onChange={v => up("name", v)} />

        {/* Time rule */}
        {node.type === "time_rule" && cfg.schedules && (
          <>
            <Label>Horarios</Label>
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 12, border: "1px solid #F3F4F6" }}>
              {cfg.schedules.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: i < cfg.schedules.length - 1 ? 8 : 0 }}>
                  <input value={s.days} onChange={e => { const ns = [...cfg.schedules]; ns[i] = { ...s, days: e.target.value }; up("schedules", ns); }} style={{ width: 44, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                  <input value={s.from} onChange={e => { const ns = [...cfg.schedules]; ns[i] = { ...s, from: e.target.value }; up("schedules", ns); }} style={{ width: 56, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>–</span>
                  <input value={s.to} onChange={e => { const ns = [...cfg.schedules]; ns[i] = { ...s, to: e.target.value }; up("schedules", ns); }} style={{ width: 56, padding: "5px 6px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit", textAlign: "center" }} />
                </div>
              ))}
              <button onClick={() => up("schedules", [...cfg.schedules, { days: "S", from: "09:00", to: "13:00" }])} style={{ marginTop: 8, background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>+ Añadir horario</button>
            </div>
          </>
        )}

        {/* Ring to / Redirect */}
        {(node.type === "ring_to" || node.type === "redirect") && (
          <>
            <Label>Destino</Label>
            <select value={cfg.target || ""} onChange={e => up("target", e.target.value)} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              {AGENT_TARGETS.map(a => <option key={a.id} value={a.id}>{a.name}{a.role ? ` (${a.role})` : ""}{a.agents ? ` — ${a.agents} agentes` : ""}</option>)}
            </select>
            <Label>Timeout (segundos)</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min={5} max={60} step={5} value={cfg.timeout || 15} onChange={e => up("timeout", Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 42, textAlign: "right" }}>{cfg.timeout || 15}s</span>
            </div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 3 }}>Si no responde, pasa al siguiente nodo del flujo</div>
          </>
        )}

        {/* Waiting experience */}
        {node.type === "waiting" && (
          <>
            <Label>Música de espera</Label>
            <select value={cfg.music || MUSIC_OPTIONS[0]} onChange={e => up("music", e.target.value)} style={{ width: "100%", padding: "8px 11px", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
              {MUSIC_OPTIONS.map(m => <option key={m}>{m}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "10px 0", borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>Informar posición en cola</div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Tiempo estimado de espera</div>
              </div>
              <div onClick={() => up("showQueue", !cfg.showQueue)} style={{
                width: 38, height: 20, borderRadius: 10, background: cfg.showQueue ? "#0D9488" : "#D1D5DB",
                cursor: "pointer", transition: "background .2s", position: "relative", flexShrink: 0,
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", top: 2, left: cfg.showQueue ? 20 : 2, transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,.12)" }} />
              </div>
            </div>
          </>
        )}

        {/* AI agent */}
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

        {/* IVR estándar */}
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
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "#6366F1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{opt.key}</div>
                  <input defaultValue={opt.label} style={{ flex: 1, padding: "5px 8px", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: 12, fontFamily: "inherit" }} />
                </div>
              ))}
              <button style={{ marginTop: 4, background: "none", border: "1px dashed #D1D5DB", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>+ Añadir opción</button>
            </div>
          </>
        )}

        {/* Message presets */}
        {presets && (
          <>
            <Label>Mensaje</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {presets.map(p => (
                <div key={p.id} onClick={() => up("preset", p.id)} style={{
                  padding: "9px 11px", borderRadius: 8,
                  border: cfg.preset === p.id ? `2px solid ${meta.color}` : "1.5px solid #E5E7EB",
                  background: cfg.preset === p.id ? meta.color + "08" : "#fff",
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
            <button style={{ marginTop: 8, width: "100%", padding: "8px", border: "1.5px dashed #D1D5DB", borderRadius: 8, background: "transparent", fontSize: 11.5, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}>+ Subir audio personalizado</button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => { onSave({ ...node, config: cfg }); onClose(); }} style={{
          flex: 1, padding: "9px", background: meta.color, color: "#fff", border: "none", borderRadius: 8,
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

export default function IVRFlowBuilder() {
  const [flow, setFlow] = useState(INITIAL_FLOW);
  const [selected, setSelected] = useState(null);
  const [dirty, setDirty] = useState(false);

  const findNode = useCallback((id) => {
    if (flow.root.id === id) return flow.root;
    for (const b of flow.root.branches) {
      const f = b.nodes.find(n => n.id === id);
      if (f) return f;
    }
    return null;
  }, [flow]);

  const updateNode = (updated) => {
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

  const removeNode = (id) => {
    setDirty(true);
    setFlow(prev => ({
      ...prev,
      root: { ...prev.root, branches: prev.root.branches.map(b => ({ ...b, nodes: b.nodes.filter(n => n.id !== id) })) },
    }));
    if (selected === id) setSelected(null);
  };

  const addNode = (type, branchIdx) => {
    setDirty(true);
    const meta = NODE_TYPES.find(t => t.type === type);
    const nn = { id: mkId(), type, config: { name: meta.label, timeout: type === "ring_to" ? 15 : undefined } };
    setFlow(prev => ({
      ...prev,
      root: { ...prev.root, branches: prev.root.branches.map((b, i) => i === branchIdx ? { ...b, nodes: [...b.nodes, nn] } : b) },
    }));
  };

  const moveNode = (id, dir) => {
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

      {/* Top bar */}
      <div style={{ height: 50, background: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#1B2A4A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>F</div>
          <div style={{ height: 20, width: 1, background: "#E5E7EB" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Configurador IVR</span>
          {dirty && <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600, background: "#FFFBEB", padding: "2px 8px", borderRadius: 4 }}>Sin publicar</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{totalNodes} nodos · 2 ramas</span>
          <div style={{ height: 20, width: 1, background: "#E5E7EB" }} />
          <button style={{ padding: "6px 14px", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>Vista previa</button>
          <button onClick={() => setDirty(false)} style={{ padding: "6px 14px", background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: dirty ? 1 : 0.5 }}>Publicar</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 60px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Entry */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", background: "#fff", borderRadius: 18, border: "1.5px solid #E5E7EB" }}>
              <span style={{ fontSize: 15 }}>📞</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>Llamada entrante</span>
              <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>{flow.entryNumbers.join(" / ")}</span>
            </div>

            <Connector />

            {/* Root node (time rule) */}
            <div style={{ width: 280 }}>
              <NodeCard node={flow.root} selected={selected === flow.root.id} onSelect={setSelected} onRemove={() => {}} onMoveUp={() => {}} onMoveDown={() => {}} isFirst isLast />
            </div>

            {/* Branches */}
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

        {/* Side panel */}
        {selectedNode && (
          <ConfigPanel node={selectedNode} onClose={() => setSelected(null)} onSave={updateNode} />
        )}
      </div>
    </div>
  );
}
