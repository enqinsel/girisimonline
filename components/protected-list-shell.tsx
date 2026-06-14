"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function ProtectedListShell({
  title,
  description,
  loading,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
            Girişim Online
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-primary"
          href="/"
        >
          Son Haberler
        </Link>
      </div>
      {loading ? (
        <div className="flex min-h-52 items-center justify-center rounded-md border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        children
      )}
    </main>
  );
}
