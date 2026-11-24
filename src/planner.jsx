import React, { useState, useEffect } from 'react';

// The planner: one question per screen. Go out (casual / formal / meeting), events (find one, already booked, host),
// tasks, "try something" and surprise me. All the heavy lifting (venue search, free-time maths, saving) stays in App.
const INK = '#1B2A22', PAPER = '#F4EFE4', PAPER2 = '#FAF4E0', FOR = '#1F3A2E', CLAY = '#C8643C', RULE = '#CFC7B4', MUT = '#5A675F', SOFT = '#7C857F';
const fr = { fontFamily: 'Fraunces, serif' };
const cap = { fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: MUT };

const Q = ({ t, sub }) => (
  <div style={{ marginTop: 6 }}>
    <h2 style={{ ...fr, fontWeight: 600, fontSize: 30, lineHeight: 1, letterSpacing: '-.02em', margin: 0, color: INK }}>{t}</h2>
    {sub && <p style={{ ...fr, fontStyle: 'italic', fontSize: 15, color: MUT, margin: '8px 0 0', lineHeight: 1.3 }}>{sub}</p>}
  </div>
);
const Lbl = ({ children, mt = 18 }) => <div style={{ ...cap, marginTop: mt }}>{children}</div>;
const Big = ({ t, d, on, onClick, id }) => (
  <button data-plan-opt={id} aria-pressed={!!on} onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', marginTop: 10, padding: '13px 14px', border: `1.5px solid ${INK}`, borderRadius: 0, background: on ? FOR : 'transparent', color: on ? PAPER : INK }}>
    <span style={{ ...fr, fontWeight: 600, fontSize: 20, display: 'block', lineHeight: 1.1 }}>{t}</span>
    {d && <span style={{ fontSize: 13, opacity: on ? .8 : .7, display: 'block', marginTop: 3 }}>{d}</span>}
  </button>
);
const Chips = ({ items, val, onPick, multi, id }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
    {items.map(x => {
      const k = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x;
      const on = multi ? val.includes(k) : val === k;
      return <button key={k} data-plan-chip={id} aria-pressed={on} onClick={() => onPick(k)} style={{ padding: '9px 13px', fontSize: 14, border: `1.5px solid ${INK}`, borderRadius: 0, background: on ? INK : 'transparent', color: on ? PAPER : INK, fontWeight: on ? 600 : 500 }}>{l}</button>;
    })}
  </div>
);
const Seg = ({ items, val, onPick, id }) => (
  <div style={{ display: 'flex', marginTop: 8, border: `1.5px solid ${INK}` }}>
    {items.map(([k, l, s], i) => (
      <button key={k} data-plan-seg={id} aria-pressed={val === k} onClick={() => onPick(k)} style={{ flex: 1, padding: '10px 4px', border: 0, borderLeft: i ? `1.5px solid ${INK}` : 0, borderRadius: 0, background: val === k ? INK : 'transparent', color: val === k ? PAPER : INK, textAlign: 'center' }}>
        <span style={{ ...fr, fontWeight: 600, fontSize: 18, display: 'block' }}>{l}</span>{s && <span style={{ fontSize: 11, opacity: .75 }}>{s}</span>}
      </button>
    ))}
  </div>
);
const Inp = (p) => <input {...p} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '12px', border: `1.5px solid ${INK}`, borderRadius: 0, background: PAPER2, fontSize: 16, color: INK, ...(p.style || {}) }} />;
const Warn = ({ children }) => <div style={{ marginTop: 14, padding: '10px 12px', background: '#7B2A22', color: '#fff', fontSize: 13, lineHeight: 1.35 }}>{children}</div>;
const Note = ({ children }) => <div style={{ marginTop: 12, padding: '9px 12px', borderLeft: `3px solid ${CLAY}`, background: PAPER2, fontSize: 13, color: INK }}>{children}</div>;
const LinkBtn = ({ children, ...p }) => <button {...p} style={{ background: 'none', border: 0, padding: 0, marginTop: 12, fontSize: 14, fontWeight: 600, textDecoration: 'underline', color: INK, textAlign: 'left', ...(p.style || {}) }}>{children}</button>;

const DURS = [[30, '30 min'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours'], [180, '3 hours'], [240, '4 hours']];
const durWord = (m) => (DURS.find(d => d[0] === m) || [0, m + ' min'])[1];
const WHO = [['alone', 'On my own'], ['friend', 'A friend'], ['date', 'A date'], ['group', 'A group'], ['colleagues', 'Colleagues']];
const MEET = [['coffee', 'Coffee'], ['lunch', 'Lunch'], ['interview', 'Interview'], ['networking', 'Networking'], ['other', 'Other']];
const TRY = [['Outdoor Scenic Walk', 'A walk', 'scenic walk park garden'], ['Bouldering / Movement', 'Climbing', 'climbing bouldering'], ['Pottery / Art Cafe', 'Pottery or art', 'pottery art craft'], ['Gallery & Museum Visit', 'A gallery', 'gallery museum'], ['Cinema', 'Cinema', 'cinema film'], ['Games', 'Games', 'bowling arcade games']];
const FEEL = [['cosy', 'Cosy'], ['lively', 'Lively'], ['quiet', 'Quiet'], ['romantic', 'Romantic']];
const BOOKED = ['Concert', 'Party', 'Wedding', 'Match', 'Show', 'Other'];
const HOSTK = ['Birthday', 'Party', 'Get-together', 'Dinner'];
const FLOWS = { go: ['what', 'outing', 'when', 'where', 'results'], event: ['what', 'etype', 'ev'], task: ['task', 'taskres'], tri: ['what', 'try', 'when', 'where', 'results'], sur: ['what', 'surprise'] };

export default function PlannerWizard({ c }) {
  const [step, setStep] = useState('what');
  const [flow, setFlow] = useState('go');
  const [hist, setHist] = useState([]);
  const [kind, setKind] = useState('casual');
  const [who, setWho] = useState('friend');
  const [meet, setMeet] = useState('coffee');
  const [evPath, setEvPath] = useState('on');
  const [ownTime, setOwnTime] = useState(false);
  const [taskOwn, setTaskOwn] = useState({ date: '', time: '' });
  const [chgDur, setChgDur] = useState(false);
  const [fine, setFine] = useState(false);
  const [extra, setExtra] = useState('');
  const [feel, setFeel] = useState([]);
  const [booked, setBooked] = useState({ kind: 'Concert', title: '', host: '', date: c.eventConfig.date, time: c.eventConfig.startTime || '19:00', dur: 180, place: '' });
  const [host, setHost] = useState({ kind: 'Birthday', title: '', date: c.eventConfig.date, time: c.eventConfig.startTime || '19:00', dur: 180, place: '' });
  const [taskF, setTaskF] = useState({ title: '', hours: 1, by: 'today', other: '' });
  const [events, setEvents] = useState(null);
  const [evBusy, setEvBusy] = useState(false);
  const [evSort, setEvSort] = useState('soon');
  const [sq, setSq] = useState('');
  const [sres, setSres] = useState(null);
  const [sbusy, setSbusy] = useState(false);
  const [target, setTarget] = useState('plan');
  const ec = c.eventConfig;
  const setEc = (p) => c.setEventConfig(prev => ({ ...prev, ...p }));

  // opening: pick the first screen from how the planner was opened
  useEffect(() => {
    if (c.plannerMode === 'task') { setFlow('task'); setStep('task'); }
    else if (c.plannerMode === 'surprise') { setFlow('sur'); setStep('surprise'); }
    else if (c.plannerMode === 'activity') { setFlow('tri'); setStep(c.linkedTargetId ? 'when' : 'try'); if (c.linkedTargetId) setEc({ planLabel: ec.activityDropdown, duration: 90 }); }
    else { setStep('what'); }
    // eslint-disable-next-line
  }, []);

  const go = (s) => { setHist(h => [...h, step]); setStep(s); };
  const back = () => { if (hist.length) { const h = [...hist]; const s = h.pop(); setHist(h); setStep(s); } else c.onClose(); };
  const fl = FLOWS[flow] || FLOWS.go;
  const stepKey = step === 'search' ? null : (['whatson', 'booked', 'host'].includes(step) ? 'ev' : step);
  const pos = Math.max(0, fl.indexOf(stepKey));

  // ---------- what the choices mean ----------
  const applyOuting = (k = kind, w = who, m = meet) => {
    const label = k === 'meeting' ? ({ coffee: 'Coffee meeting', lunch: 'Business lunch', interview: 'Interview', networking: 'Networking', other: 'Meeting' })[m]
      : k === 'formal' ? ({ alone: 'Dinner out', friend: 'Dinner with a friend', date: 'Date night', group: 'Group dinner', colleagues: 'Business dinner' })[w]
        : ({ alone: 'Out and about', friend: 'Catch-up', date: 'Date', group: 'Group outing', colleagues: 'Team outing' })[w];
    const vibe = k === 'meeting' ? ({ coffee: 'coffee quiet', lunch: 'lunch quiet', interview: 'coffee quiet', networking: 'bar lively', other: 'coffee quiet' })[m]
      : k === 'formal' ? (w === 'date' ? 'romantic candlelit intimate' : 'dinner elegant') : (w === 'group' ? 'pub bar lively' : 'casual friendly lively');
    setEc({
      eventType: k === 'formal' ? 'Date Night (Serious)' : k === 'meeting' ? 'Business Dinner' : 'Casual Friend Hangout', vibeKeywords: vibe, planLabel: label,
      meetingType: k === 'meeting' ? 'Business' : 'Friendly', ...(ec.slotPicked ? {} : { duration: k === 'formal' ? 120 : k === 'meeting' ? 60 : 90 })
    });
    c.setPlannerMode('event');
  };
  const dur = Number(ec.duration) || 60;
  const kindLabel = kind === 'formal' ? 'formal' : kind === 'meeting' ? 'meeting' : 'casual';
  const sumOuting = `Go out · ${kindLabel}${kind === 'meeting' ? ' · ' + meet : ''}`;

  // when: gaps from the schedule, across the next few days
  const slots = (() => {
    if (step !== 'when') return [];
    const out = [];
    if (ec.slotPicked) out.push({ date: ec.date, time: ec.startTime, line: 'The time you tapped', tag: 'Yours' });
    for (let i = 0; i < 7 && out.length < 4; i++) {
      const d = c.addDays(c.selectedDateStr, i);
      const best = c.suggestStartTimes(d, dur)[0];
      if (best && !out.some(o => o.date === d && o.time === best.time)) out.push({ date: d, time: best.time, line: best.label.split(' · ')[1], tag: out.length === 0 ? 'Best' : '' });
    }
    return out.slice(0, 3);
  })();
  const pickSlot = (d, t) => { setEc({ date: d, startTime: t, slotPicked: false }); c.setScheduleConflictWarning(c.checkScheduleAndPrepConflict(d, t, kind === 'formal')); };
  const slotText = `${c.prettyDate(ec.date)}, ${ec.startTime}`;

  const findPlaces = () => { c.setSelectedVenueMatch(null); c.refreshVenues(true); go('results'); };
  const doSearch = async () => { if (!sq.trim()) return; setSbusy(true); setSres(null); try { setSres(await c.searchPlaces(sq.trim())); } catch (e) { setSres([]); } setSbusy(false); };
  const usePlace = (p) => {
    const label = p.name + (p.addr ? ', ' + p.addr : '');
    if (target === 'booked') { setBooked(b => ({ ...b, place: label })); setStep(hist[hist.length - 1] || 'booked'); setHist(h => h.slice(0, -1)); return; }
    if (target === 'host') { setHost(b => ({ ...b, place: label })); setStep(hist[hist.length - 1] || 'host'); setHist(h => h.slice(0, -1)); return; }
    c.addPlan({ title: `${ec.planLabel || 'Out'}: ${p.name}`, date: ec.date, startTime: ec.startTime, duration: dur, location: label, type: 'social', categoryColor: 'social', meetingType: ec.meetingType || 'Friendly', notes: 'Place chosen by you.' });
  };
  const openSearch = (t) => { setTarget(t); setSq(''); setSres(null); go('search'); };
  const loadEvents = async () => { setEvBusy(true); setEvents(null); try { setEvents(await c.findEvents()); } catch (e) { setEvents([]); } setEvBusy(false); };
  useEffect(() => { if (step === 'whatson' && events === null && !evBusy) loadEvents(); /* eslint-disable-next-line */ }, [step]);

  // ---------- screen content ----------
  let body = null, foot = null;
  const next = (label, onClick, enabled = true, summary) => { foot = { label, onClick, enabled, summary }; };

  if (step === 'what') {
    body = <>
      <Q t="What are we planning?" />
      <div style={{ marginTop: 6 }} />
      <Big id="go" t="Go out" d="Food, drinks, a meeting" on={flow === 'go'} onClick={() => { setFlow('go'); c.setPlannerMode('event'); applyOuting(); go('outing'); }} />
      <Big id="event" t="An event" d="Something that is on, or one you host" on={flow === 'event'} onClick={() => { setFlow('event'); c.setPlannerMode('event'); go('etype'); }} />
      <Big id="task" t="Get something done" d="A task. We find the time." on={flow === 'task'} onClick={() => { setFlow('task'); c.setPlannerMode('task'); go('task'); }} />
      <Big id="try" t="Try something" d="A walk, a class, a gallery" on={flow === 'tri'} onClick={() => { setFlow('tri'); c.setPlannerMode('activity'); go('try'); }} />
      <Big id="surprise" t="Surprise me" d="You pick the mood, we pick the place" on={flow === 'sur'} onClick={() => { setFlow('sur'); c.setPlannerMode('surprise'); c.setSurpriseConfig(p => ({ ...p, showPopup: false })); go('surprise'); }} />
    </>;
  } else if (step === 'outing') {
    body = <>
      <Q t="What sort of outing?" sub="This decides the places we suggest and how much time we leave." />
      <Big id="casual" t="Casual" d="Friends, a catch-up, a bite to eat" on={kind === 'casual'} onClick={() => { setKind('casual'); applyOuting('casual', who, meet); }} />
      <Big id="formal" t="Formal" d="A date, a celebration, a smart dinner" on={kind === 'formal'} onClick={() => { setKind('formal'); applyOuting('formal', who, meet); }} />
      {kind === 'formal' && <Note>Adds extra time to get ready, and looks for tables and quieter rooms.</Note>}
      <Big id="meeting" t="Meeting" d="Work coffee, an interview, a business lunch" on={kind === 'meeting'} onClick={() => { setKind('meeting'); applyOuting('meeting', who, meet); }} />
      {kind === 'meeting' && <Note>Allows travel time, picks quiet places with seating and wifi, and never double-books you.</Note>}
      {kind === 'meeting'
        ? <><Lbl>What kind of meeting?</Lbl><Chips id="meet" items={MEET} val={meet} onPick={(k) => { setMeet(k); applyOuting('meeting', who, k); }} /></>
        : <><Lbl>Who is it with?</Lbl><Chips id="who" items={WHO} val={who} onPick={(k) => { setWho(k); applyOuting(kind, k, meet); }} /></>}
    </>;
    next('Next', () => go('when'), true, sumOuting);
  } else if (step === 'etype') {
    body = <>
      <Q t="Which kind of event?" />
      <div style={{ marginTop: 6 }} />
      <Big id="on" t="Find one that is on" d="See what is on near you and add it" on={evPath === 'on'} onClick={() => setEvPath('on')} />
      <Big id="booked" t="Already booked" d="A concert, a friend's party, a wedding, a match" on={evPath === 'booked'} onClick={() => setEvPath('booked')} />
      <Big id="host" t="Host my own" d="A birthday, a party, a get-together" on={evPath === 'host'} onClick={() => setEvPath('host')} />
      <p style={{ ...fr, fontStyle: 'italic', color: MUT, fontSize: 14, margin: '12px 0 0' }}>Hosting finds you a venue and puts it on your schedule.</p>
    </>;
    next('Next', () => go(evPath === 'on' ? 'whatson' : evPath), true, 'An event · ' + (evPath === 'on' ? 'find one that is on' : evPath === 'booked' ? 'already booked' : 'host my own'));
  } else if (step === 'whatson') {
    const list = (events || []).slice().sort((a, b) => evSort === 'free' ? ((b.free ? 1 : 0) - (a.free ? 1 : 0)) : String(a.date + (a.time || '')).localeCompare(String(b.date + (b.time || ''))));
    body = <>
      <Q t="What is on" sub={`Near ${c.loc.city}. Tap Add to put it in your schedule.`} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={cap}>Coming up</span>
        <span style={{ display: 'flex', border: `1.5px solid ${INK}` }}>
          {[['soon', 'Soonest'], ['free', 'Free first']].map(([k, l], i) => <button key={k} onClick={() => setEvSort(k)} style={{ padding: '5px 10px', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 0, borderLeft: i ? `1.5px solid ${INK}` : 0, borderRadius: 0, background: evSort === k ? INK : 'transparent', color: evSort === k ? PAPER : INK }}>{l}</button>)}
        </span>
      </div>
      {evBusy && <p style={{ color: MUT, marginTop: 16 }}>Looking for events near {c.loc.city}…</p>}
      {!evBusy && events && events.length === 0 && <Note>Couldn't find listings right now. Use “Already booked” to add one you know about.</Note>}
      {list.map((e, i) => (
        <div key={i} data-event-row style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${RULE}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...fr, fontWeight: 600, fontSize: 18, lineHeight: 1.1 }}>{e.title}</div>
            <div style={{ fontSize: 12.5, color: MUT, marginTop: 3 }}>{e.date ? c.prettyDate(e.date) : ''}{e.time ? ' ' + e.time : ''}{e.place ? ' · ' + e.place : ''}{e.price ? ' · ' + e.price : ''}</div>
          </div>
          <button data-event-add onClick={() => c.addPlan({ title: e.title, date: e.date || ec.date, startTime: e.time || '19:00', duration: 150, location: e.place || c.loc.city, type: 'social', categoryColor: 'social', meetingType: 'Friendly', notes: 'Event found by Pact.' })} style={{ padding: '8px 12px', background: FOR, color: PAPER, border: 0, borderRadius: 0, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Add</button>
        </div>
      ))}
      <LinkBtn onClick={loadEvents}>Show me different ones</LinkBtn>
    </>;
  } else if (step === 'booked' || step === 'host') {
    const isB = step === 'booked', f = isB ? booked : host, setF = isB ? setBooked : setHost;
    const dayOk = f.date && f.time;
    body = <>
      <Q t={isB ? 'Add the event' : 'Host your own'} sub={isB ? 'Name it however you like. It goes on your schedule.' : 'Name it, pick a time. We can find the venue.'} />
      <Lbl mt={14}>What sort?</Lbl>
      <Chips id="evkind" items={isB ? BOOKED : HOSTK} val={f.kind} onPick={(k) => setF(p => ({ ...p, kind: k }))} />
      <Lbl>What is it called?</Lbl>
      <Inp data-ev-title value={f.title} placeholder={isB ? 'Wolf Alice at the Apollo' : "Sam's 25th birthday"} onChange={e => setF(p => ({ ...p, title: e.target.value }))} />
      {isB && <>
        <Lbl>Who is hosting? (optional)</Lbl>
        <select data-ev-host value={f.host} onChange={e => setF(p => ({ ...p, host: e.target.value }))} style={{ display: 'block', width: '100%', marginTop: 8, padding: 12, border: `1.5px solid ${INK}`, borderRadius: 0, background: PAPER2, fontSize: 16, color: INK }}>
          <option value="">Nobody (tickets)</option>
          {c.friendNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </>}
      <Lbl>When</Lbl>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
        <Inp type="date" value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} />
        <Inp type="time" value={f.time} onChange={e => setF(p => ({ ...p, time: e.target.value }))} />
      </div>
      <Chips id="evdur" items={[[120, '2 hours'], [180, '3 hours'], [240, '4 hours'], [360, 'Most of the day']]} val={f.dur} onPick={(k) => setF(p => ({ ...p, dur: k }))} />
      <Lbl>Where (optional)</Lbl>
      <div style={{ display: 'flex', gap: 8 }}>
        <Inp data-ev-place value={f.place} placeholder="Venue or address" onChange={e => setF(p => ({ ...p, place: e.target.value }))} />
        <button onClick={() => openSearch(isB ? 'booked' : 'host')} style={{ marginTop: 8, padding: '0 14px', border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Search</button>
      </div>
      {!isB && <LinkBtn data-ev-venue onClick={() => { applyOuting('casual', 'group', meet); setEc({ planLabel: f.title || f.kind, date: f.date, startTime: f.time, duration: f.dur, vibeKeywords: f.kind === 'Dinner' ? 'dinner group' : 'pub bar lively' }); setKind('casual'); setFlow('go'); go('where'); }}>Find me a venue instead</LinkBtn>}
      {c.scheduleConflictWarning && <Warn>{c.scheduleConflictWarning}</Warn>}
    </>;
    next('Add to my schedule', () => {
      const clash = c.checkScheduleAndPrepConflict(f.date, f.time, false);
      c.addPlan({ title: isB ? (f.host ? `${f.title} (hosted by ${f.host})` : f.title) : f.title, date: f.date, startTime: f.time, duration: f.dur, location: f.place || 'To be decided', type: 'social', categoryColor: 'social', meetingType: 'Friendly', notes: `${f.kind}${isB ? '' : ' you are hosting'}.`, clash });
    }, !!(f.title.trim() && dayOk), `${f.kind} · ${f.title || 'untitled'}`);
  } else if (step === 'when') {
    body = <>
      <Q t="When suits you?" sub={slots.length ? 'Gaps that fit, from your schedule.' : 'Nothing free in the next week. Pick your own time.'} />
      <div style={{ marginTop: 10 }} />
      {slots.map(s => {
        const on = ec.date === s.date && ec.startTime === s.time;
        const e2 = c.fromMins(c.toMins(s.time) + dur);
        return (
          <button key={s.date + s.time} data-when-slot aria-pressed={on} onClick={() => pickSlot(s.date, s.time)} style={{ display: 'block', width: '100%', textAlign: 'left', marginTop: 10, padding: '12px 14px', border: `1.5px solid ${INK}`, borderRadius: 0, background: on ? FOR : 'transparent', color: on ? PAPER : INK }}>
            <span style={{ ...fr, fontWeight: 600, fontSize: 19 }}>{c.prettyDate(s.date)}, {s.time} – {e2}</span>
            {s.tag && <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, background: on ? PAPER : INK, color: on ? INK : PAPER, padding: '3px 6px' }}>{s.tag}</span>}
            <span style={{ display: 'block', fontSize: 13, opacity: .75, marginTop: 2 }}>{s.line}</span>
          </button>);
      })}
      <Lbl mt={18}>Or pick your own time</Lbl>
      <div data-own-time style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
        <Inp type="date" data-own-date value={ec.date} min={c.todayStr} onChange={e => e.target.value && pickSlot(e.target.value, ec.startTime)} />
        <Inp type="time" data-own-clock value={ec.startTime} onChange={e => e.target.value && pickSlot(ec.date, e.target.value)} />
      </div>
      <p style={{ ...fr, fontStyle: 'italic', color: MUT, fontSize: 15, margin: '16px 0 0' }}>About {durWord(dur).toLowerCase()}. <button onClick={() => setChgDur(o => !o)} style={{ background: 'none', border: 0, padding: 0, textDecoration: 'underline', color: INK, fontStyle: 'italic', fontFamily: 'inherit', fontSize: 'inherit' }}>Change</button></p>
      {chgDur && <Chips id="dur" items={DURS} val={dur} onPick={(k) => setEc({ duration: k })} />}
      {c.scheduleConflictWarning && <Warn>{c.scheduleConflictWarning}</Warn>}
    </>;
    next('Next', () => go('where'), true, `${flow === 'tri' ? (ec.planLabel || 'Activity') : sumOuting} · ${slotText}`);
  } else if (step === 'where') {
    body = <>
      <Q t="Where, and how much?" />
      <Lbl mt={14}>Near</Lbl>
      <div data-planner-where style={{ marginTop: 8, border: `1.5px solid ${INK}`, background: PAPER2, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span data-planner-near style={{ ...fr, fontWeight: 600, fontSize: 18 }}>{[c.loc.city, c.userProfile.location && c.userProfile.location.postcode].filter(Boolean).join(' · ')}{c.locIsDefault && <span style={{ fontStyle: 'italic', fontWeight: 400, color: MUT, fontSize: 14 }}> (default)</span>}</span>
          <button data-planner-gps onClick={c.plannerUseGps} disabled={c.locBusy} style={{ flexShrink: 0, padding: '8px 10px', background: FOR, color: PAPER, border: 0, borderRadius: 0, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Use my location</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input data-planner-pc aria-label="Search near a postcode or town" placeholder="Or type a postcode or town" value={c.pcDraft} onChange={e => c.setPcDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') c.plannerSetPostcode(); }} style={{ flex: 1, minWidth: 0, padding: 9, border: `1px solid ${RULE}`, borderRadius: 0, background: '#fff', fontSize: 14 }} />
          <button data-planner-pc-go onClick={c.plannerSetPostcode} disabled={c.locBusy || !c.pcDraft.trim()} style={{ padding: '0 12px', border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Go</button>
        </div>
        {c.locAsk && <div data-planner-autoask style={{ marginTop: 10, padding: 10, background: PAPER, border: `1px solid ${RULE}` }}>
          <p style={{ margin: 0, fontSize: 13 }}>Keep this up to date automatically? Only while the app is open, and only when you have moved about half a kilometre.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button data-planner-auto-yes onClick={c.autoYes} style={{ padding: '7px 10px', background: FOR, color: PAPER, border: 0, borderRadius: 0, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>Yes, keep it updated</button>
            <button data-planner-auto-no onClick={c.autoNo} style={{ padding: '7px 10px', border: `1px solid ${INK}`, background: 'transparent', borderRadius: 0, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>No thanks</button>
          </div>
        </div>}
        {c.locMsg && <p data-planner-locmsg style={{ margin: '8px 0 0', fontSize: 13, fontStyle: 'italic', color: MUT }}>{c.locMsg}</p>}
      </div>
      <LinkBtn data-search-place onClick={() => openSearch('plan')}>Already chosen a place? Search for it</LinkBtn>
      <Lbl>Budget</Lbl>
      <Seg id="budget" items={[['£', '£', 'Cheap'], ['££', '££', 'Mid'], ['£££', '£££', 'Treat']]} val={ec.budget} onPick={(k) => setEc({ budget: k })} />
      <button data-fine-toggle aria-expanded={fine} onClick={() => setFine(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 20, padding: '12px 0', border: 0, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, background: 'none', borderRadius: 0, textAlign: 'left' }}>
        <span style={{ ...fr, fontWeight: 600, fontSize: 18 }}>Fine-tune</span><span style={cap}>{fine ? 'Hide ▴' : 'Optional ▾'}</span>
      </button>
      {!fine && <p style={{ ...fr, fontStyle: 'italic', fontSize: 14, color: MUT, margin: '8px 0 0' }}>Food needs, the feel you want. Skip it and we choose sensibly.</p>}
      {fine && <div data-fine-body>
        <Lbl mt={14}>Food needs</Lbl>
        <Chips id="diet" multi items={c.dietaryOptionsList} val={ec.dietary} onPick={(d) => setEc({ dietary: ec.dietary.includes(d) ? ec.dietary.filter(x => x !== d) : [...ec.dietary, d] })} />
        <Lbl>The feel</Lbl>
        <Chips id="feel" multi items={FEEL} val={feel} onPick={(k) => { const n = feel.includes(k) ? feel.filter(x => x !== k) : [...feel, k]; setFeel(n); setEc({ vibeKeywords: [(ec.vibeKeywords || '').split(' ').filter(w => !FEEL.some(f => f[0] === w)).join(' '), ...n].join(' ').trim() }); }} />
        <Lbl>Anything specific?</Lbl>
        <Inp placeholder="e.g. Italian, rooftop, vegan" value={extra} onChange={e => { const v = e.target.value; setEc({ vibeKeywords: (ec.vibeKeywords || '').replace(extra, '').trim() + (v ? ' ' + v : '') }); setExtra(v); }} />
      </div>}
    </>;
    next('Find places', findPlaces, true, `${flow === 'tri' ? (ec.planLabel || 'Activity') : sumOuting} · ${slotText} · ${ec.budget}`);
  } else if (step === 'results') {
    const venues = c.venues;
    const selI = venues.findIndex(v => c.selectedVenue && v.id === c.selectedVenue.id);
    const chosenI = selI >= 0 ? selI : 0;
    body = <>
      <Q t="Here you go" sub={`${slotText}. Tap Add and it is on your schedule.`} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={cap}>{venues.length ? 'Places that fit' : ' '}</span>
        <span data-planner-sort style={{ display: 'flex', border: `1.5px solid ${INK}` }}>
          {[['best', 'Best'], ['near', 'Nearest']].map(([k, l], i) => <button key={k} data-planner-sort-btn={k} onClick={() => { c.setVenueSort(k); c.setVenueRefreshOffset(0); }} style={{ padding: '5px 10px', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, border: 0, borderLeft: i ? `1.5px solid ${INK}` : 0, borderRadius: 0, background: c.venueSort === k ? INK : 'transparent', color: c.venueSort === k ? PAPER : INK }}>{l}</button>)}
        </span>
      </div>
      {venues.length === 0 && <div data-planner-empty style={{ marginTop: 14, padding: 12, border: `1px solid ${RULE}`, fontSize: 14, color: MUT, lineHeight: 1.4 }}>{c.searchingVenues ? 'Searching…' : `We couldn't find ${c.venueIntent.label || 'places'} near ${c.loc.city} yet. Try “Show me different ones”, or search for a place you have in mind.`}</div>}
      {venues.map((v, i) => {
        const on = i === chosenI;
        return (
          <button key={v.id + "_" + i} data-venue-id={String(v.id)} data-venue-card aria-pressed={on} onClick={() => c.setSelectedVenue(v)} style={{ display: 'flex', gap: 12, width: '100%', textAlign: 'left', marginTop: 10, padding: '12px', border: on ? `2px solid ${INK}` : `1px solid ${RULE}`, borderRadius: 0, background: on ? PAPER2 : 'transparent' }}>
            <span style={{ ...fr, fontWeight: 600, fontSize: 24, color: on ? CLAY : SOFT, width: 18 }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ ...fr, fontWeight: 600, fontSize: 19, lineHeight: 1.1, display: 'block' }}>{v.name}</span>
              <span style={{ fontSize: 13, color: MUT, display: 'block', marginTop: 3, lineHeight: 1.3 }}>{v.reviewSnippet}</span>
              <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: MUT, display: 'block', marginTop: 5 }}>{v.price}{v.rating ? ` · ★ ${v.rating}` : ''}{v.transportNote ? ' · ' + v.transportNote : ''}</span>
            </span>
          </button>);
      })}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <LinkBtn data-more-venues onClick={() => c.refreshVenues()}>{c.searchingVenues ? 'Searching…' : 'Show me different ones'}</LinkBtn>
        <LinkBtn onClick={() => openSearch('plan')}>Search for a place I have in mind</LinkBtn>
      </div>
    </>;
    next('Add to my schedule', c.confirmPlan, venues.length > 0, `Tonight · ${slotText}`);
    foot.summary = null;
  } else if (step === 'search') {
    body = <>
      <Q t="Search for a place" sub="Already picked somewhere? Find it and we will use it." />
      <div style={{ display: 'flex', gap: 8 }}>
        <Inp data-place-q autoFocus value={sq} placeholder="Name of the place" onChange={e => setSq(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doSearch(); }} />
        <button data-place-go onClick={doSearch} disabled={!sq.trim() || sbusy} style={{ marginTop: 8, padding: '0 16px', background: FOR, color: PAPER, border: 0, borderRadius: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Search</button>
      </div>
      {sbusy && <p style={{ color: MUT, marginTop: 14 }}>Searching near {c.loc.city}…</p>}
      {sres && <div style={{ ...cap, marginTop: 16 }}>Matches near {c.loc.city}</div>}
      {sres && sres.map((p, i) => (
        <button key={i} data-place-row onClick={() => usePlace(p)} style={{ display: 'flex', width: '100%', textAlign: 'left', gap: 12, padding: '12px 4px', border: 0, borderBottom: `1px solid ${RULE}`, borderRadius: 0, background: 'none' }}>
          <span style={{ flex: 1 }}><span style={{ ...fr, fontWeight: 600, fontSize: 18, display: 'block', lineHeight: 1.1 }}>{p.name}</span><span style={{ fontSize: 13, color: MUT }}>{p.addr}</span></span>
          {p.dist && <span style={{ ...cap, alignSelf: 'center' }}>{p.dist}</span>}
        </button>))}
      {sres && sres.length === 0 && <Note>Nothing found. Check the spelling, or type the name and address yourself below.</Note>}
      {sres && <LinkBtn data-place-manual onClick={() => usePlace({ name: sq.trim(), addr: '' })}>Not listed? Use “{sq.trim() || 'what you typed'}” as the place</LinkBtn>}
    </>;
  } else if (step === 'task') {
    const f = taskF;
    body = <>
      <Q t="What needs doing?" />
      <Lbl mt={14}>Name it</Lbl>
      <Inp data-task-name value={f.title} placeholder="Finish dissertation chapter 3" onChange={e => setTaskF(p => ({ ...p, title: e.target.value }))} />
      <Lbl>How long?</Lbl>
      <Chips id="thours" items={[[0.25, '15 min'], [0.5, '30 min'], [1, '1 hour'], [2, '2 hours'], [4, 'Half a day']]} val={f.hours} onPick={(k) => setTaskF(p => ({ ...p, hours: k }))} />
      <Lbl>Done by</Lbl>
      <Seg id="tby" items={[['today', 'Today'], ['tomorrow', 'Tomorrow'], ['week', c.dayWord(c.addDays(c.todayStr, 4))], ['other', 'Other']]} val={f.by} onPick={(k) => setTaskF(p => ({ ...p, by: k }))} />
      {f.by === 'other' && <Inp type="date" value={f.other} min={c.todayStr} onChange={e => setTaskF(p => ({ ...p, other: e.target.value }))} />}
      <p style={{ ...fr, fontStyle: 'italic', color: MUT, fontSize: 15, margin: '14px 0 0' }}>We will find a gap that fits. You can move it afterwards.</p>
    </>;
    next('Find a slot', () => {
      const deadline = f.by === 'today' ? c.todayStr : f.by === 'tomorrow' ? c.addDays(c.todayStr, 1) : f.by === 'week' ? c.addDays(c.todayStr, 4) : (f.other || c.addDays(c.todayStr, 7));
      c.setTaskConfig(p => ({ ...p, title: f.title.trim(), totalHours: f.hours, blocks: f.hours > 2 ? 2 : 1, deadline, date: c.todayStr > c.selectedDateStr ? c.todayStr : c.selectedDateStr, pref: 'any', startTime: '08:00' }));
      c.setPlannerMode('task'); go('taskres');
    }, !!f.title.trim(), null);
  } else if (step === 'taskres') {
    const tp = c.taskPlan;
    body = <>
      <Q t="Here is where it fits" sub="Only free time, nothing double-booked." />
      {tp && tp.blocks.length === 0 && <Note>No free slot found before the deadline. Go back and give it more days or less time.</Note>}
      {tp && tp.blocks.map((blk, i) => (
        <div key={`${blk.date}-${blk.s}`} data-task-block style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${RULE}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...fr, fontWeight: 600, fontSize: 19 }}>{tp.blocks.length > 1 ? `Part ${i + 1} of ${tp.blocks.length} · ` : ''}{c.prettyDate(blk.date)}</div>
            <div style={{ fontSize: 13, color: MUT }}>{c.fromMins(blk.s)}–{c.fromMins(blk.e)} ({blk.len} min)</div>
          </div>
          {blk.options > 1 && <button data-task-other onClick={() => c.otherTime(blk.index)} style={{ padding: '7px 10px', border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Other time</button>}
        </div>))}
      {tp && tp.warnings.map(w => <Warn key={w}>{w}</Warn>)}
      <Lbl mt={18}>Or pick your own time</Lbl>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
        <Inp type="date" data-task-own-date value={taskOwn.date || c.todayStr} min={c.todayStr} onChange={e => setTaskOwn(p => ({ ...p, date: e.target.value }))} />
        <Inp type="time" data-task-own-clock value={taskOwn.time || '09:00'} onChange={e => setTaskOwn(p => ({ ...p, time: e.target.value }))} />
      </div>
      <button data-task-own-add disabled={!taskF.title.trim()} onClick={() => c.addPlan({ title: taskF.title.trim(), date: taskOwn.date || c.todayStr, startTime: taskOwn.time || '09:00', duration: Math.round((taskF.hours || 1) * 60), type: 'analytical', categoryColor: 'work', meetingType: 'Business', notes: '' })} style={{ marginTop: 10, width: '100%', height: 46, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', color: INK, fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: !taskF.title.trim() ? .4 : 1 }}>Add at my own time</button>
    </>;
    next(tp && tp.failed > 0 ? `Add the ${tp.blocks.length} that fit` : 'Add to my schedule', c.confirmPlan, !!(tp && tp.blocks.length), null);
  } else if (step === 'try') {
    body = <>
      <Q t="What would you like to try?" />
      <Chips id="try" items={TRY.map(t => [t[0], t[1]])} val={ec.activityDropdown} onPick={(k) => { const t = TRY.find(x => x[0] === k); setEc({ activityDropdown: k, vibeKeywords: t[2], planLabel: t[1], duration: 90 }); }} />
      <Lbl>Or say what you have in mind</Lbl>
      <Inp placeholder="e.g. crazy golf, a pottery class" onChange={e => setEc({ vibeKeywords: e.target.value, planLabel: e.target.value || 'Activity', activityDropdown: e.target.value || ec.activityDropdown })} />
    </>;
    next('Next', () => go('when'), true, null);
  } else if (step === 'surprise') {
    const sc = c.surpriseConfig, setSc = (p) => c.setSurpriseConfig(prev => ({ ...prev, ...p }));
    const sug = c.suggestStartTimes(sc.day, sc.duration);
    body = <>
      <Q t="Surprise me" sub="Pick the mood. We pick the place." />
      <Lbl mt={14}>Mood</Lbl>
      <Chips id="vibe" items={['Adventurous & Quirky', 'Cozy & Cultural', 'Creative & Hands-On', 'Outdoor & Refreshing']} val={sc.vibe} onPick={(k) => setSc({ vibe: k })} />
      <Lbl>Budget</Lbl>
      <Seg id="sbud" items={[['Free', 'Free'], ['£', '£', 'under £15'], ['££', '££', '£15–35']]} val={sc.budget} onPick={(k) => setSc({ budget: k })} />
      <Lbl>How long?</Lbl>
      <Chips id="sdur" items={[[60, '1 hour'], [90, '1½ hours'], [150, '2½ hours']]} val={sc.duration} onPick={(k) => setSc({ duration: k })} />
      <Lbl>When</Lbl>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
        <Inp type="date" value={sc.day} onChange={e => setSc({ day: e.target.value })} />
        <Inp type="time" value={sc.startTime} onChange={e => setSc({ startTime: e.target.value })} />
      </div>
      {sug.length > 0 && <Chips id="ssug" items={sug.map(s => [s.time, s.time])} val={sc.startTime} onPick={(k) => setSc({ startTime: k })} />}
      {sc.showPopup && <div data-surprise-pick style={{ marginTop: 18, padding: 14, background: FOR, color: PAPER }}>
        <div style={{ ...cap, color: '#E7B89F' }}>Mystery pick</div>
        <div style={{ ...fr, fontWeight: 600, fontSize: 24, lineHeight: 1.05, marginTop: 4 }}>{c.surpriseLoading ? 'Rolling…' : (c.surprisePick ? c.surprisePick.title : '')}</div>
        {c.surprisePick && <p style={{ fontSize: 14, margin: '8px 0 0', opacity: .9 }}>{c.surprisePick.desc}</p>}
        {c.surprisePick && <div style={{ fontSize: 12, marginTop: 8, opacity: .75 }}>{c.surprisePick.location} · {c.surprisePick.transport} · {c.surprisePick.cost}</div>}
        {c.surprisePick && c.surprisePick.link && <a href={c.surprisePick.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, color: PAPER, fontSize: 12, textDecoration: 'underline' }}>Find info and tickets</a>}
        <div><button data-surprise-roll onClick={c.rollSurprise} style={{ marginTop: 12, padding: '8px 12px', border: `1.5px solid ${PAPER}`, borderRadius: 0, background: 'transparent', color: PAPER, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Roll again</button></div>
      </div>}
    </>;
    next(sc.showPopup ? 'Accept and add' : 'Reveal my surprise', sc.showPopup ? c.confirmPlan : c.rollSurprise, sc.showPopup ? !!c.surprisePick && !c.surpriseLoading : true, null);
  }

  const total = fl.length;
  return (
    <div data-planner-wizard style={{ position: 'fixed', inset: 0, zIndex: 40, background: PAPER, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div style={{ padding: '14px 22px 0', flex: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button data-plan-back onClick={back} aria-label="Back" style={{ background: 'none', border: 0, padding: 0, fontSize: 13, fontWeight: 600, color: INK }}>{hist.length ? '‹ Back' : ''}</button>
          <span style={cap}>{c.linkedTargetId ? 'Weekly target' : 'New plan'}{step !== 'search' && step !== 'what' ? ` · ${Math.min(pos + 1, total)} of ${total}` : ''}</span>
          <button data-plan-close onClick={c.onClose} aria-label="Close" style={{ background: 'none', border: 0, padding: 0, fontSize: 22, lineHeight: 1, color: INK }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {fl.map((s, i) => <span key={s} style={{ flex: 1, height: 3, background: i <= pos ? INK : RULE }} />)}
        </div>
      </div>
      <div data-plan-body style={{ flex: 1, overflowY: 'auto', padding: '10px 22px 24px' }}>{body}</div>
      {foot && (
        <div style={{ flex: 'none', padding: '10px 22px calc(14px + env(safe-area-inset-bottom))', borderTop: `1px solid ${RULE}`, background: PAPER }}>
          {foot.summary && <div style={{ ...fr, fontStyle: 'italic', fontSize: 13, color: MUT, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{foot.summary}</div>}
          <button data-plan-next disabled={!foot.enabled} onClick={foot.onClick} style={{ width: '100%', height: 48, border: 0, borderRadius: 0, background: FOR, color: PAPER, fontSize: 15, fontWeight: 600, opacity: foot.enabled ? 1 : .4 }}>{foot.label}</button>
        </div>)}
    </div>
  );
}
