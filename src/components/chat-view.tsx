"use client";

import { useEffect, useRef, useState } from "react";
import { QuestionInput } from "@/components/question-input";
import { createEchoReply, createMessage, type ChatMessage } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ChatViewProps = {
  initialQuestion: string;
};

export function ChatView({ initialQuestion }: ChatViewProps) {
  // The question typed on the landing page becomes the first message.
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialQuestion
      ? [
          createMessage("user", initialQuestion),
          createEchoReply(initialQuestion),
        ]
      : [],
  );
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function send() {
    const question = draft.trim();
    setMessages((current) => [
      ...current,
      createMessage("user", question),
      createEchoReply(question),
    ]);
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-subtle flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <p className="text-muted-foreground mt-24 text-center">
              Ask your first question below.
            </p>
          ) : (
            <ul className="flex flex-col gap-6">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={cn(
                    "max-w-[85%] leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-secondary self-end rounded-2xl px-4 py-2.5"
                      : "self-start",
                  )}
                >
                  {message.content}
                </li>
              ))}
            </ul>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <QuestionInput value={draft} onValueChange={setDraft} onSubmit={send} />
      </div>
    </div>
  );
}
