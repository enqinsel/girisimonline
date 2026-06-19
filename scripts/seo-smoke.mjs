const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://girisimonline.org",
);

const requiredSitemapPaths = [
  "/",
  "/ekonomi",
  "/ekonomi-haberleri",
  "/kaynaklar",
  "/product-hunt",
];

const checks = [];

await checkRobots();
const sitemapXml = await checkSitemap();
await checkPage("/", { canonical: siteUrl });
await checkPage("/ekonomi", { canonical: `${siteUrl}/ekonomi` });
await checkNoindexPage("/girisim-haberleri");
await checkNoindexPage("/yatirim-haberleri");
await checkArticleFromSitemap(sitemapXml);

const failed = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✕"} ${check.label}`);
  if (!check.ok && check.detail) console.log(`  ${check.detail}`);
}

if (failed.length > 0) process.exit(1);

async function checkRobots() {
  const body = await fetchText("/robots.txt");
  record("robots.txt sitemap içeriyor", body.includes(`${siteUrl}/sitemap.xml`));
  record("robots.txt admin alanlarını kapatıyor", body.includes("/ngin"));
  record("robots.txt API alanını kapatıyor", body.includes("/api/"));
}

async function checkSitemap() {
  const body = await fetchText("/sitemap.xml");
  for (const path of requiredSitemapPaths) {
    record(`sitemap ${path} içeriyor`, body.includes(`<loc>${siteUrl}${path === "/" ? "" : path}</loc>`));
  }
  return body;
}

async function checkPage(path, options) {
  const body = await fetchText(path);
  record(`${path} canonical doğru`, body.includes(`rel="canonical" href="${options.canonical}"`));

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId) {
    record(`${path} GA4 etiketi içeriyor`, body.includes(gaId));
  }

  const verification = process.env.GOOGLE_SITE_VERIFICATION;
  if (verification) {
    record(`${path} Search Console doğrulaması içeriyor`, body.includes(verification));
  }
}

async function checkNoindexPage(path) {
  const body = await fetchText(path);
  record(`${path} noindex`, body.includes("noindex"));
}

async function checkArticleFromSitemap(sitemapXml) {
  const match = sitemapXml.match(/<loc>(https?:\/\/[^<]+\/haber\/[^<]+)<\/loc>/);
  if (!match) {
    record("sitemap indexlenebilir haber içeriyor", false);
    return;
  }

  const url = match[1];
  const response = await fetch(url, { redirect: "follow" });
  const body = await response.text();
  record("haber sayfası 200 dönüyor", response.ok, `${url} status=${response.status}`);
  record("haber canonical yerel URL", body.includes(`rel="canonical" href="${url}"`));
  record("haber NewsArticle JSON-LD içeriyor", body.includes('"@type":"NewsArticle"'));
  record("haber kaynak citation içeriyor", body.includes('"citation"'));
}

async function fetchText(path) {
  const url = path.startsWith("http") ? path : `${siteUrl}${path}`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} ${response.status} döndü`);
  }
  return response.text();
}

function record(label, ok, detail = "") {
  checks.push({ label, ok: Boolean(ok), detail });
}

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/g, "");
}
