-- Photos, voice notes and documents sent in chats. Run once: Supabase > SQL Editor > paste > Run. Safe to run again.
-- Files live in a public bucket called "chat" (up to 15 MB each). Each person can only add to their own folder.
-- Anyone who has a file's exact web address can open it, the same as profile pictures, so the addresses are long and unguessable.
insert into storage.buckets (id, name, public, file_size_limit) values ('chat', 'chat', true, 15728640)
on conflict (id) do update set public = true, file_size_limit = 15728640;

drop policy if exists "chat files are public" on storage.objects;
create policy "chat files are public" on storage.objects for select using (bucket_id = 'chat');

drop policy if exists "chat upload own folder" on storage.objects;
create policy "chat upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "chat delete own folder" on storage.objects;
create policy "chat delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);
