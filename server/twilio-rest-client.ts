import twilio from "twilio";

export type TwilioRestClient = ReturnType<typeof twilio>;

/** Cliente REST Twilio (API Key o Auth Token). */
export function createTwilioRestClient(): TwilioRestClient {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const apiKey = process.env.TWILIO_API_KEY?.trim();
  const apiSecret = process.env.TWILIO_API_SECRET?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (accountSid && apiKey && apiSecret) {
    return twilio(apiKey, apiSecret, { accountSid });
  }
  if (accountSid && authToken) {
    return twilio(accountSid, authToken);
  }
  throw new Error(
    "Twilio REST: configure TWILIO_ACCOUNT_SID y (TWILIO_API_KEY + TWILIO_API_SECRET) o TWILIO_AUTH_TOKEN."
  );
}
