import crypto from "node:crypto";

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function clampExcerpt(value: string | null | undefined, maxLength = 320) {
  if (!value) return null;
  const cleaned = stripHtml(value);
  if (!cleaned) return null;
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

export function slugify(value: string) {
  const replaced = value
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("");

  return (
    replaced
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "haber"
  );
}

export function shortHash(value: string, length = 8) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, length);
}
