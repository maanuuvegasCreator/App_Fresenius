/**
 * Colas estáticas de la centralita (destinos de <Dial>).
 * Formato destino: `client:IDENTIDAD` (Twilio Client) o E.164 `+34...`.
 */

export type StaticQueueId = "general" | "incidencias";

export type DialTarget = { kind: "client"; identity: string } | { kind: "number"; e164: string };

function parseDialTarget(raw: string | undefined): DialTarget | null {
  const t = (raw || "").trim();
  if (!t) return null;
  if (t.toLowerCase().startsWith("client:")) {
    const identity = t.slice("client:".length).trim();
    return identity ? { kind: "client", identity } : null;
  }
  return { kind: "number", e164: t };
}

/** Atención General — env: CENTRALITA_QUEUE_GENERAL_TARGET */
export function getGeneralQueueTarget(): DialTarget | null {
  return parseDialTarget(process.env.CENTRALITA_QUEUE_GENERAL_TARGET);
}

/** Incidencias — env: CENTRALITA_QUEUE_INCIDENCIAS_TARGET */
export function getIncidenciasQueueTarget(): DialTarget | null {
  return parseDialTarget(process.env.CENTRALITA_QUEUE_INCIDENCIAS_TARGET);
}

export function getQueueTarget(queue: StaticQueueId): DialTarget | null {
  return queue === "general" ? getGeneralQueueTarget() : getIncidenciasQueueTarget();
}
