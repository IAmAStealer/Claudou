# Security

Found a security problem in Claudou? Please report it privately with GitHub's
[private vulnerability reporting](https://github.com/IAmAStealer/Claudou/security/advisories/new)
instead of opening a public issue.

## What Claudou touches

Claudou is a Claude Code mod: it runs inside Claude Code's own sandbox for mods, with no Node and no DOM, and
reaches the outside only through the engine's interface. It:

- reads the events of your session (prompts, tool calls, finished turns) to grow your pet, and keeps only
  counters, never what you wrote or what Claude answered;
- keeps those counters in Claude Code's store for mods, on your machine;
- reads one file when it exists, [Bashou](https://github.com/IAmAStealer/Bashou)'s save
  (`~/.local/share/bashou/state.json`, or `$BASHOU_DATA/state.json`), to know which Bashou pets you may show;
  it never writes it;
- sends nothing anywhere, and downloads nothing.

It has no npm dependencies at all (a CI check refuses any), so nothing from a package registry runs with it.
