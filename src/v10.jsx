// v10: the "front page" tiles for the rest of Home. Engraved instruments (clock, ring, ruler, columns, track).
// Each tile is a compact face. Tapping it opens the full widget in place (App portals it into the tile's slot).
import React, { useId, useRef } from 'react';
import { INK, MUT, CLAY, FOR, RULE, BG, SOFT, jobWeek } from './groups.jsx';
import { normJob } from './v9.jsx';


const FP_CSS = `
.np-skin [data-fp-slot] div[class*="p-4"][class*="bg-white"][class*="border"]{background:transparent!important;border:0!important;box-shadow:none!important;padding:2px 0 6px!important;border-radius:0!important}
.np-skin [data-fp-slot] span[class*="uppercase"][class*="tracking-widest"]{background:none!important;color:#C8643C!important;padding:0!important;display:block!important;font-size:9.5px!important;letter-spacing:.22em!important;font-weight:700!important}
.np-skin [data-fp-slot] .np-kicker{display:none!important}
.np-skin [data-fp-slot] h3{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600!important;font-size:15px!important;letter-spacing:0!important;color:#1B2A22}
.np-skin [data-fp-slot] .flex.items-center.gap-2>svg{display:none!important}
.np-skin [data-fp-slot] div[class*="bg-[#FAF8F5]"]{background:transparent!important;border:0!important;border-top:1px solid #CFC7B4!important;border-radius:0!important;padding-left:0!important;padding-right:0!important}
.np-skin [data-fp-slot] input,.np-skin [data-fp-slot] select{border-radius:0!important;background:transparent!important;border:1px solid #1B2A22!important;font-family:'Fraunces',Georgia,serif}
.np-skin [data-fp-slot] button{border-radius:0!important}
.np-skin [data-fp-slot] button[class*="bg-"]{background:#1B2A22!important;color:#F4EFE4!important;border:0!important}
.np-skin [data-fp-slot] button[class*="border-stone-300"]{background:transparent!important;color:#1B2A22!important;border:1px solid #1B2A22!important}
.np-skin [data-fp-slot] div[class*="border"][class*="border-stone-200"]{border-color:#CFC7B4!important;background:transparent!important;border-radius:0!important}
`;
const SAND = '#EBE2CC';
const FRS = { fontFamily: 'Fraunces, Georgia, serif' };
const pt = (r, a, c = 50) => { const t = a * Math.PI / 180; return [c + r * Math.sin(t), c - r * Math.cos(t)]; };
const f1 = (n) => n.toFixed(2);
const sector = (R, r, a0, a1) => {
  const p = (rr, aa) => pt(rr, aa).map(f1).join(' ');
  const large = (a1 - a0) > 180 ? 1 : 0;
  return `M${p(R, a0)} A${R} ${R} 0 ${large} 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 ${large} 0 ${p(r, a0)} Z`;
};
const Hatch = ({ id, col, gap = 2, sw = .8, rot = 45 }) => (
  <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}><line x1="0" y1="0" x2="0" y2={gap} stroke={col} strokeWidth={sw} /></pattern>);

const Kicker = ({ children, col = CLAY }) => <div style={{ fontSize: 9.5, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700, color: col }}>{children}</div>;
const Dots = ({ side = 'right', w = '55%', op = .4 }) => (
  <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: w, pointerEvents: 'none', opacity: op, backgroundImage: `radial-gradient(circle, ${INK} .8px, transparent 1.15px)`, backgroundSize: '4.5px 4.5px', WebkitMaskImage: `linear-gradient(to ${side === 'right' ? 'left' : 'right'}, #000, transparent)`, maskImage: `linear-gradient(to ${side === 'right' ? 'left' : 'right'}, #000, transparent)` }} />);
const CloseTag = ({ on }) => on ? <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, borderBottom: `1.5px solid ${INK}` }}>Close &#9650;</span> : null;

const toM = (hhmm) => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
export const fmt12 = (hhmm) => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); const suf = h >= 12 ? 'pm' : 'am'; const hh = h % 12 === 0 ? 12 : h % 12; return { n: m ? `${hh}:${String(m).padStart(2, '0')}` : String(hh), suf }; };
const dayName = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
const dayInit = (d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(d + 'T12:00:00').getDay()];

// ---------- Engraved instruments ----------
export function Clock({ time, band, size = 92 }) {
  const id = useId().replace(/:/g, '');
  const [hh, mm] = String(time || '0:0').split(':').map(Number);
  const hourA = (((hh || 0) % 12) + (mm || 0) / 60) * 30, minA = (mm || 0) * 6;
  const ticks = [];
  for (let i = 0; i < 60; i++) { const a = i * 6, L = i % 5 === 0 ? 5 : 2.2, [x0, y0] = pt(43, a), [x1, y1] = pt(43 - L, a); ticks.push(<path key={i} d={`M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}`} stroke={INK} strokeWidth={i % 5 === 0 ? .9 : .4} />); }
  const nums = [['XII', 0], ['III', 90], ['VI', 180], ['IX', 270]].map(([l, a]) => { const [x, y] = pt(31, a); return <text key={l} x={f1(x)} y={f1(y + 2.4)} textAnchor="middle" fontSize="7" fill={INK} fontStyle="italic" fontWeight="600" style={FRS}>{l}</text>; });
  const [hx, hy] = pt(25, hourA), [mx, my] = pt(37, minA);
  return (
    <svg data-fp-clock width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="47" fill={BG} stroke={INK} strokeWidth="1.3" /><circle cx="50" cy="50" r="44.5" fill="none" stroke={INK} strokeWidth=".4" />
      {ticks}{nums}
      {Array.from({ length: 12 }, (_, k) => <ellipse key={k} cx="50" cy="50" rx="20" ry="6.5" fill="none" stroke={INK} strokeWidth=".28" transform={`rotate(${k * 15} 50 50)`} />)}
      <circle cx="50" cy="50" r="20" fill="none" stroke={INK} strokeWidth=".5" />
      {band && <path d={sector(41, 38, hourA - 15, hourA + 15)} fill={CLAY} opacity=".9" />}
      <path d={`M50 50 L${f1(hx)} ${f1(hy)}`} stroke={band ? CLAY : INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M50 50 L${f1(mx)} ${f1(my)}`} stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill={BG} stroke={INK} strokeWidth="1.1" /><circle cx="50" cy="50" r="1" fill={INK} />
    </svg>);
}

export function Ring({ done, total, size = 78, big }) {
  const id = useId().replace(/:/g, '');
  const n = Math.max(1, total), span = 360 / n, gap = n > 1 ? 4 : 0;
  const ticks = Array.from({ length: 72 }, (_, i) => { const [x0, y0] = pt(48, i * 5), [x1, y1] = pt(45.5, i * 5); return <path key={i} d={`M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}`} stroke={INK} strokeWidth=".4" />; });
  const segs = [];
  for (let k = 0; k < n; k++) {
    const a0 = k * span + gap, a1 = (k + 1) * span - gap, on = k < done;
    if (on) { const rad = []; for (let a = a0 + 2; a < a1 - 1; a += 3) { const [x0, y0] = pt(24.5, a), [x1, y1] = pt(41.5, a); rad.push(<path key={a} d={`M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}`} stroke={CLAY} strokeWidth=".7" />); } segs.push(<g key={k}><path d={sector(42, 24, a0, a1)} fill={BG} stroke={INK} strokeWidth="1" />{rad}</g>); }
    else segs.push(<path key={k} d={sector(42, 24, a0, a1)} fill="none" stroke={INK} strokeWidth=".8" strokeDasharray="1.2 2" />);
  }
  const fs = big ? 19 : 17;
  return (
    <svg data-fp-ring width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="48" fill="none" stroke={INK} strokeWidth=".5" />{ticks}{segs}
      <text x="50" y={50 + fs * .34} textAnchor="middle" fontSize={fs} fontWeight="600" fill={INK} style={FRS}>{done}/{total}</text>
    </svg>);
}

export function Ruler({ left, today, endLabel }) {
  const n = Math.max(1, Math.min(30, left));
  const step = 142 / n;
  const marks = [];
  for (let i = 0; i <= n; i++) { const x = 4 + i * step, L = (i === 0 || i === n) ? 12 : (i % 7 === 0 ? 8 : 5); marks.push(<path key={i} d={`M${f1(x)} 34 V${34 - L}`} stroke={INK} strokeWidth={(i === 0 || i === n) ? 1 : .6} />); }
  return (
    <svg data-fp-ruler width="100%" viewBox="0 0 150 56" aria-hidden style={{ display: 'block', maxWidth: 160 }}>
      <path d="M4 34 H146" stroke={INK} strokeWidth="1" />{marks}
      <path d="M4 34 L0 41 H8 Z" fill={CLAY} /><path d="M146 34 L142 41 H150 Z" fill="none" stroke={INK} strokeWidth=".8" />
      <text x="4" y="52" textAnchor="middle" fontSize="7.5" letterSpacing="1" fill={MUT}>{today}</text>
      <text x="150" y="52" textAnchor="end" fontSize="7.5" letterSpacing="1" fill={MUT}>{endLabel}</text>
    </svg>);
}

export function Columns({ counts, labels, hl }) {
  const id = useId().replace(/:/g, '');
  const mx = Math.max(1, ...counts), sc = 44 / mx;
  return (
    <svg data-fp-columns width="100%" viewBox="0 0 152 70" aria-hidden style={{ display: 'block', maxWidth: 170 }}>
      <defs><Hatch id={`c${id}`} col={CLAY} gap={1.7} rot={0} /><Hatch id={`i${id}`} col={INK} gap={1.7} sw={.6} rot={0} /></defs>
      {[1, 2, 3, 4].map(i => <path key={i} d={`M0 ${56 - i * 11} H152`} stroke={RULE} strokeWidth=".5" />)}
      {counts.map((c, i) => { const bx = 6 + i * 21, bh = c * sc; return (
        <g key={i}>
          {c > 0 && <rect x={bx} y={56 - bh} width="11" height={bh} fill={`url(#${i === hl ? 'c' : 'i'}${id})`} stroke={INK} strokeWidth=".8" />}
          <text x={bx + 5.5} y={56 - bh - 2.5} textAnchor="middle" fontSize="7" fontWeight="600" fill={i === hl ? CLAY : MUT} style={FRS}>{c}</text>
          <text x={bx + 5.5} y="66" textAnchor="middle" fontSize="7" fill={MUT}>{labels[i]}</text>
        </g>); })}
      <path d="M0 56.5 H152" stroke={INK} strokeWidth="1.1" />
    </svg>);
}

export function Track({ stations }) {
  const id = useId().replace(/:/g, '');
  const xs = [26, 126, 226, 320];
  const lastOn = Math.max(-1, ...stations.map((s, i) => s.n > 0 ? i : -1));
  return (
    <svg data-fp-track width="100%" viewBox="0 0 346 58" aria-hidden style={{ display: 'block' }}>
      <defs><Hatch id={`t${id}`} col={CLAY} gap={1.7} /></defs>
      <path d="M26 31 H320" stroke={INK} strokeWidth=".9" />
      {Array.from({ length: 37 }, (_, i) => <path key={i} d={`M${34 + i * 8} 29 V33`} stroke={SOFT} strokeWidth=".6" />)}
      {lastOn > 0 && <path d={`M26 31 H${xs[lastOn]}`} stroke={CLAY} strokeWidth="1.8" />}
      {stations.map((s, i) => { const on = s.n > 0, x = xs[i]; return (
        <g key={s.label}>
          <text x={x} y="14" textAnchor="middle" fontSize="14" fontWeight="600" fill={on ? INK : SOFT} style={FRS}>{s.n}</text>
          <rect x={x - 6} y="25" width="12" height="12" transform={`rotate(45 ${x} 31)`} fill={on ? `url(#t${id})` : BG} stroke={INK} strokeWidth="1" />
          <text x={x} y="52" textAnchor="middle" fontSize="8" letterSpacing="1.5" fill={MUT}>{s.label.toUpperCase()}</text>
        </g>); })}
    </svg>);
}

// ---------- Job tile face (JobWidget renders this inside its trigger) ----------
export function JobFace({ profile }) {
  const apps = ((profile.jobs && profile.jobs.apps) || []).map(normJob);
  const live = apps.filter(a => a.appliedFlag);
  const waiting = live.filter(a => a.outcome === 'Pending').length;
  const stations = [
    { label: 'Applied', n: live.length },
    { label: 'Assessment', n: live.filter(a => a.outcome === 'Pending' && a.stage === 'Assessment').length },
    { label: 'Interview', n: live.filter(a => a.outcome === 'Pending' && a.stage === 'Interview').length },
    { label: 'Offer', n: apps.filter(a => a.outcome === 'Offer' || a.stage === 'Offer').length },
  ];
  const assess = stations[1].n, intv = stations[2].n;
  const badge = assess ? `${assess} assessment${assess > 1 ? 's' : ''}` : intv ? `${intv} interview${intv > 1 ? 's' : ''}` : '';
  return (
    <div data-fp-job style={{ padding: '10px 0 4px', borderBottom: `3px double ${INK}`, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Kicker>Job hunt</Kicker><span style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>{badge && <span data-job-badge style={{ background: CLAY, color: BG, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 6px' }}>{badge}</span>}<span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, borderBottom: `1.5px solid ${INK}` }}>Open list &rsaquo;</span></span></div>
      {apps.length ? <Track stations={stations} /> : <div style={{ ...FRS, fontStyle: 'italic', fontSize: 14, color: MUT, padding: '8px 0 10px' }}>Nothing on the track yet. Add your first role.</div>}
      {(() => { const w = jobWeek(profile); const cell = (l, n, t) => <div key={l} style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: MUT, whiteSpace: 'nowrap' }}>{l} <b style={{ color: n < t ? CLAY : FOR }}>{n}/{t}</b></div><div style={{ height: 3, background: RULE, marginTop: 3 }}><div style={{ height: 3, width: Math.min(100, t ? n / t * 100 : 0) + '%', background: n < t ? CLAY : FOR }} /></div></div>; return (
        <div data-fp-week style={{ padding: '4px 0 10px' }}>
          <div data-job-line style={{ fontStyle: 'italic', fontSize: 13, color: MUT, marginBottom: 7, fontFamily: 'Fraunces, serif' }}>{w.line}</div>
          <div style={{ display: 'flex', gap: 12 }}>{cell('Apply', w.sent, w.tg.apply)}{cell('Reach out', w.reach, w.tg.reach)}{cell('Outing', w.outing, w.tg.outing)}</div>
        </div>); })()}
      <span data-job-summary style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{apps.length ? `${live.length} applied · ${waiting} waiting` : 'Add your first role'}</span>
    </div>);
}

// ---------- Front page ----------
export default function FrontPage({ hidden, open, setOpen, registerSlot, meds, setMeds, meals, tasks, cadence, countdown, today, addDays, daysBetween, jobNode }) {
  const refs = useRef({});
  const slot = (id) => (refs.current[id] || (refs.current[id] = (el) => registerSlot(id, el)));
  const show = (id) => !hidden.includes(id);
  const toggle = (id) => setOpen(open === id ? null : id);
  const slotDiv = (id) => <div key={id} data-fp-slot={id} ref={slot(id)} style={{ marginTop: open === id ? 10 : 0 }} />;

  // Medicine
  const sortedMeds = [...meds].sort((a, b) => toM(a.time) - toM(b.time));
  const nextMed = sortedMeds.find(m => !m.taken) || null;
  const nowT = new Date().toTimeString().slice(0, 5);
  const clockT = nextMed ? nextMed.time : nowT;
  const f = fmt12(nextMed ? nextMed.time : nowT);
  const medTile = show('medicine') && (
    <section data-fp-tile="medicine" style={{ position: 'relative', borderTop: `3px double ${INK}`, borderBottom: `1px solid ${INK}`, overflow: 'hidden' }}>
      <Dots />
      <div data-fp-open="medicine" role="button" tabIndex={0} aria-expanded={open === 'medicine'} onClick={() => toggle('medicine')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle('medicine'); } }} style={{ position: 'relative', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: meds.length > 0 ? '10px 0 0' : '12px 0 12px', cursor: 'pointer' }}>
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}><Kicker>{meds.length === 0 ? 'Medicine' : nextMed ? 'Medicine · next dose' : 'Medicine · all taken'}</Kicker><CloseTag on={open === 'medicine'} /></div>
          {meds.length === 0
            ? <div style={{ ...FRS, fontStyle: 'italic', fontSize: 15, color: MUT, marginTop: 8 }}>Nothing to remind you of yet.</div>
            : nextMed ? <>
              <div data-fp-dose style={{ ...FRS, fontWeight: 700, fontSize: 52, lineHeight: .95, letterSpacing: '-.03em', marginTop: 3 }}>{f.n}<span style={{ fontSize: 22, fontWeight: 600 }}>{f.suf}</span></div>
              <div style={{ ...FRS, fontStyle: 'italic', fontSize: 13, color: MUT, maxWidth: 190 }}>{nextMed.name}</div></>
              : <div style={{ ...FRS, fontWeight: 700, fontSize: 30, lineHeight: 1, marginTop: 6 }}>All done <span style={{ color: FOR }}>&#10003;</span></div>}
        </div>
        <div style={{ paddingRight: 4, display: 'flex', alignItems: 'center', alignSelf: 'center', flex: 'none' }}><Clock time={clockT} band={!!nextMed} /></div>
      </div>
      {meds.length > 0 && <div data-fp-pillbox style={{ position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0 12px' }}>
        {sortedMeds.map(m => {
          const isNext = nextMed && nextMed.id === m.id, t = fmt12(m.time);
          return (
            <button key={m.id} data-med-dot={m.id} aria-pressed={!!m.taken} aria-label={`${m.name} at ${m.time}: ${m.taken ? 'taken' : 'not yet taken'}. Tap to ${m.taken ? 'undo' : 'mark taken'}.`} onClick={() => setMeds(prev => prev.map(x => x.id === m.id ? { ...x, taken: !x.taken } : x))} style={{ background: 'none', border: 0, padding: 0, width: 44, textAlign: 'center', borderRadius: 0 }}>
              <svg width="44" height="34" viewBox="0 0 44 34">
                <defs><Hatch id={`pb${m.id}`} col={FOR} gap={1.9} /></defs>
                {isNext && <circle cx="22" cy="17" r="16" fill="none" stroke={CLAY} strokeWidth="1.2" strokeDasharray="2 2.4" />}
                <circle cx="22" cy="17" r="12.5" fill={m.taken ? `url(#pb${m.id})` : BG} stroke={INK} strokeWidth="1.2" />
                {m.taken ? <><path d="M17 17 l3.5 4 l7 -8" fill="none" stroke={BG} strokeWidth="2.6" strokeLinecap="round" /><path d="M17 17 l3.5 4 l7 -8" fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" /></> : <circle cx="22" cy="17" r="9" fill="none" stroke={SOFT} strokeWidth=".6" strokeDasharray="1 2" />}
              </svg>
              <div style={{ fontSize: 9, letterSpacing: '.08em', color: MUT }}>{t.n}{t.suf}</div>
            </button>);
        })}
      </div>}
      {slotDiv('medicine')}
    </section>);

  // Meals + Countdown
  const eaten = meals.filter(m => m.eaten).length;
  const nextMeal = meals.find(m => !m.eaten) || null;
  const mealsTile = show('meals') && (
    <div data-fp-tile="meals" style={{ padding: '10px 12px 12px 0', background: open === 'meals' ? SAND : 'transparent' }}>
      <button data-fp-open="meals" aria-expanded={open === 'meals'} onClick={() => toggle('meals')} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Kicker>Meals</Kicker><CloseTag on={open === 'meals'} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Ring done={eaten} total={Math.max(1, meals.length)} />
          <div style={{ ...FRS, fontStyle: 'italic', fontSize: 13, color: MUT, lineHeight: 1.3 }}>{nextMeal ? <>{nextMeal.label.toLowerCase()}<br />at {nextMeal.time}</> : 'all logged'}</div>
        </div>
      </button>
    </div>);
  const left = countdown.date ? daysBetween(today, countdown.date) : null;
  const cdTile = show('countdown') && (
    <div data-fp-tile="countdown" style={{ padding: '10px 0 12px 12px', background: open === 'countdown' ? SAND : 'transparent' }}>
      <button data-fp-open="countdown" aria-expanded={open === 'countdown'} onClick={() => toggle('countdown')} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><Kicker col={FOR}>{(countdown.title || 'Countdown').slice(0, 22)}</Kicker><CloseTag on={open === 'countdown'} /></div>
        {left === null ? <div style={{ ...FRS, fontStyle: 'italic', fontSize: 14, color: MUT, marginTop: 10 }}>Tap to set a date.</div>
          : left < 0 ? <div style={{ ...FRS, fontWeight: 700, fontSize: 26, marginTop: 8 }}>Passed</div>
            : <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}><span data-fp-days style={{ ...FRS, fontWeight: 700, fontSize: 40, lineHeight: 1, color: CLAY }}>{left}</span><span style={{ ...FRS, fontStyle: 'italic', fontSize: 14, color: MUT }}>{left === 1 ? 'day to go' : 'days to go'}</span></div>
              {left > 0 && <div style={{ marginTop: 2 }}><Ruler left={left} today={String(new Date(today + 'T12:00:00').getDate())} endLabel={new Date(countdown.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()} /></div>}
            </>}
      </button>
    </div>);

  // Week + Life admin
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const counts = days.map(d => tasks.filter(t => t.date === d && t.status !== 'done').length);
  const mxC = Math.max(...counts), hl = mxC > 0 ? counts.indexOf(mxC) : -1;
  const weekTile = show('weekahead') && (
    <div data-fp-tile="weekahead" style={{ padding: '10px 12px 12px 0', background: open === 'weekahead' ? SAND : 'transparent' }}>
      <button data-fp-open="weekahead" aria-expanded={open === 'weekahead'} onClick={() => toggle('weekahead')} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Kicker>This week</Kicker><CloseTag on={open === 'weekahead'} /></div>
        <div style={{ marginTop: 4 }}><Columns counts={counts} labels={days.map(dayInit)} hl={hl} /></div>
        <div style={{ ...FRS, fontStyle: 'italic', fontSize: 11.5, color: MUT }}>{hl >= 0 ? (hl === 0 ? 'Today is the big one' : `${dayName(days[hl])} is the big one`) : 'A clear week'}</div>
      </button>
    </div>);
  const items = [...cadence].sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))).slice(0, 3);
  const dueTxt = (it) => { if (!it.dueDate) return ''; const n = daysBetween(today, it.dueDate); return n < 0 ? `${-n}d late` : n === 0 ? 'today' : n === 1 ? 'tomorrow' : `${n} days`; };
  const adminTile = show('cadence') && (
    <div data-fp-tile="cadence" style={{ padding: '10px 0 12px 12px', background: open === 'cadence' ? SAND : 'transparent' }}>
      <button data-fp-open="cadence" aria-expanded={open === 'cadence'} onClick={() => toggle('cadence')} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, borderRadius: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Kicker>Life admin</Kicker><CloseTag on={open === 'cadence'} /></div>
        <div style={{ marginTop: 6 }}>
          {items.length === 0 && <div style={{ ...FRS, fontStyle: 'italic', fontSize: 14, color: MUT }}>Nothing coming up.</div>}
          {items.map(it => { const late = it.dueDate && daysBetween(today, it.dueDate) < 0; return (
            <div key={it.id} data-fp-admin style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '6px 0', borderBottom: `1px dotted ${SOFT}`, fontSize: 12.5 }}>
              <span style={{ width: 5, height: 5, background: INK, flex: 'none', transform: 'translateY(-2px)' }} />
              <span style={{ ...FRS, fontWeight: 600, fontSize: 16, lineHeight: 1.2, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
              <span style={{ fontSize: 11, color: late ? CLAY : MUT, fontWeight: late ? 700 : 400, textDecoration: late ? `underline wavy ${CLAY}` : 'none', textUnderlineOffset: 3, flex: 'none' }}>{dueTxt(it)}</span>
            </div>); })}
        </div>
      </button>
    </div>);

  const row = (a, b, ida, idb) => {
    const both = a && b;
    if (!a && !b) return null;
    const openId = [ida, idb].find(x => x === open);
    return (
      <div data-fp-row style={{ borderBottom: `1px solid ${INK}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: both ? '1fr 1fr' : '1fr' }}>
          {a && React.cloneElement(a, { style: { ...a.props.style, ...(both ? { borderRight: `1px solid ${INK}` } : { paddingRight: 0 }) } })}
          {b && React.cloneElement(b, { style: { ...b.props.style, ...(both ? {} : { paddingLeft: 0 }) } })}
        </div>
        <div style={{ padding: openId ? '0 0 12px' : 0 }}>{a && slotDiv(ida)}{b && slotDiv(idb)}</div>
      </div>);
  };

  return (
    <div data-fp style={{ display: 'flex', flexDirection: 'column', order: -5 }}>
      <style>{FP_CSS}</style>
      {medTile}
      {row(mealsTile, cdTile, 'meals', 'countdown')}
      {row(weekTile, adminTile, 'weekahead', 'cadence')}
      {jobNode && <div data-fp-tile="job" style={{ position: 'relative' }}>{jobNode}</div>}
    </div>);
}
