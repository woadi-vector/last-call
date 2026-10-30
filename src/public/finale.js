(() => {
  const mode=location.pathname==='/bar' ? 'bar' : location.pathname==='/curate' ? 'curator' : location.pathname==='/overlay' ? 'hud' : 'controls';
  const demo=location.pathname==='/demo' || new URLSearchParams(location.search).get('demo')==='1';
  const $=id=>document.getElementById(id);
  const set=(id,value)=>{if($(id)) $(id).textContent=value;};
  const endpoint=demo ? '/api/demo/finale/control' : '/api/finale/control';
  let state,pending=false,requestVersion=0,curatorRendered=false,playbackRevision=null,mediaState=null,networkLost=false,serverError=false;
  const video=$('television');
  const query=demo ? '?demo=1' : '';
  if(mode==='curator') {set('mode-badge',demo ? 'REHEARSAL · SEPARATE APPROVALS' : 'LIVE TWITCH SHOW · PLAYBACK APPROVALS');document.body.dataset.mode=demo ? 'rehearsal' : 'live';}
  if(demo && ['bar','hud'].includes(mode)) {const flag=document.createElement('div');flag.className='preview-flag';flag.textContent='REHEARSAL · NOT LIVE TWITCH';document.body.append(flag);}
  if($('bar-link')) $('bar-link').href='/bar'+query;
  if($('back-link')) $('back-link').href=demo ? '/demo' : '/';
  if($('demo-votes')) $('demo-votes').hidden=!demo;
  const error=message=>{if($('finale-error')) { $('finale-error').hidden=!message; $('finale-error').textContent=message || ''; }};
  async function request(url,input) {
    const response=await fetch(url,input===undefined ? undefined : {method:'POST',headers:{'Content-Type':'application/json','X-Last-Call':'control'},body:JSON.stringify(input)});
    const data=await response.json(); if(!response.ok) throw new Error(data.error || 'The show could not update.'); return data;
  }
  const messages={preparing:'Reveal the doors as the night unfolds.',voting:'One tab. One ballot. Choose with !door 1, !door 2 or !door 3.',choice:'Voting is tied or empty. The streamer chooses from the highlighted doors.',ready:'The vote is in. Your streamer is about to open the winning door.',playing:'Settle in. This one belongs to chat.',paused:'A quick pause. Same table, same company.',stopped:'The television is off. Thanks for looking out for the bar.',ended:'That’s Last Call. Thanks for being one of the regulars.'};
  function makeDoor(door,show) {
    const card=document.createElement('article'); card.className='door'+(!door.revealed ? ' sealed' : '')+(show.selected===door.id || show.candidates?.includes(door.id) && show.phase==='choice' ? ' selected' : '')+(door.removed ? ' removed' : '');
    const number=document.createElement('b'); number.className='door-number'; number.textContent=`DOOR ${door.id}`;
    const keyhole=document.createElement('span'); keyhole.className='keyhole'; keyhole.setAttribute('aria-hidden','true');
    const title=document.createElement('h3'); title.textContent=door.removed ? 'Taken off the menu' : door.theme || 'Still a mystery';
    const clue=document.createElement('p'); clue.textContent=door.removed ? 'The curator removed this segment.' : door.clue || 'The next clue is on its way.';
    const votes=document.createElement('small'); votes.textContent=`${door.votes} ${door.votes===1 ? 'tab' : 'tabs'} · ${door.removed ? 'Removed' : door.approved ? 'Approved' : 'Awaiting curator'}`;
    card.append(number,keyhole,title,clue,votes);
    if(mode==='controls') {
      if(show.phase==='choice' && show.candidates.includes(door.id)) {
        const choose=document.createElement('button'); choose.textContent=`Choose door ${door.id}`; choose.dataset.finale='choose'; choose.dataset.id=door.id; choose.disabled=pending; card.append(choose);
      }
      const remove=document.createElement('button'); remove.className='remove-door'; remove.textContent=`Emergency remove door ${door.id}`; remove.dataset.finale='remove'; remove.dataset.id=door.id; remove.disabled=pending || door.removed; card.append(remove);
    }
    return card;
  }
  function render(show) {
    state=show; document.body.dataset.finale=show.phase;
    if(show.error) {error(show.error);serverError=true;} else if(serverError){error('');serverError=false;}
    set('finale-status',`${show.revealed}/3 doors revealed · ${show.doors.filter(door=>door.approved).length}/3 approved. ${messages[show.phase]}`);
    if($('doors')) $('doors').replaceChildren(...show.doors.map(door=>makeDoor(door,show)));
    if($('doors-mini')) {
      $('doors-mini').hidden=show.revealed===0;
      $('doors-mini').replaceChildren(...show.doors.map(door=>{
        const node=document.createElement('div'); node.className='mini-door';
        const title=document.createElement('b'); title.textContent=`DOOR ${door.id}`;
        const label=document.createElement('span'); label.textContent=door.removed ? 'Removed' : door.theme || 'Still a mystery'; node.append(title,label); return node;
      }));
    }
    const enabled={'reveal-door':show.phase==='preparing' && show.revealed<3,'open-vote':show.phase==='preparing' && show.canOpen,'close-vote':show.phase==='voting',play:show.phase==='ready',pause:show.phase==='playing',resume:show.phase==='paused',skip:['playing','paused'].includes(show.phase),stop:!['stopped','ended'].includes(show.phase),end:show.phase!=='ended'};
    document.querySelectorAll('.finale-buttons [data-finale]').forEach(button=>{button.disabled=pending || !enabled[button.dataset.finale];});
    document.querySelectorAll('[data-vote]').forEach(button=>{button.disabled=pending || show.phase!=='voting';});
    if(mode==='bar') syncVideo(show);
  }
  function clearVideo() {
    if(!video) return;
    video.pause(); video.hidden=true;
    if(video.hasAttribute('src')) {video.removeAttribute('src');video.load();}
    playbackRevision=null;
  }
  function syncVideo(show) {
    mediaState=show;
    set('tv-status',show.phase.toUpperCase());
    set('bar-message',messages[show.phase]);
    const playback=show.playback;
    if(!playback) {
      clearVideo(); $('tv-welcome').hidden=false;
      const heading=$('tv-welcome').querySelector('h2'); heading.textContent=show.phase==='ended' ? 'Same bar. Another good story.' : show.phase==='stopped' ? 'Let’s take a breath.' : 'Where are we going tonight?';
      set('segment-title',show.phase==='ended' ? 'THE SHOW HAS A NATURAL END. SEE YOU NEXT TIME.' : 'THE DESTINATION IS STILL A SURPRISE'); set('segment-time',''); return;
    }
    $('tv-welcome').hidden=true; video.hidden=false;
    set('segment-title',playback.title+' · ORIGINAL SILENT DEMO');
    set('segment-time',`${Math.floor(playback.elapsedMs/1000)} / ${playback.duration}s`);
    if(playbackRevision!==playback.revision) {
      playbackRevision=playback.revision;
      video.src=`/media/finale?v=${playback.revision}${demo ? '&demo=1' : ''}`;
      video.muted=true; video.load();
    }
    if(video.readyState>=1 && Math.abs(video.currentTime-playback.elapsedMs/1000)>1) video.currentTime=playback.elapsedMs/1000;
    if(show.phase==='paused') video.pause();
    else if(video.paused && !video.ended) video.play().catch(()=>{error('The browser blocked the television. Click the television to allow silent playback.');});
  }
  if(video) {
    video.addEventListener('click',()=>{if(mediaState?.phase==='playing') video.play().then(()=>error('')).catch(()=>error('The television could not start.'));});
    video.addEventListener('error',()=>{
      if(mediaState?.phase==='playing' && video.hasAttribute('src')) request(endpoint,{action:'playback-error'}).then(refresh).catch(()=>error('The television is unavailable. Stop or skip this segment.'));
    });
  }
  function renderCurator(data) {
    set('finale-status',`${demo ? 'REHEARSAL' : 'LIVE SHOW'} · ${data.items.filter(item=>item.approved).length}/3 approved. Approvals clear when the show resets.`);
    if(!curatorRendered) {
      $('curator-items').replaceChildren(...data.items.map(item=>{
        const card=document.createElement('article'); card.className='panel';
        const title=document.createElement('h2'); title.textContent=`Door ${item.id}: ${item.title}`;
        const theme=document.createElement('p'); theme.textContent=item.theme;
        const preview=document.createElement('video'); preview.controls=true; preview.muted=true; preview.preload='none'; preview.src=`/media/preview/${item.id}${query}`; preview.setAttribute('aria-label',`Preview ${item.title}`);
        const rights=document.createElement('p'); rights.className='muted'; rights.textContent=`${item.duration} seconds. ${item.rights}`;
        const approve=document.createElement('button'); approve.dataset.approve=item.id;
        card.append(title,theme,preview,rights,approve); return card;
      })); curatorRendered=true;
    }
    for(const item of data.items) {
      const button=document.querySelector(`[data-approve="${item.id}"]`);
      button.textContent=item.removed ? 'Removed from this show' : item.approved ? 'Approved for this show ✓' : `Approve door ${item.id} after review`;
      button.disabled=pending || item.approved || item.removed || data.phase!=='preparing';
    }
  }
  async function refresh() {
    const version=++requestVersion;
    try {
      const data=await request((mode==='curator' ? '/api/curator' : '/api/finale')+query);
      if(version!==requestVersion) return;
      if(networkLost){error('');networkLost=false;}
      if(mode==='curator') renderCurator(data); else render(data);
    } catch { if(version===requestVersion) {networkLost=true;clearVideo(); error('Connection to the local show was lost. The television is paused until the connection returns.');} }
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');
    if(!button || button.disabled || pending || (!button.dataset.finale && !button.dataset.approve && !button.dataset.vote)) return;
    pending=true; error('');
    try {
      if(button.dataset.approve) await request(demo ? '/api/demo/curator/approve' : '/api/curator/approve',{id:Number(button.dataset.approve)});
      else if(button.dataset.vote) {
        const result=await request('/api/demo/answer',{viewer:Number($('viewer').value),command:`!door ${button.dataset.vote}`});
        set('vote-result',result.accepted ? 'Ballot locked. One tab spent.' : 'No ballot accepted: earn a tab first; only one ballot per viewer while voting is open.');
      } else await request(endpoint,{action:button.dataset.finale,id:button.dataset.id ? Number(button.dataset.id) : undefined});
    } catch(err) {error(err.message);}
    finally {pending=false;await refresh();}
  });
  async function poll(){await refresh();setTimeout(poll,mode==='bar' ? 250 : 750);}
  poll();
})();
