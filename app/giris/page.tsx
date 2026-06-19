import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const nextPath = safeNextPath(single(params.next));
  const notice = getNotice(params);

  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary-dark">
          Girişim Online
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">
          Giriş Yap
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Haber kaydetmek, kişisel not almak ve sana özel okuma akışını takip
          etmek için e-posta ve şifrenle oturum aç.
        </p>
        <div className="mt-6">
          <LoginForm nextPath={nextPath} notice={notice} />
        </div>
      </div>
    </main>
  );
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function getNotice(params: SearchParams) {
  if (single(params.verified)) {
    return "E-posta doğrulaması tamamlandıysa giriş yapabilirsin.";
  }

  if (single(params.reset)) {
    return "Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.";
  }

  return null;
}
