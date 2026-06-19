import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { getSources } from "@/lib/data";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import type { Source } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Haber Kaynakları",
  description:
    "Girişim Online’da takip edilen girişim, yatırım, ekonomi ve finans haber kaynaklarını keşfet.",
  alternates: {
    canonical: "/kaynaklar",
  },
  openGraph: {
    title: "Haber Kaynakları | Girişim Online",
    description:
      "Girişim Online’da takip edilen haber kaynakları ve güncel kaynak akışları.",
    url: absoluteUrl("/kaynaklar"),
    siteName: "Girişim Online",
    type: "website",
  },
};

export default async function SourcesPage() {
  const [startupSources, economySources] = await Promise.all([
    getSources("startup"),
    getSources("economy"),
  ]);

  return (
    <main>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Girişim Online", url: "/" },
          { name: "Haber Kaynakları", url: "/kaynaklar" },
        ])}
      />
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
            Haber Kaynakları
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl">
            Girişim Online’da takip edilen kaynaklar.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Girişim, yatırım, ekonomi ve finans gündemini farklı kaynaklardan
            kısa özetlerle listeliyoruz. Haberlerin tamamı için kullanıcıları
            her zaman orijinal kaynağa yönlendiriyoruz.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <SourceGroup
          description="Startup ekosistemi, girişimcilik ve yatırım odağındaki kaynaklar."
          sources={startupSources}
          title="Girişim ve Yatırım"
        />
        <SourceGroup
          description="Ekonomi, finans, iş dünyası ve dijital varlık gündemi."
          sources={economySources}
          title="Ekonomi ve Finans"
        />
      </section>
    </main>
  );
}

function SourceGroup({
  description,
  sources,
  title,
}: {
  description: string;
  sources: Source[];
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-5 grid gap-3">
        {sources.map((source) => (
          <Link
            className="group rounded-md border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-soft"
            href={`/kaynaklar/${source.slug}`}
            key={source.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">{source.name}</h3>
                <p className="mt-1 text-sm text-muted">{source.homepage_url}</p>
              </div>
              <ArrowRight
                className="mt-1 h-5 w-5 shrink-0 text-muted transition group-hover:text-primary-dark"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
