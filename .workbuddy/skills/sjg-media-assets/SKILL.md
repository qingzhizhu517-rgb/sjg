---
name: sjg-media-assets
description: SJG 项目双风格媒体素材批量生成与处理流程。当需要为 display-v2 生成 AI 图片/视频素材（real 实景风 / inkwash 水墨风）、处理素材入库时使用。触发词：生成素材、批量生成图片、生成视频素材、media 素材、P2-MEDIA。
agent_created: true
---

# SJG 双风格媒体素材生成流程

## 适用场景
display-v2 需要 AI 生成视觉素材（对应任务文档 P2-M5~M9 大批量批次），或任何向 `display-v2/public/media/` 添加素材的工作。

## 目录与命名约定
```
display-v2/public/media/
├── real/                 # 写实文博风
│   ├── hero-map.mp4      # 首页 hero 视频
│   ├── hero-map-poster.jpg
│   └── spots/{slug}.png  # 景点实景图，slug 用英文 snake_case
└── inkwash/              # 水墨长卷风
    ├── hero-open.mp4
    ├── hero-open-poster.jpg
    └── hero-scroll.png
```
- 路径与后期 OSS 同构（OSS bucket 内保持相同相对路径），前端通过 `VITE_OSS_BUCKET_URL` 切换，零改代码。
- 命名：`{场景}-{名称}.{ext}`，目录已区分风格，文件名不再带 real/ink 后缀。

## 生成参数基线
- **视频**：VideoGen，5s、1080P、16:9、`enable_audio: false`、`watermark: false`。real 提示词强调"航拍/实景摄影/纪录片风格"；inkwash 强调"水墨/宣纸/留白/朱砂印章"。
- **图片**：ImageGen，横版 `1536x1024`、`quality: high`。景点图 prompt 模板：「{景点名}实景摄影，{建筑/自然特征}，{光线}，{构图}，专业{建筑|风光}摄影，高画质，无人群」。

## 生成后必做四步（AI 输出有已知坑）
1. **归位**：`output_dir` 参数不可靠，文件可能落错目录（real/inkwash 互换发生过）。生成后立即 `mv` 到正确目录并重命名为约定名。
2. **去水印**：ImageGen 输出默认带右下角"AI生成 WORKBUDDY"水印（约底部 8% 高度）。裁剪：
   ```bash
   ffmpeg -y -i in.png -vf "crop=iw:trunc(ih*0.92/2)*2:0:0" out.png
   ```
   横版图统一裁后为 1216×764。
3. **视频压缩**：VideoGen 原始输出巨大（5s/1080P ≈ 20MB），必须二次压缩（去音轨 + faststart）：
   ```bash
   ffmpeg -y -i in.mp4 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart out.mp4
   ```
   目标：hero 视频 ≤ 3MB。水墨类静态画面多可用 CRF 26。
4. **导出 poster**：`<video>` 的 poster 封面帧：
   ```bash
   ffmpeg -y -i video.mp4 -ss {中点秒数} -frames:v 1 -q:v 4 poster.jpg
   ```

## 验收
- 图片：Read 工具目视检查质量与水印是否除净。
- 视频：`ffprobe` 确认时长/分辨率/`du -h` 确认体积达标。
- 完成后更新 `docs/plans/2026-08-05-display-v2-ui-optimization-tasks.md` 对应 P2-M 条目为 `[x]` 并注明日期。

## 成本提示
生成前必须告知用户积分消耗：视频每 5s 约 50-100 积分，图片每张约 5-10 积分。大批量生成（如九城全套）先列清单让用户确认再执行。
