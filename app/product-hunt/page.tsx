import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ProductHuntNotesDrawer,
  ProductHuntNoteTrigger,
  type ProductHuntNoteProduct,
} from "@/components/product-hunt-notes-drawer";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Compass,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Link as LinkIcon,
  MessageCircle,
  Package,
  Rocket,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  getProductHuntLaunches,
  type ProductHuntLaunch,
} from "@/lib/product-hunt";

export const metadata: Metadata = {
  title: "Product Hunt",
  description:
    "Product Hunt üzerinde öne çıkan yeni ürün lansmanlarını Girişim Online içinde takip et.",
};

export const revalidate = 900;

type TopicInsight = {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  followersCount: number;
  postsCount: number;
  launchCount: number;
  launches: ProductHuntLaunch[];
};

type MakerInsight = {
  id: string;
  name: string;
  username: string;
  headline: string | null;
  url: string;
  launchId: string;
  launchName: string;
  launchUrl: string;
  launchCount: number;
  votesCount: number;
  bestRank: number | null;
};

type CommentInsight = ProductHuntLaunch["comments"][number] & {
  launchName: string;
  launchUrl: string;
  launchRank: number | null;
};

type CollectionInsight = ProductHuntLaunch["collections"][number] & {
  launchId: string;
  launchName: string;
  launchRank: number | null;
};

const productHuntFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("tr-TR");

export default async function ProductHuntPage() {
  const result = await getProductHuntLaunches(24);
  const launches = result.launches;
  const topLaunch = launches[0] ?? null;
  const noteProducts = launches.map(toProductHuntNoteProduct);
  const topicInsights = getTopicInsights(launches);
  const makerInsights = getMakerInsights(launches);
  const commentInsights = getCommentInsights(launches);
  const collectionInsights = getCollectionInsights(launches);
  const stats = getProductHuntStats(launches, topicInsights);

  return (
    <main className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-[#da552f]">
                <Rocket className="h-4 w-4" aria-hidden="true" />
                Product Hunt
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                Bugünün launch radarını aç.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Sıralama, konu yoğunluğu, maker profilleri, topluluk yorumları
                ve koleksiyon rotaları tek sayfada güncellenir.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex h-11 items-center gap-2 rounded-md border border-[#da552f]/25 bg-[#fff3ef] px-4 text-sm font-semibold text-[#b64020] transition hover:border-[#da552f]/50 hover:bg-[#ffe8df]"
                href="#radar"
              >
                Radara İn
                <Compass className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                className="inline-flex h-11 items-center gap-2 rounded-md bg-[#da552f] px-4 text-sm font-semibold text-white transition hover:bg-[#c84d2b]"
                href="https://www.producthunt.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Product Hunt’a Git
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {result.status === "ready" ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HeroMetric
                icon={<Package className="h-4 w-4" aria-hidden="true" />}
                label="Bugünkü ürün"
                value={numberFormatter.format(stats.launchCount)}
              />
              <HeroMetric
                icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
                label="Toplam oy"
                value={numberFormatter.format(stats.totalVotes)}
              />
              <HeroMetric
                icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
                label="Toplam yorum"
                value={numberFormatter.format(stats.totalComments)}
              />
              <HeroMetric
                icon={<Tags className="h-4 w-4" aria-hidden="true" />}
                label="En sıcak konu"
                value={stats.topTopicName}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6" id="radar">
        {result.status === "missing_token" ? (
          <ProductHuntNotice
            title="Product Hunt token bekleniyor"
            description="PRODUCT_HUNT_TOKEN env değeri eklendiğinde bu sayfa launch radarını otomatik olarak gösterecek."
          />
        ) : null}

        {result.status === "error" ? (
          <ProductHuntNotice
            title="Product Hunt verisi alınamadı"
            description={result.errorMessage ?? "API bağlantısında geçici bir sorun oluştu."}
          />
        ) : null}

        {result.status === "ready" && launches.length === 0 ? (
          <ProductHuntNotice
            title="Şu an gösterilecek launch yok"
            description="Product Hunt API yanıt verdi ama bugünün filtresiyle ürün dönmedi."
          />
        ) : null}

        {topLaunch ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <FeaturedLaunch launch={topLaunch} />
            <Leaderboard launches={launches.slice(0, 10)} />
          </div>
        ) : null}

        {launches.length > 0 ? (
          <>
            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <TopicMap topics={topicInsights} />
              <MakerSpotlight makers={makerInsights} />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
              <CommunityBuzz comments={commentInsights} />
              <CollectionTrail collections={collectionInsights} />
            </div>

            <section className="mt-8">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-normal text-ink">
                    Launch Akışı
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Günlük rank sırasına göre Product Hunt ürünleri.
                  </p>
                </div>
                <span className="text-sm font-medium text-muted">
                  {numberFormatter.format(result.totalCount)} sonuç
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {launches.map((launch) => (
                  <ProductHuntCard key={launch.id} launch={launch} />
                ))}
              </div>
            </section>
          </>
        ) : null}

        <p className="mt-8 text-xs leading-5 text-muted">
          Veriler Product Hunt API üzerinden alınır, 15 dakikada bir yenilenir
          ve Product Hunt’a bağlantı verilerek kullanılır.
        </p>

        {launches.length > 0 ? (
          <ProductHuntNotesDrawer products={noteProducts} />
        ) : null}
      </section>
    </main>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted">
        <span className="text-[#da552f]">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">
        {value}
      </p>
    </div>
  );
}

function FeaturedLaunch({ launch }: { launch: ProductHuntLaunch }) {
  const mediaUrl = getLaunchMediaUrl(launch);
  const makerNames = launch.makers.map((maker) => maker.name).slice(0, 3);

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="grid min-h-full md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-h-64 border-b border-border bg-[#101828] md:border-b-0 md:border-r">
          {mediaUrl ? (
            <div
              aria-label={`${launch.name} medya görseli`}
              className="h-full min-h-64 bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${mediaUrl})` }}
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center">
              <Sparkles className="h-10 w-10 text-[#da552f]" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal">
            <span className="inline-flex items-center gap-1 rounded-md border border-[#da552f]/20 bg-[#fff3ef] px-2.5 py-1 text-[#b64020]">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Günün lideri #{launch.dailyRank ?? 1}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatProductHuntDate(launch.featuredAt ?? launch.createdAt)}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-ink">
            {launch.name}
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">{launch.tagline}</p>
          {launch.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
              {launch.description}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Oy" value={numberFormatter.format(launch.votesCount)} />
            <MiniStat
              label="Yorum"
              value={numberFormatter.format(launch.commentsCount)}
            />
            <MiniStat
              label="Review"
              value={numberFormatter.format(launch.reviewsCount)}
            />
          </div>

          {makerNames.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Maker:{" "}
              <span className="font-semibold text-ink">
                {makerNames.join(", ")}
              </span>
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <a
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#da552f] px-4 text-sm font-semibold text-white transition hover:bg-[#c84d2b]"
              href={launch.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Product Hunt’ta Gör
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            {launch.website ? (
              <a
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020]"
                href={launch.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                Website
                <Globe className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            <ProductHuntNoteTrigger product={toProductHuntNoteProduct(launch)} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Leaderboard({ launches }: { launches: ProductHuntLaunch[] }) {
  return (
    <aside className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-ink">
            Canlı Sıralama
          </h2>
          <p className="mt-1 text-sm text-muted">Oy sayısı ve günlük rank.</p>
        </div>
        <Activity className="h-5 w-5 text-[#da552f]" aria-hidden="true" />
      </div>
      <div className="mt-4 divide-y divide-border">
        {launches.map((launch) => (
          <a
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 transition hover:text-[#b64020]"
            href={launch.url}
            key={launch.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#fff3ef] text-sm font-semibold text-[#b64020]">
              {launch.dailyRank ?? "-"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">
                {launch.name}
              </span>
              <span className="block truncate text-xs text-muted">
                {launch.tagline}
              </span>
            </span>
            <span className="text-sm font-semibold text-muted">
              {numberFormatter.format(launch.votesCount)}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function TopicMap({ topics }: { topics: TopicInsight[] }) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-ink">
            Konu Nabzı
          </h2>
          <p className="mt-1 text-sm text-muted">
            Bugünün ürünlerinde en çok görünen başlıklar.
          </p>
        </div>
        <Tags className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {topics.slice(0, 12).map((topic) => (
          <a
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
            href={topic.url}
            key={topic.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            {topic.name}
            <span className="rounded bg-card px-1.5 py-0.5 text-xs text-muted">
              {topic.launchCount}
            </span>
          </a>
        ))}
      </div>

      {topics.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {topics.slice(0, 4).map((topic) => (
            <article
              className="rounded-md border border-border bg-background p-4"
              key={topic.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{topic.name}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {numberFormatter.format(topic.followersCount)} takipçi
                  </p>
                </div>
                <span className="rounded-md bg-[#eaf2ff] px-2 py-1 text-xs font-semibold text-accent">
                  {topic.launchCount} ürün
                </span>
              </div>
              {topic.description ? (
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                  {topic.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MakerSpotlight({ makers }: { makers: MakerInsight[] }) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-ink">
            Maker Vitrini
          </h2>
          <p className="mt-1 text-sm text-muted">Bugünün üreticileri.</p>
        </div>
        <Users className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-4 space-y-3">
        {makers.slice(0, 6).map((maker) => (
          <a
            className="flex items-center gap-3 rounded-md border border-border bg-background p-3 transition hover:border-primary/40"
            href={maker.url}
            key={maker.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary-dark">
              {getInitials(maker.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">
                {maker.name}
              </span>
              <span className="block truncate text-xs text-muted">
                {maker.launchName}
                {maker.bestRank ? ` · #${maker.bestRank}` : ""}
              </span>
            </span>
            <span className="text-xs font-semibold text-muted">
              {numberFormatter.format(maker.votesCount)} oy
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function CommunityBuzz({ comments }: { comments: CommentInsight[] }) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-ink">
            Topluluk Sinyali
          </h2>
          <p className="mt-1 text-sm text-muted">
            En çok oy alan kısa yorumlardan seçmeler.
          </p>
        </div>
        <MessageCircle className="h-5 w-5 text-highlight" aria-hidden="true" />
      </div>

      {comments.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {comments.slice(0, 4).map((comment) => (
            <a
              className="rounded-md border border-border bg-background p-4 transition hover:border-highlight/50"
              href={comment.url}
              key={comment.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted">
                <span>{comment.launchName}</span>
                <span>{numberFormatter.format(comment.votesCount)} oy</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink">
                {comment.body}
              </p>
              {comment.user ? (
                <p className="mt-3 text-xs font-semibold text-muted">
                  {comment.user.name}
                </p>
              ) : null}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-border bg-background p-4 text-sm text-muted">
          Henüz yorum sinyali yok.
        </p>
      )}
    </section>
  );
}

function CollectionTrail({
  collections,
}: {
  collections: CollectionInsight[];
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-normal text-ink">
            Koleksiyon Rotaları
          </h2>
          <p className="mt-1 text-sm text-muted">
            Ürünlerin yer aldığı Product Hunt koleksiyonları.
          </p>
        </div>
        <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      {collections.length > 0 ? (
        <div className="mt-4 space-y-3">
          {collections.slice(0, 5).map((collection) => (
            <a
              className="block rounded-md border border-border bg-background p-3 transition hover:border-accent/40"
              href={collection.url}
              key={collection.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink">
                    {collection.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted">
                    {collection.launchName}
                    {collection.launchRank ? ` · #${collection.launchRank}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-accent">
                  {formatCollectionSignal(collection)}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-border bg-background p-4 text-sm text-muted">
          Bugünün ürünleri için koleksiyon verisi dönmedi.
        </p>
      )}
    </section>
  );
}

function ProductHuntCard({ launch }: { launch: ProductHuntLaunch }) {
  const featuredDate = launch.featuredAt ?? launch.createdAt;
  const makerNames = launch.makers.map((maker) => maker.name).slice(0, 3);
  const productLinks = getPrimaryLinks(launch);
  const topComment = launch.comments[0] ?? null;

  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-sm transition hover:border-[#da552f]/50 hover:shadow-soft">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
          {launch.thumbnailUrl ? (
            <div
              aria-label={`${launch.name} görseli`}
              className="h-full w-full bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${launch.thumbnailUrl})` }}
            />
          ) : (
            <Sparkles className="h-6 w-6 text-[#da552f]" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-muted">
            {launch.dailyRank ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#da552f]/20 bg-[#fff3ef] px-2 py-1 text-[#b64020]">
                <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                #{launch.dailyRank}
              </span>
            ) : null}
            {launch.weeklyRank ? (
              <span className="rounded-md border border-border bg-background px-2 py-1">
                Haftalık #{launch.weeklyRank}
              </span>
            ) : null}
            <span className="rounded-md border border-border bg-background px-2 py-1">
              {formatProductHuntDate(featuredDate)}
            </span>
          </div>

          <h3 className="text-xl font-semibold leading-snug tracking-normal text-ink">
            {launch.name}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-muted">
            {launch.tagline}
          </p>
        </div>
      </div>

      {launch.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
          {launch.description}
        </p>
      ) : null}

      {launch.topics.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {launch.topics.slice(0, 4).map((topic) => (
            <a
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-[#da552f]/40 hover:text-[#b64020]"
              href={topic.url}
              key={topic.slug || topic.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              {topic.name}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-semibold text-ink">
          <ArrowUpRight className="h-4 w-4 text-[#da552f]" aria-hidden="true" />
          {numberFormatter.format(launch.votesCount)} oy
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {numberFormatter.format(launch.commentsCount)} yorum
        </span>
        {launch.reviewsCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1">
            <Star className="h-4 w-4" aria-hidden="true" />
            {numberFormatter.format(launch.reviewsCount)} review
          </span>
        ) : null}
      </div>

      {makerNames.length > 0 ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{makerNames.join(", ")}</span>
        </div>
      ) : null}

      {topComment ? (
        <a
          className="mt-4 block rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted transition hover:border-highlight/50"
          href={topComment.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-highlight">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            Topluluk yorumu
          </span>
          <span className="line-clamp-2">{topComment.body}</span>
        </a>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#da552f] px-4 text-sm font-semibold text-white transition hover:bg-[#c84d2b]"
          href={launch.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Product Hunt’ta Gör
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        {productLinks.map((link) => (
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020]"
            href={link.url}
            key={`${launch.id}-${link.type}-${link.url}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {formatProductLinkType(link.type)}
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
        <ProductHuntNoteTrigger product={toProductHuntNoteProduct(launch)} />
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-normal text-ink">
        {value}
      </p>
    </div>
  );
}

function ProductHuntNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function getProductHuntStats(
  launches: ProductHuntLaunch[],
  topics: TopicInsight[],
) {
  return {
    launchCount: launches.length,
    totalVotes: launches.reduce((total, launch) => total + launch.votesCount, 0),
    totalComments: launches.reduce(
      (total, launch) => total + launch.commentsCount,
      0,
    ),
    topTopicName: topics[0]?.name ?? "Product Hunt",
  };
}

function toProductHuntNoteProduct(
  launch: ProductHuntLaunch,
): ProductHuntNoteProduct {
  return {
    id: launch.id,
    name: launch.name,
    slug: launch.slug,
    tagline: launch.tagline,
    productUrl: launch.url,
    websiteUrl: launch.website,
    rank: launch.dailyRank,
  };
}

function getTopicInsights(launches: ProductHuntLaunch[]) {
  const topics = new Map<string, TopicInsight>();

  for (const launch of launches) {
    for (const topic of launch.topics) {
      const key = topic.slug || topic.name;
      const existing = topics.get(key);
      if (existing) {
        existing.launchCount += 1;
        existing.launches.push(launch);
        existing.followersCount = Math.max(
          existing.followersCount,
          topic.followersCount,
        );
        existing.postsCount = Math.max(existing.postsCount, topic.postsCount);
        continue;
      }

      topics.set(key, {
        id: topic.id || key,
        name: topic.name,
        slug: topic.slug,
        url: topic.url,
        description: topic.description,
        followersCount: topic.followersCount,
        postsCount: topic.postsCount,
        launchCount: 1,
        launches: [launch],
      });
    }
  }

  return Array.from(topics.values()).sort((first, second) => {
    if (first.launchCount !== second.launchCount) {
      return second.launchCount - first.launchCount;
    }

    return second.followersCount - first.followersCount;
  });
}

function getMakerInsights(launches: ProductHuntLaunch[]) {
  const makers = new Map<string, MakerInsight>();

  for (const launch of launches) {
    for (const maker of launch.makers) {
      const existing = makers.get(maker.id);
      const rank = launch.dailyRank ?? null;

      if (existing) {
        existing.launchCount += 1;
        existing.votesCount += launch.votesCount;
        if (isBetterRank(rank, existing.bestRank)) {
          existing.launchId = launch.id;
          existing.launchName = launch.name;
          existing.launchUrl = launch.url;
        }
        existing.bestRank = getBestRank(existing.bestRank, rank);
        continue;
      }

      makers.set(maker.id, {
        id: maker.id,
        name: maker.name,
        username: maker.username,
        headline: maker.headline,
        url: maker.url,
        launchId: launch.id,
        launchName: launch.name,
        launchUrl: launch.url,
        launchCount: 1,
        votesCount: launch.votesCount,
        bestRank: rank,
      });
    }
  }

  const sortedMakers = Array.from(makers.values()).sort((first, second) => {
    const firstRank = first.bestRank ?? Number.MAX_SAFE_INTEGER;
    const secondRank = second.bestRank ?? Number.MAX_SAFE_INTEGER;
    if (firstRank !== secondRank) return firstRank - secondRank;
    return second.votesCount - first.votesCount;
  });

  return getDiverseMakers(sortedMakers);
}

function getCommentInsights(launches: ProductHuntLaunch[]) {
  return launches
    .flatMap((launch) =>
      launch.comments.map((comment) => ({
        ...comment,
        launchName: launch.name,
        launchUrl: launch.url,
        launchRank: launch.dailyRank,
      })),
    )
    .sort((first, second) => second.votesCount - first.votesCount);
}

function getCollectionInsights(launches: ProductHuntLaunch[]) {
  const collections = new Map<string, CollectionInsight>();

  for (const launch of launches) {
    for (const collection of launch.collections) {
      if (collections.has(collection.id)) continue;
      collections.set(collection.id, {
        ...collection,
        launchId: launch.id,
        launchName: launch.name,
        launchRank: launch.dailyRank,
      });
    }
  }

  const sortedCollections = Array.from(collections.values()).sort((first, second) => {
    if (first.followersCount !== second.followersCount) {
      return second.followersCount - first.followersCount;
    }

    const firstRank = first.launchRank ?? Number.MAX_SAFE_INTEGER;
    const secondRank = second.launchRank ?? Number.MAX_SAFE_INTEGER;
    return firstRank - secondRank;
  });

  return getDiverseCollections(sortedCollections);
}

function getDiverseMakers(makers: MakerInsight[]) {
  const selected: MakerInsight[] = [];
  const usedLaunches = new Set<string>();

  for (const maker of makers) {
    if (usedLaunches.has(maker.launchId)) continue;
    selected.push(maker);
    usedLaunches.add(maker.launchId);
  }

  if (selected.length >= 6) return selected;

  for (const maker of makers) {
    if (selected.some((selectedMaker) => selectedMaker.id === maker.id)) continue;
    selected.push(maker);
    if (selected.length >= 6) break;
  }

  return selected;
}

function getDiverseCollections(collections: CollectionInsight[]) {
  const selected: CollectionInsight[] = [];
  const usedLaunches = new Set<string>();

  for (const collection of collections) {
    if (usedLaunches.has(collection.launchId)) continue;
    selected.push(collection);
    usedLaunches.add(collection.launchId);
  }

  if (selected.length >= 5) return selected;

  for (const collection of collections) {
    if (
      selected.some(
        (selectedCollection) => selectedCollection.id === collection.id,
      )
    ) {
      continue;
    }
    selected.push(collection);
    if (selected.length >= 5) break;
  }

  return selected;
}

function formatCollectionSignal(collection: CollectionInsight) {
  if (collection.followersCount > 0) {
    return `${numberFormatter.format(collection.followersCount)} takipçi`;
  }

  return "Keşfet";
}

function getBestRank(first: number | null, second: number | null) {
  if (first === null) return second;
  if (second === null) return first;
  return Math.min(first, second);
}

function isBetterRank(candidate: number | null, current: number | null) {
  if (candidate === null) return false;
  if (current === null) return true;
  return candidate < current;
}

function getLaunchMediaUrl(launch: ProductHuntLaunch) {
  return launch.media.find((media) => media.type === "image")?.url ??
    launch.media[0]?.url ??
    launch.thumbnailUrl;
}

function getPrimaryLinks(launch: ProductHuntLaunch) {
  const links = launch.productLinks.length
    ? launch.productLinks
    : launch.website
      ? [{ type: "Website", url: launch.website }]
      : [];

  return links.slice(0, 2);
}

function formatProductLinkType(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("website")) return "Website";
  if (normalized.includes("github")) return "GitHub";
  if (normalized.includes("app")) return "App";
  if (normalized.includes("demo")) return "Demo";
  return "Link";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatProductHuntDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Product Hunt";
  return productHuntFormatter.format(date);
}
