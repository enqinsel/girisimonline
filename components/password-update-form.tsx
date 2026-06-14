"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function PasswordUpdateForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase env değerleri yapılandırılmamış.");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase env değerleri yapılandırılmamış.");
      return;
    }

    if (!ready) {
      setMessage("Şifre yenileme bağlantısı geçersiz ya da süresi dolmuş olabilir.");
      return;
    }

    if (password.length < 8) {
      setMessage("Yeni şifren en az 8 karakter olmalı.");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.");
      return;
    }

    setMessage("Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun.");
    window.setTimeout(() => {
      window.location.href = "/giris?reset=1";
    }, 1200);
  }

  return (
    <form
      className="rounded-md border border-border bg-card p-6 shadow-sm"
      onSubmit={submit}
    >
      <label className="text-sm font-semibold text-ink" htmlFor="new-password">
        Yeni Şifre
      </label>
      <div className="relative mt-2">
        <LockKeyhole
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="new-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="En az 8 karakter"
          required
          type="password"
          value={password}
        />
      </div>

      <label
        className="mt-4 block text-sm font-semibold text-ink"
        htmlFor="new-password-confirm"
      >
        Yeni Şifre Tekrar
      </label>
      <div className="relative mt-2">
        <LockKeyhole
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="new-password-confirm"
          minLength={8}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="Şifreni tekrar yaz"
          required
          type="password"
          value={passwordConfirm}
        />
      </div>

      <button
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        Şifreyi Güncelle
      </button>

      <div className="mt-4 text-sm text-muted">
        Bağlantı çalışmıyor mu?{" "}
        <Link
          className="font-semibold text-primary-dark hover:text-primary"
          href="/sifre-sifirla"
        >
          Yeni bağlantı iste
        </Link>
      </div>

      {message ? <p className="mt-3 text-sm leading-6 text-muted">{message}</p> : null}
    </form>
  );
}

