import twilio from "twilio";
import { resolvePublicOriginFromRequest } from "../config";

const skip =
  process.env.TWILIO_SKIP_SIGNATURE_VALIDATION === "1" ||
  process.env.TWILIO_SKIP_SIGNATURE_VALIDATION === "true";

/**
 * Valida X-Twilio-Signature si hay TWILIO_AUTH_TOKEN (salvo TWILIO_SKIP_SIGNATURE_VALIDATION).
 * Con `PUBLIC_APP_URL` / proxy, la URL firmada coincide con la que Twilio invoca en producción.
 */
export function isValidTwilioWebhookRequest(req: Request, body: string): boolean {
  if (skip) return true;
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!token) return true;

  const signature = req.headers.get("X-Twilio-Signature");
  if (!signature) return false;

  let fullUrl: string;
  try {
    const u = new URL(req.url);
    const publicOrigin = resolvePublicOriginFromRequest(req);
    if (publicOrigin) {
      fullUrl = `${publicOrigin}${u.pathname}${u.search}`;
    } else {
      const proto = req.headers.get("x-forwarded-proto") || u.protocol.replace(/:$/, "");
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || u.host;
      fullUrl = `${proto}://${host}${u.pathname}${u.search}`;
    }
  } catch {
    return false;
  }

  const params = new URLSearchParams(body);
  const paramObj: Record<string, string> = {};
  params.forEach((value, key) => {
    paramObj[key] = value;
  });

  return twilio.validateRequest(token, signature, fullUrl, paramObj);
}
