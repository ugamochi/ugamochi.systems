#!/usr/bin/env bash
set -euo pipefail

WEBHOOK_URL="${1:-https://n8n-service-uwaf.onrender.com/webhook/lead-form}"
TEST_EMAIL="${TEST_EMAIL:-ugamochi.pavel@gmail.com}"
NOW_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "Sending test payload to: $WEBHOOK_URL"

curl --fail-with-body -sS -i -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Codex Test Lead\",
    \"email\": \"$TEST_EMAIL\",
    \"company\": \"Codex QA\",
    \"message\": \"Webhook end-to-end verification from CLI\",
    \"timestamp\": \"$NOW_UTC\",
    \"source\": \"codex-cli-test\",
    \"userAgent\": \"codex-cli\",
    \"referrer\": \"direct\"
  }"
