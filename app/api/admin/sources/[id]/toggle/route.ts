import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase/clients";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAdmin(request);
  const supabase = getSupabaseServiceClient();

  if (!admin || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { active?: boolean };

  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sources")
    .update({ active: body.active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: data });
}
