const ANILIST_URL = "https://graphql.anilist.co";

// Reuse AniList answers for an hour: fresh enough for airing info, and it
// keeps us well under AniList's rate limit.
const CACHE_SECONDS = 3600;

export type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

// AniList seasons: Winter = Jan–Mar, Spring = Apr–Jun, Summer = Jul–Sep, Fall = Oct–Dec.
export function getCurrentSeason(date = new Date()): {
  season: Season;
  year: number;
} {
  const seasons: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
  return {
    season: seasons[Math.floor(date.getMonth() / 3)],
    year: date.getFullYear(),
  };
}

// Sends one GraphQL query to AniList. `T` is the shape of the data we expect
// back, so every caller gets a properly typed result.
async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`AniList request failed with status ${response.status}`);
  }

  const json: { data?: T; errors?: { message: string }[] } =
    await response.json();
  if (!json.data || json.errors?.length) {
    throw new Error(`AniList error: ${json.errors?.[0]?.message ?? "no data"}`);
  }
  return json.data;
}

// ---------------------------------------------------------------------------
// Trending strip (landing page)
// ---------------------------------------------------------------------------

export type TrendingAnime = {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; color: string | null };
  siteUrl: string;
};

// The landing page strip is the first thing every visitor sees, so it also
// skips fan-service (Ecchi) shows. Chat answers still cover every anime.
const TRENDING_QUERY = `
  query TrendingThisSeason($season: MediaSeason, $year: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      media(
        season: $season
        seasonYear: $year
        type: ANIME
        isAdult: false
        genre_not_in: ["Ecchi"]
        sort: TRENDING_DESC
      ) {
        id
        title { romaji english }
        coverImage { large color }
        siteUrl
      }
    }
  }
`;

export async function getTrendingThisSeason(
  perPage = 12,
): Promise<TrendingAnime[]> {
  const { season, year } = getCurrentSeason();
  const data = await queryAniList<{ Page: { media: TrendingAnime[] } }>(
    TRENDING_QUERY,
    { season, year, perPage },
  );
  return data.Page.media;
}

// ---------------------------------------------------------------------------
// Lookups used by the AI's tools
// ---------------------------------------------------------------------------

type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

type RawAnime = {
  id: number;
  title: { romaji: string; english: string | null };
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  season: Season | null;
  seasonYear: number | null;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  studios: { nodes: { name: string }[] };
  source: string | null;
  genres: string[];
  averageScore: number | null;
  description: string | null;
  characters: {
    edges: {
      role: string;
      node: { name: { full: string } };
      voiceActors: { name: { full: string } }[];
    }[];
  };
  siteUrl: string;
  coverImage: { large: string; color: string | null };
};

const ANIME_FIELDS = `
  id
  title { romaji english }
  format status episodes duration season seasonYear
  startDate { year month day }
  endDate { year month day }
  nextAiringEpisode { episode airingAt }
  studios(isMain: true) { nodes { name } }
  source genres averageScore
  description(asHtml: false)
  characters(sort: [ROLE, RELEVANCE, ID], perPage: 6) {
    edges {
      role
      node { name { full } }
      voiceActors(language: JAPANESE, sort: RELEVANCE) { name { full } }
    }
  }
  siteUrl
  coverImage { large color }
`;

const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String) {
    Page(perPage: 3) {
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        ${ANIME_FIELDS}
      }
    }
  }
`;

const SEASON_ANIME_QUERY = `
  query SeasonAnime($season: MediaSeason, $year: Int) {
    Page(perPage: 10) {
      media(season: $season, seasonYear: $year, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        ${ANIME_FIELDS}
      }
    }
  }
`;

// The compact, model-friendly version of an anime that the tools return.
export type AnimeFacts = ReturnType<typeof toAnimeFacts>;

function toAnimeFacts(anime: RawAnime) {
  return {
    id: anime.id,
    title: anime.title.english ?? anime.title.romaji,
    romajiTitle: anime.title.romaji,
    format: anime.format,
    status: anime.status,
    episodes: anime.episodes,
    minutesPerEpisode: anime.duration,
    season:
      anime.season && anime.seasonYear
        ? `${anime.season} ${anime.seasonYear}`
        : null,
    startDate: formatDate(anime.startDate),
    endDate: formatDate(anime.endDate),
    nextEpisode: anime.nextAiringEpisode
      ? {
          episode: anime.nextAiringEpisode.episode,
          airsAt: new Date(
            anime.nextAiringEpisode.airingAt * 1000,
          ).toISOString(),
        }
      : null,
    studios: anime.studios.nodes.map((studio) => studio.name),
    source: anime.source,
    genres: anime.genres,
    averageScore: anime.averageScore,
    synopsis: cleanDescription(anime.description),
    mainCharacters: anime.characters.edges.map((edge) => ({
      name: edge.node.name.full,
      role: edge.role,
      japaneseVoiceActor: edge.voiceActors[0]?.name.full ?? null,
    })),
    anilistUrl: anime.siteUrl,
    coverImage: anime.coverImage.large,
    coverColor: anime.coverImage.color,
  };
}

export async function searchAnime(search: string) {
  const data = await queryAniList<{ Page: { media: RawAnime[] } }>(
    SEARCH_ANIME_QUERY,
    { search },
  );
  return data.Page.media.map(toAnimeFacts);
}

export async function getSeasonAnime(season: Season, year: number) {
  const data = await queryAniList<{ Page: { media: RawAnime[] } }>(
    SEASON_ANIME_QUERY,
    { season, year },
  );
  return data.Page.media.map(toAnimeFacts);
}

type RawCharacter = {
  id: number;
  name: { full: string; native: string | null };
  gender: string | null;
  age: string | null;
  description: string | null;
  media: { nodes: { title: { romaji: string; english: string | null } }[] };
  siteUrl: string;
};

const SEARCH_CHARACTER_QUERY = `
  query SearchCharacter($search: String) {
    Page(perPage: 3) {
      characters(search: $search, sort: SEARCH_MATCH) {
        id
        name { full native }
        gender age
        description(asHtml: false)
        media(perPage: 3, type: ANIME, sort: POPULARITY_DESC) {
          nodes { title { romaji english } }
        }
        siteUrl
      }
    }
  }
`;

export async function searchCharacter(search: string) {
  const data = await queryAniList<{ Page: { characters: RawCharacter[] } }>(
    SEARCH_CHARACTER_QUERY,
    { search },
  );
  return data.Page.characters.map((character) => ({
    id: character.id,
    name: character.name.full,
    nativeName: character.name.native,
    gender: character.gender,
    age: character.age,
    description: cleanDescription(character.description),
    appearsIn: character.media.nodes.map(
      (media) => media.title.english ?? media.title.romaji,
    ),
    anilistUrl: character.siteUrl,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate({ year, month, day }: FuzzyDate) {
  if (!year) return null;
  return [year, month, day]
    .filter((part) => part !== null)
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
}

// AniList descriptions contain HTML, Markdown and ~!spoiler!~ blocks. Remove
// the spoilers entirely, strip formatting and keep the text short.
function cleanDescription(description: string | null, maxLength = 700) {
  if (!description) return null;
  const text = description
    .replace(/~![\s\S]*?!~/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/__|\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
