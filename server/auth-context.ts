import { createClient } from "@supabase/supabase-js";

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

function supabaseAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
}

/** Email del usuario autenticado (Bearer JWT) o cookie mock_agent_email. */
export async function getCallerEmailFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    const url = supabaseUrl();
    const anon = supabaseAnon();
    if (!url || !anon) return null;
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    });
    const { data } = await supabase.auth.getUser();
    return data?.user?.email ?? null;
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)mock_agent_email=([^;]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return null;
}
