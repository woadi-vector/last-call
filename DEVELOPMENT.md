# Last Call development tracker

## October 29 — three-door finale
- Added a separate deterministic Finale engine attached to trivia balances; Twitch feeds !door commands through the same viewer identity. First accepted ballot spends one tab, once; community earned progress is preserved. Ties and empty ballots require explicit selection.
- Added three manually staged door reveals, a small overlay clue strip, local curator previews/approvals, streamer finale controls, and a separate virtual bar television scene.
- Streamer/public snapshots omit unrevealed themes and all destination titles/files until chosen playback starts. Curator preparation is intentionally separate and local-only; no authenticated remote dashboard is claimed or exposed.
- Playback requires approval and an explicit Open winning door action. Media routes restrict playback to the active approved segment and version, support byte ranges, and deny access after stop/removal/end. Preview routes are for local curator review.
- Controls include pause/resume, skip, stop, emergency removal and end-show. Removing content stops the finale, revokes approval and refunds its affected ballots once. The bar polls at 250 ms and unloads media on stop, end or connection failure.
- User chose original silent demo segments. Generated three original 18-second MP4 animations with local FFmpeg, committed as assets; no third-party footage, media service or npm dependency. FFmpeg is optional for regeneration, not app startup.
- All 22 automated tests and syntax checks pass. Browser rehearsal verified previews, approval, staged reveals, one earned/spent tab selecting door 2, successful muted video playback, pause/resume, and natural end with TV unloaded. No browser console media errors. The bar fits a 1920 × 1080 viewport without scrolling/overflow.
- Restarted the app to load the finale. User reauthorized Twitch; server confirms Chat subscribed on woadi_. Live finale remains preparing, with zero approvals and doors revealed, awaiting user curator review. Demo flow is separate and has ended naturally.
- Live !door voting and actual OBS bar-scene verification remain pending. Full runbook: FINALE_RUNBOOK.md. Preview: outputs/last-call-bar.jpg. AI discovery, remote moderation, companion and further branching remain deferred.

## October 29 — compact overlay and Stop Trivia
- Added Stop Trivia to the existing state machine and dashboard. It preserves prior tabs/community progress, cancels an unrevealed round without awarding it, clears pending answers, hides its question, and rejects further play until reset. Pause/resume behavior is unchanged.
- Stop preempts pending lazy deadline processing. If another request has already revealed the round, its awarded tabs remain. Repeated stop is safe; reset remains the only destructive score-clearing control.
- Added a dedicated overlay stylesheet. Default card width is 696px inside a 720px Browser Source, down from 940px; answers use 21px text instead of 14px. Open-question card is about 296px tall; reveal expands for explanation. Suggested OBS source is 720 × 520 with transparent document/body backgrounds.
- Added bounded server reward batches emitted only on scoring. Overlay shows a silent +1 TAB toast with up to three names and an overflow count, a small coin animation, and animated shared progress. Reduced-motion CSS disables animation. Rewards do not replay on initial load, reload or reconnect.
- Browser rehearsal: answered/revealed three rounds for three tabs; submitted a correct answer in round four, then stopped before reveal. Final state: stopped, zero pending answers, three tabs preserved. Overlay stopped view matches. Verified no toast before reveal, toast after scoring, and no replay on overlay reload. No browser console errors observed.
- All fourteen tests and all source syntax checks pass, including stop while open/paused/revealed, pending deadlines, blocked answers after stop, reward stability/bounds, and HTTP stop routing. No dependencies added. No .env or tokens read/modified.
- App started from this workspace. User reauthorized Twitch and completed the live reward/stop checklist. Server verification: Chat subscribed on woadi_, stopped during round two, jaydubs1980 retains one tab, community total one, zero pending answers, and no question in public state. Real-chat scoring and Stop are verified; the transient reward appearance is supported by the user's checklist completion and the prior browser rehearsal, not retained server history.
- Actual OBS-over-Warzone placement/readability review is still pending. Browser screenshots are in ignored outputs/. AI/moderator/companion work remains deferred.

## Current scope and morning resume
- The October 25 updated user brief is preserved in `BUILD_BRIEF.md` and supersedes the earlier milestone sketch below.
- `MORNING_HANDOFF.md` maps the actual implementation to P0, records gaps, and proposes the smallest staged three-door finale.
- Evening verification: all ten tests, source syntax checks, and whitespace checks pass. Local app was unreachable; left stopped without changing .env or tokens.
- Resume with trivia stabilization (non-destructive stop, full live run, OBS readability), then P0 mystery doors and approved surprise playback. AI generation is P1; remote moderation and full discovery remain deferred. No feature code changed for this brief update.

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

## Earlier demo sketch (superseded by BUILD_BRIEF.md)
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
- Remaining P0 milestones: trivia stop/OBS stabilization, staged mystery doors, approved surprise playback, tab-based influence, and finale emergency controls. Generated packs and celebrations are P1 under the updated brief.

## Windows runbook
1. Edit .env locally and set TWITCH_CLIENT_SECRET. Do not paste secrets into chat.
2. Confirm the Twitch developer app callback is exactly http://localhost:3000/auth/callback.
3. Run npm.cmd test, then npm.cmd start from this folder.
4. Open http://localhost:3000 and connect Twitch as the configured channel owner.
5. Refresh until Chat subscribed. Have a different account send !lastcall ping.
6. Verify both the visible Twitch reply and successful delivery in the local console.

Use npm.cmd in PowerShell if npm.ps1 is blocked. No npm install is needed.
Keep the dashboard bound to loopback. Phone control of Codex is separate from exposing this app.

## OBS verification attempt after live Stop check
- Launched the installed OBS Studio. Windows inventory returned OBS 32.2.2, Profile: Untitled, Scenes: Untitled.
- Window capture failed on initial inspection and again after refreshing the window binding and activating it. Final error: window capture timed out: timed out waiting on channel.
- Stopped desktop automation after the documented recovery attempt. No scene edits or stream/record controls were operated. Visual OBS-over-gameplay verification remains pending.
- Manual preview check: add a Browser Source using http://localhost:3000/overlay at 720 × 520, keep native scale, and place it away from the gameplay HUD. Use the /overlay?demo=1 URL for isolated rehearsal. Verify transparency, readable question/answers, reward visibility, and that Stop removes the question while keeping tabs. Do not mark Warzone readability verified without actual gameplay visible.
- User subsequently confirmed the overlay "looks good, on the screen." OBS preview appearance is accepted based on user review. Actual Warzone HUD clearance was not explicitly confirmed, so it remains part of the full-show rehearsal rather than an independently verified result.
- Next implementation milestone: P0 three mystery doors, manual staged reveals, earned-tab voting, approved surprise playback, and immediate finale controls. AI discovery, remote moderator access and companion features remain deferred.

## Audience overlay design review
- Opened the rehearsal dashboard's Open overlay link and captured an active question separately from producer controls.
- Verified during the open answer window that the overlay API omits answer, explanation and producer review fields. Browser view shows no correct-answer highlight or explanation. All ten tests still pass.
- Restarted the previously stopped local app for this review. No live Twitch authorization or gameplay was performed; screenshots use the isolated demo state.
- Current audience card is about 940 pixels wide at its default desktop size; question text is prominent but answer choices and utility labels are small. Actual OBS-over-gameplay readability is still unverified.
- Next design changes to consider: compact gameplay layout with larger answer text, and silent +1 TAB feedback with subtle community-progress animation. Do not expand into AI/moderator workflows before proving gameplay.
- Preview captured to outputs/overlay-answers-open.jpg (ignored by Git). No feature code changed in this review.
