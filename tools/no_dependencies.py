"""python3 tools/no_dependencies.py: fail when the repository would pull code from a package registry.

Owner's rule: Claudou has no npm dependencies. No package.json with dependencies, no lockfile, no node_modules,
no import of anything but the engine's own modules ('claude-code', 'claude-code/testing') and our own files.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALLOWED = {"claude-code", "claude-code/testing"}


def problems():
    found = []
    package = ROOT / "package.json"
    if package.exists():
        data = json.loads(package.read_text())
        for key in ("dependencies", "devDependencies", "optionalDependencies", "peerDependencies", "bundleDependencies"):
            if data.get(key):
                found.append(f"package.json has {key}")
        for script in ("preinstall", "install", "postinstall", "prepare"):
            if script in data.get("scripts", {}):
                found.append(f"package.json has an install script: {script}")
    for lock in ("package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", "npm-shrinkwrap.json"):
        if (ROOT / lock).exists():
            found.append(f"{lock} exists")
    for path in sorted(ROOT.rglob("*.ts*")):
        if any(part in ("vendor", "node_modules", ".git", ".claude-plugin") for part in path.relative_to(ROOT).parts):
            continue
        for name in re.findall(r"""(?:from|import)\s*\(?\s*['"]([^'"]+)['"]""", path.read_text()):
            if not name.startswith(".") and name not in ALLOWED:
                found.append(f"{path.relative_to(ROOT)} imports {name}")
    return found


if __name__ == "__main__":
    found = problems()
    for line in found:
        print(f"::error::{line}")
    sys.exit(1 if found else 0)
