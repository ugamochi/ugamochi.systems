#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${N8N_BASE_URL:-https://n8n-service-uwaf.onrender.com}"
API_KEY="${N8N_API_KEY:-}"
WORKFLOW_FILE="${1:-n8n-workflows/stage-1-basic.json}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOADED_ENV_FILES=()

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
    LOADED_ENV_FILES+=("$env_file")
  fi
}

# Try common dotenv locations before failing.
load_env_file "$PWD/.env"
load_env_file "$PWD/.env.local"
load_env_file "$SCRIPT_DIR/.env"
load_env_file "$SCRIPT_DIR/.env.local"
load_env_file "$SCRIPT_DIR/../.env"
load_env_file "$SCRIPT_DIR/../.env.local"
if [[ -n "${N8N_ENV_FILE:-}" ]]; then
  load_env_file "$N8N_ENV_FILE"
fi

API_KEY="${N8N_API_KEY:-$API_KEY}"
BASE_URL="${N8N_BASE_URL:-$BASE_URL}"

if [[ -z "$API_KEY" ]]; then
  echo "Error: N8N_API_KEY is required." >&2
  if [[ ${#LOADED_ENV_FILES[@]} -gt 0 ]]; then
    echo "Loaded env files:" >&2
    printf '  - %s\n' "${LOADED_ENV_FILES[@]}" >&2
  fi
  echo "Set it with: export N8N_API_KEY='...'" >&2
  exit 1
fi

if [[ ! -f "$WORKFLOW_FILE" ]]; then
  echo "Error: workflow file not found: $WORKFLOW_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required." >&2
  exit 1
fi

AUTH_HEADER=("X-N8N-API-KEY: $API_KEY")
JSON_HEADER=("Content-Type: application/json")
WORKFLOW_NAME="$(jq -r '.name' "$WORKFLOW_FILE")"
# n8n API v1 on this instance rejects some exported settings keys.
PAYLOAD="$(jq -c '{name, nodes, connections, settings: {executionOrder: (.settings.executionOrder // "v1")}}' "$WORKFLOW_FILE")"

echo "Checking API access at $BASE_URL ..."
LIST_RESPONSE="$(
  curl --fail-with-body -sS \
    -H "${AUTH_HEADER[0]}" \
    "$BASE_URL/api/v1/workflows"
)"

WORKFLOW_ID="$(
  echo "$LIST_RESPONSE" | jq -r --arg name "$WORKFLOW_NAME" '
    if type == "array" then
      (.[] | select(.name == $name) | .id)
    elif has("data") then
      (.data[]? | select(.name == $name) | .id)
    else
      empty
    end
  ' | head -n1
)"

if [[ -z "$WORKFLOW_ID" ]]; then
  echo "Workflow '$WORKFLOW_NAME' not found. Creating it ..."
  CREATE_RESPONSE="$(
    curl --fail-with-body -sS -X POST \
      -H "${AUTH_HEADER[0]}" \
      -H "${JSON_HEADER[0]}" \
      "$BASE_URL/api/v1/workflows" \
      -d "$PAYLOAD"
  )"
  WORKFLOW_ID="$(echo "$CREATE_RESPONSE" | jq -r '.data.id // .id // empty')"
  if [[ -z "$WORKFLOW_ID" ]]; then
    echo "Error: could not read new workflow id from create response." >&2
    exit 1
  fi
  echo "Created workflow id: $WORKFLOW_ID"
else
  echo "Updating workflow '$WORKFLOW_NAME' (id: $WORKFLOW_ID) ..."
  curl --fail-with-body -sS -X PUT \
    -H "${AUTH_HEADER[0]}" \
    -H "${JSON_HEADER[0]}" \
    "$BASE_URL/api/v1/workflows/$WORKFLOW_ID" \
    -d "$PAYLOAD" >/dev/null
fi

WORKFLOW_RESPONSE="$(
  curl --fail-with-body -sS \
    -H "${AUTH_HEADER[0]}" \
    "$BASE_URL/api/v1/workflows/$WORKFLOW_ID"
)"

VERSION_ID="$(echo "$WORKFLOW_RESPONSE" | jq -r '.data.versionId // .versionId // empty')"
if [[ -z "$VERSION_ID" ]]; then
  echo "Error: could not read versionId for workflow $WORKFLOW_ID." >&2
  exit 1
fi

echo "Activating workflow id $WORKFLOW_ID with version $VERSION_ID ..."
curl --fail-with-body -sS -X POST \
  -H "${AUTH_HEADER[0]}" \
  -H "${JSON_HEADER[0]}" \
  "$BASE_URL/api/v1/workflows/$WORKFLOW_ID/activate" \
  -d "{\"versionId\":\"$VERSION_ID\"}" >/dev/null

echo "Deployment complete."
echo "Workflow: $WORKFLOW_NAME"
echo "ID: $WORKFLOW_ID"
echo "Version: $VERSION_ID"
