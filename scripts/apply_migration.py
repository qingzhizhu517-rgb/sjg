#!/usr/bin/env python3
"""Apply a Flyway-style migration SQL file via pymysql.

项目 pom 未引入 Flyway, 迁移 SQL 需手动应用。本脚本读一个迁移文件,
按 ';' 切句(去 -- 注释行)逐条执行, 适合幂等迁移(CREATE IF NOT EXISTS /
INSERT ON DUPLICATE KEY)。
若当前 Python 环境缺少 PyMySQL，脚本会以退出码 2 在连接前安全退出。

用法:
  python3 scripts/apply_migration.py [migration.sql]
  (默认应用 V4__poet_relation.sql)

DB 连接配置同 backend/src/main/resources/application.yml;
支持环境变量覆盖: DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
(本地库示例: DB_HOST=127.0.0.1 DB_USER=root DB_PASSWORD=你的密码)。
"""
import sys
import os
from pathlib import Path

try:
    import pymysql
except ModuleNotFoundError as exc:
    if exc.name != "pymysql":
        raise
    print(
        "无法执行迁移：缺少 Python 依赖 PyMySQL（模块 pymysql）。\n"
        "请在已批准的 Python 环境中安装 PyMySQL 后重试，例如："
        "python3 -m pip install --user PyMySQL。\n"
        "本次未读取迁移文件，也未尝试连接数据库。",
        file=sys.stderr,
    )
    raise SystemExit(2) from None

HOST = os.environ.get("DB_HOST", "127.0.0.1")
PORT = int(os.environ.get("DB_PORT", "3306"))
USER = os.environ.get("DB_USER", "root")
PWD = os.environ.get("DB_PASSWORD", "")
DB = os.environ.get("DB_NAME", "sjg01")
DEFAULT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend", "src", "main", "resources", "db", "migration", "V4__poet_relation.sql"
)

path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT

with open(path, "r", encoding="utf-8") as f:
    raw = f.read()

stmts = []
for part in raw.split(";"):
    lines = [l for l in part.splitlines() if l.strip() and not l.strip().startswith("--")]
    s = "\n".join(lines).strip()
    if s:
        stmts.append(s)

conn = pymysql.connect(host=HOST, port=PORT, user=USER, password=PWD,
                       database=DB, charset="utf8mb4", autocommit=True)
cur = conn.cursor()
print(f"applying {len(stmts)} statement(s) from {path} ...")
for s in stmts:
    cur.execute(s)
    print("  ok |", s.splitlines()[0][:70])
print("--- verify ---")
name = Path(path).name
if "poet_relation" in name:
    cur.execute("SELECT COUNT(*) FROM poet_relation")
    print("poet_relation rows:", cur.fetchone()[0])
    cur.execute("""SELECT a.name, b.name, r.relation_type, r.description
                   FROM poet_relation r
                   JOIN poet a ON a.id = r.poet_a_id
                   JOIN poet b ON b.id = r.poet_b_id
                   ORDER BY r.relation_type, a.id""")
    rows = cur.fetchall()
    print(f"seeded {len(rows)} relations:")
    for a, b, t, d in rows:
        print(f"  {a} --{t}-- {b}  | {d}")
elif "content_provenance" in name:
    cur.execute("SELECT entity_type, status, COUNT(*) FROM content_review GROUP BY entity_type, status")
    for entity_type, status, total in cur.fetchall():
        print(f"  reviews {entity_type}/{status}: {total}")
    cur.execute("""SELECT COUNT(*) FROM content_review r
                   LEFT JOIN content_source_link l
                     ON l.entity_type = r.entity_type AND l.entity_id = r.entity_id
                   WHERE l.id IS NULL""")
    print("entities_without_source:", cur.fetchone()[0])
else:
    print("migration statements executed; no migration-specific verification configured")
cur.close()
conn.close()
