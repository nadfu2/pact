// Cloudflare Pages Function: fetches a public/secret iCal (.ics) link server-side (browsers block this due to CORS).
// Route: GET /api/ical?url=...   (port of netlify/functions/ical.js)
const MAX_BYTES = 5 * 1024 * 1024;

const isPrivateHost = (host) => {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return true; // raw IPv4
  if (h.includes(':') || h.startsWith('[')) return true; // raw IPv6
  return false;
};
const text = (body, status = 200, extra = {}) => new Response(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });

export async function onRequest({ request }) {
  if (request.method !== 'GET') return text('Method not allowed', 405);
  let raw = new URL(request.url).searchParams.get('url') || '';
  raw = raw.trim().replace(/^webcal:\/\//i, 'https://').replace(/^webcals:\/\//i, 'https://');
  let u;
  try { u = new URL(raw); } catch (e) { return text('Invalid URL', 400); }
  if (u.protocol !== 'https:' || isPrivateHost(u.hostname)) return text('Only public https calendar links are allowed', 400);
  try {
    const res = await fetch(u.toString(), { signal: AbortSignal.timeout(9000), redirect: 'follow', headers: { Accept: 'text/calendar, text/plain, */*' } });
    if (!res.ok) return text(`Calendar provider returned ${res.status}`, 502);
    const body = await res.text();
    if (body.length > MAX_BYTES) return text('Calendar too large', 413);
    if (!/BEGIN:VCALENDAR/i.test(body)) return text('That link did not return an iCal calendar', 422);
    return text(body, 200, { 'Content-Type': 'text/calendar; charset=utf-8' });
  } catch (e) {
    return text('Could not fetch the calendar link', 502);
  }
}
