// 更新したときは、下の VERSION の数字を変えてください（例: kobo-v9）。
// 数字を変えたときだけ、端末に保存されたファイルが新しい版に入れ替わります。
// それ以外のときは、端末に保存したファイルだけで動き、アプリのファイルを取りに行きません。
const VERSION = 'kobo-v9';
const FILES = ['./', 'index.html', 'manual.html', 'manifest.webmanifest',
  'vendor/jspdf.umd.min.js', 'vendor/html2canvas.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // cache:'reload' … ブラウザの一時保存ではなく、必ずサーバーから最新を取る
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('kobo-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // 保存済みのものはそのまま返す。無いものだけネットに取りに行く（保存はしない）
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r)));
});
