import twilio from "twilio";
import { createApiClient } from "./supabase-api";

type CallMetaRow = {
  call_sid?: string | null;
  handler?: string | null;
  reason?: string | null;
  agent_identity?: string | null;
};

/** Campos mínimos de Recording de Twilio para enlazar con Call SID. */
type RecordingItem = { sid: string; callSid?: string | null };

function envTwilio(name: "TWILIO_ACCOUNT_SID" | "TWILIO_API_KEY" | "TWILIO_API_SECRET") {
  return (process.env[name] ?? "").trim();
}

export async function getCallLogs(limit = 50) {
  const safeLimit = Math.min(1000, Math.max(1, Math.floor(Number(limit)) || 50));
  try {
    const accountSid = envTwilio("TWILIO_ACCOUNT_SID");
    const apiKey = envTwilio("TWILIO_API_KEY");
    const apiSecret = envTwilio("TWILIO_API_SECRET");

    if (!accountSid || !apiKey || !apiSecret) {
      throw new Error("Faltan TWILIO_ACCOUNT_SID, TWILIO_API_KEY o TWILIO_API_SECRET en el servidor.");
    }

    if (!accountSid.startsWith("AC")) {
      throw new Error("TWILIO_ACCOUNT_SID debe empezar por AC (Account SID de la consola).");
    }

    const client = twilio(apiKey, apiSecret, { accountSid });
    const calls = await client.calls.list({ limit: safeLimit });
    console.log("[TWILIO_CALLS_LIST]", {
      count: calls.length,
      accountSuffix: accountSid.slice(-6),
      limit: safeLimit,
    });

    let recordings: RecordingItem[] = [];
    try {
      recordings = (await client.recordings.list({ limit: safeLimit })) as RecordingItem[];
    } catch (recErr) {
      console.error("[TWILIO_RECORDINGS]", recErr);
    }

    let metaRows: CallMetaRow[] = [];
    try {
      const supabase = createApiClient();
      const { data: metadata, error: metaError } = await supabase.from("call_metadata").select("*");
      if (metaError) console.error("[METADATA_ERROR]", metaError);
      metaRows = (metadata ?? []) as CallMetaRow[];
    } catch (metaErr) {
      console.error("[SUPABASE_METADATA]", metaErr);
    }

    const mappedTwilio = calls.map((c) => {
      const rec = recordings.find((r) => r.callSid === c.sid);
      const recordingUrl = rec ? `/api/voice/recording/${rec.sid}` : null;
      const meta = metaRows.find((m) => String(m.call_sid ?? "").trim() === c.sid.trim());
      return {
        sid: c.sid,
        from: c.from,
        to: c.to,
        status: c.status,
        startTime: c.startTime ? c.startTime.toISOString() : null,
        duration: c.duration,
        direction: c.direction,
        recordingUrl,
        recordingSid: rec ? rec.sid : null,
        handler: meta?.handler || "human",
        reason: meta?.reason || null,
        agentIdentity: meta?.agent_identity ? String(meta.agent_identity) : null,
      };
    });

    let mappedEleven: Array<(typeof mappedTwilio)[number]> = [];
    const elevenKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    if (elevenKey) {
      try {
        const aiRes = await fetch("https://api.elevenlabs.io/v1/convai/conversations", {
          headers: { "xi-api-key": elevenKey },
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          mappedEleven = (aiData.conversations || []).map((c: Record<string, unknown>) => ({
            sid: c.conversation_id,
            from: "ElevenLabs AI",
            to: c.agent_name || "Agente IA",
            status: c.status === "done" ? "completed" : c.status,
            startTime: c.start_time_unix_secs
              ? new Date((c.start_time_unix_secs as number) * 1000).toISOString()
              : null,
            duration: String(c.call_duration_secs ?? "0"),
            direction: "inbound",
            recordingUrl: `/api/voice/recording/${c.conversation_id}`,
            recordingSid: c.conversation_id,
            handler: "ai",
            reason: c.call_summary_title || "Conversación IA",
            agentIdentity: null,
          }));
        }
      } catch (err) {
        console.error("Error fetching ElevenLabs calls:", err);
      }
    }

    return [...mappedTwilio, ...mappedEleven].sort((a, b) => {
      const da = a.startTime ? new Date(a.startTime).getTime() : 0;
      const db = b.startTime ? new Date(b.startTime).getTime() : 0;
      return db - da;
    });
  } catch (error) {
    console.error("Error fetching Twilio calls:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}
