import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to load anime cover art from AniList's image server.
    remotePatterns: [new URL("https://s4.anilist.co/file/anilistcdn/**")],
  },
  // Hide the floating Next.js badge shown during development. Build and
  // runtime errors still pop up when they happen.
  devIndicators: false,
};

export default nextConfig;
