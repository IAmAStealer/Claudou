"""python3 tools/capabilities.py: the mod hooks and calls only what tools/capabilities.json allows.

Reads what `claude plugin validate plugin` reports (the engine's own reading of the module) and fails on any hook
event or engine call not listed. SECURITY.md promises the mod keeps counters only and sends nothing: reaching
files, processes, the model, the network or other tools' calls must be a reviewed change of the list.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALLOWED = json.loads((ROOT / "tools/capabilities.json").read_text())


def used(report):
    """{"hooks": [...], "calls": [...]} from validate's lines '❯ ./x.tsx hooks: a, b{k=v}' and '… calls: $.x, $.y'."""
    found = {"hooks": set(), "calls": set()}
    for kind in found:
        for line in re.findall(rf"❯ \S+ {kind}: (.+)", report):
            for item in re.split(r",\s*(?![^{]*\})", line.strip()):
                found[kind].add(re.sub(r"\{.*\}$", "", item.strip()))
    return {k: sorted(v - {""}) for k, v in found.items()}


def problems(report):
    got = used(report)
    if not got["hooks"]:
        return ["validate reported no hooks: did its output change?"]
    return [f"new {kind[:-1]}: {name} (review it, then add it to tools/capabilities.json)"
            for kind in ("hooks", "calls") for name in got[kind] if name not in ALLOWED[kind]]


if __name__ == "__main__":
    report = subprocess.run(["claude", "plugin", "validate", str(ROOT / "plugin")], capture_output=True, text=True)
    if report.returncode:
        print(report.stdout + report.stderr)
        sys.exit(1)
    found = problems(report.stdout)
    for line in found:
        print(f"::error::{line}")
    print("capabilities:", json.dumps(used(report.stdout)))
    sys.exit(1 if found else 0)
