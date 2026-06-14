import type { Article, Source } from "@/lib/types";

const now = new Date().toISOString();

export const sampleSources: Source[] = [
  {
    id: "sample-webrazzi",
    name: "Webrazzi",
    slug: "webrazzi",
    homepage_url: "https://webrazzi.com/",
    feed_url: "https://webrazzi.com/kategori/yatirim/feed/",
    list_url: "https://webrazzi.com/kategori/yatirim/",
    type: "rss",
    language: "tr",
    section: "startup",
    active: true,
    parser_config: null,
    last_checked_at: now,
    last_success_at: now,
    last_error_message: null,
    last_inserted_count: 0,
    created_at: now,
    updated_at: now,
  },
  {
    id: "sample-egirisim",
    name: "egirişim",
    slug: "egirisim",
    homepage_url: "https://egirisim.com/",
    feed_url: null,
    list_url: "https://egirisim.com/",
    type: "html",
    language: "tr",
    section: "startup",
    active: true,
    parser_config: null,
    last_checked_at: now,
    last_success_at: now,
    last_error_message: null,
    last_inserted_count: 0,
    created_at: now,
    updated_at: now,
  },
];

export const sampleArticles: Article[] = [];
