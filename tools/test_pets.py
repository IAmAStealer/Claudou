"""Every sprite in plugin/pets is well formed: python3 -m unittest discover -s tools -p 'test_*.py'"""
import json
import re
import unittest
from pathlib import Path

PETS = Path(__file__).resolve().parent.parent / "plugin/pets"
POSES = {"inhale", "closed", "left", "right", "fidget"}
GROWTH = Path(__file__).resolve().parent.parent / "plugin/hooks/growth.ts"


class PetsTest(unittest.TestCase):
    def test_sprites_are_17_by_12_with_every_pose_and_known_colors(self):
        files = sorted(PETS.glob("*.json"))
        self.assertTrue(files)
        for f in files:
            d = json.loads(f.read_text())
            self.assertEqual(d["name"], f.stem)
            self.assertEqual(len(d["base"]), 12, f.name)
            self.assertEqual(set(d["poses"]), POSES, f.name)
            for color in d["palette"].values():
                self.assertRegex(color, r"^#[0-9a-f]{6}$", f.name)
            rows = [(f"base {i}", r) for i, r in enumerate(d["base"])]
            rows += [(f"{p} {r}", line) for p, lines in d["poses"].items() for r, line in lines.items()]
            for where, line in rows:
                self.assertEqual(len(line), 17, f"{f.name} {where}")
                self.assertLessEqual(set(line) - {".", "-"}, set(d["palette"]), f"{f.name} {where}")
            for lines in d["poses"].values():
                self.assertTrue(all(0 <= int(r) < 12 for r in lines), f.name)
                self.assertNotEqual(lines, {}, f.name)

    def test_every_form_of_the_ladder_has_its_sprite(self):
        forms = re.findall(r"\{ id: '(\w+)', level: \d+ \}", GROWTH.read_text())
        self.assertEqual(len(forms), 11)
        for form in forms:
            name = re.sub(r"(?<!^)([A-Z])", r"_\1", form).lower()          # peaCrab -> pea_crab
            self.assertTrue((PETS / f"{name}.json").exists(), name)

    def test_the_mod_carries_the_sprites_as_they_are(self):
        import sprites_ts
        self.assertEqual(sprites_ts.OUT.read_text(), sprites_ts.source(), "run python3 tools/sprites_ts.py")


if __name__ == "__main__":
    unittest.main()
