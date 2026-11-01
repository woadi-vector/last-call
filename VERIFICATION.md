# Last Call — observable results

## Live Twitch verification, October 30, 2026

Using broadcaster woadi_ and alternate viewer jaydubs1980:

| Observation | Result |
| --- | --- |
| Viewer earned tabs before voting | 1 |
| Accepted ballot | 1, for door 2 |
| Viewer spendable tabs after voting | 0 |
| Community earned total after voting | 1 |
| Approved winner | Deep Blue Signals, original silent 18-second demo segment |
| Completion | Browser video playback observed; finale ended naturally and unloaded its media source |

This is one verified live interaction, not a large audience study. The recorded checks do not establish Twitch latency, concurrent-viewer capacity, a 90-minute rehearsal, or a count of duplicate Twitch events. The user subsequently confirmed both OBS scenes and a full rehearsal. DEVELOPMENT.md preserves the original verification notes.

## Reproduce an isolated local HTTP rehearsal

With Node.js 22 or newer, from the repository folder:

```powershell
node scripts/rehearse-evidence.mjs
```

No credentials, .env, installed npm dependencies or running Last Call server are required. The script creates a separate ephemeral loopback server with fresh game state and one synthetic viewer. It takes about 18 seconds plus local request overhead because it waits through the segment's real-time interval. It asserts each result, exits nonzero on failure and writes outputs/rehearsal-evidence.json (ignored by Git).

Observed November 1, 2026, on Node v24.22.1:

| Step | Observed result |
| --- | --- |
| Submit the same viewer's correct answer 10 times | 1 accepted, 9 rejected; 1 tab awarded at reveal |
| Submit a correct answer to the next question, then stop before reveal | 1 earned tab retained; community total 1; pending answers cleared |
| Submit the same viewer's door-2 ballot 10 times | 1 accepted, 9 rejected; 1 ballot; viewer balance 0; community earned total 1 |
| Before explicit playback | Selected door 2, no playback destination in public state |
| Serve active approved media | HTTP 206 with the requested 100 bytes |
| Wait through the configured 18-second segment interval | Finale ended; public playback removed; media access denied with HTTP 403 |
| Compare the separate live game before/after | Unchanged |

The checked-in raw record is [evidence/rehearsal-local.json](evidence/rehearsal-local.json). This script is an HTTP/state correctness check: it does not connect to Twitch, decode video in a browser, measure Twitch/network latency, or simulate a crowd. Browser decoding and real Twitch participation are supported by the separately documented live verification above.

## Other evidence and limits

The automated suite has 31 tests covering game rules, approvals, duplicate handling, media access, isolation and Studio validation. Run npm test and npm run check for those checks. Test count is not a usage metric.

The creator recalls hosting Saturday-night trivia at 8 PM, usually with around 30–40 viewers. That is historical context from the creator's recollection, not measured Last Call adoption or a claim derived from retained Twitch analytics.

The manual Show Pack Studio works. Optional AI drafting is implemented but real generation still awaits local API configuration and verification. The bundled finale media are original silent demo animations. No AI discovery, remote moderation, subscription celebration or companion functionality is claimed.
