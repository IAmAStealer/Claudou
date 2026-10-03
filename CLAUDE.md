# Claudou

Claude is the owner of Claudou, like Bashou (~/Bashou). Inside this repo, work autonomously: decide, implement,
test and commit without asking first. Only touch files in this repo; anything outside it still needs the user's OK.

- A Claude Code mod in TypeScript, in `plugin/` (what users install): `.claude-plugin/plugin.json`,
  `hooks/hooks.json`, `hooks/register.tsx`, its tests in `plugin/tests/`. The rest of the repo is tooling.
  The engine's API: `vendor/claude-code.d.ts` (written by Claude Code; refresh it from a newer version with
  `tools/refresh_types.sh` and read the diff).
- Local notes (untracked): `bug_report`, `.idea`, `doc/JOURNAL.md`, `doc/PLAN.md`. Read `doc/JOURNAL.md` to get
  back up to speed; add a line there after each change. Design decisions so far: Bashou's doc/PLAN.md, "Claudou".
- **No npm dependencies, ever** (owner's rule): no `dependencies` in a package.json, no `npm install`. Tools come
  from Debian (`nodejs`) or are reviewed by the owner first (`typescript`, pinned). A test checks it, and a
  Claude Code hook blocks downloads (`~/.claude/hooks/no-external-downloads.py`).
- Checks: `claude plugin validate plugin`, `tsc -p .`, `claude plugin test plugin` (`harness/check.sh` runs them).
  Every bug fix gets a regression test; check a new test fails without its fix.
- Tests cover every element: every pet and form, every pose, every evolution, every achievement, every event
  hook, both surfaces (terminal and desktop), every message in English and French.
- English and French for everything a player reads; French is tutoiement.
- Commit subjects are short sentences in plain English (they become release notes). A release is a commit with
  a line `release: vX.Y.Z` and a `## vX.Y.Z — date` section in CHANGELOG.md.
- Pet art: show a preview (terminal and PNG) to the owner before committing a new sprite.
