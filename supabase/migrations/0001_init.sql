-- Pact backend, migration 0001
-- Target: Supabase (Postgres 15+). Run in the SQL editor, or via `supabase db push`.
--
-- Design: Phase 1 syncs the app's existing per-user JSON blob (user_state), so the
-- front end barely changes. The social/sharing pieces (contacts, blocks, shared
-- plans, invites) are real tables because they need rules between users.
-- Calendar connections and AI usage are tables the server functions rely on.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  username     text unique check (username ~ '^[a-z0-9_]{3,24}$'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- create a profile automatically when someone signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  insert into public.user_state (user_id) values (new.id);
  return new;
end $$;

-- ---------------------------------------------------------------- user_state
-- One row per user holding the app's blob: tasks, weeklyTargets, userProfile,
-- accountInfo, moodLogs, medications, mealBatches, dailyMeals, mealHistoryLogs,
-- lifeCadenceItems, ideasFeed, favourites, skillForest, friendsList,
-- customCategories, calendarSources, roamieMessages, homeLayout, homeNotes,
-- water, countdown, reading.  Private to the owner. Never shared.
create table public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  version    integer not null default 0,       -- optimistic concurrency (two devices)
  updated_at timestamptz not null default now(),
  constraint user_state_size check (pg_column_size(data) < 2000000)
);

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Save only if the client saw the latest version; returns the new version,
-- or NULL when another device saved first (client then re-fetches and merges).
create or replace function public.save_user_state(p_data jsonb, p_expected_version integer)
returns integer language plpgsql security invoker as $$
declare new_version integer;
begin
  update public.user_state
     set data = p_data, version = version + 1, updated_at = now()
   where user_id = auth.uid() and version = p_expected_version
  returning version into new_version;
  return new_version;
end $$;

-- ---------------------------------------------------------------- contacts
-- Friends you add. linked_user_id stays NULL until that person has an account,
-- which is what lets friends be added to plans without signing up.
create table public.contacts (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references auth.users(id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 80),
  linked_user_id uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (owner_id, linked_user_id)
);
create index contacts_owner_idx on public.contacts(owner_id);

-- ---------------------------------------------------------------- blocks
create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;

-- True when either person has the other as a linked contact. security definer so
-- the lookup is not itself filtered by the contacts row-level rules.
create or replace function public.are_linked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.contacts
     where (owner_id = a and linked_user_id = b) or (owner_id = b and linked_user_id = a));
$$;

-- ---------------------------------------------------------------- shared plans
-- Only plans you choose to share live here. Private tasks stay in user_state.
create table public.shared_activities (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  starts_at  timestamptz,
  ends_at    timestamptz,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create trigger shared_activities_touch before update on public.shared_activities
  for each row execute function public.touch_updated_at();

create table public.activity_participants (
  activity_id uuid not null references public.shared_activities(id) on delete cascade,
  contact_id  uuid not null references public.contacts(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,   -- set once they have an account
  status      text not null default 'invited' check (status in ('invited','accepted','declined')),
  primary key (activity_id, contact_id)
);
create index participants_user_idx on public.activity_participants(user_id);

-- Helper used by policies. security definer avoids RLS recursion between
-- shared_activities and activity_participants.
create or replace function public.can_see_activity(p_activity uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shared_activities a
                  where a.id = p_activity and a.owner_id = auth.uid())
      or exists (select 1 from public.activity_participants p
                   join public.shared_activities a on a.id = p.activity_id
                  where p.activity_id = p_activity and p.user_id = auth.uid()
                    and not public.is_blocked_between(a.owner_id, auth.uid()));
$$;

-- ---------------------------------------------------------------- invites
-- Replaces the #invite=<base64> link that carries data inside the URL.
create table public.invites (
  token       text primary key default encode(gen_random_bytes(18), 'hex'),
  inviter_id  uuid not null references auth.users(id) on delete cascade,
  contact_id  uuid references public.contacts(id) on delete set null,
  activity_id uuid references public.shared_activities(id) on delete cascade,
  expires_at  timestamptz not null default now() + interval '14 days',
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

-- Accepting is done through this function (not direct table access) so tokens
-- cannot be listed or guessed. Links the contact, and any invited plan rows, to the caller.
create or replace function public.accept_invite(p_token text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv public.invites;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into inv from public.invites
   where token = p_token and accepted_by is null and expires_at > now() for update;
  if not found then raise exception 'invite invalid or expired'; end if;
  if inv.inviter_id = auth.uid() then raise exception 'cannot accept your own invite'; end if;
  if public.is_blocked_between(inv.inviter_id, auth.uid()) then
    raise exception 'invite invalid or expired';   -- same message: do not reveal a block
  end if;

  if inv.contact_id is not null then
    update public.contacts set linked_user_id = auth.uid() where id = inv.contact_id;
    update public.activity_participants set user_id = auth.uid()
     where contact_id = inv.contact_id and user_id is null;
  end if;
  update public.invites set accepted_by = auth.uid(), accepted_at = now() where token = p_token;
  return inv.inviter_id;
end $$;

-- ---------------------------------------------------------------- calendar sync
-- Today: read-only iCal links (what ical.js fetches). Later: OAuth (Google/Microsoft).
-- Secrets are written/read only by server functions using the service role, never the browser.
create table public.calendar_connections (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  provider       text not null check (provider in ('ical','google','microsoft')),
  label          text not null default '',
  ical_url       text,               -- secret iCal address: treat like a password
  oauth_refresh  text,               -- encrypt at the app layer before storing
  sync_cursor    text,
  last_synced_at timestamptz,
  last_error     text,
  created_at     timestamptz not null default now()
);
create index calendar_connections_user_idx on public.calendar_connections(user_id);

-- Browser-safe view: everything except secrets.
create view public.calendar_connections_public with (security_invoker = true) as
  select id, user_id, provider, label, last_synced_at, last_error, created_at
    from public.calendar_connections;

-- ---------------------------------------------------------------- AI usage
-- Durable per-user daily cap for the Gemini proxy (the in-memory limiter in
-- gemini.js resets on every cold start and is per server instance).
create table public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  calls   integer not null default 0,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------- row level security
alter table public.profiles              enable row level security;
alter table public.user_state            enable row level security;
alter table public.contacts              enable row level security;
alter table public.blocks                enable row level security;
alter table public.shared_activities    enable row level security;
alter table public.activity_participants enable row level security;
alter table public.invites               enable row level security;
alter table public.calendar_connections  enable row level security;
alter table public.ai_usage              enable row level security;

-- profiles: you see yourself and people who share a plan with you (not blocked)
create policy profiles_self_read on public.profiles for select using (id = auth.uid());
create policy profiles_self_write on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_linked_read on public.profiles for select using (
  not public.is_blocked_between(id, auth.uid()) and public.are_linked(id, auth.uid()));

-- user_state: strictly private
create policy user_state_owner on public.user_state for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- contacts: yours only
create policy contacts_owner on public.contacts for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- blocks: you manage your own; you cannot see who blocked you
create policy blocks_owner on public.blocks for all
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- shared plans
create policy activities_read on public.shared_activities for select using (public.can_see_activity(id));
create policy activities_insert on public.shared_activities for insert with check (owner_id = auth.uid());
create policy activities_update on public.shared_activities for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy activities_delete on public.shared_activities for delete using (owner_id = auth.uid());

create policy participants_read on public.activity_participants for select using (public.can_see_activity(activity_id));
create policy participants_owner_write on public.activity_participants for all
  using (exists (select 1 from public.shared_activities a where a.id = activity_id and a.owner_id = auth.uid())
         and exists (select 1 from public.contacts c where c.id = contact_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.shared_activities a where a.id = activity_id and a.owner_id = auth.uid())
              and exists (select 1 from public.contacts c where c.id = contact_id and c.owner_id = auth.uid()));
-- a participant may answer their own invitation
create policy participants_respond on public.activity_participants for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- invites: inviter manages; accepting goes through accept_invite()
create policy invites_owner on public.invites for all
  using (inviter_id = auth.uid()) with check (inviter_id = auth.uid());

-- calendar connections: owner can see rows, but secret columns are revoked below
create policy calendar_owner on public.calendar_connections for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ai_usage: read-only for the user; the server function writes with the service role
create policy ai_usage_read on public.ai_usage for select using (user_id = auth.uid());

-- Keep secrets away from the browser entirely.
revoke select on public.calendar_connections from anon, authenticated;
grant  select (id, user_id, provider, label, last_synced_at, last_error, created_at)
  on public.calendar_connections to authenticated;
revoke insert, update on public.calendar_connections from anon, authenticated;  -- server function creates/edits
grant select on public.calendar_connections_public to authenticated;
revoke execute on function public.accept_invite(text) from public, anon;
grant  execute on function public.accept_invite(text) to authenticated;
