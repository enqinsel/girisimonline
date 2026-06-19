import type { Metadata } from "next";
import { SavedArticlesClient } from "@/components/saved-articles-client";

export const metadata: Metadata = {
  title: "Kaydedilenler",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedPage() {
  return <SavedArticlesClient />;
}
