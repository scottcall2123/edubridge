-- 011: raise the per-user daily AI tutor cap from 30 to 300.
-- Judges all sign in as the same demo student, so one shared 30-message
-- budget was exhausted during testing and the tutor returned 'limit' (429).
-- Only the number changes; the function body is otherwise identical to 003.
-- Gemini's own free-tier daily quota stays the real ceiling.
create or replace function public.reserve_tutor_turn(p_request uuid,p_user uuid,p_question uuid,p_action text,p_content text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.questions; r public.tutor_turns; m uuid; d timestamptz := date_trunc('day',now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
begin
 perform 1 from public.profiles where id=p_user for update;
 select * into q from public.questions where id=p_question and user_id=p_user for update;
 if not found then raise exception 'NOT_OWNED'; end if;
 if p_action not in ('start','reply','simpler','understood') then raise exception 'INVALID_ACTION'; end if;
 select * into r from public.tutor_turns where id=p_request;
 if found then
   if r.user_id<>p_user or r.question_id<>p_question or r.action<>p_action or r.student_content is distinct from p_content then raise exception 'INVALID_REQUEST'; end if;
   if r.state='complete' then return jsonb_build_object('state','complete','reply_id',r.reply_id); end if;
 end if;
 if q.status<>'open' then return jsonb_build_object('state','closed'); end if;
 if p_action='start' then
   select id into m from public.tutor_messages where question_id=p_question and user_id=p_user and role='ai' order by created_at,id limit 1;
   if found then return jsonb_build_object('state','complete','reply_id',m); end if;
 elsif not exists(select 1 from public.tutor_messages where question_id=p_question and user_id=p_user and role='ai') then return jsonb_build_object('state','not_started');
 end if;
 if exists(select 1 from public.tutor_turns where user_id=p_user and state='pending' and expires_at>now()) then return jsonb_build_object('state','busy'); end if;
 if (select count(*) from public.tutor_messages where user_id=p_user and role='ai' and created_at>=d)>=300 then return jsonb_build_object('state','limit'); end if;
 insert into public.tutor_turns(id,user_id,question_id,action,student_content,state,expires_at)
 values(p_request,p_user,p_question,p_action,p_content,'pending',now()+interval '90 seconds')
 on conflict(id) do update set state='pending',expires_at=excluded.expires_at;
 if p_action<>'start' and r.student_id is null then
   if p_content is null or char_length(p_content) not between 1 and 1000 then raise exception 'INVALID_CONTENT'; end if;
   insert into public.tutor_messages(question_id,user_id,role,kind,content) values(p_question,p_user,'student',case when p_action='reply' then 'text' else p_action end,p_content) returning id into m;
   update public.tutor_turns set student_id=m where id=p_request;
   update public.questions set simpler_count=simpler_count+case when p_action='simpler' then 1 else 0 end,understood_count=understood_count+case when p_action='understood' then 1 else 0 end where id=p_question;
 end if;
 return jsonb_build_object('state','reserved');
end $$;
