# Changelog

Every release has a section here, written for players. CI refuses to tag a release without one
(`python3 tools/changelog.py v1.2.3` prints the section it will publish).

## v0.1.3 — 2026-10-04

- `/claudou on` and `/claudou off` show and hide your crab, as in Bashou.

## v0.1.2 — 2026-10-04

- No more side pane: your crab sits on the right, just above the prompt, and takes no room from your work.
- Now and then it says a tip in a speech bubble: the features you haven't tried, then Claude Code tricks.
- New commands: `/claudou hint`, `talk`, `stats`, `pets`, `swap <form>` (show any form you reached),
  `here` and `hide`. `/claudou` alone shows or hides your crab.

## v0.1.1 — 2026-10-04

- The side pane is small now (36 columns, 16 rows) and shows one tip at a time instead of all eight.
  You can still drag it bigger.

## v0.1.0 — 2026-10-04

- First release: a pixel-art crab lives in a side pane of Claude Code. Open it with `/claudou`.
- It grows through 11 forms, from a tiny Crabling to a Japanese spider crab, and then a Crab planet.
- 25 achievements make it grow: 8 Claude Code features to try (plan mode, subagents, skills, `/compact`,
  memory files, MCP tools, resuming a session), and days, streaks, tokens, prompts and sessions.
- The pane shows your crab moving, its level, the next form, your stats and the features left to try.
- English and French: choose in `/config`.
- Nothing leaves your machine: Claudou keeps counters only, in Claude Code's own store.
