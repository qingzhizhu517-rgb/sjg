#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
command -v osv-scanner >/dev/null || { echo 'Install OSV-Scanner v2.4.0 (see docs/security-operations.md)' >&2; exit 1; }
for project in . display-v2 admin-frontend sjg-datav; do
  npm audit --prefix "$project" --audit-level=high
done
(cd backend && ./mvnw -B -ntp org.cyclonedx:cyclonedx-maven-plugin:2.9.1:makeAggregateBom)
osv-scanner scan source --no-ignore --lockfile=backend/target/bom.json
