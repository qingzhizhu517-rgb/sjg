#!/usr/bin/env python3
"""印章占位补图 · 管线后处理（生成 → 裁水印 → 缩放裁切 → WebP）

用法:
  process.py <raw_png> <out_webp> <mode>

mode: portrait(1086x1448) | landscape(1536x1024) | square(1024x1024)

与 .workbuddy/skills/sjg-media-assets 的约定一致：
  1. 裁掉底部 8% 的「AI生成 WORKBUDDY」水印
  2. 缩放到目标宽，再居中裁切到目标尺寸
  3. cwebp -q 82 导出（比 ffmpeg libwebp 更好控制）
"""
import os
import subprocess
import sys
import tempfile

FFMPEG = "/opt/homebrew/bin/ffmpeg"
CWEBP = "/opt/homebrew/bin/cwebp"

MODES = {
    "portrait": (1086, 1448),
    "landscape": (1536, 1024),
    "square": (1024, 1024),
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"命令失败: {' '.join(cmd)}\n{r.stderr[-1200:]}")
    return r


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    if mode not in MODES:
        raise SystemExit(f"未知 mode: {mode}（可选 {list(MODES)}）")
    if not os.path.isfile(src):
        raise SystemExit(f"源文件不存在: {src}")
    w, h = MODES[mode]

    with tempfile.TemporaryDirectory() as tmp:
        step1 = os.path.join(tmp, "1_nowm.png")
        step2 = os.path.join(tmp, "2_sized.png")
        # 1) 裁水印：去掉底部 8% 高度
        run([FFMPEG, "-y", "-loglevel", "error", "-i", src,
             "-vf", "crop=iw:trunc(ih*0.92/2)*2:0:0", step1])
        # 2) 等比放大到「铺满」目标框，再居中裁切（cover 语义，兼容任意源比例）
        run([FFMPEG, "-y", "-loglevel", "error", "-i", step1,
             "-vf", (f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,"
                     f"crop={w}:{h}"), step2])
        # 3) 导出 WebP
        os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
        run([CWEBP, "-q", "82", "-quiet", step2, "-o", dst])

    size_kb = os.path.getsize(dst) / 1024
    print(f"OK  {dst}  {w}x{h}  {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
