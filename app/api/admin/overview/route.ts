import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/clients";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  const supabase = getSupabaseServiceClient();

  if (!admin || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sourcesResult, logsResult, articlesResult] = await Promise.all([
    supabase.from("sources").select("*").order("name", { ascending: true }),
    supabase
      .from("import_logs")
      .select("*, source:sources(name, slug)")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("articles")
      .select("*, source:sources(id, name, slug, homepage_url, section)")
      .order("imported_at", { ascending: false })
      .limit(40),
  ]);

  const error =
    sourcesResult.error ?? logsResult.error ?? articlesResult.error ?? null;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    sources: sourcesResult.data ?? [],
    logs: logsResult.data ?? [],
    articles: articlesResult.data ?? [],
  });
}
