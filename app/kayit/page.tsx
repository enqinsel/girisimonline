import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
          Girişim Online
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">
          Hesap Oluştur
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Kaydettiğin haberler, notların ve okuma durumun sadece hesabına bağlı
          kalır. Kayıt sonrası e-postanı doğrulaman gerekir.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
