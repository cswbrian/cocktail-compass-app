import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "溝酒神燈 | 新手調酒推介 | Cocktail Cult | Cocktail Finder for Beginners",
    short_name: "溝酒神燈",
    description: "新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#000000",
    background_color: "#000000",
    display: "standalone",
    start_url: "/",
    lang: "zh-HK",
    categories: ["lifestyle", "food", "drinks"],
    orientation: "portrait",
    prefer_related_applications: false
  };
}
