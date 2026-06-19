import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import { BookmarkButton } from "@/components/bookmark-button";
import { JsonLd } from "@/components/json-ld";
import { NoteEditor } from "@/components/note-editor";
import { ReadMarker } from "@/components/read-marker";
import { getArticleBySlug } from "@/lib/data";
import {
  absoluteUrl,
  articleCanonicalUrl,
  articleJsonLd,
  articlePath,
  breadcrumbJsonLd,
  isIndexableArticle,
  siteName,
  truncateSeoText,
} from "@/lib/seo";
import { displayDate } from "@/lib/utils/date";

export const revalidate = 300;

const getCachedArticleBySlug = cache(getArticleBySlug);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Haber bulunamadı",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const description = truncateSeoText(
    article.excerpt ??
      "Bu haber Girişim Online üzerinde kısa açıklama ve kaynak yönlendirmesiyle listelenir.",
  );
  const canonicalPath = articlePath(article);
  const canonicalUrl = articleCanonicalUrl(article);
  const shouldIndex = isIndexableArticle(article);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    openGraph: {
      title: article.title,
      description,
      siteName,
      type: "article",
      url: canonicalUrl,
      publishedTime: article.published_at ?? article.imported_at,
      modifiedTime: article.imported_at,
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

export default async function ArticleDetail({ params }: PageProps) {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);
  if (!article) notFound();
  const backHref = article.source?.section === "economy" ? "/ekonomi" : "/";
  const backLabel = article.source?.section === "economy" ? "Ekonomi" : "Son Haberler";
  const sourceHref = article.source ? `/kaynaklar/${article.source.slug}` : null;
  const breadcrumbSection =
    article.source?.section === "economy"
      ? { name: "Ekonomi", url: "/ekonomi" }
      : { name: "Son Haberler", url: "/" };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Girişim Online", url: "/" },
          breadcrumbSection,
          { name: article.title, url: articlePath(article) },
        ])}
      />
      <ReadMarker articleId={article.id} />
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary-dark"
        href={backHref}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <article className="mt-6 rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
          {sourceHref ? (
            <Link
              className="rounded-md border border-border bg-background px-2 py-1 text-ink transition hover:border-primary hover:text-primary-dark"
              href={sourceHref}
            >
              {article.source?.name ?? "Kaynak"}
            </Link>
          ) : (
            <span className="rounded-md border border-border bg-background px-2 py-1 text-ink">
              Kaynak
            </span>
          )}
          <span className="rounded-md border border-border bg-background px-2 py-1">
            {article.language.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 normal-case">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={article.published_at ?? article.imported_at}>
              {displayDate(article.published_at, article.imported_at)}
            </time>
          </span>
        </div>

        <h1 className="text-3xl font-semibold leading-tight tracking-normal text-ink sm:text-4xl">
          {article.title}
        </h1>

        {article.excerpt ? (
          <section className="mt-6 rounded-md border border-border bg-background p-5">
            <h2 className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
              Kısa Özet
            </h2>
            <p className="mt-2 text-base leading-8 text-muted">{article.excerpt}</p>
          </section>
        ) : null}

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Girişim Online yalnızca kısa özet ve kaynak yönlendirmesi gösterir.
          Bu içerik {article.source?.name ?? "orijinal kaynak"} üzerinde
          yayınlanmıştır; haberin tamamı için orijinal kaynağa geç.
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            href={article.original_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Haberi Kaynağında Oku
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <BookmarkButton articleId={article.id} />
        </div>
      </article>

      <div className="mt-6">
        <NoteEditor articleId={article.id} returnPath={`/haber/${article.slug}`} />
      </div>
    </main>
  );
}
