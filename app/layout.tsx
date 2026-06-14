import type { Metadata } from "next";
import Link from "next/link";
import { Rocket } from "lucide-react";
import "@/app/globals.css";
import { AuthNav } from "@/components/auth-nav";
import { BrandLogoMark } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: {
    default: "Girişim Online",
    template: "%s | Girişim Online",
  },
  description:
    "Türkiye startup ekosistemi, yatırım haberleri ve girişim gündemini tek akışta takip et.",
  openGraph: {
    title: "Girişim Online",
    description:
      "Girişim ve yatırım haberlerini tek yerden takip etmek için sade haber akışı.",
    siteName: "Girişim Online",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogoMark />
              <span className="text-lg font-semibold tracking-normal text-ink">
                Girişim Online
              </span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium text-muted md:flex">
              <Link className="transition hover:text-ink" href="/">
                Son Haberler
              </Link>
              <Link className="transition hover:text-ink" href="/ekonomi">
                Ekonomi
              </Link>
              <Link className="transition hover:text-ink" href="/kaydedilenler">
                Kaydedilenler
              </Link>
              <Link className="transition hover:text-ink" href="/notlarim">
                Notlarım
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-[#da552f]/20 bg-[#da552f] px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-[#c84d2b]"
                href="/product-hunt"
              >
                <Rocket className="h-4 w-4" aria-hidden="true" />
                Product Hunt
              </Link>
            </nav>
            <AuthNav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
