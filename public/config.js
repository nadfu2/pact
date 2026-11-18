// Public Supabase settings (Project Settings -> API / Data API).
// The publishable (anon) key is designed to be public: the database security
// rules (row level security) are what protect each person's data.
// NEVER put the secret / service_role key here.
// Leave both empty to run Pact in local-only mode (accounts and data stay on the device).
window.PACT_CONFIG = {
  supabaseUrl: 'https://anfvtigcnfprattktmil.supabase.co',
  supabaseAnonKey: 'sb_publishable_fw2YRr_07OXuojEi7Nh4Tg_LHouuTwm',
  // Web Push public key (safe to publish). Generate a pair as described in the README, paste the PUBLIC key here.
  vapidPublicKey: 'BDRAG-QLOoS7KHRhRiewpr7MuNQEgUyh6s2NCMXHTs0dRUQRiZySiIktyJgYczTlahUiG4ykj-dBSyyR77vgtVc'
};

// Demo edition: a new account starts completely empty. Only what the person enters
// during setup appears. Remove this line (or set it to false) to start new accounts
// with the pre-filled sample week.
window.PACT_BLANK = true;
