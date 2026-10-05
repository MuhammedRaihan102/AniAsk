import { tool } from "ai";
import { z } from "zod";
import { getSeasonAnime, searchAnime, searchCharacter } from "@/lib/anilist";

// Functions the AI can call to look up real data on AniList. The description
// tells the model when to use each tool; the input schema tells it what to send.
export const anilistTools = {
  searchAnime: tool({
    description:
      "Search AniList for an anime by title and get its facts: episodes, status, airing dates, next episode, studio, genres, score, synopsis and main characters with voice actors. Returns up to 3 matches; the first is usually the right one.",
    inputSchema: z.object({
      title: z
        .string()
        .describe(
          "The anime title to search for, e.g. 'Frieren' or 'Attack on Titan'",
        ),
    }),
    execute: async ({ title }) => searchAnime(title),
  }),

  searchCharacter: tool({
    description:
      "Search AniList for an anime character by name and get their description and the anime they appear in.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("The character's name, e.g. 'Rengoku' or 'Levi'"),
    }),
    execute: async ({ name }) => searchCharacter(name),
  }),

  getSeasonAnime: tool({
    description:
      "Get the 10 most popular anime of a given season and year, e.g. to answer 'what's airing this season?'.",
    inputSchema: z.object({
      season: z.enum(["WINTER", "SPRING", "SUMMER", "FALL"]),
      year: z.number().int().describe("The year, e.g. 2026"),
    }),
    execute: async ({ season, year }) => getSeasonAnime(season, year),
  }),
};
