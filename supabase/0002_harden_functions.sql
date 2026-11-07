-- Only for projects set up with the earlier 0001_sync.sql, where is_allowed() lived in "public".
-- Moves it to a schema the REST API doesn't expose and locks down Supabase's automatic-RLS helper,
-- per Supabase's security advisor. New projects get the private schema from 0001 directly.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_allowed() set schema private;
revoke all on function private.is_allowed() from public, anon;
grant execute on function private.is_allowed() to authenticated;

drop policy own_doc on public.sync_doc;
create policy own_doc on public.sync_doc for all to authenticated
  using      (user_id = (select auth.uid()) and private.is_allowed())
  with check (user_id = (select auth.uid()) and private.is_allowed());

-- Supabase's automatic-RLS event-trigger helper never needs to be called over the API.
do $$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
