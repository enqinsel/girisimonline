"use client";

import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function NoteEditor({
  articleId,
  initialBody = "",
  returnPath = "/",
}: {
  articleId: string;
  initialBody?: string;
  returnPath?: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [message, setMessage] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session?.access_token));
    });
  }, []);

  async function request(method: "PUT" | "DELETE") {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      window.location.href = "/giris";
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      window.location.href = `/giris?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/notes/${articleId}`, {
      method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: method === "PUT" ? JSON.stringify({ body }) : undefined,
    });
    setLoading(false);

    if (response.ok) {
      if (method === "DELETE") setBody("");
      setMessage(method === "PUT" ? "Not güncellendi." : "Not silindi.");
      return;
    }

    setMessage("İşlem tamamlanamadı.");
  }

  if (!authenticated) {
    return (
      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-ink">Not Ekle</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Notlar yalnızca senin hesabında saklanır ve başka kullanıcılarla
          paylaşılmaz. Bu habere kişisel not eklemek için giriş yapmalısın.
        </p>
        <a
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          href={`/giris?next=${encodeURIComponent(returnPath)}`}
        >
          Giriş Yap
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-ink">Kişisel Notun</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Bu alan sadece sana özeldir; diğer kullanıcılar ve public haber sayfası
        notunu görmez.
      </p>
      <textarea
        className="mt-3 min-h-32 w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        onChange={(event) => setBody(event.target.value)}
        placeholder="Bu haberle ilgili kişisel notun..."
        value={body}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          disabled={loading || body.trim().length === 0}
          onClick={() => request("PUT")}
          type="button"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Notu Güncelle
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-ink transition hover:border-primary disabled:cursor-wait disabled:opacity-70"
          disabled={loading}
          onClick={() => request("DELETE")}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Notu Sil
        </button>
        {message ? <span className="text-sm text-muted">{message}</span> : null}
      </div>
    </div>
  );
}
