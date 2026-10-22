// Official Fuji TV anime-channel OP/ED uploads; no copied audio files.
(()=>{
  const tracks=[
    {name:'堕天',tag:'SEASON 1 · OP',id:'AwXRPWmgLbU'},
    {name:'よふかしのうた',tag:'SEASON 1 · ED',id:'PvyaVqfylu4'},
    {name:'Mirage',tag:'SEASON 2 · OP',id:'l5S0JhqULAU'},
    {name:'眠れ',tag:'SEASON 2 · ED',id:'K5T_aKoN31Q'}
  ];
  const el=s=>document.querySelector(s),select=el('#track-select'),play=el('#play'),progress=el('#progress'),volume=el('#volume');
  const svg=body=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
  const playIcon=svg('<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>'),pauseIcon=svg('<path d="M8 5v14M16 5v14" stroke-width="3"/>'),volumeIcon=svg('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>'),mutedIcon=svg('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="m16 9 6 6m0-6-6 6"/>');
  el('#previous').innerHTML=svg('<path d="M5 5v14M19 5 8 12l11 7Z"/>');el('#next').innerHTML=svg('<path d="M19 5v14M5 5l11 7-11 7Z"/>');el('#mute').innerHTML=volumeIcon;
  let track=0,player,ready=false,playing=false,boot,previousVolume=.35,autoTimer,failed=false;
  const panel=document.createElement('section');panel.className='music-screen';panel.hidden=true;panel.setAttribute('aria-label','动画主题曲视频播放器');
  panel.innerHTML='<div class="music-screen-header"><span id="video-heading"></span><button id="video-close" aria-label="关闭视频并暂停">×</button></div><div class="official-video"><div id="official-youtube"></div></div><div class="music-screen-footer"><span id="music-status" role="status">点击播放，进入夜晚。</span><a id="official-link" target="_blank" rel="noopener noreferrer">官方视频 ↗</a></div>';
  document.body.append(panel);
  function status(text){el('#music-status').textContent=text}
  function sync(){document.body.classList.toggle('playing',playing);play.innerHTML=playing?pauseIcon:playIcon;play.setAttribute('aria-label',playing?'暂停主题曲':'播放主题曲');select.value=String(track);el('#video-heading').textContent=tracks[track].tag+' / '+tracks[track].name;el('#official-link').href='https://www.youtube.com/watch?v='+tracks[track].id}
  function clock(value){return Number.isFinite(value)&&value>=0?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'--:--'}
  function resetProgress(){progress.value=0;progress.disabled=true;el('#elapsed').textContent='0:00';el('#duration').textContent='--:--'}
  function ensurePlayer(){
    if(ready)return Promise.resolve(player);if(boot)return boot;
    boot=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{boot=null;status('播放源暂时无法连接，可打开官方视频。');reject(new Error('YouTube load timeout'))},15000);
      const mount=()=>{
        try{player=new YT.Player('official-youtube',{host:'https://www.youtube-nocookie.com',width:'100%',height:'100%',videoId:tracks[track].id,playerVars:{playsinline:1,origin:location.origin,rel:0},events:{
          onReady:event=>{clearTimeout(timeout);ready=true;event.target.setVolume(Number(volume.value)*100);resolve(event.target)},
          onStateChange:event=>{playing=event.data===YT.PlayerState.PLAYING;if(playing&&panel.hidden){event.target.pauseVideo();playing=false;sync();return}sync();if(playing){failed=false;status('正在播放 · 动画版');clearTimeout(autoTimer)}else if(event.data===YT.PlayerState.PAUSED)status('已暂停');else if(event.data===YT.PlayerState.BUFFERING)status('正在缓冲…');else if(event.data===YT.PlayerState.ENDED){status('播放结束，切换下一首…');change(1,true)}},
          onError:()=>{failed=true;clearTimeout(autoTimer);playing=false;progress.disabled=true;sync();status('此视频当前无法内嵌播放，请打开官方视频。')},
          onAutoplayBlocked:()=>status('请点击视频中的播放按钮。')
        }})}catch(error){clearTimeout(timeout);boot=null;reject(error)}
      };
      if(window.YT?.Player){mount();return}
      window.onYouTubeIframeAPIReady=mount;
      let script=document.getElementById('youtube-api');if(!script){script=document.createElement('script');script.id='youtube-api';script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);script.remove();boot=null;reject(new Error('YouTube unavailable'))};document.head.append(script)}
    });return boot;
  }
  async function start(){panel.hidden=false;failed=false;status('正在连接官方播放器…');sync();play.disabled=true;try{await ensurePlayer();if(panel.hidden)return;if(player.getVideoData()?.video_id!==tracks[track].id)player.loadVideoById(tracks[track].id);else player.playVideo();autoTimer=setTimeout(()=>{if(!playing&&!failed&&!panel.hidden)status('请点击视频中的播放按钮；也可打开官方视频。')},4000)}catch{failed=true;status('播放源暂时无法连接，可打开官方视频。')}finally{play.disabled=false}}
  function choose(index,autoplay=false){track=(index+tracks.length)%tracks.length;clearTimeout(autoTimer);failed=false;resetProgress();playing=false;sync();if(ready){if(autoplay){panel.hidden=false;player.loadVideoById(tracks[track].id)}else{player.cueVideoById(tracks[track].id);status('已选曲，点击播放。')}}else if(autoplay)start()}
  function change(delta,autoplay=playing){choose(track+delta,autoplay)}
  play.onclick=()=>{if(playing&&ready){player.pauseVideo();return}start()};select.onchange=()=>choose(Number(select.value),playing);
  el('#previous').onclick=()=>change(-1);el('#next').onclick=()=>change(1);
  el('#video-close').onclick=()=>{if(ready)player.pauseVideo();playing=false;panel.hidden=true;clearTimeout(autoTimer);sync()};
  progress.oninput=()=>{if(ready){player.seekTo(Number(progress.value),true);el('#elapsed').textContent=clock(Number(progress.value))}};
  volume.oninput=()=>{if(ready){player.setVolume(Number(volume.value)*100);Number(volume.value)>0?player.unMute():player.mute()}el('#mute').setAttribute('aria-label',Number(volume.value)===0?'取消静音':'静音')};
  el('#mute').onclick=()=>{if(Number(volume.value)){previousVolume=Number(volume.value);volume.value=0}else volume.value=previousVolume||.35;volume.oninput();el('#mute').innerHTML=Number(volume.value)?volumeIcon:mutedIcon};
  setInterval(()=>{if(!ready||failed)return;const duration=player.getDuration();const current=player.getCurrentTime();if(duration>0){progress.disabled=false;progress.max=duration;progress.value=current;el('#duration').textContent=clock(duration);el('#elapsed').textContent=clock(current)}},500);
  sync();
})();
