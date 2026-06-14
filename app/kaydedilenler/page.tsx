import type { Metadata } from "next";
import { SavedArticlesClient } from "@/components/saved-articles-client";

export const metadata: Metadata = {
  title: "Kaydedilenler",
};

export default function SavedPage() {
  return <SavedArticlesClient />;
}
