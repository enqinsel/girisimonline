import { EmptyState } from "@/components/empty-state";
import { FeedList } from "@/components/feed-list";
import { FeedFilters } from "@/components/feed-filters";
import { getArticleFeed, getSourceFilterOptions } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/supabase/clients";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = single(params.q);
  const source = single(params.source) ?? "all";
  const range = single(params.range) ?? "all";
  const pageSize = 12;
  const section = "startup";
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
            <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
              Girişim Online
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl">
              Girişim ve yatırım haberlerini tek yerden takip et.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Türkiye startup ekosistemi, yatırım haberleri ve girişim
              gündemini tek akışta keşfet.
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
          <h2 className="text-xl font-semibold text-ink">Son Haberler</h2>
          <span className="text-sm font-medium text-muted">
            {total} haber
          </span>
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
                : "Veri bağlantısı ve ilk import tamamlandıktan sonra gerçek kaynaklardan çekilen haberler burada görünecek."
            }
            title={
              databaseReady
                ? "Bu filtrelerle haber bulunamadı"
                : "Henüz gerçek haber import edilmedi"
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
