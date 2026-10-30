# Last Call — Show Pack Studio

The manual Studio is ready. Optional OpenAI drafting is implemented and tested with simulated API responses; a real API request remains unverified because the user chose to configure AI later.

## Prepare without AI

1. Open http://localhost:3000/studio for the live show, or http://localhost:3000/studio?demo=1 for rehearsal. Check the mode badge before editing.
2. Start from **Load prepared Space Bar**, or **Load saved draft**. The prepared five-question draft is manually prepared, not AI-generated.
3. Review the five source cards. Edit the title, question, four distinct choices, correct answer, explanation, category and difficulty. Evidence must be copied from the selected source notes and name the correct choice. Read the source yourself: the app does not fetch links or automatically establish factual truth.
4. Uncheck **Include question** to exclude a question. Keep 1–5 questions. All five draft entries must remain valid so they can be saved and edited later.
5. **Save draft locally** preserves the draft in the ignored data folder. Live and rehearsal saves are separate. Saving does not change the current show; loading does not apply it.
6. **Use included questions** installs the selected questions and returns to controls. Review and **Approve pack** again. Applying never grants approval or starts a round.
7. Choose **25, 45, or 60 seconds** before starting trivia. The choice is locked during the show. For rehearsal, use fake answer buttons; live play requires Twitch chat subscribed.

Pack replacement is allowed only before trivia starts and before finale doors are revealed. Reset an active/completed show only when ready to clear its scores and approvals. **Use original trivia fallback** restores the original working pack with fresh approval required; the editor draft stays available.

The Studio and curator contain upcoming answers and surprises. Keep them off stream. Only the OBS overlay and bar belong on the broadcast.

## Configure AI later

Enter OPENAI_API_KEY directly in local .env yourself; never paste it into chat, a browser field, screenshots or a commit. OPENAI_MODEL optionally changes the default gpt-5-mini. Restart the server after changing configuration, then reconnect Twitch because connections and scores are in memory.

The AI button stays disabled without a key. When enabled, clicking it sends only the theme and five reference notes to the fixed OpenAI Responses endpoint. Changing the theme alone does not change the reference subject. Requests use structured output, store:false and a 90-second timeout; no SDK is installed. Failures retain the existing draft and display a sanitized error. Generated questions still require editing/review, application and explicit streamer approval. AI cannot start gameplay or approve playback.

Before claiming live AI functionality in the submission, generate one real draft, inspect every question against its source, apply it in rehearsal, approve it and play a round. Mock API tests are not evidence of a live generation.

## Verification checkpoint

31 automated tests pass, with source syntax checks. Browser rehearsal covered editing, excluding a question, saving, loading, applying a four-question pack, fresh approval, a 60-second round, scoring and stopping with tabs retained. Public question state omits private evidence and sources. No new dependencies were added; .env was not read or changed by these fixes.

References checked October 30, 2026: [OpenAI structured output](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini), [NASA planet sizes and locations](https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/), [NASA Mercury facts](https://science.nasa.gov/mercury/facts/).
