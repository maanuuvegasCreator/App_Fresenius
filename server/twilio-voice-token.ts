import twilio from "twilio";
import { getCallerEmailFromRequest } from "./auth-context";

export type VoiceTokenResult =
  | { ok: true; identity: string; token: string }
  | { ok: false; status: number; error: string };

/**
 * JWT de Twilio Voice (cliente Web) con API Key + Secret. Misma lógica para /api/token y /api/twilio/token.
 */
export async function issueTwilioVoiceAccessToken(req: Request, pushCredentialSid?: string | null): Promise<VoiceTokenResult> {
  const userEmail = await getCallerEmailFromRequest(req);
  if (!userEmail) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;
  const outgoingApplicationSid = process.env.TWILIO_TWIML_APP_SID;

  const identity = userEmail.replace(/[^a-zA-Z0-9-_]/g, "_");

  if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !outgoingApplicationSid) {
    return { ok: false, status: 500, error: "Missing Twilio environment variables" };
  }

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid,
    incomingAllow: true,
    pushCredentialSid: pushCredentialSid || undefined,
  });

  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, { identity });
  token.addGrant(voiceGrant);

  return { ok: true, identity, token: token.toJwt() };
}
