create table if not exists public.article_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists article_reads_user_read_at_idx
  on public.article_reads(user_id, read_at desc);

alter table public.article_reads enable row level security;

grant select, insert, update, delete on public.article_reads to authenticated;

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
