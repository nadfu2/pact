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
