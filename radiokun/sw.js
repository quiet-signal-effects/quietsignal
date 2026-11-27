const scope = self.registration.scope;
const prefix = 'patapata-radio:' + scope;
const version = prefix + ':v1';
const files = ['index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
const urls = new Set(files.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(version).then(cache =>
    cache.addAll(files.map(path => new Request(new URL(path, scope), {cache:'reload'})))
  ));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names =>
    Promise.all(names.filter(name => name.startsWith(prefix + ':') && name !== version).map(name => caches.delete(name)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;
  if(request.mode === 'navigate' && [new URL(scope).pathname, new URL('index.html', scope).pathname].includes(url.pathname)) {
    event.respondWith(fetch(request).catch(() =>
      caches.open(version).then(cache => cache.match(new URL('index.html', scope)))
    ));
  } else if(urls.has(request.url)) {
    event.respondWith(caches.open(version).then(async cache => (await cache.match(request)) ?? fetch(request)));
  }
});
