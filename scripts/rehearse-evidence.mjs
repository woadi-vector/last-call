// Reproducible local HTTP evidence, not a Twitch or browser performance benchmark.
// Runs on its own ephemeral loopback server; never loads .env or contacts Twitch.
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { setTimeout as wait } from 'node:timers/promises';
import { mkdir,writeFile } from 'node:fs/promises';
import { createHandler } from '../src/app.mjs';
import { TriviaGame } from '../src/game.mjs';

const server=http.createServer();
server.listen(0,'127.0.0.1');
await once(server,'listening');
const port=server.address().port,origin=`http://127.0.0.1:${port}`;
const game=new TriviaGame(),demoGame=new TriviaGame();
server.on('request',createHandler({config:{port},twitch:{snapshot:()=>({status:'Disconnected'})},game,demoGame}));
const liveBefore=JSON.stringify(game.snapshot());
const events=[];
async function request(path,body,expected=200,headers={}) {
  const res=await fetch(origin+path,{method:body===undefined ? 'GET':'POST',headers:{Origin:origin,'X-Last-Call':'control','Content-Type':'application/json',...headers},...(body===undefined ? {} : {body:JSON.stringify(body)}),signal:AbortSignal.timeout(5000)});
  assert.equal(res.status,expected,`${path}: expected ${expected}, received ${res.status}`);
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : new Uint8Array(await res.arrayBuffer());
}
const trivia=action=>request('/api/demo/control',{action});
const finale=action=>request('/api/demo/finale/control',{action});
const answer=()=>request('/api/demo/answer',{viewer:1,answer:'B'});
const vote=()=>request('/api/demo/answer',{viewer:1,command:'!door 2'});
const state=()=>request('/api/demo/game');
try {
  await request('/media/finale?demo=1&v=1',undefined,403);
  for(let id=1;id<=3;id++) await request('/api/demo/curator/approve',{id});
  await trivia('approve');await trivia('start');
  let acceptedAnswers=0,rejectedAnswers=0;
  for(let i=0;i<10;i++) (await answer()).accepted ? acceptedAnswers++ : rejectedAnswers++;
  assert.equal(acceptedAnswers,1);assert.equal(rejectedAnswers,9);
  await trivia('reveal');
  let s=await state();assert.equal(s.totalTabs,1);assert.equal(s.leaderboard[0].tabs,1);
  events.push({step:'revealed correct answer',submissions:10,accepted:acceptedAnswers,rejected:rejectedAnswers,viewerTabs:1,communityEarned:1});
  await trivia('next');
  assert.equal((await request('/api/demo/answer',{viewer:1,answer:'C'})).accepted,true);
  await trivia('stop');s=await state();assert.equal(s.totalTabs,1);assert.equal(s.leaderboard[0].tabs,1);
  events.push({step:'cancelled second question before reveal',viewerTabs:1,communityEarned:1,pendingAnswers:s.answerCount});
  assert.equal(s.answerCount,0);
  for(let i=0;i<3;i++) await finale('reveal-door');
  await finale('open-vote');
  let acceptedBallots=0,rejectedBallots=0;
  for(let i=0;i<10;i++) (await vote()).accepted ? acceptedBallots++ : rejectedBallots++;
  assert.equal(acceptedBallots,1);assert.equal(rejectedBallots,9);
  s=await state();assert.equal(s.leaderboard[0].tabs,0);assert.equal(s.totalTabs,1);assert.equal(s.finale.ballotCount,1);
  events.push({step:'voted for door two',submissions:10,accepted:acceptedBallots,rejected:rejectedBallots,viewerTabs:0,communityEarned:1,ballots:1});
  await finale('close-vote');s=await state();assert.equal(s.finale.selected,2);assert.equal(s.finale.playback,undefined);
  await finale('play');s=await state();assert.equal(s.finale.playback.title,'Deep Blue Signals');
  const mediaPath=`/media/finale?demo=1&v=${s.finale.revision}`;
  const bytes=await request(mediaPath,undefined,206,{Range:'bytes=0-99'});assert.equal(bytes.length,100);
  const duration=s.finale.playback.duration;
  await wait(duration*1000+100);
  s=await state();assert.equal(s.finale.phase,'ended');assert.equal(s.finale.playback,undefined);
  await request(mediaPath,undefined,403);
  assert.equal(JSON.stringify(game.snapshot()),liveBefore);
  events.push({step:'natural end after real-time segment interval',configuredSegmentSeconds:duration,phase:s.finale.phase,postEndMediaStatus:403,liveGameUnchanged:true});
  const report={kind:'isolated local HTTP rehearsal with one synthetic viewer',scope:'No Twitch delivery, browser video decoding, audience load, or latency benchmark is claimed.',node:process.version,syntheticViewers:1,questionsOpened:2,questionsScored:1,questionsCancelled:1,events};
  await mkdir(new URL('../outputs/',import.meta.url),{recursive:true});
  await writeFile(new URL('../outputs/rehearsal-evidence.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {
  await new Promise((resolve,reject)=>server.close(error=>error ? reject(error):resolve()));
}
