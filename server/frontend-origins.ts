/** Orígenes del frontend permitidos por CORS (p. ej. `https://app.vercel.app`). */
export function parseFrontendOrigins(): string[] {
  const v = process.env.FRONTEND_URL?.trim();
  if (!v) return [];
  return v.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
}
