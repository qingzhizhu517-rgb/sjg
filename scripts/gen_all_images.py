#!/usr/bin/env python3
"""批量生成缺失图片脚本。运行: python3 scripts/gen_all_images.py"""

import subprocess, time, os, sys

MODEL = "doubao-seedream-5.0-lite"
SIZE = "2048x2048"
OUTDIR = "output/imagegen"
DELAY = 310

EVENTS = [
    ("pu_gathering", "清代蒲松龄在淄川柳泉边茅亭下设茶收集民间故事，传统水墨工笔风格，柳树成荫文人执笔"),
]

SPOTS = [
    ("华不注山","山东济南华不注山实景照片，春秋名山孤峰刺天，自然山水风光蓝天绿树"),
    ("华山","山东济南华山古称华不注实景照片，孤峰耸立于黄河南岸自然风光"),
    ("德州黄河号子","山东德州黄河号子文化表演场景，黄河流域岸边劳动号子传统文化"),
    ("曲阜阙里","山东曲阜阙里历史文化街区实景，孔子故里古建筑牌坊儒家文化"),
    ("文宣王庙","山东曲阜孔庙大成殿实景，文宣王庙红墙黄瓦中国古代建筑儒家圣地"),
    ("济宁太白楼","山东济宁太白楼实景，唐代贺兰氏酒楼李白常饮处古建筑文化地标"),
    ("济宁南池","山东济宁南池公园实景，古代园林荷花池塘绿树成荫历史景观"),
    ("京杭大运河济宁段","京杭大运河济宁段实景，古运河河道两岸绿树历史水路水乡风光"),
    ("兖州城楼","山东兖州城楼遗址实景，古城遗迹历史建筑遗址山东历史文化"),
    ("济宁石门山","山东济宁石门山泗水实景，自然山水山川河流山东风光"),
    ("济宁浣笔泉","山东济宁浣笔泉实景，历史名泉泉水清澈古典园林景观"),
    ("石佛寺济宁","山东济宁石佛寺实景，佛教寺庙古建筑红墙宗教文化"),
    ("济宁王母阁","山东济宁王母阁南城实景，古建筑楼阁历史文化景观"),
    ("济宁南湖","山东济宁南湖实景，城市湖泊碧水蓝天公园风光"),
    ("东明漆园庄子钓台","山东菏泽东明漆园庄子钓台实景，庄子文化遗址古钓台湿地风光"),
    ("东明漆园","山东菏泽东明漆园实景，庄子为吏处历史文化遗址古代园林"),
    ("郓州谿堂","山东泰安东平郓州谿堂实景，唐代官署园林遗址古建筑汶水流域"),
    ("新堂","山东泰安东平新堂实景，古建筑遗址历史文化景观"),
    ("郓城七陵碑古迹","山东菏泽郓城七陵碑汉代遗存实景，古碑石刻历史文化遗址"),
    ("古鄄城","山东菏泽鄄城古鄄城实景，古城遗址尧舜文化发祥地"),
    ("楚丘城","山东菏泽曹县楚丘城遗址实景，上古楚人聚居地商汤会盟之所"),
    ("古濮水","山东菏泽古濮水遗迹实景，上古濮文化发源地古水道遗迹"),
    ("曹州城","山东菏泽曹州城实景，北周始设古城历史文化名城"),
    ("东阿县","山东聊城东阿县实景，曹植封王地黄河阿胶文化核心地"),
    ("阳谷县","山东聊城阳谷县实景，水浒文化古城历史文化名县"),
    ("盟台","山东聊城阳谷盟台春秋会盟遗址实景，古高台齐鲁盟会文化"),
    ("灵泉","山东聊城阳谷灵泉古阿井实景，阿胶文化发源地古泉水"),
    ("泰山岱顶观河","泰山玉皇顶岱顶观河实景，泰山之巅远眺黄河壮丽山河"),
    ("大明湖小沧浪亭","济南大明湖小沧浪亭实景，清代阮元建亭湖畔古典园林"),
    ("济南趵突泉","济南趵突泉实景，天下第一泉泉水喷涌古典园林"),
    ("济宁太白酒楼","济宁太白酒楼实景，李白饮酒处古建筑历史文化"),
    ("青岛崂山","青岛崂山实景，道教名山山海相连壮丽自然风光"),
]

POETS = [
    ("曹操","曹操历史人物肖像画，东汉末年政治家军事家诗人，传统水墨工笔威严气度"),
    ("韩愈","韩愈历史人物肖像画，唐代文学家唐宋八大家之首，传统水墨工笔文人气质"),
    ("李商隐","李商隐历史人物肖像画，晚唐著名诗人，传统水墨工笔忧郁诗人"),
    ("文天祥","文天祥历史人物肖像画，南宋名臣诗人，传统水墨工笔正气凛然"),
    ("蒲松龄","蒲松龄历史人物肖像画，清代文学家聊斋志异作者，传统水墨工笔文人雅士"),
    ("高适","高适历史人物肖像画，唐代边塞诗人，传统水墨工笔豪迈英武"),
    ("关汉卿","关汉卿历史人物肖像画，元代戏曲家元曲四大家之首，传统水墨工笔"),
    ("王士禛","王士禛历史人物肖像画，清初诗坛领袖，传统水墨工笔文雅学者"),
    ("林逋","林逋历史人物肖像画，宋代隐逸诗人梅妻鹤子，传统水墨工笔清雅隐士"),
]

def run_gen(dir_name, filename, prompt):
    outpath = os.path.join(OUTDIR, dir_name, f"{filename}.jpg")
    if os.path.exists(outpath) and os.path.getsize(outpath) > 50000:
        print(f"  SKIP: {outpath}")
        return True
    print(f"  GEN: {dir_name}/{filename}")
    cmd = ["arkcli","+gen","--model",MODEL,"--size",SIZE,"--save-to",f"{OUTDIR}/{dir_name}","--no-open",prompt]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if r.returncode != 0:
            print(f"  FAIL: {r.stderr[:200]}"); return False
        for ext in [".jpeg",".jpg"]:
            src = os.path.join(OUTDIR, dir_name, f"ark-gen{ext}")
            if os.path.exists(src):
                os.rename(src, outpath)
                print(f"  OK: {outpath} ({os.path.getsize(outpath)//1024}KB)")
                return True
        print(f"  WARN: no output file"); return False
    except subprocess.TimeoutExpired:
        print(f"  TIMEOUT"); return False

def gen_all(tasks, d):
    s = 0
    for i,(n,p) in enumerate(tasks):
        print(f"[{i+1}/{len(tasks)}]"); ok = run_gen(d, n, p); s += ok
        if i < len(tasks)-1:
            print(f"  waiting {DELAY}s..."); time.sleep(DELAY)
    return s, len(tasks)

def main():
    for d in ["events","spots","poets"]: os.makedirs(f"{OUTDIR}/{d}", exist_ok=True)
    print("=== Image Batch Generator ===")
    for label, tasks, d in [("Events", EVENTS, "events"), ("Scenic Spots", SPOTS, "spots"), ("Poets", POETS, "poets")]:
        print(f"{label} ({len(tasks)}):"); ok,tot = gen_all(tasks, d); print(f"  done: {ok}/{tot}")
    for d in ["events","spots","poets"]:
        print(f"{d}/: {len(os.listdir(f'{OUTDIR}/{d}'))} files")

if __name__ == "__main__": main()
