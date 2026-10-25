# Last Call development tracker

## Day 1 baseline
- Starter copied from Desktop/Last Call/last-call into this workspace.
- Original architecture: native Node HTTP server, Twitch OAuth, EventSub WebSocket, pure command logic. No dependencies.
- Node 24.18.0; original three tests passed; all source syntax checks passed.
- Git baseline saved before fixes. Local .env is ignored and must never be staged or printed.

## Current work
- Check Twitch's delivery result before logging a successful ping reply.
- Preserve subscriptions during Twitch-requested WebSocket handoff.
- Add focused OAuth state, ping delivery, and session transfer tests.
- Local credentials copied directly from the Desktop project's .env without displaying values; Git ignore confirmed.
- Existing local server verified on 127.0.0.1:3000: HTTP 200, account/channel woadi_, Chat subscribed. OAuth and the live EventSub subscription are working.
- Live ping verified: user confirmed Twitch displayed the broadcaster's reply, "Last Call is listening! Welcome to the bar, jaydubs1980!" after the other account's command.
- Day 1 live connection milestone complete for the existing running server. Existing server was preserved to retain its in-memory OAuth session; restart and reauthorize to load and live-verify workspace fixes.

## Smallest demo plan (after live connection passes)
1. One themed five-question pack, generated then explicitly reviewed and approved by the streamer; retain a prepared fallback.
2. Streamer start/pause/next controls and a quiet OBS browser overlay.
3. Chat answers, deterministic scoring, individual tabs, and one shared goal.
4. Last Call: spend earned tabs on a vote between three streamer-approved rabbit-hole choices.
5. Rehearse the entire short demo; add a single celebration only if time remains.

## Playable trivia milestone
- Added pure in-memory round/scoring logic and a separate HTTP handler using native Node APIs. No dependencies added.
- Added a prepared fallback pack and explicit approval before starting. AI pack generation remains future work.
- Added 25-second rounds, pause/resume, reveal, next, first-answer-only scoring, individual tabs, and a ten-tab community goal.
- Added producer dashboard, read-only OBS overlay, and isolated rehearsal with five fake viewers. Overlay state hides answers until reveal.
- Kept live controls on loopback; mutations require same-origin requests and a custom header; Host validation guards against DNS rebinding.
- Browser rehearsal verified approval, start, answer submission, pause, reveal, tab award, and next question. Demo left paused on question two with one tab.
- All ten tests and syntax checks pass. HTTP checks cover same-origin mutation restrictions, live connection gating, asset serving, demo isolation, and answer hiding. A mocked EventSub test verifies duplicate events and broadcaster messages cannot add answers.
- Restarted the server in this workspace to load the new implementation. User reauthorized Twitch; the new server confirms Chat subscribed on woadi_.
- Live trivia verified by the user and server: round three in reveal, one accepted answer, jaydubs1980 with one tab, community total one. Approval, real chat ingestion, reveal, and scoring are working together.
- Remaining demo milestones: generated pack workflow and curated Last Call voting finale. No subscriptions/celebrations added yet.

## Windows runbook
1. Edit .env locally and set TWITCH_CLIENT_SECRET. Do not paste secrets into chat.
2. Confirm the Twitch developer app callback is exactly http://localhost:3000/auth/callback.
3. Run npm.cmd test, then npm.cmd start from this folder.
4. Open http://localhost:3000 and connect Twitch as the configured channel owner.
5. Refresh until Chat subscribed. Have a different account send !lastcall ping.
6. Verify both the visible Twitch reply and successful delivery in the local console.

Use npm.cmd in PowerShell if npm.ps1 is blocked. No npm install is needed.
Keep the dashboard bound to loopback. Phone control of Codex is separate from exposing this app.
