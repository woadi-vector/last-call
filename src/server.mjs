import http from 'node:http';
import { validateConfig } from './logic.mjs';
import { TwitchConnection } from './twitch.mjs';

let config;
try { config = validateConfig(process.env); }
catch (error) { console.error(`Configuration error: ${error.message}`); process.exit(1); }

const twitch = new TwitchConnection(config, message => console.log(`[${new Date().toISOString()}] ${message}`));

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

function respond(res, status, body, type='text/html; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type':type,
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${config.port}`);
  if (req.method !== 'GET') return respond(res,405,'Method not allowed','text/plain');
  if (url.pathname === '/connect') {
    res.writeHead(302,{'Location':twitch.authorizationUrl,'Cache-Control':'no-store'});
    res.end();
    return;
  }
  if (url.pathname === '/auth/callback') {
    try {
      const error = url.searchParams.get('error');
      if (error) throw new Error(`Twitch authorization declined: ${error}`);
      await twitch.finishAuthorization(url.searchParams.get('code'),url.searchParams.get('state'));
      res.writeHead(302,{'Location':'/','Cache-Control':'no-store'});
      res.end();
    } catch (error) {
      console.error(`Authorization failed: ${error.message}`);
      respond(res,400,`<h1>Connection failed</h1><p>${escapeHtml(error.message)}</p><a href="/">Try again</a>`);
    }
    return;
  }
  if (url.pathname === '/api/status') return respond(res,200,JSON.stringify(twitch.snapshot()),'application/json; charset=utf-8');
  if (url.pathname !== '/') return respond(res,404,'Not found','text/plain');
  const state = twitch.snapshot();
  respond(res,200,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Last Call — Twitch Connection</title>
<style>body{font:17px system-ui,sans-serif;background:#141316;color:#faf8f4;max-width:700px;margin:12vh auto;padding:24px}h1{font-size:2.7rem;color:#e9bd75}a{display:inline-block;background:#e9bd75;color:#16120d;padding:14px 20px;border-radius:12px;font-weight:700;text-decoration:none}section{background:#252329;padding:22px;border-radius:16px;margin:20px 0}code{background:#39343b;padding:4px 8px;border-radius:5px}small{color:#b9b2bb}b{color:#e9bd75}</style>
<h1>Last Call 🍻</h1><p>The show is yours. The game runs itself. The ending belongs to chat.</p>
<section><p>Connection: <b id="status">${escapeHtml(state.status)}</b></p><p>Channel: <span id="channel">${escapeHtml(state.channel || 'Not connected')}</span></p><p>Chat messages seen: <strong id="count">${state.messageCount}</strong></p><p>Latest: <small id="latest">${escapeHtml(state.lastMessage ? `${state.lastMessage.from}: ${state.lastMessage.text}`:'Nothing yet')}</small></p></section>
<p><a href="/connect">${state.account?'Reconnect Twitch':'Connect Twitch'}</a></p><p>After connecting, ask a friend to type <code>!lastcall ping</code> in your Twitch chat. The bot should reply.</p><small>Day 1 connection milestone. No trivia logic yet. OAuth tokens stay in server memory and disappear on restart.</small>
<script>/* Live status display uses no external scripts. */</script></html>`);
});

server.listen(config.port,'127.0.0.1',() => {
  console.log(`Last Call ready at http://localhost:${config.port}`);
  console.log('Twitch is not connected until you click Connect Twitch.');
});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => { twitch.stop(); server.close(); });
