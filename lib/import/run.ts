import type { SupabaseClient } from "@supabase/supabase-js";
import type { Source } from "@/lib/types";
import { parseHtmlSource, fetchArticleMeta, fetchMetaDescription } from "@/lib/import/html";
import { wait } from "@/lib/import/fetch";
import { parseRssSource, type ImportedCandidate } from "@/lib/import/rss";
import { getSupabaseServiceClient } from "@/lib/supabase/clients";
import { clampExcerpt, shortHash, slugify } from "@/lib/utils/text";
import { normalizeArticleUrl } from "@/lib/utils/url";

type SourceResult = {
  sourceId: string;
  sourceName: string;
  status: "success" | "partial" | "error";
  foundCount: number;
  insertedCount: number;
  skippedCount: number;
  errorMessage: string | null;
};

type RunResult = {
  status: "success" | "partial" | "error";
  results: SourceResult[];
};

export async function runImport() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    throw new Error("Supabase service client yapılandırılmamış");
  }

  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true)
    .neq("type", "product_hunt")
    .order("name", { ascending: true });

  if (error) throw error;

  const sources = (data ?? []) as Source[];
  const results: SourceResult[] = [];

  for (const source of sources) {
    results.push(await importSourceSafely(supabase, source));
    await wait(700);
  }

  const hasError = results.some((result) => result.status === "error");
  const hasSuccess = results.some((result) => result.status === "success");

  return {
    status: hasError ? (hasSuccess ? "partial" : "error") : "success",
    results,
  } satisfies RunResult;
}

async function importSourceSafely(supabase: SupabaseClient, source: Source) {
  await supabase
    .from("sources")
    .update({
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", source.id);

  try {
    const candidates =
      source.type === "rss"
        ? await importRssWithHtmlFallback(source)
        : await parseHtmlSource(source);

    const result = await insertCandidates(supabase, source, candidates);

    await supabase.from("import_logs").insert({
      source_id: source.id,
      status: "success",
      found_count: candidates.length,
      inserted_count: result.insertedCount,
      skipped_count: result.skippedCount,
    });

    await supabase
      .from("sources")
      .update({
        last_success_at: new Date().toISOString(),
        last_error_message: null,
        last_inserted_count: result.insertedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", source.id);

    return {
      sourceId: source.id,
      sourceName: source.name,
      status: "success",
      foundCount: candidates.length,
      insertedCount: result.insertedCount,
      skippedCount: result.skippedCount,
      errorMessage: null,
    } satisfies SourceResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";

    await supabase.from("import_logs").insert({
      source_id: source.id,
      status: "error",
      found_count: 0,
      inserted_count: 0,
      skipped_count: 0,
      error_message: message,
    });

    await supabase
      .from("sources")
      .update({
        last_error_message: message,
        last_inserted_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", source.id);

    return {
      sourceId: source.id,
      sourceName: source.name,
      status: "error",
      foundCount: 0,
      insertedCount: 0,
      skippedCount: 0,
      errorMessage: message,
    } satisfies SourceResult;
  }
}

async function importRssWithHtmlFallback(source: Source) {
  try {
    return await parseRssSource(source);
  } catch (error) {
    if (!source.parser_config) throw error;
    return parseHtmlSource(source);
  }
}

async function insertCandidates(
  supabase: SupabaseClient,
  source: Source,
  candidates: ImportedCandidate[],
) {
  let insertedCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    const normalizedUrl = normalizeArticleUrl(
      candidate.canonicalUrl ?? candidate.originalUrl,
      source.homepage_url,
    );

    if (!normalizedUrl) {
      skippedCount += 1;
      continue;
    }

    const publishedPart = candidate.publishedAt ?? "";
    const uniqueHash = shortHash(
      `${source.id}:${normalizedUrl}:${candidate.title}:${publishedPart}`,
      16,
    );
    const publishedAt = await resolvePublishedAt(source, candidate, normalizedUrl);
    const excerpt = await resolveExcerpt(source, candidate, normalizedUrl);
    const slug = await buildUniqueSlug(supabase, candidate.title, uniqueHash);

    const { error } = await supabase.from("articles").insert({
      source_id: source.id,
      title: candidate.title,
      slug,
      original_url: candidate.originalUrl,
      canonical_url: candidate.canonicalUrl ?? null,
      normalized_url: normalizedUrl,
      excerpt: clampExcerpt(excerpt),
      published_at: publishedAt,
      imported_at: new Date().toISOString(),
      language: source.language,
      status: "published",
      unique_hash: uniqueHash,
      raw_payload: candidate.rawPayload ?? null,
    });

    if (!error) {
      insertedCount += 1;
      continue;
    }

    if (isDuplicateError(error)) {
      await updateMissingArticleMetadata(supabase, normalizedUrl, excerpt, publishedAt);
      skippedCount += 1;
      continue;
    }

    throw error;
  }

  return { insertedCount, skippedCount };
}

async function resolvePublishedAt(
  source: Source,
  candidate: ImportedCandidate,
  normalizedUrl: string,
) {
  if (candidate.publishedAt) return candidate.publishedAt;
  if (!source.parser_config?.allowDateMetaFallback) return null;

  try {
    const meta = await fetchArticleMeta(normalizedUrl);
    await wait(250);
    return meta.publishedAt;
  } catch {
    return null;
  }
}

async function resolveExcerpt(
  source: Source,
  candidate: ImportedCandidate,
  normalizedUrl: string,
) {
  const direct = clampExcerpt(candidate.excerpt);
  if (direct) return direct;

  if (source.type !== "html" && !source.parser_config?.allowMetaFallback) {
    return null;
  }

  try {
    const metaDescription = await fetchMetaDescription(normalizedUrl);
    await wait(250);
    return clampExcerpt(metaDescription);
  } catch {
    return null;
  }
}

async function updateMissingArticleMetadata(
  supabase: SupabaseClient,
  normalizedUrl: string,
  excerpt: string | null,
  publishedAt: string | null,
) {
  const { data } = await supabase
    .from("articles")
    .select("id, excerpt, published_at")
    .eq("normalized_url", normalizedUrl)
    .maybeSingle();

  if (!data) return;

  const update: Record<string, string> = {};
  if (!data.excerpt && excerpt) update.excerpt = excerpt;
  if (!data.published_at && publishedAt) update.published_at = publishedAt;
  if (Object.keys(update).length === 0) return;

  update.updated_at = new Date().toISOString();
  await supabase.from("articles").update(update).eq("id", data.id);
}

async function buildUniqueSlug(
  supabase: SupabaseClient,
  title: string,
  uniqueHash: string,
) {
  const base = slugify(title);
  const { data } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", base)
    .maybeSingle();

  if (!data) return base;
  return `${base}-${uniqueHash.slice(0, 6)}`;
}

function isDuplicateError(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    Boolean(error.message?.toLowerCase().includes("duplicate key"))
  );
}
