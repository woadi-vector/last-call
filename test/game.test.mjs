import test from 'node:test';
import assert from 'node:assert/strict';
import { TriviaGame, PACK } from '../src/game.mjs';

test('approval, first-answer scoring, pause and deadline form a deterministic round', () => {
  let clock = 1000;
  const game = new TriviaGame({now:()=>clock,duration:10_000});
  assert.throws(()=>game.act('start'));
  assert.equal(game.answer('early','Early','!answer B'),false);
  game.act('approve'); game.act('start');
  assert.equal(game.snapshot().question.answer,undefined);
  assert.equal(game.snapshot().review,undefined);
  assert.equal(game.answer('one','One','!answer B'),true);
  assert.equal(game.answer('one','One','!answer A'),false);
  assert.equal(game.answer('two','Two','!answer A'),true);
  assert.equal(game.answer('three','Three','B'),false);
  clock += 4000; game.act('pause');
  clock += 50000;
  assert.equal(game.snapshot().secondsLeft,6);
  assert.equal(game.answer('three','Three','!answer B'),false);
  game.act('resume'); clock += 6000;
  assert.equal(game.answer('late','Late','!answer B'),false);
  assert.equal(game.snapshot().phase,'reveal');
  assert.equal(game.snapshot().totalTabs,1);
  assert.equal(game.snapshot().question.answer,1);
  assert.throws(()=>game.act('reveal'));
  assert.equal(game.snapshot().totalTabs,1);
  game.act('next');
  assert.equal(game.snapshot().round,2);
  assert.equal(game.answer('one','One','!answer C'),true);
});

test('five rounds finish without overflowing, reset removes scores and approval', () => {
  const game = new TriviaGame();
  game.act('approve'); game.act('start');
  for (const question of PACK.questions) {
    game.answer('viewer','Regular',`!answer ${String.fromCharCode(65+question.answer)}`);
    game.act('reveal'); game.act('next');
  }
  assert.equal(game.snapshot().phase,'finished');
  assert.equal(game.snapshot().totalTabs,5);
  assert.equal(game.snapshot().leaderboard[0].tabs,5);
  assert.throws(()=>game.act('next'));
  game.act('reset');
  assert.equal(game.snapshot().approved,false);
  assert.deepEqual(game.snapshot().leaderboard,[]);
});

test('stop cancels an open round, preserves prior tabs, and blocks further play', () => {
  let clock = 0;
  const game = new TriviaGame({now:()=>clock,duration:1000});
  game.act('approve'); game.act('start');
  game.answer('viewer','Regular','!answer B'); game.act('reveal'); game.act('next');
  game.answer('viewer','Regular','!answer C');
  game.act('stop');
  clock += 5000;
  assert.equal(game.snapshot().phase,'stopped');
  assert.equal(game.snapshot().totalTabs,1);
  assert.equal(game.snapshot().leaderboard[0].tabs,1);
  assert.equal(game.snapshot().question,null);
  assert.equal(game.snapshot().reward,null);
  assert.equal(game.snapshot().answerCount,0);
  assert.equal(game.answer('late','Late','!answer C'),false);
  for (const action of ['resume','reveal','next','start']) assert.throws(()=>game.act(action));
  game.act('stop'); // Repeated emergency stop is safe.
  assert.equal(game.snapshot().totalTabs,1);
});

test('stop works while paused or revealed; a pending deadline cannot award after stop', () => {
  for (const phase of ['question','paused','reveal']) {
    let clock = 0;
    const game = new TriviaGame({now:()=>clock,duration:1000});
    game.act('approve'); game.act('start'); game.answer('viewer','Regular','!answer B');
    if (phase === 'paused') game.act('pause');
    if (phase === 'reveal') game.act('reveal');
    clock = 2000;
    game.act('stop');
    assert.equal(game.snapshot().totalTabs,phase === 'reveal' ? 1 : 0);
    assert.equal(game.snapshot().phase,'stopped');
  }
});

test('reward batches contain only scored winners and are stable across polling', () => {
  const game = new TriviaGame({now:()=>1234});
  game.act('approve'); game.act('start');
  game.answer('yes','Winner','!answer B'); game.answer('no','Other','!answer A');
  assert.equal(game.snapshot().reward,null);
  game.act('pause'); assert.equal(game.snapshot().reward,null);
  game.act('reveal');
  const reward = game.snapshot().reward;
  assert.deepEqual(reward.names,['Winner']);
  assert.equal(reward.count,1);
  assert.equal(reward.at,1234);
  assert.deepEqual(game.snapshot().reward,reward);
  game.reveal(); assert.equal(game.snapshot().totalTabs,1);
  game.act('reset');
  assert.equal(game.snapshot().reward,null);
  game.act('approve'); game.act('start');
  game.answer('yes','Winner','!answer B'); game.act('reveal');
  assert.ok(game.snapshot().reward.id > reward.id);
});

test('crowded reward batches are bounded and wrong-only rounds have no reward', () => {
  const game = new TriviaGame();
  game.act('approve'); game.act('start');
  for (let index=0;index<20;index++) game.answer(String(index),`Viewer ${index}`,'!answer B');
  game.act('reveal');
  assert.equal(game.snapshot().reward.names.length,3);
  assert.equal(game.snapshot().reward.count,20);
  assert.equal(game.snapshot().totalTabs,20);
  game.act('next'); game.answer('wrong','Wrong','!answer A'); game.act('reveal');
  assert.equal(game.snapshot().reward,null);
});
