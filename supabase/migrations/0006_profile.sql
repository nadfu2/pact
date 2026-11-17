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
