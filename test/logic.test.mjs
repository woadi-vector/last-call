import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand, SeenMessages, validateConfig } from '../src/logic.mjs';

test('ping command is deliberate and exact', () => {
  assert.equal(parseCommand('!lastcall ping'),'ping');
  assert.equal(parseCommand('  !LASTCALL PING  '),'ping');
  assert.equal(parseCommand('!lastcall ping again'),null);
  assert.equal(parseCommand('A'),null);
});

test('deduplicates messages with a bounded store', () => {
  const seen = new SeenMessages(2);
  assert.equal(seen.first('one'),true);
  assert.equal(seen.first('one'),false);
  assert.equal(seen.first('two'),true);
  assert.equal(seen.first('three'),true);
  assert.equal(seen.first('one'),true);
  assert.equal(seen.first(''),false);
});

test('config requires secret and exact local callback', () => {
  const valid = {TWITCH_CLIENT_ID:'abc',TWITCH_CLIENT_SECRET:'xyz',TWITCH_REDIRECT_URI:'http://localhost:3000/auth/callback',PORT:'3000',TWITCH_CHANNEL_LOGIN:'woadi_'};
  assert.equal(validateConfig(valid).channelLogin,'woadi_');
  assert.throws(()=>validateConfig({...valid,TWITCH_CLIENT_SECRET:''}),/TWITCH_CLIENT_SECRET/);
  assert.throws(()=>validateConfig({...valid,TWITCH_REDIRECT_URI:'http://evil.invalid/auth/callback'}),/localhost/);
  assert.throws(()=>validateConfig({...valid,PORT:'nope'}),/PORT/);
});
