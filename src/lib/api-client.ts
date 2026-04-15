import { apiUrl } from "./api-base";

/** Fetch al API con sesión Supabase (Bearer) y/o cookie mock. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  try {
    const { getSupabaseBrowser } = await import("./supabase");
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
  } catch {
    // Sin variables VITE_SUPABASE_*: solo cookie mock u origen anónimo.
  }
  const url = path.startsWith("http") ? path : apiUrl(path.startsWith("/") ? path : `/${path}`);
  return fetch(url, { ...init, headers, credentials: "include" });
}

export async function fetchCalls(limit = 300) {
  const res = await apiFetch(`/api/calls?limit=${limit}`, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return (Array.isArray(data.calls) ? data.calls : []) as import("@/types/backend").BackendCall[];
}

export async function fetchAgents() {
  const res = await apiFetch("/api/agents", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return (Array.isArray(data.agents) ? data.agents : []) as import("@/types/backend").AgentRow[];
}

export async function fetchNumbers() {
  const res = await apiFetch("/api/numbers", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return (Array.isArray(data.numbers) ? data.numbers : []) as import("@/types/backend").TwilioNumber[];
}
