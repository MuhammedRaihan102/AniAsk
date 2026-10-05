"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionInput } from "@/components/question-input";

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
    router.push(`/chat?q=${encodeURIComponent(question.trim())}`);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <QuestionInput
        value={question}
        onValueChange={setQuestion}
        onSubmit={ask}
        rows={3}
      />

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
