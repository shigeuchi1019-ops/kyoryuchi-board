// 居留地ボード：画面のファイルを覚えて、すぐ開く（版 fa518e9554fa）
const CACHE = "kyoryuchi-board-fa518e9554fa";
const FILES = ["./", "./index.html", "./config.js", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("kyoryuchi-board-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  const own = u.origin === location.origin, font = /^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !font) return;
  const key = own && r.mode === "navigate" ? "./index.html" : r;
  e.respondWith(caches.open(CACHE).then(c => c.match(key, { ignoreSearch: own }).then(hit => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(key, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});
