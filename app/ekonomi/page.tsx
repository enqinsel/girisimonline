import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { FeedFilters } from "@/components/feed-filters";
import { FeedList } from "@/components/feed-list";
import { getArticleFeed, getSourceFilterOptions } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/clients";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ekonomi",
  description:
    "Bloomberg HT, CNBC-e, Doviz.com ve Dünya kaynaklarından ekonomi ve finans haberlerini takip et.",
  openGraph: {
    title: "Ekonomi | Girişim Online",
    description:
      "Ekonomi ve finans gündemini kısa özetler ve kaynak bağlantılarıyla takip et.",
    siteName: "Girişim Online",
    type: "website",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function EconomyPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = single(params.q);
  const source = single(params.source) ?? "all";
  const range = single(params.range) ?? "all";
  const pageSize = 12;
  const section = "economy";
  const { articles, total } = await getArticleFeed({
    search,
    source,
    section,
    range,
    limit: pageSize,
    offset: 0,
  });
  const sourceFilters = await getSourceFilterOptions(section);
  const databaseReady = hasSupabaseEnv();

  return (
    <main>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-accent">
              Ekonomi
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl">
              Ekonomi ve finans haberlerini tek akışta takip et.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Piyasa gündemi, ekonomi haberleri ve finans dünyasındaki önemli
              gelişmeleri kısa özetlerle keşfet.
            </p>
            <p className="mt-4 inline-flex rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted shadow-sm">
              Bu sayfadaki haberler bilgilendirme amaçlıdır; yatırım tavsiyesi
              değildir.
            </p>
          </div>
          <div className="mt-8">
            <FeedFilters
              search={search}
              source={source}
              sourceFilters={sourceFilters}
              range={range}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Ekonomi Haberleri</h2>
          <span className="text-sm font-medium text-muted">{total} haber</span>
        </div>
        {articles.length > 0 ? (
          <FeedList
            initialArticles={articles}
            pageSize={pageSize}
            query={{ range, search, section, source }}
            total={total}
          />
        ) : (
          <EmptyState
            description={
              databaseReady
                ? "Arama veya filtreleri sadeleştirerek tekrar deneyebilirsin."
                : "Veri bağlantısı ve ilk import tamamlandıktan sonra ekonomi haberleri burada görünecek."
            }
            title={
              databaseReady
                ? "Bu filtrelerle ekonomi haberi bulunamadı"
                : "Henüz ekonomi haberi import edilmedi"
            }
          />
        )}
      </section>
    </main>
  );
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
