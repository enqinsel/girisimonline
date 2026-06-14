"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { SourceFilterOption } from "@/lib/data";
import { cn } from "@/lib/utils/cn";

const timeFilters = [
  { label: "Tümü", value: "all" },
  { label: "Bugün", value: "today" },
  { label: "Bu Hafta", value: "week" },
];

export function FeedFilters({
  search,
  source,
  sourceFilters,
  range,
}: {
  search?: string;
  source?: string;
  sourceFilters: SourceFilterOption[];
  range?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [localSearch, setLocalSearch] = useState(search ?? "");
  const [, startTransition] = useTransition();

  const current = useMemo(
    () => ({
      q: search ?? "",
      source: source ?? "all",
      range: range ?? "all",
    }),
    [range, search, source],
  );

  useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);

  const updateParams = useCallback((next: Partial<typeof current>) => {
    const params = new URLSearchParams();
    const merged = { ...current, ...next };

    if (merged.q) params.set("q", merged.q);
    if (merged.source !== "all") params.set("source", merged.source);
    if (merged.range !== "all") params.set("range", merged.range);

    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params}` : pathname, {
        scroll: false,
      });
    });
  }, [current, pathname, router]);

  useEffect(() => {
    const normalized = localSearch.trim();
    if (normalized === current.q) return;

    const timeout = window.setTimeout(() => {
      updateParams({ q: normalized });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [localSearch, current.q, updateParams]);

  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setLocalSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                updateParams({ q: localSearch.trim() });
              }
            }}
            placeholder="Başlık veya açıklama ara"
            type="search"
            value={localSearch}
          />
          {localSearch ? (
            <button
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-border/60 hover:text-ink"
              onClick={() => {
                setLocalSearch("");
                updateParams({ q: "" });
              }}
              type="button"
              title="Aramayı temizle"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2">
          {timeFilters.map((item) => (
            <button
              className={cn(
                "h-10 rounded-md border px-3 text-sm font-semibold transition",
                current.range === item.value
                  ? "border-primary bg-emerald-50 text-primary-dark"
                  : "border-border bg-background text-muted hover:border-primary hover:text-primary-dark",
              )}
              key={item.value}
              onClick={() => updateParams({ range: item.value })}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {[{ label: "Tümü", value: "all" }, ...sourceFilters].map((item) => {
          const active = current.source === item.value;

          return (
            <button
              className={cn(
                "h-9 shrink-0 rounded-md border px-3 text-sm font-semibold transition",
                active
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-background text-muted hover:border-primary hover:text-primary-dark",
              )}
              key={item.value}
              onClick={() => updateParams({ source: item.value })}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
