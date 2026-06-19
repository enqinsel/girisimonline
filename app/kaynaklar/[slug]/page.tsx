import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { SeoFeedShell } from "@/components/seo-feed-shell";
import { getArticleFeed, getSourceBySlug, getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbJsonLd, sourcePath } from "@/lib/seo";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const sources = await getSources();
  return sources.map((source) => ({ slug: source.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getSourceBySlug(slug);

  if (!source) {
    return {
      title: "Kaynak bulunamadı",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const path = sourcePath(source);
  const sectionLabel = source.section === "economy" ? "ekonomi ve finans" : "girişim ve yatırım";

  return {
    title: `${source.name} Haberleri`,
    description: `${source.name} üzerinden takip edilen güncel ${sectionLabel} haberlerini kısa özetler ve kaynak bağlantılarıyla keşfet.`,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${source.name} Haberleri | Girişim Online`,
      description: `${source.name} kaynaklı güncel haberler ve kısa özetler.`,
      url: absoluteUrl(path),
      siteName: "Girişim Online",
      type: "website",
    },
  };
}

export default async function SourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const source = await getSourceBySlug(slug);
  if (!source) notFound();

  const pageSize = 12;
  const query = {
    section: source.section,
    source: source.slug,
    range: "all",
  };
  const { articles, total } = await getArticleFeed({
    ...query,
    limit: pageSize,
    offset: 0,
  });
  const sectionLink =
    source.section === "economy"
      ? { label: "Ekonomi Haberleri", href: "/ekonomi-haberleri" }
      : { label: "Son Haberler", href: "/" };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Girişim Online", url: "/" },
          { name: "Haber Kaynakları", url: "/kaynaklar" },
          { name: source.name, url: sourcePath(source) },
        ])}
      />
      <SeoFeedShell
        articles={articles}
        description={`${source.name} kaynaklı haberleri Girişim Online üzerinde kısa özetlerle takip et. İçeriklerin tamamı için her kart ve detay sayfası orijinal kaynağa yönlendirir.`}
        emptyDescription="Bu kaynaktan gelen haberler import edildiğinde burada listelenecek."
        emptyTitle="Bu kaynakta haber bulunamadı"
        eyebrow="Haber Kaynağı"
        pageSize={pageSize}
        query={query}
        relatedLinks={[
          sectionLink,
          { label: "Tüm Kaynaklar", href: "/kaynaklar" },
          { label: "Son Haberler", href: "/" },
        ]}
        title={`${source.name} haberleri`}
        total={total}
      />
    </>
  );
}
