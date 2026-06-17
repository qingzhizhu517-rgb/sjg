#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
诗词专用导入脚本
生成使用子查询查 ID 的 SQL，不依赖硬编码的外键 ID。
用法：python3 import_poems.py
输出：sjg_poems.sql
"""

import openpyxl
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/a1/develop/vibecoding/sjg/数据采集 --分地区")

EXCEL_FILES = [
    "数据汇总-济南.xlsx", "数据汇总-泰安.xlsx", "数据汇总-德州.xlsx",
    "数据汇总-滨州.xlsx", "数据汇总-济宁.xlsx", "数据汇总--菏泽、聊城.xlsx",
    "数据汇总--淄博、东营.xlsx", "数据汇总 --黄河意象.xlsx",
]

OUTPUT_SQL = BASE_DIR / "sjg_poems.sql"

DYNASTY_MAP = {
    "先秦": 1, "秦": 1,
    "西汉": 2, "东汉": 2, "汉": 2, "汉代": 2,
    "魏晋": 3, "西晋": 3, "东晋": 3, "南北朝": 3, "三国": 3,
    "唐": 4, "唐代": 4, "唐朝": 4,
    "宋": 5, "宋代": 5, "北宋": 5, "南宋": 5,
    "元": 6, "元代": 6,
    "明": 7, "明代": 7,
    "清": 8, "清代": 8, "清朝": 8,
    "金": 9, "金代": 9,
    # 近现代/当代 → 归入清代(id=8)
    "明末清初": 7, "清初": 8,
    "现代": 8, "当代": 8, "近现代": 8, "民国": 8,
}


def safe_str(val, default=""):
    if val is None: return default
    s = str(val).strip()
    return s if s and s.lower() != "none" else default


def escape_sql(val):
    """转义单引号和反斜杠"""
    if val is None:
        return "NULL"
    s = str(val)
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "\\'")
    return f"'{s}'"


def parse_poems():
    """从所有 Excel 中提取诗词数据"""
    all_poems = []

    for fname in EXCEL_FILES:
        fpath = BASE_DIR / fname
        if not fpath.exists():
            continue

        wb = openpyxl.load_workbook(fpath, data_only=True)
        ws = wb["数据采集汇总"]

        for row in ws.iter_rows(min_row=3, values_only=True):
            if not row[0]: continue

            spot = safe_str(row[0])
            author = safe_str(row[13]) if len(row) > 13 else ""
            title = safe_str(row[12]) if len(row) > 12 else ""
            dynasty = safe_str(row[14]) if len(row) > 14 else ""
            content_raw = safe_str(row[16]) if len(row) > 16 else ""

            if not (spot and author and title and content_raw):
                continue

            dynasty_id = DYNASTY_MAP.get(dynasty, 8)

            # 清理诗词正文
            content = content_raw.replace("/", "\n").replace("\\n", "\n")

            imagery = safe_str(row[17]) if len(row) > 17 else ""
            source = safe_str(row[18]) if len(row) > 18 else ""
            background = safe_str(row[9]) if len(row) > 9 else ""
            annotation = safe_str(row[23]) if len(row) > 23 else ""

            # 生成意象标签
            if imagery:
                tags = [t.strip() for t in imagery.replace("、", ",").replace("，", ",").replace("；", ",").split(",") if t.strip()]
            else:
                tags = []

            all_poems.append({
                "title": title,
                "author": author,
                "spot": spot,
                "dynasty_name": dynasty,
                "dynasty_id": dynasty_id,
                "content": content,
                "imagery": imagery,
                "source": source,
                "background": background,
                "annotation": annotation,
                "tags": tags,
                "source_file": fname,
            })

    return all_poems


def generate_sql(poems):
    """生成使用子查询的 INSERT SQL，匹配已导入的诗人和景点"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    poem_id = 0

    sql = []
    sql.append("-- ========================================")
    sql.append(f"-- 诗词导入 SQL (自动查 poet_id / spot_id)")
    sql.append(f"-- 生成时间: {now}")
    sql.append(f"-- 共 {len(poems)} 首")
    sql.append("-- ========================================")
    sql.append("")
    sql.append("START TRANSACTION;")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql.append("")
    sql.append("-- 如果诗词表已有数据且要覆盖，取消下面这行的注释")
    sql.append("-- TRUNCATE TABLE poem;")
    sql.append("")

    # 用 INSERT ... SELECT 子查询模式
    inserts = []
    for p in poems:
        poem_id += 1
        title = escape_sql(p["title"])
        content = escape_sql(p["content"])
        did = p["dynasty_id"]
        annotation = escape_sql(p["annotation"])
        background = escape_sql(p["background"])

        # 将意象和出处合并到注释字段（表里没有 imagery/source_url 列）
        extra_parts = []
        if p["imagery"]:
            extra_parts.append(f"意象: {p['imagery']}")
        if p["source"]:
            extra_parts.append(f"出处: {p['source']}")
        if extra_parts and p["annotation"]:
            annotation = escape_sql(f"{p['annotation']}；{'；'.join(extra_parts)}")
        elif extra_parts:
            annotation = escape_sql(f"{'；'.join(extra_parts)}")

        tags_json = escape_sql(str(p["tags"]).replace("'", '"'))
        ts = escape_sql(now)

        # 子查询找到 poet_id 和 spot_id
        poet_lookup = f"(SELECT id FROM poet WHERE name = {escape_sql(p['author'])} LIMIT 1)"
        spot_lookup = f"(SELECT id FROM scenic_spot WHERE name = {escape_sql(p['spot'])} LIMIT 1)"

        sql_stmt = (
            f"INSERT INTO poem "
            f"(id, title, content, poet_id, dynasty_id, spot_id, "
            f" annotation, background, "
            f" sentiment_tags, created_at, updated_at) "
            f"SELECT {poem_id}, {title}, {content}, {poet_lookup}, {did}, {spot_lookup}, "
            f" {annotation}, {background}, "
            f" {tags_json}, {ts}, {ts}"
            f" WHERE EXISTS (SELECT 1 FROM poet WHERE name = {escape_sql(p['author'])} LIMIT 1)"
            f" AND EXISTS (SELECT 1 FROM scenic_spot WHERE name = {escape_sql(p['spot'])} LIMIT 1)"
        )
        inserts.append(sql_stmt)

    sql.append(";\n".join(inserts) + ";")
    sql.append("")
    sql.append(f"ALTER TABLE poem AUTO_INCREMENT = {poem_id + 1};")
    sql.append("")
    sql.append("-- 统计: 实际插入了多少行（跳过找不到 poet/spot 的）")
    sql.append("SELECT COUNT(*) AS total_poems FROM poem;")
    sql.append("")
    sql.append("-- 列出没匹配上的（poet_id 或 spot_id 为 NULL）")
    sql.append("SELECT id, title, poet_id, spot_id FROM poem WHERE poet_id IS NULL OR spot_id IS NULL;")
    sql.append("")
    sql.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql.append("COMMIT;")
    sql.append("")

    return "\n".join(sql)


def main():
    print("提取诗词数据...")
    poems = parse_poems()
    print(f"  ✓ 共 {len(poems)} 首诗词")

    # 按作者和景点统计
    authors = set(p["author"] for p in poems)
    spots = set(p["spot"] for p in poems)
    dynasties = set(p["dynasty_name"] for p in poems)
    print(f"  涉及 {len(authors)} 位作者, {len(spots)} 个景点, {len(dynasties)} 个朝代")

    # 检查可能无法匹配的作者/景点
    print("\n  朝代分布:")
    for d in sorted(dynasties):
        count = sum(1 for p in poems if p["dynasty_name"] == d)
        did = DYNASTY_MAP.get(d, "?")
        flag = "" if did != "?" else " ⚠ 未映射"
        print(f"    {d} (id={did}): {count}首{flag}")

    print("\n生成 SQL...")
    sql = generate_sql(poems)

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write(sql)

    print(f"  ✓ 已写入: {OUTPUT_SQL}")
    print(f"  大小: {len(sql):,} 字符")
    print()
    print("导入命令:")
    print(f"  mysql -u root -p -h 47.104.207.58 sjg < {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
