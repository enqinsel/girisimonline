"use client";

import {
  ArrowUpRight,
  ExternalLink,
  NotebookPen,
  PanelRightOpen,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const PRODUCT_HUNT_NOTE_EVENT = "product-hunt-note:open";

export type ProductHuntNoteProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  productUrl: string;
  websiteUrl: string | null;
  rank: number | null;
};

type ProductHuntSavedNote = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_url: string;
  website_url: string | null;
  tagline: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

type ProductHuntNoteEvent = CustomEvent<{
  product: ProductHuntNoteProduct;
}>;

export function ProductHuntNoteTrigger({
  product,
  variant = "secondary",
}: {
  product: ProductHuntNoteProduct;
  variant?: "primary" | "secondary" | "compact";
}) {
  function openDrawer() {
    window.dispatchEvent(
      new CustomEvent(PRODUCT_HUNT_NOTE_EVENT, { detail: { product } }),
    );
  }

  const className =
    variant === "primary"
      ? "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#da552f] px-4 text-sm font-semibold text-white transition hover:bg-[#c84d2b]"
      : variant === "compact"
        ? "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020]"
        : "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020]";

  return (
    <button className={className} onClick={openDrawer} type="button">
      <NotebookPen className="h-4 w-4" aria-hidden="true" />
      Not Al
    </button>
  );
}

export function ProductHuntNotesDrawer({
  products,
}: {
  products: ProductHuntNoteProduct[];
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductHuntNoteProduct | null>(products[0] ?? null);
  const [notes, setNotes] = useState<ProductHuntSavedNote[]>([]);
  const [body, setBody] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const notesByProductId = useMemo(
    () => new Map(notes.map((note) => [note.product_id, note])),
    [notes],
  );

  const selectedNote = selectedProduct
    ? notesByProductId.get(selectedProduct.id) ?? null
    : null;
  const savedCount = notes.length;

  useEffect(() => {
    function handleOpen(event: Event) {
      const product = (event as ProductHuntNoteEvent).detail?.product;
      if (!product) return;

      setSelectedProduct(product);
      setOpen(true);
      setMessage(null);
    }

    window.addEventListener(PRODUCT_HUNT_NOTE_EVENT, handleOpen);
    return () => window.removeEventListener(PRODUCT_HUNT_NOTE_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      if (!supabase) {
        if (!active) return;
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!active) return;
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      const response = await fetch("/api/product-hunt-notes", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (!active) return;
      if (response.ok) {
        const payload = (await response.json()) as {
          notes: ProductHuntSavedNote[];
        };
        setNotes(payload.notes);
      } else {
        setMessage("Product Hunt notları yüklenemedi.");
      }
      setLoading(false);
    }

    loadNotes();
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    setBody(selectedNote?.body ?? "");
  }, [selectedNote?.body, selectedProduct?.id]);

  async function getToken() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function saveNote() {
    if (!selectedProduct || body.trim().length === 0) return;

    const token = await getToken();
    if (!token) {
      setAuthenticated(false);
      setMessage("Not eklemek için giriş yapmalısın.");
      return;
    }

    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/product-hunt-notes", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        body,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSlug: selectedProduct.slug,
        productUrl: selectedProduct.productUrl,
        websiteUrl: selectedProduct.websiteUrl,
        tagline: selectedProduct.tagline,
      }),
    });
    setSaving(false);

    if (!response.ok) {
      setMessage("Not kaydedilemedi. Supabase tablosu hazır mı kontrol et.");
      return;
    }

    const payload = (await response.json()) as { note: ProductHuntSavedNote };
    setNotes((current) => {
      const others = current.filter(
        (note) => note.product_id !== payload.note.product_id,
      );
      return [payload.note, ...others];
    });
    setAuthenticated(true);
    setMessage("Not kaydedildi.");
  }

  async function deleteNote() {
    if (!selectedProduct) return;

    const token = await getToken();
    if (!token) {
      setAuthenticated(false);
      setMessage("Not silmek için giriş yapmalısın.");
      return;
    }

    setSaving(true);
    setMessage(null);
    const response = await fetch(
      `/api/product-hunt-notes?productId=${encodeURIComponent(selectedProduct.id)}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      },
    );
    setSaving(false);

    if (!response.ok) {
      setMessage("Not silinemedi.");
      return;
    }

    setNotes((current) =>
      current.filter((note) => note.product_id !== selectedProduct.id),
    );
    setBody("");
    setMessage("Not silindi.");
  }

  function selectSavedNote(note: ProductHuntSavedNote) {
    setSelectedProduct({
      id: note.product_id,
      name: note.product_name,
      slug: note.product_slug,
      tagline: note.tagline ?? "",
      productUrl: note.product_url,
      websiteUrl: note.website_url,
      rank: null,
    });
    setMessage(null);
  }

  return (
    <>
      <button
        className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-md bg-[#da552f] px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-[#c84d2b]"
        onClick={() => {
          setOpen(true);
          setMessage(null);
        }}
        type="button"
      >
        <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
        Ürün Notları
        {savedCount > 0 ? (
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs">
            {savedCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label="Product Hunt not panelini kapat"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-[#da552f]">
                    <NotebookPen className="h-4 w-4" aria-hidden="true" />
                    Product Hunt Not Defteri
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-normal text-ink">
                    Ürünleri sonra hatırlamak için not al.
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Notların hesabında kalır; ürün bugün listeden düşse bile
                    buradan erişebilirsin.
                  </p>
                </div>
                <button
                  aria-label="Paneli kapat"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:border-[#da552f]/50 hover:text-[#b64020]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
              <div className="min-h-0 overflow-y-auto border-b border-border bg-background p-4 md:border-b-0 md:border-r">
                <DrawerList
                  notes={notes}
                  notesByProductId={notesByProductId}
                  onSelectProduct={(product) => {
                    setSelectedProduct(product);
                    setMessage(null);
                  }}
                  onSelectSavedNote={selectSavedNote}
                  products={products}
                  selectedProductId={selectedProduct?.id ?? null}
                />
              </div>

              <div className="min-h-0 overflow-y-auto p-5">
                {!authenticated && !loading ? (
                  <LoginPrompt />
                ) : (
                  <ProductNoteForm
                    body={body}
                    loading={loading}
                    message={message}
                    noteExists={Boolean(selectedNote)}
                    onBodyChange={setBody}
                    onDelete={deleteNote}
                    onSave={saveNote}
                    product={selectedProduct}
                    saving={saving}
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function DrawerList({
  notes,
  notesByProductId,
  onSelectProduct,
  onSelectSavedNote,
  products,
  selectedProductId,
}: {
  notes: ProductHuntSavedNote[];
  notesByProductId: Map<string, ProductHuntSavedNote>;
  onSelectProduct: (product: ProductHuntNoteProduct) => void;
  onSelectSavedNote: (note: ProductHuntSavedNote) => void;
  products: ProductHuntNoteProduct[];
  selectedProductId: string | null;
}) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold text-ink">Bugünün ürünleri</h3>
        <div className="mt-3 space-y-2">
          {products.slice(0, 12).map((product) => {
            const hasNote = notesByProductId.has(product.id);
            const selected = selectedProductId === product.id;

            return (
              <button
                className={`block w-full rounded-md border p-3 text-left transition ${
                  selected
                    ? "border-[#da552f]/60 bg-[#fff3ef]"
                    : "border-border bg-card hover:border-[#da552f]/40"
                }`}
                key={product.id}
                onClick={() => onSelectProduct(product)}
                type="button"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {product.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {product.rank ? `#${product.rank} · ` : ""}
                      {product.tagline}
                    </span>
                  </span>
                  {hasNote ? (
                    <NotebookPen
                      className="h-4 w-4 shrink-0 text-[#da552f]"
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-ink">Kaydedilmiş notlar</h3>
        {notes.length > 0 ? (
          <div className="mt-3 space-y-2">
            {notes.slice(0, 10).map((note) => (
              <button
                className="block w-full rounded-md border border-border bg-card p-3 text-left transition hover:border-primary/40"
                key={note.id}
                onClick={() => onSelectSavedNote(note)}
                type="button"
              >
                <span className="block truncate text-sm font-semibold text-ink">
                  {note.product_name}
                </span>
                <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                  {note.body}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-border bg-card p-3 text-sm leading-6 text-muted">
            Henüz Product Hunt notun yok.
          </p>
        )}
      </section>
    </div>
  );
}

function ProductNoteForm({
  body,
  loading,
  message,
  noteExists,
  onBodyChange,
  onDelete,
  onSave,
  product,
  saving,
}: {
  body: string;
  loading: boolean;
  message: string | null;
  noteExists: boolean;
  onBodyChange: (value: string) => void;
  onDelete: () => void;
  onSave: () => void;
  product: ProductHuntNoteProduct | null;
  saving: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-md border border-border bg-background p-4 text-sm text-muted">
        Notlar yükleniyor...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-md border border-border bg-background p-4 text-sm text-muted">
        Not almak için bir ürün seç.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted">
              Seçili ürün
            </p>
            <h3 className="mt-1 truncate text-xl font-semibold tracking-normal text-ink">
              {product.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
              {product.tagline}
            </p>
          </div>
          {product.rank ? (
            <span className="shrink-0 rounded-md border border-[#da552f]/20 bg-[#fff3ef] px-2.5 py-1 text-xs font-semibold text-[#b64020]">
              #{product.rank}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#da552f] px-3 text-xs font-semibold text-white transition hover:bg-[#c84d2b]"
            href={product.productUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Product Hunt
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          {product.websiteUrl ? (
            <a
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020]"
              href={product.websiteUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Ürün Linki
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>

      <label
        className="mt-5 block text-sm font-semibold text-ink"
        htmlFor="product-hunt-note-body"
      >
        Kişisel notun
      </label>
      <textarea
        className="mt-2 min-h-44 w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted focus:border-[#da552f] focus:ring-2 focus:ring-[#da552f]/20"
        id="product-hunt-note-body"
        onChange={(event) => onBodyChange(event.target.value)}
        placeholder="Bu ürünü neden ilginç buldun? Rakip, fikir, yatırım, özellik, kullanılacak link..."
        value={body}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          disabled={saving || body.trim().length === 0}
          onClick={onSave}
          type="button"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Notu Kaydet
        </button>
        {noteExists ? (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-[#da552f]/50 hover:text-[#b64020] disabled:cursor-wait disabled:opacity-70"
            disabled={saving}
            onClick={onDelete}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Sil
          </button>
        ) : null}
      </div>

      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="rounded-md border border-border bg-background p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff3ef] text-[#b64020]">
        <Search className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">
        Not almak için giriş yap.
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Product Hunt notları sadece senin hesabında saklanır. Ürünler günlük
        değişse bile kendi notların kalıcı olur.
      </p>
      <a
        className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
        href={`/giris?next=${encodeURIComponent("/product-hunt")}`}
      >
        Giriş Yap
      </a>
    </div>
  );
}
