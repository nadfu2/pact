// Netlify Function: fetches a public/secret iCal (.ics) link server-side (browsers block this due to CORS)
// and returns the raw text. Works with Google Calendar "secret address in iCal format",
// iCloud public calendar links (webcal://...), Outlook published calendars, etc.
const MAX_BYTES = 5 * 1024 * 1024;

const isPrivateHost = (host) => {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return true; // block raw IPv4
  if (h.includes(':') || h.startsWith('[')) return true; // block raw IPv6
  return false;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };
  let raw = (event.queryStringParameters && event.queryStringParameters.url) || '';
  raw = raw.trim().replace(/^webcal:\/\//i, 'https://').replace(/^webcals:\/\//i, 'https://');
  let u;
  try { u = new URL(raw); } catch (e) { return { statusCode: 400, body: 'Invalid URL' }; }
  if (u.protocol !== 'https:' || isPrivateHost(u.hostname)) return { statusCode: 400, body: 'Only public https calendar links are allowed' };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(u.toString(), { signal: ctrl.signal, redirect: 'follow', headers: { Accept: 'text/calendar, text/plain, */*' } });
    clearTimeout(timer);
    if (!res.ok) return { statusCode: 502, body: `Calendar provider returned ${res.status}` };
    const text = await res.text();
    if (text.length > MAX_BYTES) return { statusCode: 413, body: 'Calendar too large' };
    if (!/BEGIN:VCALENDAR/i.test(text)) return { statusCode: 422, body: 'That link did not return an iCal calendar' };
    return { statusCode: 200, headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' }, body: text };
  } catch (e) {
    return { statusCode: 502, body: 'Could not fetch the calendar link' };
  }
};
