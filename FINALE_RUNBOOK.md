# Three Doors / Last Call — demo runbook

## Pages

| Purpose | Live | Isolated rehearsal |
| --- | --- | --- |
| Streamer controls | http://localhost:3000/ | http://localhost:3000/demo |
| Curator preparation, keep off stream | http://localhost:3000/curate | http://localhost:3000/curate?demo=1 |
| Trivia OBS source, 720 × 520 | http://localhost:3000/overlay | http://localhost:3000/overlay?demo=1 |
| Virtual bar OBS source, 1920 × 1080 | http://localhost:3000/bar | http://localhost:3000/bar?demo=1 |

The curator page reveals destinations. Streamer and audience pages show only revealed themes/clues until the chosen segment starts. This is a local preparation workflow, not authenticated remote moderator access. Keep the backend on loopback.

## Short show rehearsal

1. Connect Twitch on the live dashboard. For offline testing use only the rehearsal URLs instead.
2. In the matching curator page, preview each of the three original silent demo segments and explicitly approve each one. Live and rehearsal approvals are separate. Resetting the show clears approvals.
3. In streamer controls, review and approve the trivia pack. Start trivia; have another Twitch account send `!answer B` for question one. Reveal the answer to award a tab. In rehearsal use Guest 1 and the !answer B button.
4. Reveal the mystery doors one at a time during the show using **Reveal next door**. You decide the timing. The trivia overlay shows a small clue strip after the first reveal.
5. Finish trivia or use **Stop Trivia · keep tabs**. After all three doors are revealed and approved, click **Open tab voting**.
6. The viewer sends `!door 1`, `!door 2`, or `!door 3`. One accepted ballot costs one earned tab; only one ballot per viewer. In rehearsal, use the selected Guest and a door button.
7. Click **Close voting**. A unique leader is selected. If tied, choose among the tied doors; with no ballots, choose any approved door explicitly. Nothing plays until you click **Open winning door**.
8. Switch OBS to the virtual bar scene. Open the winning door. The destination is disclosed and plays on the television for the first time in streamer/audience views.
9. Check **Pause TV**, **Resume TV**, **Skip segment**, **Stop TV**, and **End show**. The original segments are silent and 18 seconds long. A completed segment ends the show automatically; no automatic chain or endless playback occurs.

## Emergency controls and tab accounting

- **Stop TV** unloads the segment in the bar view on its next state update (250 ms polling while connected). It does not reset trivia scores. It is final for this finale.
- **Skip segment** ends the one-segment demo. **End show** also ends the finale immediately.
- **Emergency remove door N** revokes that segment's approval and stops the finale. Ballots for the removed door are voided and those viewers receive their spent tab back, once. Other spent ballots remain spent. A removed door cannot be reapproved in the same show.
- A tab is charged only for an accepted ballot. Repeated commands, duplicate EventSub events, closed voting and insufficient balances never charge a tab.
- The community meter counts all tabs earned. Leaderboard tabs are remaining spendable balances; spending does not lower the shared earned total.
- Reset clears trivia balances, the finale, ballots and all approvals. Scores and Twitch tokens remain session-only; restarting loses them.
- Playback is muted. If the browser blocks it, the bar displays a click-to-start message. Media errors pause the finale and display an error; Resume retries, or use Skip/Stop/End.
- If the bar loses the server connection, it unloads the TV until connection returns. The authoritative server clock continues; after a long outage the segment may already have ended.

## What is bundled

Three original procedural MP4 animations were created locally for this demo, with no audio and no third-party video footage. They are deliberate placeholders for approved surprises, not AI-discovered or analyzed videos. Their titles and destinations are visible in curator preparation only until playback.

The generated MP4s live in src/media and run with native Node plus the browser. No new npm dependency or external video service is used. scripts/generate-demo-media.mjs optionally recreates them with the already-installed FFmpeg; FFmpeg is not required to run the app. Do not replace approved media mid-show: stop, restart, and review/approve the new files before the next show.

## Verification and remaining live check

- 22 automated tests pass: staged reveals, approval boundaries, destination hiding, voting eligibility, no double spending, ties/no votes, pause/resume, natural ending, emergency removal/refunds, protected media ranges, reset, and rehearsal isolation.
- Browser rehearsal verified all three original previews, approvals, earning/spending a tab, selecting door 2, video decode/playback, pause/resume and automatic ending. The television unloaded after ending, with no console media errors. The bar fits a 1920 × 1080 browser viewport with no horizontal overflow or vertical scrolling.
- October 30 live verification: jaydubs1980 earned one trivia tab, spent it on !door 2, and the community earned total stayed at one. The selected approved segment played in live /bar and ended naturally, unloading the TV. Server confirmed ended, selected door two, one ballot and zero remaining viewer tabs. No browser media errors observed. The new bar scene in actual OBS still needs user confirmation.
- Remote moderation, AI discovery, viewer submissions, external embeds and companion participation remain deferred.
