begin;

-- The teacher page needs the teacher's own upcoming slots, so they can see
-- which hours are already booked and which are still free.
create or replace function public.teacher_dashboard(p_user uuid)
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
    'slots', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'starts_at', s.starts_at, 'ends_at', s.ends_at,
        'is_booked', s.is_booked
      ) order by s.starts_at)
      from public.teacher_slots s
      where s.teacher_id = t.id and s.starts_at >= now()
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

revoke all on function public.teacher_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.teacher_dashboard(uuid) to service_role;

notify pgrst, 'reload schema';
commit;
