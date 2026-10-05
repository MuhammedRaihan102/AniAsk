const ANILIST_URL = "https://graphql.anilist.co";

export type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type TrendingAnime = {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; color: string | null };
  siteUrl: string;
};

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

const TRENDING_QUERY = `
  query TrendingThisSeason($season: MediaSeason, $year: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      media(season: $season, seasonYear: $year, type: ANIME, isAdult: false, sort: TRENDING_DESC) {
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

  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: TRENDING_QUERY,
      variables: { season, year, perPage },
    }),
    // Reuse the answer for an hour instead of asking AniList on every visit.
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`AniList request failed with status ${response.status}`);
  }

  const json: { data: { Page: { media: TrendingAnime[] } } } =
    await response.json();
  return json.data.Page.media;
}
