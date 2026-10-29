# Last Call — morning handoff

Latest update October 29: the P0 three-door demo is implemented. Read FINALE_RUNBOOK.md for the current flow; the original plan below is historical. 22 tests pass. The original silent segments, local approvals, staged reveals, tab vote, virtual bar, playback controls and natural end passed automated/browser rehearsal. Live Twitch is reconnected. Next required verification: user approves live segments, earns a trivia tab, casts a live !door ballot, and checks the bar scene in OBS. AI/moderator/companion work stays deferred.

Prepared October 25, 2026. Resume development on October 26; no overnight implementation or scheduled wakeup was requested.

Update October 29: compact overlay, silent tab rewards, and non-destructive Stop Trivia are implemented and verified in the browser rehearsal. Fourteen tests and source syntax checks pass. The original status table below is historical where superseded: trivia Stop is now complete; actual OBS-over-gameplay and live Twitch rechecks are still pending. See DEVELOPMENT.md for evidence. Next milestone remains the P0 three-door finale once those live checks pass.

## Current brief

`BUILD_BRIEF.md` preserves the user's updated product requirements verbatim and takes precedence over earlier scope notes.

Last Call is an AI-assisted interactive show engine for Twitch.

**Tagline:** The streamer sets the stage. The community writes the ending.

**Design philosophy:** Automate the work. Amplify the personality.

The finale is now a staged three-door mystery with human-approved surprises, rather than a simple poll listing video destinations. AI supports preparation and recommendations; gameplay and playback remain deterministic. Streamer-facing views must not disclose prepared destinations before playback. Themes and clues may be visible.

## Verified implementation and P0 gaps

| P0 requirement | Evidence and remaining work |
| --- | --- |
| Playable Twitch trivia | Live OAuth, EventSub, ping, answer ingestion, approval, reveal and scoring verified. One answer per viewer; no speed bonus. Full five-question completion tested automatically; full live rehearsal still due. |
| Tabs and shared progress | Live server showed jaydubs1980 with one tab and community total one. Balances are session-only; spending is not implemented. |
| Polished OBS overlay | Dedicated overlay exists; browser rehearsal verified. Actual OBS capture, compact sizing, and readability over gameplay still need checking. |
| Three doors and staged reveals | Not implemented. Reveal times must be manual or configurable, never hard-coded wall-clock times. |
| Finale with approved content | Not implemented. No media playback, content manifest, or playback approval boundary exists. |
| Community influence | Trivia participation works. Finale voting and tab debits are not implemented. |
| Streamer controls | Trivia pause/resume, early reveal, next and reset exist. Reset destroys tabs; it is not an adequate stop control. Add non-destructive trivia stop and finale pause/skip/stop/remove/end-show controls. |

## First work in the morning

1. Inspect the current files and Git state before changing anything. Preserve the working native Node/Twitch architecture and approval gate.
2. Run `npm.cmd test` and `npm.cmd run check`. Evening check: ten tests passed; all source syntax checks and Git whitespace checks passed.
3. Start `npm.cmd start` from this workspace if no server is running. The app was unreachable at the evening check; no restart was attempted. Reauthorize Twitch in the browser after startup. Never print or change .env or tokens.
4. Finish trivia stabilization: stop without erasing earned tabs, test that stopped rounds reject answers, and run the full five-question flow with an alternate Twitch account.
5. Check the overlay in OBS over real gameplay; tune its size and contrast so it stays unobtrusive. Keep all streamer-facing audio silent.
6. Implement the smallest three-door finale below, then rehearse a complete show before adding P1 features.

## Proposed smallest three-door finale

- Prepare exactly three theme/clue cards and one short, permissioned or original clip per door. A designated human curator explicitly approves each item before it can be selected. Actual media and permission evidence still need to be supplied or verified; do not invent links or claim content analysis.
- Use a local curated manifest for P0. Keep the preparation step separate from streamer controls. This is not the remote moderator dashboard or an AI discovery service.
- Reveal door one, two and three with manual controls during trivia. All three are revealed before the final ballot. Themes and teasers can build anticipation without exposing titles, URLs, thumbnails, or destination metadata.
- Keep private content metadata server-side; streamer/viewer APIs return door identifiers, approved clues and reveal state. Disclose a playback destination only when the chosen approved segment begins. Do not rely on hiding URLs with CSS.
- Proposed simplest ballot: `!door 1`, `!door 2`, or `!door 3`; one accepted ballot costs one earned tab, maximum one ballot per viewer. Check eligibility, debit and record atomically; deduplicate Twitch events. Shared earned progress stays separate from spendable balances. This rule is a proposal, not existing behavior.
- Let the streamer open and close voting. A tie is resolved by streamer selection among tied doors; no votes produces an explicit manual choice. Never select unapproved content or autoplay merely because AI recommended it.
- Play the winning approved clip in the virtual bar's television area. Provide immediate pause, skip, stop, emergency removal and end-show. Removing or invalidating the current item must stop playback. Keep P0 to one segment with a clear end screen; subsequent branching is deferred.
- Test reveal order, no pre-playback destination leaks, approval enforcement, insufficient tabs, duplicate ballots/events, closed voting, ties, no-vote fallback, and emergency controls. Verify rehearsal stays isolated from live data.

## Scope held for later

- P1, only after P0 is stable: AI theme/trivia preparation with reliable factual sources, metadata-based rabbit-hole recommendations, a simple approval queue, distinct moderator/streamer views, customizable visual celebrations.
- P2: secure remote access for dollfacevampyra, viewer submissions, automated video-content analysis, sophisticated branching, co-stream formats and external clipping integrations.
- No public exposure of this local dashboard. Future remote access needs an authenticated backend with role-based authorization; possession of an unlisted URL is insufficient.
- Recommendations are candidates, never playback commands. Do not claim to have watched or analyzed media unless that actually happened. Public playback always requires human approval and suitable permissions.
- Paid support never changes trivia scoring. Themes and celebrations should support identities beyond alcohol imagery.

## Files and history

- `src/game.mjs`: deterministic rounds, answer windows, approval and tabs.
- `src/twitch.mjs`: OAuth, EventSub, deduplication and gameplay callback.
- `src/app.mjs`: local HTTP routes, control boundaries, producer/public snapshots.
- `src/public/`: dashboard, overlay and rehearsal client.
- `test/`: ten automated tests covering core behavior and request boundaries.
- `README.md`: Windows startup and play instructions.
- `DEVELOPMENT.md`: work log; `BUILD_BRIEF.md`: current user brief.
- Baseline: `9dfd0cd`; playable trivia: `9372a29`; live scoring verification: `8ed2b98`.

Scores and OAuth tokens currently disappear on restart. No recovery or secure persistence has been added. Current checks do not establish that an overnight session survives or that an OBS scene has been configured.
