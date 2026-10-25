# LAST CALL — Updated Product Requirements & Build Priorities
**Codex x TwitchCon Hackathon | October 25, 2026**

## Product vision

**Last Call is an AI-assisted interactive show engine for Twitch.**

**Tagline:** The streamer sets the stage. The community writes the ending.

**Design philosophy:** Automate the work. Amplify the personality.

Last Call helps streamers create entertaining, interactive shows without having to manage every production detail themselves.

It combines AI-prepared trivia, viewer participation, community celebrations, and an end-of-stream mystery experience called Last Call.

The product is inspired by the creator's real experience hosting Twitch bartending tutorials, themed trivia nights, sponsored tournaments, and spontaneous internet rabbit-hole streams.

The primary goal is to make streams easier to produce, more participatory, and more memorable.

## Current implementation status

The project already has:

- Registered Twitch developer application.
- Working OAuth authentication.
- Working EventSub connection.
- Verified live Twitch chat messages.
- Verified Twitch chat bot responses.
- Existing automated tests passing.

The developer has also begun implementing questions and chat answers in Codex Desktop.

**Before making changes, inspect the actual repository and determine what has already been implemented. Do not overwrite working functionality.**

## The core experience

### 1. Show Pack Studio

Before going live, the streamer selects a show theme.

AI assists with preparing:

- Trivia questions and verified answers.
- Appropriate difficulty levels.
- Trivia categories.
- Three potential mystery-door themes.
- Suggested rabbit-hole content.
- Short descriptions and teasers.

The streamer reviews and approves the Show Pack.

Questions must not go live without approval.

AI-generated facts should be checked against reliable sources. Question review must account for ambiguous or outdated answers.

### 2. Live trivia

During normal gaming, Last Call runs lightweight trivia through Twitch chat.

Requirements:

- Questions appear in an unobtrusive OBS Browser Source.
- Chat answers are accepted during a defined answer window.
- Each viewer receives one scored answer per question.
- No speed-based scoring advantage.
- Correct answers earn tabs.
- Tabs accumulate per viewer.
- Community contributions accumulate toward shared goals.
- Streamer-facing sounds must remain silent during gameplay.
- The streamer can pause or stop trivia immediately.

The interface must remain readable without obscuring gameplay.

### 3. The Three Mystery Doors

Last Call has three mystery doors that appear progressively throughout the stream.

Each door represents a potential rabbit-hole theme.

Viewers can influence the themes through simple tab-based voting.

Suggested progression:

- Early stream: First door revealed.
- Midstream: Second door revealed.
- Late stream: Third door revealed.
- Finale: The community selects the door to open.

Reveal timing should be configurable or manually controlled rather than dependent on fixed clock times.

The streamer's view may show themes and clues but must not reveal the prepared video destinations.

### 4. AI-assisted rabbit-hole discovery

This is the most important new refinement.

AI serves as a discovery and recommendation assistant.

It should be capable of:

- Suggesting relevant videos from a chosen theme.
- Organizing viewer-submitted video links.
- Inspecting available titles, descriptions, and other permitted metadata.
- Identifying interesting connections between approved items.
- Proposing several possible rabbit-hole paths.
- Ranking suggestions for relevance, variety, and likely entertainment value.

AI recommendations are **candidates, never automatic playback instructions**.

Do not claim to have analyzed a video's actual content unless the system has genuinely accessed and analyzed it.

Avoid generating fictional video links.

Any proposed playback must respect copyright, creator permission, privacy, and Twitch content requirements.

Prefer explicitly permissioned creator clips and suitable original/licensed material.

### 5. Remote moderator dashboard

The streamer's longtime moderator, Twitch user `dollfacevampyra`, is the intended first moderator.

The moderator must eventually be able to operate remotely from her own computer without accessing the streamer's Twitch credentials or OBS machine.

Proposed functionality:

- View pending viewer submissions.
- Review AI-discovered video recommendations.
- Open and inspect proposed content.
- Approve or reject content.
- Assign approved items to mystery-door themes.
- Arrange possible sequences.
- Remove content from the approved queue.
- Prepare surprises without revealing them to the streamer.

Remote access requires authenticated, role-based permissions and a secure network-accessible backend.

Do not expose the local development dashboard or tokens publicly.

The moderator should be able to review content asynchronously because she also plays games during the stream.

### 6. The Last Call finale

At the end of gaming, the streamer transitions to a customizable virtual bar scene.

The audience's tabs influence which mystery door opens.

The approved content begins playing on the virtual television.

The streamer sees the destination for the first time alongside the audience.

After a segment ends, viewers can influence the next destination using tabs.

The system must offer choices only from approved content.

The streamer must retain:

- Immediate pause.
- Skip.
- Stop.
- Emergency removal of content.
- End-show control.

The intended experience is a surprising, funny, community-directed rabbit hole.

It should have a natural ending, not force endless playback.

### 7. Community celebrations

Subscriptions, gifted subscriptions, and community milestones should trigger customizable viewer-facing celebrations.

Example:

“woadi_ invited dollfacevampyra to the party! Round's on woadi_!”

A themed drink slides across the virtual bar.

Streamer-facing audio alerts must be suppressible during gameplay.

Support different visual themes and celebration styles rather than permanently tying the product to alcohol imagery.

Paid support should not create an unfair competitive advantage in trivia.

## Architecture principles

- Preserve the existing Node.js/Twitch integration where practical.
- Keep live gameplay and playback deterministic and reliable.
- Use AI primarily for preparation, recommendation, and review assistance.
- Require human approval before public playback.
- Separate streamer, moderator, and viewer permissions.
- Keep unrevealed content hidden from streamer-facing interfaces.
- Design for clean OBS Browser Source integration.
- Never expose OAuth secrets or tokens in client-side code.
- Maintain tests for gameplay state, authorization, and content-approval boundaries.

## Hackathon priorities

**P0 — Required for the demo**

1. Finish and verify the playable Twitch trivia loop.
2. Add tabs and shared progress.
3. Build a polished OBS trivia overlay.
4. Implement three mystery doors and staged reveals.
5. Implement a simple Last Call finale using pre-approved content.
6. Demonstrate community influence over the finale.
7. Add streamer pause, skip, and stop controls.

**P1 — If P0 is stable**

1. AI-assisted theme and trivia preparation.
2. AI-generated rabbit-hole recommendations.
3. A simple content-approval queue.
4. Distinct moderator and streamer views.
5. Customizable celebration graphics.

**P2 — Post-hackathon or stretch**

1. Secure remote moderator access.
2. Viewer-submitted video workflow.
3. Automated video-content analysis.
4. Sophisticated multi-step rabbit-hole generation.
5. Co-stream and chat-vs-chat formats.
6. Multi-game Jackbox-style experiences.
7. Integration with external VOD clipping software.

## Immediate instructions for Codex

1. Inspect the current project and summarize which P0 items already work.
2. Run existing tests and check the application.
3. Continue the current playable-trivia milestone.
4. Do not begin the remote moderator dashboard or full AI video discovery workflow yet.
5. Preserve the frozen scope and avoid unnecessary dependencies.
6. Maintain clear git history and development documentation for the hackathon submission.
7. Do not modify or expose `.env`, OAuth secrets, or private tokens.
8. After stabilizing trivia, propose the smallest implementation of the three-door finale.

**Success criterion**

A streamer can run trivia during gameplay, viewers earn tabs, three mystery doors build anticipation, and the audience uses its earned influence to select an approved surprise that the streamer experiences live.

The demo should feel like a real Twitch show, not merely a collection of technical features.