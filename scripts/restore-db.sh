#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${MYSQL_CONFIG:?provide isolated MySQL config}"
: "${RESTORE_DATABASE:?must start with sjg_restore_}"
[[ "$RESTORE_DATABASE" =~ ^sjg_restore_[A-Za-z0-9_]+$ ]] || { echo 'Refusing non-isolated database name' >&2; exit 1; }
task_restore_file="${1:?provide local sql.gz backup}"
python3 - "$MYSQL_CONFIG" "$task_restore_file" <<'PY'
import hashlib,sys,pathlib,stat
c,p=map(pathlib.Path,sys.argv[1:])
if stat.S_IMODE(c.stat().st_mode)&0o077: raise SystemExit('MYSQL_CONFIG must have mode 600')
actual=hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
if actual!=p.with_suffix(p.suffix+'.sha256').read_text().strip(): raise SystemExit('Backup SHA-256 mismatch')
PY
# CREATE intentionally fails if the target exists; never overwrite an existing database.
mysql --defaults-extra-file="$MYSQL_CONFIG" -e "CREATE DATABASE \`$RESTORE_DATABASE\` CHARACTER SET utf8mb4;"
gzip -dc "$task_restore_file" | mysql --defaults-extra-file="$MYSQL_CONFIG" "$RESTORE_DATABASE"
mysql --defaults-extra-file="$MYSQL_CONFIG" "$RESTORE_DATABASE" -e 'SELECT COUNT(*) AS poems FROM poem; SELECT status, COUNT(*) FROM content_review GROUP BY status;'
echo 'Isolated restore complete; record elapsed time and verify public publication filtering'
