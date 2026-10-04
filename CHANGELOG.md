# Changelog

Every release has a section here, written for players. CI refuses to tag a release without one
(`python3 tools/changelog.py v1.2.3` prints the section it will publish).

## v0.1.5 — 2026-10-04

- In the side column, your pet now sits at the bottom, near the prompt, with its speech bubble above it.

## v0.1.4 — 2026-10-04

- Choose your pet: the crab or one of Bashou's three starters (Star, Sprout, Pebble). New players are asked at
  first start; `/claudou start` changes it at any time and keeps your level and achievements.
- Star, Sprout and Pebble each have 11 forms, all the way to level 25: a Nebula, a Black hole, a Galaxy and the
  Universe; an Old oak, a Blossom tree, a Forest and the World tree; Amethyst, Ruby and Diamond golems, and a
  Pet rock in its box.
- With Bashou installed, the pets you unlocked there show up in `/claudou pets` and `swap`.
- Your pet evolves more slowly: its forms are spread over the 25 levels.
- Choose where it sits: above the prompt or in a column beside the conversation (`/claudou layout`).
  Its speech bubble now stays 10 seconds.
- New commands: `level`, `achievements` (all 25, with how to get the missing ones), `evolve`, `share`,
  `config`, `reset` and `version`. `/claudou swap` alone now lets you pick a form; `swap new` goes back to the newest.

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
