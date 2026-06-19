import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SeoFeedShell } from "@/components/seo-feed-shell";
import { getArticleFeed, getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ekonomi Haberleri",
  description:
    "Ekonomi ve finans gündemini Bloomberg HT, CNBC-e, Doviz.com ve Dünya gibi kaynaklardan kısa özetlerle takip et.",
  alternates: {
    canonical: "/ekonomi-haberleri",
  },
  openGraph: {
    title: "Ekonomi Haberleri | Girişim Online",
    description:
      "Ekonomi ve finans gündeminden güncel haberleri kaynak bağlantılarıyla takip et.",
    url: absoluteUrl("/ekonomi-haberleri"),
    siteName: "Girişim Online",
    type: "website",
  },
};

export default async function EkonomiHaberleriPage() {
  const pageSize = 12;
  const query = {
    section: "economy",
    source: "all",
    range: "all",
  } as const;
  const [{ articles, total }, sources] = await Promise.all([
    getArticleFeed({ ...query, limit: pageSize, offset: 0 }),
    getSources("economy"),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Girişim Online", url: "/" },
          { name: "Ekonomi Haberleri", url: "/ekonomi-haberleri" },
        ])}
      />
      <SeoFeedShell
        articles={articles}
        description="Piyasa gündemi, iş dünyası, finans ve ekonomi haberlerini fiyat verisi göstermeden, yalnızca haber odaklı kısa özetler ve orijinal kaynak bağlantılarıyla takip et."
        emptyDescription="Ekonomi kaynaklarından gelen haberler import edildiğinde burada listelenecek."
        emptyTitle="Ekonomi haberi bulunamadı"
        eyebrow="Ekonomi Haberleri"
        pageSize={pageSize}
        query={query}
        relatedLinks={[
          { label: "Son Haberler", href: "/" },
          { label: "Ekonomi Akışı", href: "/ekonomi" },
        ]}
        sourceLinks={sources.map((source) => ({
          label: source.name,
          href: `/kaynaklar/${source.slug}`,
        }))}
        title="Ekonomi haberlerini sade bir akışta takip et."
        total={total}
      />
    </>
  );
}
