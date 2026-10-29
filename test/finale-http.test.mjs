import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createHandler } from '../src/app.mjs';
import { TriviaGame } from '../src/game.mjs';
test('finale HTTP keeps destinations private, enforces approvals, serves ranges only for active content, and isolates demo',async t=>{
  const game=new TriviaGame(),demoGame=new TriviaGame();
  const server=http.createServer(createHandler({config:{port:3000},twitch:{snapshot:()=>({status:'Chat subscribed'})},game,demoGame}));
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
  const request=(path,body,headers={})=>new Promise((resolve,reject)=>{
    const req=http.request({host:'127.0.0.1',port:server.address().port,path,method:body===undefined ? 'GET':'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','X-Last-Call':'control',...headers}},res=>{
      const parts=[];res.on('data',chunk=>parts.push(chunk));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(parts).toString(),length:Buffer.concat(parts).length}));
    });req.on('error',reject);req.end(body===undefined ? undefined:JSON.stringify(body));
  });
  const control=(action,id)=>request('/api/demo/finale/control',{action,id});
  for(const path of ['/api/finale','/api/producer','/api/game']) {
    const response=await request(path);assert.ok(!response.text.includes('Orbital Drift'));assert.ok(!response.text.includes('orbit.mp4'));
  }
  assert.equal((await request('/media/finale?v=1')).status,403);
  assert.equal((await request('/media/preview/1',undefined,{Range:'bytes=0-99'})).status,206);
  assert.equal((await request('/api/demo/curator/approve',{id:1},{Origin:'https://other.example'})).status,403);
  assert.equal((await control('open-vote')).status,409);
  for(let id=1;id<=3;id++) {assert.equal((await request('/api/demo/curator/approve',{id})).status,200);await control('reveal-door');}
  demoGame.act('approve');demoGame.act('start');demoGame.answer('demo-1','Guest 1','!answer B');demoGame.act('reveal');demoGame.act('stop');
  await control('open-vote');
  const vote=await request('/api/demo/answer',{viewer:1,command:'!door 2'});assert.equal(JSON.parse(vote.text).accepted,true);
  await control('close-vote');
  assert.equal(JSON.parse((await request('/api/finale?demo=1')).text).playback,undefined);
  await control('play');const state=JSON.parse((await request('/api/finale?demo=1')).text);
  assert.equal(state.playback.title,'Deep Blue Signals');assert.ok(!JSON.stringify(state).includes('orbit.mp4'));
  const url=`/media/finale?demo=1&v=${state.revision}`;
  const range=await request(url,undefined,{Range:'bytes=0-99'});assert.equal(range.status,206);assert.equal(range.length,100);assert.equal(range.headers['content-type'],'video/mp4');
  assert.equal((await request(url,undefined,{Range:'bytes=900000000-'})).status,416);
  assert.equal(JSON.parse((await request('/api/finale')).text).phase,'preparing');
  await control('remove',2);assert.equal((await request(url)).status,403);assert.equal((await request('/media/preview/2?demo=1')).status,403);
  assert.equal(demoGame.players.get('demo-1').tabs,1);
  for(const path of ['/bar','/curate','/finale.js','/finale.css']) assert.equal((await request(path)).status,200);
  await request('/api/demo/control',{action:'reset'});assert.equal(JSON.parse((await request('/api/finale?demo=1')).text).doors.filter(door=>door.approved).length,0);
});
