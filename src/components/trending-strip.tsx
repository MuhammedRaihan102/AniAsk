import Image from "next/image";
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
        className="text-muted-foreground mb-3 px-1 text-sm font-medium"
      >
        Trending this season · {seasonName} {year}
      </h2>

      <ul className="scrollbar-subtle flex gap-4 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] pb-3">
        {anime.map((item) => {
          const title = item.title.english ?? item.title.romaji;

          return (
            <li key={item.id} className="w-28 shrink-0 sm:w-32">
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {/* The cover's main color shows while the image loads. */}
                <div
                  className="aspect-[2/3] overflow-hidden rounded-lg"
                  style={{
                    backgroundColor: item.coverImage.color ?? undefined,
                  }}
                >
                  <Image
                    src={item.coverImage.large}
                    alt=""
                    width={230}
                    height={345}
                    sizes="128px"
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-muted-foreground group-hover:text-foreground mt-2 line-clamp-2 text-xs transition">
                  {title}
                </p>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
