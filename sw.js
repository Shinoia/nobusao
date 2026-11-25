/* Nobusão: abre rápido e sem internet depois da 1ª visita.
   Busca a versão nova; se a internet demorar mais de 2,5 s (ônibus, sinal fraco), abre a cópia guardada na hora. */
const CACHE = 'nobusao-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // a planilha (Google) nunca passa por aqui
  const rede = fetch(r).then(resp => { if (resp && resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); } return resp; });
  const guardado = caches.match(r).then(m => m || caches.match('./index.html'));
  e.respondWith(new Promise(ok => {
    let feito = false; const usa = x => { if (!feito && x) { feito = true; ok(x); } };
    const t = setTimeout(() => guardado.then(usa), 2500);
    rede.then(x => { clearTimeout(t); usa(x); }).catch(() => { clearTimeout(t); guardado.then(m => m ? usa(m) : usa(Response.error())); });
  }));
});
