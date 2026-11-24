-- Live messages and read receipts. Run once: Supabase > SQL Editor > paste > Run. Safe to run again.

-- 1. Let the app hear new messages the moment they are sent (instead of waiting to check).
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- 2. Say when each message was read, so the sender can see "Read".
drop function if exists public.conversation(uuid, integer);
create or replace function public.conversation(p_user uuid, p_limit integer default 100)
returns table (id uuid, mine boolean, body text, kind text, activity_id uuid, created_at timestamptz,
               event_title text, event_details jsonb, my_status text, read_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, (m.from_id = auth.uid()), m.body, m.kind, m.activity_id, m.created_at,
         a.title, a.details,
         (select pp.status from public.activity_participants pp where pp.activity_id = m.activity_id and pp.user_id = auth.uid()),
         m.read_at
  from public.messages m
  left join public.shared_activities a on a.id = m.activity_id
  where auth.uid() is not null
    and ((m.from_id = auth.uid() and m.to_id = p_user) or (m.from_id = p_user and m.to_id = auth.uid()))
    and public.are_linked(auth.uid(), p_user) and not public.is_blocked_between(auth.uid(), p_user)
  order by m.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 300));
$$;
revoke all on function public.conversation(uuid, integer) from public, anon;
grant execute on function public.conversation(uuid, integer) to authenticated;
