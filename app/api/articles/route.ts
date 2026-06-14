import { NextResponse } from "next/server";
import { getArticleFeed } from "@/lib/data";
import type { SourceSection } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = clampNumber(Number(url.searchParams.get("limit") ?? "12"), 1, 24);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  const { articles, hasMore, total } = await getArticleFeed({
    search: url.searchParams.get("q") ?? undefined,
    source: url.searchParams.get("source") ?? "all",
    section: parseSection(url.searchParams.get("section")),
    range: url.searchParams.get("range") ?? "all",
    limit,
    offset,
  });

  return NextResponse.json(
    { articles, hasMore, total },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function parseSection(value: string | null): SourceSection | undefined {
  return value === "startup" || value === "economy" ? value : undefined;
}
