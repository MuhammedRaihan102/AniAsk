import { PromptBox } from "@/components/prompt-box";
import { TrendingStrip } from "@/components/trending-strip";

export default function Home() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
      {/* Soft violet glow at the top of the page, purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_70%)]"
      />
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
