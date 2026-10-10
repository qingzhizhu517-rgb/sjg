#!/usr/bin/env python3
"""版式校验（只对可靠项设门禁）+ 并排对比条生成。

⚠️ 经验结论（2026-10-09 实测）：
    水墨画的淡墨渲染边缘处处是细线，**用像素启发式自动切出「题名文字块」不可靠**——
    先后试过「墨色阈值」「连通域」「局部密度分离细笔画」三种方法，
    都会被背景的山石、树石、芦苇干扰，把参考图自己也判成不合格。
    因此本脚本**只对「画幅比例」设门禁**（100% 可靠），
    题名位置/字号、人物占比、印章数量改由**并排对比条 + 目视**判定。

用法:
  verify_layout.py check  --kind poet|spot|cultural  <image...>
  verify_layout.py strip  --out <out.png>            <image...>   # 拼接对比条

退出码：check 模式下存在比例不合规时返回 1，否则 0
"""
import subprocess
import sys
from PIL import Image

ASPECTS = {"poet": (0.750,), "spot": (1.500,), "cultural": (1.000, 1.500)}
TOL = 0.010
FFMPEG = "/opt/homebrew/bin/ffmpeg"


def check(kind, files):
    bad = []
    for f in files:
        im = Image.open(f)
        a = im.size[0] / im.size[1]
        ok = any(abs(a - x) <= TOL for x in ASPECTS[kind])
        print(f"{'PASS' if ok else 'FAIL'}  {f.split('/')[-1]:<32} "
              f"{im.size[0]}×{im.size[1]}  比例 {a:.3f}  期望 {ASPECTS[kind]}")
        if not ok:
            bad.append(f)
    print(f"\n{len(files)} 张：通过 {len(files)-len(bad)}，比例不合规 {len(bad)}")
    print("提醒：题名位置/字号、人物占比、印章数量需另跑 strip 目视核对。")
    return 1 if bad else 0


def strip(out, files, cols=4, w=300):
    im0 = Image.open(files[0])
    h = round(w * im0.size[1] / im0.size[0])
    args = [FFMPEG, "-y", "-loglevel", "error"]
    for f in files:
        args += ["-i", f]
    parts = [f"[{i}:v]scale={w}:{h},setsar=1[v{i}]" for i in range(len(files))]
    layout = [f"{w*(i%cols)}_{h*(i//cols)}" for i in range(len(files))]
    parts.append("".join(f"[v{i}]" for i in range(len(files)))
                 + f"xstack=inputs={len(files)}:layout={'|'.join(layout)}[out]")
    args += ["-filter_complex", ";".join(parts), "-map", "[out]",
             "-frames:v", "1", out]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        print("拼接失败:", r.stderr[-400:])
        return 1
    print(f"OK  {out}  （{len(files)} 张，{cols} 列；请按顺序目视核对版式）")
    for i, f in enumerate(files, 1):
        print(f"  {i:>2}. {f.split('/')[-1]}")
    return 0


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "check":
        kind = sys.argv[sys.argv.index("--kind") + 1]
        files = [a for a in sys.argv[2:] if not a.startswith("--") and a != kind]
        sys.exit(check(kind, files))
    elif mode == "strip":
        out = sys.argv[sys.argv.index("--out") + 1]
        files = [a for a in sys.argv[2:] if a != "--out" and a != out]
        sys.exit(strip(out, files))
    else:
        raise SystemExit(__doc__)
