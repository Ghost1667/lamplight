-- Lamplight: database schema for Supabase
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Then run seed.sql to load the starter lessons and questions.

create extension if not exists pgcrypto;

-------------------------------------------------------------------------------
-- 1. Accounts
-------------------------------------------------------------------------------
-- One row per signed-up account. is_admin = may edit the lesson library.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Create a profile automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the signed-in user is an admin. Used by the security rules below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-------------------------------------------------------------------------------
-- 2. The lesson library (everyone can read; only admins can change)
-------------------------------------------------------------------------------
create table if not exists public.subjects (
  id     text primary key,                                  -- e.g. 'maths'
  name   text not null,
  hue    int  not null default 222,                         -- colour of the subject chip (0-360)
  bands  text[] not null default '{jss}',                   -- levels it is taught in
  sort   int  not null default 99,
  constraint subjects_bands_valid check (bands <@ array['primary','jss','sss']::text[])
);

create table if not exists public.topics (
  id          text primary key,                             -- e.g. 'maths-jss-percentages'
  subject_id  text not null references public.subjects (id) on delete cascade,
  band        text not null check (band in ('primary','jss','sss')),
  title       text not null,
  summary     text not null default '',
  lesson      text not null default '',                     -- plain text: '## ' headings, '- ' bullets, **bold**, ==highlight==
  sort        int  not null default 99,
  created_at  timestamptz not null default now()
);
create index if not exists topics_subject_band_idx on public.topics (subject_id, band);

create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  topic_id     text not null references public.topics (id) on delete cascade,
  question     text not null,
  options      text[] not null check (array_length(options, 1) = 4),
  answer       smallint not null check (answer between 0 and 3),   -- index into options: 0 = A ... 3 = D
  explanation  text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists questions_topic_idx on public.questions (topic_id);

-------------------------------------------------------------------------------
-- 3. Learners and their progress (private to the account that owns them)
-------------------------------------------------------------------------------
-- One account (a parent, say) can hold several learners (their children).
create table if not exists public.learners (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  class       text not null,                                -- e.g. 'JSS 1'
  band        text not null check (band in ('primary','jss','sss')),
  streak      int  not null default 0,
  last_day    date,
  created_at  timestamptz not null default now()
);
create index if not exists learners_owner_idx on public.learners (owner);

-- One row per learner per question: the spaced-repetition "card".
create table if not exists public.cards (
  learner_id   uuid not null references public.learners (id) on delete cascade,
  question_id  uuid not null references public.questions (id) on delete cascade,
  box          smallint not null default 1 check (box between 1 and 5),
  due          timestamptz not null default now(),
  seen         int not null default 0,
  correct      int not null default 0,
  last_seen    timestamptz,
  primary key (learner_id, question_id)
);
create index if not exists cards_due_idx on public.cards (learner_id, due);

-------------------------------------------------------------------------------
-- 4. Security rules (Row Level Security)
-------------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.subjects  enable row level security;
alter table public.topics    enable row level security;
alter table public.questions enable row level security;
alter table public.learners  enable row level security;
alter table public.cards     enable row level security;

-- Profiles: you can read your own. Nobody can make themselves admin from the website.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Library: anyone (even without an account) can read.
drop policy if exists "library readable" on public.subjects;
create policy "library readable" on public.subjects  for select to anon, authenticated using (true);
drop policy if exists "library readable" on public.topics;
create policy "library readable" on public.topics    for select to anon, authenticated using (true);
drop policy if exists "library readable" on public.questions;
create policy "library readable" on public.questions for select to anon, authenticated using (true);

-- Library: only admins can add, change or delete.
drop policy if exists "admins edit" on public.subjects;
create policy "admins edit" on public.subjects  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins edit" on public.topics;
create policy "admins edit" on public.topics    for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins edit" on public.questions;
create policy "admins edit" on public.questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Learners: each account sees and changes only its own.
drop policy if exists "own learners" on public.learners;
create policy "own learners" on public.learners
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Cards: only for learners you own.
drop policy if exists "own cards" on public.cards;
create policy "own cards" on public.cards
  for all to authenticated
  using (exists (select 1 from public.learners l where l.id = learner_id and l.owner = auth.uid()))
  with check (exists (select 1 from public.learners l where l.id = learner_id and l.owner = auth.uid()));

-- Table privileges for the website's two roles (RLS above still decides which rows).
grant usage on schema public to anon, authenticated;
grant select on public.subjects, public.topics, public.questions to anon, authenticated;
grant insert, update, delete on public.subjects, public.topics, public.questions to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.learners, public.cards to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
