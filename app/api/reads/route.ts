import { NextResponse } from "next/server";
import {
  getAuthenticatedDataClient,
  getBearerToken,
  getUserFromRequest,
} from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ readArticleIds: [] });
  }

  const url = new URL(request.url);
  const articleIds = parseArticleIds(url.searchParams.get("articleIds"));
  if (articleIds.length === 0) {
    return NextResponse.json({ readArticleIds: [] });
  }

  const { data, error } = await supabase
    .from("article_reads")
    .select("article_id")
    .eq("user_id", user.id)
    .in("article_id", articleIds);

  if (error) {
    if (isMissingReadsTable(error)) {
      return NextResponse.json({ readArticleIds: [], ready: false });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    readArticleIds: (data ?? []).map((item) => item.article_id),
    ready: true,
  });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  const user = await getUserFromRequest(request);
  const supabase = token ? getAuthenticatedDataClient(request) : null;

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { articleId?: string };
  if (!body.articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  const { error } = await supabase.from("article_reads").upsert(
    {
      user_id: user.id,
      article_id: body.articleId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,article_id" },
  );

  if (error) {
    if (isMissingReadsTable(error)) {
      return NextResponse.json(
        { error: "article_reads migration required" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const articleId = url.searchParams.get("articleId");
  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("article_reads")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (error) {
    if (isMissingReadsTable(error)) {
      return NextResponse.json(
        { error: "article_reads migration required" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function parseArticleIds(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function isMissingReadsTable(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    message.includes("article_reads") ||
    message.includes("schema cache")
  );
}
