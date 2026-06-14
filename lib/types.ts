export type SourceType = "rss" | "html" | "product_hunt";
export type Language = "tr" | "en";
export type ArticleStatus = "published" | "hidden" | "error";
export type ImportStatus = "success" | "partial" | "error";
export type SourceSection = "startup" | "economy";

export type ParserConfig = {
  itemSelector: string;
  titleSelector?: string;
  linkSelector?: string;
  excerptSelector?: string;
  dateSelector?: string;
  linkAttribute?: string;
  dateAttribute?: string;
  allowMetaFallback?: boolean;
  allowDateMetaFallback?: boolean;
  allowedPathPrefixes?: string[];
  allowedRssCategories?: string[];
  jsonLdItemList?: boolean;
  listUrls?: string[];
  nextDataPosts?: boolean;
};

export type Source = {
  id: string;
  name: string;
  slug: string;
  homepage_url: string;
  feed_url: string | null;
  list_url: string | null;
  type: SourceType;
  language: Language;
  section: SourceSection;
  active: boolean;
  parser_config: ParserConfig | null;
  last_checked_at: string | null;
  last_success_at: string | null;
  last_error_message: string | null;
  last_inserted_count: number;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  source_id: string;
  title: string;
  slug: string;
  original_url: string;
  canonical_url: string | null;
  normalized_url: string;
  excerpt: string | null;
  published_at: string | null;
  imported_at: string;
  language: Language;
  section: SourceSection;
  status: ArticleStatus;
  unique_hash: string;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  source?: Pick<Source, "id" | "name" | "slug" | "homepage_url" | "section">;
};

export type BookmarkWithArticle = {
  id: string;
  article_id: string;
  created_at: string;
  article: Article;
  note: {
    id: string;
    body: string;
    updated_at: string;
  } | null;
};

export type ImportLog = {
  id: string;
  source_id: string | null;
  status: ImportStatus;
  found_count: number;
  inserted_count: number;
  skipped_count: number;
  error_message: string | null;
  created_at: string;
  source?: Pick<Source, "name" | "slug"> | null;
};
