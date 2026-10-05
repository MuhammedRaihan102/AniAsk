"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_QUESTIONS = [
  "Who is the strongest Hashira in Demon Slayer?",
  "Is Frieren worth watching?",
  "Which studio animated Jujutsu Kaisen?",
  "What should I watch after Attack on Titan?",
];

export function PromptBox() {
  const [question, setQuestion] = useState("");
  const router = useRouter();

  function ask() {
    const trimmed = question.trim();
    if (!trimmed) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  }

  // Enter sends the question; Shift+Enter adds a new line.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
        className="bg-card focus-within:border-ring focus-within:ring-ring/30 relative rounded-2xl border shadow-lg transition focus-within:ring-3"
      >
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about anime..."
          aria-label="Your question"
          rows={3}
          className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-5 pt-4 pb-14 text-base outline-none"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!question.trim()}
          aria-label="Ask"
          className="absolute right-3 bottom-3 rounded-full"
        >
          <ArrowUp />
        </Button>
      </form>

      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLE_QUESTIONS.map((example) => (
          <Button
            key={example}
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setQuestion(example)}
          >
            {example}
          </Button>
        ))}
      </div>
    </div>
  );
}
