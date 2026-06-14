import Link from "next/link";
import { ArrowLeft, Newspaper, Search } from "lucide-react";
import { BrandLogoMark } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl items-center px-4 py-12 sm:px-6">
      <section className="grid w-full gap-8 overflow-hidden rounded-md border border-border bg-card p-6 shadow-soft md:grid-cols-[1fr_0.8fr] md:p-10">
        <div className="flex flex-col justify-center">
          <BrandLogoMark className="h-12 w-12" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-normal text-primary-dark">
            404
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
            Aradığın sayfa yayında değil.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
            Bağlantı değişmiş, haber arşivden kalkmış ya da adres eksik yazılmış
            olabilir. Güncel girişim ve ekonomi akışına dönebilirsin.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Son Haberlere Dön
            </Link>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-primary"
              href="/ekonomi"
            >
              <Newspaper className="h-4 w-4 text-accent" aria-hidden="true" />
              Ekonomi Haberleri
            </Link>
          </div>
        </div>

        <div className="flex min-h-64 items-center justify-center rounded-md border border-border bg-background p-6">
          <div className="relative h-44 w-44">
            <div className="absolute inset-0 rounded-full border border-border bg-card" />
            <div className="absolute left-7 top-9 h-24 w-32 rounded-md border border-border bg-white shadow-sm">
              <div className="h-3 rounded-t-md bg-primary" />
              <div className="space-y-2 p-4">
                <div className="h-2 w-20 rounded-full bg-border" />
                <div className="h-2 w-24 rounded-full bg-border" />
                <div className="h-2 w-14 rounded-full bg-border" />
              </div>
            </div>
            <div className="absolute bottom-9 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-sm">
              <Search className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="absolute right-8 top-7 h-4 w-4 rounded-full bg-highlight" />
          </div>
        </div>
      </section>
    </main>
  );
}

