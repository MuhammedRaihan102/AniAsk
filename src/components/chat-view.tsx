"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { QuestionInput } from "@/components/question-input";
import { cn } from "@/lib/utils";

type ChatViewProps = {
  initialQuestion: string;
};

// A message is made of "parts" (text, and later tool results). Join the text parts.
function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export function ChatView({ initialQuestion }: ChatViewProps) {
  // useChat talks to /api/chat and keeps `messages` updated as the answer streams in.
  const { messages, sendMessage, status, error, regenerate } = useChat();
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastScrollTop = useRef(0);

  const isBusy = status === "submitted" || status === "streaming";

  // Send the landing-page question. In development React mounts, unmounts and
  // remounts components to catch bugs, and unmounting cancels useChat's request.
  // Waiting one tick (and cancelling the timer on unmount) means only the final
  // mount sends the question.
  useEffect(() => {
    if (!initialQuestion) return;
    const timer = setTimeout(() => sendMessage({ text: initialQuestion }), 0);
    return () => clearTimeout(timer);
  }, [initialQuestion, sendMessage]);

  // Follow the answer as it grows, but only while the reader is at the bottom.
  // The observer fires once per new line rather than on every word, so the
  // smooth scrolls don't interrupt each other.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Scrolling up to re-read stops the auto-scroll; returning to the bottom resumes it.
  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (scroller.scrollTop < lastScrollTop.current - 2) {
      stickToBottom.current = false;
    } else if (distanceFromBottom < 40) {
      stickToBottom.current = true;
    }
    lastScrollTop.current = scroller.scrollTop;
  }

  function send() {
    stickToBottom.current = true;
    sendMessage({ text: draft.trim() });
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="scrollbar-subtle flex-1 overflow-y-auto"
      >
        <div ref={contentRef} className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 && !isBusy ? (
            <p className="text-muted-foreground mt-24 text-center">
              Ask your first question below.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? // Your questions: plain dark bubble on the right.
                        "bg-secondary self-end rounded-br-md"
                      : // AniAsk's answers: violet-tinted bubble on the left.
                        "border-primary/25 bg-primary/20 self-start rounded-bl-md border",
                  )}
                >
                  {getMessageText(message)}
                </li>
              ))}

              {/* Waiting for the first words of the answer. */}
              {status === "submitted" && (
                <li
                  aria-label="AniAsk is thinking"
                  className="border-primary/25 bg-primary/20 flex gap-1.5 self-start rounded-2xl rounded-bl-md border px-4 py-4"
                >
                  <span className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <span className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <span className="bg-primary size-2 animate-bounce rounded-full" />
                </li>
              )}
            </ul>
          )}

          {error && (
            <div className="border-destructive/40 bg-destructive/10 mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
              {/* The message comes from describeError in the chat route. */}
              <span className="flex-1">{error.message}</span>
              <Button variant="outline" size="sm" onClick={() => regenerate()}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <QuestionInput
          value={draft}
          onValueChange={setDraft}
          onSubmit={send}
          disabled={isBusy}
        />
      </div>
    </div>
  );
}
