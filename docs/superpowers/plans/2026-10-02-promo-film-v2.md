# 山河有迹·文脉有声 第二版制作计划

> **For agentic workers:** Use subagent-driven-development for isolated support tasks; preserve all unrelated working-tree edits. Execute without further approval, as the user approved this redesign.

**Goal:** 导出一部不使用旧景观插画、地图表达可靠、文字清楚、产品操作可理解的新版宣传片。

**Architecture:** 在 promo-film/v2 建立独立 Canvas2D 时间轴和制作脚本，复用现有技术基础但不修改第一版。地图使用有来源的地理数据；产品段重新采集实际运行的网站操作。音乐可沿用原始独立配乐轨并重新混音；旁白使用已有本地合成能力，明确不承诺真人配音。

**Tech Stack:** JavaScript / Canvas2D / 原生 CDP / FFmpeg / macOS say / Python Pillow。

## 范围与验收
- 新文件仅写入 promo-film/v2、promo-film/dist 与本计划。
- 不调用 arkcli，不调用生图服务，不使用旧景观插画或旧截图作为视频画面。
- 输出 1920×1080、30fps H.264/AAC MP4，原片完整保留。
- 产品首次出现不迟于全片前四分之一；诗句、地名、功能文字至少24px，核心字幕36px以上。
- 重要文字位于四周96px安全区；文字与界面不受水纹扭曲、颗粒、色散影响。
- 地图底图、河道、城市点位分别表达；资料尺度写入来源说明，成片称区域示意，不宣传导航精度。
- 真实操作与示意动画严格区分；不虚构来源、数据统计和未实现功能。
- 关键帧、每秒接触表、完整解码和响度检查通过后交付。

## 制作任务
- [x] 1. 地理资料：核对可用河道/行政边界，导出 v2/data/map.json 与来源记录，提供范围/点数/坐标检查。
- [x] 2. 界面采集：在现有运行网站实测搜索《望岳》、打开诗词/作者/研学入口，生成新截帧/操作视频及记录，禁止用旧截图填补失败。
- [x] 3. 时间轴：围绕“诗句→地点→原文→人物→研学”编排70–90秒；米白、墨色、朱红统一设计。
- [x] 4. 画面制作：新建 v2/index.html、v2/film.js、v2/draw.js，统一字号安全区，构建地图追踪、诗句标记与界面聚焦动作。
- [x] 5. 声音：v2/prepare.mjs 编排逐句旁白/字幕并测量时长；使用低音量配乐、淡入淡出及人声避让。
- [x] 6. 输出：v2/render.mjs 渲染关键帧并审查，之后全片渲染到独立 dist 文件。
- [x] 7. 质检：记录画面缺失、文字越界、场景边界、帧数、解码与声音响度；问题修复后重新验证受影响区段。

## 完成记录（2026-10-03）

成片77.7秒、2331帧，导出到 `promo-film/dist/山河有迹·文脉有声-清晰叙事版.mp4`。原版保留。完整解码、黑帧、响度和帧数校验通过；已查看78张逐秒采样帧、24张转场边界帧及九场景关键帧。自制字幕36px；地图与自制功能文字不低于24px。真实网页内部辅助小字保留原貌，通过裁剪聚焦核心内容，未为达到字号而改造网页。杜甫高清采集使用已验证的58帧完整动作子集，详情写入对应清单。配音的技术指标合格不代表真人自然度。

## 验证命令
```sh
node --check promo-film/v2/film.js
node promo-film/v2/prepare.mjs
node promo-film/v2/render.mjs --stills
node promo-film/v2/render.mjs
node promo-film/v2/mix.mjs
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,avg_frame_rate,nb_frames -of json 'promo-film/dist/山河有迹·文脉有声-清晰叙事版.mp4'
ffmpeg -v error -i 'promo-film/dist/山河有迹·文脉有声-清晰叙事版.mp4' -f null -
```
