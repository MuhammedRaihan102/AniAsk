"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
          <button
            key={example}
            type="button"
            onClick={() => setQuestion(example)}
            className="border-primary/30 bg-primary/10 hover:border-primary/60 hover:bg-primary/20 focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition outline-none focus-visible:ring-3"
          >
            <Sparkles className="text-primary-light size-3.5" aria-hidden />
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
