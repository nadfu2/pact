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
export function JobHunt({ profile, patch, addTask, pushToast, pulseOnly, collapsible }) {
  const [cardOpen, setCardOpen] = useState(!collapsible);
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
      {!pulseOnly && <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><div className="font-fr" style={{ fontWeight: 600, fontSize: 22 }}>Your search, steadily.</div>{collapsible ? <button data-job-collapse aria-expanded={cardOpen} aria-label={cardOpen ? 'Collapse job hunt' : 'Expand job hunt'} onClick={() => setCardOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: MUT, borderRadius: 0 }}>Job hunt <span style={{ fontSize: 14, display: 'inline-block', transform: cardOpen ? 'rotate(180deg)' : 'none' }}>&#8964;</span></button> : <Lab>Job hunt</Lab>}</div>}
      {pulseOnly && <Sec t="This week" r="" mt={0} />}
      <div data-job-line style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', color: MUT, fontSize: 14, marginTop: 3 }}>{weeklyLine(profile, sentThisWeek, tg.apply)}</div>
      {collapsible && !cardOpen && <div data-job-mini style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 11, color: MUT, letterSpacing: '.06em', textTransform: 'uppercase', flexWrap: 'wrap' }}>{STAGES.map(([k, l], i) => <span key={k}>{l} <b style={{ color: INK }}>{counts[i]}</b></span>)}</div>}
      <div style={{ display: collapsible && !cardOpen ? 'none' : 'block' }}>
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
      </div>
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
const fieldStyle = { width: '100%', boxSizing: 'border-box', marginTop: 5, border: `1.5px solid ${INK}`, background: '#FAF4E0', padding: '10px 10px', fontSize: 16, fontWeight: 400, color: INK, borderRadius: 0, minWidth: 0, height: 44 };
const labStyle = { display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT };
export function TermPanel({ profile, patch, goData, deadlines, onAddDeadline, onRemoveDeadline, linked }) {
  const mode = profile.termMode || 'term'; const dl = (deadlines || []).slice().sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const [open, setOpen] = useState(false);
  const [t, setT] = useState(''); const [dt, setDt] = useState(addDays(dstr(), 7)); const [tm, setTm] = useState('12:00');
  const setMode = (m) => {
    if (m === mode) return;
    if (m === 'holiday') patch({ termMode: 'holiday', termHours: profile.weeklyHours, weeklyHours: Object.fromEntries(Object.entries(profile.weeklyHours || {}).map(([k, v]) => [k, { ...v, active: false }])) });
    else patch({ termMode: 'term', weeklyHours: profile.termHours || profile.weeklyHours, termHours: null });
  };
  const add = () => { if (!t.trim() || !dt) return; onAddDeadline && onAddDeadline(t.trim(), dt, tm || '12:00'); setT(''); };
  return (
    <div data-term-panel style={{ border: `1.5px solid ${INK}`, background: 'rgba(250,248,242,.85)' }}>
      <button data-term-toggle aria-expanded={open} onClick={() => setOpen(o => !o)} className="w-full text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'none', border: 0, borderRadius: 0 }}>
        <span><span className="font-fr" style={{ display: 'block', fontWeight: 600, fontSize: 22, lineHeight: 1.05 }}>Term, sorted.</span>
          <span style={{ display: 'block', fontSize: 13, color: MUT, marginTop: 4, lineHeight: 1.35 }}>Put in deadlines, switch term or holiday mode, and link your uni timetable.{dl.length ? ` ${dl.length} due.` : ''}</span></span>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: MUT, flex: 'none' }}>{open ? 'Hide \u25B4' : 'Open \u25BE'}</span>
      </button>
      {open && <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${RULE}` }}>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1.5px solid ${INK}` }}>{[['term', 'Term'], ['holiday', 'Holiday']].map(([k, l], i) => <button key={k} data-term-mode={k} aria-pressed={mode === k} onClick={() => setMode(k)} style={{ padding: '11px 0', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', borderRadius: 0, borderRight: i === 0 ? `1px solid ${INK}` : 0, background: mode === k ? INK : 'transparent', color: mode === k ? BG : INK }}>{l}</button>)}</div>
        <div data-term-note style={{ marginTop: 8, fontSize: 13, color: MUT, lineHeight: 1.45 }}>{mode === 'holiday' ? 'Holiday mode: your study and work hours are cleared, so there is more room for plans, trips and catch-ups. Switch back to Term and they return.' : 'Term mode: your study and work hours are protected.'}</div>
        {linked ? <div data-term-linked style={{ marginTop: 10, fontSize: 13, color: MUT }}>Uni timetable linked. Your sessions show in your schedule.</div>
          : <div style={{ marginTop: 10, border: `1.5px dashed ${SOFT}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><div style={{ fontSize: 13, color: MUT, lineHeight: 1.4 }}>Add your uni calendar link once and your sessions appear in your schedule.</div><Btn solid={false} h={34} data-term-import onClick={goData}>Add link</Btn></div>}
        <div style={{ marginTop: 14, borderTop: `3px solid ${INK}` }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT, marginTop: 6 }}><span>Deadlines</span><span>{dl.length}</span></div>
        {dl.length === 0 && <div style={{ fontSize: 13, color: MUT, padding: '10px 0' }}>Nothing due. Add one below and it goes into your schedule in red.</div>}
        {dl.map(x => { const n = daysTo(x.date); return <div key={x.id} data-deadline style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: `1px solid ${RULE}` }}><span style={{ width: 8, height: 8, background: '#B3261E', flex: 'none' }} /><span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, overflowWrap: 'anywhere' }}>{x.title}</span><span style={{ fontSize: 12, color: n <= 7 ? '#B3261E' : MUT, fontWeight: 600, textAlign: 'right', flex: 'none' }}>{n < 0 ? 'Overdue' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n + ' days'}<span style={{ display: 'block', fontWeight: 400, color: MUT }}>{nice(x.date)} {x.startTime}</span></span><button data-deadline-del aria-label={`Remove ${x.title}`} onClick={() => onRemoveDeadline && onRemoveDeadline(x.id)} style={{ background: 'none', border: 0, padding: 6, fontSize: 18, color: MUT, borderRadius: 0 }}>&times;</button></div>; })}
        <label style={{ ...labStyle, marginTop: 14 }}>What is due<input data-deadline-title type="text" placeholder="e.g. Fluids report" aria-label="Deadline" value={t} onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} style={fieldStyle} /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
          <label style={{ ...labStyle, marginTop: 10 }}>Date<input data-deadline-date type="date" aria-label="Due date" value={dt} onChange={e => setDt(e.target.value)} style={fieldStyle} /></label>
          <label style={{ ...labStyle, marginTop: 10 }}>Time<input data-deadline-time type="time" aria-label="Due time" value={tm} onChange={e => setTm(e.target.value)} style={fieldStyle} /></label>
        </div>
        <button data-deadline-add onClick={add} disabled={!t.trim()} style={{ marginTop: 12, width: '100%', height: 46, border: 0, borderRadius: 0, background: FOR, color: BG, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: t.trim() ? 1 : .4 }}>Add to my schedule</button>
      </div>}
    </div>
  );
}

// ---------- Rota (Schedule) ----------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = { off: { l: 'Day off', s: '', e: '' }, early: { l: 'Early', s: '06:00', e: '14:00' }, day: { l: 'Day', s: '09:00', e: '17:00' }, late: { l: 'Late', s: '14:00', e: '22:00' }, night: { l: 'Night', s: '22:00', e: '23:59' }, custom: { l: 'My own', s: '09:00', e: '17:00' } };
export const rotaFree = (sh) => {
  const lo = 8 * 60, hi = 22 * 60; if (!sh || sh.k === 'off') return [[lo, hi]];
  const s = toM(sh.s), e = toM(sh.e); const out = [];
  if (s - lo >= 60) out.push([lo, Math.min(s, hi)]); if (hi - e >= 60 && e < hi) out.push([Math.max(e, lo), hi]); return out;
};
// Shifts become schedule entries on their own: one entry per day that has a shift, for every week you have set
export const rotaEvents = (profile) => {
  const out = []; const R = (profile && profile.rota) || {};
  Object.keys(R).forEach(wk => DAYS.forEach((d, i) => {
    const sh = R[wk] && R[wk][d]; if (!sh || sh.k === 'off' || !sh.s || !sh.e) return;
    const date = addDays(wk, i); const e = toM(sh.e) <= toM(sh.s) ? '23:59' : sh.e;
    out.push({ id: `rota_${date}`, date, start: sh.s, end: e, title: `${(SHIFTS[sh.k] || SHIFTS.custom).l} shift`, allDay: false, source: 'rota' });
  }));
  return out;
};
export function RotaPanel({ profile, patch }) {
  const [open, setOpen] = useState(false); const [off, setOff] = useState(0); const [edit, setEdit] = useState('');
  const wk = addDays(weekStart(), off * 7); const R = (profile.rota && profile.rota[wk]) || {};
  const setDay = (d, k, o = {}) => patch({ rota: { ...(profile.rota || {}), [wk]: { ...R, [d]: { ...(R[d] || {}), k, s: SHIFTS[k].s, e: SHIFTS[k].e, ...o } } } });
  const setTime = (d, key, v) => { if (!v) return; const cur = R[d] || { k: 'custom', s: '09:00', e: '17:00' }; patch({ rota: { ...(profile.rota || {}), [wk]: { ...R, [d]: { ...cur, k: 'custom', [key]: v } } } }); };
  const prevWk = addDays(wk, -7); const hasPrev = profile.rota && profile.rota[prevWk];
  const setCount = DAYS.filter(d => R[d]).length;
  const sc = (m) => Math.max(0, Math.min(100, (m / 60 - 6) / 18 * 100));
  const fm = (m) => pad(Math.floor(m / 60));
  const wkLabel = `${nice(wk).replace(/^\w+ /, '')} to ${nice(addDays(wk, 6)).replace(/^\w+ /, '')}`;
  const fld = { height: 44, border: `1.5px solid ${INK}`, background: '#FAF4E0', padding: '0 10px', fontSize: 16, color: INK, borderRadius: 0, boxSizing: 'border-box', width: '100%', minWidth: 0, marginTop: 5 };
  const lab = { display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT };
  return (
    <div data-rota-panel style={{ border: `1.5px solid ${INK}`, background: 'rgba(250,248,242,.85)' }}>
      <button data-rota-toggle aria-expanded={open} onClick={() => setOpen(o => !o)} className="w-full text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'none', border: 0, borderRadius: 0 }}>
        <span><span className="font-fr" style={{ display: 'block', fontWeight: 600, fontSize: 22, lineHeight: 1.05 }}>Your rota, your free time.</span>
          <span style={{ display: 'block', fontSize: 13, color: MUT, marginTop: 4, lineHeight: 1.35 }}>Set your shifts for any week, with your own times. They appear in your schedule on their own.</span></span>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: MUT, flex: 'none' }}>{open ? 'Hide \u25B4' : 'Open \u25BE'}</span>
      </button>
      {open && <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${RULE}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <button data-rota-prev aria-label="Previous week" onClick={() => setOff(o => o - 1)} style={{ width: 40, height: 40, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', fontSize: 18 }}>&lsaquo;</button>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT }}>{off === 0 ? 'This week' : off === 1 ? 'Next week' : 'Week of'}</div><div data-rota-week className="font-fr" style={{ fontWeight: 600, fontSize: 18 }}>{wkLabel}</div></div>
          <button data-rota-next aria-label="Next week" onClick={() => setOff(o => o + 1)} style={{ width: 40, height: 40, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', fontSize: 18 }}>&rsaquo;</button>
        </div>
        <div style={{ marginTop: 10 }}>
          {DAYS.map((d, i) => { const sh = R[d]; const fr = rotaFree(sh); const isOpen = edit === d; return (
            <div key={d} data-rota-day={d} style={{ padding: '8px 0', borderBottom: `1px solid ${RULE}` }}>
              <button data-rota-row={d} aria-expanded={isOpen} onClick={() => setEdit(isOpen ? '' : d)} className="w-full text-left" style={{ display: 'grid', gridTemplateColumns: '58px 1fr auto', gap: 8, alignItems: 'center', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
                <span><span style={{ display: 'block', fontSize: 10, letterSpacing: '.12em', color: MUT, fontWeight: 700 }}>{d.toUpperCase()}</span><span className="font-fr" style={{ fontWeight: 600, fontSize: 17 }}>{addDays(wk, i).slice(8).replace(/^0/, '')}</span></span>
                <span><span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{sh ? (sh.k === 'off' ? 'Day off' : `${(SHIFTS[sh.k] || SHIFTS.custom).l} ${sh.s}\u2013${sh.e}`) : 'Not set'}</span>
                  <span style={{ display: 'block', fontSize: 12, color: CLAY }}>{sh ? (fr.length ? 'Free ' + fr.map(([a, b2]) => `${fm(a)}\u2013${fm(b2)}`).join(', ') : 'No free time') : 'Tap to set'}</span></span>
                <span style={{ color: MUT, fontSize: 14 }}>{isOpen ? '\u25B4' : '\u25BE'}</span>
              </button>
              <div style={{ position: 'relative', height: 10, background: RULE, marginTop: 6 }}>
                {sh && sh.k !== 'off' && <div style={{ position: 'absolute', left: sc(toM(sh.s)) + '%', width: Math.max(0, sc(toM(sh.e)) - sc(toM(sh.s))) + '%', top: 0, bottom: 0, background: FOR }} />}
              </div>
              {isOpen && <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{Object.keys(SHIFTS).map(k => <Chip key={k} data-rota-set={`${d}:${k}`} on={sh && sh.k === k} onClick={() => setDay(d, k)}>{SHIFTS[k].l}</Chip>)}</div>
                {sh && sh.k !== 'off' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <label style={lab}>Starts<input data-rota-start type="time" aria-label={`${d} shift start`} value={sh.s} onChange={e => setTime(d, 's', e.target.value)} style={fld} /></label>
                  <label style={lab}>Ends<input data-rota-end type="time" aria-label={`${d} shift end`} value={sh.e} onChange={e => setTime(d, 'e', e.target.value)} style={fld} /></label>
                </div>}
                {sh && sh.k !== 'off' && toM(sh.e) <= toM(sh.s) && <div style={{ fontSize: 12, color: MUT, marginTop: 6 }}>Ends after midnight: your schedule shows it until 23:59.</div>}
              </div>}
            </div>); })}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {hasPrev && <Btn data-rota-copy solid={false} h={40} onClick={() => patch({ rota: { ...(profile.rota || {}), [wk]: { ...profile.rota[prevWk] } } })}>Copy the week before</Btn>}
          <span style={{ fontSize: 13, color: MUT }}>{setCount ? `${setCount} of 7 days set. These are in your schedule.` : 'Tap a day to set your shift.'}</span>
        </div>
      </div>}
    </div>
  );
}

// ---------- Budget (Ideas) ----------
export const priceNum = (p) => { const s = String(p == null ? '' : p).toLowerCase(); if (!s || s.includes('free')) return 0; const m = s.match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : null; };
export const budgetLeft = (profile) => { const B = profile.budget || {}; const wk = weekStart(); return (Number(B.weekly) || 35) - (B.spend || []).filter(s => s.d >= wk).reduce((a, s) => a + Number(s.amt || 0), 0); };
export const budgetPass = (item, f, left) => { f = f || {}; if (!f.free && !f.under5 && !f.under10 && !f.under20 && !f.fits) return true; const n = priceNum(item.price); if (f.free && n !== 0) return false; if (f.under5 && !(n !== null && n < 5)) return false; if (f.under10 && !(n !== null && n < 10)) return false; if (f.under20 && !(n !== null && n < 20)) return false; if (f.fits && !(n !== null && n <= left)) return false; return true; };
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

// ---------- Caring for someone (Home) ----------
export function CarePanel({ profile, patch, today, tasks, onPlanForMe, onPlanAppt, pactFriends, onPlanForThem }) {
  const C = profile.care || { name: '', items: [], done: {}, notes: [] };
  const meds = C.meds || []; const contacts = C.contacts || []; const link = C.link || null;
  const [md, setMd] = useState({ name: '', dose: '', time: '', refill: '' }); const [ct, setCt] = useState({ name: '', role: '', phone: '' }); const [pf, setPf] = useState({ title: '', date: today, start: '10:00', end: '11:00' }); const [pickOpen, setPickOpen] = useState(false); const [pfOpen, setPfOpen] = useState(false); const [pfBusy, setPfBusy] = useState(false);
  const items = C.items || []; const doneToday = (C.done || {})[today] || []; const notes = C.notes || [];
  const [nm, setNm] = useState(''); const [it, setIt] = useState(''); const [tm, setTm] = useState(''); const [nt, setNt] = useState(''); const [open, setOpen] = useState(true);
  const save = (o) => patch({ care: { name: '', items: [], done: {}, notes: [], meds: [], contacts: [], link: null, ...C, ...o } });
  const tick = (id) => save({ done: { [today]: doneToday.includes(id) ? doneToday.filter(x => x !== id) : [...doneToday, id] } });
  const addItem = (title, time) => { if (!title.trim()) return; save({ items: [...items, { id: uid(), title: title.trim(), time: time || '' }].sort((a, b) => String(a.time || '99').localeCompare(String(b.time || '99'))) }); setIt(''); setTm(''); };
  const addNote = () => { if (!nt.trim()) return; save({ notes: [{ id: uid(), d: today, text: nt.trim() }, ...notes].slice(0, 30) }); setNt(''); };
  const who = C.name || 'someone';
  const appt = (tasks || []).filter(t => t.date >= today && t.status !== 'done' && /doctor|dentist|hospital|clinic|appointment|surgery|checkup|optician|nurse|physio|gp\b/i.test(t.title)).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  const dayItems = [...items, ...meds.filter(m => m.time).map(m => ({ id: 'med-' + m.id, title: `${m.name}${m.dose ? ' ' + m.dose : ''}`, time: m.time, med: true }))].sort((a, b) => String(a.time || '99').localeCompare(String(b.time || '99')));
  const left = dayItems.filter(x => !doneToday.includes(x.id)).length;
  const daysTo = (d) => Math.round((new Date(d + 'T12:00:00') - new Date(today + 'T12:00:00')) / 864e5);
  const addMed = () => { if (!md.name.trim()) return; save({ meds: [...meds, { id: uid(), name: md.name.trim(), dose: md.dose.trim(), time: md.time, refill: md.refill }] }); setMd({ name: '', dose: '', time: '', refill: '' }); };
  const addContact = () => { if (!ct.name.trim()) return; save({ contacts: [...contacts, { id: uid(), name: ct.name.trim(), role: ct.role.trim(), phone: ct.phone.replace(/[^\d+]/g, '') }] }); setCt({ name: '', role: '', phone: '' }); };
  const kick = { fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT };
  const ghost = { width: '100%', height: 44, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', color: INK, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' };
  const fld = { width: '100%', boxSizing: 'border-box', border: `1.5px solid ${INK}`, background: '#FAF4E0', padding: '0 10px', fontSize: 16, color: INK, borderRadius: 0, height: 44, minWidth: 0 };
  const lab = { display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT };
  const SUGG = [['Morning tablets', '08:00'], ['Lunch', '12:30'], ['Evening call', '19:00'], ['Bedtime check', '21:30']].filter(([t]) => !items.some(x => x.title === t));
  return (
    <div data-care-panel style={{ order: -6, border: `1.5px solid ${INK}`, background: 'rgba(250,248,242,.85)' }}>
      <button data-care-toggle aria-expanded={open} onClick={() => setOpen(o => !o)} className="w-full text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'none', border: 0, borderRadius: 0 }}>
        <span><span style={{ display: 'inline-block', background: INK, color: BG, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 10px', fontWeight: 600 }}>Care</span>
          <span className="font-fr" style={{ display: 'block', fontWeight: 600, fontSize: 22, lineHeight: 1.05, marginTop: 8 }}>{C.name ? `Looking after ${C.name}` : 'Looking after someone'}</span>
          {C.name && items.length > 0 && <span style={{ display: 'block', fontSize: 13, color: MUT, marginTop: 3 }}>{left === 0 ? 'Everything done today.' : `${left} still to do today.`}</span>}</span>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: MUT, flex: 'none' }}>{open ? 'Hide \u25B4' : 'Open \u25BE'}</span>
      </button>
      {open && <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${RULE}` }}>
        {!C.name ? <div style={{ marginTop: 12 }}>
          <label style={lab}>Who are you caring for?<input data-care-name type="text" aria-label="Who are you caring for" placeholder="Their first name" value={nm} onChange={e => setNm(e.target.value)} style={{ ...fld, marginTop: 5 }} /></label>
          <button data-care-save onClick={() => nm.trim() && save({ name: nm.trim() })} disabled={!nm.trim()} style={{ marginTop: 10, width: '100%', height: 46, border: 0, borderRadius: 0, background: FOR, color: BG, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: nm.trim() ? 1 : .4 }}>Save</button>
        </div> : <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT }}><span>{who}&rsquo;s day</span><button data-care-rename onClick={() => save({ name: '' })} style={{ background: 'none', border: 0, padding: 0, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT, textDecoration: 'underline' }}>Change name</button></div>
          <div style={{ borderTop: `3px solid ${INK}`, marginTop: 6 }} />
          {dayItems.length === 0 && <div style={{ fontSize: 13, color: MUT, padding: '10px 0' }}>Add the things that happen every day. They reset each morning.</div>}
          {dayItems.map(x => { const d = doneToday.includes(x.id); return (
            <div key={x.id} data-care-item style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${RULE}` }}>
              <button data-care-tick={x.id} aria-pressed={d} aria-label={`${d ? 'Untick' : 'Tick'} ${x.title}`} onClick={() => tick(x.id)} style={{ width: 28, height: 28, flex: 'none', borderRadius: '50%', border: `1.75px solid ${d ? FOR : INK}`, background: d ? FOR : 'transparent', color: BG, padding: 0, fontSize: 14 }}>{d ? '\u2713' : ''}</button>
              <span style={{ flex: 1, minWidth: 0, fontSize: 16, textDecoration: d ? 'line-through' : 'none', color: d ? SOFT : INK, overflowWrap: 'anywhere' }}>{x.title}</span>
              {x.time && <span style={{ fontSize: 12, color: MUT }}>{x.time}</span>}
              {!x.med && <button data-care-del aria-label={`Remove ${x.title}`} onClick={() => save({ items: items.filter(y => y.id !== x.id) })} style={{ background: 'none', border: 0, padding: 6, fontSize: 18, color: MUT, borderRadius: 0 }}>&times;</button>}
            </div>); })}
          {SUGG.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>{SUGG.map(([t, tmv]) => <Chip key={t} data-care-sugg={t} onClick={() => addItem(t, tmv)}>+ {t}</Chip>)}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8, marginTop: 10 }}>
            <label style={lab}>Add to the day<input data-care-new type="text" aria-label="Add to the day" placeholder="e.g. Physio exercises" value={it} onChange={e => setIt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(it, tm); }} style={{ ...fld, marginTop: 5 }} /></label>
            <label style={lab}>Time<input data-care-time type="time" aria-label="Time" value={tm} onChange={e => setTm(e.target.value)} style={{ ...fld, marginTop: 5 }} /></label>
          </div>
          <button data-care-add onClick={() => addItem(it, tm)} disabled={!it.trim()} style={{ marginTop: 8, width: '100%', height: 44, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', color: INK, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: it.trim() ? 1 : .4 }}>Add</button>
          <div data-care-link style={{ marginTop: 14, borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
            <div style={kick}>{who} on The Pact</div>
            {link ? <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
                <span data-care-linked className="font-fr" style={{ fontWeight: 600, fontSize: 18 }}>Linked to {link.name}</span>
                <button data-care-unlink onClick={() => { save({ link: null }); setPfOpen(false); }} style={{ background: 'none', border: 0, padding: 0, fontSize: 12, textDecoration: 'underline', color: MUT }}>Unlink</button>
              </div>
              <button data-care-plan-them aria-expanded={pfOpen} onClick={() => setPfOpen(o => !o)} style={{ ...ghost, marginTop: 8 }}>Plan something for {link.name}</button>
              {pfOpen && <div data-care-plan-form style={{ marginTop: 8 }}>
                <input data-care-pf-title type="text" aria-label="What is it" placeholder="e.g. Doctor's appointment, lunch together" value={pf.title} onChange={e => setPf({ ...pf, title: e.target.value })} style={fld} />
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                  <input data-care-pf-date type="date" aria-label="Date" value={pf.date} onChange={e => setPf({ ...pf, date: e.target.value })} style={fld} />
                  <input data-care-pf-start type="time" aria-label="Start" value={pf.start} onChange={e => setPf({ ...pf, start: e.target.value })} style={fld} />
                  <input data-care-pf-end type="time" aria-label="End" value={pf.end} onChange={e => setPf({ ...pf, end: e.target.value })} style={fld} />
                </div>
                <button data-care-pf-send disabled={!pf.title.trim() || pfBusy} onClick={async () => { setPfBusy(true); const ok = await onPlanForThem({ ...pf, title: pf.title.trim() }, link); setPfBusy(false); if (ok) { setPf({ title: '', date: today, start: '10:00', end: '11:00' }); setPfOpen(false); } }} style={{ marginTop: 8, width: '100%', height: 46, border: 0, borderRadius: 0, background: FOR, color: BG, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: pf.title.trim() && !pfBusy ? 1 : .4 }}>{pfBusy ? 'Sending' : `Add to both schedules`}</button>
                <div style={{ fontSize: 12, color: MUT, marginTop: 6 }}>It goes in your schedule now. {link.name} gets an invite on The Pact to accept.</div>
              </div>}
            </> : <>
              <div style={{ fontSize: 13, color: MUT, marginTop: 4 }}>If {who} has The Pact, link them to plan things for them.</div>
              {(pactFriends || []).length === 0 ? <div style={{ fontSize: 12, color: MUT, marginTop: 6 }}>Add them as a friend first (Social tab), then link them here.</div> : <>
                <button data-care-link-open aria-expanded={pickOpen} onClick={() => setPickOpen(o => !o)} style={{ ...ghost, marginTop: 8 }}>Link a Pact friend</button>
                {pickOpen && <div style={{ border: `1.5px solid ${INK}`, marginTop: 6 }}>{pactFriends.map((f, i) => <button key={f.userId} data-care-link-pick={f.userId} onClick={() => { save({ link: { userId: f.userId, name: f.name } }); setPickOpen(false); }} className="w-full text-left" style={{ display: 'block', padding: '11px 12px', fontSize: 15, background: 'none', border: 0, borderTop: i ? `1px solid ${RULE}` : 0, borderRadius: 0 }}>{f.name}</button>)}</div>}
              </>}
            </>}
          </div>
          <div data-care-meds style={{ marginTop: 14, borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
            <div style={kick}>Medicines</div>
            <div style={{ borderTop: `3px solid ${INK}`, marginTop: 6 }} />
            {meds.length === 0 && <div style={{ fontSize: 13, color: MUT, padding: '10px 0' }}>Add each medicine with its dose and time. Ones with a time join the daily list above.</div>}
            {meds.map(m => { const dl = m.refill ? daysTo(m.refill) : null; const soon = dl !== null && dl <= 7; return (
              <div key={m.id} data-care-med style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${RULE}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, overflowWrap: 'anywhere' }}>{m.name}{m.dose ? <span style={{ color: MUT }}> &middot; {m.dose}</span> : null}</div>
                  <div style={{ fontSize: 12, color: MUT }}>{m.time ? `Daily at ${m.time}` : 'As needed'}{m.refill ? <span data-care-refill style={{ color: soon ? CLAY : MUT, fontWeight: soon ? 700 : 400 }}> &middot; {dl < 0 ? 'Refill overdue' : dl === 0 ? 'Refill today' : soon ? `Refill in ${dl} day${dl === 1 ? '' : 's'}` : `Refill by ${nice(m.refill)}`}</span> : null}</div>
                </div>
                <button data-care-med-del aria-label={`Remove ${m.name}`} onClick={() => save({ meds: meds.filter(y => y.id !== m.id) })} style={{ background: 'none', border: 0, padding: 6, fontSize: 18, color: MUT, borderRadius: 0 }}>&times;</button>
              </div>); })}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 8, marginTop: 10 }}>
              <label style={lab}>Medicine<input data-care-med-name type="text" aria-label="Medicine name" placeholder="e.g. Metformin" value={md.name} onChange={e => setMd({ ...md, name: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
              <label style={lab}>Dose<input data-care-med-dose type="text" aria-label="Dose" placeholder="e.g. 500mg" value={md.dose} onChange={e => setMd({ ...md, dose: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
              <label style={lab}>Daily time<input data-care-med-time type="time" aria-label="Medicine time" value={md.time} onChange={e => setMd({ ...md, time: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
              <label style={lab}>Refill by<input data-care-med-refill type="date" aria-label="Refill by" value={md.refill} onChange={e => setMd({ ...md, refill: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
            </div>
            <button data-care-med-add onClick={addMed} disabled={!md.name.trim()} style={{ ...ghost, marginTop: 8, opacity: md.name.trim() ? 1 : .4 }}>Add medicine</button>
          </div>
          <div data-care-contacts style={{ marginTop: 14, borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
            <div style={kick}>Care contacts</div>
            <div style={{ borderTop: `3px solid ${INK}`, marginTop: 6 }} />
            {contacts.length === 0 && <div style={{ fontSize: 13, color: MUT, padding: '10px 0' }}>GP, pharmacy, carer, family. One tap to call.</div>}
            {contacts.map(c => (
              <div key={c.id} data-care-contact style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${RULE}` }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 16, overflowWrap: 'anywhere' }}>{c.name}</div>{(c.role || c.phone) && <div style={{ fontSize: 12, color: MUT }}>{[c.role, c.phone].filter(Boolean).join(' \u00B7 ')}</div>}</div>
                {c.phone && <a data-care-call href={`tel:${c.phone}`} style={{ height: 40, padding: '0 14px', display: 'inline-flex', alignItems: 'center', background: FOR, color: BG, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Call</a>}
                <button data-care-contact-del aria-label={`Remove ${c.name}`} onClick={() => save({ contacts: contacts.filter(y => y.id !== c.id) })} style={{ background: 'none', border: 0, padding: 6, fontSize: 18, color: MUT, borderRadius: 0 }}>&times;</button>
              </div>))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <label style={lab}>Name<input data-care-contact-name type="text" aria-label="Contact name" placeholder="e.g. Dr Patel" value={ct.name} onChange={e => setCt({ ...ct, name: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
              <label style={lab}>Who they are<input data-care-contact-role type="text" aria-label="Contact role" placeholder="e.g. GP" value={ct.role} onChange={e => setCt({ ...ct, role: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
            </div>
            <label style={{ ...lab, marginTop: 8 }}>Phone<input data-care-contact-phone type="tel" aria-label="Contact phone" placeholder="Number to call" value={ct.phone} onChange={e => setCt({ ...ct, phone: e.target.value })} style={{ ...fld, marginTop: 5 }} /></label>
            <button data-care-contact-add onClick={addContact} disabled={!ct.name.trim()} style={{ ...ghost, marginTop: 8, opacity: ct.name.trim() ? 1 : .4 }}>Add contact</button>
          </div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT }}>Next appointment</div>
            {appt ? <div data-care-appt className="font-fr" style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>{nice(appt.date)} {appt.startTime}<span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, color: MUT }}> &middot; {appt.title}</span></div>
              : <div style={{ fontSize: 13, color: MUT, marginTop: 4 }}>None in your schedule. <button data-care-plan-appt onClick={onPlanAppt} style={{ background: 'none', border: 0, padding: 0, fontSize: 13, textDecoration: 'underline', color: INK }}>Add one</button></div>}
          </div>
          <button data-care-me onClick={onPlanForMe} style={{ marginTop: 12, width: '100%', height: 46, border: 0, borderRadius: 0, background: FOR, color: BG, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Plan time for me</button>
          <div style={{ fontSize: 12, color: MUT, marginTop: 6 }}>Carers need a break too. Pick a slot that is only yours.</div>
          <div style={{ marginTop: 14, borderTop: `1px solid ${RULE}`, paddingTop: 10 }}>
            <label style={lab}>How was today?<textarea data-care-note rows={2} aria-label="Care note" placeholder={`A line about ${who}'s day, to look back on`} value={nt} onChange={e => setNt(e.target.value)} style={{ ...fld, height: 'auto', padding: 10, marginTop: 5, resize: 'vertical' }} /></label>
            <button data-care-note-add onClick={addNote} disabled={!nt.trim()} style={{ marginTop: 8, width: '100%', height: 44, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', color: INK, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: nt.trim() ? 1 : .4 }}>Save note</button>
            {notes.slice(0, 3).map(n => <div key={n.id} data-care-note-item style={{ padding: '8px 0', borderBottom: `1px solid ${RULE}`, fontSize: 14 }}><span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT }}>{nice(n.d)}</span><div style={{ marginTop: 2 }}>{n.text}</div></div>)}
          </div>
        </>}
      </div>}
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
