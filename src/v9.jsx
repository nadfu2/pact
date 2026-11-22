// v9: Log-style Home, pages counter, Development week strip, job hunt widget. Everything persists in existing state (userProfile / reading / water).
import React, { useState } from 'react';
import { Sheet, Input, Lab, Kick, FR, INK, MUT, CLAY, FOR, RULE, BG, SOFT, uid, nice, dstr, addDays, JobHunt } from './groups.jsx';

const btn = (fill) => ({ height: 44, width: '100%', border: fill ? 0 : `1.5px solid ${INK}`, background: fill ? FOR : 'transparent', color: fill ? BG : INK, fontSize: 13, fontWeight: 600, borderRadius: 0 });
const Seg = ({ opts, on, set, attr }) => (
  <div style={{ display: 'flex', border: `1.5px solid ${INK}` }}>
    {opts.map(([k, l], i) => <button key={k} {...(attr ? { [attr]: k } : {})} aria-pressed={on === k} onClick={() => set(k)} style={{ flex: 1, padding: '8px 2px', fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: on === k ? 700 : 500, background: on === k ? INK : 'transparent', color: on === k ? BG : MUT, borderRadius: 0, borderLeft: i ? `1px solid ${INK}` : 0 }}>{l}</button>)}
  </div>);
const Ring = ({ p, size = 36, sw = 5, col = CLAY, track = RULE, txt, tc = INK }) => {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={`${c * Math.max(0, Math.min(1, p))} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} /></svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...FR, fontWeight: 600, fontSize: Math.round(size * 0.3), color: tc }}>{txt}</div>
    </div>);
};
const Ico = ({ d }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />;
const ICO = {
  energy: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  pages: '<path d="M4 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
  note: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
};

// ---------- Layout choices ----------
export const HOME_STYLES = [['log', 'Log']];
export const homeStyleOf = (p) => 'log';   // Minimal and Classic were retired; Log is the only layout
export const LOG_BUTTONS = [['water', 'Water'], ['energy', 'Energy'], ['pages', 'Pages'], ['note', 'Note']];
export const logButtonsOf = (p) => (p && Array.isArray(p.logButtons) ? p.logButtons : ['water', 'energy', 'pages', 'note']);
export const LOG_HIDES = ['targets', 'launchpad', 'hydration', 'reading', 'notes', 'feedback', 'mood'];

const Thumb = ({ id, on, label, set }) => {
  const bar = (w, h, c = RULE) => <div style={{ height: h, width: w, background: c }} />;
  const wire = id === 'log'
    ? <><div style={{ height: 22, background: INK, opacity: .85 }} /><div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>{[0, 1, 2, 3].map(i => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${INK}`, background: i === 0 ? CLAY : 'transparent' }} />)}</div>{bar('100%', 5)}</>
    : id === 'minimal'
      ? <><div style={{ height: 22, background: INK, opacity: .85 }} /><div style={{ display: 'flex', gap: 3 }}>{bar('32%', 12, CLAY)}{bar('32%', 12)}{bar('32%', 12)}</div></>
      : <><div style={{ height: 22, background: INK, opacity: .85 }} />{bar('100%', 9)}{bar('100%', 9)}</>;
  return (
    <button data-layout-pick={id} aria-pressed={on} onClick={() => set(id)} style={{ flex: 1, textAlign: 'center', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
      <div style={{ height: 64, border: on ? `2.5px solid ${CLAY}` : `1.5px solid ${INK}`, padding: 5, background: '#FAF8F2', display: 'flex', flexDirection: 'column', gap: 3 }}>{wire}</div>
      <div style={{ fontSize: 10, marginTop: 5, color: on ? CLAY : MUT, fontWeight: on ? 700 : 400 }}>{label}</div>
    </button>);
};
export function LayoutPicker({ profile, patch, jobsOn, openFeedback }) {
  const cur = homeStyleOf(profile), btns = logButtonsOf(profile);
  const toggleBtn = (k) => patch({ logButtons: btns.includes(k) ? btns.filter(x => x !== k) : LOG_BUTTONS.map(([x]) => x).filter(x => btns.includes(x) || x === k) });
  return (
    <div data-layout-picker style={{ paddingTop: 8 }}>
      {cur === 'log' && <div style={{ marginTop: 4 }}>
        <Lab>Quick log buttons</Lab>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>{LOG_BUTTONS.map(([k, l]) => <button key={k} data-log-toggle={k} aria-pressed={btns.includes(k)} onClick={() => toggleBtn(k)} style={{ fontSize: 11, padding: '5px 10px', border: `1.5px solid ${INK}`, background: btns.includes(k) ? INK : 'transparent', color: btns.includes(k) ? BG : MUT, borderRadius: 0 }}>{l}</button>)}</div>
      </div>}
      {jobsOn !== null && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: `1px solid ${RULE}` }}><span style={{ fontSize: 13 }}>Job hunt on Home</span>
        <button data-job-widget-toggle aria-pressed={jobsOn} onClick={() => patch({ jobWidget: !jobsOn })} style={{ width: 40, height: 22, border: `1.5px solid ${INK}`, background: jobsOn ? FOR : 'transparent', position: 'relative', borderRadius: 0 }}><span style={{ position: 'absolute', top: 2, [jobsOn ? 'right' : 'left']: 2, width: 15, height: 15, background: jobsOn ? BG : INK }} /></button></div>}
      {openFeedback && <button data-feedback-link onClick={openFeedback} style={{ marginTop: 10, fontSize: 11, textDecoration: 'underline', color: MUT, background: 'none', border: 0, padding: 0 }}>Send feedback or report a bug</button>}
    </div>);
}

// ---------- Pages sheet ----------
function PagesSheet({ reading, setReading, today, onClose }) {
  const [mode, setMode] = useState('add'); const [n, setN] = useState('');
  const [title, setTitle] = useState(reading.title || ''); const [total, setTotal] = useState(String(reading.total || ''));
  const num = Math.max(0, Math.floor(Number(n) || 0));
  const tot = Math.max(0, Math.floor(Number(total) || 0));
  const cur = reading.page || 0;
  const target = mode === 'add' ? cur + num : num;
  const capped = tot > 0 ? Math.min(target, tot) : target;
  const gained = Math.max(0, capped - cur);
  const pct = tot > 0 ? Math.min(100, Math.round(cur / tot * 100)) : 0;
  const todayPages = (reading.log || {})[today] || 0;
  const save = () => {
    if (!num && !(mode === 'page' && n !== '')) return;
    const next = { ...reading, title: title.trim(), total: tot || reading.total || 300, page: capped, log: { ...(reading.log || {}), [today]: todayPages + gained } };
    setReading(next); onClose();
  };
  return (
    <Sheet title="Pages read" onClose={onClose} dataAttr={{ 'data-pages-sheet': true }}>
      {reading.title || title ? <div style={{ marginTop: 6, fontSize: 12.5, color: MUT }}>{title || reading.title} &middot; p.{cur}{tot ? ` of ${tot}` : ''}</div> : null}
      {tot > 0 && <div style={{ marginTop: 6, height: 5, background: RULE }}><div style={{ width: pct + '%', height: 5, background: FOR }} /></div>}
      {!reading.title && <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 90px', gap: 12 }}>
        <div><Lab>Book (optional)</Lab><Input data-pages-title value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you reading?" /></div>
        <div><Lab>Total pages</Lab><Input data-pages-total type="text" inputMode="numeric" value={total} onChange={e => setTotal(e.target.value.replace(/\D/g, '').slice(0, 5))} /></div>
      </div>}
      <div style={{ marginTop: 14 }}><Lab>{mode === 'add' ? 'Type a number' : 'The page I’m on'}</Lab>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <input data-pages-input type="text" inputMode="numeric" pattern="[0-9]*" autoFocus value={n} onChange={e => setN(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="24" aria-label="Number of pages" style={{ ...FR, fontWeight: 600, fontSize: 44, width: '100%', background: 'transparent', border: 0, borderBottom: `2.5px solid ${CLAY}`, outline: 'none', padding: '2px 0', color: INK, borderRadius: 0 }} />
          <span style={{ fontSize: 13, color: MUT, paddingBottom: 8 }}>{mode === 'add' ? 'pages' : ''}</span>
        </div></div>
      {mode === 'add' && <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>{[5, 10, 20, 50].map(v => <button key={v} data-pages-chip={v} onClick={() => setN(String(num + v))} style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent' }}>+{v}</button>)}</div>}
      <div style={{ marginTop: 12 }}><Seg opts={[['add', 'Add to today'], ['page', 'I’m on page…']]} on={mode} set={setMode} attr="data-pages-mode" /></div>
      <div data-pages-preview style={{ marginTop: 10, fontSize: 12, color: MUT }}>{(mode === 'add' ? num > 0 : n !== '') ? <>p.{cur}{mode === 'add' ? ` + ${num}` : ''} = <b style={{ color: INK }}>p.{capped}</b> &middot; {todayPages + gained} page{todayPages + gained === 1 ? '' : 's'} today</> : <>{todayPages} page{todayPages === 1 ? '' : 's'} today so far</>}</div>
      <div style={{ marginTop: 14 }}><button data-pages-save onClick={save} style={btn(true)}>Save pages</button></div>
    </Sheet>);
}

function EnergySheet({ level, set, onClose }) {
  const B = ({ id, label, n }) => <button data-log-energy={id} aria-pressed={level === id} onClick={() => { set(id); onClose(); }} style={{ flex: 1, padding: '12px 4px 10px', textAlign: 'center', borderRadius: 0, border: `1.5px solid ${INK}`, background: level === id ? INK : 'transparent', color: level === id ? BG : INK }}>
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 18, border: `1px solid ${level === id ? CLAY : INK}`, background: i < n ? (level === id ? CLAY : INK) : 'transparent' }} />)}</div>
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 7 }}>{label}</div></button>;
  return <Sheet title="How's your battery?" onClose={onClose} dataAttr={{ 'data-energy-sheet': true }}><div style={{ display: 'flex', gap: 8, marginTop: 14 }}><B id="low" label="Low" n={1} /><B id="steady" label="Steady" n={2} /><B id="high" label="High" n={3} /></div><div style={{ fontSize: 11.5, color: MUT, marginTop: 10 }}>A low day gets a gentler plan. Nothing is lost.</div></Sheet>;
}
function NoteSheet({ notes, setNotes, onClose }) {
  return <Sheet title="Quick note" onClose={onClose} dataAttr={{ 'data-note-sheet': true }}><textarea data-note-input autoFocus rows={7} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Jot something down. It saves automatically." aria-label="Quick note" style={{ marginTop: 12, width: '100%', background: '#FAF8F2', border: `1.5px solid ${INK}`, padding: 10, fontSize: 14, outline: 'none', borderRadius: 0 }} /><div style={{ marginTop: 12 }}><button onClick={onClose} style={btn(true)}>Done</button></div></Sheet>;
}


function GoalsSheet({ targets, setTargets, onClose }) {
  const [name, setName] = useState(''); const [times, setTimes] = useState(3);
  const addGoal = () => { if (!name.trim()) return; setTargets([...targets, { id: `wt_${Date.now()}`, title: name.trim(), current: 0, target: times, unit: 'sessions', category: 'leisure' }]); setName(''); };
  const dropGoal = (id) => setTargets(targets.filter(t => t.id !== id));
  const bump = (id, d) => setTargets(targets.map(t => t.id === id ? { ...t, current: Math.max(0, Number(t.current || 0) + d) } : t));
  return (
    <Sheet title="Weekly goals" onClose={onClose} dataAttr={{ 'data-goals-sheet': true }}>
      <div style={{ marginTop: 6 }}>
        {targets.length === 0 && <div style={{ padding: '14px 0', fontSize: 13, color: MUT }}>No goals yet. Add your first one below.</div>}
        {targets.map(t => { const p = Number(t.target) ? Number(t.current) / Number(t.target) : 0; const done = p >= 1; return (
          <div key={t.id} data-goal-row style={{ padding: '10px 0', borderTop: `1px solid ${RULE}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 13.5 }}><span style={{ flex: 1 }}>{t.title}</span><span style={{ fontWeight: 600, color: done ? FOR : CLAY }}>{t.current} of {t.target}</span>
              <button aria-label={`Add one to ${t.title}`} data-goal-plus onClick={() => bump(t.id, 1)} style={{ width: 28, height: 28, border: `1.5px solid ${INK}`, fontWeight: 700, borderRadius: 0, background: 'transparent' }}>+</button>
              <button aria-label={`Remove ${t.title}`} data-goal-remove onClick={() => dropGoal(t.id)} style={{ width: 28, height: 28, color: MUT, fontSize: 16, background: 'none', border: 0 }}>&times;</button></div>
            <div style={{ height: 5, background: RULE, marginTop: 6 }}><div style={{ width: Math.min(100, p * 100) + '%', height: 5, background: done ? FOR : CLAY }} /></div>
          </div>); })}
      </div>
      <div data-goal-add style={{ marginTop: 14, paddingTop: 12, borderTop: `3px double ${INK}` }}>
        <Lab>Add a goal</Lab>
        <input data-goal-name value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Go for a run" aria-label="Goal name" style={{ marginTop: 7, width: '100%', background: '#FAF8F2', border: `1.5px solid ${INK}`, padding: '10px 10px', fontSize: 15, borderRadius: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 13, color: MUT }}>Times a week</span>
          <button aria-label="Fewer" onClick={() => setTimes(Math.max(1, times - 1))} style={{ width: 32, height: 32, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent' }}>&minus;</button>
          <b data-goal-times style={{ minWidth: 18, textAlign: 'center' }}>{times}</b>
          <button aria-label="More" onClick={() => setTimes(Math.min(21, times + 1))} style={{ width: 32, height: 32, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent' }}>+</button>
          <button data-goal-save onClick={addGoal} style={{ ...btn(true), marginLeft: 'auto', width: 'auto', padding: '0 18px', height: 36 }}>Add</button>
        </div>
      </div>
    </Sheet>);
}

// ---------- Log block (quick log + goals + job row + plan button) ----------
export function LogHome({ variant, profile, patch, today, water, setWater, waterGoal, reading, setReading, notes, setNotes, targets, setTargets, onPlan, jobSlot }) {
  const [sheet, setSheet] = useState(null);
  const goals = { done: targets.filter(t => Number(t.current) >= Number(t.target)).length, total: targets.length };
  const onGoals = () => setSheet('goals');
  const btns = logButtonsOf(profile);
  const wc = water.date === today ? water.count : 0;
  const lvl = (profile.energyLog || {})[today] || null;
  const pages = (reading.log || {})[today] || 0;
  const noteLines = String(notes || '').split('\n').filter(l => l.trim()).length;
  const LEV = { low: 'Low', steady: 'Steady', high: 'High' };
  const Q = ({ id, label, cap, onTap, hot, children, aria, last }) => (
    <button data-log-btn={id} aria-label={aria || label} onClick={onTap} style={{ flex: 1, minWidth: 0, textAlign: 'left', padding: '10px 10px 9px', background: hot ? 'rgba(200,100,60,.10)' : 'transparent', border: 0, borderRight: last ? 0 : `1px solid ${INK}`, borderRadius: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 24 }}>
        <span style={{ fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: hot ? CLAY : MUT, fontWeight: 700 }}>{label}</span>
        <span style={{ display: 'inline-flex', color: hot ? CLAY : INK }}>{children}</span>
      </div>
      <div data-log-cap={id} style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 17, marginTop: 4, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cap}</div>
    </button>);
  const lastK = LOG_BUTTONS.map(([k]) => k).filter(k => btns.includes(k)).pop();
  const gp = goals.total ? goals.done / goals.total : 0;
  const Box = ({ id, a, b, hot, onTap }) => <button data-min-box={id} onClick={onTap} style={{ flex: 1, textAlign: 'left', border: `1.5px solid ${hot ? CLAY : INK}`, padding: '8px 10px', background: hot ? 'rgba(200,100,60,.08)' : 'transparent', borderRadius: 0 }}><div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT }}>{a}</div><div style={{ ...FR, fontWeight: 600, fontSize: 17, marginTop: 3, color: hot ? CLAY : INK }}>{b}</div></button>;
  return (
    <div data-log-home={variant} style={{ order: -6 }}>
      {variant === 'log' ? (
        <>
          {btns.length > 0 && <div data-log-strip style={{ display: 'flex', borderTop: `3px double ${INK}`, borderBottom: `1px solid ${INK}`, background: 'rgba(250,244,224,.55)' }}>
            {btns.includes('water') && <Q id="water" last={lastK === 'water'} label="Water" cap={`${wc} of ${waterGoal}`} hot onTap={() => setWater({ date: today, count: Math.min(40, wc + 1) })} aria="Add a glass of water"><span style={{ fontSize: 22, lineHeight: 1 }}>+</span></Q>}
            {btns.includes('energy') && <Q id="energy" last={lastK === 'energy'} label="Energy" cap={lvl ? LEV[lvl] : 'Log'} onTap={() => setSheet('energy')}><Ico d={ICO.energy} /></Q>}
            {btns.includes('pages') && <Q id="pages" last={lastK === 'pages'} label="Pages" cap={reading.page ? `p.${reading.page}` : (pages ? `${pages} today` : 'Log')} onTap={() => setSheet('pages')}><Ico d={ICO.pages} /></Q>}
            {btns.includes('note') && <Q id="note" last={lastK === 'note'} label="Note" cap={noteLines ? `${noteLines} saved` : 'Jot'} onTap={() => setSheet('note')}><Ico d={ICO.note} /></Q>}
          </div>}
          {btns.includes('water') && wc > 0 && <div style={{ textAlign: 'left', marginTop: 4 }}><button data-water-undo onClick={() => setWater({ date: today, count: Math.max(0, wc - 1) })} style={{ fontSize: 10.5, color: MUT, textDecoration: 'underline', background: 'none', border: 0, padding: 0 }}>Undo a glass</button></div>}
        </>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <Box id="goals" a="Week" b={goals.total ? `${goals.done} of ${goals.total}` : 'No goals'} hot onTap={onGoals} />
          <Box id="water" a="Water" b={`${wc} of ${waterGoal}`} onTap={() => setWater({ date: today, count: Math.min(40, wc + 1) })} />
          <Box id="energy" a="Energy" b={lvl ? LEV[lvl] : 'Log'} onTap={() => setSheet('energy')} />
        </div>
      )}
      {variant === 'log' && goals.total > 0 && <button data-goals-strip onClick={onGoals} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 0, padding: 0, textAlign: 'left' }}>
        <Ring p={gp} txt={`${goals.done}/${goals.total}`} /><span style={{ flex: 1, fontSize: 12.5 }}><b>{goals.done} of {goals.total}</b> weekly goals done</span><span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'underline', fontWeight: 600 }}>See all</span></button>}
      {jobSlot}
      <button data-plan-something onClick={onPlan} style={{ ...btn(true), marginTop: 14 }}>+ Plan something</button>
      {sheet === 'pages' && <PagesSheet reading={reading} setReading={setReading} today={today} onClose={() => setSheet(null)} />}
      {sheet === 'energy' && <EnergySheet level={lvl} set={(v) => patch({ energyLog: { ...(profile.energyLog || {}), [today]: v } })} onClose={() => setSheet(null)} />}
      {sheet === 'goals' && <GoalsSheet targets={targets} setTargets={setTargets} onClose={() => setSheet(null)} />}
      {sheet === 'note' && <NoteSheet notes={notes} setNotes={setNotes} onClose={() => setSheet(null)} />}
    </div>);
}

// ---------- Job hunt widget ----------
export const STAGE_OPTS = [['Application', 'Applied'], ['Assessment', 'Assessment'], ['Interview', 'Interview'], ['Offer', 'Offer']];
export const OUTCOME_OPTS = [['Pending', 'Pending'], ['Rejected', 'Rejected'], ['Offer', 'Offer']];
// Old v8 entries only had `status`, so read both shapes.
export const normJob = (a) => {
  const st = a.status || 'applied';
  const applied = a.appliedFlag !== undefined ? !!a.appliedFlag : (st !== 'saved');
  const stage = a.stage || (st === 'interview' ? 'Interview' : st === 'offer' ? 'Offer' : 'Application');
  const outcome = a.outcome || (st === 'closed' ? 'Rejected' : st === 'offer' ? 'Offer' : 'Pending');
  return { ...a, applied: a.applied || '', appliedFlag: applied, stage, outcome, salary: a.salary || '', unit: a.unit || 'py', start: a.start || '', comments: a.comments || '' };
};
const statusOf = (a) => a.outcome === 'Rejected' || a.outcome === 'Withdrawn' ? 'closed' : (a.outcome === 'Offer' || a.stage === 'Offer') ? 'offer' : !a.appliedFlag ? 'saved' : a.stage === 'Interview' ? 'interview' : 'applied';
const payText = (a) => a.salary ? `£${Number(String(a.salary).replace(/,/g, '')).toLocaleString('en-GB')} ${a.unit === 'pcm' ? 'pcm' : 'py'}` : '';
const stageLabel = (a) => !a.appliedFlag ? 'To apply' : a.stage === 'Application' ? 'Application' : a.stage;
const Pill = ({ o }) => o === 'Rejected' ? <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 7px', background: CLAY, color: BG }}>Rejected</span>
  : o === 'Offer' ? <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 7px', background: FOR, color: BG }}>Offer</span>
  : o === 'Pending' ? <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 7px', border: `1.5px solid ${INK}` }}>Pending</span> : <span style={{ fontSize: 9, color: SOFT }}>&mdash;</span>;

const JOB_SCHEMA = { type: 'OBJECT', properties: { role: { type: 'STRING' }, company: { type: 'STRING' }, salaryAmount: { type: 'NUMBER' }, salaryPeriod: { type: 'STRING' }, startDate: { type: 'STRING' }, closingDate: { type: 'STRING' }, location: { type: 'STRING' } }, propertyOrdering: ['role', 'company', 'salaryAmount', 'salaryPeriod', 'startDate', 'closingDate', 'location'] };
export const parseJobJson = (text) => {
  let j = null; try { j = JSON.parse(String(text || '').replace(/^```(?:json)?|```$/gim, '').trim()); } catch (e) { j = null; }
  if (!j || typeof j !== 'object') return null;
  const s = (v) => (v == null ? '' : String(v).trim());
  const amt = Number(j.salaryAmount) > 0 ? Math.round(Number(j.salaryAmount)) : 0;
  const per = /month|pcm|pm/i.test(s(j.salaryPeriod)) ? 'pcm' : 'py';
  return { role: s(j.role), org: s(j.company), salary: amt ? String(amt) : '', unit: per, start: s(j.startDate), closing: s(j.closingDate), location: s(j.location) };
};

function RoleForm({ init, isNew, onSave, onDelete, onClose, ai }) {
  const [f, setF] = useState({ org: '', role: '', salary: '', unit: 'py', start: '', comments: '', appliedFlag: false, stage: 'Application', outcome: 'Pending', ...init });
  const [paste, setPaste] = useState(false); const [txt, setTxt] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const set = (o) => setF(p => ({ ...p, ...o }));
  const read = async () => {
    const t = txt.trim(); if (t.length < 30) { setMsg('Paste the whole advert, not just a line.'); return; }
    if (!ai) { setMsg('Smart reading isn’t available here. Type the details in instead.'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await ai(`Read this job advert and fill the fields. Use only what the advert says. Leave a field empty if it is not stated, and never guess. salaryAmount is a number in pounds (if a range, use the lower figure). salaryPeriod is "year" or "month". startDate is how the advert words it (e.g. "September 2027"). closingDate likewise.\n\nADVERT:\n${t.slice(0, 11000)}`, 'You extract structured details from UK job adverts. Reply with JSON only.', JOB_SCHEMA);
      const p = parseJobJson(r && r.text);
      if (!p || (!p.role && !p.org)) { setMsg('I couldn’t find a role or company in that. Try pasting more of it, or type it in.'); }
      else {
        set({ role: p.role || f.role, org: p.org || f.org, salary: p.salary || f.salary, unit: p.salary ? p.unit : f.unit, start: p.start || f.start, comments: p.closing ? (f.comments ? f.comments + '\n' : '') + `Closes ${p.closing}` : f.comments });
        setMsg('Filled in. Check it over, then save.'); setPaste(false);
      }
    } catch (e) { setMsg('I couldn’t read that just now. Type it in, or try again in a minute.'); }
    setBusy(false);
  };
  const can = f.org.trim() || f.role.trim();
  const L = ({ children }) => <div style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT, margin: '12px 0 5px' }}>{children}</div>;
  return (
    <Sheet title={isNew ? 'Add a role' : (f.org || 'Role')} onClose={onClose} dataAttr={{ 'data-role-form': isNew ? 'new' : 'edit' }}>
      {isNew && <div style={{ marginTop: 8 }}>
        <button data-job-paste-toggle onClick={() => setPaste(v => !v)} style={{ ...btn(false), height: 40 }}>{paste ? 'Type it in instead' : 'Paste a job advert'}</button>
        {paste && <div style={{ marginTop: 10 }}>
          <textarea data-job-paste value={txt} onChange={e => setTxt(e.target.value)} rows={6} placeholder="Paste the whole job description here" aria-label="Job description" style={{ width: '100%', background: '#FAF8F2', border: `1.5px solid ${INK}`, padding: 10, fontSize: 13, outline: 'none', borderRadius: 0 }} />
          <button data-job-read onClick={read} disabled={busy} style={{ ...btn(true), marginTop: 8, opacity: busy ? .6 : 1 }}>{busy ? 'Reading…' : 'Read it'}</button>
        </div>}
        {msg && <div data-job-paste-msg style={{ marginTop: 8, fontSize: 12, color: MUT }}>{msg}</div>}
      </div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 6 }}>
        <div><L>Role</L><Input data-f="role" value={f.role} onChange={e => set({ role: e.target.value })} placeholder="Graduate Engineer" /></div>
        <div><L>Company</L><Input data-f="org" value={f.org} onChange={e => set({ org: e.target.value })} placeholder="Company" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div><L>Salary (£)</L><Input data-f="salary" type="text" inputMode="numeric" value={f.salary} onChange={e => set({ salary: e.target.value.replace(/\D/g, '').slice(0, 7) })} placeholder="30000" /></div>
        <div><L>Per</L><Seg opts={[['py', 'Year'], ['pcm', 'Month']]} on={f.unit} set={(v) => set({ unit: v })} attr="data-f-unit" /></div>
      </div>
      <L>Start date</L><Input data-f="start" value={f.start} onChange={e => set({ start: e.target.value })} placeholder="e.g. September 2027" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 2px' }}><span style={{ fontSize: 14 }}>I’ve applied</span>
        <button data-f-applied aria-pressed={f.appliedFlag} onClick={() => set({ appliedFlag: !f.appliedFlag, applied: !f.appliedFlag ? (f.applied || dstr()) : '' })} style={{ width: 40, height: 22, border: `1.5px solid ${INK}`, background: f.appliedFlag ? FOR : 'transparent', position: 'relative', borderRadius: 0 }}><span style={{ position: 'absolute', top: 2, [f.appliedFlag ? 'right' : 'left']: 2, width: 15, height: 15, background: f.appliedFlag ? BG : INK }} /></button></div>
      <L>Stage</L><Seg opts={STAGE_OPTS} on={f.stage} set={(v) => set({ stage: v })} attr="data-f-stage" />
      <L>Outcome</L><Seg opts={OUTCOME_OPTS} on={f.outcome} set={(v) => set({ outcome: v })} attr="data-f-outcome" />
      <L>Comments</L><textarea data-f="comments" value={f.comments} onChange={e => set({ comments: e.target.value })} rows={3} placeholder="Add a note…" style={{ width: '100%', background: '#FAF8F2', border: `1.5px solid ${INK}`, padding: 10, fontSize: 13, outline: 'none', borderRadius: 0 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
        {!isNew && <button data-job-delete onClick={onDelete} style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: CLAY, textDecoration: 'underline', fontWeight: 600, background: 'none', border: 0, width: 70, textAlign: 'left' }}>Delete</button>}
        <div style={{ flex: 1 }}><button data-job-save disabled={!can} onClick={() => onSave({ ...f, org: f.org.trim(), role: f.role.trim() })} style={{ ...btn(true), opacity: can ? 1 : .45 }}>{isNew ? 'Add' : 'Save'}</button></div>
      </div>
    </Sheet>);
}

export function JobWidget({ profile, patch, ai, onOpenTab, pushToast, face, addTask }) {
  const J = profile.jobs || {};
  const apps = (J.apps || []).map(normJob);
  const [open, setOpen] = useState(false); const [list, setList] = useState(false); const [form, setForm] = useState(null); const [flt, setFlt] = useState('all');
  const save = (arr) => patch({ jobs: { ...J, apps: arr } });
  const upsert = (a) => {
    const rec = { ...a, status: statusOf(a) };
    const exists = (J.apps || []).some(x => x.id === a.id);
    save(exists ? (J.apps || []).map(x => x.id === a.id ? rec : x) : [...(J.apps || []), { ...rec, id: a.id || uid(), added: dstr() }]);
  };
  const toggleApplied = (a) => upsert({ ...a, appliedFlag: !a.appliedFlag, applied: !a.appliedFlag ? (a.applied || dstr()) : '' });
  const applied = apps.filter(a => a.appliedFlag).length;
  const waiting = apps.filter(a => a.appliedFlag && a.outcome === 'Pending').length;
  const assess = apps.filter(a => a.appliedFlag && a.outcome === 'Pending' && a.stage === 'Assessment').length;
  const interviews = apps.filter(a => a.appliedFlag && a.outcome === 'Pending' && a.stage === 'Interview').length;
  const rejected = apps.filter(a => a.outcome === 'Rejected').length;
  const toApply = apps.filter(a => !a.appliedFlag).length;
  const badge = assess ? `${assess} assessment${assess > 1 ? 's' : ''}` : interviews ? `${interviews} interview${interviews > 1 ? 's' : ''}` : '';
  const shown = apps.filter(a => flt === 'all' ? true : flt === 'pending' ? (a.appliedFlag && a.outcome === 'Pending') : flt === 'rejected' ? a.outcome === 'Rejected' : !a.appliedFlag);
  const chips = [['all', `All ${apps.length}`], ['pending', `Pending ${waiting}`], ['rejected', `Rejected ${rejected}`], ['toapply', `To apply ${toApply}`]];
  const edit = (a) => setForm({ init: a, isNew: false });
  return (
    <div data-job-widget style={{ marginTop: face ? 0 : 14 }}>
      <button data-job-row aria-expanded={list} onClick={() => setList(true)} style={face ? { width: '100%', border: 0, background: 'none', padding: 0, textAlign: 'left', borderRadius: 0 } : { width: '100%', border: `1.5px solid ${INK}`, background: '#FAF8F2', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', borderRadius: 0 }}>
        {face || <><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: MUT }}>Job hunt</div>
          <div data-job-summary style={{ ...FR, fontWeight: 600, fontSize: 16, marginTop: 3 }}>{apps.length ? `${applied} applied · ${waiting} waiting` : 'Add your first role'}</div></div>
        {badge && <span data-job-badge style={{ background: CLAY, color: BG, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 8px' }}>{badge}</span>}
        <span style={{ fontSize: 14 }}>&#8964;</span></>}
      </button>
      {list && <Sheet title="Job hunt" onClose={() => setList(false)} dataAttr={{ 'data-job-list': true }}>
        {addTask && <div style={{ marginTop: 4, marginBottom: 12 }}><JobHunt pulseOnly profile={profile} patch={patch} addTask={addTask} pushToast={pushToast} /></div>}
        <div style={{ marginTop: 2, fontSize: 12, color: MUT }}>{apps.length} role{apps.length === 1 ? '' : 's'} &middot; {applied} applied &middot; {rejected} rejected</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>{chips.map(([k, l]) => <button key={k} data-job-filter={k} aria-pressed={flt === k} onClick={() => setFlt(k)} style={{ fontSize: 11, padding: '5px 10px', border: `1.5px solid ${INK}`, background: flt === k ? INK : 'transparent', color: flt === k ? BG : MUT, borderRadius: 0 }}>{l}</button>)}</div>
        <div style={{ marginTop: 8 }}>
          {shown.length === 0 && <div style={{ padding: '18px 0', fontSize: 13, color: MUT, borderTop: `1px solid ${RULE}` }}>{apps.length ? 'Nothing in this filter.' : 'No roles yet. Add one, or paste a job advert and I’ll fill it in.'}</div>}
          {shown.map(a => (
            <div key={a.id} data-job-item style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderTop: `1px solid ${RULE}` }}>
              <button data-job-tick aria-label={`${a.appliedFlag ? 'Mark not applied' : 'Mark applied'}: ${a.org}`} aria-pressed={a.appliedFlag} onClick={() => toggleApplied(a)} style={{ width: 20, height: 20, marginTop: 1, flex: 'none', border: `1.5px solid ${a.appliedFlag ? FOR : INK}`, background: a.appliedFlag ? FOR : 'transparent', color: BG, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0, padding: 0 }}>{a.appliedFlag ? '✓' : ''}</button>
              <button data-job-open onClick={() => edit(a)} style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 0, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{a.role || a.org}</div>
                <div style={{ fontSize: 11, color: MUT, marginTop: 3 }}>{[a.role ? a.org : '', payText(a), a.start].filter(Boolean).join(' · ')}</div>
              </button>
              <div style={{ textAlign: 'right', flex: 'none', width: 78 }}>{a.appliedFlag ? <Pill o={a.outcome} /> : <Pill o="" />}<div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 5, color: a.stage === 'Assessment' && a.appliedFlag ? CLAY : MUT, fontWeight: a.stage === 'Assessment' && a.appliedFlag ? 700 : 400 }}>{stageLabel(a)}</div></div>
            </div>))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <div style={{ flex: 1 }}><button data-job-add onClick={() => setForm({ init: {}, isNew: true })} style={btn(true)}>+ Add a role</button></div>
          {false && onOpenTab && <div style={{ flex: 1 }}><button data-job-open-tab onClick={() => { setList(false); onOpenTab(); }} style={btn(false)}>Open Job hunt</button></div>}
        </div>
      </Sheet>}
      {form && <RoleForm key={form.init.id || 'new'} init={form.init} isNew={form.isNew} ai={ai} onClose={() => setForm(null)}
        onSave={(f) => { upsert({ ...f, id: f.id || uid() }); setForm(null); pushToast && pushToast(form.isNew ? 'Role added.' : 'Saved.', 'success'); }}
        onDelete={() => { save((J.apps || []).filter(x => x.id !== form.init.id)); setForm(null); }} />}
    </div>);
}

// ---------- Development week strip ----------
export function DevStrip({ s, current, range, onPrev, onNext, nextOff, onPlan, pd, hideNext }) {
  const [det, setDet] = useState(false);
  const Arrow = ({ l, on, off, label }) => <button aria-label={label} onClick={on} disabled={off} style={{ width: 28, height: 28, border: `1.5px solid ${off ? RULE : INK}`, color: off ? SOFT : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, borderRadius: 0, background: 'transparent' }}>{l}</button>;
  const cell = (n, l, i) => <div key={l} style={{ padding: '8px 0 8px ' + (i ? 12 : 0) + 'px', borderLeft: i ? `1px solid ${INK}` : 0 }}><div style={{ ...FR, fontSize: 27, lineHeight: 1 }}>{n}</div><div style={{ fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: MUT, marginTop: 5 }}>{l}</div></div>;
  const hrs = (s.mins / 60).toFixed(1).replace(/\.0$/, '');
  return (
    <div data-dev-summary style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Lab>{current ? 'This week' : 'Week'} &middot; {range}</Lab><div style={{ display: 'flex', gap: 4 }}><Arrow l="‹" on={onPrev} label="Previous summary week" /><Arrow l="›" on={onNext} off={nextOff} label="Next summary week" /></div></div>
      <div data-dev-strip style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: `3px solid ${INK}`, borderBottom: `1px solid ${INK}`, marginTop: 8 }}>
        {[[s.doneSteps.length, 'Milestones'], [`${s.sessionsDone.length}/${s.sessions.length}`, 'Sessions'], [hrs + 'h', 'Studied']].map(([n, l], i) => cell(n, l, i))}
      </div>
      <div style={{ textAlign: 'right', marginTop: 7 }}><button data-dev-details onClick={() => setDet(true)} style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 0, padding: 0 }}>Details</button></div>
      {det && <Sheet title={current ? 'This week' : 'Week recap'} onClose={() => setDet(false)} dataAttr={{ 'data-dev-sheet': true }}>
        <div style={{ marginTop: 2, fontSize: 12, color: MUT }}>{range} &middot; {s.doneSteps.length} milestone{s.doneSteps.length === 1 ? '' : 's'} &middot; {hrs} h</div>
        <div style={{ marginTop: 8 }}>
          {s.doneSteps.length === 0 && s.sessions.length === 0 && <div style={{ padding: '14px 0', fontSize: 13, color: MUT, borderTop: `1px solid ${RULE}` }}>Nothing logged {current ? 'yet this week' : 'that week'}. Tick off a milestone or book a study block and it will show here.</div>}
          {s.doneSteps.map((d, i) => <div key={'m' + i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderTop: `1px solid ${RULE}` }}><span style={{ width: 18, height: 18, flex: 'none', background: FOR, color: BG, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>✓</span><div><div style={{ fontSize: 14 }}>{d.title}</div><div style={{ fontSize: 11, color: MUT }}>{d.skill} · {pd(d.date)}</div></div></div>)}
          {s.sessions.map(t => <div key={t.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderTop: `1px solid ${RULE}` }}><span style={{ width: 18, height: 18, flex: 'none', border: t.status === 'done' ? 0 : `1.5px solid ${INK}`, background: t.status === 'done' ? FOR : 'transparent', color: BG, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{t.status === 'done' ? '✓' : ''}</span><div><div style={{ fontSize: 14 }}>{t.title}</div><div style={{ fontSize: 11, color: MUT }}>{pd(t.date)} {t.startTime} · {t.duration} min{t.status === 'done' ? '' : ' (planned)'}</div></div></div>)}
        </div>
        {current && !hideNext && s.next.length > 0 && <div style={{ marginTop: 14 }}><Kick>Up next</Kick><div style={{ fontSize: 14, margin: '3px 0 10px' }}>{s.next[0].step.title} <span style={{ color: MUT, fontSize: 12 }}>({s.next[0].skill})</span></div><button data-dev-plan onClick={() => { setDet(false); onPlan(); }} style={btn(true)}>Plan a slot</button></div>}
      </Sheet>}
    </div>);
}
