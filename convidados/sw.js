const CACHE = 'chamada-conv-v5';
// Todos os apps publicados em deybsonpassos.github.io dividem a MESMA origem.
// O cache tambem e por origem, entao apagar "todo cache que nao e o meu"
// destruiria o modo offline do app dos legendarios. Cada app apaga apenas
// os caches do proprio prefixo.
const PREFIXO = 'chamada-conv-';
const ARQUIVOS = ['./', './index.html', './manifest.json',
                  './icone-192.png', './icone-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ARQUIVOS))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks
      .filter(k => k.indexOf(PREFIXO) === 0 && k !== CACHE)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
