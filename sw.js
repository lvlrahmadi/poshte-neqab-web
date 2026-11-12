const CACHE='poshte-neghab-v54-name-select-role-confirm';
const FILES=['./','./index.html','./app.js','./engine.js','./fonts-loader.js','./fonts/homa.ttf.b64','./fonts/noto-nastaliq-urdu.ttf.b64','./fonts/HOMA-LICENSE.txt','./fonts/NOTO-NASTALIQ-OFL.txt','./manifest.webmanifest','./icon.svg?v=13','./icon-192.png','./icon-512.png','./assets/roles/detective.svg','./assets/roles/doctor.svg','./assets/roles/guard.svg','./assets/roles/interrogator.svg','./assets/roles/tracker.svg','./assets/roles/psychologist.svg','./assets/roles/judge.svg','./assets/roles/reporter.svg','./assets/roles/sniper.svg','./assets/roles/specialist.svg','./assets/roles/godfather.svg','./assets/roles/framer.svg','./assets/roles/poisoner.svg','./assets/roles/silencer.svg','./assets/roles/infiltrator.svg','./assets/roles/underboss.svg','./assets/roles/serial-killer.svg','./assets/roles/deceiver.svg','./assets/roles/opportunist.svg','./assets/roles/bodyguard.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});