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
