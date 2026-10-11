#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_stage() {
  local name="$1"
  shift
  printf '\n==> %s\n' "$name"
  "$@"
}

cd "$ROOT_DIR"

run_stage "repository quality-tool dependencies" npm ci
run_stage "display-v2 dependencies" npm ci --prefix display-v2
run_stage "admin-frontend dependencies" npm ci --prefix admin-frontend
run_stage "sjg-datav dependencies" npm ci --prefix sjg-datav
run_stage "dependency vulnerability scan" npm run check:security
run_stage "AI evaluation tooling tests" npm run test:ai-eval
run_stage "learning task content checks" npm run test:learning-task
run_stage "admin governance contract tests" npm run test:admin-contract
run_stage "migration runner preflight test" env PYTHONDONTWRITEBYTECODE=1 python3 scripts/apply_migration_test.py
run_stage "migration tooling tests" npm run test:migrations
run_stage "migration static check" npm run check:migrations
run_stage "content ledger tooling tests" npm run test:content-ledger
run_stage "CI quality-gate contract" npm run test:ci-contract
run_stage "shared boundaries" npm run test:shared
run_stage "release dependency and configuration contracts" npm run test:release
run_stage "frontend static checks" npm run lint
run_stage "new shared-code formatting" npm run check:format
run_stage "duplication budget" npm run check:duplicates
run_stage "display-v2 coverage gate" npm run test:coverage
run_stage "display-v2 build" npm --prefix display-v2 run build
run_stage "admin-frontend build" npm --prefix admin-frontend run build
run_stage "sjg-datav build" npm --prefix sjg-datav run build
run_stage "backend unit, MySQL integration and static quality" bash -c 'cd backend && ./mvnw -B -Pintegration,quality verify'
run_stage "accessibility" npm run test:a11y
run_stage "git whitespace check" git diff --check

printf '\nAll SJG verification stages passed.\n'
