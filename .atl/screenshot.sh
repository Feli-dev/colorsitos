#!/usr/bin/env bash
# Capture app screenshots for PR evidence via the Orca browser.
#
#   .atl/screenshot.sh <out-dir> <label> [path] [scheme]
#
#   out-dir  where PNGs are written
#   label    filename prefix, e.g. "before" or "after"
#   path     route to capture, default /en
#   scheme   light | dark | both, default both
#
# Requires: `npm run dev` already listening on :3000, and a reachable Orca
# runtime (`orca status` -> runtimeReachable: true). Must run from the repo
# root, because Orca binds browser tabs to the worktree of the current
# directory — creating the tab elsewhere makes `orca screenshot` fail with
# browser_no_tab.
set -euo pipefail

OUT_DIR=${1:?out-dir required}
LABEL=${2:?label required}
ROUTE=${3:-/en}
SCHEME=${4:-both}
BASE_URL=${BASE_URL:-http://localhost:3000}

mkdir -p "$OUT_DIR"

if ! curl -sf -o /dev/null "${BASE_URL}${ROUTE}"; then
  echo "error: ${BASE_URL}${ROUTE} is not responding. Start 'npm run dev' first." >&2
  exit 1
fi

orca tab create --url "${BASE_URL}${ROUTE}" --json >/dev/null
orca wait --timeout 5000 >/dev/null 2>&1 || true

capture() {
  local scheme=$1
  local out="${OUT_DIR}/${LABEL}-${scheme}.png"
  local tmp
  tmp=$(mktemp)

  # Set the scheme first, then reload, so the page renders straight into the
  # target theme. Switching the scheme on an already-painted page animates
  # (next-themes runs with disableTransitionOnChange={false}) and the capture
  # lands mid-transition: grey cards, half-faded buttons.
  orca set media --color-scheme "$scheme" >/dev/null 2>&1 || true
  orca reload >/dev/null 2>&1 || true
  orca wait --timeout 5000 >/dev/null 2>&1 || true
  orca screenshot --format png --json >"$tmp"

  node -e '
    const fs = require("fs");
    const res = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    if (!res.ok) {
      console.error("screenshot failed:", JSON.stringify(res.error));
      process.exit(1);
    }
    const b64 = String(res.result.data).replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(process.argv[2], Buffer.from(b64, "base64"));
  ' "$tmp" "$out"

  rm -f "$tmp"
  echo "wrote $out ($(wc -c <"$out") bytes)"
}

case "$SCHEME" in
  both) capture light; capture dark ;;
  light|dark) capture "$SCHEME" ;;
  *) echo "error: scheme must be light, dark or both" >&2; exit 1 ;;
esac

orca tab close >/dev/null 2>&1 || true
