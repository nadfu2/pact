-- Pact 0003: real friends. Claim a username, find people by exact @username,
-- send / accept friend requests. Run after 0001 and 0002.
-- Privacy: nobody can list or browse users; a lookup needs the exact username, blocked people never show up,
-- and a request only becomes a friendship when the other person accepts.

create table if not exists public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  from_id      uuid not null references auth.users(id) on delete cascade,
  to_id        uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_id, to_id),
  check (from_id <> to_id)
);
alter table public.friend_requests enable row level security;
drop policy if exists friend_requests_party_read on public.friend_requests;
create policy friend_requests_party_read on public.friend_requests for select
  using (from_id = auth.uid() or to_id = auth.uid());
revoke all on public.friend_requests from anon, authenticated;
grant select on public.friend_requests to authenticated;     -- all writes go through the functions below

-- Claim or change your @username. Returns ok | taken | invalid | not_signed_in.
create or replace function public.claim_username(p_username text) returns text
language plpgsql security definer set search_path = public as $$
declare u text := lower(regexp_replace(coalesce(p_username, ''), '^@', ''));
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if u !~ '^[a-z0-9_]{3,24}$' then return 'invalid'; end if;
  begin
    update public.profiles set username = u where id = auth.uid();
  exception when unique_violation then return 'taken';
  end;
  return 'ok';
end $$;

-- Exact-match lookup. relation = none | friends | pending_out | pending_in.
drop function if exists public.find_user(text);
create or replace function public.find_user(p_username text)
returns table (id uuid, display_name text, username text, relation text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username,
    case
      when public.are_linked(p.id, auth.uid()) then 'friends'
      when exists (select 1 from public.friend_requests r where r.from_id = auth.uid() and r.to_id = p.id and r.status = 'pending') then 'pending_out'
      when exists (select 1 from public.friend_requests r where r.from_id = p.id and r.to_id = auth.uid() and r.status = 'pending') then 'pending_in'
      else 'none' end
  from public.profiles p
  where auth.uid() is not null
    and p.username = lower(regexp_replace(coalesce(p_username, ''), '^@', ''))
    and p.id <> auth.uid()
    and not public.is_blocked_between(p.id, auth.uid());
$$;

-- make both people each other's linked contact
create or replace function public._link_friends(a uuid, b uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.contacts (owner_id, name, linked_user_id)
    select a, coalesce(nullif(pb.display_name, ''), pb.username, 'Friend'), b from public.profiles pb where pb.id = b
    on conflict (owner_id, linked_user_id) do nothing;
  insert into public.contacts (owner_id, name, linked_user_id)
    select b, coalesce(nullif(pa.display_name, ''), pa.username, 'Friend'), a from public.profiles pa where pa.id = a
    on conflict (owner_id, linked_user_id) do nothing;
end $$;
revoke all on function public._link_friends(uuid, uuid) from public, anon, authenticated;

-- Returns sent | accepted (they had already asked you) | already_friends | invalid
create or replace function public.send_friend_request(p_user uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null or p_user is null or p_user = me then return 'invalid'; end if;
  if not exists (select 1 from public.profiles where id = p_user) then return 'invalid'; end if;
  if public.is_blocked_between(me, p_user) then return 'invalid'; end if;
  if public.are_linked(me, p_user) then return 'already_friends'; end if;
  if exists (select 1 from public.friend_requests where from_id = p_user and to_id = me and status = 'pending') then
    update public.friend_requests set status = 'accepted', responded_at = now() where from_id = p_user and to_id = me;
    perform public._link_friends(me, p_user);
    return 'accepted';
  end if;
  insert into public.friend_requests (from_id, to_id) values (me, p_user) on conflict (from_id, to_id) do nothing;  -- a declined request is not re-sent
  return 'sent';
end $$;

-- Only the person who received it can answer. Returns accepted | declined | invalid
create or replace function public.respond_friend_request(p_id uuid, p_accept boolean) returns text
language plpgsql security definer set search_path = public as $$
declare r public.friend_requests;
begin
  select * into r from public.friend_requests where id = p_id and to_id = auth.uid() and status = 'pending';
  if not found then return 'invalid'; end if;
  if public.is_blocked_between(r.from_id, r.to_id) then return 'invalid'; end if;
  update public.friend_requests set status = case when p_accept then 'accepted' else 'declined' end, responded_at = now() where id = p_id;
  if p_accept then perform public._link_friends(r.from_id, r.to_id); return 'accepted'; end if;
  return 'declined';
end $$;

-- Pending requests you received (incoming) or sent (outgoing)
drop function if exists public.my_friend_requests();
create or replace function public.my_friend_requests()
returns table (id uuid, direction text, user_id uuid, display_name text, username text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.id, case when r.to_id = auth.uid() then 'incoming' else 'outgoing' end,
         p.id, p.display_name, p.username, r.created_at
  from public.friend_requests r
  join public.profiles p on p.id = case when r.to_id = auth.uid() then r.from_id else r.to_id end
  where r.status = 'pending' and auth.uid() in (r.from_id, r.to_id)
    and not public.is_blocked_between(r.from_id, r.to_id)
  order by r.created_at desc;
$$;

-- Your real (accepted) friends
drop function if exists public.my_friends();
create or replace function public.my_friends()
returns table (user_id uuid, display_name text, username text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username
  from public.contacts c join public.profiles p on p.id = c.linked_user_id
  where c.owner_id = auth.uid() and not public.is_blocked_between(c.owner_id, p.id)
  order by p.display_name;
$$;

-- Unfriend: removes the link both ways
create or replace function public.remove_friend(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.contacts where (owner_id = auth.uid() and linked_user_id = p_user) or (owner_id = p_user and linked_user_id = auth.uid());
  delete from public.friend_requests where (from_id = auth.uid() and to_id = p_user) or (from_id = p_user and to_id = auth.uid());
end $$;

revoke all on function public.claim_username(text), public.find_user(text), public.send_friend_request(uuid),
  public.respond_friend_request(uuid, boolean), public.my_friend_requests(), public.my_friends(), public.remove_friend(uuid) from public, anon;
grant execute on function public.claim_username(text), public.find_user(text), public.send_friend_request(uuid),
  public.respond_friend_request(uuid, boolean), public.my_friend_requests(), public.my_friends(), public.remove_friend(uuid) to authenticated;
-- Pact 0004: messages between friends, event invites, and joint events that stay in sync.
-- Run after 0001, 0002 and 0003. Builds on shared_activities / activity_participants from 0001:
--   * a joint event is a shared_activities row; its OWNER edits it, invited friends read the latest version
--   * details jsonb holds { date 'YYYY-MM-DD', start 'HH:MM', end 'HH:MM', location, notes } (local clock times)
-- Privacy: only linked (accepted) friends can message or invite each other; blocked people are refused silently.

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references auth.users(id) on delete cascade,
  to_id       uuid not null references auth.users(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 2000),
  kind        text not null default 'text' check (kind in ('text','invite','update','cancel','reply')),
  activity_id uuid references public.shared_activities(id) on delete set null,
  created_at  timestamptz not null default now(),
  read_at     timestamptz,
  check (from_id <> to_id)
);
create index if not exists messages_to_idx   on public.messages (to_id, created_at desc);
create index if not exists messages_pair_idx on public.messages (from_id, to_id, created_at desc);
alter table public.messages enable row level security;
drop policy if exists messages_party_read on public.messages;
create policy messages_party_read on public.messages for select using (from_id = auth.uid() or to_id = auth.uid());
revoke all on public.messages from anon, authenticated;
grant select on public.messages to authenticated;          -- all writes go through the functions below

-- internal: post a message if the two are linked friends and not blocked
create or replace function public._post_message(p_from uuid, p_to uuid, p_body text, p_kind text, p_activity uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_from is null or p_to is null or p_from = p_to then return false; end if;
  if not public.are_linked(p_from, p_to) or public.is_blocked_between(p_from, p_to) then return false; end if;
  insert into public.messages (from_id, to_id, body, kind, activity_id) values (p_from, p_to, left(p_body, 2000), p_kind, p_activity);
  return true;
end $$;
revoke all on function public._post_message(uuid, uuid, text, text, uuid) from public, anon, authenticated;

create or replace function public._name_of(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(display_name, ''), username, 'Someone') from public.profiles where id = p_user;
$$;
revoke all on function public._name_of(uuid) from public, anon, authenticated;

-- sent | not_friends | invalid
create or replace function public.send_message(p_to uuid, p_body text) returns text
language plpgsql security definer set search_path = public as $$
declare b text := btrim(coalesce(p_body, ''));
begin
  if auth.uid() is null or b = '' then return 'invalid'; end if;
  if not public._post_message(auth.uid(), p_to, b, 'text', null) then return 'not_friends'; end if;
  return 'sent';
end $$;

-- The conversation with one friend, newest first (client reverses it)
create or replace function public.conversation(p_user uuid, p_limit integer default 100)
returns table (id uuid, mine boolean, body text, kind text, activity_id uuid, created_at timestamptz,
               event_title text, event_details jsonb, my_status text)
language sql stable security definer set search_path = public as $$
  select m.id, (m.from_id = auth.uid()), m.body, m.kind, m.activity_id, m.created_at,
         a.title, a.details,
         (select pp.status from public.activity_participants pp where pp.activity_id = m.activity_id and pp.user_id = auth.uid())
  from public.messages m
  left join public.shared_activities a on a.id = m.activity_id
  where auth.uid() is not null
    and ((m.from_id = auth.uid() and m.to_id = p_user) or (m.from_id = p_user and m.to_id = auth.uid()))
    and public.are_linked(auth.uid(), p_user) and not public.is_blocked_between(auth.uid(), p_user)
  order by m.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 300));
$$;

-- One row per friend you have talked to: last message and unread count
create or replace function public.inbox()
returns table (user_id uuid, display_name text, username text, last_body text, last_at timestamptz, unread integer)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username, lm.body, lm.created_at,
         (select count(*)::int from public.messages u where u.to_id = auth.uid() and u.from_id = p.id and u.read_at is null)
  from public.contacts c
  join public.profiles p on p.id = c.linked_user_id
  join lateral (select m.body, m.created_at from public.messages m
                 where (m.from_id = auth.uid() and m.to_id = p.id) or (m.from_id = p.id and m.to_id = auth.uid())
                 order by m.created_at desc limit 1) lm on true
  where c.owner_id = auth.uid() and not public.is_blocked_between(auth.uid(), p.id)
  order by lm.created_at desc;
$$;

create or replace function public.mark_read(p_user uuid) returns void
language sql security definer set search_path = public as $$
  update public.messages set read_at = now() where to_id = auth.uid() and from_id = p_user and read_at is null;
$$;

-- internal: add one friend to an event and send the invite message
create or replace function public._invite(p_activity uuid, p_owner uuid, p_user uuid, p_note text) returns boolean
language plpgsql security definer set search_path = public as $$
declare cid uuid; t text;
begin
  if not public.are_linked(p_owner, p_user) or public.is_blocked_between(p_owner, p_user) then return false; end if;
  select id into cid from public.contacts where owner_id = p_owner and linked_user_id = p_user;
  if cid is null then return false; end if;
  insert into public.activity_participants (activity_id, contact_id, user_id, status) values (p_activity, cid, p_user, 'invited')
    on conflict (activity_id, contact_id) do nothing;
  if not found then return false; end if;
  select title into t from public.shared_activities where id = p_activity;
  perform public._post_message(p_owner, p_user,
    public._name_of(p_owner) || ' invited you to "' || t || '"' || case when btrim(coalesce(p_note, '')) <> '' then ': ' || btrim(p_note) else '' end,
    'invite', p_activity);
  return true;
end $$;
revoke all on function public._invite(uuid, uuid, uuid, text) from public, anon, authenticated;

-- Make a joint event and invite friends (non-friends are skipped). Returns the event id.
create or replace function public.create_shared_event(p_title text, p_details jsonb, p_invitees uuid[], p_note text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare eid uuid; u uuid;
begin
  if auth.uid() is null or btrim(coalesce(p_title, '')) = '' then raise exception 'invalid'; end if;
  insert into public.shared_activities (owner_id, title, details)
    values (auth.uid(), left(btrim(p_title), 200), coalesce(p_details, '{}'::jsonb)) returning id into eid;
  foreach u in array coalesce(p_invitees, '{}') loop perform public._invite(eid, auth.uid(), u, p_note); end loop;
  return eid;
end $$;

-- Owner adds more friends to an existing event: invited | already | invalid
create or replace function public.invite_to_event(p_activity uuid, p_user uuid, p_note text default '') returns text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.shared_activities where id = p_activity and owner_id = auth.uid()) then return 'invalid'; end if;
  if public._invite(p_activity, auth.uid(), p_user, p_note) then return 'invited'; end if;
  return case when exists (select 1 from public.activity_participants where activity_id = p_activity and user_id = p_user) then 'already' else 'invalid' end;
end $$;

-- Invited person answers: accepted | declined. The owner gets a message with the reply (and an optional note).
create or replace function public.respond_to_event(p_activity uuid, p_status text, p_note text default '') returns text
language plpgsql security definer set search_path = public as $$
declare a public.shared_activities; me uuid := auth.uid();
begin
  if p_status not in ('accepted', 'declined') then return 'invalid'; end if;
  select * into a from public.shared_activities where id = p_activity;
  if not found or public.is_blocked_between(a.owner_id, me) then return 'invalid'; end if;
  update public.activity_participants set status = p_status where activity_id = p_activity and user_id = me;
  if not found then return 'invalid'; end if;
  perform public._post_message(me, a.owner_id,
    public._name_of(me) || (case when p_status = 'accepted' then ' is coming to "' else ' can''t make "' end) || a.title || '"'
      || case when btrim(coalesce(p_note, '')) <> '' then ': ' || btrim(p_note) else '' end,
    'reply', p_activity);
  return p_status;
end $$;

-- Owner edits the event. Everyone invited (who has not declined) is messaged and sees the new version. Returns how many were told.
create or replace function public.update_shared_event(p_id uuid, p_title text, p_details jsonb) returns integer
language plpgsql security definer set search_path = public as $$
declare a public.shared_activities; n integer := 0; r record; nt text; nd jsonb; summary text;
begin
  select * into a from public.shared_activities where id = p_id and owner_id = auth.uid();
  if not found then return 0; end if;
  nt := left(btrim(coalesce(nullif(p_title, ''), a.title)), 200); nd := coalesce(p_details, a.details);
  if nt is not distinct from a.title and nd is not distinct from a.details then return 0; end if;
  update public.shared_activities set title = nt, details = nd where id = p_id;
  summary := nullif(concat_ws(', ', nd->>'date', nullif(concat_ws('-', nd->>'start', nd->>'end'), ''), nd->>'location'), '');
  for r in select user_id from public.activity_participants where activity_id = p_id and user_id is not null and status <> 'declined' loop
    if public._post_message(auth.uid(), r.user_id, public._name_of(auth.uid()) || ' updated "' || nt || '"' || coalesce(': ' || summary, ''), 'update', p_id) then n := n + 1; end if;
  end loop;
  return n;
end $$;

-- Owner cancels the event for everyone
create or replace function public.delete_shared_event(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a public.shared_activities; r record;
begin
  select * into a from public.shared_activities where id = p_id and owner_id = auth.uid();
  if not found then return; end if;
  for r in select user_id from public.activity_participants where activity_id = p_id and user_id is not null loop
    perform public._post_message(auth.uid(), r.user_id, public._name_of(auth.uid()) || ' cancelled "' || a.title || '"', 'cancel', null);
  end loop;
  delete from public.shared_activities where id = p_id;
end $$;

-- Every joint event you own or were invited to (not blocked), with who is coming
create or replace function public.my_shared_events()
returns table (id uuid, owner_id uuid, owner_name text, title text, details jsonb, updated_at timestamptz,
               is_owner boolean, my_status text, participants jsonb)
language sql stable security definer set search_path = public as $$
  select a.id, a.owner_id, public._name_of(a.owner_id), a.title, a.details, a.updated_at,
         (a.owner_id = auth.uid()),
         (select pp.status from public.activity_participants pp where pp.activity_id = a.id and pp.user_id = auth.uid()),
         coalesce((select jsonb_agg(jsonb_build_object('user_id', pp.user_id, 'name', public._name_of(pp.user_id), 'status', pp.status) order by pp.status)
                     from public.activity_participants pp where pp.activity_id = a.id and pp.user_id is not null), '[]'::jsonb)
  from public.shared_activities a
  where auth.uid() is not null
    and (a.owner_id = auth.uid()
         or (exists (select 1 from public.activity_participants pp where pp.activity_id = a.id and pp.user_id = auth.uid())
             and not public.is_blocked_between(a.owner_id, auth.uid())))
  order by a.created_at desc;
$$;

revoke all on function public.send_message(uuid, text), public.conversation(uuid, integer), public.inbox(), public.mark_read(uuid),
  public.create_shared_event(text, jsonb, uuid[], text), public.invite_to_event(uuid, uuid, text), public.respond_to_event(uuid, text, text),
  public.update_shared_event(uuid, text, jsonb), public.delete_shared_event(uuid), public.my_shared_events() from public, anon;
grant execute on function public.send_message(uuid, text), public.conversation(uuid, integer), public.inbox(), public.mark_read(uuid),
  public.create_shared_event(text, jsonb, uuid[], text), public.invite_to_event(uuid, uuid, text), public.respond_to_event(uuid, text, text),
  public.update_shared_event(uuid, text, jsonb), public.delete_shared_event(uuid), public.my_shared_events() to authenticated;
-- Pact 0005: hide places that should never have been suggested (auction houses tagged as gardens, garden centres,
-- landscapers and so on). Safe to run more than once. Re-running the importer later does the same job properly.
update public.places
set active = false
where source = 'overture' and active = true and (
  name ~* '\m(auctions?|auctioneers?|bidding|ebay|garden cent(re|er)s?|landscap[a-z]*|nurser(y|ies)|funeral|crematorium|cemetery|storage|estate agents?|pawn[a-z]*|wholesale|scaffolding|plumbing|recruitment)\M'
  or tags[1] ~* '(auction|landscap|nursery|garden_furniture|greenhouse|funeral|cemetery|storage|real_estate|car_dealer|automotive|pawn|wholesale|warehouse|office|printing|laundry|dentist|salon|insurance|bank|church|mosque|temple)'
  or (kind = 'garden' and coalesce(tags[1], '') !~* '(garden|botanical|arboretum)')
  or (kind = 'park' and coalesce(tags[1], '') !~* '(park|playground|recreation|green|common)')
);
-- 0006: profile picture + short description, shown to friends in the Friend Book.
-- Safe to run more than once.
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists avatar text not null default '';
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles add constraint profiles_bio_len check (char_length(bio) <= 280);
alter table public.profiles drop constraint if exists profiles_avatar_len;
alter table public.profiles add constraint profiles_avatar_len check (char_length(avatar) <= 60000);

create or replace function public.set_my_profile(p_bio text, p_avatar text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if char_length(coalesce(p_bio,'')) > 280 then return 'bio_too_long'; end if;
  if char_length(coalesce(p_avatar,'')) > 60000 then return 'picture_too_big'; end if;
  update public.profiles set bio = coalesce(p_bio,''), avatar = coalesce(p_avatar,'') where id = auth.uid();
  return 'ok';
end $$;

create or replace function public.get_my_profile()
returns table (bio text, avatar text)
language sql stable security definer set search_path = public as $$
  select p.bio, p.avatar from public.profiles p where p.id = auth.uid();
$$;

drop function if exists public.find_user(text);
create or replace function public.find_user(p_username text)
returns table (id uuid, display_name text, username text, relation text, bio text, avatar text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username,
    case
      when public.are_linked(p.id, auth.uid()) then 'friends'
      when exists (select 1 from public.friend_requests r where r.from_id = auth.uid() and r.to_id = p.id and r.status = 'pending') then 'pending_out'
      when exists (select 1 from public.friend_requests r where r.from_id = p.id and r.to_id = auth.uid() and r.status = 'pending') then 'pending_in'
      else 'none' end,
    p.bio, p.avatar
  from public.profiles p
  where auth.uid() is not null
    and p.username = lower(regexp_replace(coalesce(p_username, ''), '^@', ''))
    and p.id <> auth.uid()
    and not public.is_blocked_between(p.id, auth.uid());
$$;

drop function if exists public.my_friends();
create or replace function public.my_friends()
returns table (user_id uuid, display_name text, username text, bio text, avatar text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username, p.bio, p.avatar
  from public.contacts c join public.profiles p on p.id = c.linked_user_id
  where c.owner_id = auth.uid() and not public.is_blocked_between(c.owner_id, p.id)
  order by p.display_name;
$$;

drop function if exists public.my_friend_requests();
create or replace function public.my_friend_requests()
returns table (id uuid, direction text, user_id uuid, display_name text, username text, created_at timestamptz, bio text, avatar text)
language sql stable security definer set search_path = public as $$
  select r.id, case when r.to_id = auth.uid() then 'incoming' else 'outgoing' end,
         p.id, p.display_name, p.username, r.created_at, p.bio, p.avatar
  from public.friend_requests r
  join public.profiles p on p.id = case when r.to_id = auth.uid() then r.from_id else r.to_id end
  where r.status = 'pending' and auth.uid() in (r.from_id, r.to_id)
    and not public.is_blocked_between(r.from_id, r.to_id)
  order by r.created_at desc;
$$;

revoke all on function public.set_my_profile(text,text), public.get_my_profile(), public.find_user(text), public.my_friends(), public.my_friend_requests() from public, anon;
grant execute on function public.set_my_profile(text,text), public.get_my_profile(), public.find_user(text), public.my_friends(), public.my_friend_requests() to authenticated;
