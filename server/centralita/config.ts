/**
 * URLs públicas para webhooks Twilio y Media Streams (wss).
 * Sin CRM ni almacenes externos: solo variables de entorno.
 */

function trimUrl(v: string | undefined): string {
  return (v || "").trim().replace(/\/$/, "");
}

/** Origen https público (Twilio callbacks, firma, etc.). */
export function resolvePublicOriginFromRequest(req: Request): string {
  const explicit = trimUrl(process.env.PUBLIC_APP_URL) || trimUrl(process.env.PUBLIC_API_URL);
  if (explicit) return explicit;
  const vercel = trimUrl(process.env.VERCEL_URL);
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  try {
    return trimUrl(new URL(req.url).origin);
  } catch {
    return "";
  }
}

export function buildWebhookUrl(req: Request, pathname: string): string {
  const origin = resolvePublicOriginFromRequest(req);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (origin) return `${origin}${path}`;
  try {
    const u = new URL(req.url);
    return `${u.origin}${path}`;
  } catch {
    return path;
  }
}

/**
 * URL wss del Media Stream. Prioridad: explícita → derivada de PUBLIC_APP_URL (https→wss).
 * Si queda vacía, el TwiML no inserta `<Stream>` (útil en local sin túnel).
 */
export function resolveMediaStreamWssUrl(): string | null {
  const direct = trimUrl(process.env.TWILIO_MEDIA_STREAM_WSS_URL) || trimUrl(process.env.CENTRALITA_MEDIA_WSS_URL);
  if (direct) return direct;

  const pub = trimUrl(process.env.PUBLIC_APP_URL) || trimUrl(process.env.PUBLIC_API_URL);
  if (!pub || !pub.startsWith("https://")) return null;

  const path = process.env.CENTRALITA_MEDIA_WS_PATH?.trim() || "/api/twilio/media-stream";
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `wss://${pub.slice("https://".length)}${suffix}`;
}

export const CENTRALITA_MEDIA_WS_PATH = "/api/twilio/media-stream";
