import { getOpenAiApiKey } from "../config";

const MODEL = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";

export async function openAiGenerateText(
  systemPrompt: string,
  userMessage: string,
  options?: { jsonMode?: boolean }
): Promise<string> {
  const key = getOpenAiApiKey();
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const body: Record<string, unknown> = {
    model: MODEL,
    temperature: 0.45,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  };
  if (options?.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const text = data.choices?.[0]?.message?.content || "";
  return text.trim() || "Lo siento, no pude generar una respuesta.";
}
