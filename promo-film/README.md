# 《山河有迹 · 文脉有声》— SJG 宣传片

约 102 秒，1920×1080，30fps。片子是纪录片式的水墨风格，配中文旁白、原创配乐和真实页面实录。这个目录**不依赖任何 npm 包**：只用 Node 24、系统 `ffmpeg`、macOS `say`，以及 Playwright 缓存里的 Chrome for Testing。

## 一键出片

```bash
cd promo-film
# 前提：display-v2(5175)、sjg-datav(5180)、admin(5173)、后端(8080) 都在运行，且本地库内容已发布
node scripts/narration.mjs --force   # 1. 逐句 TTS（say -v Tingting），实测每句时长
node src/plan.js                      # 2. 按实测时长排出分镜表 → .build/plan.txt
node tools/capture.mjs                # 3. 用 CDP 截取 17 个真实页面 → .build/capture/
node scripts/compose-score.mjs        # 4. 代码合成原创配乐 → .build/score.wav
node scripts/render.mjs               # 5. 逐帧确定性渲染 → .build/frames/
node scripts/mix.mjs                  # 6. 旁白定位 + 人声处理 + 配乐闪避 + 合成 → dist/
```

审片时只渲染几帧：`node scripts/render.mjs --stills 4,20,45 --dir .build/stills`

## 结构

| 幕 | 内容 | 镜头 |
|---|---|---|
| 一 · 大河入境 | 黄河自西而来，九曲入海 | 印章冷开场 → 「河」字晕开 → 长卷 → 沿黄九市地图 |
| 一 · 九城 | 菏泽 → 东营九城，每城一句旁白 + 一句平台库中的真实诗句 | 九城各出场一次；泰山 / 大明湖 / 入海三处放慢、加印章 |
| 二 · 收于一河 | 城因河而生，诗因人而传 | 望岳 → 诗词检索 / 诗人图谱 / 文脉长河 / 齐鲁文化 / 数据大屏（真实截图） → 九城归一河 → 数字 |
| 三 · 初心 | 审核溯源、AI 小文、一城一课 | 诗词详情 + 审核状态 → 对话示意 → 研学任务 → 落款 |

## 渲染原理

- 每一帧先由场景代码在 Canvas2D 上画一张平面图，再交给一个 WebGL2 着色器（`src/film/shaders.js`）加效果：液态扭曲、流动河带、墨晕、纤维侵蚀、湿边、纸纹颗粒、暗角和遮幅。
- `__film.frame(t)` 只由时间 `t` 决定，不依赖实际经过的时间，所以同一帧每次渲染结果都一样，可以单帧审看。
- 分镜时长以旁白实测时长为下限（`fit()`），先套 `PACE` 缩放、再做 fit，因此 `SJG_PACE` 调得再紧也不会截断旁白。
- 段落之间不是硬切：`src/film/index.js` 的 `TRANSITIONS` 按镜头 id 对声明边界，着色器的 `uWipe` 用噪声边缘把画面洇成纸色再吐出来。按 id 而非按时间定义，改时长后自动跟随。
- 配乐是代码合成的（`scripts/compose-score.mjs`）：六层各自呼吸的低音铺底 + 缓慢三和弦垫（Dm→Bb→F→C→Am→F→Dm）+ 古琴拨弦点缀 + 6 comb 长混响，长度精确对齐 `plan.total`。

## 内容口径

- 诗句、诗人、景点都来自 `display-v2/src/config/nineSights.js` 与 `sjg01` 中的真实数据。
- 统计数字为 2026-10-02 的 `sjg01` 全表计数：129 位诗人、203 首诗、71 处胜迹、63 项风物。
- `source_document` / `content_source_link` 目前为空，所以溯源镜头只展示真实存在的绑定（原文、关联胜迹、审核状态），**没有虚构书目**。
- AI 对话标注为「对话示意」，学生诗句标注为「示例」。
- 九城配图统一取 display-v2 首页「九城胜迹」那套青绿山水插画（`public/media/inkwash/sights/`，见 `film/paths.js` 的 `SIGHTS`），一城一张、含滨州 · 无棣碣石山，不再借用黄河长卷。

## 版本管理范围（2026-10-10）

当前宣传片及 v2 的源码、脚本、计划和配音母版纳入主干。`.build/`、渲染帧、质检产物与 `dist/` 保持本地；重新生成前须检查所需素材与 API 配置。

历史交付的 `original-repair/` 按用户选择保留在本地，不纳入当前主干。其测试依赖旧的生成时间轴，当前上级 `.build/plan.json` 已被后续渲染覆盖，不能据此重渲染旧修复稿；原片、修复成片与交付材料均保留。
