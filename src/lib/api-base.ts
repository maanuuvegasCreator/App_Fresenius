/**
 * Origen público del backend (Railway/Render), sin barra final.
 * En desarrollo vacío = rutas relativas `/api/...` (proxy Vite → servidor local).
 * En producción en Vercel debe definirse `VITE_PUBLIC_API_URL` (p. ej. `https://api-xxxx.up.railway.app`).
 */
export function getPublicApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_PUBLIC_API_URL as string | undefined)?.trim() ?? "";
  const base = raw.replace(/\/$/, "");
  if (import.meta.env.PROD && !base) {
    console.warn(
      "[config] Falta VITE_PUBLIC_API_URL: el frontend no podrá llamar al API ni al WebSocket del dashboard en producción."
    );
  }
  return base;
}

/** URL HTTP(S) del API para fetch desde el navegador. */
export function apiUrl(path: string): string {
  const base = getPublicApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

/**
 * WebSocket del dashboard (eventos de escalado IA).
 * Con `VITE_PUBLIC_API_URL` en https → `wss://…/api/dashboard/ws` en el mismo origen del API.
 */
export function getDashboardWebSocketUrl(): string {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      const u = new URL(base);
      u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
      return new URL("/api/dashboard/ws", u.origin).toString();
    } catch {
      /* continuar con fallback local */
    }
  }
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/api/dashboard/ws`;
  }
  return "ws://127.0.0.1:5173/api/dashboard/ws";
}
