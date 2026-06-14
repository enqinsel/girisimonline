alter table public.sources
add column if not exists section text not null default 'startup';

alter table public.sources
alter column section set default 'startup';

update public.sources
set section = 'startup'
where section is null;

alter table public.sources
alter column section set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sources_section_check'
      and conrelid = 'public.sources'::regclass
  ) then
    alter table public.sources
    add constraint sources_section_check
    check (section in ('startup', 'economy'));
  end if;
end $$;

create index if not exists sources_section_active_idx
  on public.sources(section, active, name);

update public.sources
set section = 'startup'
where slug in (
  'startupx',
  'girisim-haber',
  'webrazzi-yatirim',
  'webrazzi-girisimler',
  'egirisim',
  'startupcentrum',
  'product-hunt'
);

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
  '{"allowMetaFallback": true}'::jsonb
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
  parser_config = excluded.parser_config,
  updated_at = now();
