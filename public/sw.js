// Pact service worker: lets the app install to the home screen and open offline.
// Pages: network first (so updates arrive), falling back to the cached copy. Never caches API or database calls.
const CACHE = 'pact-shell-v17';
const SHELL = ['/', '/assets/app.js', '/assets/app.css', '/manifest.webmanifest', '/icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname === '/config.js') return;
  e.respondWith(fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => caches.match(req).then(r => r || caches.match('/'))));
});
// Tapping a notification opens or focuses the app.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.navigate && c.navigate(target); return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});

// A push arrives from the server (a message, a friend request, a reminder), even when Pact is closed.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Pact', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    // Always show it: iPhone and Chrome cancel a device's alerts if a push arrives and nothing is shown (even while Pact is open).
    return self.registration.showNotification(d.title || 'Pact', {
      body: d.body || '', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png',
      tag: d.tag || 'pact', renotify: true, data: { url: d.url || '/' }
    });
  }));
});
