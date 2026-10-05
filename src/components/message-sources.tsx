import { ExternalLink } from "lucide-react";
import type { Source } from "@/lib/chat-messages";

type MessageSourcesProps = {
  sources: Source[];
};

// Small links under an answer to the AniList pages its facts came from.
export function MessageSources({ sources }: MessageSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground mr-0.5">Sources:</span>
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition"
        >
          {source.title}
          <ExternalLink className="size-3" aria-hidden />
          <span className="sr-only">(AniList, opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}
