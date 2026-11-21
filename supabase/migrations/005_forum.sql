begin;
-- Public forum posts are visible while open; homework created by /ask stays private.
drop policy questions_read on public.questions;
create policy questions_read on public.questions for select to anon,authenticated using(user_id=auth.uid() or is_public or is_sample);
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
   insert into public.questions(id,user_id,subject_id,topic_id,text,is_public) values(p_question,p_user,(p_new_question->>'subject_id')::uuid,(p_new_question->>'topic_id')::uuid,p_new_question->>'text',coalesce((p_new_question->>'is_public')::boolean,false));
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

create or replace function public.post_forum_answer(p_id uuid,p_user uuid,p_question uuid,p_steps jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_name text;
begin
 select full_name into v_name from public.profiles where id=p_user for update;
 if not found then raise exception 'PROFILE_MISSING'; end if;
 if exists(select 1 from public.answers where id=p_id and author_id=p_user and question_id=p_question) then return p_id; end if;
 if not exists(select 1 from public.questions where id=p_question and is_public) then raise exception 'NOT_PUBLIC'; end if;
 if jsonb_typeof(p_steps)<>'array' or jsonb_array_length(p_steps) not between 2 and 20 then raise exception 'INVALID_STEPS'; end if;
 if exists(select 1 from jsonb_array_elements(p_steps) e where jsonb_typeof(e)<>'string' or char_length(e#>>'{}') not between 3 and 1000) then raise exception 'INVALID_STEPS'; end if;
 insert into public.answers(id,question_id,author_id,author_name,steps) values(p_id,p_question,p_user,v_name,p_steps);
 return p_id;
end $$;
create or replace function public.rate_forum_answer(p_answer uuid,p_owner uuid,p_stars int,p_expected jsonb,p_next jsonb,p_points int)
returns text language plpgsql security definer set search_path='' as $$
declare a public.answers; v public.profiles;
begin
 select * into a from public.answers where id=p_answer;
 if not found or a.author_id is null or a.author_id=p_owner or a.is_sample then raise exception 'INVALID_ANSWER'; end if;
 select * into v from public.profiles where id=a.author_id for update;
 if not found then raise exception 'PROFILE_MISSING'; end if;
 perform 1 from public.questions where id=a.question_id and user_id=p_owner and is_public for update;
 if not found then raise exception 'NOT_OWNER'; end if;
 select * into a from public.answers where id=p_answer for update;
 if a.stars is not null then return 'unchanged'; end if;
 if p_stars not between 1 and 5 then raise exception 'INVALID_STARS'; end if;
 if jsonb_build_object('points',v.points,'streak_days',v.streak_days,'last_streak_date',v.last_streak_date,'last_visit_date',v.last_visit_date)<>p_expected then return 'conflict'; end if;
 update public.answers set stars=p_stars where id=p_answer;
 insert into public.point_events(user_id,reason,points,question_id) values(a.author_id,'helper_star',p_points,a.question_id);
 update public.profiles set points=(p_next->>'points')::int,streak_days=(p_next->>'streak_days')::int,last_streak_date=(p_next->>'last_streak_date')::date where id=a.author_id;
 return 'applied';
end $$;
create or replace function public.report_forum_post(p_user uuid,p_type text,p_target uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.profiles where id=p_user for update;
 if not found then raise exception 'PROFILE_MISSING'; end if;
 if p_type='question' then
   if not exists(select 1 from public.questions where id=p_target and (is_public or user_id=p_user)) then raise exception 'NOT_VISIBLE'; end if;
 elsif p_type='answer' then
   if not exists(select 1 from public.answers a join public.questions q on q.id=a.question_id where a.id=p_target and (q.is_public or q.user_id=p_user)) then raise exception 'NOT_VISIBLE'; end if;
 else raise exception 'INVALID_TYPE'; end if;
 if not exists(select 1 from public.reports where reporter_id=p_user and target_type=p_type and target_id=p_target) then insert into public.reports(reporter_id,target_type,target_id) values(p_user,p_type,p_target); end if;
end $$;
revoke all on function public.post_forum_answer(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.rate_forum_answer(uuid,uuid,int,jsonb,jsonb,int) from public,anon,authenticated;
revoke all on function public.report_forum_post(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.post_forum_answer(uuid,uuid,uuid,jsonb) to service_role;
grant execute on function public.rate_forum_answer(uuid,uuid,int,jsonb,jsonb,int) to service_role;
grant execute on function public.report_forum_post(uuid,text,uuid) to service_role;
notify pgrst,'reload schema';
commit;

