begin;
-- Durable request IDs and per-user leases keep retries and multiple tabs safe.
create table public.tutor_turns(
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 question_id uuid not null references public.questions(id) on delete cascade,
 action text not null check(action in ('start','reply','simpler','understood')),
 student_content text,
 student_id uuid references public.tutor_messages(id) on delete set null,
 reply_id uuid references public.tutor_messages(id) on delete set null,
 state text not null check(state in ('pending','complete','failed')),
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index tutor_turns_user_idx on public.tutor_turns(user_id,state,expires_at);
alter table public.tutor_turns enable row level security;
revoke all on public.tutor_turns from public,anon,authenticated;
grant all on public.tutor_turns to service_role;

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
 if (select count(*) from public.tutor_messages where user_id=p_user and role='ai' and created_at>=d)>=30 then return jsonb_build_object('state','limit'); end if;
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

create or replace function public.finish_tutor_turn(p_request uuid,p_user uuid,p_reply text)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.tutor_turns; m uuid;
begin
 perform 1 from public.profiles where id=p_user for update;
 select * into r from public.tutor_turns where id=p_request and user_id=p_user for update;
 if not found then raise exception 'INVALID_REQUEST'; end if;
 if r.state='complete' then return r.reply_id; end if;
 if r.state<>'pending' or r.expires_at<=now() then raise exception 'EXPIRED_REQUEST'; end if;
 if not exists(select 1 from public.questions where id=r.question_id and user_id=p_user and status='open') then raise exception 'CLOSED_QUESTION'; end if;
 if nullif(trim(p_reply),'') is null then raise exception 'EMPTY_REPLY'; end if;
 insert into public.tutor_messages(question_id,user_id,role,content) values(r.question_id,p_user,'ai',p_reply) returning id into m;
 update public.tutor_turns set state='complete',reply_id=m where id=p_request;
 return m;
end $$;
create or replace function public.release_tutor_turn(p_request uuid,p_user uuid)
returns void language sql security definer set search_path='' as $$
 update public.tutor_turns set state='failed',expires_at=now() where id=p_request and user_id=p_user and state='pending';
$$;
revoke all on function public.reserve_tutor_turn(uuid,uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.finish_tutor_turn(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.release_tutor_turn(uuid,uuid) from public,anon,authenticated;
grant execute on function public.reserve_tutor_turn(uuid,uuid,uuid,text,text) to service_role;
grant execute on function public.finish_tutor_turn(uuid,uuid,text) to service_role;
grant execute on function public.release_tutor_turn(uuid,uuid) to service_role;
commit;
