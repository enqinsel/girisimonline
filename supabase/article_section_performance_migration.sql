alter table public.articles
add column if not exists section text;

update public.articles as article
set section = source.section
from public.sources as source
where article.source_id = source.id
  and (article.section is null or article.section <> source.section);

update public.articles
set section = 'startup'
where section is null;

alter table public.articles
alter column section set default 'startup';

alter table public.articles
alter column section set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_section_check'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
    add constraint articles_section_check
    check (section in ('startup', 'economy'));
  end if;
end $$;

create or replace function public.sync_article_section_from_source()
returns trigger
language plpgsql
as $$
declare
  source_section text;
begin
  select section into source_section
  from public.sources
  where id = new.source_id;

  new.section = coalesce(source_section, new.section, 'startup');
  return new;
end;
$$;

drop trigger if exists articles_sync_section_from_source on public.articles;
create trigger articles_sync_section_from_source
before insert or update of source_id, section on public.articles
for each row execute function public.sync_article_section_from_source();

create index if not exists articles_section_status_published_idx
  on public.articles(section, status, published_at desc nulls last, imported_at desc);

create index if not exists articles_status_published_idx
  on public.articles(status, published_at desc nulls last, imported_at desc);

create index if not exists articles_published_slug_idx
  on public.articles(slug)
  where status = 'published';

create index if not exists sources_slug_section_idx
  on public.sources(slug, section);
