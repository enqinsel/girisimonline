import { NextResponse } from "next/server";
import { getAuthenticatedDataClient, getUserFromRequest } from "@/lib/auth";

type ProductHuntNotePayload = {
  body?: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  productUrl?: string;
  websiteUrl?: string | null;
  tagline?: string | null;
};

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("product_hunt_notes")
    .select(
      "id, product_id, product_name, product_slug, product_url, website_url, tagline, body, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}

export async function PUT(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ProductHuntNotePayload;
  const body = cleanRequiredText(payload.body);
  const productId = cleanRequiredText(payload.productId);
  const productName = cleanRequiredText(payload.productName);
  const productSlug = cleanRequiredText(payload.productSlug);
  const productUrl = normalizeUrl(payload.productUrl);
  const websiteUrl = normalizeUrl(payload.websiteUrl);
  const tagline = cleanOptionalText(payload.tagline);

  if (!body || !productId || !productName || !productSlug || !productUrl) {
    return NextResponse.json({ error: "Eksik Product Hunt not verisi." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("product_hunt_notes")
    .upsert(
      {
        user_id: user.id,
        product_id: productId,
        product_name: productName,
        product_slug: productSlug,
        product_url: productUrl,
        website_url: websiteUrl,
        tagline,
        body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,product_id" },
    )
    .select(
      "id, product_id, product_name, product_slug, product_url, website_url, tagline, body, created_at, updated_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data });
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  const supabase = getAuthenticatedDataClient(request);

  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = cleanRequiredText(
    new URL(request.url).searchParams.get("productId"),
  );

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("product_hunt_notes")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function cleanRequiredText(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, 2000) : null;
}

function cleanOptionalText(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, 500) : null;
}

function normalizeUrl(value: string | null | undefined) {
  const cleaned = value?.trim();
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
