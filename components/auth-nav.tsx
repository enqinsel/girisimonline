"use client";

import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <Link
        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted"
        href="/giris"
      >
        Giriş Yap
      </Link>
    );
  }

  if (!user) {
    return (
      <Link
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        href="/giris"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Giriş Yap
      </Link>
    );
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-ink transition hover:border-primary"
      onClick={() => supabase.auth.signOut()}
      type="button"
      title={user.email ?? "Oturumu kapat"}
    >
      <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
      <span className="hidden max-w-32 truncate sm:inline">{user.email}</span>
      <LogOut className="h-4 w-4 text-muted" aria-hidden="true" />
    </button>
  );
}
