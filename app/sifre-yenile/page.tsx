import type { Metadata } from "next";
import { PasswordUpdateForm } from "@/components/password-update-form";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirle",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PasswordUpdatePage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
          Girişim Online
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">
          Yeni Şifre Belirle
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          E-postandaki güvenli bağlantı ile yeni şifreni belirleyebilirsin.
        </p>
        <div className="mt-6">
          <PasswordUpdateForm />
        </div>
      </div>
    </main>
  );
}
