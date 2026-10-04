# Claudou

[![CI](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml/badge.svg)](https://github.com/IAmAStealer/Claudou/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/IAmAStealer/Claudou/badge)](https://scorecard.dev/viewer/?uri=github.com/IAmAStealer/Claudou)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A Claude Code buddy: a little pixel-art pet that sits above the prompt of
[Claude Code](https://claude.com/claude-code), grows while you work with it, and teaches you Claude Code.
A virtual pet (tamagotchi-style terminal companion) installed as a plain Claude Code plugin, an alternative to
the `/buddy` companion that Claude Code no longer ships.

It grows with **25 achievements**, one level each:

- **8 Claude Code features**, each with a tip on how to try it: plan mode, subagents (and three at once),
  skills, `/compact`, a `CLAUDE.md` or memory file, an MCP tool, resuming a session.
- **17 growth goals**: days you used Claude Code, days in a row, tokens, prompts and sessions.

At first start you choose your pet (`/claudou start` changes it later; your level stays):

- **Crab**: a tiny Crabling grows into bigger and stranger crabs: a pea crab hiding in a mussel, a hermit crab,
  a boxer crab with its pom-poms, a fiddler crab waving its giant claw, a horned ghost crab, a Halloween moon
  crab, a coconut crab on its coconut, a Tasmanian giant crab, a Japanese spider crab… and then, since
  everything ends up a crab, one last form.
- **Star**, **Sprout** or **Pebble**: the starters of [Bashou](https://github.com/IAmAStealer/Bashou), the pet
  of your shell: stardust to a red giant, a seedling to a tree spirit, a grain of sand to a jade golem.

Also playing Bashou? `/claudou swap` can show the pets you unlocked there.

## Install

In Claude Code:

```
/plugin marketplace add IAmAStealer/Claudou
/plugin install claudou@claudou
```

Your crab sits on the right, just above the prompt. Now and then it says a tip in a speech bubble: first the
Claude Code features you haven't tried, then everyday tricks. It speaks English or French: choose in `/config`
(Claudou, Language).

| Command | What it does |
| --- | --- |
| `/claudou` | show or hide your crab |
| `/claudou on`, `/claudou off` | show it, hide it (also `here`, `hide`) |
| `/claudou level` | form, level and next form, in one line |
| `/claudou stats` | form, level, counters and achievements |
| `/claudou achievements` | all 25 achievements, and how to get the missing ones |
| `/claudou hint` | the next Claude Code feature to try, and how |
| `/claudou talk` | your crab gives you a tip now |
| `/claudou pets` | the forms your crab reached |
| `/claudou swap` | pick another form you reached (`swap <name or number>` directly, `swap new` for the newest) |
| `/claudou evolve` | watch your crab grow through every form it reached |
| `/claudou share` | a card to copy and share |
| `/claudou layout horizontal`, `/claudou layout vertical` | above the prompt, or in a column beside the conversation (asked once at first start; `layout` alone asks again) |
| `/claudou config` | your settings and where to change them |
| `/claudou start` | choose your pet: crab, star, sprout or pebble (your level stays) |
| `/claudou reset` | start over from the first form (asks first) |
| `/claudou version` | the version of Claudou |

To update: `/plugin marketplace update claudou`, then `/plugin update claudou@claudou`.

Coming next: good work habits (tests, reviewed diffs, small commits), other starters than crabs, and
[Bashou](https://github.com/IAmAStealer/Bashou)'s pets in Claude Code with `bashou claude on`.

## Safe by design

- **No dependencies**: not a single npm package. CI refuses any `package.json` dependency, lockfile or import.
- **Counters only, nothing sent**: the mod may only use the hooks and engine calls listed in
  `tools/capabilities.json`; CI reads what Claude Code itself sees in the code and refuses anything else.
  The one file it reads is Bashou's save, when Bashou is installed, to show the pets you unlocked there.
- Secret scanning, CodeQL, OpenSSF Scorecard, protected `main` branch and release tags.
  Report a security problem privately: [SECURITY.md](.github/SECURITY.md).

MIT license.
