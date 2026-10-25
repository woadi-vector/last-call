import test from 'node:test';
import assert from 'node:assert/strict';
import { TwitchConnection } from '../src/twitch.mjs';
import { TriviaGame } from '../src/game.mjs';

test('OAuth rejects expired or replayed state before exchanging credentials', async () => {
  const connection = new TwitchConnection({clientId:'example',redirectUri:'http://localhost:3000/auth/callback'});
  const state = new URL(connection.authorizationUrl).searchParams.get('state');
  connection.authStates.set(state, Date.now() - 1);
  await assert.rejects(connection.finishAuthorization('code',state), /expired/);
  assert.equal(connection.authStates.has(state),false);
  await assert.rejects(connection.finishAuthorization('code',state), /expired/);
});

test('ping reports delivery only when Twitch confirms it and ignores self messages', async () => {
  const logs = [];
  const connection = new TwitchConnection({}, message => logs.push(message));
  connection.user = connection.channel = {id:'owner'};
  let calls = 0;
  let delivered = false;
  connection.api = async () => { calls++; return {data:[{is_sent:delivered}]}; };
  const event = {chatter_user_id:'viewer',chatter_user_name:'Viewer',message:{text:'!lastcall ping'}};
  await connection.onChat(event);
  assert.ok(logs.some(message => message.startsWith('Could not send reply:')));
  assert.ok(!logs.includes('Sent Last Call ping reply'));
  delivered = true;
  await connection.onChat(event);
  assert.ok(logs.includes('Sent Last Call ping reply'));
  await connection.onChat({...event,chatter_user_id:'owner'});
  assert.equal(calls,2);
});

test('transferred EventSub sessions reuse subscriptions', async () => {
  const connection = new TwitchConnection({});
  connection.api = async () => { assert.fail('must not resubscribe a transferred session'); };
  await connection.onSocketMessage({metadata:{message_type:'session_welcome'}},1,true);
  assert.equal(connection.status,'Chat subscribed');
});

test('EventSub chat reaches trivia once while broadcaster messages are ignored', async () => {
  const game = new TriviaGame();
  game.act('approve'); game.act('start');
  const connection = new TwitchConnection({},()=>{},event=>game.answer(event.chatter_user_id,event.chatter_user_name,event.message.text));
  connection.user = connection.channel = {id:'owner'};
  const payload = {
    metadata:{message_type:'notification',subscription_type:'channel.chat.message',message_id:'unique-event'},
    payload:{event:{chatter_user_id:'viewer',chatter_user_name:'Viewer',message:{text:'!answer B'}}},
  };
  await connection.onSocketMessage(payload,0);
  await connection.onSocketMessage(payload,0);
  await connection.onChat({...payload.payload.event,chatter_user_id:'owner'});
  assert.equal(connection.messageCount,2);
  assert.equal(game.snapshot().answerCount,1);
  game.act('reveal');
  assert.equal(game.snapshot().totalTabs,1);
});
