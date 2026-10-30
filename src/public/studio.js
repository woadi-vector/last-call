(() => {
  const demo=new URLSearchParams(location.search).get('demo')==='1';
  const $=id=>document.getElementById(id);
  const endpoint=demo ? '/api/demo/studio/' : '/api/studio/';
  const back=demo ? '/demo' : '/';
  let snapshot=null,busy=false,dirty=false;
  document.body.dataset.mode=demo ? 'rehearsal' : 'live';
  $('mode-badge').textContent=demo ? 'REHEARSAL STUDIO · SEPARATE DRAFT AND SHOW' : 'LIVE TWITCH SHOW · PREPARATION';
  $('back-link').href=back;$('brand-link').href=back;
  $('other-mode-link').href=demo ? '/studio' : '/studio?demo=1';
  $('other-mode-link').textContent=demo ? 'Switch to live studio' : 'Switch to rehearsal studio';
  const error=message=>{$('studio-error').hidden=!message;$('studio-error').textContent=message || '';};
  const status=message=>{$('studio-status').textContent=message;};
  function field(parent,label,id,value,{area=false,max=240}={}) {
    const caption=document.createElement('label');caption.htmlFor=id;caption.textContent=label;
    const input=document.createElement(area ? 'textarea':'input');input.id=id;input.value=value;input.maxLength=max;if(area)input.rows=2;
    parent.append(caption,input);return input;
  }
  function select(parent,label,id,options,value) {
    const caption=document.createElement('label');caption.htmlFor=id;caption.textContent=label;
    const input=document.createElement('select');input.id=id;
    input.replaceChildren(...options.map(([key,name])=>{const option=document.createElement('option');option.value=key;option.textContent=name;return option;}));
    input.value=String(value);parent.append(caption,input);return input;
  }
  function count() {
    const total=[...document.querySelectorAll('[data-include]')].filter(input=>input.checked).length;
    $('included-count').textContent=`${total} ${total===1 ? 'question':'questions'} included. Excluded questions will not go live.`;
    if(snapshot) $('apply-draft').disabled=busy || !snapshot.canApply || total===0;
    document.querySelectorAll('[data-include]').forEach(input=>input.closest('article').classList.toggle('excluded',!input.checked));
  }
  function lock(value) {
    busy=value;
    document.querySelectorAll('button,input,textarea,select').forEach(node=>{node.disabled=value;});
    $('generate').disabled=value || !snapshot?.aiConfigured;
    count();
  }
  function draw(data) {
    snapshot=data;const draft=data.draft;
    $('theme').value=draft.title;$('pack-title').value=draft.title;$('pack-description').value=draft.description;
    $('draft-title').textContent=`${draft.title} · five-question draft`;
    $('draft-origin').textContent=draft.origin==='ai' ? 'AI-assisted draft. Check every fact, distractor and explanation before using it.' : draft.origin==='prepared' ? 'Prepared reference-backed draft. No AI request has been made.' : 'Manually edited draft. Review required.';
    $('ai-status').textContent=data.aiConfigured ? `AI drafting configured · ${data.model}. A request is made only when you click Draft.` : 'Optional AI is not configured. The editor, prepared pack and saving work now. Configure OPENAI_API_KEY on the server when ready.';
    $('source-fields').replaceChildren(...draft.sources.map(source=>{
      const card=document.createElement('div');card.className='source-card';
      field(card,`Reference ${source.id} title`,`source-label-${source.id}`,source.label,{max:100});
      field(card,'Source URL (HTTPS)',`source-url-${source.id}`,source.url,{max:2000});
      field(card,'Reference notes',`source-notes-${source.id}`,source.notes,{area:true,max:1200});
      const link=document.createElement('a');link.id=`source-link-${source.id}`;link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open the reference to check the facts ↗';card.append(link);return card;
    }));
    $('question-fields').replaceChildren(...draft.questions.map((q,index)=>{
      const card=document.createElement('article');card.className='panel question-editor';
      const header=document.createElement('header');const title=document.createElement('h2');title.textContent=`Question ${index+1}`;
      const includeLabel=document.createElement('label');includeLabel.className='include-label';const include=document.createElement('input');include.type='checkbox';include.checked=q.included;include.dataset.include=index;include.id=`include-${index}`;includeLabel.append(include,document.createTextNode('Include question'));header.append(title,includeLabel);card.append(header);
      field(card,'Question',`prompt-${index}`,q.prompt,{max:240});
      const options=document.createElement('div');options.className='editor-options';
      q.options.forEach((option,letter)=>{const cell=document.createElement('div');field(cell,`Choice ${String.fromCharCode(65+letter)}`,`option-${index}-${letter}`,option,{max:100});options.append(cell);});card.append(options);
      const fields=document.createElement('div');fields.className='editor-fields';
      for(const [label,id,choices,value] of [
        ['Correct choice',`answer-${index}`,['A','B','C','D'].map((letter,num)=>[num,letter]),q.answer],
        ['Difficulty',`difficulty-${index}`,['easy','medium','hard'].map(value=>[value,value]),q.difficulty],
        ['Reference',`source-${index}`,draft.sources.map(source=>[source.id,`${source.id} · ${source.label}`]),q.sourceId],
      ]) {const cell=document.createElement('div');select(cell,label,id,choices,value);fields.append(cell);}card.append(fields);
      field(card,'Category',`category-${index}`,q.category,{max:60});
      field(card,'Answer explanation',`note-${index}`,q.note,{area:true,max:400});
      field(card,'Supporting note (copy from its reference; must contain the correct answer)',`evidence-${index}`,q.evidence,{area:true,max:1200});
      return card;
    }));
    dirty=false;lock(false);
  }
  function sources() {return [1,2,3,4,5].map(id=>({id,label:$(`source-label-${id}`).value,url:$(`source-url-${id}`).value,notes:$(`source-notes-${id}`).value}));}
  function draft() {
    return {title:$('pack-title').value,description:$('pack-description').value,origin:snapshot.draft.origin,sources:sources(),questions:snapshot.draft.questions.map((q,index)=>({
      prompt:$(`prompt-${index}`).value,options:[0,1,2,3].map(letter=>$(`option-${index}-${letter}`).value),answer:Number($(`answer-${index}`).value),note:$(`note-${index}`).value,category:$(`category-${index}`).value,difficulty:$(`difficulty-${index}`).value,sourceId:Number($(`source-${index}`).value),evidence:$(`evidence-${index}`).value,included:$(`include-${index}`).checked,
    }))};
  }
  async function request(url,input) {
    const response=await fetch(url,input===undefined ? undefined:{method:'POST',headers:{'Content-Type':'application/json','X-Last-Call':'control'},body:JSON.stringify(input)});
    const data=await response.json();if(!response.ok)throw new Error(data.error || 'The studio could not update.');return data;
  }
  document.addEventListener('input',event=>{
    dirty=true;count();
    if(event.target.id.startsWith('source-url-')) {
      const link=$('source-link-'+event.target.id.slice('source-url-'.length));
      try {
        const url=new URL(event.target.value);
        if(url.protocol!=='https:' || url.username || url.password || [...url.searchParams.keys()].some(key=>/token|secret|api.?key/i.test(key)))throw new Error('Invalid reference');
        link.href=url.href;
      } catch {link.removeAttribute('href');}
    }
  });
  document.addEventListener('change',()=>{dirty=true;count();});
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button[data-studio]');if(!button || button.disabled || busy)return;
    const action=button.dataset.studio;
    if(['prepared','load','generate'].includes(action) && dirty && !confirm('Replace the current unsaved draft? Save it first if you want to keep it.'))return;
    if(action==='fallback' && !confirm('Use the original fallback for this pre-show? Its approval will be cleared. Your studio draft is kept.'))return;
    const input=action==='generate' ? {theme:$('theme').value,sources:sources()} : ['save','apply'].includes(action) ? {draft:draft()} : {};
    lock(true);error('');status(action==='generate' ? 'Drafting five source-supported questions. Your current show is unchanged…':'Updating your draft…');
    try {
      const result=await request(endpoint+action,input);
      if(['apply','fallback'].includes(action)){dirty=false;location.assign(back+'?pack=updated');return;}
      draw(result);
      status(action==='save' ? 'Draft saved on this computer. It has not changed or approved the live pack.' : action==='generate' ? 'AI draft ready. Review every question and source before using it.' : 'Draft ready for your review. No live pack has changed.');
    } catch(err){error(err.message);status('Your current show is unchanged.');}
    finally{lock(false);}
  });
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  request('/api/studio'+(demo ? '?demo=1':'')).then(data=>{draw(data);status('Edit the prepared draft or load a saved one. Applying it will require a fresh approval.');}).catch(err=>{error(err.message);status('Start the local server to use the studio.');});
})();
