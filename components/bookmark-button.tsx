"use client";

import { Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({
  articleId,
  compact = false,
}: {
  articleId: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
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
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId }),
    });
    setLoading(false);

    if (response.ok) setSaved(true);
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card font-semibold text-ink transition hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-70",
        compact ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm",
        saved && "border-primary bg-emerald-50 text-primary-dark",
      )}
      disabled={loading}
      onClick={handleSave}
      type="button"
    >
      {saved ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {saved ? "Kaydedildi" : "Kaydet"}
    </button>
  );
}
