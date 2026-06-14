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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select(
      "id, article_id, created_at, article:articles(*, source:sources(id, name, slug, homepage_url, section))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articleIds = (bookmarks ?? []).map((bookmark) => bookmark.article_id);
  const { data: notes } =
    articleIds.length > 0
      ? await supabase
          .from("notes")
          .select("id, article_id, body, updated_at")
          .in("article_id", articleIds)
      : { data: [] };
  const notesByArticle = new Map(
    (notes ?? []).map((note) => [note.article_id, note]),
  );

  return NextResponse.json({
    bookmarks: (bookmarks ?? []).map((bookmark) => ({
      ...bookmark,
      note: notesByArticle.get(bookmark.article_id) ?? null,
    })),
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

  const { error } = await supabase.from("bookmarks").upsert(
    {
      user_id: user.id,
      article_id: body.articleId,
    },
    { onConflict: "user_id,article_id" },
  );

  if (error) {
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
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
