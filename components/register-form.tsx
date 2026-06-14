"use client";

import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { FormAlert } from "@/components/form-alert";

type Feedback = {
  text: string;
  variant: "error" | "success" | "info";
};

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setFeedback({
        text: "Şifren en az 8 karakter olmalı.",
        variant: "error",
      });
      return;
    }

    if (password !== passwordConfirm) {
      setFeedback({ text: "Şifreler eşleşmiyor.", variant: "error" });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setFeedback({
        text: "Kayıt sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar dene.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/giris?verified=1`,
      },
    });
    setLoading(false);

    if (error) {
      setFeedback({
        text: "Kayıt başlatılamadı. Bilgilerini kontrol edip tekrar dene.",
        variant: "error",
      });
      return;
    }

    setFeedback({
      text: "Kayıt isteğin alındı. Hesabını açmak için e-postandaki doğrulama bağlantısına tıkla. Maili göremezsen spam klasörünü de kontrol et.",
      variant: "success",
    });
    setPassword("");
    setPasswordConfirm("");
  }

  return (
    <form
      className="rounded-md border border-border bg-card p-6 shadow-sm"
      onSubmit={submit}
    >
      <label className="text-sm font-semibold text-ink" htmlFor="register-email">
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
          id="register-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="sen@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      <label
        className="mt-4 block text-sm font-semibold text-ink"
        htmlFor="register-password"
      >
        Şifre
      </label>
      <div className="relative mt-2">
        <LockKeyhole
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="register-password"
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
        htmlFor="register-password-confirm"
      >
        Şifre Tekrar
      </label>
      <div className="relative mt-2">
        <LockKeyhole
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="register-password-confirm"
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
        Hesap Oluştur
      </button>

      <div className="mt-4 text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <Link className="font-semibold text-primary-dark hover:text-primary" href="/giris">
          Giriş yap
        </Link>
      </div>

      {feedback ? (
        <FormAlert variant={feedback.variant}>{feedback.text}</FormAlert>
      ) : null}
    </form>
  );
}
