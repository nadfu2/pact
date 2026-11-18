// v8: life-stage features. Everything here lives inside userProfile, so it syncs with the rest of the account.
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const INK = '#1B2A22', MUT = '#5A675F', CLAY = '#C8643C', FOR = '#1F3A2E', RULE = '#CFC7B4', BG = '#F4EFE4', SOFT = '#7C857F';
const pad = (n) => String(n).padStart(2, '0');
export const dstr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return dstr(new Date(y, m - 1, d + n)); };
export const weekStart = (s = dstr()) => { const [y, m, d] = s.split('-').map(Number); const wd = (new Date(y, m - 1, d).getDay() + 6) % 7; return dstr(new Date(y, m - 1, d - wd)); };
export const daysTo = (s) => Math.round((new Date(s + 'T00:00:00') - new Date(dstr() + 'T00:00:00')) / 86400000);
const nice = (s) => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };
const toM = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const fromM = (n) => { const x = ((Math.round(n) % 1440) + 1440) % 1440; return pad(Math.floor(x / 60)) + ':' + pad(x % 60); };
const uid = () => 'v8_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const SITUATIONS = [
  { id: 'study', t: 'Studying', s: 'Timetable, deadlines, a tight budget' },
  { id: 'work', t: 'Working', s: 'Set hours, evenings worth protecting' },
  { id: 'shifts', t: 'Shift work or a changing rota', s: 'Free time that moves every week' },
  { id: 'jobs', t: 'Looking for work', s: 'A routine, applications, small wins' },
  { id: 'retired', t: 'Retired, or lots of free time', s: 'Classes, clubs, company' },
  { id: 'carer', t: 'Caring for someone', s: 'Other people’s days to juggle' },
  { id: 'newcomer', t: 'New to the area', s: 'A few contacts, and no idea what’s on' },
  { id: 'energy', t: 'Energy that comes and goes', s: 'Good days and slow days' },
];
export const hasSit = (p, id) => ((p && p.situations) || []).includes(id);
export const SIT_HINTS = {
  study: 'a term timetable and student prices', work: 'protected evenings', shifts: 'a rota that finds your free time', jobs: 'a job hunt tracker',
  retired: 'larger text and a calmer Today', carer: 'a family circle', newcomer: 'more local events and ways to meet people', energy: 'a battery on Home that shapes your day',
};
// What ticking a situation sets up. Everything stays changeable in Profile > Life.
export const presetPatch = (sits, prev = {}) => {
  const patch = { situations: sits };
  if (sits.includes('retired')) patch.comfort = { ...(prev.comfort || {}), size: 'large', bigButtons: true, simpleNav: true };
  if (sits.includes('energy')) patch.dailyActivityCap = Math.min(prev.dailyActivityCap || 4, 3);
  if (sits.includes('study') && !prev.termMode) patch.termMode = 'term';
  return patch;
};

export const comfortOf = (p) => ({ size: 'normal', contrast: false, bigButtons: false, simpleNav: false, calmMotion: false, ...((p && p.comfort) || {}) });
export const ZOOM = { normal: 1, large: 1.2, larger: 1.4, biggest: 1.6 };

const FR = { fontFamily: 'Fraunces, Georgia, serif' };
const Lab = ({ children, c = MUT }) => <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: c }}>{children}</div>;
const Kick = ({ children, c = CLAY }) => <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: c, fontWeight: 700 }}>{children}</div>;
const Box = ({ children, dbl = true, style }) => <div style={{ border: dbl ? `3px double ${INK}` : `1px solid ${INK}`, padding: '12px 14px', ...style }}>{children}</div>;
const Btn = ({ children, solid = true, w, h = 36, ...r }) => <button {...r} style={{ height: h, padding: '0 14px', width: w, border: solid ? 0 : `1px solid ${INK}`, background: solid ? FOR : 'transparent', color: solid ? BG : INK, fontSize: 12, fontWeight: 600, borderRadius: 0, whiteSpace: 'nowrap', ...(r.style || {}) }}>{children}</button>;
const Chip = ({ on, children, ...r }) => <button {...r} aria-pressed={!!on} style={{ height: 30, padding: '0 11px', fontSize: 11, fontWeight: 600, borderRadius: 0, background: on ? FOR : 'transparent', color: on ? BG : INK, border: `1px solid ${on ? FOR : INK}` }}>{children}</button>;
const Tg = ({ on, onClick, label, ...r }) => <button {...r} role="switch" aria-checked={!!on} aria-label={label} onClick={onClick} style={{ width: 40, height: 22, border: `1.5px solid ${INK}`, background: on ? FOR : 'transparent', position: 'relative', borderRadius: 0, flex: 'none' }}><span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 15, height: 15, background: on ? BG : INK }} /></button>;
const Row = ({ t, s, right, ...r }) => <div {...r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${RULE}` }}><div style={{ minWidth: 0 }}><div style={{ fontSize: 14 }}>{t}</div>{s && <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>{s}</div>}</div>{right}</div>;
const Sec = ({ t, r, mt = 14 }) => <div style={{ marginTop: mt, borderTop: `3px solid ${INK}`, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}><Lab>{t}</Lab>{r ? <Lab>{r}</Lab> : null}</div>;
const Bar = ({ p, col = FOR, h = 6 }) => <div style={{ height: h, background: RULE }}><div style={{ width: Math.max(0, Math.min(100, p)) + '%', height: h, background: col }} /></div>;
const Sheet = ({ title, onClose, children, dataAttr }) => createPortal(
  <div {...dataAttr} role="dialog" aria-label={title} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(27,42,34,.5)' }} />
    <div style={{ position: 'relative', background: BG, color: INK, borderTop: `3px double ${INK}`, padding: '14px 22px 22px', maxHeight: '88dvh', overflowY: 'auto', maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div style={{ ...FR, fontWeight: 600, fontSize: 23 }}>{title}</div><button aria-label="Close" onClick={onClose} style={{ fontSize: 22, color: MUT, borderRadius: 0 }}>&times;</button></div>
      {children}
    </div>
  </div>, document.body);
const Input = (p) => <input {...p} style={{ width: '100%', background: 'transparent', borderBottom: `1.5px solid ${INK}`, padding: '8px 0', fontSize: 14, outline: 'none', ...(p.style || {}) }} />;

// ---------- tone ----------
export const toneOf = (p) => (p && p.tone) || 'calm';
export const TONES = [
  { id: 'cheer', t: 'Cheer me on', q: '“Two applications sent. That’s real momentum.”' },
  { id: 'calm', t: 'Calm and clear', q: '“Two applications sent this week. Three to go.”' },
  { id: 'facts', t: 'Just the facts', q: '“2 sent. Target 5.”' },
];
export const jobWeek = (profile) => { const J = profile.jobs || {}; const tg = { apply: 5, reach: 2, outing: 1, ...(J.targets || {}) }; const wk = weekStart(); const W = J.week && J.week.key === wk ? J.week : { reach: 0, outing: 0 }; const sent = (J.apps || []).filter(a => a.applied && a.applied >= wk).length; return { tg, sent, reach: W.reach || 0, outing: W.outing || 0, line: weeklyLine(profile, sent, tg.apply) }; };
export const weeklyLine = (p, n, target) => {
  const left = Math.max(0, target - n); const tn = toneOf(p);
  if (n >= target) return tn === 'cheer' ? `All ${target} sent. That is a brilliant week.` : tn === 'facts' ? `${n} sent. Target met.` : `${n} sent this week. Target met.`;
  return tn === 'cheer' ? `${n} sent. That’s real momentum.` : tn === 'facts' ? `${n} sent. Target ${target}.` : `${n} sent this week. ${left} to go.`;
};
export const setbackLine = (p) => {
  const tn = toneOf(p);
  return tn === 'cheer' ? 'Not this one. It happens to everyone, and it moves you closer to the right one. Shall I line up something good for tonight?'
    : tn === 'facts' ? 'Not this one. Next: one outing or one call today.' : 'Not this one. That is common, and it is not a verdict on you. Want me to find something calm for tonight?';
};

// ---------- Profile > Life ----------
export function LifePanel({ profile, patch }) {
  const sits = profile.situations || []; const cf = comfortOf(profile); const tn = toneOf(profile);
  const setCf = (o) => patch({ comfort: { ...cf, ...o } });
  const flip = (id) => patch({ situations: sits.includes(id) ? sits.filter(x => x !== id) : [...sits, id] });
  const SZ = [['normal', 'Normal', 16], ['large', 'Large', 20], ['larger', 'Larger', 24], ['biggest', 'Biggest', 28]];
  return (
    <div data-life-panel className="space-y-5">
      <div>
        <div className="font-fr" style={{ fontWeight: 600, fontSize: 22 }}>What&rsquo;s life like right now?</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: MUT, fontSize: 14, marginTop: 4 }}>Tick everything that fits. The Pact blends them.</div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SITUATIONS.map(s => { const on = sits.includes(s.id); return (
            <button key={s.id} data-life-sit={s.id} aria-pressed={on} onClick={() => flip(s.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '9px 14px', borderRadius: 0, border: `1.5px solid ${INK}`, background: on ? INK : 'transparent', color: on ? BG : INK }}>
              <span><span className="font-fr" style={{ display: 'block', fontWeight: 600, fontSize: 15.5, lineHeight: 1.1 }}>{s.t}</span><span style={{ display: 'block', fontSize: 11, marginTop: 2, opacity: .8 }}>{s.s}</span></span>
              {on && <span>&#10003;</span>}
            </button>); })}
        </div>
      </div>
      <div data-comfort-panel>
        <Sec t="Comfort" r="All optional" mt={0} />
        <div style={{ marginTop: 10 }}><Lab>Text size</Lab></div>
        <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: `1.5px solid ${INK}`, borderRight: 0 }}>
          {SZ.map(([id, l, fs]) => <button key={id} data-comfort-size={id} aria-pressed={cf.size === id} onClick={() => setCf({ size: id })} style={{ padding: '9px 0', textAlign: 'center', borderRadius: 0, borderRight: `1px solid ${INK}`, background: cf.size === id ? INK : 'transparent', color: cf.size === id ? BG : INK }}><div className="font-fr" style={{ fontWeight: 600, fontSize: fs, lineHeight: 1 }}>Aa</div><div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div></button>)}
        </div>
        <div style={{ marginTop: 8 }}>
          <Row t="Higher contrast" s="Darker text, stronger lines" right={<Tg data-comfort-contrast on={cf.contrast} label="Higher contrast" onClick={() => setCf({ contrast: !cf.contrast })} />} />
          <Row t="Simple view" s="Four big tabs (Today, Plans, People, More) and a calm Today page" right={<Tg data-comfort-simple on={cf.simpleNav} label="Simple view" onClick={() => setCf({ simpleNav: !cf.simpleNav })} />} />
          <Row t="Bigger buttons" s="Easier to tap, more space between" right={<Tg data-comfort-bigbtn on={cf.bigButtons} label="Bigger buttons" onClick={() => setCf({ bigButtons: !cf.bigButtons })} />} />
          <Row t="Calm motion" s="Switch off background movement" right={<Tg data-comfort-calm on={cf.calmMotion} label="Calm motion" onClick={() => setCf({ calmMotion: !cf.calmMotion })} />} />
        </div>
        <div style={{ marginTop: 10, border: `1.5px dashed ${SOFT}`, padding: '10px 13px', fontSize: 11.5, color: MUT, lineHeight: 1.45 }}>Chosen by you, not by age. These are open to everyone.</div>
      </div>
      <div data-tone-panel>
        <Sec t="How I talk" mt={0} />
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {TONES.map(t => { const on = tn === t.id; return (
            <button key={t.id} data-tone={t.id} aria-pressed={on} onClick={() => patch({ tone: t.id })} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 0, border: `1.5px solid ${INK}`, background: on ? INK : 'transparent', color: on ? BG : INK }}>
              <div className="font-fr" style={{ fontWeight: 600, fontSize: 16 }}>{t.t}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, marginTop: 4, opacity: .9 }}>{t.q}</div>
            </button>); })}
        </div>
        <div style={{ marginTop: 12 }}><Lab>After a setback</Lab></div>
        <Box style={{ marginTop: 6 }}><Kick>Preview</Kick><div data-tone-preview style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 16, lineHeight: 1.35, marginTop: 5 }}>&ldquo;{setbackLine(profile)}&rdquo;</div></Box>
        <div style={{ marginTop: 8 }}>
          <Row t="Celebrate small wins" s="A quiet note, no confetti" right={<Tg data-tone-celebrate on={profile.celebrate !== false} label="Celebrate small wins" onClick={() => patch({ celebrate: profile.celebrate === false })} />} />
        </div>
      </div>
    </div>
  );
}

// ---------- Energy (Home) ----------
export function EnergyCard({ profile, patch, tasks, today, moveTask, pushToast }) {
  const lvl = (profile.energyLog || {})[today] || null;
  const set = (v) => patch({ energyLog: { ...(profile.energyLog || {}), [today]: v } });
  const cap = profile.lowCap || 2;
  const todays = tasks.filter(t => t.date === today && t.status !== 'done').sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  const kept = todays.slice(0, cap), later = todays.slice(cap);
  const Bat = ({ id, label, n }) => { const on = lvl === id; return (
    <button data-energy={id} aria-pressed={on} onClick={() => set(id)} style={{ flex: 1, padding: '10px 4px 8px', textAlign: 'center', borderRadius: 0, border: `1.5px solid ${INK}`, background: on ? INK : 'transparent', color: on ? BG : INK }}>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 18, border: `1px solid ${on ? CLAY : INK}`, background: i < n ? (on ? CLAY : INK) : 'transparent' }} />)}</div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 7 }}>{label}</div>
    </button>); };
  return (
    <div data-energy-card style={{ order: -7 }}>
      <Lab>How&rsquo;s your battery?</Lab>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}><Bat id="low" label="Low" n={1} /><Bat id="steady" label="Steady" n={2} /><Bat id="high" label="High" n={3} /></div>
      {lvl === 'low' && (
        <div data-energy-stop style={{ marginTop: 12, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: '9px 0 11px' }}>
          <div style={{ textAlign: 'center', fontSize: 9.5, letterSpacing: '.26em', textTransform: 'uppercase', fontWeight: 700, color: CLAY }}>&#10022; Stop press &#10022;</div>
          <div data-energy-gentle style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 16, lineHeight: 1.3, marginTop: 4, textAlign: 'center' }}>
            {todays.length === 0 ? 'Nothing planned. Rest counts as a plan.' : `${Math.min(cap, todays.length)} thing${Math.min(cap, todays.length) === 1 ? '' : 's'} today. Everything else can wait, and nothing is lost.`}
          </div>
          {kept.length > 0 && <div style={{ marginTop: 8 }}>{kept.map(t => <div key={t.id} style={{ fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${RULE}` }}>{t.startTime} &middot; {t.title}</div>)}</div>}
          {later.length > 0 && <div style={{ marginTop: 10 }}><Lab>Could wait</Lab>{later.map(t => <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${RULE}` }}><span style={{ fontSize: 13 }}>{t.startTime} &middot; {t.title}</span><Btn data-energy-move solid={false} h={30} onClick={() => { moveTask(t.id); pushToast && pushToast(`${t.title} moved to tomorrow.`, 'success'); }}>Tomorrow</Btn></div>)}</div>}
          <div style={{ marginTop: 10, fontSize: 11.5, color: MUT }}>Protect a rest block: leave an hour or two empty in the afternoon.</div>
        </div>
      )}
      {lvl && lvl !== 'low' && <div style={{ marginTop: 8, fontSize: 12.5, color: MUT }}>{lvl === 'high' ? 'Good battery. A fine day to say yes to something new.' : 'Steady day. Plans as normal.'}</div>}
    </div>
  );
}

// ---------- Calm home ----------
export function CalmHome({ name, nextTask, todayCount, tomorrowCount, duePerson, treat, go, onFull, startVoice }) {
  const hr = new Date().getHours(); const hello = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const BB = { width: '100%', height: 56, border: 0, background: FOR, color: BG, fontSize: 17, fontWeight: 700, borderRadius: 0 };
  const way = nextTask && nextTask.location ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextTask.location)}&travelmode=transit` : null;
  return (
    <div data-calm-home className="flex flex-col gap-3.5" style={{ paddingBottom: 96 }}>
      <div><div className="font-fr" style={{ fontWeight: 600, fontSize: 34, lineHeight: 1.05 }}>{hello}{name ? ', ' + name : ''}.</div><div style={{ fontSize: 17, color: MUT, marginTop: 6 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
      <Box style={{ padding: 16 }}>
        <Kick>{nextTask ? 'Next up' : 'Today'}</Kick>
        {nextTask ? (<>
          <div className="font-fr" data-calm-next style={{ fontWeight: 600, fontSize: 26, lineHeight: 1.1, marginTop: 5 }}>{nextTask.title} at {nextTask.startTime}</div>
          <div style={{ fontSize: 16, marginTop: 6, lineHeight: 1.4 }}>{nextTask.location ? nextTask.location + '.' : ''}{Number(nextTask.travelTime) > 0 ? ` Leave at ${fromM(toM(nextTask.startTime) - Number(nextTask.travelTime))}.` : ''}</div>
          <div style={{ marginTop: 12 }}>{way ? <a data-calm-way href={way} target="_blank" rel="noreferrer" style={{ ...BB, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Show me the way</a> : <button data-calm-way style={BB} onClick={() => go('schedule')}>Open my plans</button>}</div>
        </>) : <div className="font-fr" style={{ fontWeight: 600, fontSize: 24, lineHeight: 1.15, marginTop: 5 }}>Nothing else today. A clear, quiet afternoon.</div>}
      </Box>
      {duePerson && (
        <div data-calm-call style={{ border: `1.5px solid ${INK}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div><div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: CLAY, fontWeight: 700 }}>Time to catch up</div><div className="font-fr" style={{ fontWeight: 600, fontSize: 24, marginTop: 4 }}>{duePerson.name}</div></div>
          {duePerson.phone ? <a href={`tel:${String(duePerson.phone).replace(/\s+/g, '')}`} style={{ height: 52, padding: '0 22px', display: 'flex', alignItems: 'center', background: CLAY, color: BG, fontSize: 17, fontWeight: 700 }}>Call</a> : <button onClick={() => go('social')} style={{ height: 52, padding: '0 22px', background: CLAY, color: BG, fontSize: 17, fontWeight: 700, borderRadius: 0 }}>Open</button>}
        </div>
      )}
      {treat && <div style={{ border: `1.5px solid ${INK}`, padding: '14px 16px' }}><div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT }}>This week&rsquo;s treat</div><div className="font-fr" style={{ fontWeight: 600, fontSize: 22, marginTop: 4, lineHeight: 1.15 }}>{treat.title}</div>{treat.when && <div style={{ fontSize: 16, marginTop: 4, color: MUT }}>{treat.when}</div>}</div>}
      <div style={{ borderTop: `3px solid ${INK}`, paddingTop: 8 }}><div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT }}>Tomorrow</div><div style={{ fontSize: 17, marginTop: 4 }}>{tomorrowCount ? `${tomorrowCount} thing${tomorrowCount === 1 ? '' : 's'} planned.` : 'Nothing planned. A quiet day.'}</div></div>
      <div className="flex gap-2.5"><button data-calm-voice onClick={startVoice} style={{ flex: 1, height: 52, border: `2px solid ${INK}`, fontSize: 16, fontWeight: 700, borderRadius: 0 }}>Add something</button><button data-calm-full onClick={onFull} style={{ flex: 1, height: 52, border: `1.5px solid ${INK}`, fontSize: 14, fontWeight: 600, borderRadius: 0, color: MUT }}>Full Today view</button></div>
    </div>
  );
}

// ---------- Job hunt (Development) ----------
const STAGES = [['saved', 'Saved'], ['applied', 'Applied'], ['interview', 'Interview'], ['offer', 'Offer']];
const CHECK0 = ['Read about the team and the role', 'Three questions to ask them', 'Outfit and ID ready', 'Bring two copies of your CV'];
export function JobHunt({ profile, patch, addTask, pushToast, pulseOnly }) {
  const J = profile.jobs || {}; const apps = J.apps || []; const tg = { apply: 5, reach: 2, outing: 1, ...(J.targets || {}) };
  const wk = weekStart(); const W = J.week && J.week.key === wk ? J.week : { key: wk, reach: 0, outing: 0 };
  const save = (o) => patch({ jobs: { ...J, apps, week: W, targets: tg, ...o } });
  const setApp = (id, o) => save({ apps: apps.map(a => a.id === id ? { ...a, ...o } : a) });
  const sentThisWeek = apps.filter(a => a.applied && a.applied >= wk).length;
  const [add, setAdd] = useState(false); const [d, setD] = useState({ org: '', role: '', status: 'applied' });
  const [prep, setPrep] = useState(null); // app id
  const counts = STAGES.map(([k]) => apps.filter(a => a.status === k).length);
  // Works for roles saved by either the old list or the Home role form.
  const isLive = (a) => (a.appliedFlag !== undefined ? !!a.appliedFlag && (a.outcome || 'Pending') === 'Pending' : a.status !== 'saved' && a.status !== 'closed');
  const isApplied = (a) => isLive(a) && (a.appliedFlag !== undefined ? (a.stage || 'Application') === 'Application' : a.status === 'applied');
  const isInterview = (a) => isLive(a) && (a.appliedFlag !== undefined ? a.stage === 'Interview' : a.status === 'interview');
  const stale = apps.filter(a => isApplied(a) && a.applied && -daysTo(a.applied) >= 7);
  const upcoming = apps.filter(a => isInterview(a) && (!a.interview || !a.interview.date || daysTo(a.interview.date) >= 0)).sort((a, b) => ((a.interview && a.interview.date) || '9999').localeCompare((b.interview && b.interview.date) || '9999'));
  const submit = () => {
    if (!d.org.trim()) return;
    save({ apps: [...apps, { id: uid(), org: d.org.trim(), role: d.role.trim(), status: d.status, applied: d.status === 'applied' ? dstr() : '', added: dstr() }] });
    setD({ org: '', role: '', status: 'applied' }); setAdd(false);
  };
  const draft = (a) => {
    const body = `Hello,\n\nI applied for the ${a.role || 'role'} at ${a.org} on ${nice(a.applied)} and wanted to follow up briefly. I am still very interested and would be glad to share anything else that would help.\n\nThank you,\n${profile.name || ''}`;
    if (typeof window !== 'undefined') window.open(`mailto:?subject=${encodeURIComponent('Following up: ' + (a.role || 'my application'))}&body=${encodeURIComponent(body)}`, '_blank');
  };
  const pa = prep ? apps.find(a => a.id === prep) : null; const iv = pa ? (pa.interview || {}) : {};
  const setIv = (o) => setApp(pa.id, { interview: { date: '', time: '10:00', place: '', travel: 25, checks: CHECK0.map(t => ({ t, done: false })), remind: true, ...iv, ...o } });
  const ivx = { date: '', time: '10:00', place: '', travel: 25, checks: CHECK0.map(t => ({ t, done: false })), remind: true, ...iv };
  const leave = ivx.time ? fromM(toM(ivx.time) - (Number(ivx.travel) || 0) - 10) : '';
  const commit = () => {
    if (!ivx.date) { pushToast && pushToast('Pick the interview date first.', 'info'); return; }
    setApp(pa.id, { status: 'interview', stage: 'Interview', appliedFlag: true, applied: pa.applied || dstr(), interview: { ...ivx } });
    const end = fromM(toM(ivx.time) + 60);
    addTask({ title: `Interview: ${pa.org}`, date: ivx.date, startTime: ivx.time, endTime: end, duration: 60, location: ivx.place || pa.org, travelTime: Number(ivx.travel) || 0, type: 'analytical', categoryColor: 'work' });
    addTask({ title: `Interview prep: ${pa.org}`, date: addDays(ivx.date, -1), startTime: '18:00', endTime: '19:00', duration: 60, location: 'Home', travelTime: 0, type: 'analytical', categoryColor: 'work' });
    pushToast && pushToast(`Interview and a prep hour added to your week.`, 'success'); setPrep(null);
  };
  const tgt = (label, n, t, plus, attr) => (
    <div style={{ padding: '8px 0', borderBottom: `1px solid ${RULE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 5 }}><span>{label}</span><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b style={{ color: n < t ? CLAY : FOR }}>{n} of {t}</b>{plus && <button {...attr} aria-label={`Add one: ${label}`} onClick={plus} style={{ width: 26, height: 26, border: `1px solid ${INK}`, fontWeight: 700, borderRadius: 0 }}>+</button>}</span></div>
      <Bar p={t ? n / t * 100 : 0} col={n < t ? CLAY : FOR} />
    </div>);
  return (
    <div data-job-hunt={pulseOnly ? undefined : true} data-job-pulse={pulseOnly ? true : undefined} style={pulseOnly ? {} : { border: `1.5px solid ${INK}`, padding: '12px 14px', background: 'rgba(250,248,242,.85)' }}>
      {!pulseOnly && <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 22 }}>Your search, steadily.</div><Lab>Job hunt</Lab></div>}
      {pulseOnly && <Sec t="This week" r="" mt={0} />}
      <div data-job-line style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: MUT, fontSize: 14, marginTop: 3 }}>{weeklyLine(profile, sentThisWeek, tg.apply)}</div>
      <div style={{ marginTop: 6 }}>
        {tgt('Apply', sentThisWeek, tg.apply)}
        {tgt('Reach out to someone', W.reach || 0, tg.reach, () => save({ week: { ...W, reach: (W.reach || 0) + 1 } }), { 'data-job-reach': true })}
        {tgt('One outing, just for you', W.outing || 0, tg.outing, () => save({ week: { ...W, outing: (W.outing || 0) + 1 } }), { 'data-job-outing': true })}
      </div>
      {!pulseOnly && <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: `1.5px solid ${INK}` }}>
        {STAGES.map(([k, l], i) => <div key={k} data-job-count={k} style={{ padding: '8px 0', textAlign: 'center', borderRight: i < 3 ? `1px solid ${INK}` : 0, background: k === 'interview' && counts[i] ? INK : 'transparent', color: k === 'interview' && counts[i] ? BG : INK }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 26, lineHeight: 1 }}>{counts[i]}</div><div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 3, opacity: .8 }}>{l}</div></div>)}
      </div>}
      {(stale.length > 0 || upcoming.length > 0) && <Sec t="Follow up" r={String(stale.length + upcoming.length)} mt={12} />}
      {upcoming.map(a => <Row key={a.id} data-job-interview t={a.interview && a.interview.date ? `${a.org} · Interview ${nice(a.interview.date)} ${a.interview.time || ''}` : `${a.org} · Interview stage`} s={a.interview && a.interview.date ? (a.role || 'Interview coming up') : 'Add the date and I will plan your travel and prep'} right={<Btn data-job-prep h={32} onClick={() => setPrep(a.id)}>Prep</Btn>} />)}
      {stale.map(a => { const n = -daysTo(a.applied); return <Row key={a.id} data-job-stale t={`${a.org}${a.role ? ' · ' + a.role : ''}`} s={n >= 14 ? `No reply in ${n} days. That’s common. Keep or archive?` : `Applied ${n} days ago. A short nudge is fine now.`} right={n >= 14 ? <Btn data-job-archive solid={false} h={32} onClick={() => setApp(a.id, { status: 'closed' })}>Archive</Btn> : <Btn data-job-draft solid={false} h={32} onClick={() => draft(a)}>Draft</Btn>} />; })}
      {!pulseOnly && apps.length > 0 && <Sec t="All applications" r={String(apps.filter(a => a.status !== 'closed').length)} mt={12} />}
      {!pulseOnly && apps.filter(a => a.status !== 'closed').map(a => (
        <div key={a.id} data-job-app style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: `1px solid ${RULE}` }}>
          <div style={{ minWidth: 0 }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.1 }}>{a.org}</div><div style={{ fontSize: 11, color: MUT }}>{a.role || 'Role not set'}{a.applied ? ' · applied ' + nice(a.applied) : ''}</div></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select data-job-status aria-label={`Status for ${a.org}`} value={a.status} onChange={e => { const v = e.target.value; setApp(a.id, { status: v, applied: v !== 'saved' && !a.applied ? dstr() : a.applied }); if (v === 'interview') setPrep(a.id); }} style={{ height: 30, minWidth: 104, border: `1px solid ${INK}`, background: 'transparent', fontSize: 12, borderRadius: 0 }}>
              {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}<option value="closed">Not this one</option>
            </select>
            <button aria-label={`Remove ${a.org}`} onClick={() => save({ apps: apps.filter(x => x.id !== a.id) })} style={{ color: MUT, fontSize: 18, borderRadius: 0 }}>&times;</button>
          </div>
        </div>))}
      {!pulseOnly && apps.length === 0 && <div style={{ marginTop: 10, fontSize: 12.5, color: MUT }}>Nothing here yet. Add the first one and I&rsquo;ll keep track of the follow-ups.</div>}
      {!pulseOnly && <div style={{ marginTop: 10, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: MUT }}>Quiet inboxes are normal. Replies often take two to three weeks.</div>}
      {!pulseOnly && <div style={{ marginTop: 10, display: 'flex', gap: 8 }}><Btn data-job-add-open h={44} w="100%" onClick={() => setAdd(true)}>+ Add an application</Btn></div>}
      {add && (
        <Sheet title="Add an application" onClose={() => setAdd(false)} dataAttr={{ 'data-job-add-sheet': true }}>
          <div className="space-y-3" style={{ marginTop: 10 }}>
            <Input data-job-org placeholder="Company or organisation" aria-label="Company" value={d.org} onChange={e => setD({ ...d, org: e.target.value })} />
            <Input data-job-role placeholder="Role" aria-label="Role" value={d.role} onChange={e => setD({ ...d, role: e.target.value })} />
            <div style={{ display: 'flex', gap: 6 }}>{[['saved', 'Saved for later'], ['applied', 'Applied'], ['interview', 'Interview']].map(([k, l]) => <Chip key={k} on={d.status === k} onClick={() => setD({ ...d, status: k })}>{l}</Chip>)}</div>
            <Btn data-job-save h={44} w="100%" onClick={submit}>Save</Btn>
          </div>
        </Sheet>)}
      {pa && (
        <Sheet title="Interview prep" onClose={() => setPrep(null)} dataAttr={{ 'data-job-prep-sheet': true }}>
          <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>{pa.org}{pa.role ? ' · ' + pa.role : ''}</div>
          <div className="space-y-3" style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}><input data-iv-date type="date" aria-label="Interview date" value={ivx.date} onChange={e => setIv({ date: e.target.value })} style={{ flex: 1, height: 38, border: `1.5px solid ${INK}`, background: 'transparent', padding: '0 8px', borderRadius: 0 }} /><input data-iv-time type="time" aria-label="Interview time" value={ivx.time} onChange={e => setIv({ time: e.target.value })} style={{ width: 150, height: 38, border: `1.5px solid ${INK}`, background: 'transparent', padding: '0 8px', borderRadius: 0 }} /></div>
            <Input data-iv-place placeholder="Where is it?" aria-label="Where" value={ivx.place} onChange={e => setIv({ place: e.target.value })} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}><span>Travel (minutes)</span><input data-iv-travel type="number" min="0" aria-label="Travel minutes" value={ivx.travel} onChange={e => setIv({ travel: e.target.value })} style={{ width: 70, height: 34, border: `1.5px solid ${INK}`, background: 'transparent', padding: '0 8px', borderRadius: 0 }} /></div>
            <div data-iv-leave style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1.5px solid ${INK}` }}><div style={{ padding: '9px 11px', borderRight: `1px solid ${INK}` }}><Lab>Leave by</Lab><div className="font-fr" style={{ fontWeight: 600, fontSize: 22, marginTop: 2 }}>{leave || '--:--'}</div><div style={{ fontSize: 10.5, color: MUT }}>Travel plus 10 spare</div></div><div style={{ padding: '9px 11px' }}><Lab>Prep block</Lab><div className="font-fr" style={{ fontWeight: 600, fontSize: 22, marginTop: 2 }}>{ivx.date ? nice(addDays(ivx.date, -1)).split(' ')[0] + ' 18:00' : '18:00'}</div><div style={{ fontSize: 10.5, color: MUT }}>1 hour, the day before</div></div></div>
            <div>{ivx.checks.map((c, i) => <button key={i} data-iv-check onClick={() => setIv({ checks: ivx.checks.map((x, j) => j === i ? { ...x, done: !x.done } : x) })} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '7px 0', fontSize: 13, borderBottom: `1px solid ${RULE}`, borderRadius: 0 }}><span style={{ width: 18, height: 18, border: `1.5px solid ${c.done ? FOR : INK}`, background: c.done ? FOR : 'transparent', color: BG, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{c.done ? '✓' : ''}</span><span style={{ textDecoration: c.done ? 'line-through' : 'none', color: c.done ? MUT : INK }}>{c.t}</span></button>)}</div>
            <Row t="Remind me to text a friend after" right={<Tg on={ivx.remind} label="Remind me to text a friend after" onClick={() => setIv({ remind: !ivx.remind })} />} />
            <Btn data-iv-add h={44} w="100%" onClick={commit}>Add to my week</Btn>
          </div>
        </Sheet>)}
    </div>
  );
}

// ---------- Term + deadlines (Schedule) ----------
export function TermPanel({ profile, patch, goData }) {
  const mode = profile.termMode || 'term'; const dl = (profile.deadlines || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const [t, setT] = useState(''); const [dt, setDt] = useState(addDays(dstr(), 7));
  const setMode = (m) => {
    if (m === mode) return;
    if (m === 'holiday') patch({ termMode: 'holiday', termHours: profile.weeklyHours, weeklyHours: Object.fromEntries(Object.entries(profile.weeklyHours || {}).map(([k, v]) => [k, { ...v, active: false }])) });
    else patch({ termMode: 'term', weeklyHours: profile.termHours || profile.weeklyHours, termHours: null });
  };
  return (
    <div data-term-panel style={{ border: `1.5px solid ${INK}`, padding: '12px 14px', background: 'rgba(250,248,242,.85)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 20 }}>Term, sorted.</div><Lab>Student</Lab></div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1.5px solid ${INK}` }}>{[['term', 'Term'], ['holiday', 'Holiday']].map(([k, l], i) => <button key={k} data-term-mode={k} aria-pressed={mode === k} onClick={() => setMode(k)} style={{ padding: '9px 0', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 0, borderRight: i === 0 ? `1px solid ${INK}` : 0, background: mode === k ? INK : 'transparent', color: mode === k ? BG : INK }}>{l}</button>)}</div>
      <div data-term-note style={{ marginTop: 8, fontSize: 11.5, color: MUT, lineHeight: 1.45 }}>{mode === 'holiday' ? 'Holiday mode: your study and work hours are cleared, so there is more room for plans, trips and catch-ups. Switch back to Term and they return.' : 'Term mode: your study and work hours are protected.'}</div>
      <div style={{ marginTop: 10, border: `1.5px dashed ${SOFT}`, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><div style={{ fontSize: 12, color: MUT, lineHeight: 1.4 }}>Timetable: add your uni calendar link once and your sessions appear here.</div><Btn solid={false} h={30} data-term-import onClick={goData}>Add link</Btn></div>
      <Sec t="Due soon" r={String(dl.length)} mt={12} />
      {dl.map(x => { const n = daysTo(x.date); return <div key={x.id} data-deadline style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '9px 0', borderBottom: `1px solid ${RULE}`, fontWeight: n <= 7 ? 600 : 400 }}><span style={{ fontSize: 14, color: n <= 7 ? CLAY : INK }}>{x.title}</span><span style={{ flex: 1, borderBottom: `1.5px dotted ${SOFT}`, transform: 'translateY(-3px)' }} /><span style={{ fontSize: 13, color: n <= 7 ? CLAY : MUT }}>{n < 0 ? 'overdue' : n === 0 ? 'today' : `${n} day${n === 1 ? '' : 's'}`}</span><button aria-label={`Remove ${x.title}`} onClick={() => patch({ deadlines: (profile.deadlines || []).filter(y => y.id !== x.id) })} style={{ color: MUT, fontSize: 16, borderRadius: 0 }}>&times;</button></div>; })}
      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}><Input data-deadline-title placeholder="Deadline, e.g. Fluids report" aria-label="Deadline" value={t} onChange={e => setT(e.target.value)} /></div>
        <input data-deadline-date type="date" aria-label="Due date" value={dt} onChange={e => setDt(e.target.value)} style={{ width: 130, height: 36, border: `1.5px solid ${INK}`, background: 'transparent', padding: '0 6px', borderRadius: 0 }} />
        <Btn data-deadline-add onClick={() => { if (!t.trim()) return; patch({ deadlines: [...(profile.deadlines || []), { id: uid(), title: t.trim(), date: dt }] }); setT(''); }}>Add</Btn>
      </div>
    </div>
  );
}

// ---------- Rota (Schedule) ----------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = { off: { l: 'Day off', s: '', e: '' }, early: { l: 'Early', s: '06:00', e: '14:00' }, day: { l: 'Day', s: '09:00', e: '17:00' }, late: { l: 'Late', s: '14:00', e: '22:00' }, night: { l: 'Night', s: '22:00', e: '23:59' } };
export const rotaFree = (sh) => {
  const lo = 8 * 60, hi = 22 * 60; if (!sh || sh.k === 'off') return [[lo, hi]];
  const s = toM(sh.s), e = toM(sh.e); const out = [];
  if (s - lo >= 60) out.push([lo, Math.min(s, hi)]); if (hi - e >= 60 && e < hi) out.push([Math.max(e, lo), hi]); return out;
};
export function RotaPanel({ profile, patch, pushToast }) {
  const wk = weekStart(); const R = (profile.rota && profile.rota[wk]) || {};
  const [open, setOpen] = useState(false);
  const setDay = (d, k, o = {}) => patch({ rota: { ...(profile.rota || {}), [wk]: { ...R, [d]: { k, s: SHIFTS[k].s, e: SHIFTS[k].e, ...o } } } });
  const prevWk = addDays(wk, -7); const hasPrev = profile.rota && profile.rota[prevWk];
  const apply = () => {
    const wh = { ...(profile.weeklyHours || {}) };
    DAYS.forEach(d => { const sh = R[d]; if (!sh) return; wh[d] = sh.k === 'off' ? { ...(wh[d] || { start: '09:00', end: '17:00' }), active: false } : { active: true, start: sh.s, end: sh.e }; });
    patch({ weeklyHours: wh }); pushToast && pushToast('Your planner now uses this week’s rota.', 'success');
  };
  const sc = (m) => Math.max(0, Math.min(100, (m / 60 - 6) / 18 * 100));
  const fm = (m) => pad(Math.floor(m / 60));
  return (
    <div data-rota-panel style={{ border: `1.5px solid ${INK}`, padding: '12px 14px', background: 'rgba(250,248,242,.85)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 20 }}>Your rota, your free time.</div><Lab>Shifts</Lab></div>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: MUT, fontSize: 14, marginTop: 3 }}>Add shifts once. I find the gaps.</div>
      <div style={{ marginTop: 8 }}>
        {DAYS.map(d => { const sh = R[d]; const fr = rotaFree(sh); return (
          <div key={d} data-rota-day={d} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${RULE}` }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', color: MUT }}>{d.toUpperCase()}</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{sh ? (sh.k === 'off' ? 'Day off' : `${SHIFTS[sh.k].l} ${sh.s}–${sh.e}`) : 'Not set'}</span><span style={{ color: CLAY }}>{sh ? (fr.length ? 'Free ' + fr.map(([a, b]) => `${fm(a)}–${fm(b)}`).join(', ') : 'No free time') : ''}</span></div>
              <div style={{ position: 'relative', height: 14, background: RULE }}>
                {sh && sh.k !== 'off' && <div style={{ position: 'absolute', left: sc(toM(sh.s)) + '%', width: sc(toM(sh.e)) - sc(toM(sh.s)) + '%', top: 0, bottom: 0, background: FOR }} />}
                {sh && fr.map(([a, b], i) => <div key={i} style={{ position: 'absolute', left: sc(a) + '%', width: sc(b) - sc(a) + '%', top: 0, bottom: 0, border: `1.5px solid ${CLAY}`, background: 'rgba(200,100,60,.12)' }} />)}
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>{Object.keys(SHIFTS).map(k => <Chip key={k} data-rota-set={`${d}:${k}`} on={sh && sh.k === k} onClick={() => setDay(d, k)}>{SHIFTS[k].l}</Chip>)}</div>
            </div>
          </div>); })}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn data-rota-apply onClick={apply}>Use this week in my planner</Btn>
        {hasPrev && <Btn data-rota-copy solid={false} onClick={() => patch({ rota: { ...(profile.rota || {}), [wk]: { ...profile.rota[prevWk] } } })}>Copy last week</Btn>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: MUT }}>Next week different? Come back on Monday and set it again. Night shifts count until 23:59.</div>
    </div>
  );
}

// ---------- Budget (Ideas) ----------
export const priceNum = (p) => { const s = String(p == null ? '' : p).toLowerCase(); if (!s || s.includes('free')) return 0; const m = s.match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : null; };
export const budgetLeft = (profile) => { const B = profile.budget || {}; const wk = weekStart(); return (Number(B.weekly) || 35) - (B.spend || []).filter(s => s.d >= wk).reduce((a, s) => a + Number(s.amt || 0), 0); };
export const budgetPass = (item, f, left) => { f = f || {}; if (!f.free && !f.under5 && !f.fits) return true; const n = priceNum(item.price); if (f.free && n !== 0) return false; if (f.under5 && !(n !== null && n < 5)) return false; if (f.fits && !(n !== null && n <= left)) return false; return true; };
export function BudgetCard({ profile, patch, filter, setFilter }) {
  const B = profile.budget || {}; const weekly = Number(B.weekly) || 35; const wk = weekStart();
  const spend = (B.spend || []).filter(s => s.d >= wk); const spent = spend.reduce((a, s) => a + Number(s.amt || 0), 0); const left = weekly - spent;
  const [amt, setAmt] = useState(''); const [note, setNote] = useState('');
  const f = filter || {};
  return (
    <div data-budget-card style={{ border: `3px double ${INK}`, padding: '12px 14px', background: 'rgba(250,248,242,.85)' }}>
      <Kick>Left this week</Kick>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}><span data-budget-left className="font-fr" style={{ fontWeight: 600, fontSize: 34, lineHeight: 1, color: left < 0 ? CLAY : INK }}>{left < 0 ? '-' : ''}&pound;{Math.abs(left).toFixed(2)}</span><span style={{ fontSize: 12, color: MUT }}>of &pound;<input data-budget-weekly type="number" min="0" aria-label="Weekly fun budget" value={weekly} onChange={e => patch({ budget: { ...B, weekly: e.target.value } })} style={{ width: 52, background: 'transparent', borderBottom: `1px solid ${INK}`, textAlign: 'center', fontSize: 12 }} /> for fun</span></div>
      <div style={{ marginTop: 8 }}><Bar p={weekly ? spent / weekly * 100 : 0} col={left < 0 ? CLAY : CLAY} h={8} /></div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip data-budget-free on={f.free} onClick={() => setFilter({ ...f, free: !f.free })}>Free</Chip>
        <Chip data-budget-under5 on={f.under5} onClick={() => setFilter({ ...f, under5: !f.under5 })}>Under &pound;5</Chip>
        <Chip data-budget-fits on={f.fits} onClick={() => setFilter({ ...f, fits: !f.fits })}>Fits what&rsquo;s left</Chip>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 80 }}><Input data-budget-amt type="number" min="0" step="0.5" placeholder="&pound;" aria-label="Amount spent" value={amt} onChange={e => setAmt(e.target.value)} /></div>
        <div style={{ flex: 1 }}><Input data-budget-note placeholder="What was it?" aria-label="What was it" value={note} onChange={e => setNote(e.target.value)} /></div>
        <Btn data-budget-add onClick={() => { const a = Number(amt); if (!(a > 0)) return; patch({ budget: { ...B, weekly, spend: [...(B.spend || []), { id: uid(), d: dstr(), amt: a, note: note.trim() }] } }); setAmt(''); setNote(''); }}>Log</Btn>
      </div>
      {spend.length > 0 && <div style={{ marginTop: 8 }}>{spend.slice(-3).reverse().map(s => <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${RULE}`, color: MUT }}><span>{nice(s.d)} &middot; {s.note || 'Spent'}</span><span>&pound;{Number(s.amt).toFixed(2)}</span></div>)}</div>}
    </div>
  );
}

// ---------- Family circle (Social > People) ----------
const SHARES = [['appts', 'Appointments'], ['out', 'When I’m out'], ['plans', 'Plans']];
export function CirclePanel({ profile, patch, people, today, tasks }) {
  const C = profile.circle || { members: [], quiet: false, book: false }; const mem = C.members || [];
  const [sel, setSel] = useState(''); const [nm, setNm] = useState('');
  const save = (o) => patch({ circle: { ...C, members: mem, ...o } });
  const setM = (id, o) => save({ members: mem.map(m => m.id === id ? { ...m, ...o } : m) });
  const avail = (people || []).filter(p => !p.blocked && !mem.some(m => m.name === p.name));
  const add = (name, rel) => { if (!name) return; save({ members: [...mem, { id: uid(), name, rel: rel || '', share: { appts: true, out: false, plans: false } }] }); setSel(''); setNm(''); };
  const nextAppt = (tasks || []).filter(t => t.date >= today && t.status !== 'done' && /doctor|dentist|hospital|clinic|appointment|surgery|checkup|optician/i.test(t.title)).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  return (
    <div data-circle-panel style={{ border: `1.5px solid ${INK}`, padding: '12px 14px', background: 'rgba(250,248,242,.85)' }}>
      <div className="font-fr" style={{ fontWeight: 600, fontSize: 22 }}>Your circle.</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: MUT, fontSize: 14, marginTop: 3 }}>People you trust to see a little. You choose what.</div>
      {mem.map(m => (
        <div key={m.id} data-circle-member style={{ padding: '10px 0', borderBottom: `1px solid ${RULE}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div className="font-fr" style={{ fontWeight: 600, fontSize: 17 }}>{m.name}</div><div style={{ fontSize: 11, color: MUT }}>{m.rel || 'Family or friend'} &middot; sees {SHARES.filter(([k]) => m.share[k]).map(([, l]) => l.toLowerCase()).join(', ') || 'nothing yet'}</div></div><button data-circle-remove aria-label={`Remove ${m.name}`} onClick={() => save({ members: mem.filter(x => x.id !== m.id) })} style={{ color: MUT, fontSize: 18, borderRadius: 0 }}>&times;</button></div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{SHARES.map(([k, l]) => <Chip key={k} data-circle-share={k} on={m.share[k]} onClick={() => setM(m.id, { share: { ...m.share, [k]: !m.share[k] } })}>{l}</Chip>)}</div>
        </div>))}
      {mem.length > 0 && <Box style={{ marginTop: 12 }}><Kick>What {mem[0].name} sees</Kick><div data-circle-preview style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>{mem[0].share.appts ? (nextAppt ? `${nice(nextAppt.date)} ${nextAppt.startTime} · Appointment` : 'No appointments coming up') : 'No appointments shared'}<br /><span style={{ color: MUT }}>{mem[0].share.appts ? 'No place, no details, nothing else.' : 'Nothing at all.'}</span></div></Box>}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {avail.length > 0 && <select data-circle-pick aria-label="Add from Your People" value={sel} onChange={e => { const p = avail.find(x => x.id === e.target.value); if (p) add(p.name, p.relation); }} style={{ height: 36, border: `1px solid ${INK}`, background: 'transparent', fontSize: 12, borderRadius: 0 }}><option value="">Add from Your People</option>{avail.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
        <div style={{ flex: 1, minWidth: 110 }}><Input data-circle-name placeholder="Or type a name" aria-label="Name" value={nm} onChange={e => setNm(e.target.value)} /></div>
        <Btn data-circle-add onClick={() => add(nm.trim(), '')}>Add</Btn>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: MUT, lineHeight: 1.45 }}>Everything is off until you switch it on, and your choices are saved to your account. Live sharing with family members is coming soon. For now this shows exactly what they will see.</div>
    </div>
  );
}

export { Sheet, Input, Lab, Kick, Box, Row, Sec, Bar, FR, INK, MUT, CLAY, FOR, RULE, BG, SOFT, uid, nice };
