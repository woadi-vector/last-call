import test from 'node:test';
import assert from 'node:assert/strict';
import { TriviaGame } from '../src/game.mjs';
import { Finale } from '../src/finale.mjs';

function fixture() {
  let clock=0;
  const game=new TriviaGame({now:()=>clock});
  game.act('approve');game.act('start');
  game.answer('one','One','!answer B');game.answer('two','Two','!answer B');
  game.act('reveal');game.act('stop');
  const finale=new Finale(game,{now:()=>clock});
  const prepare=()=>{for(let id=1;id<=3;id++){finale.approve(id);finale.act('reveal-door');}};
  return {game,finale,prepare,advance:ms=>clock+=ms};
}
test('doors reveal in order and approval plus trivia completion gate voting',()=>{
  const {game,finale}=fixture();
  const hidden=JSON.stringify(finale.snapshot());
  assert.ok(!hidden.includes('Orbital Drift'));assert.ok(!hidden.includes('orbit.mp4'));assert.ok(!hidden.includes('After Hours'));
  assert.throws(()=>finale.act('open-vote'));
  finale.act('reveal-door');
  assert.equal(finale.snapshot().doors[0].theme,'After Hours in Orbit');
  assert.equal(finale.snapshot().doors[1].theme,undefined);
  finale.act('reveal-door');finale.act('reveal-door');
  assert.throws(()=>finale.act('reveal-door'));assert.throws(()=>finale.act('open-vote'));
  for(let id=1;id<=3;id++) finale.approve(id);
  game.phase='question';assert.throws(()=>finale.act('open-vote'));game.phase='stopped';
  finale.act('open-vote');assert.equal(finale.phase,'voting');
});
test('one earned tab buys one ballot; duplicates, invalid and closed votes cost nothing',()=>{
  const {game,finale,prepare}=fixture();prepare();
  assert.equal(finale.vote('one','!door 1'),false);
  finale.act('open-vote');
  assert.equal(finale.vote('unknown','!door 1'),false);
  assert.equal(finale.vote('one','!door 4'),false);
  assert.equal(finale.vote('one','!door 1 extra'),false);
  assert.equal(game.players.get('one').tabs,1);
  assert.equal(finale.vote('one','!DOOR 2'),true);
  assert.equal(finale.vote('one','!door 3'),false);
  assert.equal(game.players.get('one').tabs,0);
  assert.equal(game.totalTabs,2);
  finale.act('close-vote');assert.equal(finale.phase,'ready');assert.equal(finale.selected,2);
  assert.equal(finale.vote('two','!door 1'),false);assert.equal(game.players.get('two').tabs,1);
  assert.equal(finale.snapshot().playback,undefined);
});
test('ties and empty ballots require an explicit valid streamer choice',()=>{
  for(const vote of [false,true]) {
    const {finale,prepare}=fixture();prepare();finale.act('open-vote');
    if(vote){finale.vote('one','!door 1');finale.vote('two','!door 2');}
    finale.act('close-vote');assert.equal(finale.phase,'choice');
    assert.throws(()=>finale.act('play'));
    assert.throws(()=>finale.act('choose',vote ? 3 : 4));
    finale.act('choose',2);finale.act('play');assert.equal(finale.activeItem().id,2);
  }
});
test('pause freezes playback, resume continues, and the segment ends naturally',()=>{
  const {finale,prepare,advance}=fixture();prepare();finale.act('open-vote');finale.vote('one','!door 1');finale.act('close-vote');finale.act('play');
  assert.equal(finale.snapshot().playback.title,'Orbital Drift');
  advance(3000);finale.act('pause');advance(10000);
  assert.equal(finale.snapshot().playback.elapsedMs,3000);
  finale.act('resume');advance(15000);
  assert.equal(finale.snapshot().phase,'ended');assert.equal(finale.activeItem(),null);
  assert.throws(()=>finale.act('play'));
});
test('removing a door stops playback, revokes access, and refunds only its spent ballots',()=>{
  const {game,finale,prepare}=fixture();prepare();finale.act('open-vote');finale.vote('one','!door 1');finale.act('close-vote');finale.act('play');
  const revision=finale.revision;
  finale.act('remove',1);
  assert.equal(finale.phase,'stopped');assert.equal(finale.activeItem(),null);
  assert.equal(finale.snapshot().playback,undefined);
  assert.equal(game.players.get('one').tabs,1);assert.equal(game.totalTabs,2);
  assert.equal(finale.ballots.size,0);assert.ok(finale.revision>revision);
  finale.act('remove',1);assert.equal(game.players.get('one').tabs,1);
  assert.throws(()=>finale.act('resume'));assert.throws(()=>finale.approve(1));
});
test('stop, skip, end and media errors cannot trigger unapproved playback',()=>{
  const {finale,prepare}=fixture();assert.throws(()=>finale.act('play'));prepare();
  finale.act('open-vote');finale.vote('one','!door 3');finale.act('close-vote');finale.act('play');
  finale.act('playback-error');assert.equal(finale.phase,'paused');assert.ok(finale.snapshot().error);
  finale.act('resume');assert.equal(finale.snapshot().error,null);
  finale.act('stop');assert.equal(finale.activeItem(),null);
  finale.act('skip');assert.equal(finale.phase,'ended');finale.act('end');assert.equal(finale.phase,'ended');
  finale.reset();assert.equal(finale.approved.size,0);assert.equal(finale.revealed,0);assert.equal(finale.activeItem(),null);
});
