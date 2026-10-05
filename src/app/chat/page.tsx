import type { Metadata } from "next";
import Link from "next/link";
import { ChatView } from "@/components/chat-view";

export const metadata: Metadata = {
  title: "Chat · AniAsk",
};

export default async function ChatPage({ searchParams }: PageProps<"/chat">) {
  // `/chat?q=...` carries the question typed on the landing page.
  const { q } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.trim() : "";

  return (
    <main className="flex h-dvh flex-col">
      <header className="border-b px-4 py-3">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Ani<span className="text-primary">Ask</span>
        </Link>
      </header>

      {/* A new `key` starts a fresh chat when the question in the URL changes. */}
      <ChatView key={initialQuestion} initialQuestion={initialQuestion} />
    </main>
  );
}
