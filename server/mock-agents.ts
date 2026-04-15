export const MOCK_AGENT_PASSWORD = "Thinkia2026Password!";

export const MOCK_AGENT_EMAILS = [
  "laura.soporte@thinkia.com",
  "carlos.ventas@thinkia.com",
  "ana.tech@thinkia.com",
  "diego.soporte@thinkia.com",
  "marta.admin@thinkia.com",
  "javier.ventas@thinkia.com",
  "elena.billing@thinkia.com",
  "pablo.tech@thinkia.com",
  "sofia.quality@thinkia.com",
  "adrian.soporte@thinkia.com",
] as const;

export function isMockAgentCredential(email: string, password: string) {
  return MOCK_AGENT_EMAILS.includes(email.toLowerCase() as (typeof MOCK_AGENT_EMAILS)[number]) && password === MOCK_AGENT_PASSWORD;
}
