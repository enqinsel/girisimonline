import { ArrowLeft, Loader2 } from "lucide-react";

export default function ArticleDetailLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Haber akışı
      </div>

      <article className="mt-6 rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-md bg-slate-100" />
          <div className="h-7 w-12 animate-pulse rounded-md bg-slate-100" />
          <div className="h-7 w-28 animate-pulse rounded-md bg-slate-100" />
        </div>

        <div className="space-y-3">
          <div className="h-9 w-full max-w-3xl animate-pulse rounded-md bg-slate-100" />
          <div className="h-9 w-4/5 animate-pulse rounded-md bg-slate-100" />
        </div>

        <div className="mt-6 rounded-md border border-border bg-background p-5">
          <div className="h-4 w-24 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>

        <div className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Haber hazırlanıyor
        </div>
      </article>
    </main>
  );
}
