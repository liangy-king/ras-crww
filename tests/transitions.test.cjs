const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function environment({reduced=false,motion='on'}={}){
  const nodes=new Map(),timers=new Map(),errors=[];let time=0,serial=0;
  const node=()=>({hidden:true,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},offsetWidth:1,textContent:''});
  const document={addEventListener(type,fn){this[type]=fn},body:{dataset:{motion,style:'p3'},classList:{add(){},remove(){}}},getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}};
  const media={matches:reduced,addEventListener(type,fn){this.change=fn}};
  const context={window:{},document,matchMedia:()=>media,console:{error:e=>errors.push(e)},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:time+ms});return id},clearTimeout(id){timers.delete(id)}};
  vm.runInNewContext(fs.readFileSync('dist/transitions.js','utf8'),context);
  return {fx:context.window.nightFX,document,media,errors,nodes,tick(ms){const end=time+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn()}time=end}};
}
test('rapid navigation commits only the most recent uncommitted destination',()=>{
  const e=environment(),visited=[];e.fx.run({label:'ABOUT',onCommit:()=>visited.push('about')});e.fx.run({label:'JOURNAL',onCommit:()=>visited.push('notes')});e.fx.run({label:'GUESTBOOK',onCommit:()=>visited.push('comments')});e.tick(650);assert.deepEqual(visited,['comments']);e.tick(2000);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);assert.deepEqual(visited,['comments']);
});
test('navigation after the midpoint queues only the latest destination',()=>{
  const e=environment(),visited=[];e.fx.run({onCommit:()=>visited.push('home')});e.tick(650);e.fx.run({onCommit:()=>visited.push('notes')});e.fx.run({onCommit:()=>visited.push('works')});e.tick(2000);assert.deepEqual(visited,['home','works']);assert.equal(e.fx.busy,false);
});
test('a failed content update never leaves an opaque overlay on screen',()=>{
  const e=environment();e.fx.run({onCommit(){throw new Error('content failed')}});e.tick(2000);assert.equal(e.errors.length,1);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);
});
test('reduced motion and the animation-off preference change content immediately',()=>{
  for(const options of [{reduced:true},{motion:'off'}]){const e=environment(options);let count=0;e.fx.run({onCommit:()=>count++});assert.equal(count,1);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);}
});
test('turning motion off mid-transition settles once and cancels later callbacks',()=>{
  const e=environment();let count=0;e.fx.run({duration:950,onCommit:()=>count++});e.document.body.dataset.motion='off';e.fx.settle();e.tick(5000);assert.equal(count,1);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);
});
test('intro duration and the Anko silhouette source are retained',()=>{
  const e=environment();let count=0;e.fx.run({actor:'anko',duration:950,onCommit:()=>count++});assert.equal(e.nodes.get('fx-character').textContent,'UGUISU ANKO');e.tick(400);assert.equal(count,0);e.tick(100);assert.equal(count,1);e.tick(450);assert.equal(e.fx.busy,false);
});

test('each character has three distinct shots and cycles its next take',()=>{
  const e=environment();
  for(const actor of ['nazuna','anko']){
    e.fx.run({actor});const first=['fx-eye','fx-shot','fx-last'].map(id=>e.nodes.get(id).src);
    assert.equal(new Set(first).size,3);assert.equal(e.nodes.get('night-transition').dataset.actor,actor);
    e.tick(2000);e.fx.run({actor});const second=['fx-eye','fx-shot','fx-last'].map(id=>e.nodes.get(id).src);
    assert.notDeepEqual(first,second);e.tick(2000);
  }
});
test('retargeting updates navigation without swapping a character mid-take',()=>{
  const e=environment();e.fx.run({actor:'nazuna'});const shot=e.nodes.get('fx-shot').src;
  e.fx.run({actor:'anko',label:'WORKS'});assert.equal(e.nodes.get('fx-shot').src,shot);
  assert.equal(e.nodes.get('fx-title').textContent,'WORKS');e.tick(2000);
});
test('hiding a tab commits its queued destination and clears all animation state',()=>{
  const e=environment(),visited=[];e.fx.run({onCommit:()=>visited.push('home')});e.tick(650);
  e.fx.run({onCommit:()=>visited.push('works')});e.document.hidden=true;e.document.visibilitychange();
  assert.deepEqual(visited,['home','works']);assert.equal(e.fx.busy,false);e.tick(5000);assert.deepEqual(visited,['home','works']);
});
test('P5 uses its own duration and commits only while the stage is covered',()=>{
  const e=environment();let count=0;e.fx.run({style:'p5',onCommit:()=>count++});
  e.tick(559);assert.equal(count,0);e.tick(1);assert.equal(count,1);e.tick(560);assert.equal(e.fx.busy,false);
});
test('all cinematic images have traceable official sources and exist in the published tree',()=>{
  const sources=JSON.parse(fs.readFileSync('dist/assets/transitions/sources.json','utf8'));
  assert.equal(sources.length,8);for(const source of sources){assert.equal(new URL(source.source).hostname,'yofukashi-no-uta.com');assert.ok(fs.statSync('dist/assets/transitions/'+source.file).size>0)}
});
