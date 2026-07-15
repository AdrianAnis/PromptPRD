import "server-only";
import { GoogleGenAI } from "@google/genai";

// "gemini-2.5-flash" (and its "-lite" sibling) return 404 "no longer
// available to new users" on freshly created API keys — verified live
// against this project's key. The "-latest" aliases stay pointed at
// whatever model Google currently recommends, avoiding this class of
// breakage; gemini-flash-lite-latest measured ~2s for requirement
// question generation (well under NFR-001's 10s budget) with no
// noticeable quality loss vs the full flash tier.
const MODEL = "gemini-flash-lite-latest";
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause: "timeout" | "api_error"
  ) {
    super(message);
    this.name = "AIGenerationError";
  }
}


export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await getClient().models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { abortSignal: controller.signal, systemInstruction },
      });
      clearTimeout(timeout);
      const text = response.text;
      if (!text) throw new AIGenerationError("Empty AI response", "api_error");
      return text;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (controller.signal.aborted) {
        lastError = new AIGenerationError("AI request timed out", "timeout");
      }
    }
  }

  if (lastError instanceof AIGenerationError) throw lastError;
  throw new AIGenerationError("Failed to generate AI response", "api_error");
}


export async function generateJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const text = await generateText(prompt, systemInstruction);
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIGenerationError("AI response was not valid JSON", "api_error");
  }
}
