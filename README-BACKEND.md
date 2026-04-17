# Backend Thinkia en App Fresenius (Vite + Hono + Vercel)

Este repo es una **SPA con Vite**. El backend de **Twilio**, **Supabase** y **ElevenLabs** vive en **`server/`** y se expone como **`/api/*`** mediante:

- **Desarrollo:** `pnpm dev` arranca el API en `http://127.0.0.1:8788` y Vite hace **proxy** de `/api` → ese puerto (`vite.config.ts`).
- **Producción (Vercel):** `api/[[...route]].ts` usa el adaptador oficial de [Hono para Vercel](https://hono.dev/docs/getting-started/vercel).

## Rutas implementadas (paridad con Thinkia_Call_Experience)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Comprobación |
| GET | `/api/calls?limit=` | Historial Twilio + ElevenLabs + `call_metadata` |
| GET | `/api/agents` | `agent_settings` |
| POST | `/api/agents/status` | Actualizar disponibilidad (Bearer JWT o cookie mock) |
| GET/OPTIONS | `/api/token` | JWT Twilio Voice (`identity` + `token`) |
| GET | `/api/numbers` | Números entrantes Twilio |
| GET/POST | `/api/app-settings` | Ajustes en tabla `app_settings` |
| POST | `/api/auth/mock-login` | Cookie `mock_agent_email` (mismas credenciales mock que Thinkia) |
| POST | `/api/voice` | Webhook Twilio (TwiML + ruteo + ElevenLabs) |
| POST | `/api/voice/recording` | Callback de estado de grabaciones (200 OK; logs) |

**Marcador (Dashboard):** el front usa **`@twilio/voice-sdk`**: registro con `GET /api/token` y salientes vía `POST /api/voice` (TwiML App en Twilio debe apuntar a esa URL).

Los archivos **`server/routing-store.ts`** y **`server/routing-events-store.ts`** se copiaron del proyecto Thinkia (flujos IVR + eventos; fallback a JSON bajo `data/` en desarrollo).

## Variables de entorno

Copia `.env.example` a `.env` (local) y configura las mismas claves que en el despliegue Thinkia. En Vercel, define las variables en el panel del proyecto.

**Importante:** en servidor se usa `SUPABASE_SERVICE_ROLE_KEY` si está definida; si no, la anon key (requiere políticas RLS permisivas como en Thinkia).

## Login en el front

`src/app/pages/Login.tsx`:

1. Intenta **POST `/api/auth/mock-login`** (cookie HttpOnly).
2. Si falla, usa **Supabase Auth** en el navegador (`VITE_SUPABASE_*`).

## Twilio Console (obligatorio para voz real)

1. **TwiML App** → *Voice request URL* = `https://<tu-dominio>/api/voice` (POST).
2. **Caller ID** verificado: variable `TWILIO_CALLER_ID` (o `TWILIO_FROM_NUMBER`).
3. **Identidad del cliente** = email del agente normalizado (como en `GET /api/token`); debe coincidir con `INBOUND_AGENT_IDENTITIES` / mapa de ruteo si quieres llamadas entrantes al navegador.

## Próximos pasos sugeridos

- Activar historial real en listas: `VITE_USE_LIVE_CALLS=true` (por defecto el Dashboard sigue pudiendo usar demo de llamadas salvo que actives esto).
- Revisión de **CORS** si el front y el API van en dominios distintos (`VITE_PUBLIC_API_URL`).

Repositorio de referencia: [Thinkia_Call_Experience](https://github.com/maanuuvegasCreator/Thinkia_Centralita) (Next.js).
