/** Normaliza a E.164 mínimo (+ y dígitos). El marcador debe incluir prefijo país. */
export function toE164(input: string): string {
  const t = input.trim();
  if (!t) return "";
  const core = t.startsWith("+") ? `+${t.slice(1).replace(/\D/g, "")}` : `+${t.replace(/\D/g, "")}`;
  return core === "+" ? "" : core;
}
