import http from 'node:http';
import { validateConfig } from './logic.mjs';
import { TwitchConnection } from './twitch.mjs';
import { TriviaGame } from './game.mjs';
import { createHandler } from './app.mjs';
import { Finale } from './finale.mjs';
let config;
try { config = validateConfig(process.env); }
catch (error) { console.error(`Configuration error: ${error.message}`); process.exit(1); }
const game = new TriviaGame();
const demoGame = new TriviaGame();
const finale = new Finale(game);
const demoFinale = new Finale(demoGame);
const twitch = new TwitchConnection(config, message => console.log(`[${new Date().toISOString()}] ${message}`), event => {
  game.answer(event.chatter_user_id,event.chatter_user_name || event.chatter_user_login,event.message?.text);
  finale.vote(event.chatter_user_id,event.message?.text);
});
const server = http.createServer(createHandler({config,twitch,game,demoGame,finale,demoFinale}));
server.on('error',error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${config.port} is already in use. Stop the existing Last Call server before starting this copy.` : 'The local server could not start.');
  process.exitCode = 1;
});
server.listen(config.port,'127.0.0.1',() => {
  console.log(`Last Call ready at http://localhost:${config.port}`);
  console.log('Connect Twitch for live play, or open /demo for a separate offline rehearsal.');
});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => { twitch.stop(); server.close(); });
