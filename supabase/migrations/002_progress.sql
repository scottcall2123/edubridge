-- Atomic persistence only. Point values, streak and date rules live in lib/points.ts.
begin;
create or replace function public.commit_progress(
 p_user uuid, p_expected jsonb, p_next jsonb, p_events jsonb,
 p_question uuid default null, p_status text default null, p_new_question jsonb default null
) returns text language plpgsql security definer set search_path='' as $$
declare v public.profiles; qu public.questions;
begin
 select * into v from public.profiles where id=p_user for update;
 if not found then raise exception 'PROFILE_MISSING'; end if;
 if jsonb_build_object('points',v.points,'streak_days',v.streak_days,'last_streak_date',v.last_streak_date,'last_visit_date',v.last_visit_date) <> p_expected then return 'conflict'; end if;
 if p_new_question is not null then
   if exists(select 1 from public.questions where id=p_question and user_id=p_user) then return 'unchanged'; end if;
   if not exists(select 1 from public.topics where id=(p_new_question->>'topic_id')::uuid and subject_id=(p_new_question->>'subject_id')::uuid) then raise exception 'INVALID_TOPIC'; end if;
   insert into public.questions(id,user_id,subject_id,topic_id,text,is_public) values(p_question,p_user,(p_new_question->>'subject_id')::uuid,(p_new_question->>'topic_id')::uuid,p_new_question->>'text',false);
 elsif p_status is not null then
   select * into qu from public.questions where id=p_question and user_id=p_user for update;
   if not found then raise exception 'NOT_OWNED'; end if;
   if qu.status<> 'open' then return 'unchanged'; end if;
   if p_status='solved_by_ai' and qu.understood_count<1 then raise exception 'NOT_UNDERSTOOD'; end if;
   update public.questions set status=p_status where id=qu.id;
 elsif p_question is not null and not exists(select 1 from public.questions where id=p_question and user_id=p_user) then raise exception 'NOT_OWNED';
 end if;
 insert into public.point_events(user_id,reason,points,question_id)
 select p_user,e->>'reason',(e->>'points')::int,p_question from jsonb_array_elements(p_events) e;
 update public.profiles set points=(p_next->>'points')::int,streak_days=(p_next->>'streak_days')::int,last_streak_date=(p_next->>'last_streak_date')::date,last_visit_date=(p_next->>'last_visit_date')::date where id=p_user;
 return 'applied';
end $$;
revoke all on function public.commit_progress(uuid,jsonb,jsonb,jsonb,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.commit_progress(uuid,jsonb,jsonb,jsonb,uuid,text,jsonb) to service_role;
commit;
