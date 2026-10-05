import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { FadingScrollRow } from "@/components/fading-scroll-row";
import {
  getCurrentSeason,
  getTrendingThisSeason,
  type TrendingAnime,
} from "@/lib/anilist";

export async function TrendingStrip() {
  let anime: TrendingAnime[];
  try {
    anime = await getTrendingThisSeason();
  } catch (error) {
    // The landing page still works without the strip, so hide it instead of crashing.
    console.error(error);
    return null;
  }

  if (anime.length === 0) return null;

  const { season, year } = getCurrentSeason();
  const seasonName = season.charAt(0) + season.slice(1).toLowerCase();

  return (
    <section aria-labelledby="trending-heading" className="w-full max-w-5xl">
      <h2
        id="trending-heading"
        className="text-muted-foreground mb-3 flex items-center gap-1.5 px-1 text-sm font-medium"
      >
        <TrendingUp className="text-primary-light size-4" aria-hidden />
        Trending this season · {seasonName} {year}
      </h2>

      <FadingScrollRow className="flex gap-5 pb-3">
        {anime.map((item) => {
          const title = item.title.english ?? item.title.romaji;

          return (
            <li key={item.id} className="w-32 shrink-0 sm:w-40">
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {/* The cover's main color shows while the image loads. */}
                <div
                  className="group-hover:ring-primary/60 aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-transparent transition"
                  style={{
                    backgroundColor: item.coverImage.color ?? undefined,
                  }}
                >
                  <Image
                    src={item.coverImage.large}
                    alt=""
                    width={230}
                    height={345}
                    sizes="160px"
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-muted-foreground group-hover:text-foreground mt-2 line-clamp-2 text-sm transition">
                  {title}
                </p>
              </a>
            </li>
          );
        })}
      </FadingScrollRow>
    </section>
  );
}
