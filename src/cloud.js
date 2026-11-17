// Pact cloud layer: Supabase auth + per-user data sync.
// Safe by default: when public/config.js has no Supabase URL/key, `cloud.enabled` is false
// and the app keeps working exactly as before (accounts and data on this device only).
import { createClient } from '@supabase/supabase-js';

const cfg = (typeof window !== 'undefined' && window.PACT_CONFIG) || {};
const enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
const sb = enabled
  ? createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

const toUser = (session) => {
  const u = session && session.user;
  if (!u) return null;
  const meta = u.user_metadata || {};
  return { id: u.id, email: (u.email || '').toLowerCase(), name: meta.name || (u.email || '').split('@')[0], cloud: true };
};

// Friendly messages for the errors people actually hit.
const friendly = (error) => {
  const m = String((error && error.message) || error || '');
  if (/already registered|already been registered/i.test(m)) return 'An account with this email already exists. Sign in instead.';
  if (/invalid login credentials/i.test(m)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox for the link.';
  if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
  if (/password/i.test(m) && /(short|weak|least)/i.test(m)) return 'That password is too weak. Try a longer one.';
  if (/failed to fetch|network/i.test(m)) return 'Could not reach the server. Check your connection and try again.';
  return m || 'Something went wrong. Please try again.';
};

export const cloud = {
  enabled,

  async getUser() {
    if (!enabled) return null;
    const { data } = await sb.auth.getSession();
    return toUser(data && data.session);
  },

  // callback(user | null); returns an unsubscribe function
  onAuthChange(cb) {
    if (!enabled) return () => {};
    const { data } = sb.auth.onAuthStateChange((_event, session) => cb(toUser(session)));
    return () => data.subscription.unsubscribe();
  },

  // -> { user } | { needsConfirm: true } | { error }
  async signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { error: friendly(error) };
    // With "Confirm email" switched on in Supabase there is no session until the link is clicked.
    // Supabase also returns a user with no identities when the email is already registered.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: 'An account with this email already exists. Sign in instead.' };
    }
    if (!data.session) return { needsConfirm: true };
    return { user: { ...toUser(data.session), isNew: true } };
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: friendly(error) };
    return { user: toUser(data.session) };
  },

  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    return error ? { error: friendly(error) } : { ok: true };
  },

  async signOut() {
    if (enabled) await sb.auth.signOut();
  },

  // -> { data, version } (data is {} for a brand-new account) | { error }
  async loadState() {
    const { data, error } = await sb.from('user_state').select('data, version').maybeSingle();
    if (error) return { error: friendly(error) };
    if (!data) return { data: {}, version: 0 };
    return { data: data.data || {}, version: data.version || 0 };
  },

  // Cheap check used when the app comes back to the foreground. -> number | null
  async remoteVersion() {
    const { data, error } = await sb.from('user_state').select('version').maybeSingle();
    return error || !data ? null : data.version;
  },

  // -> { version } on success | { conflict: true } if another device saved first | { error }
  async saveState(blob, expectedVersion) {
    const { data, error } = await sb.rpc('save_user_state', { p_data: blob, p_expected_version: expectedVersion });
    if (error) return { error: friendly(error) };
    if (data === null || data === undefined) return { conflict: true };
    return { version: data };
  },

  // Places near a point from the Pact places database (see supabase/migrations/0002_places.sql).
  // Throws if the database or the places table is unavailable, so callers can fall back to live search.
  async placesNear({ lat, lon, radiusKm = 5, categories = null, kinds = null, query = null, limit = 60 }) {
    const { data, error } = await sb.rpc('places_near', { p_lat: lat, p_lon: lon, p_radius_km: radiusKm, p_categories: categories, p_kinds: kinds, p_query: query, p_limit: limit });
    if (error) throw new Error(error.message || 'places unavailable');
    return data || [];
  },

  // Save the person's star rating for a place (1-5; 0 clears it). Best effort, never blocks the UI.
  async ratePlace(placeId, rating) {
    try { await sb.rpc('rate_place', { p_place: placeId, p_rating: rating || 0 }); } catch (e) { /* ignore */ }
  },

  // Permanently deletes the account and all its data (server function, needs the service role key).
  async deleteAccount() {
    const { data } = await sb.auth.getSession();
    const token = data && data.session && data.session.access_token;
    if (!token) return { error: 'You are signed out. Sign in again to delete your account.' };
    try {
      const res = await fetch('/api/delete-account', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) return { error: 'Could not delete the account right now. Please try again.' };
      await sb.auth.signOut();
      return { ok: true };
    } catch (e) {
      return { error: 'Could not reach the server. Please try again.' };
    }
  }
};
