import { createApiClient } from "./supabase-api";

export type BlockedPeriod = { id: string; label: string; start: string; end: string };
type PresenceStatus = "available" | "busy" | "dnd" | "brb" | "away";

function parsePresencePayload(raw: string | null | undefined): { presence?: PresenceStatus; offlineMessage?: string } {
  if (!raw) return {};
  try {
    if (!raw.startsWith("{")) return { offlineMessage: raw };
    const parsed = JSON.parse(raw) as { __presence?: PresenceStatus; __offlineMessage?: string };
    return { presence: parsed.__presence, offlineMessage: parsed.__offlineMessage ?? "" };
  } catch {
    return { offlineMessage: raw };
  }
}

export async function getAgentSettings(identity: string) {
  const supabase = createApiClient();
  const { data, error } = await supabase.from("agent_settings").select("*").eq("identity", identity).single();

  if (error || !data) {
    return {
      identity,
      is_available: true,
      blocked_periods: [] as BlockedPeriod[],
      offline_message: "Lo sentimos, el agente no está disponible en este momento.",
    };
  }
  return data;
}

export async function updateAgentStatus(
  identity: string,
  isAvailable: boolean,
  offlineMessage?: string,
  agentStatus?: string
) {
  const supabase = createApiClient();

  const { data: existing } = await supabase.from("agent_settings").select("offline_message").eq("identity", identity).maybeSingle();

  const currentPayload = parsePresencePayload(existing?.offline_message);
  const nextPresence =
    (agentStatus as PresenceStatus | undefined) ?? currentPayload.presence ?? (isAvailable ? "available" : "busy");
  const nextOfflineMessage = offlineMessage ?? currentPayload.offlineMessage ?? "";

  const updateData: Record<string, unknown> = {
    identity,
    is_available: isAvailable,
    offline_message: JSON.stringify({
      __presence: nextPresence,
      __offlineMessage: nextOfflineMessage,
    }),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("agent_settings").upsert(updateData, { onConflict: "identity" });
  if (error) throw new Error("No se pudo actualizar la disponibilidad.");
  return { success: true };
}

export async function getAllAgents() {
  const supabase = createApiClient();
  const { data, error } = await supabase.from("agent_settings").select("*").order("identity", { ascending: true });
  if (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
  return data ?? [];
}

export async function checkCurrentAvailability(identity: string): Promise<{ available: boolean; reason?: string }> {
  const settings = await getAgentSettings(identity);

  if (!settings.is_available) {
    return { available: false, reason: "Manual Toggle: Offline" };
  }

  if (!settings.blocked_periods || settings.blocked_periods.length === 0) {
    return { available: true };
  }

  const nowMs = Date.now();
  const activeBlock = settings.blocked_periods.find((block: BlockedPeriod) => {
    const startTime = new Date(block.start).getTime();
    const endTime = new Date(block.end).getTime();
    return nowMs >= startTime && nowMs <= endTime;
  });

  if (activeBlock) {
    return { available: false, reason: `Bloqueado por calendario: ${activeBlock.label}` };
  }

  return { available: true };
}
