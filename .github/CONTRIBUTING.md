# Contributing

Ideas, bug reports, pixel art and translations are welcome.

| You want to… | You edit | Check |
|---|---|---|
| Translate Claudou | `plugin/hooks/messages.ts` | `claude plugin test plugin` |
| Draw or improve a crab | `plugin/pets/<pet>.json` | `python3 tools/sprite_sheet.py out.png plugin/pets/<pet>.json` |
| Fix a bug or add a feature | `plugin/hooks/` | `claude plugin validate plugin`, `tsc -p .`, `claude plugin test plugin` |

Bugs and ideas: [open an issue](https://github.com/IAmAStealer/Claudou/issues/new/choose). Security problems go
through the [private report](https://github.com/IAmAStealer/Claudou/security/advisories/new), never a public issue.

**No dependencies.** Claudou never adds an npm package: a pull request with a `package.json` dependency, a
lockfile or an import of a package is refused by CI. TypeScript is only a checking tool, pinned and reviewed.

Everything you send must be yours to share, under the project's MIT license. Working with an AI is welcome:
you're responsible for what you send, so read it, test it and check its facts. Every bug fix comes with a
test that fails without it. Text players read is in English and French (French: tutoiement).

Everyone follows the [code of conduct](CODE_OF_CONDUCT.md): kind and patient, beginners first.
