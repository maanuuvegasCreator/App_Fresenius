import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function getSupabaseBrowser() {
  if (!url || !anon) {
    throw new Error("Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env");
  }
  return createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
}
