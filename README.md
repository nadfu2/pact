# Pact: source

React 18 single-page app (one big component file) built with Tailwind 3 and esbuild. No framework, no router. Accounts and data sync through Supabase when it is configured (see "Turn on the backend"); with no Supabase settings it runs exactly as before, with everything stored in the browser.

## Run it
```
npm install
npm run dev      # http://localhost:8765, rebuilds on save
npm run build    # outputs dist/, drag that folder onto Netlify
```
`npm run build` reproduces the shipped bundle byte for byte.

Note: the build step writes the compiled Tailwind CSS into `src/App.tsx` (the `ROAM_CSS` constant, one very long line). Don't hand-edit that line, and don't let your editor reformat it. Keep `@import` first inside `PACT_CSS`.

## Demo edition (blank start)
`public/config.js` sets `window.PACT_BLANK = true`, so every new account starts empty: no sample plans, targets, meals, friends, mood or medication entries. Only what the person enters in the setup run appears. Remove that line to start new accounts with the pre-filled sample week instead. Still present in the blank edition: the app's built-in Ideas suggestions (hidden outside Manchester), Roamie's greeting, and the "My first area / My first skill" placeholders in Development.

## Turn on the backend (Supabase)
1. Create a project at supabase.com. In the SQL editor, run `supabase/migrations/0001_init.sql`.
2. Authentication -> URL Configuration: set **Site URL** to your Netlify address (confirmation and reset emails link there). For quick testing you can switch off Authentication -> Providers -> Email -> "Confirm email"; leave it on before wider testing.
3. Project Settings -> API: copy the project URL and the **anon** key into `public/config.js`. (The anon key is meant to be public. Never put the service role key there.)
4. Netlify -> Site settings -> Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (used only by `delete-account.js`), plus `ALLOWED_ORIGIN` set to your site address.
5. Deploy from GitHub or `netlify deploy --prod` (drag-and-drop does not reliably deploy functions, and "Delete account" needs one).

How sync behaves: every change is saved on the device straight away and to Supabase about a second later. The server rejects a save from a device that has not seen the newest version, and that device then loads the newer data and says so (the newer data wins). Returning to the app also checks for newer data. If the server is unreachable, changes stay on the device and sync when it is back. Someone who used Pact before accounts were online has their on-device data carried up the first time they sign in to a new, empty account.

## Deploy on Cloudflare Pages (free, deploys automatically from GitHub)
1. Put this folder in a **private** GitHub repository (`.gitignore` already skips node_modules and dist). The publishable key in `public/config.js` is fine to commit. **Never commit the secret / service_role key or the Gemini key.**
2. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repo.
3. Build settings: **Build command** `npm run build`, **Build output directory** `dist`. The `functions/` folder is picked up automatically. `.node-version` pins Node 22.
4. Settings -> Variables and Secrets (Production): add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGIN` (your new `https://....pages.dev` address) as plain variables, and `SUPABASE_SERVICE_ROLE_KEY` and (optional) `GEMINI_API_KEY` as **Secrets**. Redeploy after adding them.
5. Supabase -> Authentication -> URL Configuration: change **Site URL** to the new address.
6. From now on, every push to `main` deploys. The app calls `/api/*`; on Cloudflare those are `functions/api/*.js`, on Netlify the same paths are redirected to `netlify/functions` (see `public/netlify.toml`), so both hosts work.

## Layout
- `src/App.tsx`: the entire app (~7,200 lines). Module-level helpers come first (data, parsers, keyless search, location, invites), then the `App` component (state, effects, handlers), then the JSX.
- `public/index.html`: also contains the hidden Netlify Forms markup for bug reports.
- `public/netlify/functions/gemini.js`: optional server-side Gemini proxy (needs `GEMINI_API_KEY`).
- `src/cloud.js`: Supabase sign-in and data sync (all backend calls from the app live here).
- `public/config.js`: public Supabase settings.
- `functions/api/*.js`: the same three functions for Cloudflare Pages (`ical`, `gemini`, `delete-account`).
- `public/netlify/functions/delete-account.js`: deletes the signed-in user's account and data.
- `supabase/migrations/0001_init.sql`: database tables and row-level security.
- `public/netlify/functions/ical.js`: fetches a public .ics link server-side (browsers block it with CORS).

## Where the backend plugs in (the seams)
Everything below is client-only today. These are the exact places to replace.

| Concern | Today | Where in `App.tsx` | Backend replacement |
|---|---|---|---|
| Storage | `store.get/set/del` wrapper over localStorage, with an in-memory fallback | `const store` (~line 841) | **Done:** kept as the on-device cache; Supabase is the source of truth when configured. |
| Accounts | email + PBKDF2 hash saved in `roam:accounts`; session in `roam:session` | `hashPassword`, `readAccounts`, sign-in/sign-up handlers (~line 1330) | **Done** (`cloud.js`, `AuthScreen`): Supabase auth when configured. |
| User data | One JSON blob per user, key `roam:data:<email>`, autosaved on change | the autosave `useEffect` and the hydrate effect (~line 3270 to 3300) | **Done:** blob in `user_state` (versioned). Split into tables later. |
| Friend invites | Link with base64 JSON in the URL hash (`#invite=`), accepted on the receiver's device | `makeInviteLink`, `PENDING_INVITE`, `acceptInvite` | `invites` table, in-app inbox, accept/decline endpoints, shared plans. |
| Friends list | Local array `friendsList` | state in `App` | `friendships` table linked to real users. |
| Reminders | `setInterval` in the open tab, toasts only | `latestRef` effect (~line 3447) | Web Push (VAPID) plus a scheduled function that sends due reminders. |
| Bug reports | Netlify Forms POST to `/`, copy kept in `roam:reports` | `submitBugReport` (~line 2289) | `POST /api/reports`. |
| Calendar sync | Pasted .ics URL, fetched through `ical` function, re-parsed in the browser | ICS parser block, `functions/ical.js` | OAuth with Google/Microsoft, server-side sync. |
| Web search | Browser calls OpenStreetMap, Wikipedia and Open-Meteo directly; optional Gemini via function or personal key | "KEYLESS LIVE SEARCH" block (~line 960), `callGeminiWithSearch` | Optional: move to server for caching and rate limits. |

## Data blob (what `roam:data:<email>` holds)
`tasks, weeklyTargets, userProfile, accountInfo, moodLogs, todayMood, todayMoodReason, medications, mealBatches, dailyMeals, mealHistoryLogs, lifeCadenceItems, ideasFeed, favourites, skillForest, friendsList, customCategories, calendarSources, roamieMessages, homeLayout, homeNotes, water, countdown, reading`

Notes for the schema:
- `userProfile` holds name/status, week hours, load, `location` ({city, region, country, lat, lon}), `reminders` (per-category toggles, lead time, quiet hours), `onboarded`.
- A task is `{id, title, date 'YYYY-MM-DD', start 'HH:MM', end 'HH:MM', ...}`. The planner works out clashes from date and times, so keep those fields exact.
- Dates are local-time strings, not UTC timestamps. Store the user's time zone server-side before building reminders.

## Other browser-only keys
`roam:gemini-key` (optional personal key), `roam:pending-invite`, `roam:textscale`, `roam:reports`. Only the first is sensitive.

## Suggested order
1. ~~Auth plus data sync~~ (done).
2. Invites and friends as real records.
3. Web Push reminders.
4. Calendar OAuth.

## Known limits
- The keyless search services (Overpass, Wikipedia, Open-Meteo, Nominatim, Photon) are free and rate-limited. Fine for testing, proxy and cache them before real traffic.
- Curated Manchester ideas are sample data and are hidden for other cities. Offers are deliberately not shown because none are verified.

## Places database (more Ideas suggestions)

Ideas, Surprise Me and "what's near me" questions in Roamie read from a `places` table in Supabase first, and only fall back to the live OpenStreetMap search if the table is empty or unreachable.

1. **Create the table.** Supabase dashboard → SQL Editor → paste `supabase/migrations/0002_places.sql` → Run. (Run `0001_init.sql` first if you haven't.)
2. **Fill it with a city** (on your own computer, Python 3.9+):
   ```
   pip install overturemaps
   python tools/import_places.py --city manchester --inspect     # optional: preview the category labels first
   export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=sb_secret_...                # Supabase → Project Settings → API Keys (the secret key; never put it in the app)
   python tools/import_places.py --city manchester --load
   ```
   Cities available: `manchester`, `peterborough`, `london`, `jakarta`, `oldenburg`, `addisababa` (or `all`). Re-running a city refreshes it. Add a city by adding a line to `CITIES` in the script.
   No Python? Run it without `--load` to get `places_<city>.csv`, then use Table Editor → `places` → Import CSV.
3. **Attribution.** Overture's licence requires a credit. The app shows "Overture Maps open data" on each idea; also add "Place data © Overture Maps Foundation" to your About/footer.

Good to know: open data has no ratings, prices, photos or opening hours, and some places will be closed or missing. Pact users' own star ratings are saved per place and start showing once 3 people have rated it. Jakarta coverage is thinner than the UK cities.

## Friends (find people by @username)

1. Supabase -> SQL Editor -> paste `supabase/migrations/0003_friends.sql` -> Run (after 0001 and 0002).
2. Each account claims a unique `@username` the first time it signs in (digits are added if it is taken). People can change it in Profile -> Account & Prep.
3. Friend Book -> "Find a friend on Pact": type someone's exact username -> Send request. They see it (with a badge on the Friend Book tab) and tap Accept or Decline. Nobody can browse or list users, blocked people never appear, and a declined request cannot be re-sent.

## Messages and joint events

1. Supabase -> SQL Editor -> paste `supabase/migrations/0004_social.sql` -> Run (after 0001, 0002 and 0003).
2. Friend Book -> **Message** on a friend opens a chat. Only linked friends can message each other.
3. Social -> "Invite a friend": pick a plan, tap friends, **Send invite in Pact**. It becomes a joint event. They get a message and an invite card (Accept / Can't make it) in the chat and in Social -> Joint events.
4. Accepting puts it on their schedule. If the person who made the event changes it (Social -> Joint events -> Edit for everyone), everyone invited is messaged and their calendar entry updates the next time Pact syncs (when the app opens, when you open Social/Friend Book/Schedule, and every 45 seconds while open). Cancelling removes it for everyone.
5. Limits: times are clock times, so a friend in another time zone sees the same clock time. Only the person who made an event can change it. There are no phone push notifications yet; alerts show while Pact is open.

## Your People
Social -> Your People (moved out of Profile). Personal and business contacts (no account needed), a reminder rhythm per person, Block (never remind), "In touch today", and an optional link to a Pact friend. The Schedule tab shows a "Time to reach out" banner for whoever is most overdue. Saved with the rest of your data.

## Ideas filters
Each Ideas category has filter chips (for example Shopping: Books & Records, Clothes & Vintage, Homeware & Art, Markets). Chips are multi-select, stay on across refreshes, and are saved with your account until you press "Clear filters". The chips map to real place kinds in the `places` table (and to OpenStreetMap tags for the live fallback), so "Clothes" only returns clothes shops. After changing `RULES` in `tools/import_places.py`, re-run `--load` for each city.

Places whose name or main category shows they are not somewhere to visit (auction houses, garden centres, landscapers, storage and so on) are excluded by the importer and hidden in the app. `supabase/migrations/0005_cleanup.sql` hides any already loaded.

## Roamie
Roamie first rewrites everyday English (slang, typos, "tmrw", "half seven", "do I have anything on", "gym tmrw 7am") into plain requests, then handles: what's on, free time, add, move/reschedule, cancel, what time is X, targets, fridge, energy and ideas. Anything else goes to the live AI.

## Themes
Settings > Appearance: Light, Dark or Match my device, and five palettes (Autumn Ember, Maple, Harvest, Woodland, Classic). Implemented in `buildThemeCss` in `src/App.tsx` by re-mapping the Tailwind colour classes, so every screen follows. Saved per account and remembered on the device.

## Development skills library
`src/skills.js` holds skill-specific milestone ladders and links to reliable learning sites (Coursera, edX, Khan Academy, MIT OpenCourseWare, NHS, GOV.UK, JustinGuitar, parkrun and others). Nothing is an invented course. To add a skill, copy one entry in `PLANS` and change `match`, `steps` and `resources`. Skills with no entry get general steps plus search links.

## Social tab
Three sub-tabs: **Plans** (invite a friend, joint events and plans shared with you merged into one "Plans with friends" card, and community event search links), **Friend Book** (find by @username, search your friends, message, profile pictures and descriptions) and **Your People**.

## Profile picture and description
Profile -> Account -> "Your profile". The picture is cropped and shrunk to 128px in the browser, then saved with a 280 character description via `set_my_profile` (`supabase/migrations/0006_profile.sql`). Only people you are friends with see them.

## Adding contacts to Your People
"Add from phone contacts" uses the browser Contact Picker, which only exists in Chrome on Android, and lets you tick several people at once. Everywhere else, export your contacts as .vcf (iPhone Contacts, Google Contacts) or .csv and use "Import contacts file"; you tick who to add. Each person can have phone, WhatsApp and email, shown as Call / WhatsApp / Email buttons. Nothing is uploaded: parsing happens in the browser.

## Voice
The mic card on Home, the mic button inside Roamie, and the home-screen shortcut `/?voice=1` (long-press the installed Pact icon on Android) open a voice sheet. It uses the browser's speech recognition (Chrome, Edge, Safari) so what you say is sent to that browser vendor's speech service. Check the words, tap "Add it", and Roamie adds the plan. A true home-screen widget is not possible for a web app; the shortcut is the closest equivalent. `/?tab=schedule` opens the Schedule.

## Notifications
The bell in the header collects: friend requests, friends accepting or adding you, new messages, new invites, and changes or cancellations to plans you accepted. Checked every 45 seconds and whenever you open the Social tab. With "Turn on device alerts" allowed, they also appear as phone alerts while Pact is open or running in the background. A fully closed app cannot be woken yet: that needs a push server (Web Push with VAPID keys plus a Supabase function), which is the next step if wanted.

## Reminders
A reminder set to "15 min before" now fires 15 minutes before your getting-ready time begins (travel plus prep buffer), not before the start time. The message says when to start getting ready.

## Community events
There is no built-in events list any more (it was example data). Pick a goal and Pact opens live searches for your city on Meetup, Eventbrite and Google.

## Ideas: search, see more, adventurous
Search box at the top (places database, then OpenStreetMap, plus your saved ideas). "Tap to see more" replaces Refresh: it reveals more saved ideas, then fetches new ones. "Adventurous" follows the category and filters you picked (for example Adventurous restaurant) and favours less obvious places.

## Install and phone sizes
Installable from the browser menu (Add to Home screen / Install app). Layout checked from 344px (folded phone) to 884px (unfolded).

## Friend profiles, mood and today
Tap a friend in the Friend Book to open their profile: picture, description, daily mood and what they're doing today. Profile -> Account -> "What friends can see today" controls it: mood on/off, plans off / busy only / with titles, an optional time window, and a per-plan "Mark private" in the Schedule. Everything starts off, the app only sends what is allowed (`set_my_status`, migration 0007), and only accepted friends can read it (`get_friend_profile`).

## Add by username, import, voice link
Your People -> "Add someone by their Pact username" fills in name, picture and description (phone and email are never shared). Contact import accepts any file type, several files, iPhone vCards, Google CSV, or a pasted list. `/?add=<text>` adds a plan from text (used by an iPhone Shortcut for a one-tap voice button; steps are in Profile -> Account).

## Updating an existing install
Run `supabase/RUN_IN_SUPABASE.sql` once in the Supabase SQL editor (now includes 0006 profile pictures and 0007 friend status) (it is safe to run more than once), upload the source to GitHub, then re-run `tools/import_places.py --city <name> --load` for each city.
