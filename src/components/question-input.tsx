"use client";

import type { KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  rows?: number;
  // Blocks sending (typing still works), e.g. while an answer is streaming.
  disabled?: boolean;
  className?: string;
};

// The text box + send button shared by the landing page and the chat page.
// It doesn't store the text itself: the parent passes `value` in and gets changes back.
export function QuestionInput({
  value,
  onValueChange,
  onSubmit,
  rows = 1,
  disabled = false,
  className,
}: QuestionInputProps) {
  const canSubmit = value.trim().length > 0 && !disabled;

  // Enter sends the question; Shift+Enter adds a new line.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className={cn(
        "bg-card focus-within:border-ring focus-within:ring-ring/30 flex items-end gap-2 rounded-2xl border p-2 shadow-lg transition focus-within:ring-3",
        className,
      )}
    >
      <textarea
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about anime..."
        aria-label="Your question"
        rows={rows}
        className="placeholder:text-muted-foreground flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none"
      />
      <Button
        type="submit"
        size="icon-lg"
        disabled={!canSubmit}
        aria-label="Ask"
        className="shrink-0 rounded-full"
      >
        <ArrowUp />
      </Button>
    </form>
  );
}
