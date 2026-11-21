begin;

alter table public.teachers
  add column user_id uuid unique references auth.users(id) on delete set null;

-- Only the server can read or change the account linkage.
revoke select on public.teachers from public, anon, authenticated;
grant select (id, full_name, initials, subject_id, district, rating,
  price_uzs_15min, bio_uz, bio_en, bio_ru, offline_center, is_sample)
  on public.teachers to anon, authenticated;
create index bookings_teacher_idx on public.bookings(teacher_id);
create index tutor_messages_question_idx on public.tutor_messages(question_id, user_id, created_at);

-- The caller must pass the authenticated user's ID, never a route or form parameter.
-- Keep all booking, question and chat joins within the verified teacher's scope.
create function public.teacher_dashboard(p_user uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  with teacher as (
    select t.id, t.full_name, t.district, t.rating, t.is_sample, t.subject_id,
      coalesce(u.raw_app_meta_data ->> 'edubridge_demo_teacher' = 'true', false) as is_demo
    from public.teachers t
    join auth.users u on u.id = t.user_id
    where t.user_id = p_user
  ), lesson as (
    select b.id, b.user_id, b.question_id, b.status, s.starts_at, s.ends_at,
      substring(ltrim(p.full_name) from '^[^[:space:]]+') as first_name,
      p.grade, p.school, p.is_demo as student_is_demo
    from teacher t
    join public.bookings b on b.teacher_id = t.id
    join public.teacher_slots s on s.id = b.slot_id and s.teacher_id = t.id
    left join public.profiles p on p.id = b.user_id
    where b.status = 'confirmed' and (not t.is_demo or p.is_demo)
  ), bounds as (
    select date_trunc('week', now() at time zone 'Asia/Tashkent') as week_start
  )
  select jsonb_build_object(
    'teacher', to_jsonb(t) - 'subject_id',
    'subject', to_jsonb(subject),
    'lessons_this_week', (
      select count(*) from lesson l, bounds
      where l.starts_at >= (week_start at time zone 'Asia/Tashkent')
        and l.starts_at < ((week_start + interval '1 week') at time zone 'Asia/Tashkent')
    ),
    'students_helped', (
      select count(distinct user_id) from lesson where ends_at <= now()
    ),
    'upcoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'starts_at', l.starts_at, 'status', l.status,
        'first_name', l.first_name, 'grade', l.grade, 'school', l.school,
        'is_sample', coalesce(l.student_is_demo, false),
        'question', case when q.id is not null then jsonb_build_object(
          'id', q.id, 'text', q.text, 'subject', to_jsonb(qs), 'topic', to_jsonb(qt),
          'image_path', q.image_url, 'owner_id', l.user_id, 'simpler_count', q.simpler_count,
          'messages', coalesce((
            select jsonb_agg(jsonb_build_object(
              'id', m.id, 'role', m.role, 'kind', m.kind, 'content', m.content
            ) order by m.created_at, m.id)
            from public.tutor_messages m
            where m.question_id = q.id and m.user_id = l.user_id
          ), '[]'::jsonb)
        ) end
      ) order by l.starts_at, l.id)
      from lesson l
      left join public.questions q on q.id = l.question_id and q.user_id = l.user_id
      left join public.subjects qs on qs.id = q.subject_id
      left join public.topics qt on qt.id = q.topic_id
      where l.starts_at >= now()
    ), '[]'::jsonb),
    'forum', coalesce((
      select jsonb_agg(to_jsonb(f) - 'created_at' order by f.created_at desc, f.id)
      from (
        select id, text, is_sample, created_at
        from public.questions
        where is_public and status = 'open' and subject_id = t.subject_id
        order by created_at desc, id
        limit 5
      ) f
    ), '[]'::jsonb)
  )
  from teacher t join public.subjects subject on subject.id = t.subject_id;
$$;

-- SECURITY DEFINER keeps auth.users private. Only the server can invoke this function.
revoke all on function public.teacher_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.teacher_dashboard(uuid) to service_role;

-- Teachers post under their linked name. Student profiles continue to drive student points.
create or replace function public.post_forum_answer(p_id uuid,p_user uuid,p_question uuid,p_steps jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_name text;
begin
 select full_name into v_name from public.teachers where user_id=p_user for update;
 if not found then
   select full_name into v_name from public.profiles where id=p_user for update;
   if not found then raise exception 'PROFILE_MISSING'; end if;
 end if;
 if exists(select 1 from public.answers where id=p_id and author_id=p_user and question_id=p_question) then return p_id; end if;
 if not exists(select 1 from public.questions where id=p_question and is_public) then raise exception 'NOT_PUBLIC'; end if;
 if jsonb_typeof(p_steps)<>'array' or jsonb_array_length(p_steps) not between 2 and 20 then raise exception 'INVALID_STEPS'; end if;
 if exists(select 1 from jsonb_array_elements(p_steps) e where jsonb_typeof(e)<>'string' or char_length(e#>>'{}') not between 3 and 1000) then raise exception 'INVALID_STEPS'; end if;
 insert into public.answers(id,question_id,author_id,author_name,steps) values(p_id,p_question,p_user,v_name,p_steps);
 return p_id;
end $$;

create or replace function public.report_forum_post(p_user uuid,p_type text,p_target uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.teachers where user_id=p_user for update;
 if not found then
   perform 1 from public.profiles where id=p_user for update;
   if not found then raise exception 'PROFILE_MISSING'; end if;
 end if;
 if p_type='question' then
   if not exists(select 1 from public.questions where id=p_target and (is_public or user_id=p_user)) then raise exception 'NOT_VISIBLE'; end if;
 elsif p_type='answer' then
   if not exists(select 1 from public.answers a join public.questions q on q.id=a.question_id where a.id=p_target and (q.is_public or q.user_id=p_user)) then raise exception 'NOT_VISIBLE'; end if;
 else raise exception 'INVALID_TYPE'; end if;
 if not exists(select 1 from public.reports where reporter_id=p_user and target_type=p_type and target_id=p_target) then insert into public.reports(reporter_id,target_type,target_id) values(p_user,p_type,p_target); end if;
end $$;

create or replace function public.rate_forum_answer(p_answer uuid,p_owner uuid,p_stars int,p_expected jsonb,p_next jsonb,p_points int)
returns text language plpgsql security definer set search_path='' as $$
declare a public.answers; v public.profiles;
begin
 select * into a from public.answers where id=p_answer;
 if not found or a.author_id is null or a.author_id=p_owner or a.is_sample then raise exception 'INVALID_ANSWER'; end if;
 select * into v from public.profiles where id=a.author_id for update;
 if not found and not exists(select 1 from public.teachers where user_id=a.author_id) then raise exception 'PROFILE_MISSING'; end if;
 perform 1 from public.questions where id=a.question_id and user_id=p_owner and is_public for update;
 if not found then raise exception 'NOT_OWNER'; end if;
 select * into a from public.answers where id=p_answer for update;
 if a.stars is not null then return 'unchanged'; end if;
 if p_stars not between 1 and 5 then raise exception 'INVALID_STARS'; end if;
 if v.id is null then
   update public.answers set stars=p_stars where id=p_answer;
   return 'applied';
 end if;
 if jsonb_build_object('points',v.points,'streak_days',v.streak_days,'last_streak_date',v.last_streak_date,'last_visit_date',v.last_visit_date) is distinct from p_expected then return 'conflict'; end if;
 update public.answers set stars=p_stars where id=p_answer;
 insert into public.point_events(user_id,reason,points,question_id) values(a.author_id,'helper_star',p_points,a.question_id);
 update public.profiles set points=(p_next->>'points')::int,streak_days=(p_next->>'streak_days')::int,last_streak_date=(p_next->>'last_streak_date')::date where id=a.author_id;
 return 'applied';
end $$;

notify pgrst, 'reload schema';
commit;
