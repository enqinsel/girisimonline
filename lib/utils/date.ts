const formatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function displayDate(publishedAt: string | null, importedAt: string) {
  const value = publishedAt ?? importedAt;
  return formatter.format(new Date(value));
}

export function relativeDate(publishedAt: string | null, importedAt: string) {
  if (!publishedAt) return displayDate(null, importedAt);

  const value = new Date(publishedAt).getTime();
  const diff = Date.now() - value;
  const days = Math.floor(diff / 86_400_000);

  if (days <= 0) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;

  return displayDate(publishedAt, importedAt);
}

export function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
