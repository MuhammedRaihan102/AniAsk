import { google } from "@ai-sdk/google";

// The one place that decides which AI answers questions.
// Switching to another provider (e.g. Groq) only means changing this file.
const DEFAULT_MODEL = "gemini-3.8-flash";

export function getChatModel() {
  // AI_MODEL in .env.local can override the model, e.g. gemini-3.5-flash-lite.
  return google(process.env.AI_MODEL ?? DEFAULT_MODEL);
}
