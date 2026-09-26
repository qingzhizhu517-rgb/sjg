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

run_stage "display-v2 dependencies" npm ci --prefix display-v2
run_stage "admin-frontend dependencies" npm ci --prefix admin-frontend
run_stage "sjg-datav dependencies" npm ci --prefix sjg-datav
run_stage "AI evaluation tooling tests" npm run test:ai-eval
run_stage "learning task content checks" npm run test:learning-task
run_stage "admin governance contract tests" npm run test:admin-contract
run_stage "migration runner preflight test" env PYTHONDONTWRITEBYTECODE=1 python3 scripts/apply_migration_test.py
run_stage "migration tooling tests" npm run test:migrations
run_stage "migration static check" npm run check:migrations
run_stage "content ledger tooling tests" npm run test:content-ledger
run_stage "CI quality-gate contract" npm run test:ci-contract
run_stage "display-v2 unit tests" npm --prefix display-v2 run test:unit
run_stage "display-v2 build" npm --prefix display-v2 run build
run_stage "admin-frontend build" npm --prefix admin-frontend run build
run_stage "sjg-datav build" npm --prefix sjg-datav run build
run_stage "backend tests" mvn -B -f backend/pom.xml test
run_stage "git whitespace check" git diff --check

printf '\nAll SJG verification stages passed.\n'
