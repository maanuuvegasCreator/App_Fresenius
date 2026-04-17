import { getGeneralQueueTarget } from "../../centralita/queues/static-queues";
import { buildDialTargetTwiml } from "../../centralita/twiml/ivr-responses";
import { createTwilioRestClient } from "../../twilio-rest-client";

/**
 * Redirige la llamada activa a la cola estática **Atención General** (`CENTRALITA_QUEUE_GENERAL_TARGET`).
 */
export async function transferActiveCallToGeneralQueue(callSid: string): Promise<void> {
  const sid = callSid.trim();
  if (!sid) throw new Error("callSid vacío");

  const target = getGeneralQueueTarget();
  const twiml = buildDialTargetTwiml(target);

  const client = createTwilioRestClient();
  await client.calls(sid).update({ twiml });
}
