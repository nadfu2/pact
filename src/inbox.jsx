// Messages: the inbox ("The Post"), what can be shared in a chat, and how shared things look.
// Shared things travel inside an ordinary message: a readable first line, then an invisible separator and a small JSON payload.
import React, { useEffect, useRef, useState } from 'react';

const INK = '#1B2A22', FOR = '#1F3A2E', CLAY = '#C8643C', MUT = '#5A675F', RULE = '#CFC7B4', PAPER = '#F4EFE4';
const FR = { fontFamily: "'Fraunces', Georgia, serif" };
const SEP = '⁣';

export const packShare = (type, data) => {
  const line = type === 'idea' ? `Shared an idea: ${data.title}` : type === 'friend' ? `Shared a friend: ${data.name}` : type === 'photo' ? 'Sent a photo' : type === 'voice' ? 'Sent a voice note' : type === 'doc' ? `Sent a document: ${data.name}` : 'Shared something';
  return `${line}${SEP}${JSON.stringify({ t: type, ...data })}`.slice(0, 1990);
};
export const parseShare = (body) => {
  const s = String(body || ''); const i = s.indexOf(SEP);
  if (i < 0) return null;
  try { const d = JSON.parse(s.slice(i + 1)); return d && d.t ? { line: s.slice(0, i), ...d } : null; } catch (e) { return null; }
};
// A reply: the typed text, then who and what it answers.
export const packReply = (text, q, w, id) => `${text}${SEP}${JSON.stringify({ t: 'reply', q: String(q || '').slice(0, 120), w: String(w || '').slice(0, 40), id: id || '' })}`.slice(0, 1990);
export const previewOf = (body) => { const s = String(body || ''); const i = s.indexOf(SEP); return i < 0 ? s : s.slice(0, i); };

const when = (iso) => {
  if (!iso) return '';
  const d = new Date(iso), n = new Date();
  if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((n - d) / 86400000);
  if (days < 6) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// Shrinks a photo before it is uploaded (long edge 1400px, JPEG) so chats stay quick.
export const shrinkPhoto = (file, max = 1400) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file); const img = new Image();
  img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    c.toBlob(b => b ? resolve(b) : reject(new Error('photo')), 'image/jpeg', 0.84);
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('photo')); };
  img.src = url;
});

const fmtSize = (n) => !n ? '' : n < 1024 * 1024 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1024 / 1024).toFixed(1) + ' MB';
const mmss = (s) => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

// Swipe a message to the right to reply (like WhatsApp); a tap also reveals a Reply button.
export function SwipeRow({ id, mine, onReply, children }) {
  const [dx, setDx] = useState(0); const [tap, setTap] = useState(false); const st = useRef(null);
  const start = (e) => { const t = e.touches[0]; st.current = { x: t.clientX, y: t.clientY, lock: null }; };
  const move = (e) => {
    const g = st.current; if (!g) return; const t = e.touches[0]; const ddx = t.clientX - g.x, ddy = t.clientY - g.y;
    if (g.lock === null && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) g.lock = Math.abs(ddx) > Math.abs(ddy) * 1.4 && ddx > 0 ? 'x' : 'y';
    if (g.lock === 'x') setDx(Math.min(72, ddx * 0.6));
  };
  const end = () => { const g = st.current; st.current = null; if (g && g.lock === 'x' && dx >= 40) onReply(); setDx(0); };
  return (
    <div data-msg-id={id} style={{ position: 'relative' }} onTouchStart={start} onTouchMove={move} onTouchEnd={end} onTouchCancel={() => { st.current = null; setDx(0); }}>
      <span aria-hidden style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', opacity: Math.min(1, dx / 40), fontSize: 20, color: MUT }}>&#8617;</span>
      <div onClick={() => setTap(t => !t)} style={{ transform: `translateX(${dx}px)`, transition: dx ? 'none' : 'transform .25s cubic-bezier(.22,.61,.36,1)' }}>
        {children}
        {tap && <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: 2 }}><button data-reply-btn onClick={(e) => { e.stopPropagation(); setTap(false); onReply(); }} style={{ background: 'none', border: 0, borderRadius: 0, color: MUT, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 4px' }}>&#8617; Reply</button></div>}
      </div>
    </div>
  );
}

// A text bubble that answers an earlier message.
export function ReplyBubble({ m, mine, receipt }) {
  const s = parseShare(m.body); if (!s) return null;
  const jump = () => { const el = document.querySelector(`[data-msg-id="${s.id}"]`); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  return (
    <div data-chat-msg data-chat-reply style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', animation: m.anim ? 'pact-pop .42s cubic-bezier(.22,.61,.36,1) both' : 'none' }}>
      <div style={{ maxWidth: '78%', padding: '7px 7px 9px', fontSize: 16, lineHeight: 1.35, overflowWrap: 'anywhere', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: mine ? FOR : '#FAF4E0', color: mine ? PAPER : INK, border: mine ? 0 : '1px solid #E6DCC0' }}>
        <button data-reply-quote onClick={(e) => { e.stopPropagation(); jump(); }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderLeft: `3px solid ${CLAY}`, borderRadius: 6, background: mine ? 'rgba(244,239,228,.14)' : 'rgba(27,42,34,.07)', color: 'inherit', padding: '5px 9px', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: mine ? '#E7B79F' : CLAY, letterSpacing: '.04em' }}>{s.w}</div>
          <div style={{ fontSize: 13, opacity: .85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.q}</div>
        </button>
        <div style={{ padding: '0 7px' }}>{s.line}</div>
      </div>
      {receipt && <div data-chat-receipt style={{ fontSize: 11, color: MUT, marginTop: 3, letterSpacing: '.04em' }}>{receipt}</div>}
    </div>
  );
}

// Plays a voice note.
export function VoiceCard({ url, dur, mine, compact }) {
  const a = useRef(null); const [on, setOn] = useState(false); const [p, setP] = useState(0); const [d, setD] = useState(dur || 0);
  const toggle = () => { const el = a.current; if (!el) return; if (el.paused) { el.play().then(() => setOn(true)).catch(() => setOn(false)); } else { el.pause(); setOn(false); } };
  const bars = Array.from({ length: 28 }, (_, i) => 4 + Math.round(Math.abs(Math.sin(i * 1.7) * 11 + Math.cos(i * 0.6) * 5)));
  return (
    <div data-voice style={{ display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '6px 0' : '10px 12px', minWidth: 210 }}>
      <audio ref={a} src={url} preload="metadata" onTimeUpdate={e => setP(e.target.currentTime)} onLoadedMetadata={e => { if (isFinite(e.target.duration)) setD(e.target.duration); }} onEnded={() => { setOn(false); setP(0); }} />
      <button data-voice-play aria-label={on ? 'Pause voice note' : 'Play voice note'} onClick={(e) => { e.stopPropagation(); toggle(); }} style={{ width: 38, height: 38, flex: 'none', border: 0, borderRadius: 19, background: mine ? CLAY : FOR, color: PAPER, fontSize: 14 }}>{on ? '❚❚' : '▶'}</button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 28 }}>
        {bars.map((h, i) => <span key={i} style={{ width: 3, height: h, borderRadius: 2, background: d && p / d > i / bars.length ? CLAY : '#B9B19C' }} />)}
      </div>
      <span style={{ fontSize: 12, color: MUT, flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{mmss(on || p ? p : d)}</span>
    </div>
  );
}

// A document (a ticket, a PDF, a booking confirmation).
export function DocRow({ s, compact }) {
  const ext = (String(s.name || '').split('.').pop() || 'file').slice(0, 4).toUpperCase();
  return (
    <a data-doc href={s.url} target="_blank" rel="noreferrer" download={s.name} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: compact ? '10px 0' : '10px 12px', color: INK, textDecoration: 'none' }}>
      <span style={{ width: 42, height: 48, flex: 'none', border: `1.5px solid ${INK}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: '.06em', background: 'rgba(250,244,224,.9)' }}>{ext}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ ...FR, display: 'block', fontWeight: 600, fontSize: 16, lineHeight: 1.15, wordBreak: 'break-word' }}>{s.name}</span>
        <span style={{ display: 'block', fontSize: 12, color: MUT, marginTop: 2 }}>{[fmtSize(s.size), 'Tap to open'].filter(Boolean).join(' · ')}</span>
      </span>
    </a>
  );
}

// Records a voice note.
function Recorder({ onSend, onCancel }) {
  const [state, setState] = useState('idle'); const [secs, setSecs] = useState(0); const [err, setErr] = useState('');
  const mr = useRef(null), chunks = useRef([]), stream = useRef(null), t0 = useRef(0), tick = useRef(0), cancelled = useRef(false);
  useEffect(() => () => { cancelled.current = true; clearInterval(tick.current); try { if (mr.current && mr.current.state !== 'inactive') mr.current.stop(); } catch (e) { /* ignore */ } try { stream.current && stream.current.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ } }, []);
  const start = async () => {
    setErr('');
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('unsupported');
      const st = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = st;
      const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
      const mt = types.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
      const rec = new MediaRecorder(st, mt ? { mimeType: mt } : undefined); mr.current = rec; chunks.current = []; cancelled.current = false;
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        clearInterval(tick.current); try { st.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ }
        if (cancelled.current) return;
        const type = (rec.mimeType || mt || 'audio/webm').split(';')[0]; const blob = new Blob(chunks.current, { type });
        onSend(blob, Math.max(1, Math.round((Date.now() - t0.current) / 1000)), type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm', type);
      };
      t0.current = Date.now(); rec.start(); setSecs(0); setState('rec'); tick.current = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 250);
    } catch (e) { setErr(e && e.name === 'NotAllowedError' ? 'Pact needs your microphone. Allow it in your browser settings and try again.' : "This browser can't record a voice note."); setState('idle'); }
  };
  const stop = () => { try { mr.current && mr.current.stop(); } catch (e) { /* ignore */ } setState('sending'); };
  const cancel = () => { cancelled.current = true; try { mr.current && mr.current.state !== 'inactive' && mr.current.stop(); } catch (e) { /* ignore */ } onCancel(); };
  return (
    <div data-recorder style={{ textAlign: 'center', padding: '10px 0 4px' }}>
      <div style={{ ...FR, fontSize: 40, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{mmss(secs)}</div>
      <div style={{ fontSize: 12, color: err ? '#A4452A' : MUT, margin: '2px 0 12px', minHeight: 16 }}>{err || (state === 'rec' ? 'Recording. Tap Send when you are done.' : state === 'sending' ? 'Sending' : 'Tap the button to start.')}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button data-rec-cancel onClick={cancel} style={{ flex: 1, height: 46, border: `1.5px solid ${INK}`, borderRadius: 0, background: 'transparent', color: INK, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Cancel</button>
        {state !== 'rec' ? <button data-rec-start disabled={state === 'sending'} onClick={start} style={{ flex: 2, height: 46, border: 0, borderRadius: 0, background: CLAY, color: PAPER, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>&#9679; Record</button>
          : <button data-rec-send onClick={stop} style={{ flex: 2, height: 46, border: 0, borderRadius: 0, background: FOR, color: PAPER, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Send</button>}
      </div>
    </div>
  );
}

// Everything shared in one chat: photos, documents and voice notes.
export function ArchiveSheet({ name, msgs, busy, onClose }) {
  const [tab, setTab] = useState('photo');
  const items = (msgs || []).map(m => ({ m, s: parseShare(m.body) })).filter(x => x.s);
  const by = (t) => items.filter(x => x.s.t === t).reverse();
  const photos = by('photo'), docs = by('doc'), voices = by('voice');
  const T = ({ id, l, n }) => <button data-archive-tab={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '10px 4px', background: tab === id ? INK : 'transparent', color: tab === id ? PAPER : INK, border: 0, borderRight: `1px solid ${INK}`, borderRadius: 0, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{l} ({n})</button>;
  const when = (m) => new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <div data-archive style={{ position: 'absolute', inset: 0, zIndex: 6, background: PAPER, display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0px)', animation: 'pact-up .26s cubic-bezier(.2,.9,.25,1) both' }}>
      <div style={{ padding: '10px 16px 8px', borderBottom: `3px double ${INK}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button data-archive-close aria-label="Back to chat" onClick={onClose} style={{ background: 'none', border: 0, borderRadius: 0, fontSize: 15, fontWeight: 700, padding: '8px 4px', color: INK }}>&lsaquo; Chat</button>
        <div style={{ flex: 1, textAlign: 'center', paddingRight: 52 }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: CLAY }}>Archive</div>
          <div style={{ ...FR, fontWeight: 600, fontSize: 20, color: INK }}>{name}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${INK}`, borderLeft: `1px solid ${INK}` }}><T id="photo" l="Photos" n={photos.length} /><T id="doc" l="Documents" n={docs.length} /><T id="voice" l="Voice" n={voices.length} /></div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        {busy && !items.length && <p style={{ ...FR, fontStyle: 'italic', color: MUT, textAlign: 'center' }}>Loading</p>}
        {tab === 'photo' && (photos.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>{photos.map(({ m, s }) => <a key={m.id} data-archive-photo href={s.url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1 / 1', overflow: 'hidden', background: '#E6DCC0' }}><img src={s.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></a>)}</div> : <p data-archive-empty style={{ ...FR, fontStyle: 'italic', color: MUT, textAlign: 'center', marginTop: 40 }}>No photos sent yet.</p>)}
        {tab === 'doc' && (docs.length ? docs.map(({ m, s }) => <div key={m.id} data-archive-doc style={{ borderBottom: `1px solid ${RULE}` }}><DocRow s={s} compact /><div style={{ fontSize: 11, color: MUT, margin: '-6px 0 8px 54px' }}>{m.mine ? 'You' : name} · {when(m)}</div></div>) : <p data-archive-empty style={{ ...FR, fontStyle: 'italic', color: MUT, textAlign: 'center', marginTop: 40 }}>No documents yet. Tickets and bookings you send each other will collect here.</p>)}
        {tab === 'voice' && (voices.length ? voices.map(({ m, s }) => <div key={m.id} data-archive-voice style={{ borderBottom: `1px solid ${RULE}` }}><VoiceCard url={s.url} dur={s.dur} mine={m.mine} compact /><div style={{ fontSize: 11, color: MUT, margin: '-2px 0 8px 48px' }}>{m.mine ? 'You' : name} · {when(m)}</div></div>) : <p data-archive-empty style={{ ...FR, fontStyle: 'italic', color: MUT, textAlign: 'center', marginTop: 40 }}>No voice notes yet.</p>)}
      </div>
    </div>
  );
}

// ---------- The inbox ----------
export function InboxSheet({ rows, friends, unreadBy, Mug, onOpen, onClose }) {
  const talking = new Set(rows.map(r => r.user_id));
  const fresh = friends.filter(f => !talking.has(f.userId));
  const byId = Object.fromEntries(friends.map(f => [f.userId, f]));
  return (
    <div data-inbox className="fixed inset-0 z-[310]" style={{ background: PAPER, animation: 'pact-up .26s cubic-bezier(.2,.9,.25,1) both' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div style={{ padding: '12px 20px 10px', borderBottom: `3px double ${INK}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700, color: CLAY }}>The Post</div>
            <div style={{ ...FR, fontWeight: 600, fontSize: 34, lineHeight: 1, color: INK, marginTop: 4 }}>Messages</div>
          </div>
          <button data-inbox-close aria-label="Close messages" onClick={onClose} style={{ background: 'none', border: `1.5px solid ${INK}`, borderRadius: 0, width: 38, height: 38, fontSize: 18, color: INK }}>&times;</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {friends.length > 0 && (
            <div style={{ padding: '14px 20px 6px' }}>
              <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: MUT, fontWeight: 700 }}>{fresh.length ? 'Start a chat' : 'Your friends'}</div>
              <div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', marginTop: 10, paddingBottom: 6 }}>
                {(fresh.length ? fresh : friends).map((f, i) => (
                  <button key={f.userId} data-inbox-start={f.userId} onClick={() => onOpen(f)} style={{ background: 'none', border: 0, padding: 0, borderRadius: 0, textAlign: 'center', flex: 'none', width: 62 }}>
                    <Mug src={f.avatar} name={f.name} w={62} h={62} tone={i} />
                    <div style={{ fontSize: 11, marginTop: 5, color: INK, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(f.name || '').split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: 8, borderTop: `1px solid ${INK}` }}>
            {rows.length === 0 && <p data-inbox-empty style={{ ...FR, fontStyle: 'italic', color: MUT, fontSize: 17, textAlign: 'center', margin: '44px 28px' }}>{friends.length ? 'No letters yet. Pick a friend above and say hello.' : 'Add a friend in the Social tab and your conversations will live here.'}</p>}
            {rows.map((r, i) => {
              const fr = byId[r.user_id] || { userId: r.user_id, name: r.display_name || r.username, handle: r.username ? '@' + r.username : '' };
              const un = unreadBy[r.user_id] || 0;
              return (
                <button key={r.user_id} data-inbox-row={r.user_id} onClick={() => onOpen(fr)} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: 'none', border: 0, borderBottom: `1px solid ${RULE}`, borderRadius: 0, padding: '14px 20px', position: 'relative', animation: `pact-up .4s cubic-bezier(.22,.61,.36,1) ${Math.min(i, 8) * 40}ms both` }}>
                  {un > 0 && <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 4, background: CLAY }} />}
                  <Mug src={fr.avatar} name={fr.name} w={54} h={54} tone={i} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ ...FR, fontWeight: un ? 700 : 600, fontSize: 20, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fr.name}</span>
                      <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: un ? CLAY : MUT, fontWeight: 700, flex: 'none' }}>{when(r.last_at)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ ...FR, fontStyle: 'italic', fontSize: 15, color: un ? INK : MUT, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewOf(r.last_body)}</span>
                      {un > 0 && <span data-inbox-unread style={{ background: CLAY, color: PAPER, fontSize: 11, fontWeight: 700, minWidth: 20, height: 20, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{un}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- What can be shared ----------
const Tile = ({ id, t, d, onClick }) => (
  <button data-share-opt={id} onClick={onClick} style={{ textAlign: 'left', background: 'rgba(250,244,224,.6)', border: `1.5px solid ${INK}`, borderRadius: 0, padding: '12px 12px 11px', color: INK }}>
    <div style={{ ...FR, fontWeight: 600, fontSize: 18 }}>{t}</div>
    <div style={{ fontSize: 12, color: MUT, marginTop: 2 }}>{d}</div>
  </button>
);
const Pick = ({ id, t, d, onClick }) => (
  <button data-share-pick={id} onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, borderBottom: `1px solid ${RULE}`, borderRadius: 0, padding: '11px 2px', color: INK }}>
    <div style={{ ...FR, fontWeight: 600, fontSize: 17 }}>{t}</div>
    {d && <div style={{ fontSize: 12, color: MUT, marginTop: 1 }}>{d}</div>}
  </button>
);

export function ShareSheet({ friend, ideas, plans, friends, onPhoto, onIdea, onPlan, onFriend, onVoice, onDoc, onClose }) {
  const [view, setView] = useState('menu');
  const file = useRef(null), docRef = useRef(null);
  const others = friends.filter(f => f.userId !== friend.userId);
  const back = <button onClick={() => setView('menu')} style={{ background: 'none', border: 0, color: MUT, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 0 8px' }}>&lsaquo; Back</button>;
  return (
    <div data-share-sheet style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(27,42,34,.45)', animation: 'pact-fade .2s ease both' }} />
      <div style={{ position: 'relative', background: PAPER, borderTop: `3px double ${INK}`, padding: '16px 20px calc(18px + env(safe-area-inset-bottom, 0px))', maxHeight: '70%', overflowY: 'auto', animation: 'pact-up .3s cubic-bezier(.2,.9,.25,1) both' }}>
        <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: CLAY }}>Send {String(friend.name || '').split(' ')[0] || 'them'}</div>
        {view === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <Tile id="photo" t="A photo" d="From your camera or library" onClick={() => file.current && file.current.click()} />
            <Tile id="idea" t="An idea" d="Somewhere worth going" onClick={() => setView('idea')} />
            <Tile id="plan" t="A plan to join" d="Invite them to something" onClick={() => setView('plan')} />
            <Tile id="friend" t="A Pact friend" d="Introduce someone" onClick={() => setView('friend')} />
            <Tile id="voice" t="A voice note" d="Say it instead of typing" onClick={() => setView('voice')} />
            <Tile id="doc" t="A document" d="Tickets, bookings, PDFs" onClick={() => docRef.current && docRef.current.click()} />
            <input ref={docRef} data-share-doc type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.pkpass,.ics,.zip,image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) onDoc(f); }} />
            <input ref={file} data-share-file type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) onPhoto(f); }} />
          </div>
        )}
        {view === 'voice' && <div style={{ marginTop: 10 }}>{back}<Recorder onSend={onVoice} onCancel={() => setView('menu')} /></div>}
        {view === 'idea' && <div style={{ marginTop: 10 }}>{back}{ideas.length === 0 && <p style={{ ...FR, fontStyle: 'italic', color: MUT }}>Save an idea with the heart in Ideas, or browse and it will show up here.</p>}{ideas.map((i, k) => <Pick key={k} id={k} t={i.title} d={[i.loc, i.cost === 0 ? 'Free' : i.cost ? '£' + i.cost : ''].filter(Boolean).join(' · ')} onClick={() => onIdea(i)} />)}</div>}
        {view === 'plan' && <div style={{ marginTop: 10 }}>{back}{plans.length === 0 && <p style={{ ...FR, fontStyle: 'italic', color: MUT }}>You have nothing coming up to invite them to. Make a plan first.</p>}{plans.map(p => <Pick key={p.id} id={p.id} t={p.title} d={`${p.date} · ${p.startTime}`} onClick={() => onPlan(p)} />)}</div>}
        {view === 'friend' && <div style={{ marginTop: 10 }}>{back}{others.length === 0 && <p style={{ ...FR, fontStyle: 'italic', color: MUT }}>You have no other Pact friends to share yet.</p>}{others.map(f => <Pick key={f.userId} id={f.userId} t={f.name} d={f.handle} onClick={() => onFriend(f)} />)}</div>}
      </div>
    </div>
  );
}

// ---------- How a shared thing looks in the chat ----------
export function ShareCard({ m, mine, Mug, onSaveIdea, onAddFriend, onPhoto, friendIds, myId, receipt }) {
  const s = parseShare(m.body); if (!s) return null;
  const card = { border: `1.5px solid ${INK}`, background: 'rgba(250,248,242,.9)', width: s.t === 'photo' ? 'min(78%, 300px)' : 'min(84%, 340px)', color: INK };
  const kick = { fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700, color: CLAY };
  const btn = { height: 38, border: 0, borderRadius: 0, background: FOR, color: PAPER, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 14px' };
  return (
    <div data-chat-share={s.t} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', animation: m.anim ? 'pact-pop .42s cubic-bezier(.22,.61,.36,1) both' : 'none' }}>
      <div style={card}>
        {s.t === 'photo' && <a href={s.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}><img data-chat-photo src={s.url} alt="Shared photo" loading="lazy" style={{ display: 'block', width: '100%', maxHeight: 360, objectFit: 'cover' }} /></a>}
        {s.t === 'voice' && <VoiceCard url={s.url} dur={s.dur} mine={mine} />}
        {s.t === 'doc' && <DocRow s={s} />}
        {s.t === 'idea' && (
          <div style={{ padding: '10px 12px 12px' }}>
            <div style={kick}>Idea</div>
            <div style={{ ...FR, fontWeight: 600, fontSize: 21, lineHeight: 1.1, marginTop: 4 }}>{s.title}</div>
            {s.loc && <div style={{ fontSize: 13, color: MUT, marginTop: 3 }}>{s.loc}</div>}
            {s.d && <div style={{ ...FR, fontStyle: 'italic', fontSize: 14, marginTop: 6, color: MUT }}>{s.d}</div>}
            {!mine && <button data-chat-save-idea onClick={() => onSaveIdea(s)} style={{ ...btn, marginTop: 10 }}>Save idea</button>}
          </div>
        )}
        {s.t === 'friend' && (
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mug src={s.avatar} name={s.name} w={52} h={52} tone={1} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={kick}>Pact friend</div>
              <div style={{ ...FR, fontWeight: 600, fontSize: 20, lineHeight: 1.1 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: MUT }}>{s.handle}</div>
            </div>
            {!mine && s.userId && s.userId !== myId && !friendIds.has(s.userId) && <button data-chat-add-friend onClick={() => onAddFriend(s)} style={{ ...btn, height: 34, padding: '0 10px' }}>Add</button>}
          </div>
        )}
      </div>
      {receipt && <div data-chat-receipt style={{ fontSize: 11, color: MUT, marginTop: 3, letterSpacing: '.04em' }}>{receipt}</div>}
    </div>
  );
}
