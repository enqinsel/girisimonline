insert into public.sources (
  name,
  slug,
  homepage_url,
  feed_url,
  list_url,
  type,
  language,
  section,
  active,
  parser_config
)
values
(
  'StartupX',
  'startupx',
  'https://startupx.com.tr/',
  null,
  'https://startupx.com.tr/kategori/girisim',
  'html',
  'tr',
  'startup',
  true,
  '{
    "itemSelector": ".content-block.post-list-view",
    "titleSelector": ".title a, h4 a",
    "linkSelector": ".title a, h4 a, a[href]",
    "excerptSelector": ".post-excerpt",
    "dateSelector": ".post-meta-list li",
    "linkAttribute": "href",
    "dateAttribute": "datetime",
    "allowMetaFallback": true,
    "allowDateMetaFallback": true,
    "nextDataPosts": true,
    "listUrls": [
      "https://startupx.com.tr/kategori/yatirim",
      "https://startupx.com.tr/kategori/girisim"
    ]
  }'::jsonb
),
(
  'Girişim Haber',
  'girisim-haber',
  'https://www.girisimhaber.com/',
  'https://www.girisimhaber.com/rss',
  'https://www.girisimhaber.com/',
  'rss',
  'tr',
  'startup',
  true,
  '{
    "itemSelector": "article, .post, .blog-post, .news-item, .entry",
    "titleSelector": "h2, h3, .post-title, .entry-title",
    "linkSelector": "h2 a, h3 a, .post-title a, .entry-title a, a[href]",
    "excerptSelector": ".post-summary, .entry-summary, .excerpt, p",
    "dateSelector": "time, .date, .post-date",
    "linkAttribute": "href",
    "dateAttribute": "datetime",
    "allowMetaFallback": true
  }'::jsonb
),
(
  'Webrazzi Yatırım',
  'webrazzi-yatirim',
  'https://webrazzi.com/',
  'https://webrazzi.com/kategori/yatirim/feed/',
  'https://webrazzi.com/kategori/yatirim/',
  'rss',
  'tr',
  'startup',
  true,
  '{
    "itemSelector": "article, .post, .content-card, .entry",
    "titleSelector": "h2, h3, .title, .entry-title",
    "linkSelector": "h2 a, h3 a, .title a, .entry-title a, a[href]",
    "excerptSelector": ".excerpt, .summary, p",
    "dateSelector": "time, .date",
    "linkAttribute": "href",
    "dateAttribute": "datetime",
    "allowMetaFallback": true
  }'::jsonb
),
(
  'Webrazzi Girişimler',
  'webrazzi-girisimler',
  'https://webrazzi.com/',
  'https://webrazzi.com/kategori/girisimler/feed/',
  'https://webrazzi.com/kategori/girisimler/',
  'rss',
  'tr',
  'startup',
  true,
  '{
    "itemSelector": "article, .post, .content-card, .entry",
    "titleSelector": "h2, h3, .title, .entry-title",
    "linkSelector": "h2 a, h3 a, .title a, .entry-title a, a[href]",
    "excerptSelector": ".excerpt, .summary, p",
    "dateSelector": "time, .date",
    "linkAttribute": "href",
    "dateAttribute": "datetime",
    "allowMetaFallback": true
  }'::jsonb
),
(
  'egirişim',
  'egirisim',
  'https://egirisim.com/',
  null,
  'https://egirisim.com/',
  'html',
  'tr',
  'startup',
  true,
  '{
    "itemSelector": "article, .post, .jeg_post, .td_module_wrap, .elementor-post",
    "titleSelector": "h2, h3, .entry-title, .post-title, .jeg_post_title, .td-module-title",
    "linkSelector": "h2 a, h3 a, .entry-title a, .post-title a, .jeg_post_title a, .td-module-title a, a[href]",
    "excerptSelector": ".entry-summary, .post-excerpt, .jeg_post_excerpt, .td-excerpt, p",
    "dateSelector": "time, .entry-date, .post-date, .jeg_meta_date",
    "linkAttribute": "href",
    "dateAttribute": "datetime",
    "allowMetaFallback": true
  }'::jsonb
),
(
  'StartupCentrum',
  'startupcentrum',
  'https://media.startupcentrum.com/',
  'https://media.startupcentrum.com/tr/category/girisimler/feed/',
  'https://media.startupcentrum.com/tr/category/girisimler/',
  'rss',
  'tr',
  'startup',
  true,
  '{
    "allowMetaFallback": true
  }'::jsonb
),
(
  'Bloomberg HT',
  'bloomberg-ht',
  'https://www.bloomberght.com/',
  null,
  'https://www.bloomberght.com/piyasalar',
  'html',
  'tr',
  'economy',
  true,
  '{
    "allowMetaFallback": true,
    "allowDateMetaFallback": true,
    "jsonLdItemList": true
  }'::jsonb
),
(
  'CNBC-e',
  'cnbce',
  'https://www.cnbce.com/',
  'https://www.cnbce.com/rss',
  'https://www.cnbce.com/',
  'rss',
  'tr',
  'economy',
  true,
  '{
    "allowMetaFallback": true,
    "allowedPathPrefixes": ["/is-dunyasi", "/dijital-varliklar", "/kripto"],
    "allowedRssCategories": ["İş Dünyası", "Dijital Varlıklar", "Kripto"]
  }'::jsonb
),
(
  'Doviz.com',
  'doviz-com',
  'https://www.doviz.com/',
  'https://www.doviz.com/news/rss',
  'https://www.doviz.com/haberler',
  'rss',
  'tr',
  'economy',
  true,
  '{
    "allowMetaFallback": true
  }'::jsonb
),
(
  'Dünya',
  'dunya',
  'https://www.dunya.com/',
  'https://www.dunya.com/rss',
  'https://www.dunya.com/',
  'rss',
  'tr',
  'economy',
  true,
  '{
    "allowMetaFallback": true,
    "allowedPathPrefixes": ["/ekonomi", "/finans"],
    "allowedRssCategories": ["Ekonomi", "Finans"]
  }'::jsonb
),
(
  'Product Hunt',
  'product-hunt',
  'https://www.producthunt.com/',
  'https://www.producthunt.com/feed',
  'https://www.producthunt.com/',
  'product_hunt',
  'en',
  'startup',
  false,
  null
)
on conflict (slug) do update
set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  feed_url = excluded.feed_url,
  list_url = excluded.list_url,
  type = excluded.type,
  language = excluded.language,
  section = excluded.section,
  active = excluded.active,
  parser_config = excluded.parser_config;
