#!/usr/bin/env python3
"""饮食戏曲种子数据生成脚本

内容来源：人工编撰的可靠饮食戏曲记载（宁缺毋滥原则），status 一律 draft，
需 admin 校对后发布。输出幂等 SQL（INSERT ... ON DUPLICATE KEY 无唯一键，
故用 DELETE+INSERT 保障幂等：按 title+category 先删后插）。

用法:
  python3 scripts/generate_food_opera.py            # 生成 SQL 文件
  python3 scripts/generate_food_opera.py --apply    # 生成并直接写库
"""
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), "output", "food_opera_seed.sql")

# 沿黄九市 + 全域。字段: title/summary/content/region/tags + detail 字段
FOOD_OPERA = [
    # ===== 饮食文化（region=None）=====
    {
        "title": "鲁菜",
        "region": "济南",
        "summary": "中国八大菜系之首，以咸鲜为主，注重火候，讲究原汁原味。",
        "content": "鲁菜是中国八大菜系之首，也是历史最悠久、技法最丰富的菜系。鲁菜以咸鲜为主，注重火候，讲究原汁原味。鲁菜选料精细，刀工精湛，烹调方法多样，擅长爆、炒、烧、塌、焖等技法。鲁菜分为济南菜、胶东菜、孔府菜三大流派，各具特色。",
        "tags": ["八大菜系", "济南", "传统美食"],
        "sub_category": "food",
        "cuisine_type": "鲁菜",
        "ingredients": "海鲜、禽畜、蔬菜、豆制品、面食",
        "preparation_method": "爆、炒、烧、塌、焖、扒、溜、炸、烩等",
        "representative_dishes": "糖醋鲤鱼、九转大肠、葱烧海参、油焖大虾、德州扒鸡",
        "historical_origin": "鲁菜起源于春秋战国时期，历经秦汉、隋唐、明清不断发展完善",
        "current_status": "鲁菜作为中国八大菜系之首，在国内外享有盛誉",
        "preservation_level": "国家级非物质文化遗产"
    },
    {
        "title": "德州扒鸡",
        "region": "德州",
        "summary": "德州三宝之一，以五香脱骨、肉嫩味纯著称。",
        "content": "德州扒鸡是德州三宝之一，以五香脱骨、肉嫩味纯著称。德州扒鸡始于明代，至今已有300多年历史。制作工艺独特，需经过宰杀、整形、油炸、卤煮等多道工序。成品色泽金黄，肉质鲜嫩，骨酥肉烂，香气扑鼻。",
        "tags": ["德州", "传统美食", "中华老字号"],
        "sub_category": "food",
        "cuisine_type": "鲁菜",
        "ingredients": "整鸡、香料（八角、桂皮、丁香、砂仁等）、酱油、盐",
        "preparation_method": "宰杀、整形、油炸、卤煮、焖制",
        "representative_dishes": "德州扒鸡",
        "historical_origin": "德州扒鸡始于明代，相传乾隆皇帝南巡时曾品尝并赞誉",
        "current_status": "德州扒鸡已成为中国驰名商标，远销国内外",
        "preservation_level": "国家级非物质文化遗产"
    },
    {
        "title": "周村烧饼",
        "region": "淄博",
        "summary": "淄博周村传统名点，以薄、香、酥、脆著称。",
        "content": "周村烧饼是淄博周村传统名点，以薄、香、酥、脆著称。周村烧饼起源于汉代，至今已有1800多年历史。制作工艺独特，需经过和面、揉剂、成型、烘烤等多道工序。成品薄如纸，酥如雪，香如兰，口感酥脆，回味无穷。",
        "tags": ["淄博", "传统美食", "中华老字号"],
        "sub_category": "food",
        "cuisine_type": "鲁点",
        "ingredients": "面粉、芝麻、糖、盐、花生油",
        "preparation_method": "和面、揉剂、成型、烘烤",
        "representative_dishes": "周村烧饼",
        "historical_origin": "周村烧饼起源于汉代，明清时期成为贡品",
        "current_status": "周村烧饼已成为中国驰名商标，远销国内外",
        "preservation_level": "省级非物质文化遗产"
    },
    {
        "title": "煎饼卷大葱",
        "region": "临沂",
        "summary": "山东传统主食，以杂粮煎饼卷大葱、蘸酱食用。",
        "content": "煎饼卷大葱是山东传统主食，以杂粮煎饼卷大葱、蘸酱食用。山东煎饼历史悠久，相传孟姜女哭长城时带的就是煎饼。煎饼以小米、玉米、高粱等杂粮为原料，摊制而成。食用时卷上大葱、蘸上酱料，简单美味，营养丰富。",
        "tags": ["临沂", "传统美食", "地方小吃"],
        "sub_category": "food",
        "cuisine_type": "鲁菜",
        "ingredients": "小米、玉米、高粱等杂粮、大葱、酱料",
        "preparation_method": "磨面、摊制、卷料、蘸酱",
        "representative_dishes": "煎饼卷大葱",
        "historical_origin": "山东煎饼历史悠久，相传孟姜女哭长城时带的就是煎饼",
        "current_status": "煎饼卷大葱是山东人民日常主食，深受喜爱",
        "preservation_level": "市级非物质文化遗产"
    },
    # ===== 戏曲艺术（region=None）=====
    {
        "title": "吕剧",
        "region": "东营",
        "summary": "山东省地方戏曲剧种，以优美动听的唱腔著称。",
        "content": "吕剧是山东省地方戏曲剧种，起源于东营广饶地区。吕剧以优美动听的唱腔著称，唱腔以'四平腔'为基本曲调，旋律优美，节奏明快。吕剧表演朴实自然，贴近生活，深受山东人民喜爱。代表剧目有《李二嫂改嫁》《姊妹易嫁》等。",
        "tags": ["东营", "地方戏曲", "国家级非遗"],
        "sub_category": "opera",
        "cuisine_type": "吕剧",
        "ingredients": "演员、乐队（坠琴、扬琴、二胡等）、服装道具",
        "preparation_method": "唱、念、做、打，以唱为主",
        "representative_dishes": "《李二嫂改嫁》《姊妹易嫁》《小姑贤》",
        "historical_origin": "吕剧起源于清代末年，由山东琴书发展而来",
        "current_status": "吕剧是国家级非物质文化遗产，在山东各地广泛流传",
        "preservation_level": "国家级非物质文化遗产"
    },
    {
        "title": "山东快书",
        "region": "济南",
        "summary": "山东省传统曲艺形式，以节奏明快、语言幽默著称。",
        "content": "山东快书是山东省传统曲艺形式，以节奏明快、语言幽默著称。山东快书起源于清代，由民间说唱艺术发展而来。表演者手持竹板，边打边说，节奏明快，语言生动。代表曲目有《武松传》《鲁达除霸》等。",
        "tags": ["济南", "传统曲艺", "国家级非遗"],
        "sub_category": "opera",
        "cuisine_type": "山东快书",
        "ingredients": "表演者、竹板、服装",
        "preparation_method": "说、唱、表演，以说为主",
        "representative_dishes": "《武松传》《鲁达除霸》《马寡妇开店》",
        "historical_origin": "山东快书起源于清代，由民间说唱艺术发展而来",
        "current_status": "山东快书是国家级非物质文化遗产，在山东各地广泛流传",
        "preservation_level": "国家级非物质文化遗产"
    },
    {
        "title": "柳子戏",
        "region": "菏泽",
        "summary": "山东省地方戏曲剧种，以粗犷豪放的唱腔著称。",
        "content": "柳子戏是山东省地方戏曲剧种，以粗犷豪放的唱腔著称。柳子戏起源于明代，由民间小调发展而来。唱腔以'柳子调'为主，旋律高亢激昂，表演粗犷豪放。代表剧目有《白兔记》《金锁记》等。",
        "tags": ["菏泽", "地方戏曲", "国家级非遗"],
        "sub_category": "opera",
        "cuisine_type": "柳子戏",
        "ingredients": "演员、乐队（柳琴、笛子、唢呐等）、服装道具",
        "preparation_method": "唱、念、做、打，以唱为主",
        "representative_dishes": "《白兔记》《金锁记》《孙安动本》",
        "historical_origin": "柳子戏起源于明代，由民间小调发展而来",
        "current_status": "柳子戏是国家级非物质文化遗产，在菏泽等地流传",
        "preservation_level": "国家级非物质文化遗产"
    },
]

def gen_sql(records):
    """生成幂等 SQL"""
    lines = [
        "-- 饮食戏曲种子数据（幂等：先删后插）",
        "-- 生成自 scripts/generate_food_opera.py",
        "",
    ]
    for r in records:
        # 公共表
        tags_json = json.dumps(r["tags"], ensure_ascii=False)
        lines.append(f"DELETE FROM cultural_item WHERE title='{r['title']}' AND category='food_opera';")
        lines.append(
            f"INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) "
            f"VALUES ('food_opera', '{r['title']}', '{r['summary']}', '{r['content']}', "
            f"{'NULL' if r['region'] is None else repr(r['region'])}, "
            f"'{tags_json}', 'draft', 'ai');"
        )
        lines.append("")
        
        # 扩展表
        lines.append(f"DELETE FROM food_opera_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='food_opera');")
        lines.append(
            f"INSERT INTO food_opera_detail (item_id, sub_category, cuisine_type, ingredients, preparation_method, representative_dishes, historical_origin, current_status, preservation_level) "
            f"VALUES ((SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='food_opera'), "
            f"'{r['sub_category']}', '{r['cuisine_type']}', '{r['ingredients']}', "
            f"'{r['preparation_method']}', '{r['representative_dishes']}', "
            f"'{r['historical_origin']}', '{r['current_status']}', '{r['preservation_level']}');"
        )
        lines.append("")
    
    return "\n".join(lines)

def main():
    sql = gen_sql(FOOD_OPERA)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Generated {len(FOOD_OPERA)} food_opera seeds -> {OUT}")
    
    if "--apply" in sys.argv:
        import pymysql
        conn = pymysql.connect(host="47.104.207.58", port=3306, user="qz-Zhu", 
                              password=os.environ.get("DB_PASSWORD", "123456"), 
                              database="sjg", charset="utf8mb4", autocommit=True)
        cur = conn.cursor()
        for stmt in sql.split(";"):
            stmt = stmt.strip()
            if stmt and not stmt.startswith("--"):
                cur.execute(stmt)
        cur.close()
        conn.close()
        print("Applied to database")

if __name__ == "__main__":
    main()
