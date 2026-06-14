"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Article } from "@/lib/types";

type FeedQuery = {
  search?: string;
  source?: string;
  section?: string;
  range?: string;
};

export function FeedList({
  initialArticles,
  total,
  pageSize,
  query,
}: {
  initialArticles: Article[];
  total: number;
  pageSize: number;
  query: FeedQuery;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(initialArticles.length);
  const [hasMore, setHasMore] = useState(initialArticles.length < total);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [readArticleIds, setReadArticleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [readActionArticleId, setReadActionArticleId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchedReadArticleIdsRef = useRef<Set<string>>(new Set());
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setArticles(initialArticles);
    setLoadedCount(initialArticles.length);
    setHasMore(initialArticles.length < total);
    setLoading(false);
    setReadArticleIds(new Set());
    fetchedReadArticleIdsRef.current = new Set();
  }, [initialArticles, queryKey, total]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setReadArticleIds(new Set());
      fetchedReadArticleIdsRef.current = new Set();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const missingArticleIds = articles
      .map((article) => article.id)
      .filter((articleId) => !fetchedReadArticleIdsRef.current.has(articleId));

    if (missingArticleIds.length === 0) return;
    for (const articleId of missingArticleIds) {
      fetchedReadArticleIdsRef.current.add(articleId);
    }

    Promise.all(
      chunk(missingArticleIds, 50).map((articleIds) => {
        const params = new URLSearchParams({
          articleIds: articleIds.join(","),
        });

        return fetch(`/api/reads?${params.toString()}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }).then((response) =>
          response.ok
            ? (response.json() as Promise<{ readArticleIds?: string[] }>)
            : null,
        );
      }),
    )
      .then((payloads) => {
        const incomingReadArticleIds = payloads.flatMap(
          (payload) => payload?.readArticleIds ?? [],
        );
        if (incomingReadArticleIds.length === 0) return;

        setReadArticleIds((current) => {
          const next = new Set(current);
          for (const articleId of incomingReadArticleIds) {
            next.add(articleId);
          }
          return next;
        });
      })
      .catch(() => undefined);
  }, [accessToken, articles]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const params = new URLSearchParams();
    if (query.search) params.set("q", query.search);
    if (query.source && query.source !== "all") params.set("source", query.source);
    if (query.section) params.set("section", query.section);
    if (query.range && query.range !== "all") params.set("range", query.range);
    params.set("limit", String(pageSize));
    params.set("offset", String(loadedCount));

    const response = await fetch(`/api/articles?${params.toString()}`);
    if (response.ok) {
      const payload = (await response.json()) as {
        articles: Article[];
        hasMore?: boolean;
        total: number;
      };
      setArticles((current) => mergeArticles(current, payload.articles));
      setLoadedCount((current) =>
        payload.articles.length === 0
          ? payload.total
          : Math.min(current + payload.articles.length, payload.total),
      );
      setHasMore(payload.hasMore ?? loadedCount + payload.articles.length < payload.total);
    }
    setLoading(false);
  }, [hasMore, loadedCount, loading, pageSize, query]);

  const toggleRead = useCallback(
    async (articleId: string) => {
      if (!accessToken) {
        window.location.href = `/giris?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      const wasRead = readArticleIds.has(articleId);
      setReadActionArticleId(articleId);
      setReadArticleIds((current) => {
        const next = new Set(current);
        if (wasRead) {
          next.delete(articleId);
        } else {
          next.add(articleId);
        }
        return next;
      });

      const response = await fetch(
        wasRead
          ? `/api/reads?articleId=${encodeURIComponent(articleId)}`
          : "/api/reads",
        {
          method: wasRead ? "DELETE" : "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: wasRead ? undefined : JSON.stringify({ articleId }),
        },
      );

      if (!response.ok) {
        setReadArticleIds((current) => {
          const next = new Set(current);
          if (wasRead) {
            next.add(articleId);
          } else {
            next.delete(articleId);
          }
          return next;
        });
      }

      setReadActionArticleId(null);
    },
    [accessToken, readArticleIds],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "700px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, queryKey]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard
            article={article}
            key={article.id}
            onReadToggle={toggleRead}
            read={readArticleIds.has(article.id)}
            readToggleDisabled={readActionArticleId === article.id}
          />
        ))}
      </div>
      <div
        aria-live="polite"
        className="mt-8 flex min-h-12 items-center justify-center"
        ref={sentinelRef}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-muted">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            Yükleniyor
          </span>
        ) : hasMore ? (
          <span className="text-sm text-muted">Aşağı indikçe haberler yüklenir.</span>
        ) : (
          <span className="text-sm text-muted">Tüm haberler yüklendi.</span>
        )}
      </div>
    </>
  );
}

function mergeArticles(current: Article[], incoming: Article[]) {
  const seen = new Set(current.map((article) => article.id));
  return [
    ...current,
    ...incoming.filter((article) => {
      if (seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    }),
  ];
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
