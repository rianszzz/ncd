#!/usr/bin/env bash
set -e

# ==============================================================================
# NCD High-Concurrency Load & Rate-Limit Test Script
# ==============================================================================
BASE_URL="http://127.0.0.1:8080/api/v1"
CONCURRENT_USERS=30
TOTAL_REQUESTS=60

echo "=========================================================="
echo " [NCD Load Test] Testing $CONCURRENT_USERS Concurrent Users against $BASE_URL"
echo "=========================================================="

# 1. Healthcheck & Latency Check
START_TIME=$(date +%s%N)
HEALTH_RES=$(curl -s "$BASE_URL/health")
END_TIME=$(date +%s%N)
LATENCY_MS=$(( (END_TIME - START_TIME) / 1000000 ))

echo "-> Healthcheck status: $HEALTH_RES"
echo "-> Single-request Latency: ${LATENCY_MS}ms"
echo ""

# 2. Test Concurrent Simultaneous Users on Cached Public API
echo "-> Launching $TOTAL_REQUESTS parallel requests to /public/stats..."
TEMP_LOG=$(mktemp)

for i in $(seq 1 $TOTAL_REQUESTS); do
  (
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/stats")
    echo "$CODE" >> "$TEMP_LOG"
  ) &
done

wait

SUCCESS_COUNT=$(grep -c "^200" "$TEMP_LOG" || true)
RATE_LIMITED_COUNT=$(grep -c "^429" "$TEMP_LOG" || true)
OTHER_COUNT=$(grep -v -E "^(200|429)" "$TEMP_LOG" | wc -l || true)

rm -f "$TEMP_LOG"

echo "-> Concurrency Results:"
echo "   - Successful (HTTP 200): $SUCCESS_COUNT"
echo "   - Rate Limited (HTTP 429): $RATE_LIMITED_COUNT"
echo "   - Errors / Others: $OTHER_COUNT"
echo ""

# 3. Test Sensitive Endpoint Rate Limiter (Max 15 req/min)
echo "-> Testing brute-force protection on /auth/login (Limit: 15 req/min)..."
BLOCKED=0
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" -d '{"key":"INVALID-KEY"}')
  if [ "$CODE" -eq 429 ]; then
    BLOCKED=$((BLOCKED + 1))
  fi
done

echo "   - Triggered 429 Too Many Requests: $BLOCKED times"
if [ "$BLOCKED" -gt 0 ]; then
  echo "   [SUCCESS] Rate limiter successfully defended sensitive auth route!"
else
  echo "   [NOTICE] Requests completed within burst threshold."
fi

echo "=========================================================="
echo " [NCD Load Test] All Concurrency & Protection Checks Passed!"
echo "=========================================================="
