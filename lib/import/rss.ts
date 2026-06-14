import * as cheerio from "cheerio";
import type { Source } from "@/lib/types";
import { clampExcerpt, stripHtml } from "@/lib/utils/text";
import { absoluteUrl } from "@/lib/utils/url";
import { politeFetch } from "@/lib/import/fetch";

export type ImportedCandidate = {
  title: string;
  originalUrl: string;
  canonicalUrl?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  rawPayload?: Record<string, unknown>;
};

export async function discoverFeedUrl(source: Source) {
  if (source.feed_url) return source.feed_url;

  const pageUrl = source.list_url ?? source.homepage_url;
  const response = await politeFetch(pageUrl, { timeoutMs: 8_000 });
  const html = await response.text();
  const $ = cheerio.load(html);

  const href = $(
    'link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="atom"], a[href*="feed"], a[href*="rss"]',
  )
    .first()
    .attr("href");

  return href ? absoluteUrl(href, pageUrl) : null;
}

export async function parseRssSource(source: Source) {
  const feedUrl = await discoverFeedUrl(source);
  if (!feedUrl) {
    throw new Error("RSS feed bulunamadı");
  }

  const response = await politeFetch(feedUrl, {
    timeoutMs: 10_000,
    accept: "application/rss+xml,application/atom+xml,text/xml;q=0.9,*/*;q=0.8",
  });
  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const candidates: ImportedCandidate[] = [];

  $("item").each((_, item) => {
    const node = $(item);
    const title = stripHtml(node.find("title").first().text());
    const link =
      node.find("link").first().text().trim() ||
      node.find("guid").first().text().trim();
    const description = node.find("description").first().text();
    const pubDate =
      node.find("pubDate").first().text().trim() ||
      node.find("dc\\:date").first().text().trim();
    const categories = node
      .find("category")
      .toArray()
      .map((category) => stripHtml($(category).text()))
      .filter(Boolean);

    if (!title || !link) return;

    const candidate = {
      title,
      originalUrl: link,
      excerpt: clampExcerpt(description),
      publishedAt: parseDate(pubDate),
      rawPayload: {
        feedUrl,
        guid: node.find("guid").first().text().trim() || null,
        categories,
      },
    };

    if (isAllowedCandidate(source, candidate.originalUrl, categories)) {
      candidates.push(candidate);
    }
  });

  $("entry").each((_, entry) => {
    const node = $(entry);
    const title = stripHtml(node.find("title").first().text());
    const link =
      node.find("link[rel='alternate']").first().attr("href") ??
      node.find("link").first().attr("href") ??
      node.find("id").first().text().trim();
    const summary =
      node.find("summary").first().text() ||
      node.find("subtitle").first().text();
    const date =
      node.find("published").first().text().trim() ||
      node.find("updated").first().text().trim();
    const categories = node
      .find("category")
      .toArray()
      .map((category) =>
        stripHtml($(category).attr("term") ?? $(category).text()),
      )
      .filter(Boolean);

    if (!title || !link) return;

    const candidate = {
      title,
      originalUrl: link,
      excerpt: clampExcerpt(summary),
      publishedAt: parseDate(date),
      rawPayload: {
        feedUrl,
        id: node.find("id").first().text().trim() || null,
        categories,
      },
    };

    if (isAllowedCandidate(source, candidate.originalUrl, categories)) {
      candidates.push(candidate);
    }
  });

  return candidates;
}

function isAllowedCandidate(
  source: Source,
  articleUrl: string,
  categories: string[],
) {
  const allowedPathPrefixes = source.parser_config?.allowedPathPrefixes ?? [];
  const allowedRssCategories = source.parser_config?.allowedRssCategories ?? [];

  if (allowedPathPrefixes.length === 0 && allowedRssCategories.length === 0) {
    return true;
  }

  if (allowedPathPrefixes.length > 0 && matchesAllowedPath(articleUrl, source, allowedPathPrefixes)) {
    return true;
  }

  if (allowedRssCategories.length > 0) {
    const normalizedAllowed = allowedRssCategories.map(normalizeCategory);
    return categories
      .map(normalizeCategory)
      .some((category) => normalizedAllowed.includes(category));
  }

  return false;
}

function matchesAllowedPath(
  articleUrl: string,
  source: Source,
  allowedPathPrefixes: string[],
) {
  try {
    const url = new URL(articleUrl, source.homepage_url);
    return allowedPathPrefixes.some((prefix) => {
      const normalizedPrefix = normalizePathPrefix(prefix);
      return (
        url.pathname === normalizedPrefix ||
        url.pathname.startsWith(`${normalizedPrefix}/`)
      );
    });
  } catch {
    return false;
  }
}

function normalizePathPrefix(value: string) {
  const path = value.startsWith("/") ? value : `/${value}`;
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function normalizeCategory(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
