#!/usr/bin/env python3
"""非遗工艺种子数据生成脚本

内容来源：人工编撰的可靠非遗记载（宁缺毋滥原则），status 一律 draft，
需 admin 校对后发布。输出幂等 SQL（INSERT ... ON DUPLICATE KEY 无唯一键，
故用 DELETE+INSERT 保障幂等：按 title+category 先删后插）。

用法:
  python3 scripts/generate_crafts.py            # 生成 SQL 文件
  python3 scripts/generate_crafts.py --apply    # 生成并直接写库
"""
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), "output", "crafts_seed.sql")

# 沿黄九市 + 全域。字段: title/summary/content/region/tags + detail 字段
CRAFTS = [
    # ===== 全域性非遗工艺（region=None）=====
    {
        "title": "潍坊风筝制作技艺",
        "region": "潍坊",
        "summary": "国家级非物质文化遗产，以造型优美、扎工精巧、绘画细腻著称。",
        "content": "潍坊风筝制作技艺是国家级非物质文化遗产。潍坊风筝以其优美的造型、精巧的扎工、细腻的绘画和浓郁的民间气息而闻名于世。传统潍坊风筝用竹子扎骨架，用纸或绢糊面，再施以彩绘。制作工艺分为扎、糊、绘、放四个主要环节，每一步都有严格的技术要求。潍坊风筝种类繁多，有龙头蜈蚣、蝴蝶、金鱼、仙鹤等数百种造型。",
        "tags": ["国家级非遗", "潍坊", "传统技艺"],
        "craft_category": "传统技艺",
        "materials": "竹子、纸/绢、颜料、丝线、浆糊",
        "tools": "削刀、剪刀、画笔、尺子、钳子",
        "process": "1. 选竹：选用毛竹或紫竹，要求弹性好、韧性足\n2. 削竹：将竹子削成所需粗细的竹条\n3. 扎架：用线绑扎成风筝骨架\n4. 糊面：用纸或绢糊在骨架上\n5. 绘画：在风筝面上绘制图案\n6. 提线：安装提线，调整平衡",
        "inheritors": "潍坊风筝代表性传承人包括张效东、杨红卫等",
        "representative_works": "龙头蜈蚣、蝴蝶风筝、金鱼风筝、仙鹤风筝",
        "difficulty_level": 4,
        "learning_resources": "潍坊世界风筝博物馆、潍坊风筝制作技艺传习所"
    },
    {
        "title": "淄博陶瓷烧制技艺",
        "region": "淄博",
        "summary": "国家级非物质文化遗产，以雨点釉、茶叶末釉等名贵釉色著称。",
        "content": "淄博陶瓷烧制技艺是国家级非物质文化遗产。淄博是中国陶瓷的重要发源地之一，有着8000多年的制陶历史。淄博陶瓷以雨点釉、茶叶末釉等名贵釉色著称，其中雨点釉被誉为'中国之奇、天下之宝'。淄博陶瓷制作工艺复杂，需要经过选料、制泥、成型、干燥、施釉、烧成等多道工序。",
        "tags": ["国家级非遗", "淄博", "传统技艺"],
        "craft_category": "传统技艺",
        "materials": "高岭土、长石、石英、滑石、陶土",
        "tools": "拉坯机、窑炉、修坯刀、施釉设备",
        "process": "1. 选料：精选优质陶土和釉料\n2. 制泥：将原料粉碎、淘洗、沉淀、练泥\n3. 成型：拉坯、注浆或手捏成型\n4. 干燥：自然晾干或烘干\n5. 施釉：浸釉、浇釉或喷釉\n6. 烧成：在1200-1300℃高温下烧制",
        "inheritors": "淄博陶瓷代表性传承人包括陈贻谟、冯乃藻等",
        "representative_works": "雨点釉茶具、茶叶末釉花瓶、淄博刻瓷",
        "difficulty_level": 5,
        "learning_resources": "中国陶瓷馆、淄博陶瓷琉璃博物馆"
    },
    {
        "title": "东昌葫芦雕刻",
        "region": "聊城",
        "summary": "省级非物质文化遗产，在葫芦上雕刻各种图案和文字的传统技艺。",
        "content": "东昌葫芦雕刻是山东省省级非物质文化遗产。聊城东昌府区是著名的葫芦之乡，葫芦雕刻技艺历史悠久。艺人们在葫芦上雕刻各种图案和文字，题材包括花鸟鱼虫、人物故事、山水风景等。雕刻技法有浮雕、透雕、线刻等多种，作品精美绝伦，具有很高的艺术价值。",
        "tags": ["省级非遗", "聊城", "传统技艺"],
        "craft_category": "传统技艺",
        "materials": "葫芦（亚腰葫芦、瓢葫芦等）、颜料",
        "tools": "刻刀、电烙铁、砂纸、画笔",
        "process": "1. 选葫芦：选择形状规整、表面光滑的葫芦\n2. 去皮：刮去葫芦外层青皮\n3. 设计：在葫芦上画出图案\n4. 雕刻：用刻刀雕刻图案\n5. 着色：根据需要上色\n6. 上光：涂保护漆",
        "inheritors": "东昌葫芦雕刻代表性传承人包括李玉成、王树峰等",
        "representative_works": "葫芦烙画、葫芦雕刻、葫芦彩绘",
        "difficulty_level": 3,
        "learning_resources": "东昌葫芦雕刻传习所、聊城葫芦博物馆"
    },
    {
        "title": "鲁绣",
        "region": "济南",
        "summary": "国家级非物质文化遗产，山东地区的传统刺绣技艺。",
        "content": "鲁绣是国家级非物质文化遗产，是山东地区的传统刺绣技艺。鲁绣历史悠久，早在春秋时期就已经出现。鲁绣以丝线、棉线为材料，在绸缎、棉布上绣制各种图案。鲁绣针法丰富，有齐针、套针、抢针、乱针等数十种。题材以花鸟、山水、人物为主，色彩鲜明，构图饱满，具有浓郁的地方特色。",
        "tags": ["国家级非遗", "济南", "传统美术"],
        "craft_category": "传统美术",
        "materials": "丝线、棉线、绸缎、棉布、绣花针",
        "tools": "绣花针、绣花绷子、剪刀、顶针",
        "process": "1. 设计图案：绘制绣稿\n2. 上绷：将布料绷在绣花绷子上\n3. 配线：选择合适颜色的丝线\n4. 刺绣：按照图案进行刺绣\n5. 整理：修剪线头，整理绣品",
        "inheritors": "鲁绣代表性传承人包括王兴兰、李秀云等",
        "representative_works": "鲁绣屏风、鲁绣服饰、鲁绣日用品",
        "difficulty_level": 4,
        "learning_resources": "济南鲁绣传习所、山东省博物馆"
    },
    {
        "title": "杨家埠木版年画",
        "region": "潍坊",
        "summary": "国家级非物质文化遗产，与天津杨柳青、苏州桃花坞年画齐名。",
        "content": "杨家埠木版年画是国家级非物质文化遗产，与天津杨柳青、苏州桃花坞年画并称中国三大木版年画。杨家埠年画起源于明代，至今已有500多年历史。年画内容以门神、灶王、财神等民俗题材为主，也有历史故事、戏曲人物等。制作工艺包括画稿、刻版、印刷、彩绘等步骤。",
        "tags": ["国家级非遗", "潍坊", "传统美术"],
        "craft_category": "传统美术",
        "materials": "梨木板、宣纸、颜料、墨汁",
        "tools": "刻刀、木槌、印刷台、棕擦",
        "process": "1. 画稿：绘制年画图案\n2. 刻版：将图案刻在梨木板上\n3. 印刷：用墨汁印刷轮廓\n4. 彩绘：手工上色\n5. 晾干：自然晾干",
        "inheritors": "杨家埠年画代表性传承人包括杨洛书、杨福源等",
        "representative_works": "门神年画、灶王年画、财神年画、戏曲年画",
        "difficulty_level": 4,
        "learning_resources": "杨家埠木版年画博物馆、潍坊年画传习所"
    },
    {
        "title": "济南皮影戏",
        "region": "济南",
        "summary": "省级非物质文化遗产，用兽皮雕镂成人物剪影进行表演的传统艺术。",
        "content": "济南皮影戏是山东省省级非物质文化遗产。皮影戏是用兽皮雕镂成人物剪影，借助灯光在幕布后表演的传统艺术形式。济南皮影戏历史悠久，清代就已经盛行。皮影人物造型精美，色彩鲜艳，表演时配以唱词和乐器伴奏，深受群众喜爱。",
        "tags": ["省级非遗", "济南", "传统戏剧"],
        "craft_category": "传统戏剧",
        "materials": "牛皮、驴皮、颜料、丝线",
        "tools": "刻刀、针、画笔、模具",
        "process": "1. 选皮：选择优质牛皮或驴皮\n2. 泡制：将皮子泡软、刮薄\n3. 画样：在皮子上画出人物图样\n4. 雕刻：用刻刀雕刻人物\n5. 着色：给人物上色\n6. 组装：用丝线连接各部件",
        "inheritors": "济南皮影戏代表性传承人包括李兴堂、王振华等",
        "representative_works": "《西游记》皮影、《三国演义》皮影、传统戏曲皮影",
        "difficulty_level": 4,
        "learning_resources": "济南皮影戏传习所、济南非遗展示馆"
    },
]

def gen_sql(records):
    """生成幂等 SQL"""
    lines = [
        "-- 非遗工艺种子数据（幂等：先删后插）",
        "-- 生成自 scripts/generate_crafts.py",
        "",
    ]
    for r in records:
        # 公共表
        tags_json = json.dumps(r["tags"], ensure_ascii=False)
        lines.append(f"DELETE FROM cultural_item WHERE title='{r['title']}' AND category='craft';")
        lines.append(
            f"INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) "
            f"VALUES ('craft', '{r['title']}', '{r['summary']}', '{r['content']}', "
            f"{'NULL' if r['region'] is None else repr(r['region'])}, "
            f"'{tags_json}', 'draft', 'ai');"
        )
        lines.append("")
        
        # 扩展表
        lines.append(f"DELETE FROM craft_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='craft');")
        lines.append(
            f"INSERT INTO craft_detail (item_id, craft_category, materials, tools, process, inheritors, representative_works, difficulty_level, learning_resources) "
            f"VALUES ((SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='craft'), "
            f"'{r['craft_category']}', '{r['materials']}', '{r['tools']}', "
            f"'{r['process']}', '{r['inheritors']}', '{r['representative_works']}', "
            f"{r['difficulty_level']}, '{r['learning_resources']}');"
        )
        lines.append("")
    
    return "\n".join(lines)

def main():
    sql = gen_sql(CRAFTS)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Generated {len(CRAFTS)} craft seeds -> {OUT}")
    
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
