/** Normaliza marcación a E.164 (por defecto prefijo España +34). */
export function toE164(input: string, defaultCc = "34"): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Número vacío");
  if (trimmed.startsWith("+")) {
    const rest = trimmed.slice(1).replace(/\D/g, "");
    if (rest.length < 8) throw new Error("Número demasiado corto");
    return `+${rest}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) throw new Error("Sin dígitos");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith(defaultCc)) return `+${digits}`;
  if (defaultCc === "34" && digits.length === 9) return `+34${digits}`;
  return `+${digits}`;
}
