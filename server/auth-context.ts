function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

function supabaseAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
}

/** Email a partir del JWT vía REST GoTrue (evita tipos rotos de `auth.getUser` en algunas versiones de supabase-js). */
async function getEmailFromAccessToken(accessToken: string): Promise<string | null> {
  const url = supabaseUrl();
  const anon = supabaseAnon();
  if (!url || !anon) return null;
  const base = url.replace(/\/$/, "");
  const res = await fetch(`${base}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anon,
    },
  });
  if (!res.ok) return null;
  try {
    const body = (await res.json()) as { email?: string | null };
    return body.email ?? null;
  } catch {
    return null;
  }
}

/** Email del usuario autenticado (Bearer JWT) o cookie mock_agent_email. */
export async function getCallerEmailFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    return getEmailFromAccessToken(bearerToken);
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)mock_agent_email=([^;]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return null;
}
