import { promises as fs } from 'fs';
import path from 'path';
import { createApiClient } from './supabase-api';

export type RoutingStep = {
  id: string;
  agentIdentity: string;
  ringSeconds: number;
  skipIfBusy: boolean;
  x?: number;
  y?: number;
};

export type RoutingFlowConfig = {
  name: string;
  flowKey: string;
  fallbackMode: 'voicemail' | 'ai';
  steps: RoutingStep[];
  updatedAt?: string;
};

export type AgentRoutingAssignment = {
  agentIdentity: string;
  flowKey: string;
  updatedAt?: string;
};

const DEFAULT_FLOW: RoutingFlowConfig = {
  name: 'Flujo principal',
  flowKey: 'default',
  fallbackMode: 'voicemail',
  steps: [
    {
      id: 'default-step-1',
      agentIdentity: 'agente_thinkia_com',
      ringSeconds: 20,
      skipIfBusy: true,
      x: 220,
      y: 260,
    },
    {
      id: 'default-step-2',
      agentIdentity: 'laura_soporte_thinkia_com',
      ringSeconds: 20,
      skipIfBusy: true,
      x: 440,
      y: 260,
    },
  ],
};

const STORE_PATH = path.join(process.cwd(), 'data', 'call-routing-flows.json');
const ASSIGNMENTS_STORE_PATH = path.join(process.cwd(), 'data', 'agent-routing-assignments.json');
const ASSIGNMENTS_FLOW_KEY = '__agent_assignments__';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function sanitizeFlow(input: RoutingFlowConfig): RoutingFlowConfig {
  return {
    name: input.name?.trim() || 'Flujo principal',
    flowKey: input.flowKey?.trim() || 'default',
    fallbackMode: input.fallbackMode === 'ai' ? 'ai' : 'voicemail',
    updatedAt: new Date().toISOString(),
    steps: (input.steps || [])
      .filter((s) => s?.agentIdentity)
      .map((s) => ({
        id: s.id || Math.random().toString(36).slice(2, 10),
        agentIdentity: s.agentIdentity.trim(),
        ringSeconds: Math.min(60, Math.max(5, Number(s.ringSeconds || 20))),
        skipIfBusy: !!s.skipIfBusy,
        x: Number.isFinite(Number(s.x)) ? Number(s.x) : undefined,
        y: Number.isFinite(Number(s.y)) ? Number(s.y) : undefined,
      })),
  };
}

async function readFileStore(): Promise<Record<string, RoutingFlowConfig>> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as Record<string, RoutingFlowConfig>;
  } catch {
    return {};
  }
}

async function writeFileStore(data: Record<string, RoutingFlowConfig>) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function readAssignmentFileStore(): Promise<Record<string, AgentRoutingAssignment>> {
  try {
    const raw = await fs.readFile(ASSIGNMENTS_STORE_PATH, 'utf8');
    return JSON.parse(raw) as Record<string, AgentRoutingAssignment>;
  } catch {
    return {};
  }
}

async function writeAssignmentFileStore(data: Record<string, AgentRoutingAssignment>) {
  await fs.mkdir(path.dirname(ASSIGNMENTS_STORE_PATH), { recursive: true });
  await fs.writeFile(ASSIGNMENTS_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function getRoutingFlowWithFallback(flowKey = 'default'): Promise<RoutingFlowConfig> {
  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_flows')
      .select('flow_key, name, fallback_mode, config, updated_at')
      .eq('flow_key', flowKey)
      .maybeSingle();

    if (data) {
      const cfg = (data.config || {}) as Partial<RoutingFlowConfig>;
      return sanitizeFlow({
        name: data.name || cfg.name || 'Flujo principal',
        flowKey: data.flow_key || flowKey,
        fallbackMode: (data.fallback_mode || cfg.fallbackMode || 'voicemail') as 'voicemail' | 'ai',
        steps: Array.isArray(cfg.steps) ? cfg.steps : [],
        updatedAt: data.updated_at || undefined,
      });
    }
  } catch {
    // Ignore and fallback to file
  }

  const store = await readFileStore();
  const fromFile = store[flowKey];
  if (fromFile) return sanitizeFlow(fromFile);
  return sanitizeFlow({ ...DEFAULT_FLOW, flowKey });
}

export async function saveRoutingFlowWithFallback(flow: RoutingFlowConfig): Promise<void> {
  const sanitized = sanitizeFlow(flow);

  let savedOnSupabase = false;
  let supabaseErrorMessage = '';
  try {
    const supabase = createApiClient();
    const { error } = await supabase.from('call_routing_flows').upsert(
      {
        flow_key: sanitized.flowKey,
        name: sanitized.name,
        fallback_mode: sanitized.fallbackMode,
        config: sanitized,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'flow_key' }
    );
    if (!error) {
      savedOnSupabase = true;
    } else {
      supabaseErrorMessage = error.message || 'Error desconocido guardando flujo en Supabase.';
    }
  } catch {
    savedOnSupabase = false;
    supabaseErrorMessage = 'No se pudo conectar con Supabase al guardar el flujo.';
  }

  if (!savedOnSupabase) {
    if (IS_PRODUCTION) {
      throw new Error(supabaseErrorMessage || 'No se pudo guardar el flujo en Supabase.');
    }
    try {
      const store = await readFileStore();
      store[sanitized.flowKey] = sanitized;
      await writeFileStore(store);
    } catch {
      throw new Error('No se pudo guardar el flujo en almacenamiento local.');
    }
  }
}

export async function listRoutingFlowsWithFallback(): Promise<RoutingFlowConfig[]> {
  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_flows')
      .select('flow_key, name, fallback_mode, config, updated_at')
      .order('updated_at', { ascending: false });

    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((row: any) => String(row?.flow_key || '') !== ASSIGNMENTS_FLOW_KEY)
        .map((row: any) =>
          sanitizeFlow({
            name: row.name || row.config?.name || 'Flujo principal',
            flowKey: row.flow_key || row.config?.flowKey || 'default',
            fallbackMode: (row.fallback_mode || row.config?.fallbackMode || 'voicemail') as 'voicemail' | 'ai',
            steps: Array.isArray(row.config?.steps) ? row.config.steps : [],
            updatedAt: row.updated_at || undefined,
          })
        );
    }
  } catch {
    // ignore and fallback to file
  }

  const store = await readFileStore();
  const items = Object.entries(store)
    .filter(([key]) => key !== ASSIGNMENTS_FLOW_KEY)
    .map(([, f]) => sanitizeFlow(f));
  if (items.length === 0) return [sanitizeFlow(DEFAULT_FLOW)];
  return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function getAgentRoutingAssignmentWithFallback(agentIdentity: string): Promise<string | null> {
  const identity = agentIdentity.trim();
  if (!identity) return null;

  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_agent_assignments')
      .select('agent_identity, flow_key')
      .eq('agent_identity', identity)
      .maybeSingle();
    if (data?.flow_key) return String(data.flow_key);
  } catch {
    // ignore and fallback to file
  }

  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_flows')
      .select('config')
      .eq('flow_key', ASSIGNMENTS_FLOW_KEY)
      .maybeSingle();
    const map = (data?.config?.assignments || {}) as Record<string, string>;
    if (map[identity]) return String(map[identity]);
  } catch {
    // ignore and fallback to file
  }

  const store = await readAssignmentFileStore();
  return store[identity]?.flowKey || null;
}

export async function listAgentRoutingAssignmentsWithFallback(): Promise<AgentRoutingAssignment[]> {
  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_agent_assignments')
      .select('agent_identity, flow_key, updated_at')
      .order('updated_at', { ascending: false });
    if (Array.isArray(data)) {
      return data
        .filter((row: any) => row?.agent_identity && row?.flow_key)
        .map((row: any) => ({
          agentIdentity: String(row.agent_identity),
          flowKey: String(row.flow_key),
          updatedAt: row.updated_at || undefined,
        }));
    }
  } catch {
    // ignore and fallback to file
  }

  try {
    const supabase = createApiClient();
    const { data } = await supabase
      .from('call_routing_flows')
      .select('config, updated_at')
      .eq('flow_key', ASSIGNMENTS_FLOW_KEY)
      .maybeSingle();
    const map = (data?.config?.assignments || {}) as Record<string, string>;
    const updatedAt = data?.updated_at || undefined;
    const fromMap = Object.entries(map)
      .filter(([agentIdentity, flowKey]) => !!agentIdentity && !!flowKey)
      .map(([agentIdentity, flowKey]) => ({
        agentIdentity,
        flowKey,
        updatedAt,
      }));
    if (fromMap.length > 0) return fromMap;
  } catch {
    // ignore and fallback to file
  }

  const store = await readAssignmentFileStore();
  return Object.values(store).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function saveAgentRoutingAssignmentWithFallback(agentIdentity: string, flowKey: string): Promise<void> {
  const identity = agentIdentity.trim();
  const key = flowKey.trim();
  if (!identity || !key) return;

  let savedOnSupabase = false;
  let supabaseErrorMessage = '';
  try {
    const supabase = createApiClient();
    const { error } = await supabase.from('call_routing_agent_assignments').upsert(
      {
        agent_identity: identity,
        flow_key: key,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'agent_identity' }
    );
    if (!error) {
      savedOnSupabase = true;
    } else {
      supabaseErrorMessage = error.message || 'Error desconocido guardando asignacion en Supabase.';
    }
  } catch {
    savedOnSupabase = false;
    supabaseErrorMessage = 'No se pudo conectar con Supabase al guardar la asignacion.';
  }

  if (!savedOnSupabase) {
    try {
      const supabase = createApiClient();
      const { data } = await supabase
        .from('call_routing_flows')
        .select('config')
        .eq('flow_key', ASSIGNMENTS_FLOW_KEY)
        .maybeSingle();
      const map = ((data?.config?.assignments || {}) as Record<string, string>) || {};
      map[identity] = key;
      const { error } = await supabase.from('call_routing_flows').upsert(
        {
          flow_key: ASSIGNMENTS_FLOW_KEY,
          name: 'Asignaciones por agente',
          fallback_mode: 'voicemail',
          config: { assignments: map },
          is_active: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'flow_key' }
      );
      if (!error) {
        savedOnSupabase = true;
      } else {
        supabaseErrorMessage = error.message || 'No se pudo persistir asignacion en fallback SQL.';
      }
    } catch {
      savedOnSupabase = false;
      if (!supabaseErrorMessage) {
        supabaseErrorMessage = 'No se pudo conectar con Supabase para fallback SQL de asignaciones.';
      }
    }
  }

  if (!savedOnSupabase) {
    if (IS_PRODUCTION) {
      throw new Error(supabaseErrorMessage || 'No se pudo guardar la asignacion en Supabase.');
    }
    try {
      const store = await readAssignmentFileStore();
      store[identity] = {
        agentIdentity: identity,
        flowKey: key,
        updatedAt: new Date().toISOString(),
      };
      await writeAssignmentFileStore(store);
    } catch {
      throw new Error('No se pudo guardar la asignacion en almacenamiento local.');
    }
  }
}

