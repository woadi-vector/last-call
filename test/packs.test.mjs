import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve,sep } from 'node:path';
import { mkdir,mkdtemp,rm } from 'node:fs/promises';
import { TriviaGame,PACK } from '../src/game.mjs';
import { PackStudio,SPACE_DRAFT,REFERENCE_NOTES,validateDraft,validateSources } from '../src/packs.mjs';
const copy=()=>structuredClone(SPACE_DRAFT);
const output=()=>{const draft=copy();return {title:'AI Space Bar',description:draft.description,questions:draft.questions.map(({included,...q})=>q)};};
const success=data=>({ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(data)}]}]})});

test('draft validation requires distinct choices, valid answers and supporting reference notes',()=>{
  assert.equal(validateDraft(copy()).questions.length,5);
  let draft=copy();draft.questions[0].options[0]='Mars';assert.throws(()=>validateDraft(draft),/distinct/);
  draft=copy();draft.questions[0].answer=9;assert.throws(()=>validateDraft(draft),/correct answer/);
  draft=copy();draft.questions[0].evidence='A fictional reference claim';assert.throws(()=>validateDraft(draft),/supporting note/);
  draft=copy();draft.questions[0].sourceId=7;assert.throws(()=>validateDraft(draft),/reference/);
  draft=copy();draft.questions[0].options[1]='Pluto';assert.throws(()=>validateDraft(draft),/correct answer/);
  draft=copy();draft.questions[1].sourceId=1;draft.questions[1].evidence=draft.sources[0].notes;draft.questions[1].options[2]='Mars';assert.throws(()=>validateDraft(draft,{generated:true}),/each reference/);
});
test('reference URLs cannot execute scripts or contain credentials',()=>{
  for(const url of ['javascript:alert(1)','http://example.com','https://user:secret@example.com','https://example.com?api_key=secret']) {
    const sources=structuredClone(REFERENCE_NOTES);sources[0].url=url;assert.throws(()=>validateSources(sources));
  }
  assert.throws(()=>validateSources([]),/five/);
});
test('applying included questions clears approval, hides references from public state and blocks active changes',()=>{
  const game=new TriviaGame();const studio=new PackStudio(game);
  game.act('approve');const draft=copy();draft.questions[4].included=false;
  studio.apply(draft);
  assert.equal(game.approved,false);assert.equal(game.pack.questions.length,4);
  assert.equal(game.snapshot().title,'Space Bar');
  assert.throws(()=>game.act('start'));
  game.act('approve');game.act('start');
  assert.equal(game.snapshot().question.answer,undefined);
  assert.equal(game.snapshot().question.evidence,undefined);
  assert.equal(game.snapshot().question.source,undefined);
  assert.equal(game.snapshot().review,undefined);
  assert.throws(()=>studio.apply(copy()),/Reset/);
  assert.throws(()=>studio.fallback(),/Reset/);
  game.act('reset');studio.fallback();assert.equal(game.pack.title,PACK.title);assert.equal(game.approved,false);
  const excluded=copy();excluded.questions.forEach(q=>q.included=false);assert.throws(()=>studio.apply(excluded),/Include/);
});
test('AI requests contain only theme/reference data and validated drafts never auto-apply',async()=>{
  const game=new TriviaGame();let request;
  const studio=new PackStudio(game,{apiKey:'test-only-provider-key',fetchImpl:async(url,options)=>{request={url,options,body:JSON.parse(options.body)};return success(output());}});
  const result=await studio.generate('Space trivia',REFERENCE_NOTES);
  assert.equal(request.url,'https://api.openai.com/v1/responses');
  assert.equal(request.body.store,false);assert.equal(request.body.text.format.strict,true);
  assert.equal(request.options.headers.Authorization,'Bearer test-only-provider-key');
  assert.equal(JSON.stringify(result).includes('test-only-provider-key'),false);
  assert.deepEqual(JSON.parse(request.body.input).referenceNotes,REFERENCE_NOTES);
  assert.equal(result.draft.origin,'ai');assert.equal(result.busy,false);
  assert.equal(game.pack.title,PACK.title);assert.equal(game.approved,false);
});
test('provider errors, refusals, truncation and invented support preserve the draft without reflecting provider data',async()=>{
  const invalid=output();invalid.questions[0].evidence='invented';
  for(const fetchImpl of [
    async()=>({ok:false,json:async()=>({error:'SENSITIVE_PROVIDER_DETAIL'})}),
    async()=>({ok:true,json:async()=>({status:'incomplete',output:[]})}),
    async()=>({ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'SENSITIVE_PROVIDER_DETAIL'}]}]})}),
    async()=>success(invalid),
    async()=>{const error=new Error('SENSITIVE_PROVIDER_DETAIL');error.name='TimeoutError';throw error;},
  ]) {
    const studio=new PackStudio(new TriviaGame(),{apiKey:'test-only-key',fetchImpl});
    const previous=structuredClone(studio.draft);
    await assert.rejects(studio.generate('Space',REFERENCE_NOTES),error=>!error.message.includes('SENSITIVE_PROVIDER_DETAIL'));
    assert.deepEqual(studio.draft,previous);assert.equal(studio.busy,false);
  }
});
test('missing credentials and concurrent requests cannot trigger extra AI calls or draft edits',async()=>{
  let resolveRequest,calls=0;
  const noKey=new PackStudio(new TriviaGame(),{fetchImpl:async()=>{assert.fail('must not call provider without a key');}});
  await assert.rejects(noKey.generate('Space',REFERENCE_NOTES),/not configured/);
  const studio=new PackStudio(new TriviaGame(),{apiKey:'test-only-key',fetchImpl:async()=>{calls++;return new Promise(resolve=>resolveRequest=resolve);}});
  const first=studio.generate('Space',REFERENCE_NOTES);
  await assert.rejects(studio.generate('Space',REFERENCE_NOTES),/already/);
  assert.throws(()=>studio.update(copy()),/Wait/);assert.throws(()=>studio.apply(copy()),/Wait/);
  resolveRequest(success(output()));await first;assert.equal(calls,1);
});
test('saved drafts reload independently of the show and require fresh approval to apply',async t=>{
  const workRoot=resolve('work');await mkdir(workRoot,{recursive:true});const folder=await mkdtemp(resolve(workRoot,'studio-test-'));
  t.after(async()=>{const target=resolve(folder);if(!target.startsWith(workRoot+sep))throw new Error('Unsafe test cleanup');await rm(target,{recursive:true,force:true});});
  const storagePath=resolve(folder,'draft.json');
  const first=new PackStudio(new TriviaGame(),{storagePath});const draft=copy();draft.title='Saved Space Night';await first.save(draft);
  const game=new TriviaGame();const second=new PackStudio(game,{storagePath});await second.load();
  assert.equal(second.draft.title,'Saved Space Night');assert.equal(game.pack.title,PACK.title);assert.equal(game.approved,false);
  second.apply(second.draft);assert.equal(game.approved,false);
});
test('answer-window choices are pre-show only, survive reset and honor the chosen deadline',()=>{
  let now=0;const game=new TriviaGame({now:()=>now});
  for(const value of [0,30,'60',NaN])assert.throws(()=>game.configureWindow(value));
  game.act('approve');game.configureWindow(60);assert.equal(game.approved,true);game.act('start');
  now=59000;assert.equal(game.snapshot().secondsLeft,1);
  assert.throws(()=>game.configureWindow(45));game.act('pause');assert.throws(()=>game.configureWindow(25));
  game.act('resume');now+=1000;assert.equal(game.snapshot().phase,'reveal');
  game.act('reset');assert.equal(game.snapshot().answerWindowSeconds,60);game.configureWindow(45);game.act('approve');game.act('start');assert.equal(game.snapshot().secondsLeft,45);
});
