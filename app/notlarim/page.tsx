import type { Metadata } from "next";
import { NotesClient } from "@/components/notes-client";

export const metadata: Metadata = {
  title: "Notlarım",
};

export default function NotesPage() {
  return <NotesClient />;
}
