import { serve } from "@hono/node-server";
import { app } from "./server/hono-app";

const port = Number(process.env.PORT_API || 8788);

serve({ fetch: app.fetch, port });
console.log(`[api] http://127.0.0.1:${port} (Twilio / Supabase / ElevenLabs)`);
