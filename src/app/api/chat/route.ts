import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/instructions";
import { getChatModel } from "@/lib/ai/model";

// Let a streamed answer run for up to 30 seconds.
export const maxDuration = 30;

// Only send the latest messages, so long chats don't use up the free quota.
const MAX_HISTORY = 20;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages to answer." }, { status: 400 });
  }

  const result = streamText({
    model: getChatModel(),
    instructions: CHAT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages.slice(-MAX_HISTORY)),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
