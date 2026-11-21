create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  grade int not null check (grade between 5 and 11),
  school text,
  district text,
  locale text not null default 'uz' check (locale in ('uz','en','ru')),
  points int not null default 0,
  streak_days int not null default 0,
  last_streak_date date,          -- last day a "solve or help" happened
  last_visit_date date,           -- last day the daily-visit bonus ran
  parent_phone text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,      -- algebra | fizika | kimyo
  name_uz text not null, name_en text not null, name_ru text not null,
  icon text not null,             -- lucide icon name
  sort int not null default 0
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  grade int not null,
  title_uz text not null, title_en text not null, title_ru text not null,
  sort int not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,  -- null for sample rows
  subject_id uuid not null references public.subjects(id),
  topic_id uuid references public.topics(id),
  text text not null check (char_length(text) between 10 and 1000),
  image_url text,
  status text not null default 'open'
    check (status in ('open','solved_by_forum','solved_by_ai','sent_to_teacher')),
  simpler_count int not null default 0,
  understood_count int not null default 0,
  is_public boolean not null default true,
  is_sample boolean not null default false,
  search tsvector generated always as (to_tsvector('simple', coalesce(text,''))) stored,
  created_at timestamptz not null default now()
);
create index questions_search_idx on public.questions using gin(search);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null,               -- display name (sample rows use a team-written name)
  steps jsonb not null,                    -- ["step 1 text", "step 2 text", ...]
  stars int check (stars between 1 and 5),
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student','ai')),
  kind text not null default 'text' check (kind in ('text','understood','simpler')),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  initials text not null,
  subject_id uuid not null references public.subjects(id),
  district text not null,
  rating numeric(2,1) not null,
  price_uzs_15min int not null,
  bio_uz text not null, bio_en text not null, bio_ru text not null,
  offline_center text not null,
  is_sample boolean not null default true
);

create table public.teacher_slots (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id),
  slot_id uuid not null unique references public.teacher_slots(id),
  question_id uuid references public.questions(id) on delete set null,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  payment_simulated boolean not null default true,
  meeting_link text,
  created_at timestamptz not null default now()
);

create table public.point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in
    ('daily_visit','question_asked','forum_helped','ai_understood','helper_star','booking_made','streak_loss')),
  points int not null,
  question_id uuid references public.questions(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.leaderboard_samples (
  id uuid primary key default gen_random_uuid(),
  full_name text not null, school text not null, district text not null,
  points int not null
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('question','answer')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create or replace function public.search_similar_questions(q text, p_topic uuid, p_subject uuid, p_exclude uuid)
returns table (id uuid, text text, topic_id uuid, is_sample boolean, rank real)
language sql stable as $$
  select qu.id, qu.text, qu.topic_id, qu.is_sample,
         ts_rank(qu.search, websearch_to_tsquery('simple', q)) as rank
  from public.questions qu
  where qu.id <> p_exclude
    and qu.subject_id = p_subject
    and exists (select 1 from public.answers a where a.question_id = qu.id)
    and (qu.is_sample or (qu.is_public and qu.status <> 'open'))
  order by (qu.topic_id = p_topic) desc, rank desc, qu.created_at desc
  limit 3;
$$;

-- Explicit grants prevent clients from changing points, stars or server-managed state.
alter table public.point_events add column is_sample boolean not null default false;
alter table public.leaderboard_samples add column is_sample boolean not null default true check (is_sample);
alter table public.teacher_slots add constraint valid_slot check (ends_at > starts_at);
create unique index teacher_slots_unique on public.teacher_slots(teacher_id, starts_at);
create unique index topics_subject_sort on public.topics(subject_id,sort);
create index questions_user_idx on public.questions(user_id);
create index tutor_messages_user_idx on public.tutor_messages(user_id,created_at);
create index point_events_user_idx on public.point_events(user_id,created_at);
create index bookings_user_idx on public.bookings(user_id);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant all on public.profiles to service_role;
alter table public.subjects enable row level security;
revoke all on public.subjects from anon, authenticated;
grant all on public.subjects to service_role;
alter table public.topics enable row level security;
revoke all on public.topics from anon, authenticated;
grant all on public.topics to service_role;
alter table public.questions enable row level security;
revoke all on public.questions from anon, authenticated;
grant all on public.questions to service_role;
alter table public.answers enable row level security;
revoke all on public.answers from anon, authenticated;
grant all on public.answers to service_role;
alter table public.tutor_messages enable row level security;
revoke all on public.tutor_messages from anon, authenticated;
grant all on public.tutor_messages to service_role;
alter table public.teachers enable row level security;
revoke all on public.teachers from anon, authenticated;
grant all on public.teachers to service_role;
alter table public.teacher_slots enable row level security;
revoke all on public.teacher_slots from anon, authenticated;
grant all on public.teacher_slots to service_role;
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
grant all on public.bookings to service_role;
alter table public.point_events enable row level security;
revoke all on public.point_events from anon, authenticated;
grant all on public.point_events to service_role;
alter table public.leaderboard_samples enable row level security;
revoke all on public.leaderboard_samples from anon, authenticated;
grant all on public.leaderboard_samples to service_role;
alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;
grant all on public.reports to service_role;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles to authenticated;
grant update(full_name,school,district,locale) on public.profiles to authenticated;
create policy profiles_own_read on public.profiles for select to authenticated using(id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using(id = auth.uid()) with check(id = auth.uid());
grant select on public.subjects to anon, authenticated;
create policy subjects_read on public.subjects for select to anon,authenticated using(true);
grant select on public.topics to anon, authenticated;
create policy topics_read on public.topics for select to anon,authenticated using(true);
grant select on public.teachers to anon, authenticated;
create policy teachers_read on public.teachers for select to anon,authenticated using(true);
grant select on public.teacher_slots to anon, authenticated;
create policy teacher_slots_read on public.teacher_slots for select to anon,authenticated using(true);
grant select on public.leaderboard_samples to anon, authenticated;
create policy leaderboard_samples_read on public.leaderboard_samples for select to anon,authenticated using(true);

grant select on public.questions to anon,authenticated;
grant insert(user_id,subject_id,topic_id,text,image_url,is_public) on public.questions to authenticated;
create policy questions_read on public.questions for select to anon,authenticated using(user_id = auth.uid() or (is_public and status <> 'open') or is_sample);
create policy questions_insert on public.questions for insert to authenticated with check(user_id = auth.uid() and not is_sample and status = 'open' and simpler_count = 0 and understood_count = 0);
grant select on public.answers to authenticated;
grant insert(question_id,author_id,author_name,steps) on public.answers to authenticated;
create policy answers_read on public.answers for select to authenticated using(exists(select 1 from public.questions q where q.id=question_id));
create policy answers_insert on public.answers for insert to authenticated with check(author_id=auth.uid() and not is_sample and stars is null and jsonb_typeof(steps)='array' and jsonb_array_length(steps) between 2 and 20 and exists(select 1 from public.questions q where q.id=question_id));
grant select on public.tutor_messages to authenticated;
create policy tutor_messages_own_read on public.tutor_messages for select to authenticated using(user_id=auth.uid());
grant select on public.bookings to authenticated;
create policy bookings_own_read on public.bookings for select to authenticated using(user_id=auth.uid());
grant select on public.point_events to authenticated;
create policy point_events_own_read on public.point_events for select to authenticated using(user_id=auth.uid());

grant insert(reporter_id,target_type,target_id) on public.reports to authenticated;
create policy reports_insert on public.reports for insert to authenticated with check(reporter_id=auth.uid());

-- Only a verified server request may book. The row update and booking are atomic.
create or replace function public.book_slot(p_slot uuid,p_user uuid,p_question uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_teacher uuid; v_booking uuid;
begin
  if p_question is not null and not exists(select 1 from public.questions where id=p_question and user_id=p_user) then raise exception 'QUESTION_NOT_OWNED'; end if;
  update public.teacher_slots set is_booked=true where id=p_slot and not is_booked and starts_at>now() returning teacher_id into v_teacher;
  if v_teacher is null then raise exception 'SLOT_TAKEN'; end if;
  insert into public.bookings(user_id,teacher_id,slot_id,question_id) values(p_user,v_teacher,p_slot,p_question) returning id into v_booking;
  if p_question is not null then update public.questions set status='sent_to_teacher' where id=p_question and user_id=p_user; end if;
  return v_booking;
end $$;
revoke all on function public.book_slot(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.book_slot(uuid,uuid,uuid) to service_role;

-- Lock the profile to make first-time demo initialization safe for concurrent judges.
create or replace function public.initialize_demo(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date;
begin
  perform 1 from public.profiles where id=p_user and is_demo for update;
  if not found then raise exception 'NOT_DEMO'; end if;
  if not exists(select 1 from public.point_events where user_id=p_user) then
    insert into public.point_events(user_id,reason,points,is_sample,created_at)
    select p_user,'ai_understood',v.points,true,((d-v.days)::timestamp+interval '14 hours') at time zone 'Asia/Tashkent'
    from (values (7,50),(6,60),(5,50),(4,60),(2,60),(1,60)) as v(days,points);
    update public.profiles set points=340,streak_days=7,last_streak_date=d-1 where id=p_user;
  end if;
end $$;
revoke all on function public.initialize_demo(uuid) from public,anon,authenticated;
grant execute on function public.initialize_demo(uuid) to service_role;
revoke all on function public.search_similar_questions(text,uuid,uuid,uuid) from public,anon;
grant execute on function public.search_similar_questions(text,uuid,uuid,uuid) to authenticated,service_role;

