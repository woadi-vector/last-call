# Last Call — Twitch Trivia

This is the first small milestone of the **Last Call** hackathon project: authorize your own Twitch channel, receive chat messages via EventSub WebSocket, and reply to `!lastcall ping`.

The next milestone adds a prepared five-question pack, streamer approval, timed rounds, individual tabs, a shared community goal, and a quiet OBS overlay. AI generation and the Last Call finale are still planned. Work and verification are tracked in `DEVELOPMENT.md`.

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

You can view `http://localhost:3000/api/status` for a JSON status snapshot. The dashboard and overlay update automatically.

## Play a round

1. Start with `npm.cmd start` from this workspace. If the Desktop starter is still running on port 3000, stop that process first. Only one server should run.
2. Open `http://localhost:3000` and connect Twitch. Every server restart requires reconnecting because tokens are kept in memory.
3. Review the five questions and correct answers in the dashboard's pack review, then click **Approve pack** and **Start trivia**. Live starts require **Chat subscribed**.
4. Viewers send `!answer A`, `!answer B`, `!answer C`, or `!answer D` in Twitch chat. Their first valid answer is final. The broadcaster account is excluded, as it also sends bot replies.
5. Questions close after 25 seconds. **Pause** freezes the clock and stops answers; **Resume** continues. **Reveal answer** can close a question early.
6. Correct answers earn one tab at reveal. The goal is ten community tabs. Click **Next question** to continue, and finish after question five.
7. Add `http://localhost:3000/overlay` as an OBS Browser Source, suggested size 980 × 720. Only put the overlay on stream; the producer dashboard includes upcoming answers.

Use `http://localhost:3000/demo` for a separate offline rehearsal. Approve and start the demo pack, then choose fake viewers and submit answers with the rehearsal buttons. Demo viewers never reach Twitch or live scores. Its overlay is `http://localhost:3000/overlay?demo=1`.

Scores and approvals are session-only. Reset clears all tabs and requires pack approval again. There are no automatic question announcements or audio; use the overlay to show questions to viewers.

## Safety notes

- `.env` is excluded from Git. Never commit it, paste it in a support message, or upload it.
- Access/refresh tokens live **only in memory** for now; restarting requires reconnecting. A secure persistence solution can be added after the first test.
- The local development server listens on `127.0.0.1` only and cannot be accessed from outside your computer.
- Do not port-forward this server. It currently has no streamer dashboard authentication because it is local-only.
- This prototype uses a broadcaster's own Twitch account. It will send chat replies as that account. A separate named bot account can be added later.
- `!lastcall ping` triggers a chat reply; `!answer A–D` enters trivia without generating a reply. Normal chat messages are logged locally. Avoid streaming private chat data into public logs.

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
