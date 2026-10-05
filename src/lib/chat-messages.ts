import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import type { anilistTools } from "@/lib/ai/tools";
import type { AnimeFacts } from "@/lib/anilist";

// A chat message that knows about our tools, so TypeScript knows exactly what
// each tool part's input and output look like.
export type AniAskMessage = UIMessage<
  unknown,
  UIDataTypes,
  InferUITools<typeof anilistTools>
>;

export type Source = { title: string; url: string };

// A message is made of "parts" (text, tool calls…). Join the text parts.
export function getMessageText(message: AniAskMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

const MAX_SEASON_SOURCES = 6;

// Compare names loosely: ignore case, punctuation, and curly vs straight
// apostrophes (AniList writes "Journey’s", the AI often writes "Journey's").
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Which of the search results the answer is about.
function pickAnime(
  results: AnimeFacts[],
  isMentioned: (name: string | null) => boolean,
) {
  const fullMatches = results.filter(
    (anime) => isMentioned(anime.title) || isMentioned(anime.romajiTitle),
  );
  if (fullMatches.length > 0) return fullMatches;

  // "Frieren" for "Frieren: Beyond Journey's End": match the part before the colon.
  const shortMatch = results.find((anime) =>
    isMentioned(anime.title.split(":")[0]),
  );
  if (shortMatch) return [shortMatch];

  // Otherwise prefer the main TV series over spin-offs and specials.
  const fallback = results.find((anime) => anime.format === "TV") ?? results[0];
  return fallback ? [fallback] : [];
}

// The AniList pages behind an answer, taken from the tool results the AI used.
// Searches return several matches, so keep the ones the answer mentions and
// fall back to the top match.
export function getMessageSources(message: AniAskMessage): Source[] {
  // Spaces around both sides so "Fern" doesn't match inside "Ferndale".
  const text = ` ${normalize(getMessageText(message))} `;
  const isMentioned = (name: string | null) => {
    const normalizedName = name ? normalize(name) : "";
    return normalizedName.length >= 3 && text.includes(` ${normalizedName} `);
  };

  // Keyed by URL so the same page is only listed once.
  const sources = new Map<string, Source>();
  const add = (title: string, url: string) => sources.set(url, { title, url });

  for (const part of message.parts) {
    if (part.type === "tool-searchAnime" && part.state === "output-available") {
      pickAnime(part.output, isMentioned).forEach((anime) =>
        add(anime.title, anime.anilistUrl),
      );
    }

    if (
      part.type === "tool-searchCharacter" &&
      part.state === "output-available"
    ) {
      // "Rengoku" should match "Kyoujurou Rengoku", so check each part of the name.
      const mentioned = part.output.filter((character) =>
        character.name.split(" ").some((namePart) => isMentioned(namePart)),
      );
      const used = mentioned.length > 0 ? mentioned : part.output.slice(0, 1);
      used.forEach((character) => add(character.name, character.anilistUrl));
    }

    if (
      part.type === "tool-getSeasonAnime" &&
      part.state === "output-available"
    ) {
      const mentioned = part.output.filter((anime) => isMentioned(anime.title));
      if (mentioned.length > 0) {
        mentioned
          .slice(0, MAX_SEASON_SOURCES)
          .forEach((anime) => add(anime.title, anime.anilistUrl));
      } else {
        const { season, year } = part.input;
        const seasonName = season.charAt(0) + season.slice(1).toLowerCase();
        add(
          `${seasonName} ${year} anime`,
          `https://anilist.co/search/anime?season=${season}&year=${year}`,
        );
      }
    }
  }

  return [...sources.values()];
}
