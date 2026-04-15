/** Base URL del API (mismo origen en prod; en dev Vite proxy /api → dev-server). */
export function apiUrl(path: string) {
  const base = (import.meta.env.VITE_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
