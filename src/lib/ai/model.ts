import { google } from "@ai-sdk/google";

// The one place that decides which AI answers questions.
// Switching to another provider (e.g. Groq) only means changing this file.
// The newest Flash model allowed only 20 free-tier requests, so default to the
// lighter Flash-Lite model, which is meant for high-volume use.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export function getChatModel() {
  // AI_MODEL in .env.local can override the model, e.g. gemini-3.5-flash.
  return google(process.env.AI_MODEL ?? DEFAULT_MODEL);
}
