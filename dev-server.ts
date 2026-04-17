import { serve } from "@hono/node-server";
import { app } from "./server/hono-app";
import { attachTwilioMediaStreamServer } from "./server/centralita";
import { attachDashboardEventsServer } from "./server/dashboard-events/dashboard-ws-hub";

/** Railway/Render inyectan `PORT`; en local se puede usar `PORT_API`. */
const port = Number(process.env.PORT ?? process.env.PORT_API ?? 8788);

const server = serve({ fetch: app.fetch, port });
attachDashboardEventsServer(server);
attachTwilioMediaStreamServer(server);
console.log(`[api] listening on port ${port} (Twilio / Supabase / ElevenLabs + media WS + dashboard WS)`);
