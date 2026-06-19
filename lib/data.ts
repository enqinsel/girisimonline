import { unstable_cache } from "next/cache";
import type { Article, Source, SourceSection } from "@/lib/types";
import { sampleArticles, sampleSources } from "@/lib/sample-data";
import { getSupabaseAnonClient } from "@/lib/supabase/clients";

export type SourceFilterOption = {
  label: string;
  value: string;
};

type ArticleQuery = {
  search?: string;
  source?: string;
  section?: SourceSection;
  range?: string;
  limit?: number;
  offset?: number;
};

type ArticleFeedResult = {
  articles: Article[];
  total: number;
  hasMore: boolean;
};

type ArticleRowsResult = {
  articles: Article[];
  hasMore: boolean;
  error: SerializedError | null;
};

type ArticleTotalResult = {
  total: number;
  error: SerializedError | null;
};

type SerializedError = {
  code?: string;
  message?: string;
};

type SectionFilterMode = "article" | "source";

const CACHE_REVALIDATE_SECONDS = 300;
const articlePublicFields =
  "id, source_id, title, slug, original_url, canonical_url, normalized_url, excerpt, published_at, imported_at, language, section, status, unique_hash, created_at, updated_at";
const legacyArticlePublicFields =
  "id, source_id, title, slug, original_url, canonical_url, normalized_url, excerpt, published_at, imported_at, language, status, unique_hash, created_at, updated_at";
const sourceRelationSelect = "source:sources(id, name, slug, homepage_url, section)";
const sourceRelationInnerSelect =
  "source:sources!inner(id, name, slug, homepage_url, section)";
const articleFeedSelect = `${articlePublicFields}, ${sourceRelationInnerSelect}`;
const legacyArticleFeedSelect =
  `${legacyArticlePublicFields}, ${sourceRelationInnerSelect}`;
export const articlePublicSelectWithSource =
  `${articlePublicFields}, ${sourceRelationSelect}`;
export const legacyArticlePublicSelectWithSource =
  `${legacyArticlePublicFields}, ${sourceRelationSelect}`;

export async function getSources(section?: SourceSection) {
  const supabase = getSupabaseAnonClient();
  if (!supabase) return filterSampleSources(section);

  let request = supabase
    .from("sources")
    .select("*")
    .order("name", { ascending: true });

  if (section) request = request.eq("section", section);

  const { data, error } = await request;
  if (error) return [];
  return (data ?? []) as Source[];
}

export async function getSourceBySlug(slug: string) {
  const sources = await getSources();
  return sources.find((source) => source.slug === slug) ?? null;
}

export async function getSourceFilterOptions(section: SourceSection) {
  return getCachedSourceFilterOptions(section);
}

const getCachedSourceFilterOptions = unstable_cache(
  async (section: SourceSection) => {
    const sources = await getSources(section);
    if (sources.length === 0) return getDefaultSourceFilters(section);

    if (section === "startup") {
      const filters: SourceFilterOption[] = [];
      const hasWebrazzi = sources.some((source) =>
        source.slug.startsWith("webrazzi"),
      );
      if (hasWebrazzi) filters.push({ label: "Webrazzi", value: "webrazzi" });

      for (const source of sources) {
        if (source.slug.startsWith("webrazzi") || source.type === "product_hunt") {
          continue;
        }
        filters.push({ label: source.name, value: source.slug });
      }

      return filters;
    }

    return sources.map((source) => ({
      label: source.name,
      value: source.slug,
    }));
  },
  ["source-filter-options-v1"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

export async function getArticles(query: ArticleQuery = {}) {
  const { articles } = await getArticleFeed(query);
  return articles;
}

export async function getArticleFeed(
  query: ArticleQuery = {},
): Promise<ArticleFeedResult> {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    const articles = filterSampleArticles(query);
    return {
      articles,
      hasMore: articles.length >= (query.limit ?? 20),
      total: getFilteredSampleArticles(query).length,
    };
  }

  const normalizedQuery = normalizeArticleQuery(query);
  let sectionMode: SectionFilterMode = "article";
  let rows = await getCachedArticleRows(normalizedQuery, sectionMode);

  if (rows.error && isMissingSectionError(rows.error)) {
    sectionMode = "source";
    rows = await getCachedArticleRows(normalizedQuery, sectionMode);
  }

  if (rows.error) {
    return { articles: [], hasMore: false, total: 0 };
  }

  const totalResult = await getCachedArticleTotal(
    normalizeCountQuery(normalizedQuery),
    sectionMode,
  );

  return {
    articles: rows.articles,
    hasMore: rows.hasMore,
    total: totalResult.error ? rows.articles.length : totalResult.total,
  };
}

export async function getArticleBySlug(slug: string) {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return sampleArticles.find((article) => article.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(articlePublicSelectWithSource)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error && isMissingSectionError(error)) {
    const fallback = await supabase
      .from("articles")
      .select(legacyArticlePublicSelectWithSource)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!fallback.error) return fallback.data as Article | null;
  }

  if (error) return null;
  return data as Article | null;
}

const getCachedArticleRows = unstable_cache(
  fetchArticleRows,
  ["article-feed-rows-v2"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

const getCachedArticleTotal = unstable_cache(
  fetchArticleTotal,
  ["article-feed-total-v2"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

async function fetchArticleRows(
  query: ArticleQuery,
  sectionMode: SectionFilterMode,
): Promise<ArticleRowsResult> {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    const articles = filterSampleArticles(query);
    return {
      articles,
      error: null,
      hasMore: articles.length >= (query.limit ?? 20),
    };
  }

  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const select =
    sectionMode === "article" ? articleFeedSelect : legacyArticleFeedSelect;
  let request = supabase
    .from("articles")
    .select(select)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("imported_at", { ascending: false })
    .range(offset, offset + limit);

  if (sectionMode === "article" && query.section) {
    request = request.eq("section", query.section);
  } else if (sectionMode === "source" && query.section) {
    request = request.eq("source.section", query.section);
  }

  if (query.search) {
    const term = query.search.replace(/[%_]/g, "");
    request = request.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const rangeStart = getRangeStart(query.range);
  if (rangeStart) {
    const iso = rangeStart.toISOString();
    request = request.or(
      `published_at.gte.${iso},and(published_at.is.null,imported_at.gte.${iso})`,
    );
  }

  if (query.source && query.source !== "all") {
    const sourceIds = await getSourceIdsForFilter(query.source, query.section);
    if (sourceIds.length === 0) {
      return { articles: [], error: null, hasMore: false };
    }
    request = request.in("source_id", sourceIds);
  }

  const { data, error } = await request;
  if (error) {
    return { articles: [], error: serializeError(error), hasMore: false };
  }

  const rows = ((data ?? []) as unknown as Article[]).slice(0, limit);
  return {
    articles: rows,
    error: null,
    hasMore: (data ?? []).length > limit,
  };
}

async function fetchArticleTotal(
  query: ArticleQuery,
  sectionMode: SectionFilterMode,
): Promise<ArticleTotalResult> {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return { error: null, total: getFilteredSampleArticles(query).length };
  }

  const select =
    sectionMode === "source" ? "id, source:sources!inner(id, section)" : "id";
  let request = supabase
    .from("articles")
    .select(select, { count: "exact", head: true })
    .eq("status", "published");

  if (sectionMode === "article" && query.section) {
    request = request.eq("section", query.section);
  } else if (sectionMode === "source" && query.section) {
    request = request.eq("source.section", query.section);
  }

  if (query.search) {
    const term = query.search.replace(/[%_]/g, "");
    request = request.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const rangeStart = getRangeStart(query.range);
  if (rangeStart) {
    const iso = rangeStart.toISOString();
    request = request.or(
      `published_at.gte.${iso},and(published_at.is.null,imported_at.gte.${iso})`,
    );
  }

  if (query.source && query.source !== "all") {
    const sourceIds = await getSourceIdsForFilter(query.source, query.section);
    if (sourceIds.length === 0) return { error: null, total: 0 };
    request = request.in("source_id", sourceIds);
  }

  const { count, error } = await request;
  if (error) return { error: serializeError(error), total: 0 };
  return { error: null, total: count ?? 0 };
}

async function getSourceIdsForFilter(value: string, section?: SourceSection) {
  const supabase = getSupabaseAnonClient();
  if (!supabase) return [];

  if (value === "webrazzi") {
    let request = supabase
      .from("sources")
      .select("id")
      .ilike("name", "Webrazzi%");
    if (section) request = request.eq("section", section);

    const { data, error } = await request;
    if (error && section && isMissingSectionError(error)) {
      return getSourceIdsForFilter(value);
    }
    return (data ?? []).map((source) => source.id as string);
  }

  let request = supabase
    .from("sources")
    .select("id")
    .eq("slug", value);

  if (section) request = request.eq("section", section);

  const { data, error } = await request;
  if (error && section && isMissingSectionError(error)) {
    return getSourceIdsForFilter(value);
  }
  return (data ?? []).map((source) => source.id as string);
}

function isMissingSectionError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "42703" || message.includes("section");
}

function serializeError(error: { code?: string; message?: string }) {
  return {
    code: error.code,
    message: error.message,
  } satisfies SerializedError;
}

function normalizeArticleQuery(query: ArticleQuery) {
  return {
    search: query.search?.trim() || undefined,
    source: query.source ?? "all",
    section: query.section,
    range: query.range ?? "all",
    limit: Math.max(query.limit ?? 20, 1),
    offset: Math.max(query.offset ?? 0, 0),
  } satisfies ArticleQuery;
}

function normalizeCountQuery(query: ArticleQuery) {
  return {
    search: query.search,
    source: query.source,
    section: query.section,
    range: query.range,
  } satisfies ArticleQuery;
}

function filterSampleSources(section: SourceSection | undefined) {
  if (!section) return sampleSources;
  return sampleSources.filter((source) => source.section === section);
}

function filterSampleArticles(query: ArticleQuery) {
  const articles = getFilteredSampleArticles(query);
  return articles.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 20));
}

function getFilteredSampleArticles(query: ArticleQuery) {
  let articles = [...sampleArticles];

  if (query.search) {
    const search = query.search.toLocaleLowerCase("tr-TR");
    articles = articles.filter(
      (article) =>
        article.title.toLocaleLowerCase("tr-TR").includes(search) ||
        article.excerpt?.toLocaleLowerCase("tr-TR").includes(search),
    );
  }

  if (query.source && query.source !== "all") {
    articles = articles.filter((article) => article.source?.slug === query.source);
  }

  if (query.section) {
    articles = articles.filter((article) => article.source?.section === query.section);
  }

  return articles;
}

function getDefaultSourceFilters(section: SourceSection) {
  if (section === "economy") {
    return [
      { label: "Bloomberg HT", value: "bloomberg-ht" },
      { label: "CNBC-e", value: "cnbce" },
      { label: "Doviz.com", value: "doviz-com" },
      { label: "Dünya", value: "dunya" },
    ] satisfies SourceFilterOption[];
  }

  return [
    { label: "Webrazzi", value: "webrazzi" },
    { label: "egirişim", value: "egirisim" },
    { label: "StartupX", value: "startupx" },
    { label: "Girişim Haber", value: "girisim-haber" },
    { label: "StartupCentrum", value: "startupcentrum" },
  ] satisfies SourceFilterOption[];
}

function getRangeStart(range: string | undefined) {
  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "week") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  return null;
}
