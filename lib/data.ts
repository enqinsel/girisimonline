import type { SupabaseClient } from "@supabase/supabase-js";
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

const sourceSelect = "*, source:sources!inner(id, name, slug, homepage_url, section)";
const legacySourceSelect = "*, source:sources(id, name, slug, homepage_url)";

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

export async function getSourceFilterOptions(section: SourceSection) {
  const sources = await getSources(section);
  if (sources.length === 0) return getDefaultSourceFilters(section);

  if (section === "startup") {
    const filters: SourceFilterOption[] = [];
    const hasWebrazzi = sources.some((source) => source.slug.startsWith("webrazzi"));
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
}

export async function getArticles(query: ArticleQuery = {}) {
  const { articles } = await getArticleFeed(query);
  return articles;
}

export async function getArticleFeed(query: ArticleQuery = {}) {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    const articles = filterSampleArticles(query);
    return { articles, total: sampleArticles.length };
  }

  const { data, error, count } = await fetchArticleFeed(supabase, query, {
    applySection: true,
    select: sourceSelect,
  });
  if (error && isMissingSectionError(error) && query.section === "startup") {
    const fallback = await fetchArticleFeed(supabase, query, {
      applySection: false,
      select: legacySourceSelect,
    });

    if (!fallback.error) {
      return {
        articles: (fallback.data ?? []) as Article[],
        total: fallback.count ?? 0,
      };
    }
  }

  if (error) {
    return { articles: [], total: 0 };
  }

  return { articles: (data ?? []) as Article[], total: count ?? 0 };
}

export async function getArticleBySlug(slug: string) {
  const supabase = getSupabaseAnonClient();
  if (!supabase) {
    return sampleArticles.find((article) => article.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(sourceSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error && isMissingSectionError(error)) {
    const fallback = await supabase
      .from("articles")
      .select(legacySourceSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!fallback.error) return fallback.data as Article | null;
  }

  if (error) return null;
  return data as Article | null;
}

async function fetchArticleFeed(
  supabase: SupabaseClient,
  query: ArticleQuery,
  options: { applySection: boolean; select: string },
) {
  let request = supabase
    .from("articles")
    .select(options.select, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("imported_at", { ascending: false })
    .range(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 20) - 1);

  if (options.applySection && query.section) {
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
    const sourceIds = await getSourceIdsForFilter(
      query.source,
      options.applySection ? query.section : undefined,
    );
    if (sourceIds.length === 0) {
      return { data: [], error: null, count: 0 };
    }
    request = request.in("source_id", sourceIds);
  }

  return request;
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

function filterSampleSources(section: SourceSection | undefined) {
  if (!section) return sampleSources;
  return sampleSources.filter((source) => source.section === section);
}

function filterSampleArticles(query: ArticleQuery) {
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

  return articles.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? 20));
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
