import Link from "next/link";
import { ArrowUpRight, CalendarDays, Eye, EyeOff } from "lucide-react";
import type { Article } from "@/lib/types";
import { BookmarkButton } from "@/components/bookmark-button";
import { displayDate, relativeDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export function ArticleCard({
  article,
  read = false,
  readToggleDisabled = false,
  onReadToggle,
}: {
  article: Article;
  read?: boolean;
  readToggleDisabled?: boolean;
  onReadToggle?: (articleId: string) => void;
}) {
  return (
    <article
      className={cn(
        "rounded-md border border-border bg-card p-5 shadow-sm transition hover:border-primary/60 hover:shadow-soft",
        read && "bg-slate-50 opacity-75 hover:opacity-100",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
        <span className="rounded-md border border-border bg-background px-2 py-1 text-ink">
          {article.source?.name ?? "Kaynak"}
        </span>
        <span className="rounded-md border border-border bg-background px-2 py-1">
          {article.language.toUpperCase()}
        </span>
        <span className="inline-flex items-center gap-1 normal-case">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          <time dateTime={article.published_at ?? article.imported_at}>
            {relativeDate(article.published_at, article.imported_at)}
          </time>
        </span>
        {read ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-emerald-50 px-2 py-1 normal-case text-primary-dark">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Okundu
          </span>
        ) : null}
      </div>
      <Link href={`/haber/${article.slug}`}>
        <h2
          className={cn(
            "text-xl font-semibold leading-snug tracking-normal text-ink transition hover:text-primary-dark",
            read && "text-muted",
          )}
        >
          {article.title}
        </h2>
      </Link>
      {article.excerpt ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {article.excerpt}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <BookmarkButton articleId={article.id} compact />
        {onReadToggle ? (
          <button
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold transition hover:border-primary disabled:cursor-wait disabled:opacity-70",
              read ? "text-muted hover:text-ink" : "text-ink hover:text-primary-dark",
            )}
            disabled={readToggleDisabled}
            onClick={() => onReadToggle(article.id)}
            type="button"
          >
            {read ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            {read ? "Okunmadı Yap" : "Okundu Yap"}
          </button>
        ) : null}
        <a
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          href={article.original_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Kaynağa Git
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <span className="ml-auto text-xs text-muted">
          {displayDate(article.published_at, article.imported_at)}
        </span>
      </div>
    </article>
  );
}
