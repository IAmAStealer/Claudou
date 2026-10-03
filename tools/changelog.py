"""python3 tools/changelog.py v1.2.3: print that release's section of CHANGELOG.md (exit 1 if missing).

The release job uses it for the GitHub release notes, so a release can't be tagged without one.
"""

import re
import sys
from pathlib import Path

CHANGELOG = Path(__file__).resolve().parent.parent / "CHANGELOG.md"


def notes(version, text):
    m = re.search(rf"^## {re.escape(version)} — \d{{4}}-\d{{2}}-\d{{2}}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(1).strip() if m else ""


def main(args):
    if len(args) != 1:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    text = notes(args[0], CHANGELOG.read_text())
    if not text:
        print(f"CHANGELOG.md has no section for {args[0]}: add '## {args[0]} — YYYY-MM-DD' first.", file=sys.stderr)
        return 1
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
