"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { NoteEditor } from "@/components/note-editor";
import { ProtectedListShell } from "@/components/protected-list-shell";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Article } from "@/lib/types";
import { displayDate } from "@/lib/utils/date";

type NoteItem = {
  id: string;
  article_id: string;
  body: string;
  updated_at: string;
  article: Article;
};

export function NotesClient() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [items, setItems] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    async function load() {
      if (!supabase) {
        window.location.href = "/giris?next=/notlarim";
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        window.location.href = "/giris?next=/notlarim";
        return;
      }

      const response = await fetch("/api/notes", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const payload = (await response.json()) as { notes: NoteItem[] };
        setItems(payload.notes);
      }
      setLoading(false);
    }
  }, [supabase]);

  return (
    <ProtectedListShell
      description="Not eklediğin haberleri ve kişisel takip maddelerini burada gör."
      loading={loading}
      title="Notlarım"
    >
      {items.length === 0 ? (
        <EmptyState
          description="Haber detayında veya kaydedilenlerde not eklediğinde burada listelenir."
          title="Henüz not yok"
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <article
              className="rounded-md border border-border bg-card p-5 shadow-sm"
              key={item.id}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
                <span className="rounded-md border border-border bg-background px-2 py-1 text-ink">
                  {item.article.source?.name ?? "Kaynak"}
                </span>
                <span>
                  {displayDate(item.article.published_at, item.article.imported_at)}
                </span>
              </div>
              <Link href={`/haber/${item.article.slug}`}>
                <h2 className="text-xl font-semibold text-ink transition hover:text-primary-dark">
                  {item.article.title}
                </h2>
              </Link>
              <div className="mt-4">
                <NoteEditor
                  articleId={item.article_id}
                  initialBody={item.body}
                  returnPath="/notlarim"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </ProtectedListShell>
  );
}
