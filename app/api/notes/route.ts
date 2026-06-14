import { NextResponse } from "next/server";
import { getAuthenticatedDataClient, getUserFromRequest } from "@/lib/auth";
import { legacyArticlePublicSelectWithSource } from "@/lib/data";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notes")
    .select(
      `id, article_id, body, created_at, updated_at, article:articles(${legacyArticlePublicSelectWithSource})`,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}
