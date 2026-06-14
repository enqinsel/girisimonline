create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  homepage_url text not null,
  feed_url text,
  list_url text,
  type text not null check (type in ('rss', 'html', 'product_hunt')),
  language text not null check (language in ('tr', 'en')),
  section text not null default 'startup' check (section in ('startup', 'economy')),
  active boolean not null default true,
  parser_config jsonb,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error_message text,
  last_inserted_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  title text not null,
  slug text not null unique,
  original_url text not null,
  canonical_url text,
  normalized_url text not null,
  excerpt text,
  published_at timestamptz,
  imported_at timestamptz not null default now(),
  language text not null check (language in ('tr', 'en')),
  status text not null default 'published' check (status in ('published', 'hidden', 'error')),
  unique_hash text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create table if not exists public.article_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create table if not exists public.product_hunt_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_slug text not null,
  product_url text not null,
  website_url text,
  tagline text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  status text not null check (status in ('success', 'partial', 'error')),
  found_count integer not null default 0,
  inserted_count integer not null default 0,
  skipped_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create unique index if not exists articles_normalized_url_unique
  on public.articles(normalized_url);

create unique index if not exists articles_unique_hash_unique
  on public.articles(unique_hash);

create index if not exists articles_status_imported_idx
  on public.articles(status, imported_at desc);

create index if not exists articles_source_idx
  on public.articles(source_id);

create index if not exists article_reads_user_read_at_idx
  on public.article_reads(user_id, read_at desc);

create index if not exists sources_section_active_idx
  on public.sources(section, active, name);

create index if not exists import_logs_source_created_idx
  on public.import_logs(source_id, created_at desc);

create index if not exists product_hunt_notes_user_updated_idx
  on public.product_hunt_notes(user_id, updated_at desc);

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists product_hunt_notes_set_updated_at on public.product_hunt_notes;
create trigger product_hunt_notes_set_updated_at
before update on public.product_hunt_notes
for each row execute function public.set_updated_at();

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.article_reads enable row level security;
alter table public.notes enable row level security;
alter table public.product_hunt_notes enable row level security;
alter table public.import_logs enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant select on public.sources to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant select, insert, update, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.article_reads to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.product_hunt_notes to authenticated;

drop policy if exists "Public can read active sources" on public.sources;
create policy "Public can read active sources"
on public.sources for select
using (active = true);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select
using (status = 'published');

drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks"
on public.bookmarks for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own bookmarks" on public.bookmarks;
create policy "Users insert own bookmarks"
on public.bookmarks for insert
with check (auth.uid() = user_id);

drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks"
on public.bookmarks for delete
using (auth.uid() = user_id);

drop policy if exists "Users read own article reads" on public.article_reads;
create policy "Users read own article reads"
on public.article_reads for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own article reads" on public.article_reads;
create policy "Users insert own article reads"
on public.article_reads for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own article reads" on public.article_reads;
create policy "Users update own article reads"
on public.article_reads for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own article reads" on public.article_reads;
create policy "Users delete own article reads"
on public.article_reads for delete
using (auth.uid() = user_id);

drop policy if exists "Users read own notes" on public.notes;
create policy "Users read own notes"
on public.notes for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own notes" on public.notes;
create policy "Users insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own notes" on public.notes;
create policy "Users update own notes"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own notes" on public.notes;
create policy "Users delete own notes"
on public.notes for delete
using (auth.uid() = user_id);

drop policy if exists "Users read own product hunt notes" on public.product_hunt_notes;
create policy "Users read own product hunt notes"
on public.product_hunt_notes for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own product hunt notes" on public.product_hunt_notes;
create policy "Users insert own product hunt notes"
on public.product_hunt_notes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own product hunt notes" on public.product_hunt_notes;
create policy "Users update own product hunt notes"
on public.product_hunt_notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own product hunt notes" on public.product_hunt_notes;
create policy "Users delete own product hunt notes"
on public.product_hunt_notes for delete
using (auth.uid() = user_id);
