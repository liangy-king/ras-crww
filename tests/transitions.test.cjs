const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function environment({reduced=false,motion='on'}={}){
  const nodes=new Map(),timers=new Map(),errors=[];let time=0,serial=0;
  const node=()=>({hidden:true,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},offsetWidth:1,textContent:''});
  const document={body:{dataset:{motion,style:'p3'},classList:{add(){},remove(){}}},getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}};
  const media={matches:reduced,addEventListener(type,fn){this.change=fn}};
  const context={window:{},document,matchMedia:()=>media,console:{error:e=>errors.push(e)},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:time+ms});return id},clearTimeout(id){timers.delete(id)}};
  vm.runInNewContext(fs.readFileSync('dist/transitions.js','utf8'),context);
  return {fx:context.window.nightFX,document,media,errors,nodes,tick(ms){const end=time+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn()}time=end}};
}
test('rapid navigation commits only the most recent uncommitted destination',()=>{
  const e=environment(),visited=[];e.fx.run({label:'ABOUT',onCommit:()=>visited.push('about')});e.fx.run({label:'JOURNAL',onCommit:()=>visited.push('notes')});e.fx.run({label:'GUESTBOOK',onCommit:()=>visited.push('comments')});e.tick(400);assert.deepEqual(visited,['comments']);e.tick(2000);assert.equal(e.fx.busy,false);assert.equal(e.nodes.get('night-transition').hidden,true);assert.deepEqual(visited,['comments']);
});
test('navigation after the midpoint queues only the latest destination',()=>{
  const e=environment(),visited=[];e.fx.run({onCommit:()=>visited.push('home')});e.tick(400);e.fx.run({onCommit:()=>visited.push('notes')});e.fx.run({onCommit:()=>visited.push('works')});e.tick(2000);assert.deepEqual(visited,['home','works']);assert.equal(e.fx.busy,false);
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
