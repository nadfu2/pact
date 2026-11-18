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
