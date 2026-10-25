# Last Call — Day 1 Twitch Connection

This is the first small milestone of the **Last Call** hackathon project: authorize your own Twitch channel, receive chat messages via EventSub WebSocket, and reply to `!lastcall ping`.

It is not yet the trivia game. See the master plan for the full scope.

## Requirements

- Node.js **22 or newer** (Node 24 recommended). No npm dependency install required.
- A Twitch developer app owned by the broadcaster (`Last Call Trivia`).
- Its Client ID and Client Secret stored **locally**, never in a GitHub commit.
- A Twitch account that owns the channel you want to test.

## Setup on your streaming PC

1. Extract the starter project folder.
2. Open a terminal in `last-call`.
3. Copy `.env.example` to `.env` (Windows PowerShell: `Copy-Item .env.example .env`).
4. Open `.env` in a local editor and paste the **Client Secret directly from your password manager** into `TWITCH_CLIENT_SECRET=`. Do **not** share it in chat. Keep `TWITCH_CLIENT_ID` as supplied.
5. Verify your Twitch app OAuth Redirect URL is exactly `http://localhost:3000/auth/callback`.
6. Run `npm test` and `npm start`.
7. Open **http://localhost:3000** in a browser on the **same PC** that runs the server.
8. Click **Connect Twitch** and authorize while signed in as **woadi_**. Only `user:read:chat` and `user:write:chat` are requested for this first milestone.
9. The status should become **Chat subscribed**. Have another Twitch user type `!lastcall ping` into your channel chat. You should see the chat message in the terminal and a short bot reply in chat.

You can view `http://localhost:3000/api/status` for a JSON status snapshot. The dashboard page currently shows a snapshot; refresh it to see new messages.

## Safety notes

- `.env` is excluded from Git. Never commit it, paste it in a support message, or upload it.
- Access/refresh tokens live **only in memory** for now; restarting requires reconnecting. A secure persistence solution can be added after the first test.
- The local development server listens on `127.0.0.1` only and cannot be accessed from outside your computer.
- Do not port-forward this server. It currently has no streamer dashboard authentication because it is local-only.
- This prototype uses a broadcaster's own Twitch account. It will send chat replies as that account. A separate named bot account can be added later.
- `!lastcall ping` is the only command that triggers a reply; normal chat messages are logged for the local test. Avoid streaming private chat data into public logs.

## Troubleshooting

- **Wrong account:** sign out of Twitch in the browser or choose woadi_ during authorization; `TWITCH_CHANNEL_LOGIN` protects against accidentally connecting a different channel.
- **OAuth redirect mismatch:** check the precise URL registered in Twitch settings and `.env`; paths and protocol must match.
- **Not subscribed:** check local console errors. Twitch EventSub needs outbound HTTPS/WebSocket connectivity.
- **No reply but messages appear:** the `user:write:chat` permission or send-message API may have failed; the terminal will show a non-secret error.
- **Port 3000 in use:** stop the other server or change both `PORT` and the registered redirect URL together.
- **Stopped server:** start again and reconnect; tokens are currently intentionally ephemeral.

## Hackathon notes

The entry must be built with Codex, show Codex in its demo, connect to Twitch, and be submitted before November 2, 2026 at 4 PM Central. The main development thread's **Codex session ID** is a separate required submission field; preserve it when moving the project into the actual Codex coding environment.

Twitch references: [chat authentication](https://dev.twitch.tv/docs/chat/authenticating/), [WebSocket EventSub](https://dev.twitch.tv/docs/eventsub/handling-websocket-events), [OAuth code flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
