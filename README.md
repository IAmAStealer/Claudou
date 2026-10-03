# Claudou

[![CI](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/IAmAStealer/Claudou/badge)](https://scorecard.dev/viewer/?uri=github.com/IAmAStealer/Claudou)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A little pixel-art pet that lives in a side pane of [Claude Code](https://claude.com/claude-code) and grows
while you work with it.

It grows with **25 achievements**, one level each:

- **8 Claude Code features**, each with a tip on how to try it: plan mode, subagents (and three at once),
  skills, `/compact`, a `CLAUDE.md` or memory file, an MCP tool, resuming a session.
- **17 growth goals**: days you used Claude Code, days in a row, tokens, prompts and sessions.

Your pet starts as a tiny Crabling and grows into bigger and stranger crabs: a pea crab hiding in a mussel,
a hermit crab, a boxer crab with its pom-poms, a fiddler crab waving its giant claw, a horned ghost crab, a
Halloween moon crab, a coconut crab on its coconut, a Tasmanian giant crab, a Japanese spider crab… and then,
since everything ends up a crab, one last form.

## Install

In Claude Code:

```
/plugin marketplace add IAmAStealer/Claudou
/plugin install claudou@claudou
```

Your crab opens in a side pane by itself when the window is wide enough (144 columns); otherwise type
`/claudou`. It speaks English or French: choose in `/config` (Claudou, Language).

Coming next: good work habits (tests, reviewed diffs, small commits), other starters than crabs, and
[Bashou](https://github.com/IAmAStealer/Bashou)'s pets in Claude Code with `bashou claude on`.

## Safe by design

- **No dependencies**: not a single npm package. CI refuses any `package.json` dependency, lockfile or import.
- **Counters only, nothing sent**: the mod may only use the hooks and engine calls listed in
  `tools/capabilities.json`; CI reads what Claude Code itself sees in the code and refuses anything else.
- Secret scanning, CodeQL, OpenSSF Scorecard, protected `main` branch and release tags.
  Report a security problem privately: [SECURITY.md](.github/SECURITY.md).

MIT license.
