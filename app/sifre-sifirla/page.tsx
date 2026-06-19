import type { Metadata } from "next";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";

export const metadata: Metadata = {
  title: "Şifre Sıfırla",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PasswordResetPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
          Girişim Online
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">
          Şifre Sıfırla
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Hesabına bağlı e-posta adresini yaz; şifre yenileme bağlantısını sana
          gönderelim.
        </p>
        <div className="mt-6">
          <PasswordResetRequestForm />
        </div>
      </div>
    </main>
  );
}
