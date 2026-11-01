# Last Call development tracker

## November 1 — evidence-focused submission polish
- User requested applicable changes from a supplied hackathon review. Preserved the existing show implementation and targeted the write-up: historical Saturday 8 PM trivia and approximate 30–40 viewers supplied by the creator, Codex's role foregrounded, and specific verified live tab/ballot counts.
- Added a standalone credential-free rehearsal script and VERIFICATION.md. Ran it against its own ephemeral local HTTP server: one synthetic viewer, 10 answer attempts with 1 accepted, next question cancelled with the earned tab retained, 10 ballot attempts with 1 accepted, viewer balance 0/community total 1, and natural ending after the real 18-second interval with HTTP 403 afterward. Separate live game unchanged. Raw record: evidence/rehearsal-local.json. This is correctness evidence, not a Twitch latency or crowd benchmark.
- Refreshed Devpost and independently confirmed SUBMITTED, 5/5 steps complete before the edits. The creator's existing edits to the story were preserved. No gallery comparison, new AI request, secret access or application feature change was needed.
- Saved the targeted story edits and verified the public page shows the new opener, Codex framing and both evidence paragraphs. The public page still lists the hackathon under SUBMITTED TO. Proof: outputs/devpost-evidence-update.jpg. Repository checkpoint a2c6e99 contains the runnable evidence and raw record.

## November 1 — submission reported complete
- User confirmed the Devpost entry was submitted. Submission status is based on the user's confirmation; no independent status check was performed for this update.
- Next follow-up: review the project gallery when entries are published. No scheduled monitoring or further feature work was requested.

## November 1 — repository and Devpost required fields complete
- User requested repository creation. Created public https://github.com/woadi-vector/last-call and pushed the existing local commit history through GitHub CLI; the connected GitHub tools do not provide repository creation.
- Before publication, checked all 16 existing commits for forbidden local-file paths and common credential patterns, and checked example credentials for non-placeholder values. No findings. No .env file read or modified. All 31 tests and source syntax checks pass.
- Saved the repository URL in Devpost Additional info and public project links, completed the user-provided survey responses and explicitly confirmed eligibility statements. Devpost now shows 4/5 steps complete. Final terms remain unchecked and the entry remains a draft for user review/submission.

## November 1 — Devpost draft prepared
- At the user's request, saved the elevator pitch and project story to Last Call's existing Devpost entry, preserving its YouTube link. Added actual technology tags and three existing app screenshots. Created and uploaded original forest-green/gold thumbnail art using the built-in image generator.
- Preview confirmed the saved story and four media slides (video plus three app images). Technical-requirement and community-use answers plus main-build session ID are filled in Additional info but await required repository URL and personal survey responses before saving. Asked the user for those values; no repository remote is configured locally.
- Local copy: DEVPOST_ENTRY.md; delivery files and proof screenshots are in outputs/. Claims distinguish the verified Twitch/manual Studio from unverified real AI drafting and future features. No terms accepted, final submission, repository publication, or secrets exposed.

## November 1 — timed demo operator script
- Added DEMO_SCRIPT.md with exact current control labels, private setup, a roughly 2:40 spoken script, live Twitch command cues, isolated rehearsal steps and recovery guidance. It distinguishes Codex/Studio capture from private controls and curator preparation, and does not claim unverified live AI generation.
- Checked the sequence against dashboard/finale controls and the original fallback answer key. No app code, configuration or secrets changed; no recording or publishing started.

## October 30 — Studio and rehearsal polish
- Added a five-question Show Pack Studio with editable source notes, evidence, choices, explanations and difficulty; question inclusion, isolated local draft save/load, original fallback, and a fresh approval gate when applying a pack. Pack replacement is blocked once trivia or staged door reveals have begun.
- Optional server-side OpenAI Responses drafting uses structured output, store:false, bounded input and a timeout. Generated content is validated against supplied notes; no automatic fact verification is claimed. Fixed errors preserve the previous draft and keep upstream responses/credentials out of the UI. User chose to configure AI later; no actual OpenAI request was made or verified.
- Added pre-show 25/45/60-second answer windows, clear live/rehearsal badges, mode-correct preparation links and show-readiness checks. Existing native Node architecture and original finale media are preserved; no dependencies added.
- All 31 automated tests and source syntax checks pass. Browser rehearsal verified edit/exclude/save/load/apply, fresh approval, a four-question pack, a 60-second round, scoring and Stop retaining one tab. Unsafe source URLs lose their clickable link. No browser console errors observed.
- Screenshots: outputs/show-pack-studio.jpg and outputs/show-pack-studio-editor.jpg. STUDIO_RUNBOOK.md documents manual operation and deferred real AI verification.
- Protected the prior working checkpoint with tag pre-studio-polish-2026-10-30. Restarted the server to load changes; live Twitch needs reconnecting. Live scores/approvals remain session-only; saved drafts persist separately. No .env or secrets read/modified, recording, publishing or submission performed.

## October 30 — rehearsal accepted; capture next
- User reports the rehearsal was good. Live Twitch flow and both OBS scenes are already confirmed; preserve the current feature scope for capture.
- Checked the official Devpost rules for video, repository, description, main-build session ID and deadline requirements. SUBMISSION_CHECKLIST.md records sources and remaining delivery work; proposed final video target is 2:30.
- No feature code, secrets or configuration changed. No recording, uploads, external repository publication or submission performed.

## October 30 — OBS bar accepted
- After setting up the separate Last Call OBS scene (/bar at 1920 × 1080), user confirmed: "its there and correct." OBS bar setup/appearance is accepted based on user review, alongside the earlier trivia-overlay acceptance.
- Next: one uninterrupted short-show rehearsal across the two OBS scenes, then user-authorized demo capture. DEMO_REHEARSAL.md provides the sequence and accurate implementation claims. No new features or recording/streaming were started for this confirmation.

## October 30 — live Twitch finale verified
- User confirmed the live pack and all three original segment approvals. The live server had recorded the pack approval but not segment approvals; recorded those user-confirmed segment approvals through the live curator UI.
- Initial 25-second answer windows and manual round advancement caused timing mismatches. Staged a paused question to reduce the rush. Latest successful trivia state showed round three, jaydubs1980 with one earned tab and community total one; stopped trivia before opening voting.
- All three live doors were revealed and approved. User sent !door 2 from jaydubs1980. Server verified exactly one accepted ballot for door two, remaining viewer tabs zero, and community earned total unchanged at one.
- Closed voting and explicitly opened the winning door through streamer controls. Live /bar played the approved Deep Blue Signals original silent segment. Browser inspection verified decoded video, muted playback, time advancing (15.1467/18 seconds), and no media error.
- The live finale ended naturally and the TV became paused, hidden, and had its media source removed. No browser console errors observed. Final server state: Chat subscribed, ended, selected door two, one ballot, one community tab earned, jaydubs1980 zero spendable tabs.
- Evidence: outputs/live-finale-playback.jpg. No feature code changed. Actual OBS bar-scene confirmation and a concise full-show rehearsal remain before demo capture/submission. Existing automated suite remains 22 passing tests from the implementation checkpoint.

## October 29 — three-door finale
- Added a separate deterministic Finale engine attached to trivia balances; Twitch feeds !door commands through the same viewer identity. First accepted ballot spends one tab, once; community earned progress is preserved. Ties and empty ballots require explicit selection.
- Added three manually staged door reveals, a small overlay clue strip, local curator previews/approvals, streamer finale controls, and a separate virtual bar television scene.
- Streamer/public snapshots omit unrevealed themes and all destination titles/files until chosen playback starts. Curator preparation is intentionally separate and local-only; no authenticated remote dashboard is claimed or exposed.
- Playback requires approval and an explicit Open winning door action. Media routes restrict playback to the active approved segment and version, support byte ranges, and deny access after stop/removal/end. Preview routes are for local curator review.
- Controls include pause/resume, skip, stop, emergency removal and end-show. Removing content stops the finale, revokes approval and refunds its affected ballots once. The bar polls at 250 ms and unloads media on stop, end or connection failure.
- User chose original silent demo segments. Generated three original 18-second MP4 animations with local FFmpeg, committed as assets; no third-party footage, media service or npm dependency. FFmpeg is optional for regeneration, not app startup.
- All 22 automated tests and syntax checks pass. Browser rehearsal verified previews, approval, staged reveals, one earned/spent tab selecting door 2, successful muted video playback, pause/resume, and natural end with TV unloaded. No browser console media errors. The bar fits a 1920 × 1080 viewport without scrolling/overflow.
- Restarted the app to load the finale. User reauthorized Twitch; server confirms Chat subscribed on woadi_. Live approvals, trivia-to-tab, !door vote, playback and natural ending were subsequently verified October 30 (see above). Demo flow is separate.
- Actual OBS bar-scene verification remains pending. Full runbook: FINALE_RUNBOOK.md. Preview: outputs/last-call-bar.jpg. AI discovery, remote moderation, companion and further branching remain deferred.

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
