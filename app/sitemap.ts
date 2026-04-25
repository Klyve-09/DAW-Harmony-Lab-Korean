import type { MetadataRoute } from "next";
import { curriculum } from "@/data/curriculum";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date(siteConfig.contentUpdatedAt);

  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: new URL("/lessons", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: new URL("/generator", siteUrl).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    },
    ...curriculum.map((lesson) => ({
      url: new URL(`/lessons/${lesson.slug}`, siteUrl).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
