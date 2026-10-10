// Isolated Service Worker simulation reused from the prior local verification.
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
function worker() {
  const handlers={},stores=new Map(),deleted=[],added=[];
  const origin='https://example.test',base=origin+'/great-hollow-router/';
  const absolute=r=>typeof r==='string'?new URL(r,base).href:r.url;
  let offline=false,failInstall=false,status=200,skipped=false,claimed=false;
  stores.set('gh-router-previous',new Map());stores.set('unrelated-cache',new Map());
  const caches={
    async open(name) {
      if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
      return {async addAll(assets) {
        if(failInstall)throw new Error('simulated precache failure');
        for(const asset of assets) {
          const file=asset==='./'?'index.html':asset.replace(/^\.\//,'').split('?')[0];
          store.set(absolute(asset),new Response(fs.readFileSync(path.join(root,file))));added.push(asset);
        }
      },async put(request,response){store.set(absolute(request),response);}};
    },
    async keys(){return [...stores.keys()];},
    async delete(name){deleted.push(name);return stores.delete(name);},
    async match(request){for(const store of stores.values()){const hit=store.get(absolute(request));if(hit)return hit.clone();}}
  };
  const context=vm.createContext({URL,Response,caches,
    self:{location:{origin},addEventListener:(name,handler)=>handlers[name]=handler,
      skipWaiting(){skipped=true;},clients:{claim(){claimed=true;}}},
    async fetch(){if(offline)throw new Error('simulated offline');return new Response('fresh',{status});}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
  async function event(name){const tasks=[];handlers[name]({waitUntil:p=>tasks.push(p)});await Promise.all(tasks);}
  async function request(asset,method='GET') {
    let response;const tasks=[];
    handlers.fetch({request:new Request(absolute(asset),{method}),respondWith:p=>response=p,waitUntil:p=>tasks.push(p)});
    if(!response)return undefined;const result=await response;await Promise.all(tasks);return result;
  }
  return {root,stores,deleted,added,absolute,event,request,
    assets:Array.from(vm.runInContext('ASSETS',context)),cacheName:vm.runInContext('CACHE',context),
    setOffline:value=>offline=value,setStatus:value=>status=value,setInstallFailure:value=>failInstall=value,
    skipped:()=>skipped,claimed:()=>claimed};
}
module.exports={worker};
