// Six-character cinematic controller. Route visits and content share one commit point.
(()=>{
  const routes=window.NightSections,overlay=document.getElementById('night-transition'),skip=document.getElementById('skip-transition');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),rounds={};let visits=new Set(),active=null,queued=null;
  try{const saved=JSON.parse(sessionStorage.getItem('ras-section-visits-v1')||'[]');if(Array.isArray(saved))visits=new Set(saved.filter(id=>Object.hasOwn(routes,id)))}catch{}
  const disabled=()=>document.hidden||reduced.matches||document.body.dataset.motion==='off';
  const routeFor=task=>routes[task.routeId]||Object.values(routes).find(r=>r.actor===task.actor)||routes.home;
  function remember(task){if(!routes[task.routeId]||task.remember===false)return;visits.add(task.routeId);try{sessionStorage.setItem('ras-section-visits-v1',JSON.stringify([...visits]))}catch{}}
  function apply(task){remember(task);try{task.onCommit?.()}catch(error){console.error('Page transition failed',error)}}
  function draw(task,ms){
    const route=routeFor(task),variant=(rounds[route.actor]||0)%route.shots.length;rounds[route.actor]=(rounds[route.actor]||0)+1;
    overlay.dataset.actor=route.actor;overlay.dataset.route=task.routeId||'';overlay.dataset.variant=String(variant);overlay.dataset.duration=String(ms);
    overlay.dataset.style=task.style||document.body.dataset.style;
    for(const [key,value] of Object.entries({tone:route.dark.accent,pale:route.dark.text,ink:route.dark.bg,figure:`url("${route.figure}")`,'cin-scene':`url("${route.scene}")`}))overlay.style.setProperty('--'+key,value);
    ['fx-eye','fx-shot','fx-last'].forEach((id,i)=>{const img=document.getElementById(id),shot=route.shots[variant][i];img.src=shot.src;img.dataset.portrait=String(!!shot.portrait);img.style.setProperty('--focus',shot.focus);img.style.setProperty('opacity','1');img.onerror=()=>img.style.setProperty('opacity','0')});
    document.getElementById('fx-character').textContent=route.en;
    document.getElementById('fx-name').textContent=route.jp;
    document.getElementById('fx-note').textContent=route.note;
    document.getElementById('fx-title').textContent=task.label||route.word;
    document.getElementById('fx-subtitle').textContent=task.subtitle||route.name;
    window.NightWorld?.prepare(task.routeId);
  }
  function commit(flight){if(active!==flight||flight.committed)return;flight.committed=true;apply(flight.task)}
  function stop(flight){
    flight.timers.forEach(clearTimeout);if(flight.frame)cancelAnimationFrame(flight.frame);
    const intervals=flight.intervals.sort((a,b)=>a-b);
    if(intervals.length){overlay.dataset.frameP95=intervals[Math.floor((intervals.length-1)*.95)].toFixed(1);overlay.dataset.frameCount=String(intervals.length)}
    overlay.hidden=true;skip.hidden=true;overlay.classList.remove('is-running');document.body.classList.remove('is-transitioning');active=null;
  }
  function finish(flight,flush=false){
    if(active!==flight)return;commit(flight);const next=queued;queued=null;stop(flight);
    if(next){if(flush||disabled()){apply(next);window.NightWorld?.reveal()}else run(next)}else window.NightWorld?.reveal()
  }
  function measure(flight){
    if(typeof requestAnimationFrame!=='function')return;
    const frame=now=>{if(active!==flight)return;if(flight.lastFrame!==undefined)flight.intervals.push(now-flight.lastFrame);flight.lastFrame=now;flight.frame=requestAnimationFrame(frame)};
    flight.frame=requestAnimationFrame(frame);
  }
  function run(task={}){
    if(active){if(!active.committed){stop(active);queued=null}else{queued=task;return}}
    if(disabled()){apply(task);window.NightWorld?.reveal();return}
    const ms=task.duration??(visits.has(task.routeId)?1600:3200),flight={task,committed:false,timers:[],intervals:[]};active=flight;
    draw(task,ms);overlay.hidden=false;skip.hidden=false;
    overlay.style.setProperty('--fx-duration',ms+'ms');document.body.style?.setProperty('--fx-duration',ms+'ms');
    void overlay.offsetWidth;overlay.classList.add('is-running');document.body.classList.add('is-transitioning');measure(flight);
    flight.timers.push(setTimeout(()=>commit(flight),ms/2),setTimeout(()=>finish(flight),ms),setTimeout(()=>finish(flight),ms+600));
  }
  function settle(){if(active)finish(active,true)}
  skip.addEventListener('click',settle);
  reduced.addEventListener('change',()=>{if(disabled())settle();window.NightWorld?.sync()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settle()});
  window.nightFX={run,settle,get busy(){return !!active},get disabled(){return disabled()},hasVisited(id){return visits.has(id)}};
})();
