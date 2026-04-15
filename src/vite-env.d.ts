/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly VITE_PUBLIC_API_URL?: string;
  /** `true` = lista de llamadas desde Twilio (GET /api/calls). Por defecto se usan datos demo. */
  readonly VITE_USE_LIVE_CALLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
