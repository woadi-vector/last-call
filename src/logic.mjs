export function parseCommand(message) {
  const normalized = String(message ?? '').trim().toLowerCase();
  return normalized === '!lastcall ping' ? 'ping' : null;
}

export class SeenMessages {
  constructor(maxEntries = 2000) {
    this.maxEntries = maxEntries;
    this.ids = new Set();
  }
  first(id) {
    if (typeof id !== 'string' || !id) return false;
    if (this.ids.has(id)) return false;
    this.ids.add(id);
    if (this.ids.size > this.maxEntries) {
      this.ids.delete(this.ids.values().next().value);
    }
    return true;
  }
}

export function validateConfig(env) {
  const clientId = env.TWITCH_CLIENT_ID?.trim();
  const clientSecret = env.TWITCH_CLIENT_SECRET?.trim();
  const redirectUri = env.TWITCH_REDIRECT_URI?.trim() || 'http://localhost:3000/auth/callback';
  const port = Number(env.PORT || 3000);
  if (!clientId || !clientSecret) throw new Error('Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port number');
  const redirect = new URL(redirectUri);
  if (redirect.protocol !== 'http:' || redirect.hostname !== 'localhost' || redirect.pathname !== '/auth/callback' || redirect.port !== String(port)) {
    throw new Error(`TWITCH_REDIRECT_URI must be http://localhost:${port}/auth/callback and match the Twitch app exactly`);
  }
  return { clientId, clientSecret, redirectUri, port, channelLogin: env.TWITCH_CHANNEL_LOGIN?.trim().toLowerCase() || '' };
}
