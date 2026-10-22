// Original anime stills, independently animated camera planes, one navigation clock.
(()=>{
  const overlay=document.getElementById('night-transition');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cast={
    nazuna:{name:'NANAKUSA NAZUNA',jp:'七草 ナズナ',note:'夜を、自由に。',figure:'nazuna-original.png',shots:[['nazuna-gaze','nazuna-night','nazuna-vampire'],['nazuna-vampire','nazuna-smile','nazuna-night']]},
    anko:{name:'UGUISU ANKO',jp:'鶯 アンコ',note:'夜の向こう側へ。',figure:'anko-season2.webp',shots:[['anko-profile','anko-neon','anko-smile'],['anko-neon','anko-profile','anko-smile']]}
  };
  const rounds={nazuna:0,anko:0},preloads=[];
  for(const name of new Set(Object.values(cast).flatMap(c=>c.shots.flat()))) {
    if(typeof Image==='undefined')break;
    const img=new Image();img.src=`assets/transitions/${name}.webp`;
    img.decode?.().catch(()=>{});preloads.push(img);
  }
  let active=null,queued=null;
  const disabled=()=>document.hidden||reduced.matches||document.body.dataset.motion==='off';
  function caption(task){
    document.getElementById('fx-title').textContent=task.label||'NIGHT WALK';
    document.getElementById('fx-subtitle').textContent=task.subtitle||'AFTER MIDNIGHT';
  }
  function draw(task){
    const actor=task.actor==='anko'?'anko':'nazuna',person=cast[actor];
    const variant=rounds[actor]++%person.shots.length,shots=person.shots[variant];
    overlay.dataset.actor=actor;overlay.dataset.variant=String(variant);
    overlay.dataset.style=task.style||document.body.dataset.style;
    overlay.style.setProperty('--figure',`url("assets/${person.figure}")`);
    ['fx-eye','fx-shot','fx-last'].forEach((id,i)=>{const image=document.getElementById(id);image.src=`assets/transitions/${shots[i]}.webp`;image.dataset.shot=shots[i]});
    document.getElementById('fx-character').textContent=person.name;
    document.getElementById('fx-name').textContent=person.jp;
    document.getElementById('fx-note').textContent=person.note;
    caption(task);
  }
  function commit(flight){
    if(active!==flight||flight.committed)return;
    flight.committed=true;
    try{flight.task.onCommit?.()}catch(error){console.error('Page transition failed',error)}
  }
  function finish(flight){
    if(active!==flight)return;
    commit(flight);flight.timers.forEach(clearTimeout);
    if(flight.frame)cancelAnimationFrame(flight.frame);
    const intervals=flight.intervals.sort((a,b)=>a-b);
    if(intervals.length){overlay.dataset.frameP95=intervals[Math.floor((intervals.length-1)*.95)].toFixed(1);overlay.dataset.frameCount=String(intervals.length)}
    overlay.hidden=true;overlay.classList.remove('is-running');document.body.classList.remove('is-transitioning');active=null;
    const next=queued;queued=null;if(next)run(next);
  }
  function measure(flight){
    if(typeof requestAnimationFrame!=='function')return;
    const frame=now=>{if(active!==flight)return;if(flight.lastFrame!==undefined)flight.intervals.push(now-flight.lastFrame);flight.lastFrame=now;flight.frame=requestAnimationFrame(frame)};
    flight.frame=requestAnimationFrame(frame);
  }
  function run(task={}){
    if(active){if(!active.committed){active.task=task;caption(task)}else queued=task;return}
    if(disabled()){task.onCommit?.();return}
    const flight={task,committed:false,timers:[],intervals:[]};active=flight;
    const ms=task.duration||((task.style||document.body.dataset.style)==='p5'?1120:1280);
    draw(task);overlay.hidden=false;overlay.style.setProperty('--fx-duration',ms+'ms');document.body.style?.setProperty('--fx-duration',ms+'ms');
    void overlay.offsetWidth;overlay.classList.add('is-running');document.body.classList.add('is-transitioning');measure(flight);
    // Opaque stage covers the viewport from 18% to 79%.
    flight.timers.push(setTimeout(()=>commit(flight),Math.round(ms*.5)),setTimeout(()=>finish(flight),ms),setTimeout(()=>finish(flight),ms+600));
  }
  function settle(){if(active)finish(active)}
  reduced.addEventListener('change',()=>{if(disabled())settle()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settle()});
  window.nightFX={run,settle,get busy(){return !!active},get disabled(){return disabled()}};
})();
