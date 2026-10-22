(()=>{
  const $=selector=>document.querySelector(selector);
  const routes={home:{name:'首页',word:'HOME',number:'01'},about:{name:'关于我',word:'ABOUT',number:'02'},notes:{name:'最新随笔',word:'JOURNAL',number:'03',actor:'anko'},works:{name:'精选作品',word:'WORKS',number:'04',actor:'anko'},comments:{name:'夜间留言',word:'GUESTBOOK',number:'05'},settings:{name:'设置',word:'CONFIG',number:'06'}};
  const storage={get(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
  const scroll=$('#content-scroll'),nav=$('.sidebar'),modal=$('#modal');
  let current='home',closeTimer;
  const normalize=id=>id==='contact'?'about':Object.hasOwn(routes,id)?id:'home';
  const currentHash=()=>normalize(location.hash.slice(1));
  function showRoute(id,{history='push',focus=true}={}){
    const route=routes[id];
    document.querySelectorAll('.section-panel').forEach(panel=>{panel.hidden=panel.id!==id});
    nav.querySelectorAll('a').forEach(link=>{if(link.hash==='#'+id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
    current=id;document.body.dataset.route=id;$('#footer-word').textContent=route.word;
    document.title=id==='home'?'ras_crww · 夜间小站':route.name+' · ras_crww';scroll.scrollTop=0;
    if(history==='push'&&location.hash!=='#'+id)window.history.pushState(null,'','#'+id);
    if(history==='replace')window.history.replaceState(null,'','#'+id);
    if(id==='settings')syncSettings();
    if(focus)$('#'+id).querySelector('h1,h2')?.focus({preventScroll:true});
  }
  function navigate(id,options={}){
    id=normalize(id);if(id===current&&!nightFX.busy)return;
    const route=routes[id];nightFX.run({label:route.word,subtitle:route.name,actor:route.actor,onCommit:()=>showRoute(id,options)});
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');if(!link||link.classList.contains('skip'))return;
    const id=link.hash.slice(1);if(!Object.hasOwn(routes,id)&&id!=='contact')return;
    event.preventDefault();navigate(id);
  });
  window.addEventListener('popstate',()=>navigate(currentHash(),{history:'none'}));
  window.addEventListener('hashchange',()=>navigate(currentHash(),{history:'none'}));
  nav.addEventListener('keydown',event=>{
    const links=[...nav.querySelectorAll('a')],index=links.indexOf(document.activeElement);if(index<0)return;
    let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%links.length;
    else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+links.length)%links.length;
    else if(event.key==='Home')next=0;else if(event.key==='End')next=links.length-1;
    if(next!==undefined){event.preventDefault();links[next].focus()}
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||modal.open||event.target.closest('input,textarea,select,[contenteditable=true]'))return;
    if(current!=='home'){event.preventDefault();navigate('home')}
  });
  function setTheme(value){document.documentElement.dataset.theme=value;$('#theme').setAttribute('aria-pressed',String(value==='light'));$('#theme').setAttribute('aria-label',value==='dark'?'切换到浅色主题':'切换到深色主题');$('meta[name=theme-color]').content=value==='dark'?'#11131f':'#e7e4ef';$('#theme-choice').value=value;storage.set('ras-theme',value)}
  let wantedTheme=storage.get('ras-theme','dark')==='light'?'light':'dark';setTheme(wantedTheme);
  function changeTheme(value){wantedTheme=value;nightFX.run({label:value==='dark'?'MIDNIGHT':'MOONLIGHT',subtitle:value==='dark'?'深夜':'月白',onCommit:()=>setTheme(value)})}
  $('#theme').onclick=()=>changeTheme(wantedTheme==='dark'?'light':'dark');$('#theme-choice').onchange=event=>changeTheme(event.target.value);
  function setStyle(value){document.body.dataset.style=value;$('#style-choice').value=value;storage.set('ras-menu-style',value)}
  setStyle(storage.get('ras-menu-style','p3')==='p5'?'p5':'p3');
  $('#style-choice').onchange=event=>{const value=event.target.value;nightFX.run({style:value,label:value==='p3'?'FLOW':'CUT IN',subtitle:value==='p3'?'水下漂浮':'分镜切入',onCommit:()=>setStyle(value)})};
  document.body.dataset.motion=storage.get('ras-menu-motion','on')==='off'?'off':'on';
  $('#motion-choice').onchange=event=>{const value=event.target.checked?'on':'off';document.body.dataset.motion=value;storage.set('ras-menu-motion',value);if(value==='off')nightFX.settle()};
  function syncSettings(){
    $('#style-choice').value=document.body.dataset.style;$('#theme-choice').value=document.documentElement.dataset.theme;
    $('#motion-choice').checked=document.body.dataset.motion!=='off';
    $('#pet-choice').checked=!$('.site-pets')?.classList.contains('pets-hidden');
    $('#motion-hint').textContent=matchMedia('(prefers-reduced-motion: reduce)').matches?'系统已启用减少动态效果，转场将自动跳过。':'七草荠 · 月夜漂浮 / 莺馅子 · 夜间调查。不同镜头会轮换出现。';
  }
  $('#pet-choice').onchange=event=>{const root=$('.site-pets');if(!root)return;const hidden=root.classList.contains('pets-hidden');if(event.target.checked&&hidden)root.querySelector('.pet-summon').click();else if(!event.target.checked&&!hidden)root.querySelector('[data-pet-action=hide]').click()};
  $('#replay-intro').onclick=()=>nightFX.run({label:'ras_crww',subtitle:'終焉の魔王',duration:1600});
  $('#replay-anko').onclick=()=>nightFX.run({actor:'anko',label:'NIGHT WALK',subtitle:'夜间调查',duration:1600});
  function openModal(content){clearTimeout(closeTimer);modal.classList.remove('is-closing');$('#modal-content').innerHTML=content;if(!modal.open)modal.showModal()}
  function closeModal(){if(!modal.open)return;clearTimeout(closeTimer);if(nightFX.disabled){modal.close();return}modal.classList.add('is-closing');closeTimer=setTimeout(()=>{modal.close();modal.classList.remove('is-closing')},200)}
  $('.close-modal').onclick=closeModal;modal.addEventListener('cancel',event=>{event.preventDefault();closeModal()});
  modal.addEventListener('click',event=>{if(event.target!==modal)return;const rect=modal.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeModal()});
  const posts=[['第一夜 / 夜间手记','初めて夜に一人で外に出た。','assets/manga-page-11.jpg'],['片段收藏 / よふかしのうた','今日に満足できるまで、夜ふかししてみろよ。','assets/manga-page-6.jpg']];
  document.querySelectorAll('[data-post]').forEach(button=>button.onclick=()=>{const p=posts[Number(button.dataset.post)];openModal(`<span class="mini-label">${p[0]}</span><h2 id="modal-title">${p[1]}</h2><img src="${p[2]}" alt="原漫画试读画面"><p>《彻夜之歌》台词收藏 · 随笔占位</p>`)});
  $('#work').onclick=()=>openModal('<span class="mini-label">NIGHT FRAGMENTS / 001</span><h2 id="modal-title">夜间切片</h2><img src="assets/anime-vending-visual.jpg" alt="动画官方售货机主题原图"><p>动画官方售货机主题视觉 · 原图收藏</p>');
  $('#credits').onclick=()=>openModal('<span class="mini-label">ARTWORK & SOURCES</span><h2 id="modal-title">属于夜晚的画面</h2><p>背景：<a href="https://yofukashi-no-uta.com/1st/news/archives/24" target="_blank" rel="noopener noreferrer">动画官方售货机视觉 ↗</a>。直接使用原图裁切，仅缩放、压暗和调色，没有生成或补绘建筑。</p><p>七草荠立绘与转场剪影：<a href="https://yofukashi-no-uta.com/1st/character/#/nazuna" target="_blank" rel="noopener noreferrer">第一季动画官方角色图 ↗</a>。莺馅子：第二季动画官方透明角色图。剪影由原图透明蒙版制作，仅做平移、旋转与缩放，不重新绘制角色。</p><p>角色分镜：<a href="https://yofukashi-no-uta.com/story/" target="_blank" rel="noopener noreferrer">第二季官网公开剧照 ↗</a>。采用原图视线、主镜头和收尾镜头组合，素材保存在本站；背景没有 AI 重绘。</p><p>漫画：<a href="https://shogakukan-comic.jp/book?isbn=9784091294920" target="_blank" rel="noopener noreferrer">小学馆第一卷公开试读 ↗</a>。</p><p>音乐：用户提供的 Creepy Nuts 两季 OP / ED 与ヨルシカ歌曲，本站纯音频播放。字标及英文菜单：Russo One；称号：Yuji Boku。中文菜单采用系统粗体。字体附有 SIL Open Font License。</p><p>界面参考 P3 / P5 设置菜单的分区、选中态与切换节奏。人物与漫画版权归原作者及权利人所有。</p>');
  const initial=currentHash();showRoute(initial,{history:location.hash?'none':'replace',focus:false});
  let firstVisit=true;try{firstVisit=!sessionStorage.getItem('ras-game-menu-intro');sessionStorage.setItem('ras-game-menu-intro','1')}catch{}
  if(firstVisit)nightFX.run({label:'ras_crww',subtitle:'終焉の魔王',duration:1600});
})();
