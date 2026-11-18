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
alter table public.profiles add constraint profiles_avatar_len check (char_length(avatar) <= 200000);

create or replace function public.set_my_profile(p_bio text, p_avatar text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if char_length(coalesce(p_bio,'')) > 280 then return 'bio_too_long'; end if;
  if char_length(coalesce(p_avatar,'')) > 200000 then return 'picture_too_big'; end if;
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
-- 0007: friend profiles can show a daily mood and what you're doing today.
-- You choose what is shared; the app only sends what you allow. Safe to run more than once.
alter table public.profiles add column if not exists mood text not null default '';
alter table public.profiles add column if not exists mood_day date;
alter table public.profiles add column if not exists today jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists today_day date;

create or replace function public.set_my_status(p_mood text, p_day date, p_today jsonb)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if char_length(coalesce(p_mood,'')) > 40 then return 'invalid'; end if;
  if p_today is not null and (jsonb_typeof(p_today) <> 'array' or jsonb_array_length(p_today) > 30 or char_length(p_today::text) > 6000) then return 'invalid'; end if;
  update public.profiles
     set mood = coalesce(p_mood,''), mood_day = p_day,
         today = coalesce(p_today,'[]'::jsonb), today_day = p_day
   where id = auth.uid();
  return 'ok';
end $$;

-- Only accepted friends can open each other's profile.
create or replace function public.get_friend_profile(p_user uuid)
returns table (user_id uuid, display_name text, username text, bio text, avatar text, mood text, mood_day date, today jsonb, today_day date)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.username, p.bio, p.avatar, p.mood, p.mood_day, p.today, p.today_day
  from public.profiles p
  where auth.uid() is not null and p.id = p_user and p.id <> auth.uid()
    and public.are_linked(p.id, auth.uid())
    and not public.is_blocked_between(p.id, auth.uid());
$$;

revoke all on function public.set_my_status(text,date,jsonb), public.get_friend_profile(uuid) from public, anon;
grant execute on function public.set_my_status(text,date,jsonb), public.get_friend_profile(uuid) to authenticated;

-- Pact 0008: time-limited schedule sharing, learning buddies, and real phone notifications (Web Push).
-- Safe to run more than once. Run after 0001-0007.
--
-- 1. SCHEDULE SHARING. You choose WHICH friends can see WHEN you're busy, and for HOW LONG (3 days, a week...).
--    The grant expires by itself: after the end date the database returns nothing. Titles stay hidden
--    unless you choose "with titles". Plans you mark Private are never uploaded at all.
-- 2. LEARNING BUDDIES. Invite a friend to learn a skill together; each of you sees the other's progress.
-- 3. PUSH. Phone subscriptions, scheduled reminders, and triggers that ask your Cloudflare site to send a push.

-- ---------------------------------------------------------------------------------------------
-- 1. schedule sharing
-- ---------------------------------------------------------------------------------------------
alter table public.profiles add column if not exists sched jsonb not null default '[]'::jsonb;

create table if not exists public.schedule_grants (
  owner_id   uuid not null references auth.users(id) on delete cascade,
  friend_id  uuid not null references auth.users(id) on delete cascade,
  until      date not null,
  titles     boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (owner_id, friend_id),
  check (owner_id <> friend_id)
);
alter table public.schedule_grants enable row level security;
drop policy if exists schedule_grants_party_read on public.schedule_grants;
create policy schedule_grants_party_read on public.schedule_grants for select using (owner_id = auth.uid() or friend_id = auth.uid());
revoke all on public.schedule_grants from anon, authenticated;
grant select on public.schedule_grants to authenticated;

-- Upload the busy blocks you are willing to share: [{ "d":"2026-11-18","s":"09:00","e":"10:30","t":"Gym" }, ...]
create or replace function public.set_my_schedule(p_blocks jsonb) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' or jsonb_array_length(p_blocks) > 250 or char_length(p_blocks::text) > 60000 then return 'invalid'; end if;
  update public.profiles set sched = p_blocks where id = auth.uid();
  return 'ok';
end $$;

-- Give a friend a look at your schedule for p_days days from today (0 = stop sharing).
create or replace function public.set_schedule_grant(p_friend uuid, p_days integer, p_titles boolean default false) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then return 'not_signed_in'; end if;
  if p_friend is null or p_friend = me then return 'invalid'; end if;
  if coalesce(p_days, 0) <= 0 then
    delete from public.schedule_grants where owner_id = me and friend_id = p_friend;
    return 'ok';
  end if;
  if p_days > 31 then return 'invalid'; end if;
  if not public.are_linked(me, p_friend) or public.is_blocked_between(me, p_friend) then return 'not_friends'; end if;
  insert into public.schedule_grants (owner_id, friend_id, until, titles)
  values (me, p_friend, current_date + (p_days - 1), coalesce(p_titles, false))
  on conflict (owner_id, friend_id) do update set until = excluded.until, titles = excluded.titles, created_at = now();
  return 'ok';
end $$;

create or replace function public.my_schedule_grants()
returns table (friend_id uuid, display_name text, until date, titles boolean)
language sql stable security definer set search_path = public as $$
  select g.friend_id, p.display_name, g.until, g.titles
  from public.schedule_grants g join public.profiles p on p.id = g.friend_id
  where g.owner_id = auth.uid() and g.until >= current_date
    and not public.is_blocked_between(g.owner_id, g.friend_id);
$$;

-- Everyone who currently lets me see their schedule (expired or revoked grants return nothing).
create or replace function public.schedules_shared_with_me()
returns table (owner_id uuid, display_name text, avatar text, until date, titles boolean, blocks jsonb)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.avatar, g.until, g.titles,
    coalesce((
      select jsonb_agg(case when g.titles then b else (b - 't') || jsonb_build_object('t', 'Busy') end)
      from jsonb_array_elements(p.sched) b
      where (b->>'d') ~ '^\d{4}-\d{2}-\d{2}$' and (b->>'d')::date between current_date and g.until
    ), '[]'::jsonb)
  from public.schedule_grants g join public.profiles p on p.id = g.owner_id
  where g.friend_id = auth.uid() and g.until >= current_date
    and public.are_linked(g.owner_id, g.friend_id)
    and not public.is_blocked_between(g.owner_id, g.friend_id);
$$;

-- ---------------------------------------------------------------------------------------------
-- 2. learning buddies
-- ---------------------------------------------------------------------------------------------
create table if not exists public.skill_buddies (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references auth.users(id) on delete cascade,
  buddy_id       uuid not null references auth.users(id) on delete cascade,
  skill          text not null check (char_length(skill) between 1 and 80),
  plan           jsonb not null default '{}'::jsonb,
  status         text not null default 'invited' check (status in ('invited','active','declined','ended')),
  owner_progress jsonb not null default '{}'::jsonb,
  buddy_progress jsonb not null default '{}'::jsonb,
  note           text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (owner_id <> buddy_id)
);
create index if not exists skill_buddies_owner_idx on public.skill_buddies (owner_id);
create index if not exists skill_buddies_buddy_idx on public.skill_buddies (buddy_id);
alter table public.skill_buddies enable row level security;
drop policy if exists skill_buddies_party_read on public.skill_buddies;
create policy skill_buddies_party_read on public.skill_buddies for select using (owner_id = auth.uid() or buddy_id = auth.uid());
revoke all on public.skill_buddies from anon, authenticated;
grant select on public.skill_buddies to authenticated;

create or replace function public.invite_skill_buddy(p_friend uuid, p_skill text, p_plan jsonb, p_progress jsonb, p_note text default '') returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); new_id uuid;
begin
  if me is null then return 'not_signed_in'; end if;
  if p_friend is null or p_friend = me or coalesce(trim(p_skill), '') = '' or char_length(p_skill) > 80 then return 'invalid'; end if;
  if p_plan is not null and char_length(p_plan::text) > 20000 then return 'invalid'; end if;
  if not public.are_linked(me, p_friend) or public.is_blocked_between(me, p_friend) then return 'not_friends'; end if;
  if exists (select 1 from public.skill_buddies where status in ('invited','active')
             and lower(skill) = lower(p_skill) and ((owner_id = me and buddy_id = p_friend) or (owner_id = p_friend and buddy_id = me))) then return 'exists'; end if;
  insert into public.skill_buddies (owner_id, buddy_id, skill, plan, owner_progress, note)
  values (me, p_friend, trim(p_skill), coalesce(p_plan, '{}'::jsonb), coalesce(p_progress, '{}'::jsonb), left(coalesce(p_note, ''), 300))
  returning id into new_id;
  perform public._post_message(me, p_friend, 'wants to learn "' || trim(p_skill) || '" together with you. Open Development to join.', 'text', null);
  return 'ok';
end $$;

create or replace function public.respond_skill_buddy(p_id uuid, p_accept boolean, p_progress jsonb default '{}'::jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r public.skill_buddies;
begin
  if me is null then return 'not_signed_in'; end if;
  select * into r from public.skill_buddies where id = p_id and buddy_id = me and status = 'invited';
  if not found or public.is_blocked_between(r.owner_id, me) then return 'invalid'; end if;
  update public.skill_buddies
     set status = case when p_accept then 'active' else 'declined' end,
         buddy_progress = case when p_accept then coalesce(p_progress, '{}'::jsonb) else buddy_progress end,
         updated_at = now()
   where id = p_id;
  return 'ok';
end $$;

-- Each side only ever writes its own progress.
create or replace function public.update_skill_progress(p_id uuid, p_progress jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then return 'not_signed_in'; end if;
  if p_progress is null or jsonb_typeof(p_progress) <> 'object' or char_length(p_progress::text) > 4000 then return 'invalid'; end if;
  update public.skill_buddies
     set owner_progress = case when owner_id = me then p_progress else owner_progress end,
         buddy_progress = case when buddy_id = me then p_progress else buddy_progress end,
         updated_at = now()
   where id = p_id and status = 'active' and (owner_id = me or buddy_id = me);
  return 'ok';
end $$;

create or replace function public.end_skill_buddy(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  update public.skill_buddies set status = 'ended', updated_at = now()
   where id = p_id and (owner_id = auth.uid() or buddy_id = auth.uid()) and status in ('invited','active');
  return 'ok';
end $$;

drop function if exists public.my_skill_buddies();
create or replace function public.my_skill_buddies()
returns table (id uuid, skill text, status text, is_owner boolean, friend_id uuid, friend_name text, friend_avatar text,
               plan jsonb, my_progress jsonb, their_progress jsonb, note text, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.id, s.skill, s.status, (s.owner_id = auth.uid()),
         f.id, f.display_name, f.avatar,
         s.plan,
         case when s.owner_id = auth.uid() then s.owner_progress else s.buddy_progress end,
         case when s.owner_id = auth.uid() then s.buddy_progress else s.owner_progress end,
         s.note, s.updated_at
  from public.skill_buddies s
  join public.profiles f on f.id = case when s.owner_id = auth.uid() then s.buddy_id else s.owner_id end
  where (s.owner_id = auth.uid() or s.buddy_id = auth.uid()) and s.status in ('invited','active')
    and not public.is_blocked_between(s.owner_id, s.buddy_id)
  order by s.updated_at desc;
$$;

-- ---------------------------------------------------------------------------------------------
-- 3. push notifications
-- ---------------------------------------------------------------------------------------------
create table if not exists public.push_subs (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null,
  auth_key   text not null,
  ua         text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user_idx on public.push_subs (user_id);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

create or replace function public.save_push_sub(p_endpoint text, p_p256dh text, p_auth text, p_ua text default '') returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if coalesce(p_endpoint, '') !~ '^https://' or char_length(p_endpoint) > 1000 or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then return 'invalid'; end if;
  insert into public.push_subs (endpoint, user_id, p256dh, auth_key, ua)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth, left(coalesce(p_ua, ''), 200))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth_key = excluded.auth_key, ua = excluded.ua, created_at = now();
  return 'ok';
end $$;

create or replace function public.delete_push_sub(p_endpoint text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  delete from public.push_subs where endpoint = p_endpoint and user_id = auth.uid();
  return 'ok';
end $$;

-- Reminders the phone should receive even when Pact is closed. The app uploads the next few days of them.
create table if not exists public.reminders (
  user_id uuid not null references auth.users(id) on delete cascade,
  key     text not null,
  fire_at timestamptz not null,
  title   text not null,
  body    text not null default '',
  url     text not null default '/',
  sent_at timestamptz,
  primary key (user_id, key)
);
create index if not exists reminders_due_idx on public.reminders (fire_at) where sent_at is null;
alter table public.reminders enable row level security;
revoke all on public.reminders from anon, authenticated;

create or replace function public.sync_my_reminders(p_items jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); it jsonb; n integer := 0;
begin
  if me is null then return 'not_signed_in'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 300 then return 'invalid'; end if;
  delete from public.reminders where user_id = me and sent_at is null;
  for it in select * from jsonb_array_elements(p_items) loop
    begin
      if (it->>'at')::timestamptz > now() and (it->>'at')::timestamptz < now() + interval '9 days' and coalesce(it->>'key','') <> '' then
        insert into public.reminders (user_id, key, fire_at, title, body, url)
        values (me, left(it->>'key', 120), (it->>'at')::timestamptz, left(coalesce(it->>'title','Pact'), 120), left(coalesce(it->>'body',''), 240), left(coalesce(nullif(it->>'url',''),'/'), 200))
        on conflict (user_id, key) do update set fire_at = excluded.fire_at, title = excluded.title, body = excluded.body, url = excluded.url
          where public.reminders.sent_at is null;
        n := n + 1;
      end if;
    exception when others then null;     -- skip a malformed item, keep the rest
    end;
  end loop;
  return 'ok';
end $$;

-- One row, readable only by the database itself: where to send push requests and the shared secret.
-- Fill it in once (see README "Phone notifications"): insert into public.push_config values (1, 'https://YOUR-SITE/api/push', 'A-LONG-RANDOM-SECRET');
create table if not exists public.push_config (id integer primary key check (id = 1), url text not null, secret text not null);
alter table public.push_config enable row level security;
revoke all on public.push_config from anon, authenticated;

-- Ask the website to deliver a push to every device a person has registered. Never lets a failure break the real action.
create or replace function public._push(p_user uuid, p_title text, p_body text, p_url text default '/', p_tag text default 'pact')
returns void language plpgsql security definer set search_path = public as $$
declare cfg public.push_config; subs jsonb;
begin
  if p_user is null then return; end if;
  if to_regproc('net.http_post') is null then return; end if;
  select * into cfg from public.push_config where id = 1;
  if not found then return; end if;
  select coalesce(jsonb_agg(jsonb_build_object('endpoint', endpoint, 'p256dh', p256dh, 'auth', auth_key)), '[]'::jsonb) into subs
    from public.push_subs where user_id = p_user;
  if subs = '[]'::jsonb then return; end if;
  perform net.http_post(
    url := cfg.url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', cfg.secret),
    body := jsonb_build_object('subs', subs, 'title', left(coalesce(p_title, 'Pact'), 80), 'body', left(coalesce(p_body, ''), 160), 'url', coalesce(p_url, '/'), 'tag', coalesce(p_tag, 'pact'))
  );
exception when others then null;
end $$;
revoke all on function public._push(uuid, text, text, text, text) from public, anon, authenticated;

-- Triggers: a message, a friend request, or a buddy invite becomes a push to the person it is for.
create or replace function public._trg_push_message() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public._push(new.to_id, coalesce(public._name_of(new.from_id), 'A friend'), new.body, '/?tab=social', 'msg-' || new.from_id::text);
  return new;
exception when others then return new;
end $$;
drop trigger if exists pact_push_message on public.messages;
create trigger pact_push_message after insert on public.messages for each row execute function public._trg_push_message();

create or replace function public._trg_push_friend() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    perform public._push(new.to_id, 'New friend request', coalesce(public._name_of(new.from_id), 'Someone') || ' wants to be friends on Pact.', '/?tab=social', 'fr-' || new.from_id::text);
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted' then
    perform public._push(new.from_id, 'Friend request accepted', coalesce(public._name_of(new.to_id), 'Someone') || ' is now your friend on Pact.', '/?tab=social', 'fra-' || new.to_id::text);
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists pact_push_friend on public.friend_requests;
create trigger pact_push_friend after insert or update on public.friend_requests for each row execute function public._trg_push_friend();

-- Fire due reminders. Scheduled every minute by pg_cron (below). Reminders more than 2 hours late are dropped, not sent.
create or replace function public.push_due_reminders() returns integer
language plpgsql security definer set search_path = public as $$
declare r record; n integer := 0;
begin
  for r in select * from public.reminders where sent_at is null and fire_at <= now() order by fire_at limit 200 for update skip locked loop
    if r.fire_at > now() - interval '2 hours' then
      perform public._push(r.user_id, r.title, r.body, r.url, 'rem-' || left(r.key, 40));
      n := n + 1;
    end if;
    update public.reminders set sent_at = now() where user_id = r.user_id and key = r.key;
  end loop;
  delete from public.reminders where sent_at is not null and sent_at < now() - interval '2 days';
  return n;
end $$;
revoke all on function public.push_due_reminders() from public, anon, authenticated;

-- Turn on the two extensions that make phone pushes work, if this project allows it. Harmless if it does not.
do $$ begin
  begin create extension if not exists pg_net with schema extensions; exception when others then null; end;
  begin create extension if not exists pg_cron; exception when others then null; end;
end $$;
do $$ begin
  if to_regnamespace('cron') is not null then
    begin perform cron.unschedule('pact-push-reminders'); exception when others then null; end;
    perform cron.schedule('pact-push-reminders', '* * * * *', 'select public.push_due_reminders()');
  end if;
exception when others then null;
end $$;

revoke all on function
  public.set_my_schedule(jsonb), public.set_schedule_grant(uuid, integer, boolean), public.my_schedule_grants(), public.schedules_shared_with_me(),
  public.invite_skill_buddy(uuid, text, jsonb, jsonb, text), public.respond_skill_buddy(uuid, boolean, jsonb), public.update_skill_progress(uuid, jsonb),
  public.end_skill_buddy(uuid), public.my_skill_buddies(),
  public.save_push_sub(text, text, text, text), public.delete_push_sub(text), public.sync_my_reminders(jsonb)
from public, anon;
grant execute on function
  public.set_my_schedule(jsonb), public.set_schedule_grant(uuid, integer, boolean), public.my_schedule_grants(), public.schedules_shared_with_me(),
  public.invite_skill_buddy(uuid, text, jsonb, jsonb, text), public.respond_skill_buddy(uuid, boolean, jsonb), public.update_skill_progress(uuid, jsonb),
  public.end_skill_buddy(uuid), public.my_skill_buddies(),
  public.save_push_sub(text, text, text, text), public.delete_push_sub(text), public.sync_my_reminders(jsonb)
to authenticated;

-- 0009: phone alerts check + test (powers Profile > Reminders > Phone alerts). Safe to run more than once.
create or replace function public.push_status() returns jsonb language plpgsql security definer set search_path = public as $$
declare cfg public.push_config; n int; has_net boolean; has_cron boolean; cron_ok boolean := false; resp jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'not_signed_in'); end if;
  select count(*) into n from public.push_subs where user_id = auth.uid();
  select * into cfg from public.push_config where id = 1;
  has_net := exists (select 1 from pg_extension where extname = 'pg_net');
  has_cron := exists (select 1 from pg_extension where extname = 'pg_cron');
  if has_cron then
    begin execute 'select exists (select 1 from cron.job where jobname = ''pact-push-reminders'' and active)' into cron_ok; exception when others then cron_ok := false; end;
  end if;
  if has_net then
    begin
      execute $q$ select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select status_code,
               left(coalesce(error_msg, ''), 160) as error,
               coalesce(nullif(substring(coalesce(content, '') from '"sent":([0-9]+)'), ''), '0') as sent
        from net._http_response order by created desc limit 3) x $q$ into resp;
    exception when others then resp := '[]'::jsonb; end;
  end if;
  return jsonb_build_object('subs', n, 'configured', cfg.id is not null, 'pg_net', has_net, 'pg_cron', has_cron, 'cron_job', cron_ok, 'recent', resp);
end $$;

create or replace function public.send_test_push() returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if not exists (select 1 from public.push_subs where user_id = auth.uid()) then return 'no_device'; end if;
  if not exists (select 1 from public.push_config where id = 1) then return 'no_config'; end if;
  perform public._push(auth.uid(), 'The Pact', 'Test: your phone alerts work.', '/', 'test');
  return 'sent';
end $$;

revoke all on function public.push_status() from public, anon;
revoke all on function public.send_test_push() from public, anon;
grant execute on function public.push_status() to authenticated;
grant execute on function public.send_test_push() to authenticated;
