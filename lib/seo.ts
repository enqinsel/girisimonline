import type { Article, Source } from "@/lib/types";

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://girisimonline.org",
);

export const siteName = "Girişim Online";
export const defaultSeoDescription =
  "Türkiye startup ekosistemi, yatırım haberleri, ekonomi ve finans gündemini kısa özetlerle takip et.";

const MIN_INDEXABLE_EXCERPT_LENGTH = 80;

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articlePath(article: Pick<Article, "slug">) {
  return `/haber/${article.slug}`;
}

export function articleCanonicalUrl(article: Pick<Article, "slug">) {
  return absoluteUrl(articlePath(article));
}

export function sourcePath(source: Pick<Source, "slug">) {
  return `/kaynaklar/${source.slug}`;
}

export function isIndexableArticle(article: Pick<Article, "excerpt">) {
  return cleanText(article.excerpt).length >= MIN_INDEXABLE_EXCERPT_LENGTH;
}

export function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function truncateSeoText(value: string, maxLength = 155) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength - 1).trimEnd();
  return `${slice.replace(/[,.!?;:]+$/g, "")}…`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: absoluteUrl("/icon.svg"),
    sameAs: [siteUrl],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: defaultSeoDescription,
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(article: Article) {
  const publishedAt = article.published_at ?? article.imported_at;
  const canonicalUrl = articleCanonicalUrl(article);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: article.title,
    description:
      cleanText(article.excerpt) ||
      "Girişim Online üzerinde kısa özet ve kaynak yönlendirmesiyle listelenen haber.",
    datePublished: publishedAt,
    dateModified: article.imported_at,
    inLanguage: article.language === "tr" ? "tr-TR" : "en",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: article.source?.name ?? siteName,
      url: article.source?.homepage_url ?? siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg"),
      },
    },
    citation: article.original_url,
    isBasedOn: article.original_url,
    url: canonicalUrl,
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/g, "");
}
