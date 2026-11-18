// Cloudflare Pages Function: delivers a Web Push notification to a phone or browser, even when Pact is closed.
// Route: POST /api/push. Called only by YOUR Supabase database (messages, friend requests and due reminders),
// never by the browser. It holds no user data: the database sends the device addresses with each request.
//
// Environment variables (Cloudflare -> your Pages project -> Settings -> Variables and Secrets):
//   VAPID_PUBLIC_KEY   the public key (also in config.js)
//   VAPID_PRIVATE_KEY  the private key (add as a Secret; never put it in the code or config.js)
//   VAPID_SUBJECT      a contact such as mailto:you@example.com
//   PUSH_SECRET        a long random password, the same one you put in the database (public.push_config)
//
// Standards used: RFC 8030 (Web Push), RFC 8291 (aes128gcm message encryption), RFC 8292 (VAPID). WebCrypto only, no packages.

const enc = new TextEncoder();
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const b64uToBytes = (s) => {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const bytesToB64u = (buf) => {
  const b = new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const concat = (...arrs) => { const n = arrs.reduce((a, b) => a + b.length, 0); const out = new Uint8Array(n); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8));
}

// RFC 8292: a short-lived signed token proving the push comes from this site.
export async function vapidHeader(endpoint, env) {
  const pub = b64uToBytes(env.VAPID_PUBLIC_KEY);                       // 65 bytes: 0x04 | x | y
  const jwk = { kty: 'EC', crv: 'P-256', x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), d: env.VAPID_PRIVATE_KEY, ext: true };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = bytesToB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = bytesToB64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:admin@example.com' })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + claims)));
  return 'vapid t=' + head + '.' + claims + '.' + bytesToB64u(sig) + ', k=' + env.VAPID_PUBLIC_KEY;
}

// RFC 8291: encrypt the message so only that device can read it.
export async function encryptPayload(sub, plaintext) {
  const uaPub = b64uToBytes(sub.p256dh), authSecret = b64uToBytes(sub.auth);
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const data = concat(enc.encode(plaintext), new Uint8Array([2]));       // 0x02 = last record delimiter
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, data));
  const rs = new Uint8Array([0, 0, 0x10, 0]);                            // record size 4096
  return concat(salt, rs, new Uint8Array([asPub.length]), asPub, cipher);
}

async function sendOne(sub, message, env) {
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint)) return { ok: false, status: 0, endpoint: sub && sub.endpoint };
  const body = await encryptPayload(sub, message);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(sub.endpoint, env), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high' },
    body
  });
  return { ok: res.ok, status: res.status, endpoint: sub.endpoint };
}

const safeEqual = (a, b) => { a = String(a || ''); b = String(b || ''); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.PUSH_SECRET) return json(500, { error: 'Push is not configured' });
  if (!safeEqual(request.headers.get('x-push-secret'), env.PUSH_SECRET)) return json(401, { error: 'Not allowed' });
  let b; try { b = await request.json(); } catch (e) { return json(400, { error: 'Bad request' }); }
  const subs = Array.isArray(b.subs) ? b.subs.slice(0, 12) : [];
  if (!subs.length) return json(200, { sent: 0 });
  const message = JSON.stringify({ title: String(b.title || 'Pact').slice(0, 80), body: String(b.body || '').slice(0, 160), url: String(b.url || '/').slice(0, 200), tag: String(b.tag || 'pact').slice(0, 60) });
  const results = await Promise.all(subs.map(s => sendOne(s, message, env).catch(() => ({ ok: false, status: 0, endpoint: s && s.endpoint }))));
  return json(200, { sent: results.filter(r => r.ok).length, statuses: results.map(r => r.status), gone: results.filter(r => r.status === 404 || r.status === 410).map(r => r.endpoint) });
}
