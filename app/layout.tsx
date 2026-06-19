import type { Metadata } from "next";
import Link from "next/link";
import { Rocket } from "lucide-react";
import "@/app/globals.css";
import { Analytics } from "@/components/analytics";
import { AuthNav } from "@/components/auth-nav";
import { BrandLogoMark } from "@/components/brand-logo";
import { JsonLd } from "@/components/json-ld";
import {
  absoluteUrl,
  defaultSeoDescription,
  organizationJsonLd,
  siteName,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Girişim Online - Girişim, Yatırım ve Ekonomi Haberleri",
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  keywords: [
    "girişim haberleri",
    "yatırım haberleri",
    "startup haberleri",
    "ekonomi haberleri",
    "finans haberleri",
    "Product Hunt",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Girişim Online",
    description: defaultSeoDescription,
    siteName,
    locale: "tr_TR",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Girişim Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Girişim Online",
    description: defaultSeoDescription,
    images: [absoluteUrl("/opengraph-image")],
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/icon.png",
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Analytics />
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
              <Link className="transition hover:text-ink" href="/kaynaklar">
                Kaynaklar
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
