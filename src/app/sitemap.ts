import type { MetadataRoute } from "next";
import { getAllCountrySlugs } from "@/lib/sheep-data";

const BASE_URL = "https://www.baachart.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const countrySlugs = getAllCountrySlugs();

  const countryUrls: MetadataRoute.Sitemap = countrySlugs.map((slug) => ({
    url: `${BASE_URL}/country/${slug}`,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...countryUrls,
  ];
}
