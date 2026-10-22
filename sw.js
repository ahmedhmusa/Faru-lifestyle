// Standalone GitHub Pages PWA. Bump VERSION whenever app assets change.
const VERSION='2026-10-22-fx-1';
const PREFIX='faru-pwa-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+VERSION;
const ASSETS=['./','index.html','style.css','glass.css','theme.js','currency.js','savings-travel.js','app.js','cloud-backup.js','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png','icon-maskable.png'];
const URLS=ASSETS.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key)}await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 // Serve one consistent release, including when the device is offline.
 if(event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(new URL('index.html',scope).href))||fetch(event.request)));return;
 }
 if(URLS.includes(url.href))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
