-- Lamplight update: lets a topic target one specific class (e.g. JSS 1).
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run again.
--
-- class = null       → every class in the topic's level sees it (e.g. all of JSS)
-- class = 'JSS 1'    → only JSS 1 learners see it

alter table public.topics add column if not exists class text;

alter table public.topics drop constraint if exists topics_class_valid;
alter table public.topics add constraint topics_class_valid check (
  class is null
  or (band = 'primary' and class in ('Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6'))
  or (band = 'jss'     and class in ('JSS 1','JSS 2','JSS 3'))
  or (band = 'sss'     and class in ('SS 1','SS 2','SS 3'))
);

create index if not exists topics_class_idx on public.topics (subject_id, band, class);
