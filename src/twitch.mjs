import { randomBytes } from 'node:crypto';
import { parseCommand, SeenMessages } from './logic.mjs';

const API = 'https://api.twitch.tv/helix';
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const SCOPES = ['user:read:chat', 'user:write:chat'];

async function jsonOrThrow(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = data.status || response.status;
    throw new Error(`Twitch API ${code}: ${data.message || data.error || 'request failed'}`);
  }
  return data;
}

export class TwitchConnection {
  constructor(config, log = console.log) {
    this.config = config;
    this.log = log;
    this.authStates = new Map();
    this.token = null;
    this.user = null;
    this.channel = null;
    this.socket = null;
    this.socketGeneration = 0;
    this.reconnectTimer = null;
    this.shuttingDown = false;
    this.seen = new SeenMessages();
    this.lastMessage = null;
    this.messageCount = 0;
    this.status = 'Disconnected';
  }

  get authorizationUrl() {
    const state = randomBytes(24).toString('hex');
    this.authStates.set(state, Date.now() + 10 * 60_000);
    for (const [key, expires] of this.authStates) if (expires < Date.now()) this.authStates.delete(key);
    const url = new URL('https://id.twitch.tv/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('scope', SCOPES.join(' '));
    url.searchParams.set('state', state);
    url.searchParams.set('force_verify', 'true');
    return url.toString();
  }

  async finishAuthorization(code, state) {
    const expires = this.authStates.get(state);
    this.authStates.delete(state);
    if (!expires || expires < Date.now() || !code) throw new Error('Invalid or expired OAuth authorization. Start again from /connect.');
    const body = new URLSearchParams({client_id:this.config.clientId,client_secret:this.config.clientSecret,code,grant_type:'authorization_code',redirect_uri:this.config.redirectUri});
    const result = await jsonOrThrow(await fetch(TOKEN_URL, {method:'POST',body}));
    this.token = {...result, expires_at:Date.now() + result.expires_in * 1000};
    const userData = await this.api('/users');
    this.user = userData.data?.[0];
    if (!this.user) throw new Error('Twitch did not return an authenticated user');
    if (this.config.channelLogin && this.user.login.toLowerCase() !== this.config.channelLogin) {
      this.token = null;
      this.user = null;
      throw new Error(`Authenticated account does not match configured channel (${this.config.channelLogin}). Sign in with the channel owner.`);
    }
    this.channel = this.user;
    this.log(`Authorized as ${this.user.display_name} (${this.user.id})`);
    await this.connectSocket();
  }

  async refreshIfNeeded() {
    if (!this.token) throw new Error('Not authorized');
    if (this.token.expires_at && Date.now() < this.token.expires_at - 60_000) return;
    if (!this.token.refresh_token) throw new Error('No refresh token; reconnect at /connect');
    const body = new URLSearchParams({client_id:this.config.clientId,client_secret:this.config.clientSecret,grant_type:'refresh_token',refresh_token:this.token.refresh_token});
    const refreshed = await jsonOrThrow(await fetch(TOKEN_URL, {method:'POST',body}));
    this.token = {...refreshed, refresh_token:refreshed.refresh_token || this.token.refresh_token, expires_at:Date.now() + refreshed.expires_in*1000};
  }

  async api(path, options = {}) {
    await this.refreshIfNeeded();
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {'Authorization':`Bearer ${this.token.access_token}`,'Client-Id':this.config.clientId,'Content-Type':'application/json',...(options.headers || {})}
    });
    return jsonOrThrow(response);
  }

  async connectSocket(url = 'wss://eventsub.wss.twitch.tv/ws') {
    this.socketGeneration += 1;
    const generation = this.socketGeneration;
    this.shuttingDown = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) { try { this.socket.close(); } catch {} }
    this.status = 'Connecting to Twitch EventSub';
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.addEventListener('open', () => { if (generation === this.socketGeneration) this.log('EventSub socket connected'); });
    socket.addEventListener('message', event => {
      if (generation !== this.socketGeneration) return;
      try { this.onSocketMessage(JSON.parse(event.data), generation).catch(err => this.log(`EventSub error: ${err.message}`)); }
      catch (err) { this.log(`Invalid EventSub message: ${err.message}`); }
    });
    socket.addEventListener('error', () => { if (generation === this.socketGeneration) this.log('EventSub socket error'); });
    socket.addEventListener('close', () => {
      if (generation !== this.socketGeneration || this.shuttingDown) return;
      this.status = 'Disconnected; reconnecting';
      this.reconnectTimer = setTimeout(() => this.connectSocket().catch(err => this.log(err.message)), 4000);
    });
  }

  async onSocketMessage(payload, generation) {
    const type = payload.metadata?.message_type;
    if (type === 'session_welcome') {
      const sessionId = payload.payload?.session?.id;
      if (!sessionId) throw new Error('Missing EventSub session ID');
      const data = await this.api('/eventsub/subscriptions', {
        method:'POST', body:JSON.stringify({type:'channel.chat.message',version:'1',condition:{broadcaster_user_id:this.channel.id,user_id:this.user.id},transport:{method:'websocket',session_id:sessionId}})
      });
      if (generation !== this.socketGeneration) return;
      this.status = 'Chat subscribed';
      this.log(`Subscribed to chat on ${this.channel.login} (${data.data?.[0]?.status || 'requested'})`);
    } else if (type === 'session_reconnect') {
      const reconnectUrl = payload.payload?.session?.reconnect_url;
      if (reconnectUrl) await this.connectSocket(reconnectUrl);
    } else if (type === 'notification' && payload.metadata?.subscription_type === 'channel.chat.message') {
      const event = payload.payload?.event;
      if (!event || !this.seen.first(payload.metadata.message_id)) return;
      await this.onChat(event);
    } else if (type === 'revocation') {
      this.status = 'Subscription revoked — reconnect at /connect';
      this.log(this.status);
    }
  }

  async onChat(event) {
    const message = event.message?.text || '';
    this.messageCount++;
    this.lastMessage = {from:event.chatter_user_name || event.chatter_user_login || 'unknown',text:message,time:new Date().toISOString()};
    this.log(`[chat] ${this.lastMessage.from}: ${message}`);
    if (parseCommand(message) !== 'ping') return;
    if (event.chatter_user_id === this.user.id) return; // Avoid bot self-replies.
    try {
      await this.api('/chat/messages', {method:'POST',body:JSON.stringify({broadcaster_id:this.channel.id,sender_id:this.user.id,message:`Last Call is listening! Welcome to the bar, ${event.chatter_user_name || 'friend'}!`})});
      this.log('Sent Last Call ping reply');
    } catch (err) { this.log(`Could not send reply: ${err.message}`); }
  }

  snapshot() { return {status:this.status,account:this.user?.login || null,channel:this.channel?.login || null,messageCount:this.messageCount,lastMessage:this.lastMessage}; }
  stop() { this.shuttingDown = true; if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.socket?.close(); }
}
