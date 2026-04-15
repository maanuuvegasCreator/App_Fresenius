import { createClient } from "@supabase/supabase-js";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined);
const anon =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

export function getSupabaseBrowser() {
  if (!url || !anon) {
    throw new Error(
      "Faltan URL y clave anónima de Supabase en el build (VITE_* o NEXT_PUBLIC_* en Vercel + redeploy)."
    );
  }
  return createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
}
