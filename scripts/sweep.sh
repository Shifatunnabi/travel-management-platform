#!/usr/bin/env bash
# Signs in as each role and checks every route it should reach.
BASE="${BASE:-http://localhost:3100}"
PASS="${PASSWORD:-kemonasobabe}"

sweep() {
  local email="$1"; shift
  local label="$1"; shift
  local jar; jar="$(mktemp)"
  curl -s -c "$jar" -o /dev/null "$BASE/auth/login"
  local csrf; csrf=$(curl -s -b "$jar" -c "$jar" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -s -b "$jar" -c "$jar" -X POST "$BASE/api/auth/callback/credentials" \
    -d "csrfToken=$csrf&email=$email&password=$PASS&redirect=false" -o /dev/null

  echo "── $label ($email)"
  local bad=0
  for path in "$@"; do
    local code; code=$(curl -s -b "$jar" -o /tmp/sweep_body.html -w "%{http_code}" "$BASE$path")
    local note=""
    if grep -q "This section could not load\|Application error\|could not load" /tmp/sweep_body.html 2>/dev/null; then
      note=" [error boundary]"; bad=$((bad+1))
    fi
    if [ "$code" != "200" ]; then bad=$((bad+1)); fi
    printf "  %-3s %s%s\n" "$code" "$path" "$note"
  done
  rm -f "$jar"
  [ "$bad" -eq 0 ] && echo "  all clear" || echo "  ⚠ $bad problem(s)"
  echo
}

echo "── public (no session)"
for path in / /hotels/search "/hotels/search?destination=Cox" /flights/search /auth/login /auth/register /auth/forgot-password; do
  printf "  %-3s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")" "$path"
done
echo

sweep "farhan@example.com" "customer" /account /account/bookings "/account/bookings?filter=past" /account/profile

sweep "vendor@baybreeze.com" "vendor" /vendor /vendor/hotels /vendor/calendar /vendor/bookings \
  "/vendor/bookings?filter=completed" /vendor/reviews /vendor/finance /vendor/coupons /vendor/team \
  /vendor/settings /vendor/onboarding /vendor/hotels/new

sweep "admin@tofiza.com" "platform admin" /admin /admin/vendors "/admin/vendors?status=approved" \
  /admin/hotels "/admin/hotels?status=published" /admin/reviews "/admin/reviews?status=published" \
  /admin/ratings /admin/bookings /admin/payments "/admin/payments?status=reconcile" \
  /admin/payouts /admin/finance /admin/coupons /admin/content /admin/users /admin/staff \
  /admin/settings /admin/audit
