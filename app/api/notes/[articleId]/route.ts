import { NextResponse } from "next/server";
import { getAuthenticatedDataClient, getUserFromRequest } from "@/lib/auth";

type Params = {
  params: Promise<{ articleId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { articleId } = await params;
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { body?: string };
  const noteBody = body.body?.trim();
  if (!noteBody) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const { error } = await supabase.from("notes").upsert(
    {
      user_id: user.id,
      article_id: articleId,
      body: noteBody,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,article_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const { articleId } = await params;
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
