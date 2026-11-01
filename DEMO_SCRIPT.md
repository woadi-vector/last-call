# Last Call — click-and-say demo script

Target: about 2 minutes 40 seconds, with room to finish below three minutes. Rehearse first. This guide does not start recording or broadcasting.

## Set the desk before recording

Keep these private operator tabs open:

- Controls: http://localhost:3000/
- Studio: http://localhost:3000/studio
- Curator: http://localhost:3000/curate
- Twitch chat signed in as **jaydubs1980** on another browser/device. The connected broadcaster **woadi_** cannot earn tabs because it is also the bot account.

Use the existing OBS scenes: Gameplay has http://localhost:3000/overlay at 720 × 520; Last Call has http://localhost:3000/bar at 1920 × 1080. Your scene names may differ. Keep the controls and curator out of those sources. Capture your microphone for narration; the app and bundled segments are silent.

1. On Controls, confirm **Chat subscribed**. If disconnected, **Connect Twitch** and authorize the broadcaster.
2. If the previous show has started or ended, click **Reset show & scores** only when ready to erase its tabs and approvals. Reset BEFORE preparing approvals.
3. For a predictable recording, open Studio and click **Use original trivia fallback**. This preserves the editor draft while installing the original pack. Its first question is “Which planet is known as the Red Planet?” Correct answer: **B — Mars**. If you use a custom pack instead, replace the answer command in this script with its reviewed correct answer.
4. On Controls, set **Answer window → 60 seconds**. Read the pack review, then **Approve pack**. Do not start yet.
5. On Curator, preview each clip. Click **Approve door 1 after review**, **Approve door 2 after review**, and **Approve door 3 after review**. Check all three are approved. Return to Controls.
6. Prepare one safe Codex view showing this project’s implementation or test result. Keep secrets, private tabs, terminal chat logs and unrelated conversations out of the capture. Prepare a brief Studio view of its heading/theme area, with no expanded question answers or curator destinations.
7. Put Controls where you can reach both trivia and finale controls. Have `!answer B` and `!door 2` ready in the alternate account’s chat box; send each only at its cue. A helper can send them, or you can use your phone.

## Timed take: what appears, what to click, what to say

Times are targets. Advance on the visible result, not merely on the clock. The private controls are clicked off the recorded view. Use a deliberate brief screen switch for Codex and Studio, then return to OBS program output.

| Time | On the recording | Your click/action | Say this |
| --- | --- | --- | --- |
| 0:00–0:15 | Gameplay with the trivia overlay waiting | Begin narration. Leave trivia unstarted. | “This is Last Call. It gives chat something fun to do while I keep playing—and lets the community help choose how the stream ends.” |
| 0:15–0:30 | Safe Codex project view | Show the implementation or tests briefly. No scrolling through credentials or logs. | “I built this with Codex: Twitch chat integration, trivia scoring, the OBS overlay, and a finale with approval and playback controls.” |
| 0:30–0:45 | Studio heading/theme area | Show the prepared-draft label and editor introduction. Do not click AI drafting for this take. | “The Studio lets me prepare and edit questions before the show. I review the sources and answers, choose what stays, and approve the pack.” |
| 0:45–1:00 | Gameplay / trivia overlay | Privately click **Start trivia ↗**. Check question one appears. | “Now we’re using real Twitch chat. Viewers answer A, B, C, or D. Their first valid answer counts, and every correct answer earns one tab.” |
| 1:00–1:12 | Question and answer count | From **jaydubs1980**, send **!answer B**. Wait until Controls shows **1 answer locked**. | “Here’s an answer coming in from chat. I can pause the round or reveal whenever I’m ready.” |
| 1:12–1:27 | Correct answer, silent +1 TAB reward, community meter | Privately click **Reveal answer**. Stay on the overlay long enough to see the reward. | “Mars is correct. That’s one tab for the viewer, and one toward the community goal. The reward is visual, so it doesn’t interrupt my game audio.” |
| 1:27–1:42 | Three door clues appearing in the overlay | Privately click **Reveal next door** three times, waiting for each reveal. Then **■ Stop Trivia · keep tabs**. | “During a full stream, I’d reveal these clues over time. For this short demo, here are all three. Stopping trivia keeps the tabs everyone already earned.” |
| 1:42–1:58 | Switch OBS to Last Call / bar scene | Privately click **Open tab voting**. From **jaydubs1980**, send **!door 2**. Wait for door two to show one vote. | “It’s Last Call. One earned tab buys one ballot. This viewer chooses door two. Their tab is spent, while the community’s earned total stays intact.” |
| 1:58–2:10 | Bar, door two selected | Privately click **Close voting**. Check door two is selected. Then **Open winning door**. | “I close the vote and open the winner. The destination stays hidden until playback, and only approved content can play.” |
| 2:10–2:30 | Winning segment plays on the bar television, then ends | Let the 18-second segment finish naturally. Avoid Stop/Skip during this take. | “These are original silent demo animations. The streamer can pause, skip, stop, or remove a segment. For this take, we’ll let it finish naturally.” Then leave a short pause so viewers see it. |
| 2:30–2:40 | Natural end screen | Hold the end screen. | “That’s Last Call. The streamer sets the stage. The community writes the ending.” |

Do not describe the Studio demonstration as live AI generation. Optional AI drafting is implemented, but a real configured generation has not yet been verified. AI video discovery, remote moderation and companion participation are future work.

## Rehearse without the recording pressure

First walk through the same actions in the isolated rehearsal room:

1. Use http://localhost:3000/demo, http://localhost:3000/studio?demo=1 and http://localhost:3000/curate?demo=1. Reset only that rehearsal show, load the original fallback, set 60 seconds, review/approve the pack, preview/approve the three clips.
2. Open http://localhost:3000/overlay?demo=1 and http://localhost:3000/bar?demo=1 to watch the audience views. These are marked rehearsal; use live sources for the final Twitch recording.
3. Start trivia. Under **Be the chat**, select **Guest 1** and click **!answer B**. Reveal, confirm one tab, reveal all doors, then Stop Trivia keeping tabs.
4. Open tab voting. Under **Rehearse the vote**, click **!door 2** using the same Guest. Close voting and open the winning door. Confirm it ends and the TV unloads.
5. Read the spoken lines aloud while repeating the flow. Then do one live Twitch rehearsal with jaydubs1980 before the final take. Rehearsal approvals and scores do not transfer to live.

## If something misses its cue

- **No answer recorded:** check that the round is open, chat is subscribed, and the sender is the alternate account. Before the 60 seconds expire, click **Pause** while getting ready, then **Resume** and send. A paused round rejects answers. If the round already closed, use the next reviewed question or reset and prepare a fresh take; do not pretend an unrecorded answer earned a tab.
- **No tab/vote:** confirm the correct answer was revealed before stopping, voting is open, and the same viewer sent both commands. Wait for the visible vote before closing it.
- **Open tab voting disabled:** finish/stop trivia, reveal all three doors, and confirm all three curator approvals.
- **No votes or tied result:** Controls offers an explicit door choice. You can use it for recovery, but do not narrate it as a successful Twitch ballot. For the planned take, redo the live ballot so its result is clear.
- **Clip doesn’t play:** look for the bar’s click-to-start message. If playback fails, use **Stop TV** or **End show**, fix the issue, and rehearse again.
- **Timing runs long:** omit extra explanation or use a clean retake. Keep the real answer, earned tab, accepted vote and approved playback visible. Do not rush the chat commands.
- **Need another take:** reset first, then repeat pack and media approval. Do not restart the server between takes unless needed; that also clears the Twitch connection.

## Pass checklist

You saw a real Twitch answer, one earned tab, a ballot from that same viewer, door two selected, approved playback and a natural end. The recorded view included Codex’s build contribution, stayed under three minutes, and showed no secrets or curator surprises. Review the recording before any upload. Full emergency behavior is in FINALE_RUNBOOK.md; submission tasks are in SUBMISSION_CHECKLIST.md.
