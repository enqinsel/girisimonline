"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Power,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Article, ImportLog, Source } from "@/lib/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { displayDate } from "@/lib/utils/date";

type AdminPayload = {
  sources: Source[];
  logs: ImportLog[];
  articles: Article[];
};

export function AdminDashboard() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  useEffect(() => {
    load();
    async function load() {
      const token = await getToken();
      if (!token) {
        window.location.href = "/giris?next=/ngin";
        return;
      }

      const response = await fetch("/api/admin/overview", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        setMessage("Bu ekran için admin yetkisi gerekiyor.");
        setLoading(false);
        return;
      }

      if (response.ok) {
        setPayload((await response.json()) as AdminPayload);
      } else {
        setMessage("Admin verileri alınamadı.");
      }
      setLoading(false);
    }
  }, [getToken]);

  async function refresh() {
    setLoading(true);
    setMessage(null);
    const token = await getToken();
    if (!token) return;
    const response = await fetch("/api/admin/overview", {
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.ok) setPayload((await response.json()) as AdminPayload);
    setLoading(false);
  }

  async function toggleSource(source: Source) {
    const token = await getToken();
    if (!token) return;
    const response = await fetch(`/api/admin/sources/${source.id}/toggle`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: !source.active }),
    });
    if (response.ok) refresh();
  }

  async function setArticleStatus(article: Article) {
    const token = await getToken();
    if (!token) return;
    const nextStatus = article.status === "hidden" ? "published" : "hidden";
    const response = await fetch(`/api/admin/articles/${article.id}/status`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
            Girişim Online
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">
            Yönetim Paneli
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Kaynak durumlarını, import loglarını ve haber görünürlüğünü yönet.
            Haber importu her gece 03.00 itibarıyla otomatik çalışır.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-primary"
            onClick={refresh}
            type="button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-md border border-border bg-card">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : payload ? (
        <div className="grid gap-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-ink">Kaynaklar</h2>
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead className="bg-background text-xs uppercase tracking-normal text-muted">
                    <tr>
                      <th className="px-4 py-3">Kaynak</th>
                      <th className="px-4 py-3">Bölüm</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Son Kontrol</th>
                      <th className="px-4 py-3">Son Başarı</th>
                      <th className="px-4 py-3">Son Eklenen</th>
                      <th className="px-4 py-3">Son Hata</th>
                      <th className="px-4 py-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payload.sources.map((source) => (
                      <tr key={source.id}>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {source.name}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {source.section === "economy" ? "Ekonomi" : "Girişim"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge active={source.active} />
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {formatMaybeDate(source.last_checked_at)}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {formatMaybeDate(source.last_success_at)}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {source.last_inserted_count}
                        </td>
                        <td className="max-w-72 truncate px-4 py-3 text-muted">
                          {source.last_error_message ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 font-semibold text-ink transition hover:border-primary"
                            onClick={() => toggleSource(source)}
                            type="button"
                          >
                            <Power className="h-4 w-4" aria-hidden="true" />
                            {source.active ? "Pasifleştir" : "Aktifleştir"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-ink">Haberler</h2>
            <div className="grid gap-3">
              {payload.articles.map((article) => (
                <article
                  className="rounded-md border border-border bg-card p-4"
                  key={article.id}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-normal text-muted">
                        {article.source?.name ?? "Kaynak"} ·{" "}
                        {displayDate(article.published_at, article.imported_at)}
                      </div>
                      <h3 className="font-semibold text-ink">{article.title}</h3>
                    </div>
                    <button
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-ink transition hover:border-primary"
                      onClick={() => setArticleStatus(article)}
                      type="button"
                    >
                      {article.status === "hidden" ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                      {article.status === "hidden" ? "Göster" : "Gizle"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-ink">Import Logları</h2>
            <div className="grid gap-2">
              {payload.logs.map((log) => (
                <div
                  className="rounded-md border border-border bg-card px-4 py-3 text-sm"
                  key={log.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">
                      {log.source?.name ?? "Kaynak"}
                    </span>
                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold uppercase text-muted">
                      {log.status}
                    </span>
                    <span className="text-muted">
                      Bulunan {log.found_count}, eklenen {log.inserted_count},
                      atlanan {log.skipped_count}
                    </span>
                    <span className="ml-auto text-muted">
                      {formatMaybeDate(log.created_at)}
                    </span>
                  </div>
                  {log.error_message ? (
                    <p className="mt-2 text-muted">{log.error_message}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-primary-dark"
          : "rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-muted"
      }
    >
      {active ? "active" : "disabled"}
    </span>
  );
}

function formatMaybeDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
