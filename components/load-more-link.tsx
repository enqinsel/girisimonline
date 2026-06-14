import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function LoadMoreLink({
  search,
  source,
  range,
  page,
}: {
  search?: string;
  source?: string;
  range?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (source && source !== "all") params.set("source", source);
  if (range && range !== "all") params.set("range", range);
  params.set("page", String(page + 1));

  return (
    <div className="mt-8 flex justify-center">
      <Link
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
        href={`/?${params.toString()}`}
      >
        Daha Fazla Yükle
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
