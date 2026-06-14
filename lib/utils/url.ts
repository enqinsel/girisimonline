const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
];

export function absoluteUrl(value: string, base?: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

export function normalizeArticleUrl(value: string, base?: string) {
  const urlValue = absoluteUrl(value, base);
  if (!urlValue) return null;

  const url = new URL(urlValue);
  if (url.protocol === "http:") {
    url.protocol = "https:";
  }

  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  url.hash = "";

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/g, "");
  }

  url.searchParams.sort();
  return url.toString();
}
