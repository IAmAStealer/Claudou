---
name: release
description: Release a new version of Claudou - CHANGELOG section, plugin.json version, the release commit line, push and watch CI until the GitHub release exists. Use when the owner asks to release or push a version.
---

1. Everything committed and the checks pass: `harness/check.sh full` (or `claude plugin validate plugin`,
   `tsc -p .`, `claude plugin test plugin`, `python3 tools/no_dependencies.py`).
2. `CHANGELOG.md`: a section `## vX.Y.Z — YYYY-MM-DD` (today), written for players, plain sentences.
   `python3 tools/changelog.py vX.Y.Z` must print it.
3. `plugin/.claude-plugin/plugin.json`: `"version": "X.Y.Z"` (CI refuses a release whose version differs).
4. Commit with a body line exactly `release: vX.Y.Z` (on its own line: CI's regex is
   `^release: vX.Y.Z$`; without it, no tag).
5. Push only when the owner asked for the release. Then watch: `gh run watch <id> --exit-status`, and check
   `git ls-remote --tags origin vX.Y.Z` and `gh release view vX.Y.Z`.
6. Add a line to `doc/JOURNAL.md`.
