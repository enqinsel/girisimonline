grant usage on schema public to anon, authenticated, service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

grant select on public.sources to anon, authenticated;
grant select on public.articles to anon, authenticated;

grant select, insert, update, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.article_reads to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.product_hunt_notes to authenticated;
