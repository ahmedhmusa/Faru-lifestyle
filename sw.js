// Offline cache for Faru Finance (GitHub Pages and Cloudflare Pages). Bump VERSION whenever app assets change.
const VERSION='2026-10-22-tabs-2';
const PREFIX='faru-pwa-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+VERSION;
// The page is cached only as './'. Cloudflare Pages redirects index.html to '/', and Safari
// refuses to show a page whose service-worker response was redirected.
const PAGE=new URL('./',self.registration.scope).href;
const ASSETS=['./','style.css','glass.css','liquid.css','theme.js','lock.js','currency.js','cards.js','savings-travel.js','app.js','quick.js','cloud-backup.js','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png','icon-maskable.png'];
const URLS=ASSETS.map(path=>new URL(path,self.registration.scope).href);
// Rebuild any redirected response so it is safe to hand back to the browser.
async function clean(res){if(!res||!res.redirected)return res;return new Response(await res.blob(),{status:res.status,statusText:res.statusText,headers:res.headers})}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.all(URLS.map(async url=>{const res=await fetch(url,{cache:'reload'});if(!res.ok)throw Error('Failed to cache '+url);await cache.put(url,await clean(res))}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key)}await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 // Serve one consistent release, including when the device is offline.
 if(event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')){
  event.respondWith(caches.open(CACHE).then(async cache=>(await clean(await cache.match(PAGE)))||fetch(event.request)));return;
 }
 if(URLS.includes(url.href))event.respondWith(caches.open(CACHE).then(async cache=>(await clean(await cache.match(event.request)))||fetch(event.request)));
});
