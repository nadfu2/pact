-- Pact backend, migration 0002: the places database (restaurants, cafes, museums, parks, ...)
-- Seeded from Overture Maps open data by tools/import_places.py, searched by the app
-- through places_near(). Anyone signed in can read places; only the import script
-- (service/secret key) can write them. Users' own star ratings live in place_ratings
-- and gradually re-rank the places for everyone.
-- Run after 0001_init.sql.

create table public.places (
  id           text primary key,                      -- stable source id, e.g. 'ovt:8f3a...'
  source       text not null default 'overture',
  name         text not null check (char_length(name) between 1 and 200),
  category     text not null check (category in ('Food','Indoor','Outdoor','Sports','Shopping')),  -- same buckets as the app's Ideas tabs
  kind         text not null,                         -- cafe, restaurant, pub, museum, park, gym, ...
  city         text not null default '',              -- the seed area it was imported for (informational)
  country      text not null default '',
  lat          double precision not null check (lat between -90 and 90),
  lon          double precision not null check (lon between -180 and 180),
  address      text default '',                       -- address, website, phone may be empty or NULL (a CSV import turns blanks into NULL)
  website      text default '',
  phone        text default '',
  confidence   real,                                  -- source confidence 0..1
  quality      real not null default 0.5,             -- import-time ranking score (richer, independent places rank higher)
  tags         text[] not null default '{}',          -- extra labels used for search, e.g. pizza_restaurant
  rating_avg   real,                                  -- from place_ratings (Pact users)
  rating_count integer not null default 0,
  active       boolean not null default true,         -- false = no longer in the latest import
  updated_at   timestamptz not null default now()
);
create index places_geo_idx  on public.places (category, lat, lon) where active;
create index places_kind_idx on public.places (kind) where active;
create index places_tags_idx on public.places using gin (tags);

-- ---------------------------------------------------------------- ratings
-- No foreign key to places on purpose: a monthly refresh must never delete anyone's ratings.
create table public.place_ratings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_id   text not null,
  rating     smallint not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- Keep places.rating_avg / rating_count up to date. security definer so users never get write access to places.
create or replace function public.refresh_place_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid text := coalesce(new.place_id, old.place_id);
begin
  update public.places p
     set rating_avg   = s.avg,
         rating_count = s.cnt
    from (select avg(rating)::real as avg, count(*)::int as cnt from public.place_ratings where place_id = pid) s
   where p.id = pid;
  return null;
end $$;
create trigger place_ratings_refresh after insert or update or delete on public.place_ratings
  for each row execute function public.refresh_place_rating();

-- Rate (or re-rate) a place; the caller can only ever write their own row.
create or replace function public.rate_place(p_place text, p_rating integer) returns void
language plpgsql security invoker as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    delete from public.place_ratings where user_id = auth.uid() and place_id = p_place;   -- clearing the stars removes the rating
  else
    insert into public.place_ratings (user_id, place_id, rating) values (auth.uid(), p_place, p_rating)
    on conflict (user_id, place_id) do update set rating = excluded.rating, updated_at = now();
  end if;
end $$;

-- ---------------------------------------------------------------- search
-- Places near a point, best first. Filters are all optional.
--   p_categories: e.g. {Food}   p_kinds: e.g. {cafe,restaurant}   p_query: matches name or tags (e.g. 'pizza')
-- Ranking = import quality, nudged up or down by Pact users' ratings once a place has some.
create or replace function public.places_near(
  p_lat double precision, p_lon double precision, p_radius_km double precision default 5,
  p_categories text[] default null, p_kinds text[] default null, p_query text default null, p_limit integer default 60
) returns table (
  id text, name text, category text, kind text, lat double precision, lon double precision,
  address text, website text, phone text, tags text[], rating_avg real, rating_count integer,
  distance_km double precision, score double precision
) language sql stable security invoker as $$
  with params as (
    select least(greatest(coalesce(p_radius_km, 5), 0.1), 50) as r,
           least(greatest(coalesce(p_limit, 60), 1), 200) as lim,
           nullif(trim(coalesce(p_query, '')), '') as q
  ), box as (
    select r, lim, q,
           p_lat - r / 111.0 as lat_min, p_lat + r / 111.0 as lat_max,
           p_lon - r / (111.0 * greatest(cos(radians(p_lat)), 0.01)) as lon_min,
           p_lon + r / (111.0 * greatest(cos(radians(p_lat)), 0.01)) as lon_max
      from params
  ), cand as (
    select pl.*, box.r, box.lim,
           2 * 6371 * asin(sqrt(
             power(sin(radians(pl.lat - p_lat) / 2), 2) +
             cos(radians(p_lat)) * cos(radians(pl.lat)) * power(sin(radians(pl.lon - p_lon) / 2), 2))) as d
      from public.places pl, box
     where pl.active
       and pl.lat between box.lat_min and box.lat_max
       and pl.lon between box.lon_min and box.lon_max
       and (p_categories is null or pl.category = any (p_categories))
       and (p_kinds is null or pl.kind = any (p_kinds))
       and (box.q is null or pl.name ilike '%' || replace(replace(box.q, '%', ''), '_', '') || '%'
                          or exists (select 1 from unnest(pl.tags) t
                                      where t like '%' || lower(replace(replace(box.q, '%', ''), ' ', '_')) || '%'))
  )
  select c.id, c.name, c.category, c.kind, c.lat, c.lon, c.address, c.website, c.phone, c.tags,
         c.rating_avg, c.rating_count, c.d as distance_km,
         (c.quality
          + case when c.rating_count > 0 then (c.rating_avg - 3.5) / 5.0 * least(c.rating_count, 10) / 10.0 else 0 end
          - c.d / c.r * 0.15) as score          -- slight preference for closer places
    from cand c
   where c.d <= c.r
   order by score desc
   limit (select lim from params);
$$;

-- ---------------------------------------------------------------- security
alter table public.places        enable row level security;
alter table public.place_ratings enable row level security;

create policy places_read on public.places for select to anon, authenticated using (active);
-- no insert/update/delete policies: only the service/secret key (which bypasses RLS) can change places

create policy place_ratings_owner on public.place_ratings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke insert, update, delete on public.places from anon, authenticated;
revoke execute on function public.refresh_place_rating() from public, anon, authenticated;
revoke execute on function public.rate_place(text, integer) from public, anon;
grant  execute on function public.rate_place(text, integer) to authenticated;
grant  execute on function public.places_near(double precision, double precision, double precision, text[], text[], text, integer) to anon, authenticated;
