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

create index if not exists product_hunt_notes_user_updated_idx
  on public.product_hunt_notes(user_id, updated_at desc);

drop trigger if exists product_hunt_notes_set_updated_at on public.product_hunt_notes;
create trigger product_hunt_notes_set_updated_at
before update on public.product_hunt_notes
for each row execute function public.set_updated_at();

alter table public.product_hunt_notes enable row level security;

grant select, insert, update, delete on public.product_hunt_notes to authenticated;

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
