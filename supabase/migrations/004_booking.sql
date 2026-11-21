begin;
-- Keep the existing RPC signature; enforce ownership and subject consistency.
create or replace function public.book_slot(p_slot uuid,p_user uuid,p_question uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_teacher uuid; v_subject uuid; v_booking uuid;
begin
 select s.teacher_id,t.subject_id into v_teacher,v_subject from public.teacher_slots s join public.teachers t on t.id=s.teacher_id where s.id=p_slot;
 if not found then raise exception 'SLOT_TAKEN'; end if;
 if p_question is not null then
   perform 1 from public.questions where id=p_question and user_id=p_user and subject_id=v_subject and status='open' for update;
   if not found then raise exception 'INVALID_QUESTION'; end if;
 end if;
 update public.teacher_slots set is_booked=true where id=p_slot and not is_booked and starts_at>now();
 if not found then raise exception 'SLOT_TAKEN'; end if;
 insert into public.bookings(user_id,teacher_id,slot_id,question_id,payment_simulated,meeting_link) values(p_user,v_teacher,p_slot,p_question,true,null) returning id into v_booking;
 if p_question is not null then update public.questions set status='sent_to_teacher' where id=p_question and user_id=p_user; end if;
 return v_booking;
end $$;
revoke all on function public.book_slot(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.book_slot(uuid,uuid,uuid) to service_role;

-- Values come from lib/points.ts. This wrapper makes the award part of the booking transaction.
create or replace function public.book_slot_with_points(p_slot uuid,p_user uuid,p_question uuid,p_expected jsonb,p_next jsonb,p_points int)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.profiles; b public.bookings; v_id uuid;
begin
 select * into v from public.profiles where id=p_user for update;
 if not found then raise exception 'PROFILE_MISSING'; end if;
 select * into b from public.bookings where slot_id=p_slot;
 if found then
   if b.user_id=p_user and b.question_id is not distinct from p_question and b.status='confirmed' then return jsonb_build_object('state','complete','booking_id',b.id); end if;
   raise exception 'SLOT_TAKEN';
 end if;
 if jsonb_build_object('points',v.points,'streak_days',v.streak_days,'last_streak_date',v.last_streak_date,'last_visit_date',v.last_visit_date)<>p_expected then return jsonb_build_object('state','conflict'); end if;
 v_id:=public.book_slot(p_slot,p_user,p_question);
 insert into public.point_events(user_id,reason,points,question_id) values(p_user,'booking_made',p_points,p_question);
 update public.profiles set points=(p_next->>'points')::int where id=p_user;
 return jsonb_build_object('state','complete','booking_id',v_id);
end $$;
revoke all on function public.book_slot_with_points(uuid,uuid,uuid,jsonb,jsonb,int) from public,anon,authenticated;
grant execute on function public.book_slot_with_points(uuid,uuid,uuid,jsonb,jsonb,int) to service_role;
commit;
