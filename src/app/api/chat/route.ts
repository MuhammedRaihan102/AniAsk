import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  smoothStream,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getChatInstructions } from "@/lib/ai/instructions";
import { getChatModel } from "@/lib/ai/model";
import { anilistTools } from "@/lib/ai/tools";

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
    instructions: getChatInstructions(),
    messages: await convertToModelMessages(messages.slice(-MAX_HISTORY), {
      tools: anilistTools,
      ignoreIncompleteToolCalls: true,
    }),
    tools: anilistTools,
    // Each tool call is a "step": the model asks for data, reads the result,
    // then answers. Allow a few steps, but cap them to protect the free quota.
    stopWhen: isStepCount(4),
    // Gemini sends text in big bursts; release it word by word so it reads smoothly.
    experimental_transform: smoothStream({ delayInMs: 15, chunking: "word" }),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: anilistTools,
      onError: describeError,
    }),
  });
}

// The text the user sees when answering fails. Details stay in the server log.
function describeError(error: unknown) {
  console.error(error);
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    return "AniAsk has reached its free AI limit for now. Please try again later.";
  }
  return "Something went wrong while answering. Please try again.";
}
