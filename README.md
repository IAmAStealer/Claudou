# Claudou

[![CI](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/IAmAStealer/Claudou/badge)](https://scorecard.dev/viewer/?uri=github.com/IAmAStealer/Claudou)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A little pixel-art pet that lives in a side pane of [Claude Code](https://claude.com/claude-code) and grows
while you work with it.

It grows three ways:

- **Claude Code features**: plan mode, subagents, skills, hooks, MCP servers, `/compact`, `CLAUDE.md`, memory…
  Claudou teaches Claude Code itself, with tips and achievements.
- **Good work habits**: tests that run and pass, diffs you review, small commits, clear prompts.
- **Plain use**: sessions, prompts, finished turns.

Your pet starts as a tiny Crabling and grows into bigger and stranger crabs: a pea crab hiding in a mussel,
a hermit crab, a boxer crab with its pom-poms, a fiddler crab waving its giant claw, a horned ghost crab, a
decorator crab, a coconut crab, a Tasmanian giant crab, a Japanese spider crab… and then, since everything
ends up a crab, one last form.

You can also meet some of [Bashou](https://github.com/IAmAStealer/Bashou)'s pets there. Bashou players get their own pet in Claude Code with `bashou claude on`.

Status: just started. Nothing to install yet.

## Safe by design

- **No dependencies**: not a single npm package. CI refuses any `package.json` dependency, lockfile or import.
- **Counters only, nothing sent**: the mod may only use the hooks and engine calls listed in
  `tools/capabilities.json`; CI reads what Claude Code itself sees in the code and refuses anything else.
- Secret scanning, CodeQL, OpenSSF Scorecard, protected `main` branch and release tags.
  Report a security problem privately: [SECURITY.md](.github/SECURITY.md).

MIT license.
