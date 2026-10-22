const CACHE='mostra-cultural-2026-v31';
const ASSETS=['./','./index.html','./manifest.webmanifest?v=20','./mc2026-icon-v2.svg?v=20','./app-preview-v17.svg?v=20','./logo-stagio.svg','./app-v7.css','./app-v7.js','./descriptions-v1.css','./final-v12.css?v=31','./schedule-v12.js?v=20','./featured-carousel-v1.css?v=24','./ted-video-v1.js?v=25','./ted-video-v1.css?v=25','./soft-skills-quest.html','./soft-skills-quest.css','./soft-skills-quest-theme.css','./assets/ssq/soft-skills-quest-logo.webp','./assets/ssq/titles-atlas.webp','./assets/ssq/scout-fieldscan.webp','./assets/ssq/level5-expedicao.webp','./assets/ssq/carta-falar.webp','./assets/ssq/carta-veto.webp','./assets/ssq/estrelas.webp','./assets/ssq/megastar.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('google.com')||u.hostname.includes('googleusercontent.com'))return;
  const freshFirst=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/manifest.webmanifest')||u.pathname.endsWith('/mc2026-icon-v2.svg')||u.pathname.endsWith('/app-preview-v17.svg')||u.pathname.endsWith('/logo-stagio.svg')||u.pathname.endsWith('/schedule-v12.js')||u.pathname.endsWith('/featured-carousel-v1.css')||u.pathname.endsWith('/ted-video-v1.js')||u.pathname.endsWith('/ted-video-v1.css')||u.pathname.endsWith('/final-v12.css')||u.pathname.endsWith('/app-v7.js')||u.pathname.endsWith('/app-v7.css')||u.pathname.endsWith('/soft-skills-quest.html')||u.pathname.endsWith('/soft-skills-quest.css')||u.pathname.endsWith('/soft-skills-quest-theme.css');
  if(freshFirst){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(e.request.method==='GET'&&r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(e.request.method==='GET'&&r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match('./index.html'))));
});