import * as cheerio from "cheerio";
import type { ParserConfig, Source } from "@/lib/types";
import { politeFetch, wait } from "@/lib/import/fetch";
import type { ImportedCandidate } from "@/lib/import/rss";
import { clampExcerpt, stripHtml } from "@/lib/utils/text";
import { absoluteUrl } from "@/lib/utils/url";

const FALLBACK_CONFIG: ParserConfig = {
  itemSelector: "article, .post, .entry, .type-post, .news-item, .post-item",
  titleSelector: "h1, h2, h3, .entry-title, .post-title, a[rel='bookmark']",
  linkSelector: "a[href]",
  excerptSelector: "p, .excerpt, .entry-summary",
  dateSelector: "time, .date, .post-date",
  linkAttribute: "href",
  dateAttribute: "datetime",
};

export async function parseHtmlSource(source: Source) {
  const listUrls = source.parser_config?.listUrls?.length
    ? source.parser_config.listUrls
    : [source.list_url ?? source.homepage_url];
  const candidates: ImportedCandidate[] = [];
  const seenUrls = new Set<string>();

  for (const listUrl of listUrls) {
    const response = await politeFetch(listUrl, { timeoutMs: 10_000 });
    const html = await response.text();
    for (const candidate of parseHtmlList(html, source, listUrl)) {
      if (seenUrls.has(candidate.originalUrl)) continue;
      seenUrls.add(candidate.originalUrl);
      candidates.push(candidate);
    }
    await wait(250);
  }

  if (candidates.length === 0) {
    throw new Error("HTML parser haber adayı bulamadı");
  }

  return candidates.slice(0, 40);
}

export function parseHtmlList(html: string, source: Source, baseUrl: string) {
  const config = source.parser_config ?? FALLBACK_CONFIG;
  if (config.nextDataPosts) {
    return parseNextDataPosts(html, source, baseUrl);
  }
  if (config.jsonLdItemList) {
    return parseJsonLdItemList(html, baseUrl);
  }

  const $ = cheerio.load(html);
  const candidates: ImportedCandidate[] = [];
  const seenUrls = new Set<string>();

  $(config.itemSelector).each((_, item) => {
    const itemNode = $(item);
    const titleNode = config.titleSelector
      ? itemNode.find(config.titleSelector).first()
      : itemNode;
    const linkNode = config.linkSelector
      ? itemNode.find(config.linkSelector).first()
      : titleNode.is("a")
        ? titleNode
        : titleNode.closest("a").length
          ? titleNode.closest("a")
          : itemNode.find("a[href]").first();

    const rawLink = linkNode.attr(config.linkAttribute ?? "href");
    const originalUrl = rawLink ? absoluteUrl(rawLink, baseUrl) : null;
    const title =
      stripHtml(titleNode.attr("title") ?? titleNode.text()) ||
      stripHtml(linkNode.attr("title") ?? linkNode.text());

    if (!title || !originalUrl || seenUrls.has(originalUrl)) return;
    seenUrls.add(originalUrl);

    const excerpt = config.excerptSelector
      ? clampExcerpt(itemNode.find(config.excerptSelector).first().text())
      : null;
    const dateNode = config.dateSelector
      ? itemNode.find(config.dateSelector).first()
      : null;
    const rawDate = dateNode
      ? dateNode.attr(config.dateAttribute ?? "datetime") ?? dateNode.text()
      : null;

    candidates.push({
      title,
      originalUrl,
      excerpt,
      publishedAt: parseDate(rawDate),
      rawPayload: {
        listUrl: baseUrl,
        selectors: {
          itemSelector: config.itemSelector,
          titleSelector: config.titleSelector ?? null,
          linkSelector: config.linkSelector ?? null,
        },
      },
    });
  });

  return candidates.slice(0, 30);
}

function parseJsonLdItemList(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const anchorTitles = new Map<string, string>();

  $("a[href]").each((_, anchor) => {
    const node = $(anchor);
    const absolute = absoluteUrl(node.attr("href") ?? "", baseUrl);
    if (!absolute || anchorTitles.has(absolute)) return;

    const title = stripHtml(node.attr("title") ?? node.text());
    if (title) anchorTitles.set(absolute, title);
  });

  const candidates: ImportedCandidate[] = [];
  const seenUrls = new Set<string>();

  $('script[type="application/ld+json"]').each((_, script) => {
    const parsed = safeJsonParse($(script).text());
    for (const url of findItemListUrls(parsed)) {
      const originalUrl = absoluteUrl(url, baseUrl);
      if (!originalUrl || seenUrls.has(originalUrl)) continue;

      const title = anchorTitles.get(originalUrl);
      if (!title) continue;

      seenUrls.add(originalUrl);
      candidates.push({
        title,
        originalUrl,
        rawPayload: {
          listUrl: baseUrl,
          sourceType: "jsonLdItemList",
        },
      });
    }
  });

  return candidates.slice(0, 30);
}

export async function fetchMetaDescription(url: string) {
  const response = await politeFetch(url, { timeoutMs: 6_000 });
  const html = await response.text();
  const $ = cheerio.load(html);
  return clampExcerpt(
    $('meta[name="description"]').attr("content") ??
      $('meta[property="og:description"]').attr("content"),
  );
}

export async function fetchArticleMeta(url: string) {
  const response = await politeFetch(url, { timeoutMs: 6_000 });
  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    description: clampExcerpt(
      $('meta[name="description"]').attr("content") ??
        $('meta[property="og:description"]').attr("content"),
    ),
    publishedAt: parseDate(
      $('meta[property="article:published_time"]').attr("content") ??
        $('script[type="application/ld+json"]')
          .toArray()
          .map((node) => findJsonLdDate($(node).text()))
          .find(Boolean),
    ),
  };
}

function parseNextDataPosts(html: string, source: Source, baseUrl: string) {
  const $ = cheerio.load(html);
  const raw = $("#__NEXT_DATA__").first().text();
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as {
      props?: { pageProps?: { posts?: StartupXPost[] } };
    };
    const posts = data.props?.pageProps?.posts ?? [];

    return posts.flatMap((post) => {
      if (!post.slug || !post.title) return [];

      const originalUrl = absoluteUrl(`/${post.slug}`, source.homepage_url);
      if (!originalUrl) return [];

      return [
        {
          title: stripHtml(post.title),
          originalUrl,
          excerpt: clampExcerpt(post.excerpt ?? post.summary ?? post.meta_description),
          publishedAt: parseDate(post.date),
          rawPayload: {
            listUrl: baseUrl,
            sourceType: "nextDataPosts",
            category: post.cate ?? null,
          },
        },
      ];
    });
  } catch {
    return [];
  }
}

type StartupXPost = {
  slug?: string;
  title?: string;
  excerpt?: string;
  summary?: string;
  meta_description?: string;
  date?: string;
  cate?: string;
};

function findJsonLdDate(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return findDateInJson(parsed);
  } catch {
    return null;
  }
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function findItemListUrls(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap(findItemListUrls);
  }

  const record = value as Record<string, unknown>;
  if (record["@graph"]) return findItemListUrls(record["@graph"]);

  const type = record["@type"];
  const isItemList =
    type === "ItemList" || (Array.isArray(type) && type.includes("ItemList"));
  if (!isItemList) return [];

  const itemListElement = record.itemListElement;
  if (!Array.isArray(itemListElement)) return [];

  return itemListElement.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const itemRecord = item as Record<string, unknown>;
    if (typeof itemRecord.url === "string") return [itemRecord.url];

    const nestedItem = itemRecord.item;
    if (nestedItem && typeof nestedItem === "object") {
      const nestedRecord = nestedItem as Record<string, unknown>;
      return typeof nestedRecord.url === "string" ? [nestedRecord.url] : [];
    }

    return [];
  });
}

function findDateInJson(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const date = findDateInJson(item);
      if (date) return date;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.datePublished === "string") return record.datePublished;
  if (typeof record.dateModified === "string") return record.dateModified;
  if (record["@graph"]) return findDateInJson(record["@graph"]);
  return null;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const cleanValue = stripHtml(value).trim();
  const turkishDate = parseTurkishDate(cleanValue);
  if (turkishDate) return turkishDate;

  const date = new Date(cleanValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseTurkishDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})$/);
  if (!match) return null;

  const monthIndex = TURKISH_MONTHS[match[2].toLocaleLowerCase("tr-TR")];
  if (monthIndex === undefined) return null;

  return new Date(Date.UTC(Number(match[3]), monthIndex, Number(match[1]))).toISOString();
}

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11,
};
