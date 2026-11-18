-- Sharper profile pictures: allow up to 200,000 characters (about 150 KB) instead of 60,000.
-- Safe to run more than once. Paste into Supabase > SQL Editor > Run.
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
