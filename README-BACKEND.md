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

Los archivos **`server/routing-store.ts`** y **`server/routing-events-store.ts`** se copiaron del proyecto Thinkia (flujos IVR + eventos; fallback a JSON bajo `data/` en desarrollo).

## Variables de entorno

Copia `.env.example` a `.env` (local) y configura las mismas claves que en el despliegue Thinkia. En Vercel, define las variables en el panel del proyecto.

**Importante:** en servidor se usa `SUPABASE_SERVICE_ROLE_KEY` si está definida; si no, la anon key (requiere políticas RLS permisivas como en Thinkia).

## Login en el front

`src/app/pages/Login.tsx`:

1. Intenta **POST `/api/auth/mock-login`** (cookie HttpOnly).
2. Si falla, usa **Supabase Auth** en el navegador (`VITE_SUPABASE_*`).

## Próximos pasos sugeridos

- Conectar **CallCenter**, **Historial**, **Analytics**, etc. a `fetch('/api/calls')` y resto de endpoints en lugar de mocks.
- Añadir **webhooks de grabación** (`/api/voice/recording`) si los necesitas en este repo (rutas adicionales en `server/hono-app.ts`).
- Revisión de **CORS** si el front y el API van en dominios distintos (`VITE_PUBLIC_API_URL`).

Repositorio de referencia: [Thinkia_Call_Experience](https://github.com/maanuuvegasCreator/Thinkia_Centralita) (Next.js).
