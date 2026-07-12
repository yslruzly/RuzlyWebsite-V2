-- Database setup for the community chat. The app never runs this file, it's
-- kept in the repo as the record of what the Supabase schema looks like and
-- why. Each block below was run once in the Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query). If I ever add to the schema, the
-- new block gets appended here and run the same way.

-- ─────────────────────────────────────────────────────────────
-- Original setup: the messages table, public read/insert, realtime.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  message text not null check (char_length(message) between 1 and 160),
  city text,
  device text not null default 'desktop' check (device in ('desktop', 'mobile')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone can read the guestbook.
create policy "public read"
  on public.messages for select
  using (true);

-- Anyone can post (length limits enforced by the checks above + API route).
-- NOTE: this policy is replaced by the owner mode block at the bottom.
create policy "public insert"
  on public.messages for insert
  with check (true);

-- No update/delete policies, so nobody can edit or remove messages through
-- the site. I'm the only one who can, from the Supabase dashboard.

-- Broadcast inserts to realtime subscribers.
alter publication supabase_realtime add table public.messages;

-- ─────────────────────────────────────────────────────────────
-- Owner mode migration (added later, run after the block above).
-- Adds a flag for my own messages and locks it down: the public
-- anon key can only ever insert is_owner = false, so nobody can
-- fake the owner badge. Owner messages go through the API route
-- with the service role key after it checks my secret.
-- ─────────────────────────────────────────────────────────────
alter table public.messages
  add column if not exists is_owner boolean not null default false;

drop policy "public insert" on public.messages;

create policy "public insert"
  on public.messages for insert
  with check (is_owner = false);

-- ─────────────────────────────────────────────────────────────
-- Server-only inserts (added later, run after the block above).
--
-- Found a hole: the anon key is public, it ships inside the site's
-- JavaScript, so anyone could POST straight to Supabase and skip my
-- API route completely. That meant the rate limit, the honeypot and
-- the profanity filter could all be walked right past.
--
-- Fix is to drop the public insert policy entirely. With no insert
-- policy, RLS denies inserts by default, so the anon key can now only
-- READ. Every new message has to go through /api/chat, which uses the
-- service role key and is the only place the checks live.
-- ─────────────────────────────────────────────────────────────
drop policy "public insert" on public.messages;
