import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createHandler } from '../src/app.mjs';
import { TriviaGame } from '../src/game.mjs';
import { PackStudio,SPACE_DRAFT } from '../src/packs.mjs';
test('studio routes preserve live/rehearsal isolation, gate changes and keep draft answers out of public state',async t=>{
  const game=new TriviaGame(),demoGame=new TriviaGame();
  const studio=new PackStudio(game,{apiKey:'test-only-hidden-key'}),demoStudio=new PackStudio(demoGame);
  const server=http.createServer(createHandler({config:{port:3000},twitch:{snapshot:()=>({status:'Chat subscribed'})},game,demoGame,studio,demoStudio}));
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
  const request=(path,body,headers={})=>new Promise((resolve,reject)=>{
    const req=http.request({host:'127.0.0.1',port:server.address().port,path,method:body===undefined ? 'GET':'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','X-Last-Call':'control',...headers}},res=>{
      let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>resolve({status:res.statusCode,text}));
    });req.on('error',reject);req.end(body===undefined ? undefined:JSON.stringify(body));
  });
  const metadata=await request('/api/studio');assert.equal(metadata.status,200);assert.ok(!metadata.text.includes('test-only-hidden-key'));
  assert.equal(JSON.parse((await request('/api/studio?demo=1')).text).aiConfigured,false);
  const draft=structuredClone(SPACE_DRAFT);draft.title='Rehearsal space';draft.questions[4].included=false;
  assert.equal((await request('/api/demo/studio/apply',{draft},{Origin:'https://other.example'})).status,403);
  assert.equal((await request('/api/demo/studio/apply',{draft})).status,200);
  assert.equal(game.pack.title,'Side Quest: Space Bar');assert.equal(demoGame.pack.title,'Rehearsal space');assert.equal(demoGame.approved,false);
  assert.equal((await request('/api/demo/control',{action:'configure-window',seconds:60})).status,200);assert.equal(game.duration,25000);
  await request('/api/demo/control',{action:'approve'});await request('/api/demo/control',{action:'start'});
  assert.equal((await request('/api/demo/control',{action:'configure-window',seconds:45})).status,409);
  assert.equal((await request('/api/demo/studio/apply',{draft})).status,409);
  const state=JSON.parse((await request('/api/demo/game')).text);assert.equal(state.question.source,undefined);assert.equal(state.question.evidence,undefined);assert.equal(state.question.answer,undefined);
  await request('/api/demo/control',{action:'reset'});await request('/api/demo/finale/control',{action:'reveal-door'});
  assert.equal(JSON.parse((await request('/api/studio?demo=1')).text).canApply,false);
  assert.equal((await request('/api/demo/studio/apply',{draft})).status,409);
  assert.equal((await request('/api/demo/studio/save',{draft})).status,200);
  for(const path of ['/studio','/studio.js','/studio.css'])assert.equal((await request(path)).status,200);
});
