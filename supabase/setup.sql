-- 90 Day Plan and System — Supabase setup
-- Run once in: Supabase dashboard → SQL Editor → New query → paste → Run.
--
-- One table. Every piece of app state is a row: (your user, a key, a JSON blob).
--   key examples:  settings · day:2026-11-05 · week:2026-11-02
-- Row-level security locks every row to the signed-in user, and the table to ONE email.
-- Replace OWNER_EMAIL below with the email you sign in with before running.

create table if not exists public.entries (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.entries enable row level security;

-- Only the owner, only their own rows. Nobody else can read, write, or even create an account's rows.
drop policy if exists "owner only" on public.entries;
create policy "owner only" on public.entries
  for all
  to authenticated
  using     (auth.uid() = user_id and (auth.jwt() ->> 'email') = 'OWNER_EMAIL')
  with check (auth.uid() = user_id and (auth.jwt() ->> 'email') = 'OWNER_EMAIL');

-- Nothing for the anon role: the publishable key alone can't touch the table.
revoke all on public.entries from anon;
grant select, insert, update, delete on public.entries to authenticated;
