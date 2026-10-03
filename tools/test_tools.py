"""Tests of the repository tools: python3 -m unittest discover -s tools -p 'test_*.py'"""
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import changelog
import no_dependencies


class ChangelogTest(unittest.TestCase):
    def test_a_section_is_found_and_only_that_one(self):
        text = "# Changelog\n\n## v0.2.0 — 2026-10-05\n\n- New.\n\n## v0.1.0 — 2026-10-04\n\n- First.\n"
        self.assertEqual(changelog.notes("v0.2.0", text), "- New.")
        self.assertEqual(changelog.notes("v0.1.0", text), "- First.")
        self.assertEqual(changelog.notes("v0.3.0", text), "")


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
