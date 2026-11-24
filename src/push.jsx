// "Phone alerts" check: walks the whole chain (device -> your account -> database -> website -> phone) and says in plain words
// which step is missing, with a button to send a real test alert.
import React, { useState } from 'react';
import { INK, MUT, CLAY, FOR, RULE } from './groups.jsx';

const Step = ({ ok, title, fix }) => (
  <div data-push-step style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: `1px solid ${RULE}` }}>
    <span style={{ width: 20, height: 20, border: `1.5px solid ${ok === null ? RULE : INK}`, background: ok === true ? FOR : ok === false ? CLAY : 'transparent', color: '#fff', fontSize: 12, lineHeight: '17px', textAlign: 'center', flex: 'none', marginTop: 1 }}>{ok === true ? '✓' : ok === false ? '!' : ''}</span>
    <span style={{ fontSize: 13, lineHeight: 1.35 }}><b style={{ fontWeight: 600 }}>{title}</b>{fix ? <span style={{ display: 'block', color: ok === false ? INK : MUT, fontSize: 12, marginTop: 2 }}>{fix}</span> : null}</span>
  </div>);

export default function PushCheck({ cloud, enable, standalone }) {
  const [rows, setRows] = useState(null); const [busy, setBusy] = useState(false); const [note, setNote] = useState('');
  const run = async () => {
    setBusy(true); const r = [];
    const hasNotif = typeof Notification !== 'undefined', hasSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator, hasPush = typeof window !== 'undefined' && 'PushManager' in window;
    const ios = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent || '');
    r.push({ ok: hasNotif && hasSW && hasPush, title: 'This phone or browser can receive alerts', fix: hasNotif && hasSW && hasPush ? '' : ios && !standalone ? 'On iPhone, add The Pact to your Home Screen (Share, then Add to Home Screen) and open it from there. Alerts do not work from a Safari tab. Needs iOS 16.4 or newer.' : 'This browser cannot do closed-app alerts. Try Chrome on Android or desktop, or the Home Screen app on iPhone.' });
    const perm = hasNotif ? Notification.permission : 'denied';
    r.push({ ok: perm === 'granted', title: 'Notifications are allowed', fix: perm === 'granted' ? '' : perm === 'denied' ? 'Blocked. Turn them on for The Pact in your phone settings (Settings, Notifications), then check again.' : 'Not asked yet. Press "Turn on alerts" below.' });
    let sub = null;
    try { if (hasSW) { const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('no service worker')), 3000))]); sub = await reg.pushManager.getSubscription(); } } catch (e) { sub = null; }
    r.push({ ok: !!sub, title: 'This device is registered with its push service', fix: sub ? '' : 'Not registered yet. Press "Turn on alerts" below.' });
    let st = null; try { st = await Promise.race([cloud.pushStatus(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 8000))]); } catch (e) { st = null; }
    if (!st) r.push({ ok: false, title: 'Your database can check alerts', fix: 'The database is missing the alerts check. Run the file UPGRADE_PUSH_CHECK.sql once in Supabase (SQL Editor), then check again.' });
    else {
      r.push({ ok: st.subs > 0, title: 'This device is saved to your account', fix: st.subs > 0 ? '' : 'Not saved. Press "Turn on alerts" below while signed in.' });
      r.push({ ok: !!st.configured, title: 'The database knows your website address', fix: st.configured ? '' : 'Missing. In Supabase SQL Editor run: insert into public.push_config values (1, \'https://pact-wdm.pages.dev/api/push\', \'YOUR-PUSH-SECRET\') on conflict (id) do update set url = excluded.url, secret = excluded.secret;' });
      r.push({ ok: !!st.pg_net, title: 'Supabase can call your website (pg_net)', fix: st.pg_net ? '' : 'Switch it on: Supabase, Database, Extensions, search pg_net, toggle on.' });
      r.push({ ok: !!st.cron_job, title: 'Due reminders are checked every minute (pg_cron)', fix: st.cron_job ? '' : 'Switch it on: Supabase, Database, Extensions, search pg_cron, toggle on, then run RUN_IN_SUPABASE.sql again.' });
      const last = (st.recent || [])[0];
      if (!last) r.push({ ok: null, title: 'Last delivery attempt', fix: 'No attempt yet. Press "Send a test alert".' });
      else {
        const c = last.status_code;
        r.push({ ok: c === 200 && Number(last.sent) >= 1, title: 'Last delivery attempt', fix: c === 200 && Number(last.sent) >= 1 ? 'Delivered to the push service.' : c === 200 ? 'Your website ran, but the phone\'s push service refused it. The private key on Cloudflare probably does not match the public key in config.js, or this device\'s registration is old. Turn alerts off and on again, and check the two keys.' : c === 401 ? 'Wrong password: PUSH_SECRET on Cloudflare must be exactly the same as the secret in public.push_config.' : c === 500 ? 'Your website is missing its settings. In Cloudflare, Settings, Variables and Secrets, add VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and PUSH_SECRET, then redeploy.' : c === 404 || c === 405 ? 'Your website has no /api/push. Redeploy so the functions folder is included, and check the address you saved.' : 'Status ' + c + (last.error ? ': ' + last.error : '') });
      }
    }
    setRows(r); setBusy(false);
  };
  const test = async () => {
    setBusy(true); setNote('Sending...');
    try {
      const res = await cloud.sendTestPush();
      setNote(res === 'sent' ? 'Sent. It should arrive in a few seconds, even with The Pact closed. Checking...' : res === 'no_device' ? 'This account has no registered device yet. Press "Turn on alerts" first.' : res === 'no_config' ? 'The database does not know your website address yet (see the red step).' : 'Could not send.');
    } catch (e) { setNote('Could not send. Run UPGRADE_PUSH_CHECK.sql in Supabase first.'); }
    setBusy(false);
    setTimeout(run, 5000);
  };
  const bad = rows && rows.find(x => x.ok === false);
  const [open, setOpen] = useState(false);
  const bt = { height: 44, padding: '0 14px', borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' };
  return (
    <div data-push-check style={{ border: `1.5px solid ${INK}`, background: 'rgba(250,248,242,.85)', padding: 14 }}>
      <button data-push-fold aria-expanded={open} onClick={() => setOpen(o => !o)} className="w-full text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
        <span><span className="font-fr" style={{ display: 'block', fontWeight: 600, fontSize: 22, lineHeight: 1.05 }}>Phone alerts</span>
          <span style={{ display: 'block', fontSize: 13, color: MUT, marginTop: 4, lineHeight: 1.4 }}>Check that reminders reach your phone when The Pact is closed.</span></span>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: MUT, flex: 'none' }}>{open ? 'Hide \u25B4' : 'Open \u25BE'}</span>
      </button>
      {open && <div style={{ marginTop: 10, borderTop: `3px solid ${INK}`, paddingTop: 4 }}>
        {rows && <div>{rows.map((x, i) => <Step key={i} ok={x.ok} title={x.title} fix={x.fix} />)}</div>}
        {rows && !bad && <p data-push-allgood style={{ fontSize: 14, fontWeight: 600, color: FOR, margin: '8px 0 0' }}>Every step is in place.</p>}
        {note && <p data-push-note style={{ fontSize: 13, margin: '8px 0 0' }}>{note}</p>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button data-push-run disabled={busy} onClick={run} style={{ ...bt, border: 0, background: FOR, color: '#F4EFE4', opacity: busy ? .5 : 1 }}>{rows ? 'Check again' : 'Check phone alerts'}</button>
          <button data-push-enable disabled={busy} onClick={async () => { await enable(); run(); }} style={{ ...bt, border: `1.5px solid ${INK}`, background: 'transparent', color: INK, opacity: busy ? .5 : 1 }}>Turn on alerts</button>
          <button data-push-test disabled={busy} onClick={test} style={{ ...bt, border: `1.5px solid ${INK}`, background: 'transparent', color: INK, opacity: busy ? .5 : 1 }}>Send a test alert</button>
        </div>
      </div>}
    </div>);
}
