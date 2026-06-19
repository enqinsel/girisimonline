import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SeoFeedShell } from "@/components/seo-feed-shell";
import { getArticleFeed, getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yatırım Haberleri",
  description:
    "Startup yatırım haberleri, fon duyuruları ve girişim finansmanı gelişmelerini kısa özetler ve kaynak bağlantılarıyla takip et.",
  alternates: {
    canonical: "/yatirim-haberleri",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Yatırım Haberleri | Girişim Online",
    description:
      "Girişim yatırım haberleri, fonlar ve finansman gelişmeleri tek akışta.",
    url: absoluteUrl("/yatirim-haberleri"),
    siteName: "Girişim Online",
    type: "website",
  },
};

export default async function YatirimHaberleriPage() {
  const pageSize = 12;
  const query = {
    search: "yatırım",
    section: "startup",
    source: "all",
    range: "all",
  } as const;
  const [{ articles, total }, sources] = await Promise.all([
    getArticleFeed({ ...query, limit: pageSize, offset: 0 }),
    getSources("startup"),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Girişim Online", url: "/" },
          { name: "Yatırım Haberleri", url: "/yatirim-haberleri" },
        ])}
      />
      <SeoFeedShell
        articles={articles}
        description="Girişim yatırımları, yeni fonlar, melek yatırımcı haberleri ve startup finansman gelişmelerini kısa özetlerle takip et; haberin tamamı için her zaman orijinal kaynağa git."
        emptyDescription="Yatırım odağındaki aramaya uygun haber bulunamadı. Son haberler akışından tüm startup gündemine dönebilirsin."
        emptyTitle="Yatırım haberi bulunamadı"
        eyebrow="Yatırım Haberleri"
        pageSize={pageSize}
        query={query}
        relatedLinks={[
          { label: "Son Haberler", href: "/" },
          { label: "Ekonomi Haberleri", href: "/ekonomi-haberleri" },
          { label: "Kaynaklar", href: "/kaynaklar" },
        ]}
        sourceLinks={sources.map((source) => ({
          label: source.name,
          href: `/kaynaklar/${source.slug}`,
        }))}
        title="Startup yatırım haberlerini kaçırma."
        total={total}
      />
    </>
  );
}
