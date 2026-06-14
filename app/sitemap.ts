import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://girisimonline.com";
  const articles = await getArticles({ limit: 100 });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/product-hunt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/ekonomi`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/haber/${article.slug}`,
      lastModified: new Date(article.imported_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
