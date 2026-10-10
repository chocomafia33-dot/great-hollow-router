const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {worker}=require('./helpers/service-worker.cjs');
test('PWA: HTML versions and essential assets match precache',()=>{
  const w=worker(),html=fs.readFileSync(path.join(w.root,'index.html'),'utf8');
  const refs=[...html.matchAll(/(?:src|href)="((?:style\.css|app\.js)[^"]*)"/g)].map(m=>'./'+m[1]);
  assert.equal(refs.length,2);for(const ref of refs)assert(w.assets.includes(ref),`missing ${ref}`);
  for(const file of ['./','./index.html','./manifest.webmanifest','./map-top.webp','./map-bottom.webp'])assert(w.assets.includes(file),file);
});
test('PWA: install caches all assets before skipWaiting',async()=>{
  const w=worker();await w.event('install');assert(w.skipped());assert.deepEqual(w.added,w.assets);
  assert.equal(w.stores.get(w.cacheName).size,w.assets.length);
});
test('PWA: failed precache rejects install without skipWaiting',async()=>{
  const w=worker();w.setInstallFailure(true);await assert.rejects(w.event('install'),/precache failure/);assert(!w.skipped());
});
test('PWA: activate deletes old app caches, preserves unrelated caches, claims clients',async()=>{
  const w=worker();await w.event('install');await w.event('activate');
  assert.deepEqual(w.deleted,['gh-router-previous']);assert(w.stores.has(w.cacheName));assert(w.stores.has('unrelated-cache'));assert(w.claimed());
});
test('PWA: all precached assets available after network failure; missing asset errors',async()=>{
  const w=worker();await w.event('install');await w.event('activate');w.setOffline(true);
  for(const asset of w.assets){const r=await w.request(asset);assert.equal(r.status,200,asset);assert((await r.arrayBuffer()).byteLength>0,asset);}
  assert.equal((await w.request('./not-cached')).type,'error');
});
test('PWA: network response updates cache for subsequent offline use',async()=>{
  const w=worker();await w.event('install');const asset=w.assets.find(a=>a.startsWith('./app.js'));
  assert.equal(await (await w.request(asset)).text(),'fresh');w.setOffline(true);assert.equal(await (await w.request(asset)).text(),'fresh');
});
test('PWA: HTTP error does not replace previously cached content',async()=>{
  const w=worker();await w.event('install');const asset=w.assets.find(a=>a.startsWith('./app.js'));
  const before=await w.stores.get(w.cacheName).get(w.absolute(asset)).clone().text();
  w.setStatus(404);assert.equal((await w.request(asset)).status,404);w.setOffline(true);
  assert.equal(await (await w.request(asset)).text(),before);
});
test('PWA: cross-origin and non-GET requests bypass the handler',async()=>{
  const w=worker();assert.equal(await w.request('https://other.test/'),undefined);assert.equal(await w.request('./','POST'),undefined);
});
