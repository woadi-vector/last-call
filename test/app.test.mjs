import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createHandler } from '../src/app.mjs';
import { TriviaGame } from '../src/game.mjs';

test('HTTP controls isolate rehearsal, require same-origin and keep answers out of overlay API', async t => {
  const game = new TriviaGame();
  const demoGame = new TriviaGame();
  const twitch = {snapshot:()=>({status:'Disconnected'})};
  const server = http.createServer(createHandler({config:{port:3000},twitch,game,demoGame}));
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const request = (path,body,headers={}) => new Promise((resolve,reject)=> {
    const req = http.request({host:'127.0.0.1',port:server.address().port,path,method:body === undefined ? 'GET' : 'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','X-Last-Call':'control',...headers}},res=>{
      let data = ''; res.on('data',chunk=>data+=chunk); res.on('end',()=>resolve({status:res.statusCode,body:data,headers:res.headers}));
    });
    req.on('error',reject); req.end(body === undefined ? undefined : JSON.stringify(body));
  });
  assert.equal((await request('/api/control',{action:'approve'},{Origin:'https://untrusted.example'})).status,403);
  assert.equal((await request('/api/control',{action:'approve'},{'X-Last-Call':''})).status,403);
  assert.equal((await request('/api/game',undefined,{Host:'untrusted.example:3000'})).status,403);
  assert.equal((await request('/api/control',{action:'approve'})).status,200);
  assert.equal((await request('/api/control',{action:'start'})).status,409);
  await request('/api/demo/control',{action:'approve'});
  await request('/api/demo/control',{action:'start'});
  assert.equal(JSON.parse((await request('/api/demo/answer',{viewer:1,answer:'B'})).body).accepted,true);
  assert.equal((await request('/api/demo/answer',{viewer:-1,answer:'B'})).status,400);
  assert.equal(game.snapshot().phase,'review');
  const publicState = JSON.parse((await request('/api/demo/game')).body);
  assert.equal(publicState.question.answer,undefined);
  assert.equal(publicState.review,undefined);
  assert.equal(JSON.parse((await request('/api/demo')).body).review.length,5);
  for (const path of ['/','/demo','/overlay','/style.css','/client.js']) assert.equal((await request(path)).status,200);
  assert.equal((await request('/auth/callback?code=secret-example&state=bad')).body.includes('secret-example'),false);
});
