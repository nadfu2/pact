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
