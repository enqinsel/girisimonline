"use client";

import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BookmarkWithArticle } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { NoteEditor } from "@/components/note-editor";
import { ProtectedListShell } from "@/components/protected-list-shell";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { displayDate } from "@/lib/utils/date";

export function SavedArticlesClient() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [items, setItems] = useState<BookmarkWithArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    async function load() {
      if (!supabase) {
        window.location.href = "/giris?next=/kaydedilenler";
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        window.location.href = "/giris?next=/kaydedilenler";
        return;
      }

      const response = await fetch("/api/bookmarks", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          bookmarks: BookmarkWithArticle[];
        };
        setItems(payload.bookmarks);
      }
      setLoading(false);
    }
  }, [supabase]);

  async function remove(articleId: string) {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const response = await fetch(`/api/bookmarks?articleId=${articleId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setItems((current) =>
        current.filter((item) => item.article_id !== articleId),
      );
    }
  }

  return (
    <ProtectedListShell
      description="Kaydettiğin haberleri hızlıca geri dönmek ve kendi notlarınla takip etmek için kullan."
      loading={loading}
      title="Kaydedilenler"
    >
      {items.length === 0 ? (
        <EmptyState
          description="İlgini çeken haberlerde Kaydet butonunu kullanarak buraya ekleyebilirsin."
          title="Henüz kaydedilen haber yok"
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <article
              className="rounded-md border border-border bg-card p-5 shadow-sm"
              key={item.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
                    <span className="rounded-md border border-border bg-background px-2 py-1 text-ink">
                      {item.article.source?.name ?? "Kaynak"}
                    </span>
                    <span>
                      {displayDate(
                        item.article.published_at,
                        item.article.imported_at,
                      )}
                    </span>
                  </div>
                  <Link href={`/haber/${item.article.slug}`}>
                    <h2 className="text-xl font-semibold text-ink transition hover:text-primary-dark">
                      {item.article.title}
                    </h2>
                  </Link>
                  {item.article.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {item.article.excerpt}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    href={item.article.original_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Kaynağa Git
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-ink transition hover:border-primary"
                    onClick={() => remove(item.article_id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Kaydı Kaldır
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <NoteEditor
                  articleId={item.article_id}
                  initialBody={item.note?.body ?? ""}
                  returnPath="/kaydedilenler"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </ProtectedListShell>
  );
}
