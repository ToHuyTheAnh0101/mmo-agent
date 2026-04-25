#!/usr/bin/env bash
# tests/smoke.sh — Phase 1 smoke checks (INFRA-01, INFRA-02, INFRA-03)
# Prerequisites: node src/server.js must be running (background or separate terminal)
# Run: bash tests/smoke.sh
set -e

BASE_URL="http://localhost:3000"

echo "=== INFRA-01: Express health check ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
[ "$STATUS" = "200" ] && echo "PASS: /health -> 200" || (echo "FAIL: /health -> $STATUS" && exit 1)

echo "=== INFRA-02: DB file exists ==="
[ -f "data/chat.db" ] && echo "PASS: data/chat.db exists" || (echo "FAIL: data/chat.db not found" && exit 1)

echo "=== INFRA-02: All 3 tables exist ==="
TABLE_COUNT=$(node -e "const db=require('./src/db'); console.log(db.prepare('SELECT count(*) as n FROM sqlite_master WHERE type=\"table\"').get().n)")
[ "$TABLE_COUNT" = "3" ] && echo "PASS: 3 tables found" || (echo "FAIL: expected 3 tables, got $TABLE_COUNT" && exit 1)

echo "=== INFRA-03: POST /api/ai/chat responds (not 404) ==="
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/ai/chat" \
  -H 'Content-Type: application/json' -d '{"message":"ping"}')
[ "$AI_STATUS" != "404" ] && echo "PASS: /api/ai/chat -> $AI_STATUS (not 404)" || (echo "FAIL: /api/ai/chat -> 404" && exit 1)

echo "=== All smoke checks passed ==="
