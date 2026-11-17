// Cloudflare Pages Function: permanently deletes the signed-in user's Supabase account (all rows cascade).
// Route: POST /api/delete-account.  Environment variables (Cloudflare -> Settings -> Variables and Secrets):
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (add as a Secret), ALLOWED_ORIGIN
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const anon = env.SUPABASE_ANON_KEY, service = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return json(500, { error: 'Server is not configured' });

  const origin = request.headers.get('origin') || '';
  if (origin) {
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);
    let ok = false;
    try { ok = allowed.length ? allowed.includes(origin) : new URL(origin).host === new URL(request.url).host; } catch (e) { ok = false; }
    if (!ok) return json(403, { error: 'Origin not allowed' });
  }
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Not signed in' });

  try {
    const who = await fetch(url + '/auth/v1/user', { headers: { apikey: anon, Authorization: 'Bearer ' + token } });
    if (!who.ok) return json(401, { error: 'Not signed in' });
    const user = await who.json();
    if (!user || !user.id) return json(401, { error: 'Not signed in' });
    // New-style secret keys (sb_secret_...) are not JWTs: apikey header only. Legacy service_role keys also go in Authorization.
    const headers = /^sb_/.test(service) ? { apikey: service } : { apikey: service, Authorization: 'Bearer ' + service };
    const del = await fetch(url + '/auth/v1/admin/users/' + encodeURIComponent(user.id), { method: 'DELETE', headers });
    if (!del.ok) return json(502, { error: 'Could not delete the account' });
    return json(200, { ok: true });
  } catch (e) {
    return json(502, { error: 'Could not reach the account service' });
  }
}
