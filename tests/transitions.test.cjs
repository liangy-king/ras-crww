const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const crypto=require('node:crypto');
function environment({reduced=false,motion='on',saved=new Map()}={}){
  const nodes=new Map(),timers=new Map(),errors=[];let time=0,serial=0;
  const node=()=>({hidden:true,dataset:{},style:{values:{},setProperty(k,v){this.values[k]=v}},classList:{add(){},remove(){}},addEventListener(type,fn){this[type]=fn},offsetWidth:1,textContent:''});
  const document={addEventListener(type,fn){this[type]=fn},body:{dataset:{motion,style:'p3'},style:node().style,classList:node().classList},getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}};
  const media={matches:reduced,addEventListener(type,fn){this.change=fn}};
  const context={window:{NightWorld:{prepare(){},reveal(){},sync(){}}},document,sessionStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},matchMedia:()=>media,console:{error:e=>errors.push(e)},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:time+ms});return id},clearTimeout(id){timers.delete(id)}};
  vm.runInNewContext(fs.readFileSync('dist/sections.js','utf8'),context);vm.runInNewContext(fs.readFileSync('dist/transitions.js','utf8'),context);
  return {fx:context.window.nightFX,routes:context.window.NightSections,document,media,errors,nodes,saved,timers,tick(ms){const end=time+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn()}time=end}};
}
test('each of six routes has a unique cast, environment and two original takes',()=>{
  const e=environment(),routes=Object.values(e.routes);assert.equal(routes.length,6);assert.equal(new Set(routes.map(r=>r.actor)).size,6);assert.equal(new Set(routes.map(r=>r.scene)).size,6);
  const hashes=new Set();for(const r of routes){hashes.add(crypto.createHash('sha256').update(fs.readFileSync('dist/'+r.scene)).digest('hex'));assert.equal(r.shots.length,2);assert.notEqual(JSON.stringify(r.shots[0]),JSON.stringify(r.shots[1]));for(const path of [r.figure,r.scene,...r.shots.flat().map(s=>s.src)])assert.ok(fs.statSync('dist/'+path).size>0);for(const mode of ['dark','light'])for(const key of ['bg','surface','text','accent','shadow','footer','footer-ink'])assert.match(r[mode][key],/^#[0-9a-f]{6}$/i)}assert.equal(hashes.size,6);
});
test('first entry is 3200ms, repeat is 1600ms, and both commit under full cover',()=>{
  const e=environment();let n=0;e.fx.run({routeId:'works',onCommit:()=>n++});assert.equal(e.nodes.get('night-transition').dataset.duration,'3200');e.tick(1599);assert.equal(n,0);e.tick(1);assert.equal(n,1);e.tick(1600);assert.equal(e.fx.busy,false);
  e.fx.run({routeId:'works',onCommit:()=>n++});assert.equal(e.nodes.get('night-transition').dataset.duration,'1600');e.tick(799);assert.equal(n,1);e.tick(1);assert.equal(n,2);e.tick(800);assert.equal(e.fx.busy,false);
});
test('route history survives refresh without treating a different route as visited',()=>{
  const first=environment();first.fx.run({routeId:'about'});first.fx.settle();const second=environment({saved:first.saved});assert.equal(second.fx.hasVisited('about'),true);assert.equal(second.fx.hasVisited('comments'),false);second.fx.run({routeId:'about'});assert.equal(second.nodes.get('night-transition').dataset.duration,'1600');
});
test('rapid pre-commit navigation cancels obsolete takes and commits the final destination only',()=>{
  const e=environment(),seen=[];for(const id of ['about','notes','comments'])e.fx.run({routeId:id,onCommit:()=>seen.push(id)});assert.equal(e.nodes.get('night-transition').dataset.actor,'mahiru');e.tick(3200);assert.deepEqual(seen,['comments']);assert.equal(e.fx.hasVisited('about'),false);assert.equal(e.timers.size,0);
});
test('post-commit navigation queues only the latest destination',()=>{
  const e=environment(),seen=[];e.fx.run({routeId:'home',onCommit:()=>seen.push('home')});e.tick(1600);e.fx.run({routeId:'notes',onCommit:()=>seen.push('notes')});e.fx.run({routeId:'settings',onCommit:()=>seen.push('settings')});e.tick(4800);assert.deepEqual(seen,['home','settings']);assert.equal(e.fx.busy,false);
});
test('skip commits the latest queued destination immediately, hides the button and cancels all timers',()=>{
  const e=environment(),seen=[];e.fx.run({routeId:'home',onCommit:()=>seen.push('home')});e.tick(1600);e.fx.run({routeId:'works',onCommit:()=>seen.push('works')});e.nodes.get('skip-transition').click();assert.deepEqual(seen,['home','works']);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('skip-transition').hidden,true);e.tick(10000);assert.deepEqual(seen,['home','works']);assert.equal(e.timers.size,0);
});
test('a failing callback cannot leave the screen covered',()=>{
  const e=environment();e.fx.run({routeId:'notes',onCommit(){throw Error('failed')}});e.tick(5000);assert.equal(e.errors.length,1);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);
});
test('reduced motion and global-off route immediately, preserving visit history',()=>{
  for(const opt of [{reduced:true},{motion:'off'}]){const e=environment(opt);let n=0;e.fx.run({routeId:'about',onCommit:()=>n++});assert.equal(n,1);assert.equal(e.fx.busy,false);assert.equal(e.fx.hasVisited('about'),true);assert.equal(e.nodes.size,2)}
});
test('changing to reduced motion or hiding the tab settles pending navigation once',()=>{
  for(const kind of ['reduce','hide']){const e=environment();let n=0;e.fx.run({routeId:'comments',onCommit:()=>n++});if(kind==='reduce'){e.media.matches=true;e.media.change()}else{e.document.hidden=true;e.document.visibilitychange()}e.tick(10000);assert.equal(n,1);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true)}
});
test('preview does not consume a route first visit and cycles independent character shots',()=>{
  const e=environment();for(const routeId of Object.keys(e.routes)){e.fx.run({routeId,remember:false,duration:3200});const first=e.nodes.get('fx-eye').src;assert.equal(e.nodes.get('night-transition').dataset.actor,e.routes[routeId].actor);e.fx.settle();e.fx.run({routeId,remember:false,duration:3200});assert.notEqual(e.nodes.get('fx-eye').src,first);e.fx.settle();assert.equal(e.fx.hasVisited(routeId),false)}
});
test('invalid session history does not break route transitions',()=>{
  const saved=new Map([['ras-section-visits-v1','{invalid']]);const e=environment({saved});e.fx.run({routeId:'settings'});e.fx.settle();assert.equal(e.fx.hasVisited('settings'),true);
});
test('published additions carry official source records',()=>{
  const sources=JSON.parse(fs.readFileSync('dist/assets/scenes/sources.json'));for(const s of sources){assert.ok(['yofukashi-no-uta.com','shogakukan-comic.jp'].includes(new URL(s.source).hostname));assert.ok(fs.statSync('dist/'+s.file).size>0)}
});
