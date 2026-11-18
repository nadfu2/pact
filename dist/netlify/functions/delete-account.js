// Netlify Function: permanently deletes the signed-in user's Supabase account.
// All their rows go with it (every table cascades from auth.users).
// Needs these environment variables in Netlify (never put the service key in the front end):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// Uses plain fetch so the function has no dependencies.
const json = (statusCode, obj) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return json(500, { error: 'Server is not configured' });

  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  if (origin) {
    const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);
    let ok = false;
    try { ok = allowed.length ? allowed.includes(origin) : new URL(origin).host === (h.host || h.Host); } catch (e) { ok = false; }
    if (!ok) return json(403, { error: 'Origin not allowed' });
  }

  const auth = h.authorization || h.Authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Not signed in' });

  try {
    // 1. Ask Supabase who this token belongs to (also proves it is valid and unexpired).
    const who = await fetch(url + '/auth/v1/user', { headers: { apikey: anon, Authorization: 'Bearer ' + token } });
    if (!who.ok) return json(401, { error: 'Not signed in' });
    const user = await who.json();
    if (!user || !user.id) return json(401, { error: 'Not signed in' });

    // 2. Delete exactly that user with the service role.
    const del = await fetch(url + '/auth/v1/admin/users/' + encodeURIComponent(user.id), {
      // New-style secret keys (sb_secret_...) are not JWTs, so they go in the apikey header only.
      // Legacy service_role keys are JWTs and also go in Authorization.
      method: 'DELETE', headers: /^sb_/.test(service) ? { apikey: service } : { apikey: service, Authorization: 'Bearer ' + service }
    });
    if (!del.ok) return json(502, { error: 'Could not delete the account' });
    return json(200, { ok: true });
  } catch (e) {
    return json(502, { error: 'Could not reach the account service' });
  }
};
