#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${SJG_AI_EVAL_BASE_URL:-http://localhost:8080}"
FIXTURE_PATH="${SJG_AI_EVAL_FIXTURE:-$ROOT_DIR/docs/ai-evaluation-set.json}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)-$$"
OUTPUT_PATH="${SJG_AI_EVAL_OUTPUT:-$ROOT_DIR/.local/ai-eval/$STAMP.json}"

if [[ "${1:-}" == "--validate-only" || "${SJG_AI_EVAL_VALIDATE_ONLY:-false}" == "true" ]]; then
  node "$ROOT_DIR/scripts/ai-eval-cli.mjs" \
    --validate-only \
    --fixture "$FIXTURE_PATH"
  exit $?
fi

if [[ "${SJG_AI_EVAL_ENABLED:-false}" != "true" ]]; then
  printf '%s\n' '跳过真实模型评估：请显式设置 SJG_AI_EVAL_ENABLED=true。'
  exit 0
fi

missing_config=()
for config_name in LLM_API_KEY LLM_BASE_URL LLM_MODEL; do
  config_value="${!config_name:-}"
  if [[ -z "${config_value//[[:space:]]/}" ]]; then
    missing_config+=("$config_name")
  fi
done

if (( ${#missing_config[@]} > 0 )); then
  printf '无法运行真实模型评估：缺少必要配置（%s）。请仅在当前 shell 注入，不写入仓库。\n' "${missing_config[*]}" >&2
  exit 2
fi

node "$ROOT_DIR/scripts/ai-eval-cli.mjs" \
  --base-url "$BASE_URL" \
  --fixture "$FIXTURE_PATH" \
  --output "$OUTPUT_PATH"
