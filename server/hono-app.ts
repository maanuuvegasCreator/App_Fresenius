import { Hono } from "hono";
import { cors } from "hono/cors";
import twilio from "twilio";
import { getCallLogs } from "./twilio-call-logs";
import { getAllAgents, updateAgentStatus } from "./availability-service";
import { getCallerEmailFromRequest } from "./auth-context";
import { createApiClient } from "./supabase-api";
import { isMockAgentCredential } from "./mock-agents";
import { handleVoicePost } from "./voice-post";

export const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
  })
);

app.get("/health", (c) => c.json({ ok: true, service: "thinkia-api", base: "/api" }));

app.get("/calls", async (c) => {
  try {
    const limit = Number(c.req.query("limit")) || 50;
    const calls = await getCallLogs(limit);
    return c.json({ calls });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ calls: [], error: msg }, 500);
  }
});

app.get("/agents", async (c) => {
  try {
    const agents = await getAllAgents();
    return c.json({ agents });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return c.json({ agents: [], error: msg }, 500);
  }
});

app.post("/agents/status", async (c) => {
  try {
    const body = await c.req.json();
    const identity = String(body.identity || "");
    if (!identity) return c.json({ error: "Missing identity" }, 400);

    const is_available =
      typeof body.is_available === "boolean" ? body.is_available : body.agentStatus === "available";
    const agentStatus = typeof body.agentStatus === "string" ? body.agentStatus : undefined;
    const offlineMessage = typeof body.offlineMessage === "string" ? body.offlineMessage : undefined;

    const req = c.req.raw;
    const callerEmail = await getCallerEmailFromRequest(req);
    if (!callerEmail) return c.json({ error: "Unauthorized" }, 401);

    const callerIdentity = callerEmail.replace(/[^a-zA-Z0-9-_]/g, "_");
    if (callerIdentity !== identity) {
      return c.json({ error: "Forbidden: only your own status can be updated" }, 403);
    }

    await updateAgentStatus(identity, is_available, offlineMessage, agentStatus);
    return c.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update agent";
    return c.json({ error: msg }, 500);
  }
});

app.options("/token", (c) => {
  return c.body(null, 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
});

app.get("/token", async (c) => {
  const req = c.req.raw;
  let userEmail: string | null = null;

  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url && anon) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseMobile = createClient(url, anon, {
        global: { headers: { Authorization: `Bearer ${bearerToken}` } },
      });
      const { data } = await supabaseMobile.auth.getUser();
      userEmail = data?.user?.email ?? null;
    }
  }

  if (!userEmail) {
    userEmail = await getCallerEmailFromRequest(req);
  }

  if (!userEmail) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;
  const outgoingApplicationSid = process.env.TWILIO_TWIML_APP_SID;

  const identitySource = userEmail;
  const identity = identitySource.replace(/[^a-zA-Z0-9-_]/g, "_");

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !outgoingApplicationSid) {
    return c.json({ error: "Missing Twilio environment variables" }, 500);
  }

  const pushCredentialSid = c.req.query("pushCredentialSid");
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid,
    incomingAllow: true,
    pushCredentialSid: pushCredentialSid || undefined,
  });

  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, { identity });
  token.addGrant(voiceGrant);

  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return c.json({ identity, token: token.toJwt() });
});

app.get("/numbers", async (c) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    if (!accountSid || !apiKey || !apiSecret) {
      return c.json({ numbers: [], error: "Missing Twilio credentials" }, 500);
    }
    const client = twilio(apiKey, apiSecret, { accountSid });
    const incoming = await client.incomingPhoneNumbers.list({ limit: 50 });
    const numbers = incoming.map((n) => ({
      sid: n.sid,
      name: n.friendlyName || n.phoneNumber,
      number: n.phoneNumber,
      countryCode: (n as { isoCountry?: string }).isoCountry ?? null,
      voiceUrl: (n as { voiceUrl?: string }).voiceUrl || null,
      smsUrl: (n as { smsUrl?: string }).smsUrl || null,
      updatedAt: n.dateUpdated ? new Date(n.dateUpdated).toISOString() : null,
    }));
    return c.json({ numbers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return c.json({ numbers: [], error: msg }, 500);
  }
});

app.get("/app-settings", async (c) => {
  try {
    const key = c.req.query("key") || "";
    if (!key) return c.json({ error: "Missing key" }, 400);
    const supabase = createApiClient();
    const { data, error } = await supabase.from("app_settings").select("*").eq("key", key).maybeSingle();
    if (error) throw error;
    return c.json({ key, value: data?.value ?? null, updated_at: data?.updated_at ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return c.json({ error: msg }, 500);
  }
});

app.post("/app-settings", async (c) => {
  try {
    const body = await c.req.json();
    const key = String(body.key || "");
    if (!key) return c.json({ error: "Missing key" }, 400);
    const value = body.value ?? {};
    const supabase = createApiClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return c.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    return c.json({ error: msg }, 500);
  }
});

app.post("/auth/mock-login", async (c) => {
  try {
    const body = await c.req.json();
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    if (!isMockAgentCredential(email, password)) {
      return c.json({ error: "Invalid mock credentials" }, 401);
    }
    const cookie = `mock_agent_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
    return c.json({ ok: true }, 200, { "Set-Cookie": cookie });
  } catch {
    return c.json({ error: "Bad request" }, 400);
  }
});

app.post("/voice", async (c) => {
  const res = await handleVoicePost(c.req.raw);
  return res;
});
