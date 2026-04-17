import { getAiProvider } from "../config";
import { geminiGenerateText } from "./gemini-client";
import { openAiGenerateText } from "./openai-client";

export type GenerateReplyOptions = {
  /** Fuerza salida JSON (Gemini: responseMimeType; OpenAI: json_object). */
  jsonMode?: boolean;
};

export async function generateAssistantReply(
  systemPrompt: string,
  userMessage: string,
  options?: GenerateReplyOptions
): Promise<string> {
  const provider = getAiProvider();
  if (provider === "openai") {
    return openAiGenerateText(systemPrompt, userMessage, options);
  }
  return geminiGenerateText(systemPrompt, userMessage, options);
}
