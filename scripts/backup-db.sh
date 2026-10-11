#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "${BASH_SOURCE[0]}")/.."
: "${MYSQL_CONFIG:?provide a private MySQL client config file}"
: "${BACKUP_OSS_PREFIX:?provide oss://bucket/private-prefix}"
[[ "$BACKUP_OSS_PREFIX" == oss://* ]] || { echo 'Invalid OSS prefix' >&2; exit 1; }
[[ -f "$MYSQL_CONFIG" ]] || exit 1
python3 - "$MYSQL_CONFIG" <<'PY'
import os,sys,stat
if stat.S_IMODE(os.stat(sys.argv[1]).st_mode) & 0o077: raise SystemExit('MYSQL_CONFIG must have mode 600')
PY
task_backup_db="${BACKUP_DATABASE:-sjg01}"
[[ "$task_backup_db" =~ ^[A-Za-z0-9_]+$ ]] || exit 1
task_backup_dir="${BACKUP_DIR:-.local/backups}"
mkdir -p "$task_backup_dir"
task_backup_lock="$task_backup_dir/.backup-lock"
mkdir "$task_backup_lock" || { echo 'Backup already running' >&2; exit 1; }
task_backup_file="$task_backup_dir/${task_backup_db}-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
trap 'rm -f "$task_backup_file.partial"; rmdir "$task_backup_lock"' EXIT
mysqldump --defaults-extra-file="$MYSQL_CONFIG" --single-transaction --quick --routines --triggers --events --no-tablespaces --set-gtid-purged=OFF "$task_backup_db" | gzip > "$task_backup_file.partial"
gzip -t "$task_backup_file.partial"
mv "$task_backup_file.partial" "$task_backup_file"
python3 - "$task_backup_file" <<'PY'
import hashlib,sys,pathlib
p=pathlib.Path(sys.argv[1]); h=hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
p.with_suffix(p.suffix+'.sha256').write_text(h+'\n')
PY
ossutil cp "$task_backup_file" "${BACKUP_OSS_PREFIX%/}/$(basename "$task_backup_file")" --acl private
ossutil cp "$task_backup_file.sha256" "${BACKUP_OSS_PREFIX%/}/$(basename "$task_backup_file").sha256" --acl private
echo 'Private backup and SHA-256 uploaded successfully'
