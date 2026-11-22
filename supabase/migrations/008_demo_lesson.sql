begin;

-- The teacher dashboard only lists lessons that have not started yet, so the
-- seeded demo lesson silently disappears once its slot time passes. This keeps
-- exactly one confirmed demo lesson in the near future at all times, so judges
-- always open a prepared lesson instead of an empty page.
create or replace function public.refresh_demo_lesson()
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_teacher uuid := '00000003-0000-4000-8000-000000000001';
  v_student uuid;
  v_question uuid;
  v_slot uuid;
  v_start timestamptz;
  v_local timestamp;
begin
  -- Two hours or so ahead, on the hour, in local Fergana time.
  v_local := date_trunc('hour', now() at time zone 'Asia/Tashkent') + interval '3 hours';

  select b.slot_id, s.starts_at into v_slot, v_start
  from public.bookings b
  join public.teacher_slots s on s.id = b.slot_id
  join public.profiles p on p.id = b.user_id
  where b.teacher_id = v_teacher and b.status = 'confirmed' and p.is_demo
  order by s.starts_at desc
  limit 1;

  -- An existing lesson that is still ahead of us needs nothing.
  if v_slot is not null and v_start > now() + interval '20 minutes' then
    return;
  end if;

  if v_slot is null then
    select p.id into v_student from public.profiles p where p.is_demo order by p.id limit 1;
    if v_student is null then return; end if;

    -- Prefer a question the student already worked through with AI Ustoz:
    -- that chat history is what the teacher view is built to show.
    select q.id into v_question
    from public.questions q
    left join public.tutor_messages m on m.question_id = q.id and m.user_id = q.user_id
    where q.user_id = v_student
    group by q.id, q.created_at
    order by count(m.id) desc, q.created_at desc
    limit 1;
  end if;

  -- Keep the chosen time clear of this teacher's other slots.
  while exists (
    select 1 from public.teacher_slots
    where teacher_id = v_teacher
      and starts_at = (v_local at time zone 'Asia/Tashkent')
      and (v_slot is null or id <> v_slot)
  ) loop
    v_local := v_local + interval '30 minutes';
  end loop;

  if v_slot is null then
    insert into public.teacher_slots(teacher_id, starts_at, ends_at, is_booked)
    values (v_teacher, (v_local at time zone 'Asia/Tashkent'),
            (v_local at time zone 'Asia/Tashkent') + interval '15 minutes', true)
    returning id into v_slot;
    insert into public.bookings(user_id, teacher_id, slot_id, question_id, status)
    values (v_student, v_teacher, v_slot, v_question, 'confirmed');
  else
    update public.teacher_slots
    set starts_at = (v_local at time zone 'Asia/Tashkent'),
        ends_at = (v_local at time zone 'Asia/Tashkent') + interval '15 minutes',
        is_booked = true
    where id = v_slot;
  end if;
end $$;

revoke all on function public.refresh_demo_lesson() from public, anon, authenticated;
grant execute on function public.refresh_demo_lesson() to service_role;

notify pgrst, 'reload schema';
commit;
