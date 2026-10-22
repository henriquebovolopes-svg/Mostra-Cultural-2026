const CACHE='mostra-cultural-2026-v15';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg?mc26=20261022-2','./logo-stagio.svg','./app-v7.css','./app-v7.js','./descriptions-v1.css','./final-v12.css','./schedule-v12.js','./soft-skills-quest.html','./soft-skills-quest.css','./assets/ssq/scout-fieldscan.webp','./assets/ssq/level5-expedicao.webp','./assets/ssq/carta-falar.webp','./assets/ssq/carta-veto.webp','./assets/ssq/estrelas.webp','./assets/ssq/megastar.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('google.com')||u.hostname.includes('googleusercontent.com'))return;
  const freshFirst=u.pathname.endsWith('/manifest.webmanifest')||u.pathname.endsWith('/icon.svg');
  if(freshFirst){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(e.request.method==='GET'&&r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(e.request.method==='GET'&&r.ok){const clone=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,clone));}return r;}).catch(()=>caches.match('./index.html'))));
});