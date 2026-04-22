#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# memacta prod smoke test  (sprint 1.5 — beta readiness)
#
# Usage:
#   chmod +x scripts/smoke-prod.sh
#   APP_URL=https://memacta.vercel.app ./scripts/smoke-prod.sh
#
# Requires: curl, jq
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

APP_URL="${APP_URL:-https://memacta.vercel.app}"
PASS=0
FAIL=0

log_pass() { echo "  [PASS] $1"; PASS=$((PASS+1)); }
log_fail() { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }
log_info() { echo "  [INFO] $1"; }
section()   { echo; echo "=== $1 ==="; }

# ── 1. Healthz ────────────────────────────────────────────────────────────────
section "1. Healthz probe"
HEALTH=$(curl -sf "${APP_URL}/api/healthz" || echo "CURL_ERROR")
if echo "$HEALTH" | jq -e '.status == "ok"' >/dev/null 2>&1; then
  log_pass "/api/healthz returned status=ok"
  echo "  $(echo "$HEALTH" | jq -c '.checks')"
else
  log_fail "/api/healthz is not ok: $HEALTH"
fi

# ── 2. Register a throwaway user ─────────────────────────────────────────────
section "2. User registration"
TS=$(date +%s)
TEST_EMAIL="smoketest+${TS}@example.com"
TEST_PASS="SmokeTest123!"

REG=$(curl -sf -X POST "${APP_URL}/api/auth/register" \
  -H "content-type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"name\":\"Smoke Tester\",\"password\":\"${TEST_PASS}\"}" \
  || echo "CURL_ERROR")

if echo "$REG" | jq -e '.success == true' >/dev/null 2>&1; then
  log_pass "User registered: ${TEST_EMAIL}"
else
  log_fail "Registration failed: $REG"
fi

# ── 3. Check verification email (manual step) ─────────────────────────────────
section "3. Email verification (manual)"
log_info "MANUAL STEP: Check the inbox/spam for ${TEST_EMAIL}"
log_info "Expect: 'Verify your memacta email' with a verify link."
log_info "Press ENTER to confirm email arrived, or CTRL+C to abort."
read -r _

# ── 4. Forgot-password flow ───────────────────────────────────────────────────
section "4. Forgot-password API"
FP=$(curl -sf -X POST "${APP_URL}/api/auth/forgot-password" \
  -H "content-type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\"}" \
  || echo "CURL_ERROR")

if echo "$FP" | jq -e '.ok == true' >/dev/null 2>&1; then
  log_pass "forgot-password returned ok=true"
else
  log_fail "forgot-password failed: $FP"
fi

# ── 5. Rate limiter — hit /api/persona 12 times ───────────────────────────────
section "5. Rate limiter (12x /api/persona)"
log_info "Firing 12 unauthenticated requests at /api/persona ..."
RATE_LIMITED=false
for i in $(seq 1 12); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/persona")
  if [ "$STATUS" -eq 429 ]; then
    log_pass "Request #${i} returned 429 (rate limited)"
    RATE_LIMITED=true
    break
  fi
done
if [ "$RATE_LIMITED" = "false" ]; then
  log_fail "Never got a 429 after 12 requests — rate limiter may not be working"
fi

# ── 6. Supabase Storage upload ────────────────────────────────────────────────
section "6. Supabase Storage upload (persona-photo)"
log_info "Uploading a 1x1 test PNG to /api/upload with context=persona-photo"
log_info "(Requires a valid session cookie — this step is manual)"
log_info "MANUAL STEP: In a logged-in browser, run:"
log_info "  const fd = new FormData();"
log_info "  const blob = new Blob([new Uint8Array([137,80,78,71,13,10,26,10])], {type:'image/png'});"
log_info "  fd.append('file', blob, 'test.png');"
log_info "  fd.append('context', 'persona-photo');"
log_info "  fd.append('personaId', 'test-persona-id');"
log_info "  fetch('/api/upload', {method:'POST', body: fd}).then(r=>r.json()).then(console.log)"
log_info "Expect: response with a supabase.co URL in the 'url' field."

# ── 7. Sentry test error ───────────────────────────────────────────────────────
section "7. Sentry test error"
log_info "Hitting /api/test/sentry (only works in non-production)"
SENTRY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/test/sentry")
if [ "$SENTRY_STATUS" -eq 500 ]; then
  log_pass "Got 500 from /api/test/sentry (error thrown, Sentry should capture it)"
  log_info "MANUAL STEP: Check Sentry Issues for '[memacta smoke test]' within 60s"
elif [ "$SENTRY_STATUS" -eq 404 ]; then
  log_info "/api/test/sentry returned 404 — this is expected in production (route is dev-only)"
else
  log_fail "/api/test/sentry returned unexpected status: ${SENTRY_STATUS}"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
section "Summary"
echo "  Passed: ${PASS}"
echo "  Failed: ${FAIL}"
if [ "$FAIL" -eq 0 ]; then
  echo "  Result: ALL AUTOMATED CHECKS PASSED"
else
  echo "  Result: SOME CHECKS FAILED — review above"
  exit 1
fi
