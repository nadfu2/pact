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
The bell in the header collects: friend requests, friends accepting or adding you, new messages, new invites, and changes or cancellations to plans you accepted. Checked every 45 seconds and whenever you open the Social tab. In-app banners disappear after 2 seconds (everything stays in the bell). Phone alerts when Pact is closed need the one-time setup in "Phone notifications" below.

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
Run `supabase/RUN_IN_SUPABASE.sql` once in the Supabase SQL editor (now includes 0006 profile pictures, 0007 friend status and 0008 schedule sharing, learning buddies and push) (it is safe to run more than once), upload the source to GitHub, then re-run `tools/import_places.py --city <name> --load` for each city.

## The Pact newspaper redesign
Masthead on every tab (location and weather). Schedule is a TV-guide "Listings" grid; Ideas is a lead story plus a two-column front page of picture cards; Development is a skills index with sparklines that opens each skill as a book of chapters; Social is a photo wall with invitations as the front-page story and a searchable Friend Book; Profile is a press pass.

## Schedule listings and time matching
Your own day is the default. "Expand for time matching" adds a column per friend who is sharing with you and marks the hours when everyone is free. Sharing is the sharer's choice, per friend: 3 days, a week or 2 weeks, with or without plan titles. It ends by itself (the database returns nothing after the end date), can be stopped at any time, and plans marked Private are never uploaded. Backend: `schedule_grants`, `profiles.sched`, `set_my_schedule`, `set_schedule_grant`, `my_schedule_grants`, `schedules_shared_with_me` (migration 0008). Friends without a grant show as "Not shared".

## Learn a skill with a friend
Open a skill, then "Learn it together" and pick a friend. They get a message and an invitation in Development; joining adds the skill (and its chapters) to their own map. Each person ticks their own chapters and sees the other's progress. Backend: `skill_buddies` and its RPCs (migration 0008).

## Ideas pictures
The places database has no photos. A card shows a real photo only when Wikipedia has one for that exact place (matched by name and by being within 1.5 km, so it never shows the wrong building). Everything else gets a newspaper-style illustration for its category, so every card has a picture.

## Phone notifications (when Pact is closed)
How it works: your phone registers with its push service; the database (message, friend request and due-reminder triggers) asks your Cloudflare site at `/api/push` to deliver; the service worker shows it. The app uploads the next days of reminders so they still arrive when Pact is closed. If Pact is open and in front, only the in-app banner shows.
One-time setup (about 10 minutes):
1. Keys: `node scripts/make-vapid-keys.mjs` prints a key pair and a secret (or use the ones supplied with this release). Put the PUBLIC key in `public/config.js` (`vapidPublicKey`).
2. Cloudflare -> your Pages project -> Settings -> Variables and Secrets: add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (as a Secret), `VAPID_SUBJECT` (for example `https://pact-wdm.pages.dev`) and `PUSH_SECRET`. Redeploy.
3. Supabase -> Database -> Extensions: enable `pg_net` and `pg_cron` (the SQL tries to; some projects need the toggle).
4. Run `supabase/RUN_IN_SUPABASE.sql`, then once: `insert into public.push_config values (1, 'https://YOUR-SITE/api/push', 'THE-SAME-PUSH_SECRET') on conflict (id) do update set url = excluded.url, secret = excluded.secret;`
5. On each phone: open Pact, Profile or the bell -> "Turn on device alerts" and allow notifications.
iPhone: iOS 16.4 or newer, and Pact must be added to the Home Screen first (Share -> Add to Home Screen) and opened from there; Safari tabs cannot receive push. Android and desktop Chrome work from the browser.
Not verified end to end in the build environment (it cannot reach real push services or a phone): the database triggers, the encryption and signing in `functions/api/push.js` (decrypted back with an independent implementation), the service worker handlers and the in-app flow are tested; the final delivery to a physical phone needs your first real test.

## Layouts now match the mockups (v6)
Schedule: one wide "You" column by default (hour rows 34px), past plans as outlines, upcoming as filled blocks; "Expand time matching" adds hatched friend columns, an "ALL FREE" band and "Suggest a plan for HH:MM-HH:MM". Tapping a block opens a details/edit sheet (the plan list under the grid is gone). Ideas: category bar, one top pick with picture, "Also in" list and a Wildcard box ("Surprise me"); tap an item for its full card; "Tap for more" adds more. Development: skills index ranked by momentum with sparklines and an editor's pick; opening a skill shows the chapters page (big current chapter number, progress bar, contents with dotted leaders, "you are here"). Escape closes any sheet.


## v7: new front door, setup, Social and Your People

- **Name, logo and tagline.** The app is now "The Pact". The logo is a bold P whose bowl is a clay compass seal. Icons (home screen, favicon, maskable) are in `public/icons/`, generated from the SVG `public/icons/icon.svg`. Tagline: "Live a little louder. We'll quietly sort the rest."
- **Cover, Sign in, Sign the pact.** `AuthScreen` opens on a dark cover with two buttons, then a Sign in / Sign the pact page. Sign the pact asks for name, @username (optional, claimed after sign-up), email and password (with a Show toggle; the confirm-password box is gone).
- **First-time setup (6 steps).** Goals and interests, where you are and how you get about, your day (days, hours, getting-ready time, how full, calendar sync), your people (find by @username, type a name, or import after setup), notifications (per-topic toggles, preview, device notifications), and "Sign your pact" (one-line promise and your name). Answers are saved on your profile (`goals`, `travel`, `prepTimeCasual`, `promise`).
- **Social > Plans.** An invitation sits on top, then a **+ Send a plan** button that opens a bottom sheet (pick a plan, tap friends, optional note, or copy an invite link). Below that, two tabs: **Joint plans** and **Find events** (four goal tiles, then Meetup / Eventbrite / Google).
- **Social > Your People.** A search box and **+ Add** button, All / Personal / Business filters, "Due for a catch-up" first with a Nudge button, then everyone else. Tap a person for details. **+ Add** opens a sheet: On Pact (by @username), Import contacts (file, paste or phone picker), and Type it in (quick add).

## v8: made for every stage of life

All of this lives in the existing profile data, so **no new Supabase setup is needed**.

- **Setup step 1, "What's life like right now?"** (multi-select). Ticking Retired starts you with larger text, bigger buttons and the simple four-tab view; Energy lowers the daily cap; Studying turns on Term mode. Change it any time in **Profile > Life**.
- **Profile > Life** also holds **Comfort** (text size to 160%, higher contrast, simple view, bigger buttons, calm motion) and **How I talk** (cheer me on / calm and clear / just the facts, with a setback preview).
- **Simple view**: Today, Plans, People, More, with a large calm Today page (next up with directions, who to call, this week's treat).
- **Energy** (Home): Low / Steady / High. On a low day it keeps two things, and anything else offers "Tomorrow".
- **Job hunt** (Development, when "Looking for work" is ticked): weekly targets, pipeline, follow-ups (a Draft button opens an email), and an Interview prep sheet that adds the interview and a prep hour to your planner.
- **Student** (Schedule, Ideas): Term/Holiday switch (Holiday clears your study hours, Term restores them), deadlines, and a weekly fun budget with a spend log and Free / Under £5 / Fits what's left filters on Ideas.
- **Shift rota** (Schedule): set each day's shift, see free windows, "Use this week in my planner" updates your working hours.
- **Family circle** (Social > Your People): choose what each person would see. Live sharing with family is not built yet; for now it saves your choices and previews them.

Tests: `test/v8.mjs` covers all of the above (39 checks).

## v9: simpler Home, pages counter, job hunt from your spreadsheet
- **Home layouts** (Home > Widgets > Pick a layout): **Log** (default: glance, four round quick-log buttons, weekly goals strip, job row), **Minimal** (three small boxes) and **Classic** (every widget card, as before). Today at a glance is the same in all three. Quick-log buttons (Water, Energy, Pages, Note) can be switched on and off. Choice is saved as `homeStyle` / `logButtons` in the profile. Log and Minimal hide the Targets, Smart planning, Hydration, Reading, Notes and Feedback cards (their jobs are covered by the buttons; feedback is under Widgets > Send feedback).
- **Pages**: tap Pages, type any number or use +5/+10/+20/+50, then "Add to today" or "I'm on page…". Capped at the book's last page. Uses the existing `reading` state, so streaks and reminders still work.
- **Development**: the long weekly summary is now a three-number strip (milestones, sessions, hours) with a Details sheet. Editor's pick is removed.
- **Job hunt widget** (`src/v9.jsx`): collapsible row on Home, list sheet with filters, role form with Role, Company, Salary (per year/month), Start date, Applied, Stage, Outcome and Comments. Shares `profile.jobs.apps` with the Development tab's Job hunt, so both always agree. **Paste a job advert** sends the text to `/api/gemini` (needs `GEMINI_API_KEY`) and fills the form; nothing is saved until you press Add. Only the first ~11,000 characters are read.
- **Roamie**: a bare "hey roamie" / "hi" now gets a greeting (the old normaliser emptied it and it fell through to the AI); stray "for" and dashes are trimmed from the end of plan titles.
- Service worker cache is now `pact-shell-v5`.
- Not built yet: Shelf, Bento and Tabs layouts, importing an Excel file, live sharing in Family circle.
Tests: `test/v9.mjs` (52 checks). `test/v8.mjs` now expects the Energy button on Home.

## v10: the front page (rest of Home)

- Medicine, Meals, Countdown, This week, Life admin and Job hunt are now compact engraved tiles (clock, ring, ruler, columns, track). Tap a tile to open the full widget right under it; tap again to close. Only one is open at a time.
- Medicine: one dot per medicine today. Tap a dot to tick it. The big time and the clock show the next dose.
- Mood is no longer on Log or Minimal Home (the Energy button replaces it). Low battery now shows a single "Stop press" strip.
- Classic layout is unchanged (old inline widgets).
- New file `src/v10.jsx`. `renderDetail` in App portals each old widget into its tile slot. Service worker cache is `pact-shell-v6`.

### v10.1
- Voice is now a small round mic bubble beside the Widgets button (no full-width row).
- Opened tile widgets (Meals, Medicine, Life admin, Week ahead, Countdown) are restyled flat to match the engraved tiles.
- Medicine clock row no longer relies on a button for its layout (steadier centring on iPhone). Cache `pact-shell-v7`.

### v10.2
- Voice bubble sits at the bottom of the greeting block, well apart from Widgets.
- Medicine tile with no medicines has equal top and bottom padding, so the clock is centred.

## v10.3 - Real location in the planner
- The planner's "Near" box now has **Use my location** (GPS, turned into a UK postcode through postcodes.io) and a postcode/town box. Both set your saved location, so every place search uses it.
- Results can be sorted **Best match** or **Nearest**.
- Accounts that never chose a place are marked "(default)" instead of silently being Manchester.

## v10.4 - Auto location and health consent
- **Keep my location up to date** (Settings, and offered after the first "Use my location"). Off until chosen. Only while the app is open: on opening or returning to the app it checks, and updates if you have moved about 0.5 km. Never reads GPS in the background.
- **Health consent:** Medicine and Energy check-in (mood) ask for agreement before they can be added, in setup (a tick box under "Look after") and in Customise Home. Without it they stay off. Water and the rest need none. Agreement is stored as `healthConsent` on the profile.
- Privacy page updated for both.

## v10.5 - Job hunt on Home and Development
- The Development-tab job card is now **collapsible** (collapsed by default, showing Saved / Applied / Interview / Offer counts; tap to expand). Same data as Home. Its weekly targets (Apply / Reach out / One outing), follow-ups for applications with no reply, and interview prep (leave-by time, checklist, adds the interview and a prep hour to the week) now sit in the Home job widget.
- On the Home tile: the weekly line and three thin meters under the track. In the opened Job hunt list: a "This week" block with the + buttons, a "Follow up" section, then the roles.
- Roles in the Interview stage show a Prep button even before a date is set.

## v10.7 - Edit from the press card, sharper photos
- Tap **Edit** on the press card to change your photo, name and short description right there. The separate "Edit your profile" box is gone.
- Photos are now saved at up to 480px (was 128px), stepping size and quality down only if needed to fit the server's 60,000-character limit. The halftone overlay on real photos is softer.

## v10.8 - Profile as a hub
- The Account / Life / Data tabs are replaced by the press card (editable) plus a short list. Each row opens one small screen with Back:
  - Home and look (Widgets link, install, appearance, text size, voice button)
  - Reminders; Calendar and hours (sync, blocked hours, getting-ready times); Location and places (incl. keep up to date)
  - About you (account, sign out, delete account, life situation); What friends can see; Health records and exports (with your health agreement and a withdraw button); Privacy and data; Assistant and advanced (AI key, redo setup).
- Nothing was removed. Old links to the Data and Life tabs open the matching screens.

## v10.9 - Properly sharp profile photos
- Photos are now saved up to 720px (was 128px, then 480px). This needs the database limit raised: run `supabase/UPGRADE_PHOTOS.sql` once in Supabase > SQL Editor. Until then the app falls back to the smaller picture and says so.
- Pictures uploaded before this stay as small as they were. Re-upload them once.

## v10.10 - Phone alerts check
- Profile > Reminders > **Phone alerts**: "Check phone alerts" tests each step (device, permission, registration, saved to your account, database knows your website, pg_net, pg_cron, last delivery) and says in plain words what is missing. "Send a test alert" sends a real push through the whole chain.
- Needs `supabase/UPGRADE_PUSH_CHECK.sql` run once in Supabase (also appended to RUN_IN_SUPABASE.sql). `functions/api/push.js` now also returns the push service's status codes.
- The service worker now always shows a notification when a push arrives, even if Pact is open. iPhone and Chrome cancel a device's alerts if pushes arrive and nothing is shown.

## v10.11
- Roamie is now a desk bell: paper pill "Ask Roamie" with an engraved bell, shrinks to just the bell while you scroll down. Same bell in the chat header.
- Development tab: tree removed; a few faint dots drift slowly upward instead.
- Simple view: More menu has a "Back to the full app" button (resets text size, tabs, button size).
- Home: Widgets panel now has a "Redo setup" button.
- Profile photos: saved as WebP where the phone supports it (sharper at the same size), and tries the biggest size first. Run `supabase/UPGRADE_PHOTOS.sql` once and re-upload photos for full 720px sharpness.

## v10.12
- Schedule: every plan now has a Delete plan button (asks first; shared plans offer "for everyone" or "just mine").
- Ideas: suggestions load by themselves when fewer than four show for your area, no need to tap More.

## v10.13
- Home: Minimal and Classic layouts removed. Log is the only layout, redrawn as a ruled ledger strip (square cells, double rule on top). Weekly goals are now added from the goals sheet (See all).
- Development: Job hunt card removed (it stays on Home). Background is gentle drifting seeds.

## v10.14
- Schedule: tap any empty time in the day view and a "+ New plan" block appears there; tap it and the planner opens with that day and start time filled in.
- Removed the "Next free window / Open schedule" lines from Home and the "Your skills, ranked by momentum" line from Development.
- Home: quick-log buttons are small separate squares.
- Schedule: removed the hint line; "Find a time" (friends' free hours) and "Who sees mine" are now two labelled buttons under the headline.
- Schedule: day grid now runs midnight to midnight and scrolls (opens on your next plan, or now); hour numbers sit under their lines. Drag the handle on a new-plan block to set its length. "Activity colours" is collapsible.

## v10.15
- New planner (src/planner.jsx): one question per screen. Go out asks casual / formal / meeting (and who with); an event can be one that is on, one already booked (name it, optional host and place) or one you host; tasks are one screen; place search for somewhere you have already chosen; fine-tune folded away.
- Tapping a time in Schedule carries the day, start time and length into the planner.

## v10.16
- Fix: the tap-to-plan box no longer stays over a plan after adding, so tapping a plan opens its edit sheet. The drag bar no longer swallows taps.
- Home: removed the duplicate "Nothing planned today." line.
- Home's daily counts (water, energy, pages) roll over at midnight even if the app is left open.

## v10.17 — Calm skill page
- Opening a skill now shows the name, progress, an "Up next" card (Tick it off / Plan a slot) and a simple chapter list.
- Tap a chapter's circle to tick it; tap its title for note, target, reorder and remove.
- New ⋯ menu: Rename, Change goal or timeframe, Move to another area, Suggest more chapters, Delete skill (with a confirm sheet).
- Courses and Learn with a friend are folded away until opened.

## v10.18 — Bigger titles
- Section titles (Today at a glance, Chapters, and the rest of the black title tags) are larger: 14px, up from 10px.

## v10.19 — Tap a plan on Home to edit it
- Plans listed under Today at a glance are now tappable and open the same edit sheet as the Schedule.

## v10.20 — Plan sheet, manual time, many notes, desktop scroll
- Tapping a plan opens a newspaper-style sheet where every field (title, date, start, end, place, notes, person) edits in place. No Change plan step.
- Planner: your own date and time sit right under the suggested times, and under the task slots too.
- Quick notes keep a list: add as many as you like, edit or delete each. An old single note becomes the first one.
- Desktop: the mouse wheel scrolls the page from anywhere, not just the middle column.

## v10.21 — Student, shift work and carer
- Term, sorted is collapsible with a caption. Deadlines take a time and go into the schedule as red blocks. A linked uni timetable shows in the schedule grid, not in the panel.
- The student budget tracker is gone; Ideas filters now have a Budget row (Free, under 5, 10 and 20 pounds).
- Shift work is collapsible, has a week picker, your own start and end times per day, and shifts appear in the schedule automatically.
- Carers get a Care card on Home: a daily routine that resets each morning, next appointment, plan time for me, and short care notes.
