import twilio from "twilio";
import { createApiClient } from "./supabase-api";
import { getAgentRoutingAssignmentWithFallback, getRoutingFlowWithFallback } from "./routing-store";
import { addRoutingEvent } from "./routing-events-store";
import { checkCurrentAvailability, getAgentSettings } from "./availability-service";

type RoutingStep = { id: string; agentIdentity: string; ringSeconds: number; skipIfBusy: boolean };
type RoutingFlowConfig = { fallbackMode: "voicemail" | "ai"; steps: RoutingStep[] };

function prioritizeAgentInFlow(flow: RoutingFlowConfig, ownerIdentity: string): RoutingFlowConfig {
  if (!ownerIdentity) return flow;
  const cleanOwner = ownerIdentity.trim();
  if (!cleanOwner) return flow;

  const ownerStep =
    flow.steps.find((step) => step.agentIdentity === cleanOwner) || {
      id: `owner-first-${Date.now()}`,
      agentIdentity: cleanOwner,
      ringSeconds: 20,
      skipIfBusy: true,
    };

  const reordered = [ownerStep, ...flow.steps.filter((step) => step.agentIdentity !== cleanOwner)];
  const seen = new Set<string>();
  const deduped = reordered.filter((step) => {
    const key = step.agentIdentity.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { ...flow, steps: deduped };
}

function getAssignedAgentIdentities(toNumber: string): string[] {
  const defaultAgents = ["agente_thinkia_com", "laura_soporte_thinkia_com", "manuelvegas279_gmail_com"];
  const mapRaw = process.env.INBOUND_NUMBER_AGENT_MAP;
  if (mapRaw && toNumber) {
    try {
      const parsed = JSON.parse(mapRaw) as Record<string, string[] | string>;
      const directMatch = parsed[toNumber];
      if (Array.isArray(directMatch) && directMatch.length > 0) return directMatch;
      if (typeof directMatch === "string" && directMatch.trim()) return [directMatch.trim()];
    } catch (err) {
      console.error("[VOICE_ROUTING] Invalid INBOUND_NUMBER_AGENT_MAP JSON:", err);
    }
  }
  const listRaw = process.env.INBOUND_AGENT_IDENTITIES;
  if (listRaw) {
    const list = listRaw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return defaultAgents;
}

async function getElevenLabsTwiML(agentId: string, apiKey: string, fromNumber: string, toNumber: string) {
  try {
    const validFrom = fromNumber.startsWith("client:") || !fromNumber ? "+15073352716" : fromNumber;
    const validTo = toNumber.startsWith("client:") || toNumber === "AI" || !toNumber ? "+15073352717" : toNumber;

    const res = await fetch(`https://api.elevenlabs.io/v1/convai/twilio/register-call`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, from_number: validFrom, to_number: validTo }),
    });

    if (!res.ok) {
      console.error("ElevenLabs API error:", await res.text());
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error("Fetch to ElevenLabs failed:", err);
    return null;
  }
}

function parsePresenceFromOfflineMessage(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(raw) as { __presence?: string };
    return parsed.__presence || null;
  } catch {
    return null;
  }
}

async function getActiveRoutingFlow(toNumber: string, fallbackIdentities: string[]): Promise<RoutingFlowConfig> {
  try {
    const firstIdentity = fallbackIdentities[0];
    if (firstIdentity) {
      const assignedFlowKey = await getAgentRoutingAssignmentWithFallback(firstIdentity);
      if (assignedFlowKey) {
        const byAgentAssignment = await getRoutingFlowWithFallback(assignedFlowKey);
        if (byAgentAssignment.steps.length > 0) {
          return prioritizeAgentInFlow(
            { fallbackMode: byAgentAssignment.fallbackMode, steps: byAgentAssignment.steps },
            firstIdentity
          );
        }
      }
    }

    const byNumber = await getRoutingFlowWithFallback(toNumber);
    if (byNumber.steps.length > 0) return { fallbackMode: byNumber.fallbackMode, steps: byNumber.steps };
    const byDefault = await getRoutingFlowWithFallback("default");
    if (byDefault.steps.length > 0) return { fallbackMode: byDefault.fallbackMode, steps: byDefault.steps };
  } catch (err) {
    console.error("[VOICE_ROUTING] Error loading flow:", err);
  }

  return {
    fallbackMode: "voicemail",
    steps: fallbackIdentities.map((id, idx) => ({
      id: `fallback-${idx}`,
      agentIdentity: id,
      ringSeconds: 20,
      skipIfBusy: true,
    })),
  };
}

export async function handleVoicePost(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const to = params.get("To") || "";
    const from = params.get("From") || "";

    const agentId = process.env.ELEVENLABS_AGENT_ID || "";
    const elevenApiKey = process.env.ELEVENLABS_API_KEY || "";

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    const isTestAI = url.searchParams.get("testAI") === "true";
    const forceInbound = url.searchParams.get("forceInbound") === "true";

    if (to && to.startsWith("client:") && !forceInbound) {
      if (isTestAI && agentId && elevenApiKey) {
        const aiTwiml = await getElevenLabsTwiML(agentId, elevenApiKey, from, to);
        if (aiTwiml) return new Response(aiTwiml, { headers: { "Content-Type": "text/xml" } });
        twiml.say({ language: "es-ES" }, "Error en servidor IA.");
        return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
      }

      const dial = twiml.dial({ record: "record-from-ringing-dual", recordingStatusCallback: "/api/voice/recording" });
      dial.client(to.replace("client:", ""));
    } else if (from && from.startsWith("client:")) {
      if (to === "AI") {
        if (!agentId || !elevenApiKey) {
          twiml.say({ language: "es-ES" }, "La integración de IA no está configurada en este entorno.");
          return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
        }
        const aiTwiml = await getElevenLabsTwiML(agentId, elevenApiKey, from, to);
        if (aiTwiml) return new Response(aiTwiml, { headers: { "Content-Type": "text/xml" } });
        twiml.say({ language: "es-ES" }, "No se pudo conectar con la IA.");
      } else if (to) {
        const callerId =
          process.env.TWILIO_CALLER_ID || process.env.TWILIO_FROM_NUMBER || "+15073352716";
        twiml
          .dial({
            callerId,
            record: "record-from-ringing-dual",
            recordingStatusCallback: "/api/voice/recording",
          })
          .number(to);
      }
    } else if (forceInbound || !to.startsWith("client:")) {
      const identitiesToCheck = getAssignedAgentIdentities(to);
      const routingFlow = await getActiveRoutingFlow(to, identitiesToCheck);
      let routedAnyAgent = false;
      let lastOfflineMessage = "";
      const stepTrace: Array<{
        agentIdentity: string;
        available: boolean;
        skippedByBusy: boolean;
        routed: boolean;
        reason: string;
      }> = [];
      let selectedAgent: string | null = null;

      for (const step of routingFlow.steps) {
        const id = step.agentIdentity;
        if (!id) continue;

        const availability = await checkCurrentAvailability(id);
        if (!availability.available) {
          const settings = await getAgentSettings(id);
          lastOfflineMessage = (settings.offline_message as string) || lastOfflineMessage;
          stepTrace.push({
            agentIdentity: id,
            available: false,
            skippedByBusy: false,
            routed: false,
            reason: availability.reason || "No disponible",
          });
          continue;
        }

        const settings = await getAgentSettings(id);
        const presence = parsePresenceFromOfflineMessage(settings.offline_message as string);
        const isBusyLike = presence === "busy" || presence === "dnd";
        if (step.skipIfBusy && isBusyLike) {
          stepTrace.push({
            agentIdentity: id,
            available: true,
            skippedByBusy: true,
            routed: false,
            reason: "Saltado por ocupado/DND",
          });
          continue;
        }

        const dial = twiml.dial({
          timeout: Math.min(60, Math.max(5, Number(step.ringSeconds || 20))),
          record: "record-from-answer-dual",
          recordingStatusCallback: "/api/voice/recording",
        });
        dial.client(id);
        routedAnyAgent = true;
        if (!selectedAgent) selectedAgent = id;
        stepTrace.push({
          agentIdentity: id,
          available: true,
          skippedByBusy: false,
          routed: true,
          reason: "Ruteado",
        });
      }

      const callSid = params.get("CallSid")?.trim() || `sim_${Date.now()}`;

      if (routedAnyAgent) {
        await addRoutingEvent({
          id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          callSid,
          from,
          to,
          selectedAgent,
          fallbackUsed: "none",
          steps: stepTrace,
        }).catch(() => null);
        return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
      }

      if (callSid) {
        const supabase = createApiClient();
        await supabase.from("call_metadata").insert({
          call_sid: callSid,
          handler: "blocked",
          reason: "Sin agentes disponibles en flujo de enrutamiento",
          agent_identity: routingFlow.steps[0]?.agentIdentity || identitiesToCheck[0] || "unknown",
        });
      }

      if (routingFlow.fallbackMode === "ai" && agentId && elevenApiKey) {
        const aiTwiml = await getElevenLabsTwiML(agentId, elevenApiKey, from, to);
        if (aiTwiml) {
          await addRoutingEvent({
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            callSid,
            from,
            to,
            selectedAgent: null,
            fallbackUsed: "ai",
            steps: stepTrace,
          }).catch(() => null);
          return new Response(aiTwiml, { headers: { "Content-Type": "text/xml" } });
        }
      }

      await addRoutingEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        callSid,
        from,
        to,
        selectedAgent: null,
        fallbackUsed: "voicemail",
        steps: stepTrace,
      }).catch(() => null);

      twiml.say({ language: "es-ES" }, lastOfflineMessage || "Lo sentimos, no estamos disponibles ahora.");
      twiml.pause({ length: 1 });
      twiml.say({ language: "es-ES" }, "Dejenos su mensaje y le devolveremos la llamada.");
      twiml.record({ maxLength: 30, recordingStatusCallback: "/api/voice/recording" });

      return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
    }

    return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
  } catch {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "es-ES" }, "Error en la centralita.");
    return new Response(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
  }
}
