import { createClient } from "@supabase/supabase-js";

/** Cliente Supabase para API / webhooks (sin cookies). Prioriza service role si existe. */
export function createApiClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !keyToUse) {
    throw new Error("Variables Supabase no configuradas (URL / KEY)");
  }

  return createClient(supabaseUrl, keyToUse, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
