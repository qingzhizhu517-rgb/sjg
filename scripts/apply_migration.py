#!/usr/bin/env python3
"""Apply a Flyway-style migration SQL file via pymysql.

项目 pom 未引入 Flyway, 迁移 SQL 需手动应用。本脚本读一个迁移文件,
按 ';' 切句(去 -- 注释行)逐条执行, 适合幂等迁移(CREATE IF NOT EXISTS /
INSERT ON DUPLICATE KEY)。

用法:
  python3 scripts/apply_migration.py [migration.sql]
  (默认应用 V4__poet_relation.sql)

DB 连接配置同 backend/src/main/resources/application.yml;
password 走 DB_PASSWORD 环境变量, 默认 123456(与 application.yml 一致)。
"""
import sys
import os
import pymysql

HOST = "47.104.207.58"
PORT = 3306
USER = "qz-Zhu"
PWD = os.environ.get("DB_PASSWORD", "123456")
DB = "sjg"
DEFAULT = "/Users/a1/develop/vibecoding/sjg/backend/src/main/resources/db/migration/V4__poet_relation.sql"

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
cur.close()
conn.close()
