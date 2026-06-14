"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Supabase env değerleri yapılandırılmamış.");
      return;
    }

    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-yenile`,
    });
    setLoading(false);

    setMessage(
      "Bu e-posta ile kayıtlı bir hesap varsa şifre yenileme bağlantısı gönderildi.",
    );
  }

  return (
    <form
      className="rounded-md border border-border bg-card p-6 shadow-sm"
      onSubmit={submit}
    >
      <label className="text-sm font-semibold text-ink" htmlFor="reset-email">
        E-posta
      </label>
      <div className="relative mt-2">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="reset-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="sen@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      <button
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        Bağlantı Gönder
      </button>

      <div className="mt-4 text-sm text-muted">
        Şifreni hatırladın mı?{" "}
        <Link className="font-semibold text-primary-dark hover:text-primary" href="/giris">
          Giriş yap
        </Link>
      </div>

      {message ? <p className="mt-3 text-sm leading-6 text-muted">{message}</p> : null}
    </form>
  );
}

