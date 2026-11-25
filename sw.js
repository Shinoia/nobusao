/* Nobusão: deixa o site abrir mesmo sem internet (depois da 1ª visita).
   Sempre tenta buscar a versão nova primeiro; se não tiver internet, usa a cópia guardada. */
const CACHE = 'nobusao-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // a planilha (Google) nunca passa por aqui
  e.respondWith(
    fetch(r).then(resp => { if (resp && resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); } return resp; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
