#!/usr/bin/env python3
"""印章占位补图 · 由补图计划生成回填 migration

用法:
  gen_migration.py <version> <batch.json> <out_sql_path>

batch.json 形如:
  {"description": "placeholder asset backfill (samples)",
   "poets":    [ {plan 条目...}, ... ],
   "cultural": [ {plan 条目...}, ... ]}

生成 UPDATE 语句：诗人写 avatar_anime_url、文化条目写 image_anime_url，
一律写相对路径（与 V25/V26 既有策略一致），不触碰 status 与实景字段。
"""
import json
import sys
from datetime import date

TARGET = {
    "poets": ("poet", ["avatar_anime_url"]),
    "cultural": ("cultural_item", ["image_anime_url"]),
    # 景点同时回填两个字段：库里原本两栏指向同一（且 404 的）URL，
    # 一并改写可彻底消除失效引用，不留隐患兜底。
    "spots": ("scenic_spot", ["image_url", "image_anime_url"]),
}


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    version, batch_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    batch = json.load(open(batch_path, encoding="utf-8"))
    desc = batch.get("description", "placeholder asset backfill")

    lines = [
        f"-- V{version} {desc}",
        f"-- 生成日期: {date.today().isoformat()}",
        "-- 计划文档: docs/plans/2026-10-09-placeholder-asset-generation-plan.md",
        "-- 说明: 一律写入相对路径 /images/... 或 /media/...，",
        "--       与 V23/V25/V26 的存储约定一致（本地 public/ 与 OSS 对象键同构）。",
        "--       诗人/文化只改水墨字段；景点改 image_url + image_anime_url 两栏，",
        "--       以彻底清除原本指向 404 OSS 对象的失效引用。",
        "--       本文件由 scripts/placeholder-assets/gen_migration.py 自动生成。",
        "",
    ]

    total = 0
    for group, (table, columns) in TARGET.items():
        items = batch.get(group) or []
        if not items:
            continue
        cols = ", ".join(columns)
        lines.append(f"-- {table} 回填 {len(items)} 条（{cols}）")
        for it in items:
            sets = ", ".join(f"`{c}` = '{it['localPath']}'" for c in columns)
            lines.append(f"UPDATE `{table}` SET {sets} WHERE `id` = {it['id']};")
            total += 1
        lines.append("")

    open(out_path, "w", encoding="utf-8").write("\n".join(lines))
    print(f"已生成 {out_path}（{total} 条 UPDATE）")


if __name__ == "__main__":
    main()
