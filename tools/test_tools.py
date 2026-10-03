"""Tests of the repository tools: python3 -m unittest discover -s tools -p 'test_*.py'"""
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import capabilities
import changelog
import no_dependencies


class ChangelogTest(unittest.TestCase):
    def test_a_section_is_found_and_only_that_one(self):
        text = "# Changelog\n\n## v0.2.0 — 2026-10-05\n\n- New.\n\n## v0.1.0 — 2026-10-04\n\n- First.\n"
        self.assertEqual(changelog.notes("v0.2.0", text), "- New.")
        self.assertEqual(changelog.notes("v0.1.0", text), "- First.")
        self.assertEqual(changelog.notes("v0.3.0", text), "")


class CapabilitiesTest(unittest.TestCase):
    REPORT = ("  ❯ ./register.tsx hooks: session.start, command.run{command=claudou}, ui.render{component=Pane, requestId=claudou}\n"
              "  ❯ ./register.tsx calls: $.command.register, $.store.set (via change), $.ui.open, $.ui.resolve\n")

    def test_what_the_mod_uses_is_read_from_validate(self):
        self.assertEqual(capabilities.used(self.REPORT), {
            "hooks": ["command.run", "session.start", "ui.render"],
            "calls": ["$.command.register", "$.store.set", "$.ui.open", "$.ui.resolve"]})
        self.assertEqual(capabilities.problems(self.REPORT), [])

    def test_a_new_capability_is_refused(self):
        for extra in ("hooks: prompt.compose", "calls: $.tool.call", "calls: $.fs.write", "calls: $.process.spawn", "calls: $.model.call"):
            self.assertTrue(capabilities.problems(self.REPORT + f"  ❯ ./x.ts {extra}\n"), extra)

    def test_an_empty_report_is_refused(self):
        self.assertTrue(capabilities.problems("Validation passed"))


class NoDependenciesTest(unittest.TestCase):
    def check(self, files):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name, text in files.items():
                (root / name).parent.mkdir(parents=True, exist_ok=True)
                (root / name).write_text(text)
            with mock.patch.object(no_dependencies, "ROOT", root):
                return no_dependencies.problems()

    def test_the_repository_itself_is_clean(self):
        self.assertEqual(no_dependencies.problems(), [])

    def test_what_is_refused(self):
        self.assertTrue(self.check({"package.json": json.dumps({"dependencies": {"left-pad": "1.0.0"}})}))
        self.assertTrue(self.check({"package.json": json.dumps({"devDependencies": {"typescript": "6.0.3"}})}))
        self.assertTrue(self.check({"package.json": json.dumps({"scripts": {"postinstall": "node x.js"}})}))
        self.assertTrue(self.check({"package-lock.json": "{}"}))
        self.assertTrue(self.check({"plugin/hooks/a.ts": "import x from 'lodash'\n"}))
        self.assertTrue(self.check({"plugin/hooks/a.ts": "const x = await import('evil')\n"}))

    def test_what_is_allowed(self):
        self.assertEqual(self.check({"plugin/hooks/a.ts": "import type { Register } from 'claude-code'\n"
                                     "import { t } from './messages'\nimport { test } from 'claude-code/testing'\n"}), [])
        self.assertEqual(self.check({"package.json": json.dumps({"name": "claudou", "private": True})}), [])


if __name__ == "__main__":
    unittest.main()
