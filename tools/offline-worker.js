/* Generated with a cache key tied to the published HTML. */
const CACHE='ultimate-frisbee-@@CACHE_VERSION@@';
const HOME=new URL('./',self.registration.scope).href;
const FILES=['./','./manifest.webmanifest','./apple-touch-icon.png','./icona-192.png','./icona-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys
    .filter(key=>key.startsWith('ultimate-frisbee-')&&key!==CACHE)
    .map(key=>caches.delete(key)))));
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||!url.href.startsWith(HOME))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).catch(()=>caches.match(HOME)));
  }else if(FILES.some(file=>new URL(file,HOME).href===url.href)){
    event.respondWith(fetch(request).catch(()=>caches.match(request)));
  }
});
