import { PromptBox } from "@/components/prompt-box";
import { TrendingStrip } from "@/components/trending-strip";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Ani<span className="text-primary">Ask</span>
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Ask anything about anime: characters, studios, what&apos;s airing and
          what to watch next.
        </p>
      </div>

      <PromptBox />

      <TrendingStrip />
    </main>
  );
}
