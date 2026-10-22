// Ambient world, palette and scene lifecycle. Content, audio and forms remain mounted.
(()=>{
  const routes=window.NightSections,body=document.body,world=document.getElementById('night-world');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const images=[document.getElementById('scene-a'),document.getElementById('scene-b')];
  const figure=document.getElementById('world-figure'),cache=new Map();let current='home',theme='dark',generation=0,layer=0,frame=0;
  const enabled=()=>body.dataset.motion!=='off'&&body.dataset.ambient!=='off'&&!reduced.matches&&!document.hidden;
  function load(src){
    if(!cache.has(src)){const img=new Image();const ready=new Promise(resolve=>{img.onload=()=>{if(img.decode)img.decode().catch(()=>{}).then(resolve);else resolve()};img.onerror=resolve});img.src=src;cache.set(src,{img,ready})}
    return cache.get(src).ready;
  }
  function prepare(id){const route=routes[id];if(!route)return;[route.scene,route.figure,...route.shots.flat().map(s=>s.src)].forEach(load)}
  function sync(){body.dataset.ambientPaused=enabled()?'false':'true';if(!enabled()){cancelAnimationFrame(frame);frame=0;world.style.setProperty('--pointer-x','0px');world.style.setProperty('--pointer-y','0px')}}
  function apply(id,mode=theme){
    document.getElementById('content-scroll').classList.remove('view-enter');
    const route=routes[id]||routes.home;current=routes[id]?id:'home';theme=mode==='light'?'light':'dark';
    const colors=route[theme];for(const [key,value] of Object.entries(colors))body.style.setProperty('--'+key,value);
    body.dataset.actor=route.actor;body.dataset.decor=route.decor;world.dataset.decor=route.decor;
    document.querySelector('meta[name=theme-color]').content=colors.bg;
    document.getElementById('world-symbol').textContent=route.symbol;
    document.getElementById('world-name').textContent=route.en;
    document.getElementById('world-index').textContent=route.number+' / NIGHT WALK';
    figure.src=route.figure;figure.hidden=current==='home';
    document.getElementById('world-jp').textContent=route.jp;
    const next=++generation,target=1-layer;
    // Never show a previous character's environment under a newly selected palette.
    images.forEach(img=>img.classList.remove('is-visible'));
    load(route.scene).then(()=>{if(next!==generation)return;images[target].src=route.scene;images[target].style.objectPosition=route.scenePosition;images[target].classList.add('is-visible');layer=target});
    sync();prepare(current);
  }
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  document.addEventListener('pointermove',event=>{
    if(!enabled()||!matchMedia('(min-width: 761px) and (pointer: fine)').matches)return;
    cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{world.style.setProperty('--pointer-x',((event.clientX/innerWidth-.5)*14).toFixed(1)+'px');world.style.setProperty('--pointer-y',((event.clientY/innerHeight-.5)*10).toFixed(1)+'px');frame=0});
  },{passive:true});
  for(const type of ['pointerover','focusin'])document.addEventListener(type,event=>{const link=event.target.closest?.('a[href^="#"]');if(link)prepare(link.hash.slice(1))},{passive:true});
  // Small environment images may warm in the background; large character shots stay on demand.
  setTimeout(()=>{Object.values(routes).forEach(route=>load(route.scene))},2000);
  function reveal(){const content=document.getElementById('content-scroll');content.classList.remove('view-enter');void content.offsetWidth;content.classList.add('view-enter')}
  window.NightWorld={apply,prepare,sync,reveal,get current(){return current}};
})();
