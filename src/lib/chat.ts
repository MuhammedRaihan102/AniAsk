export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export function createMessage(role: ChatRole, content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

// Placeholder reply until Phase 2 connects the AI.
export function createEchoReply(question: string): ChatMessage {
  return createMessage(
    "assistant",
    `You asked: "${question}"\n\nI can't answer yet. Real answers arrive once the AI is connected.`,
  );
}
