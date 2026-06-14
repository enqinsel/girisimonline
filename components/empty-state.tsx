import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-border bg-card px-6 py-12 text-center">
      <SearchX className="mb-3 h-9 w-9 text-muted" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
