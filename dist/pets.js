// Reuse the user's original v2 atlases: 8 x 11 cells, each 192 x 208.
(()=>{
  const root=document.createElement('aside');
  root.className='site-pets';root.setAttribute('aria-label','七草荠桌宠');
  root.innerHTML=`<div class="pet-controls"><span class="pet-controls-title">☾ 夜间同伴</span><button data-pet-action="pet">摸摸头</button><button data-pet-action="jump">一起跳</button><button data-pet-action="pause" aria-pressed="false">暂停</button><button data-pet-action="hide">收起 ×</button></div><button class="pet-summon" hidden>☾ 召唤桌宠</button><div class="pet-announcement" role="status" aria-live="polite"></div>`;
  document.body.append(root);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=false,hidden=false,statusTimer;
  try{hidden=localStorage.getItem('ras-pets-hidden')==='true';paused=localStorage.getItem('ras-pets-paused')==='true'}catch{}
  const definitions=[{kind:'cushion',name:'七草荠·头像抱枕',file:'nazuna-cushion.png'},{kind:'chibi',name:'七草荠 Q版',file:'nazuna-chibi.png'}];
  const pets=definitions.map((d,i)=>{
    const el=document.createElement('button');el.className='site-pet';el.setAttribute('aria-label',d.name+'，点击互动，方向键移动，空格跳跃');el.title=d.name+' · 拖动 / 点击 / 双击跳跃';
    el.innerHTML='<span class="pet-sprite"></span><span class="pet-name"></span>';
    el.querySelector('.pet-name').textContent=d.name;el.querySelector('.pet-sprite').style.backgroundImage=`url("assets/pets/${d.file}")`;root.append(el);
    const p={...d,el,x:i?window.innerWidth-145:14,y:0,row:0,frame:0,action:null,drag:null};p.y=window.innerHeight-size(p).h-10;
    function pointerEnd(e){if(!p.drag)return;const drag=p.drag;p.drag=null;p.el.classList.remove('is-dragging');if(p.el.hasPointerCapture(e.pointerId))p.el.releasePointerCapture(e.pointerId);if(drag.moved){act(p,p.kind==='cushion'?(drag.dx<0?2:1):3,1100,p.kind==='cushion'?'滚一圈，再出发。':'在这里陪你。')}else act(p,3,1500,p.kind==='cushion'?'摸摸头。':'晚上好呀。')}
    el.addEventListener('pointerdown',e=>{if(e.button!==0)return;p.drag={sx:e.clientX,sy:e.clientY,x:p.x,y:p.y,dx:0,moved:false};p.action=null;el.setPointerCapture(e.pointerId);el.classList.add('is-dragging')});
    el.addEventListener('pointermove',e=>{if(!p.drag)return;const drag=p.drag;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;drag.dx=dx;drag.moved ||=Math.hypot(dx,dy)>5;p.x=drag.x+dx;p.y=drag.y+dy;if(drag.moved){p.row=dx<0?2:1;p.frame=Math.floor(performance.now()/110)%8}position(p);draw(p)});
    el.addEventListener('pointerup',pointerEnd);el.addEventListener('pointercancel',e=>{p.drag=null;el.classList.remove('is-dragging');p.row=0;p.frame=0;position(p);draw(p)});
    el.addEventListener('click',e=>{if(e.detail===0)act(p,3,1500,'你好呀。')});
    el.addEventListener('dblclick',()=>jump(p));
    el.addEventListener('keydown',e=>{const step=20;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();if(e.key===' '){jump(p);return}if(e.key==='ArrowLeft')p.x-=step;if(e.key==='ArrowRight')p.x+=step;if(e.key==='ArrowUp')p.y-=step;if(e.key==='ArrowDown')p.y+=step;position(p)});
    return p;
  });
  function size(p){const r=p.el.getBoundingClientRect();return{w:r.width||120,h:r.height||130}}
  function position(p){const s=size(p);p.x=Math.max(0,Math.min(innerWidth-s.w,p.x));p.y=Math.max(75,Math.min(innerHeight-s.h-4,p.y));p.el.style.left=p.x+'px';p.el.style.top=p.y+'px'}
  function draw(p){const s=size(p);p.el.querySelector('.pet-sprite').style.backgroundPosition=`${-p.frame*s.w}px ${-p.row*s.h}px`}
  function say(text){root.querySelector('.pet-announcement').textContent=text;root.querySelector('.pet-announcement').classList.add('visible');clearTimeout(statusTimer);statusTimer=setTimeout(()=>root.querySelector('.pet-announcement').classList.remove('visible'),1800)}
  function act(p,row,ms,text){p.action={row,start:performance.now(),end:performance.now()+ms};p.row=row;p.frame=0;draw(p);if(text)say(text)}
  function jump(p){act(p,4,800,'一起跳！');if(!reduced&&!paused&&document.body.dataset.motion!=='off')p.el.animate([{translate:'0 0'},{translate:'0 -45px',offset:.45},{translate:'0 0'}],{duration:800,easing:'ease-in-out'})}
  function sync(){root.classList.toggle('pets-hidden',hidden);root.querySelector('.pet-summon').hidden=!hidden;const b=root.querySelector('[data-pet-action=pause]');b.textContent=paused?'继续':'暂停';b.setAttribute('aria-pressed',String(paused));try{localStorage.setItem('ras-pets-hidden',String(hidden));localStorage.setItem('ras-pets-paused',String(paused))}catch{}}
  root.querySelectorAll('[data-pet-action]').forEach(b=>b.onclick=()=>{switch(b.dataset.petAction){case'pet':pets.forEach(p=>act(p,3,1600));say('摸摸头，今晚也辛苦了。');break;case'jump':pets.forEach(jump);break;case'pause':paused=!paused;if(paused)pets.forEach(p=>p.el.getAnimations().forEach(a=>a.cancel()));sync();break;case'hide':hidden=true;sync();break}});
  root.querySelector('.pet-summon').onclick=()=>{hidden=false;sync();say('我们回来啦。')};
  let pointer={x:innerWidth/2,y:innerHeight/2};document.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY}},{passive:true});
  let tick=0;
  setInterval(()=>{if(hidden||paused||document.hidden||document.body.dataset.motion==='off')return;tick++;const now=performance.now();pets.forEach(p=>{if(p.drag)return;if(p.action&&now<p.action.end){p.row=p.action.row;const count=p.row===3?4:p.row===4?5:8;p.frame=Math.floor((now-p.action.start)/120)%count}else{p.action=null;if(reduced){p.row=0;p.frame=0}else if(tick%65>48){const s=size(p);let angle=(Math.atan2(pointer.y-(p.y+s.h/2),pointer.x-(p.x+s.w/2))*180/Math.PI+90+360)%360;const direction=Math.round(angle/22.5)%16;p.row=9+Math.floor(direction/8);p.frame=direction%8}else{p.row=0;p.frame=Math.floor(tick/2)%6}}draw(p)})},120);
  function dock(){pets.forEach((p,i)=>{if(p.drag)return;const s=size(p);p.x=innerWidth<=760?(i?innerWidth-s.w-8:8):(i?145:12);p.y=innerHeight-s.h-5;position(p);draw(p)})}
  window.addEventListener('resize',dock);dock();sync();
})();
