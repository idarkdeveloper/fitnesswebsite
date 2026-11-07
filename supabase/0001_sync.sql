-- PulseFit cloud sync: one document per user (docs/BACKEND_DESIGN.md, section 2.1).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to read; it creates
-- two tables, one trigger and one row-level-security policy, nothing else.

-- The one synced document per user.
create table public.sync_doc (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  doc        jsonb not null,
  version    integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint doc_size check (pg_column_size(doc) < 5000000)   -- 5 MB guard
);

-- The version is bumped by the server, never trusted from the client.
create function public.bump_version() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end $$;
create trigger sync_doc_bump before update on public.sync_doc
  for each row execute function public.bump_version();

-- Allowlist: only these emails can read or write anything.
create table public.allowed_emails (email text primary key);
-- Add your own email (lower case) in step 3 of docs/SUPABASE_SETUP.md:
--   insert into public.allowed_emails values ('you@example.com');

create function public.is_allowed() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_emails
                 where email = lower(auth.jwt() ->> 'email'))
$$;

alter table public.sync_doc       enable row level security;
alter table public.allowed_emails enable row level security;   -- no policies: clients can't read it

-- Explicit privileges, so this works whether or not "Automatically expose new tables" is on.
-- Signed-in users may use sync_doc (RLS below limits them to their own row, and only if allowlisted).
-- Nobody gets the allowlist table, and signed-out visitors get nothing.
revoke all on public.sync_doc, public.allowed_emails from anon, authenticated;
grant select, insert, update, delete on public.sync_doc to authenticated;
revoke all on function public.is_allowed() from public, anon;
grant execute on function public.is_allowed() to authenticated;

create policy own_doc on public.sync_doc for all to authenticated
  using      (user_id = (select auth.uid()) and public.is_allowed())
  with check (user_id = (select auth.uid()) and public.is_allowed());
