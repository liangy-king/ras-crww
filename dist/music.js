// Same-origin audio: no video player or external music service required.
(()=>{
  const tracks=[
    {name:'堕天',tag:'SEASON 1 · OP',src:'assets/music/daten.mp3'},
    {name:'よふかしのうた',tag:'SEASON 1 · ED',src:'assets/music/yofukashi.mp3'},
    {name:'Mirage',tag:'SEASON 2 · OP',src:'assets/music/mirage.mp3'},
    {name:'眠れ',tag:'SEASON 2 · ED',src:'assets/music/nemure.mp3'},
    {name:'だから僕は音楽を辞めた',tag:'ヨルシカ',src:'assets/music/dakara.mp3'}
  ];
  const el=s=>document.querySelector(s),select=el('#track-select'),play=el('#play'),progress=el('#progress'),volume=el('#volume');
  const svg=body=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg>';
  const playIcon=svg('<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>'),pauseIcon=svg('<path d="M8 5v14M16 5v14" stroke-width="3"/>'),volumeIcon=svg('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>'),mutedIcon=svg('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="m16 9 6 6m0-6-6 6"/>');
  el('#previous').innerHTML=svg('<path d="M5 5v14M19 5 8 12l11 7Z"/>');el('#next').innerHTML=svg('<path d="M19 5v14M5 5l11 7-11 7Z"/>');
  const audio=document.createElement('audio');audio.id='theme-audio';audio.preload='metadata';audio.autoplay=true;audio.setAttribute('playsinline','');audio.hidden=true;audio.volume=Number(volume.value);document.body.append(audio);
  const notice=document.createElement('p');notice.id='music-status';notice.className='music-status';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');el('.player-main').append(notice);
  let track=0,playing=false,wantsPlay=true,awaitingGesture=false,previousVolume=.35,attempt=0;
  const status=text=>{notice.textContent=text};
  function clock(value){return Number.isFinite(value)&&value>=0?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'--:--'}
  function sync(){document.body.classList.toggle('playing',playing);play.innerHTML=playing?pauseIcon:playIcon;play.setAttribute('aria-label',playing?'暂停音乐':'播放音乐');select.value=String(track)}
  function syncVolume(){const muted=audio.muted||audio.volume===0;el('#mute').innerHTML=muted?mutedIcon:volumeIcon;el('#mute').setAttribute('aria-label',muted?'取消静音':'静音');el('#mute').setAttribute('aria-pressed',String(muted))}
  function updateProgress(){const duration=audio.duration;progress.disabled=!(duration>0&&Number.isFinite(duration));if(!progress.disabled)progress.max=duration;progress.value=audio.currentTime||0;el('#elapsed').textContent=clock(audio.currentTime);el('#duration').textContent=clock(duration)}
  async function start(){
    wantsPlay=true;awaitingGesture=false;const request=++attempt;status('正在加载音频…');
    try{await audio.play()}
    catch(error){if(request!==attempt||!wantsPlay)return;if(error.name==='NotAllowedError'){awaitingGesture=true;status('轻点页面，开启今夜的音乐。')}else if(error.name!=='AbortError'){playing=false;sync();status('音频暂时无法加载，请稍后重试。')}}
  }
  function pause(){wantsPlay=false;awaitingGesture=false;++attempt;audio.autoplay=false;audio.pause();playing=false;sync();status('已暂停')}
  function choose(index,autoplay=wantsPlay){
    ++attempt;audio.pause();playing=false;awaitingGesture=false;track=(index+tracks.length)%tracks.length;wantsPlay=autoplay;audio.autoplay=autoplay;audio.src=tracks[track].src;audio.load();progress.value=0;progress.disabled=true;el('#elapsed').textContent='0:00';el('#duration').textContent='--:--';sync();
    if(autoplay)void start();else status('已选曲，点击播放。');
  }
  audio.addEventListener('playing',()=>{playing=true;awaitingGesture=false;sync();status(tracks[track].tag+' · '+tracks[track].name)});
  audio.addEventListener('pause',()=>{playing=false;sync()});
  audio.addEventListener('waiting',()=>{if(wantsPlay)status('正在缓冲…')});
  audio.addEventListener('error',()=>{awaitingGesture=false;playing=false;sync();status('音频暂时无法加载，请稍后重试。')});
  audio.addEventListener('ended',()=>choose(track+1,true));
  audio.addEventListener('loadedmetadata',updateProgress);audio.addEventListener('durationchange',updateProgress);audio.addEventListener('timeupdate',updateProgress);
  play.onclick=()=>{if(playing||(!audio.paused&&wantsPlay))pause();else void start()};
  select.onchange=()=>choose(Number(select.value));el('#previous').onclick=()=>choose(track-1);el('#next').onclick=()=>choose(track+1);
  progress.oninput=()=>{if(!progress.disabled){audio.currentTime=Number(progress.value);updateProgress()}};
  volume.oninput=()=>{audio.volume=Number(volume.value);audio.muted=audio.volume===0;syncVolume()};
  el('#mute').onclick=()=>{if(audio.volume>0&&!audio.muted){previousVolume=audio.volume;volume.value=0}else volume.value=previousVolume||.35;volume.oninput()};
  function unlock(event){if(!event.isTrusted||!awaitingGesture||!wantsPlay)return;if(event.type==='keydown'&&(event.ctrlKey||event.altKey||event.metaKey||event.key==='Tab'))return;if(event.target.closest?.('.player-controls,#track-select'))return;void start()}
  document.addEventListener('click',unlock);document.addEventListener('keydown',unlock);
  syncVolume();choose(0,true);
})();
