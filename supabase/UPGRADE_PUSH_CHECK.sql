-- Phone alerts check and test button. Paste into Supabase > SQL Editor > Run. Safe to run more than once.
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
