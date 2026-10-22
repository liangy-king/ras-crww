// A single transition controller; content, music and form DOM stay mounted.
(()=>{
  const overlay=document.getElementById('night-transition');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,queued=null;
  const disabled=()=>reduced.matches||document.body.dataset.motion==='off';
  function draw(task){
    const anko=task.actor==='anko';
    overlay.style.setProperty('--figure',`url("assets/${anko?'anko-season2.webp':'nazuna-original.png'}")`);
    overlay.dataset.style=task.style||document.body.dataset.style;
    document.getElementById('fx-character').textContent=anko?'UGUISU ANKO':'NANAKUSA NAZUNA';
    document.getElementById('fx-title').textContent=task.label||'NIGHT WALK';
    document.getElementById('fx-subtitle').textContent=task.subtitle||'夜は、まだこれから。';
  }
  function commit(flight){if(active!==flight||flight.committed)return;flight.committed=true;try{flight.task.onCommit?.()}catch(error){console.error('Page transition failed',error)} }
  function finish(flight){
    if(active!==flight)return;
    commit(flight);flight.timers.forEach(clearTimeout);overlay.hidden=true;overlay.classList.remove('is-running');document.body.classList.remove('is-transitioning');active=null;
    const next=queued;queued=null;if(next)run(next);
  }
  function run(task){
    if(active){if(!active.committed){active.task=task;draw(task)}else queued=task;return}
    if(disabled()){task.onCommit?.();return}
    const flight={task,committed:false,timers:[]};active=flight;
    const ms=task.duration||((task.style||document.body.dataset.style)==='p5'?620:760);
    draw(task);overlay.hidden=false;overlay.style.setProperty('--fx-duration',ms+'ms');
    void overlay.offsetWidth;overlay.classList.add('is-running');document.body.classList.add('is-transitioning');
    flight.timers.push(setTimeout(()=>commit(flight),Math.round(ms*.48)),setTimeout(()=>finish(flight),ms),setTimeout(()=>finish(flight),ms+600));
  }
  function settle(){if(active)finish(active)}
  reduced.addEventListener('change',()=>{if(disabled())settle()});
  window.nightFX={run,settle,get busy(){return !!active},get disabled(){return disabled()}};
})();
