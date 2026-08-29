#!/usr/bin/env bash
# Signs in against a running server and prints the rendered text of a page, so
# routes can be checked without a browser. Usage: scripts/verify.sh <path> [email]
set -euo pipefail
BASE="${BASE:-http://localhost:3100}"
PATH_="${1:-/}"
EMAIL="${2:-vendor@baybreeze.com}"
PASS="${PASSWORD:-kemonasobabe}"
JAR="$(mktemp)"

curl -s -c "$JAR" -o /dev/null "$BASE/auth/login"
CSRF=$(curl -s -b "$JAR" -c "$JAR" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/api/auth/callback/credentials" \
  -d "csrfToken=$CSRF&email=$EMAIL&password=$PASS&redirect=false" -o /dev/null

curl -s -b "$JAR" "$BASE$PATH_" | python3 -c '
import sys, re, html
t = sys.stdin.read()
# Drop the RSC flight payload and scripts, then flatten to visible text.
t = re.sub(r"<script[\s\S]*?</script>", " ", t)
t = re.sub(r"<style[\s\S]*?</style>", " ", t)
t = re.sub(r"<svg[\s\S]*?</svg>", " ", t)
t = re.sub(r"<[^>]+>", "\n", t)
lines = [html.unescape(l).strip() for l in t.split("\n")]
print("\n".join(l for l in lines if l))
'
rm -f "$JAR"
