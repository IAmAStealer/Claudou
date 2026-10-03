#!/usr/bin/env bash
# Refresh vendor/claude-code.d.ts from the copy Claude Code writes beside the mod when it loads it
# (plugin/.claude-plugin/types/claude-code/index.d.ts), and show what changed in the API.
set -euo pipefail
cd "$(dirname "$0")/.."
new=plugin/.claude-plugin/types/claude-code/index.d.ts
if [[ ! -r $new ]]; then
  echo "No $new yet: load the mod once (claude --plugin-dir plugin), then run this again." >&2
  exit 1
fi
echo "vendored: $(head -1 vendor/claude-code.d.ts)"
echo "new:      $(head -1 "$new")"
if cmp -s "$new" vendor/claude-code.d.ts; then echo "Same API."; exit 0; fi
diff -u vendor/claude-code.d.ts "$new" | grep -E '^[-+]\s*(export|[a-z][A-Za-z]*[?]?:|\x27[a-z.]+\x27:)' | head -80 || true
cp "$new" vendor/claude-code.d.ts
echo "Copied. Run tsc -p . and claude plugin test plugin, then commit with the version in the message."
