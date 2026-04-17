import { getGeminiApiKey } from "../config";

const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

export async function geminiGenerateText(
  systemPrompt: string,
  userMessage: string,
  options?: { jsonMode?: boolean }
): Promise<string> {
  const key = getGeminiApiKey();
  if (!key) throw new Error("Missing GOOGLE_API_KEY or GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const generationConfig: Record<string, unknown> = {
    temperature: 0.45,
    maxOutputTokens: 512,
  };
  if (options?.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini HTTP ${res.status}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  return text.trim() || "Lo siento, no pude generar una respuesta.";
}
