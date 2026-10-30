# Last Call — short demo rehearsal

## Before capture

- Keep the server running; reconnect Twitch if it restarted. Do not display .env, tokens, private browser tabs or terminal chat logs.
- Use the live URLs, not links containing demo=1 or /demo.
- OBS Gameplay scene: /overlay at 720 × 520 over the game. Last Call scene: /bar at 1920 × 1080. Both scenes have been accepted by the user in OBS.
- Reset the previous completed show only when ready to clear its scores and approvals. Review/approve the pack again; have the curator preview and approve all three segments again. Keep preparation and upcoming answers off stream.
- Have jaydubs1980 ready in Twitch chat before starting the question. Keep one operator on the dashboard so controls and test commands stay in sync. Choose a 60-second answer window for a less rushed check.
- If demonstrating the Studio, edit/save/apply before approving the pack. Check the reviewed answer rather than assuming the original answer sequence. Applying clears approval. See STUDIO_RUNBOOK.md.

## Rehearsal sequence

1. Introduce the format: “The streamer sets the stage. The community writes the ending.” Show Codex's contribution using a prepared, non-sensitive project view before returning to the show.
2. On Gameplay, start question one. jaydubs1980 sends !answer B while its answer window is open. Reveal, and show the silent +1 TAB reward and shared progress.
3. Reveal the three doors manually as part of the demonstration. Explain that themes and clues appear while the destinations remain a surprise. For an actual full stream, spread these reveals throughout gameplay.
4. Stop trivia without clearing tabs. Switch OBS to Last Call, then open tab voting from the dashboard.
5. jaydubs1980 sends !door 2. Show one tab committed to door two; the community's earned progress stays intact.
6. Close voting and open the winning door. Let the original silent segment play; briefly demonstrate pause/resume if desired. The segment ends the show naturally after 18 seconds of playback.
7. Finish on the end screen. Explain that the curator approves playback, and the streamer can pause, skip, stop, remove a segment or end the show.

Aim for 2 minutes 30 seconds. The [official rules](https://twitchcon-codex.devpost.com/rules), checked October 30, call for a video below three minutes with footage of real Twitch functionality and building with Codex. The user reports the rehearsal went well. See SUBMISSION_CHECKLIST.md for capture and delivery.

## What to say accurately

- Working today: Twitch OAuth/EventSub, approved trivia, first-answer scoring, tabs/shared goals, silent rewards, staged doors, earned-tab voting and approved playback controls.
- The three clips are original silent demo animations. They are not discovered videos or examples of AI video analysis.
- The manual Show Pack Studio works: edit, exclude, save/load, review references and apply with fresh approval. Optional AI drafting is implemented but real generation is unverified until a local API key is configured and tested. AI discovery, remote moderator access and companion participation remain future work.
- No speed bonus or paid-support advantage affects trivia scoring. Balances and approvals are session-only; restarting clears them.

## Done when

The same live show moves from gameplay trivia to the OBS bar, records the real Twitch ballot, plays only its approved winner, and ends cleanly. Confirm text readability and webcam/HUD placement during the run. Do not start streaming or recording until the user explicitly asks to capture or broadcast.
