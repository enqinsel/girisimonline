import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SeoFeedShell } from "@/components/seo-feed-shell";
import { getArticleFeed, getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Girişim Haberleri",
  description:
    "Türkiye girişimcilik ekosisteminden güncel startup haberlerini, kısa özetler ve orijinal kaynak bağlantılarıyla takip et.",
  alternates: {
    canonical: "/girisim-haberleri",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Girişim Haberleri | Girişim Online",
    description:
      "Startup ekosisteminden güncel girişim haberlerini kısa özetlerle takip et.",
    url: absoluteUrl("/girisim-haberleri"),
    siteName: "Girişim Online",
    type: "website",
  },
};

export default async function GirisimHaberleriPage() {
  const pageSize = 12;
  const query = {
    search: "girişim",
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
          { name: "Girişim Haberleri", url: "/girisim-haberleri" },
        ])}
      />
      <SeoFeedShell
        articles={articles}
        description="Yeni girişimler, kurucular, ürün lansmanları, büyüme haberleri ve startup ekosistemindeki gelişmeleri kaynaklara yönlendiren kısa özetlerle keşfet."
        emptyDescription="Girişim odağındaki aramaya uygun haber bulunamadı. Son haberler akışından tüm startup gündemine dönebilirsin."
        emptyTitle="Girişim haberi bulunamadı"
        eyebrow="Girişim Haberleri"
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
        title="Girişim haberlerini tek akışta takip et."
        total={total}
      />
    </>
  );
}
