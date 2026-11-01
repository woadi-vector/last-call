# Last Call — Devpost entry copy

Updated November 1, 2026. Overview and project details saved to the Devpost draft. Final submission has not been performed.

## Elevator pitch

Turn Twitch chat into part of the show: play trivia, earn tabs, and choose a mystery-door finale. Last Call keeps the streamer in control and gives the community a reason to stick around.

## Saved media

- Thumbnail: outputs/last-call-devpost-thumbnail.png (original generated promotional artwork).
- Three real app screenshots: finale playback, Studio editor, and trivia reveal/reward.
- Existing YouTube URL preserved: https://youtu.be/dAFXbf-RJAg
- Built with tags: node.js, javascript, html5, css3, twitch.

## Pending user information

- Repository URL (no remote configured in the local project).
- Learning and future Codex-use survey answers.
- Additional-info fields are filled in the browser but need the required fields completed before saving.
- User must review final terms and submission.

## Project story
## Inspiration

I wanted streaming to feel like hosting a night with the regulars again. My experience with Twitch bartending tutorials, themed trivia, tournaments, and spontaneous rabbit holes showed me that the memorable moments happen when chat helps shape the show.

Last Call turns that idea into a repeatable format: give viewers a small game while the streamer plays, then bring everyone together for a mystery finale.

## What it does

Viewers answer multiple-choice trivia directly in Twitch chat with !answer A, B, C, or D. Their first valid answer counts. Correct answers earn individual tabs and contribute to a shared community goal. A compact OBS overlay shows the question and a silent +1 TAB reward without adding distracting audio during gameplay.

As the show progresses, the streamer reveals three mystery-door clues. At Last Call, viewers spend one earned tab on a ballot with !door 1, 2, or 3. The streamer closes voting and explicitly opens the winning door in a separate virtual-bar OBS scene. Content must be reviewed and approved before it can play; destinations stay hidden from streamer and audience views until playback. Pause, skip, stop, emergency removal, and end-show controls keep the host in charge.

The Show Pack Studio lets the streamer edit questions, review source notes, exclude questions, save and reload local drafts, and apply a pack with fresh approval required. Answer windows can be set to 25, 45, or 60 seconds. A separate rehearsal room uses fake viewers and isolated scores.

## How I built it with Codex

I built the project in this Codex conversation, starting from a small Node.js Twitch starter. Codex helped inspect the starter, implement and debug gameplay, build the dashboard and OBS views, add the Studio, write automated tests, and prepare rehearsal runbooks. I directed the product, reviewed the experience, and tested it with my Twitch channel and a second viewer account.

The app uses native Node.js, JavaScript, HTML, and CSS with no third-party npm dependencies. Twitch OAuth connects the broadcaster; EventSub WebSocket delivers chat, and the Twitch API sends bot replies. Trivia and finale rules live in separate game engines so the show logic can evolve independently of Twitch messaging. OBS Browser Sources display the shared state.

The optional AI drafting path uses the OpenAI Responses API with structured output and supplied reference notes. It never auto-approves or launches a question. The manual Studio works today; a real AI generation remains unverified pending local API-key configuration.

## Challenges I ran into

Keeping the show fair and predictable mattered as much as making it look good. Duplicate chat events must not score or spend tabs twice. Stopping trivia must preserve earned tabs while cancelling an unrevealed round. Spending a viewer's tab must not reduce the community's earned total.

The finale also needed a real approval boundary: hiding a destination visually was not enough. Public state omits destinations before playback, and media access is limited to the active approved segment. Live and rehearsal data stay separate. Early live tests also showed how easy it was to miss a short answer window, which led to longer configurable windows and a clearer runbook.

## Accomplishments I'm proud of

We verified Twitch OAuth, bot replies, real chat answers, tab scoring, a door ballot using an earned tab, approved playback, and the natural end of the finale. The project has 31 passing automated tests, and I checked both OBS scenes and rehearsed the complete experience.

I'm especially proud that it feels like one show: the forest-green and gold bar, quiet rewards, mystery clues, and community choice all serve the same atmosphere.

## What I learned

A live interaction needs to be easy for the host as well as the viewer. Clear modes, deliberate approval, forgiving timing, and immediate controls make a small feature set more useful. Working with Codex let me move from product ideas to a tested show, then refine the details using real Twitch behavior.

## What's next for Last Call

Next steps are verifying real AI drafting, expanding streamer-approved content, and improving production shortcuts. Longer-term ideas include producer access, customizable celebrations, and a mobile companion using the same viewer identity and tabs.

The submitted prototype runs locally. Scores and Twitch connections are session-only. The three bundled finale clips are original silent demo animations, not AI-discovered videos. Remote moderation, subscription celebrations, and companion participation are future work.

**The streamer sets the stage. The community writes the ending.**

## Judge-facing answers

# Technology requirement

OpenAI Codex was the coding collaborator for this project, built in the main Codex conversation. I directed the product and reviewed the result; Codex helped inspect the Node.js starter, implement and debug the Twitch integration, separate trivia and finale game engines, create the dashboard, OBS views and Show Pack Studio, write 31 automated tests, and prepare rehearsal documentation.

Twitch OAuth connects the broadcaster with chat read/write permissions. Twitch EventSub WebSocket delivers live chat events, including !answer A–D and !door 1–3; the Twitch API sends the !lastcall ping bot reply. An alternate viewer account was used to verify answers, scoring, tab spending, door voting and approved playback. OBS Studio displays the trivia overlay and virtual bar through Browser Sources.

The application uses native Node.js, JavaScript, HTML and CSS without third-party npm dependencies. Optional AI question drafting uses the OpenAI Responses API with structured output and supplied reference notes, followed by human review and approval. Real AI drafting has not yet been verified with a configured API key; the manual Studio and prepared pack work without it. The bundled finale clips are original silent demo animations, not AI-discovered videos.

# Streamer and community use

Before the stream, the host uses Show Pack Studio to review source notes and edit or exclude questions, applies the pack, and explicitly approves it. A local curator previews and approves all three finale segments. The host selects a 25-, 45- or 60-second answer window and adds the compact trivia overlay and separate virtual-bar scene to OBS.

During gameplay, viewers answer in Twitch chat with !answer A, B, C or D. The first valid answer per viewer counts; correct answers earn one tab at reveal and increase a shared community total. Silent visual rewards acknowledge participation. The host can pause, resume, reveal early or stop trivia while retaining earned tabs.

The host reveals three mystery-door clues over the show. At Last Call, after trivia finishes or stops, voting opens. A viewer spends one earned tab with !door 1, 2 or 3; only one accepted ballot counts, and spending does not lower the community earned total. The host closes voting, resolves ties or no-vote cases explicitly, and opens the approved winner in the bar scene. Playback can be paused, skipped, stopped or removed, and the short segment ends the show naturally.

A separate rehearsal room offers fake viewers and isolated scores. This prototype runs locally on the streaming PC; scores, approvals and Twitch connections are session-only. No remote moderator login or mobile companion is claimed.

# Main build session

01a1751b-7eb3-7703-9da9-c5dd4eb0d4e1

