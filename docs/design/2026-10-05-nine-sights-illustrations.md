# 九城胜迹插画替换记录

日期：2026-10-05。分支：`auto/improve-20260814`。

## 问题

首页 `/map`（`MapView.vue`）的「九城胜迹」九张卡片，配图原本是
`src/components/SightArt.vue` 里的**程序化 SVG 水墨小景**：牡丹是几个同心圆 + 椭圆叶子，
泰山是绿色三角 + 红旗，曲阜孔庙是几何色块拼出的简化屋顶。作为占位方案零素材成本、
矢量无失真，但在真实内容密度下呈现明显的剪贴画感，与页面其余青绿山水素材不在一个水准。

## 决策

仓库里已存在 2026-10-02 写好的九条生图提示词
（`docs/design/2026-10-02-nine-sights-prompts.jsonl`）和空目录
`output/imagegen/nine-sights/_raw/`——当时环境没有可调用的生图工具，只备了案未执行。
本轮用该提示词补生成九张，风格对齐 2026-09-29 已验收的首页八张原画
（`output/imagegen/homepage-v2/`）。

对比过但未采用：

- **本地既有 `*_anime.jpg` 景点图**（如 `daming_lake_anime.jpg`）：画面自带中文标题与印章，
  与页面文字会叠字；且是蓝灰调，与九月的青绿调不一致。
- **`public/media/real/spots/*.png`**：实景摄影，与全站水墨插画语言冲突。
- **重绘 SVG**：不消耗生图积分，但表现力上限仍低于真实水墨插画。

## 结果

- 原画归档在 `output/imagegen/nine-sights/`，去水印件与 WebP 导出脚本同目录。
- 交付件落在 `display-v2/public/media/inkwash/sights/<slug>.webp`，共九张，合计 1.32 MB。
- `MapView.vue` 的 `.atlas-sight__image` 由 `<SightArt>` 改为 `<img>`；
  `SightArt.vue` 已删除（仅被 `MapView.vue` 引用）。
- `tests/nineSights.test.js` 中的「每个 slug 都有专属 SightArt 场景」改为
  「每个 slug 都有对应插画文件」+「素材目录无孤儿文件」，把校验对象从源码分支改为真实素材。

## 两个实现要点

1. **不使用 `mix-blend-mode: multiply`**。首页主画用 multiply 是因为其天空接近纯白，
   相乘后接近透明；本组插画纸底比卡片底色（`rgba(251,249,244,.22)` 叠在 `#F5F2EB` 上）
   略暖略深，相乘反而形成更明显的暗色矩形。
2. **外侧 6% 羽化为透明**。生成器未完全实现提示词里「四边淡出纸底」的要求，
   原图是硬边矩形，底部牡丹笔触被直角切断。A/B 对比（`_review/edge-ab.html`）
   显示 6% 既消除硬边又不伤构图，11% 会吃掉边缘笔触。

## 验收

- `node --test tests/nineSights.test.js` 4/4 通过；展示端构建成功。
- 桌面 1440 与窄屏 390 两个宽度截图逐张复核，九张出图正确、无错位、无裁头。
- 九张均已按 1:1 与放大尺度复核去水印结果，无残字、无接缝。

## 遗留

- 展示端全量单测 156 项中 2 项失败（`creationFlow.test.js` 的创作表单用例，
  报 `window is not defined`）。这两项不引用本次改动的任何文件；
  同工作树内 `PoemComposer.vue`、`HanziWriterChar.vue` 正被另一会话并发修改。
- 马踏湖一张按提示词要求「前景无人物」，成图舟上有一位极小舟子，属生成偏差，已评估保留。
