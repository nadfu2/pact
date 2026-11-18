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

  // ---- Friends (see supabase/migrations/0003_friends.sql) ----
  async claimUsername(username) {
    const { data, error } = await sb.rpc('claim_username', { p_username: username });
    if (error) throw new Error(error.message || 'username unavailable');
    return data;   // ok | taken | invalid | not_signed_in
  },
  async findUser(username) {
    const { data, error } = await sb.rpc('find_user', { p_username: username });
    if (error) throw new Error(error.message || 'search unavailable');
    return (data && data[0]) || null;   // { id, display_name, username, relation }
  },
  async sendFriendRequest(userId) {
    const { data, error } = await sb.rpc('send_friend_request', { p_user: userId });
    if (error) throw new Error(error.message || 'request failed');
    return data;   // sent | accepted | already_friends | invalid
  },
  async respondFriendRequest(requestId, accept) {
    const { data, error } = await sb.rpc('respond_friend_request', { p_id: requestId, p_accept: !!accept });
    if (error) throw new Error(error.message || 'request failed');
    return data;
  },
  async friendRequests() {
    const { data, error } = await sb.rpc('my_friend_requests');
    if (error) throw new Error(error.message || 'requests unavailable');
    return data || [];
  },
  async friends() {
    const { data, error } = await sb.rpc('my_friends');
    if (error) throw new Error(error.message || 'friends unavailable');
    return data || [];
  },
  async getMyProfile() {
    const { data, error } = await sb.rpc('get_my_profile');
    if (error) throw new Error(error.message || 'profile unavailable');
    return (data && data[0]) || { bio: '', avatar: '' };
  },
  async setMyProfile(bio, avatar) {
    const { data, error } = await sb.rpc('set_my_profile', { p_bio: bio || '', p_avatar: avatar || '' });
    if (error) throw new Error(error.message || 'could not save');
    return data;   // ok | bio_too_long | picture_too_big | not_signed_in
  },
  // ---- schedule sharing (time-limited, chosen by the sharer) ----
  async setMySchedule(blocks) {
    const { data, error } = await sb.rpc('set_my_schedule', { p_blocks: blocks || [] });
    if (error) throw new Error(error.message || 'could not save');
    return data;
  },
  async setScheduleGrant(friendId, days, titles) {
    const { data, error } = await sb.rpc('set_schedule_grant', { p_friend: friendId, p_days: days, p_titles: !!titles });
    if (error) throw new Error(error.message || 'could not save');
    return data;   // ok | not_friends | invalid
  },
  async myScheduleGrants() {
    const { data, error } = await sb.rpc('my_schedule_grants');
    if (error) throw new Error(error.message || 'could not load');
    return data || [];
  },
  async schedulesSharedWithMe() {
    const { data, error } = await sb.rpc('schedules_shared_with_me');
    if (error) throw new Error(error.message || 'could not load');
    return data || [];
  },
  // ---- learn a skill with a friend ----
  async inviteSkillBuddy(friendId, skill, plan, progress, note) {
    const { data, error } = await sb.rpc('invite_skill_buddy', { p_friend: friendId, p_skill: skill, p_plan: plan || {}, p_progress: progress || {}, p_note: note || '' });
    if (error) throw new Error(error.message || 'could not invite');
    return data;   // ok | exists | not_friends | invalid
  },
  async respondSkillBuddy(id, accept, progress) {
    const { data, error } = await sb.rpc('respond_skill_buddy', { p_id: id, p_accept: !!accept, p_progress: progress || {} });
    if (error) throw new Error(error.message || 'could not answer');
    return data;
  },
  async updateSkillProgress(id, progress) {
    const { data, error } = await sb.rpc('update_skill_progress', { p_id: id, p_progress: progress || {} });
    if (error) throw new Error(error.message || 'could not save');
    return data;
  },
  async endSkillBuddy(id) {
    const { error } = await sb.rpc('end_skill_buddy', { p_id: id });
    if (error) throw new Error(error.message || 'could not end');
  },
  async mySkillBuddies() {
    const { data, error } = await sb.rpc('my_skill_buddies');
    if (error) throw new Error(error.message || 'could not load');
    return data || [];
  },
  // ---- phone notifications (Web Push) ----
  async savePushSub(sub) {
    const j = sub && sub.toJSON ? sub.toJSON() : sub;
    const { data, error } = await sb.rpc('save_push_sub', { p_endpoint: j.endpoint, p_p256dh: j.keys && j.keys.p256dh, p_auth: j.keys && j.keys.auth, p_ua: (typeof navigator !== 'undefined' && navigator.userAgent) || '' });
    if (error) throw new Error(error.message || 'could not save');
    return data;
  },
  async deletePushSub(endpoint) {
    await sb.rpc('delete_push_sub', { p_endpoint: endpoint });
  },
  async syncReminders(items) {
    const { data, error } = await sb.rpc('sync_my_reminders', { p_items: items || [] });
    if (error) throw new Error(error.message || 'could not sync');
    return data;
  },
  async setMyStatus(mood, day, today) {
    const { data, error } = await sb.rpc('set_my_status', { p_mood: mood || '', p_day: day, p_today: today || [] });
    if (error) throw new Error(error.message || 'could not save');
    return data;
  },
  async getFriendProfile(userId) {
    const { data, error } = await sb.rpc('get_friend_profile', { p_user: userId });
    if (error) throw new Error(error.message || 'profile unavailable');
    return (data && data[0]) || null;
  },
  async removeFriend(userId) {
    const { error } = await sb.rpc('remove_friend', { p_user: userId });
    if (error) throw new Error(error.message || 'could not remove');
  },

  // ---- Messages and joint events (see supabase/migrations/0004_social.sql) ----
  async sendMessage(toUser, body) {
    const { data, error } = await sb.rpc('send_message', { p_to: toUser, p_body: body });
    if (error) throw new Error(error.message || 'send failed');
    return data;   // sent | not_friends | invalid
  },
  async conversation(userId, limit = 100) {
    const { data, error } = await sb.rpc('conversation', { p_user: userId, p_limit: limit });
    if (error) throw new Error(error.message || 'messages unavailable');
    return data || [];   // newest first
  },
  async inbox() {
    const { data, error } = await sb.rpc('inbox');
    if (error) throw new Error(error.message || 'inbox unavailable');
    return data || [];
  },
  async markRead(userId) {
    try { await sb.rpc('mark_read', { p_user: userId }); } catch (e) { /* ignore */ }
  },
  async createSharedEvent(title, details, inviteeIds, note) {
    const { data, error } = await sb.rpc('create_shared_event', { p_title: title, p_details: details, p_invitees: inviteeIds, p_note: note || '' });
    if (error) throw new Error(error.message || 'could not create the event');
    return data;   // event id
  },
  async inviteToEvent(eventId, userId, note) {
    const { data, error } = await sb.rpc('invite_to_event', { p_activity: eventId, p_user: userId, p_note: note || '' });
    if (error) throw new Error(error.message || 'could not invite');
    return data;   // invited | already | invalid
  },
  async respondToEvent(eventId, status, note) {
    const { data, error } = await sb.rpc('respond_to_event', { p_activity: eventId, p_status: status, p_note: note || '' });
    if (error) throw new Error(error.message || 'could not answer');
    return data;
  },
  async updateSharedEvent(eventId, title, details) {
    const { data, error } = await sb.rpc('update_shared_event', { p_id: eventId, p_title: title, p_details: details });
    if (error) throw new Error(error.message || 'could not update');
    return data;   // how many people were told
  },
  async deleteSharedEvent(eventId) {
    const { error } = await sb.rpc('delete_shared_event', { p_id: eventId });
    if (error) throw new Error(error.message || 'could not cancel');
  },
  async mySharedEvents() {
    const { data, error } = await sb.rpc('my_shared_events');
    if (error) throw new Error(error.message || 'events unavailable');
    return data || [];
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
