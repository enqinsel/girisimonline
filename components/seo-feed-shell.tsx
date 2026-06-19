import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { FeedList } from "@/components/feed-list";
import type { Article } from "@/lib/types";

type LinkItem = {
  label: string;
  href: string;
};

type FeedQuery = {
  search?: string;
  source?: string;
  section?: string;
  range?: string;
};

export function SeoFeedShell({
  articles,
  description,
  emptyDescription,
  emptyTitle,
  eyebrow,
  pageSize,
  query,
  relatedLinks = [],
  sourceLinks = [],
  title,
  total,
}: {
  articles: Article[];
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  pageSize: number;
  query: FeedQuery;
  relatedLinks?: LinkItem[];
  sourceLinks?: LinkItem[];
  title: string;
  total: number;
}) {
  return (
    <main>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {description}
            </p>
          </div>

          {relatedLinks.length > 0 ? (
            <nav className="mt-6 flex flex-wrap gap-2" aria-label="İlgili sayfalar">
              {relatedLinks.map((item) => (
                <Link
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary-dark"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          ) : null}

          {sourceLinks.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-normal text-muted">
                Öne çıkan kaynaklar
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {sourceLinks.map((item) => (
                  <Link
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary-dark"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Güncel Haberler</h2>
          <span className="text-sm font-medium text-muted">{total} haber</span>
        </div>
        {articles.length > 0 ? (
          <FeedList
            initialArticles={articles}
            pageSize={pageSize}
            query={query}
            total={total}
          />
        ) : (
          <EmptyState description={emptyDescription} title={emptyTitle} />
        )}
      </section>
    </main>
  );
}
