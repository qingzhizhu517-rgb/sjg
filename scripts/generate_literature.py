#!/usr/bin/env python3
"""民间文学种子数据生成脚本

内容来源：人工编撰的可靠民间文学记载（宁缺毋滥原则），status 一律 draft，
需 admin 校对后发布。输出幂等 SQL（INSERT ... ON DUPLICATE KEY 无唯一键，
故用 DELETE+INSERT 保障幂等：按 title+category 先删后插）。

用法:
  python3 scripts/generate_literature.py            # 生成 SQL 文件
  python3 scripts/generate_literature.py --apply    # 生成并直接写库
"""
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), "output", "literature_seed.sql")

# 沿黄九市 + 全域。字段: title/summary/content/region/tags + detail 字段
LITERATURE = [
    # ===== 全域性民间文学（region=None）=====
    {
        "title": "孟姜女传说",
        "region": "泰安",
        "summary": "中国四大民间传说之一，讲述孟姜女哭倒长城的故事。",
        "content": "孟姜女传说是中国四大民间传说之一。相传秦朝时期，孟姜女的丈夫范喜良被征去修长城，多年未归。孟姜女千里寻夫，得知丈夫已死，悲痛欲绝，哭了三天三夜，竟把长城哭倒了一段。这个传说反映了古代劳动人民对暴政的控诉和对爱情忠贞的赞美。山东泰安、淄博等地都有孟姜女传说的流传版本。",
        "tags": ["四大传说", "泰安", "爱情传说"],
        "genre": "传说",
        "origin_region": "山东泰安、淄博等地",
        "main_characters": "孟姜女、范喜良、秦始皇",
        "plot_summary": "1. 范喜良新婚三日被征修长城\n2. 孟姜女千里寻夫\n3. 得知丈夫死讯，痛哭三天三夜\n4. 哭倒长城八百里\n5. 秦始皇欲纳其为妃\n6. 孟姜女投海自尽",
        "cultural_significance": "反映了古代劳动人民对暴政的控诉，歌颂了忠贞不渝的爱情",
        "related_scenic_spots": [],
        "collection_source": "中国民间文学集成·山东卷"
    },
    {
        "title": "梁祝传说",
        "region": "济宁",
        "summary": "中国四大民间传说之一，讲述梁山伯与祝英台的爱情故事。",
        "content": "梁祝传说是中国四大民间传说之一。相传东晋时期，祝英台女扮男装外出求学，与梁山伯同窗三年。梁山伯不知祝英台是女子，待得知真相后，祝英台已被许配他人。梁山伯相思成疾而死，祝英台出嫁途中祭拜梁山伯墓，墓裂而入，双双化蝶。山东济宁等地有梁祝传说的流传版本。",
        "tags": ["四大传说", "济宁", "爱情传说"],
        "genre": "传说",
        "origin_region": "山东济宁等地",
        "main_characters": "梁山伯、祝英台、马文才",
        "plot_summary": "1. 祝英台女扮男装求学\n2. 与梁山伯同窗三载\n3. 梁山伯不知其为女子\n4. 祝英台被许配马家\n5. 梁山伯相思成疾而死\n6. 祝英台祭墓，墓裂化蝶",
        "cultural_significance": "歌颂了忠贞不渝的爱情，反映了古代青年男女对自由恋爱的追求",
        "related_scenic_spots": [],
        "collection_source": "中国民间文学集成·山东卷"
    },
    {
        "title": "泰山传说",
        "region": "泰安",
        "summary": "关于泰山的神话传说，包括泰山老奶奶、碧霞元君等。",
        "content": "泰山传说是关于泰山的神话传说。泰山被誉为五岳之首，自古就是帝王封禅之地。传说泰山老奶奶（碧霞元君）是泰山的主神，掌管人间生死福祸。泰山还有许多著名传说，如泰山石敢当、泰山挑夫等。这些传说反映了古代人民对自然的敬畏和对美好生活的向往。",
        "tags": ["泰山", "泰安", "神话传说"],
        "genre": "传说",
        "origin_region": "山东泰安",
        "main_characters": "碧霞元君、泰山石敢当、泰山挑夫",
        "plot_summary": "1. 碧霞元君修道成仙\n2. 掌管泰山，庇佑众生\n3. 泰山石敢当驱邪镇宅\n4. 泰山挑夫坚韧不拔\n5. 帝王封禅祭祀",
        "cultural_significance": "反映了古代人民对自然的敬畏，体现了中华民族的精神追求",
        "related_scenic_spots": [],
        "collection_source": "泰山民间故事集"
    },
    {
        "title": "运河传说",
        "region": "聊城",
        "summary": "关于京杭大运河的民间传说，反映运河沿岸人民的生活。",
        "content": "运河流传说是关于京杭大运河的民间传说。聊城是运河沿岸的重要城市，流传着许多与运河有关的传说。这些传说反映了运河沿岸人民的生活、劳动和爱情，展现了运河文化的丰富内涵。著名的传说包括运河龙王、运河纤夫、运河商帮等。",
        "tags": ["运河", "聊城", "生活传说"],
        "genre": "传说",
        "origin_region": "山东聊城",
        "main_characters": "运河龙王、运河纤夫、运河商帮",
        "plot_summary": "1. 运河龙王保佑航运平安\n2. 运河纤夫艰辛劳作\n3. 运河商帮闯荡江湖\n4. 运河沿岸百姓生活\n5. 运河文化交流融合",
        "cultural_significance": "反映了运河沿岸人民的生活，展现了运河文化的丰富内涵",
        "related_scenic_spots": [],
        "collection_source": "运河民间故事集"
    },
    {
        "title": "黄河号子",
        "region": "东营",
        "summary": "黄河沿岸劳动人民在劳动中创作的民歌，节奏铿锵有力。",
        "content": "黄河号子是黄河沿岸劳动人民在劳动中创作的民歌。在黄河航运、筑堤、抢险等劳动中，人们为了统一节奏、鼓舞士气，创作了各种号子。黄河号子节奏铿锵有力，歌词朴实生动，反映了黄河人民的勤劳勇敢和乐观精神。著名的有黄河船工号子、黄河夯歌等。",
        "tags": ["黄河", "东营", "劳动号子"],
        "genre": "歌谣",
        "origin_region": "山东东营、滨州等地",
        "main_characters": "黄河船工、黄河纤夫、黄河筑堤工",
        "plot_summary": "1. 黄河船工拉纤行船\n2. 黄河夯歌筑堤抢险\n3. 号子统一劳动节奏\n4. 歌词反映生活艰辛\n5. 展现乐观精神",
        "cultural_significance": "反映了黄河人民的勤劳勇敢，展现了劳动人民的智慧和乐观精神",
        "related_scenic_spots": [],
        "collection_source": "黄河民间歌谣集"
    },
    {
        "title": "孔融让梨",
        "region": "济宁",
        "summary": "孔子后裔孔融幼时让梨的故事，体现礼让美德。",
        "content": "孔融让梨是孔子后裔孔融幼时的故事。孔融四岁时，与兄弟们一起吃梨，他每次都拿最小的。大人问他为什么，他说：'我年纪小，应该吃小的，大的留给哥哥们。'这个故事体现了中华民族礼让的传统美德，成为教育儿童的经典故事。孔融是孔子的二十世孙，山东曲阜人。",
        "tags": ["孔子", "济宁", "美德故事"],
        "genre": "故事",
        "origin_region": "山东济宁曲阜",
        "main_characters": "孔融、孔融兄弟",
        "plot_summary": "1. 孔融四岁与兄弟吃梨\n2. 每次都拿最小的梨\n3. 大人问其原因\n4. 孔融说年纪小应吃小的\n5. 体现礼让美德",
        "cultural_significance": "体现了中华民族礼让的传统美德，成为教育儿童的经典故事",
        "related_scenic_spots": [],
        "collection_source": "三字经故事"
    },
]

def gen_sql(records):
    """生成幂等 SQL"""
    lines = [
        "-- 民间文学种子数据（幂等：先删后插）",
        "-- 生成自 scripts/generate_literature.py",
        "",
    ]
    for r in records:
        # 公共表
        tags_json = json.dumps(r["tags"], ensure_ascii=False)
        lines.append(f"DELETE FROM cultural_item WHERE title='{r['title']}' AND category='literature';")
        lines.append(
            f"INSERT INTO cultural_item (category, title, summary, content, region, tags, status, source) "
            f"VALUES ('literature', '{r['title']}', '{r['summary']}', '{r['content']}', "
            f"{'NULL' if r['region'] is None else repr(r['region'])}, "
            f"'{tags_json}', 'draft', 'ai');"
        )
        lines.append("")
        
        # 扩展表
        related_spots_json = json.dumps(r["related_scenic_spots"], ensure_ascii=False)
        lines.append(f"DELETE FROM literature_detail WHERE item_id = (SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='literature');")
        lines.append(
            f"INSERT INTO literature_detail (item_id, genre, origin_region, main_characters, plot_summary, cultural_significance, related_scenic_spots, collection_source) "
            f"VALUES ((SELECT id FROM cultural_item WHERE title='{r['title']}' AND category='literature'), "
            f"'{r['genre']}', '{r['origin_region']}', '{r['main_characters']}', "
            f"'{r['plot_summary']}', '{r['cultural_significance']}', "
            f"'{related_spots_json}', '{r['collection_source']}');"
        )
        lines.append("")
    
    return "\n".join(lines)

def main():
    sql = gen_sql(LITERATURE)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Generated {len(LITERATURE)} literature seeds -> {OUT}")
    
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
