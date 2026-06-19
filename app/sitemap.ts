import type { MetadataRoute } from "next";
import { getArticles, getSources } from "@/lib/data";
import { isIndexableArticle, siteUrl, sourcePath } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, sources] = await Promise.all([
    getArticles({ limit: 500 }),
    getSources(),
  ]);
  const indexableArticles = articles.filter(isIndexableArticle);
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/ekonomi`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ekonomi-haberleri`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/kaynaklar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/product-hunt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    ...sources.map((source) => ({
      url: `${siteUrl}${sourcePath(source)}`,
      lastModified: source.updated_at ? new Date(source.updated_at) : now,
      changeFrequency: "hourly" as const,
      priority: 0.65,
    })),
    ...indexableArticles.map((article) => ({
      url: `${siteUrl}/haber/${article.slug}`,
      lastModified: new Date(article.published_at ?? article.imported_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
