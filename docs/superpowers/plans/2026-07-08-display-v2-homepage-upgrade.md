# display-v2 三页面升级方案 · 墨卷 Hero + 真实数据 + 动效

> 分支：`feat/display-v2-homepage-upgrade`
> 重点：齐鲁名士 / 文脉长河（用户点名"太单调"）；山河图志轻量带过。
> 目标：好看。用真实数据 + 墨卷对比 + 代表句填卡破"空洞单调"。

## 一、设计判断与拨码
- 判断：中式水墨"数字人文杂志"，双主题（real / inkwash），Vue3 + Vite，面向学术 + 大众。
- 拨码：`VARIANCE 7 / MOTION 7 / DENSITY 4`。
- 三大病灶（审计实测）：
  1. 三页都是浅米色平铺、无明暗对比 → 视觉单调。
  2. 诗人卡依赖 `biography` / `style`，但 **130 位诗人中仅 7 位有 bio、0 位有 style**，123 张卡渲染出来是空的 → 卡片空洞（这才是"单调"真凶，不只是排版）。
  3. 统计造假：PoetList "200+ 传世诗篇"（实 195）、Timeline "50+ 历史事件"（实仅 3）、MapView "10 景点"（实 70）。

## 二、三个核心设计动作

### 动作 A · 墨卷 Hero（破单调主力）
每页顶部改用**深墨色全宽 Hero**（墨色 `#1C1A17→#2A2520` 渐变 + 山脉剪影 SVG + 金粉环境动效），**左对齐**（非居中），朱砂印章式 eyebrow、米色大标题、金/朱统计数字。这是合规的"单次主题切换 Color Block"，打破全页浅米平铺，强烈、中式、非 AI 默认居中浅 hero。下方内容区保持浅纸。

### 动作 B · 用"代表句"填卡（破空洞主力）
诗人卡不再依赖空的 bio/style。前端拉一次 `/api/public/poems?size=200`，构建 `poetId → {poemCount, signaturePoem{title, firstLine, sentimentTags}}` 映射：
- 有 bio 的 7 位 → 显示 bio
- 无 bio 的 123 位 → 显示代表句（如杜甫「海右此亭古，济南名士多」《陪李北海宴历下亭》）+ 诗数
- 无头像（111 位）→ 朱砂"字"印章 monogram（取名字首字），不显示空 img / 不用假图

### 动作 C · 真实数字 + 数据驱动
全部统计用真实值；朝代筛选由 `/timeline` 的 9 朝代驱动（带真实诗人计数）。

| 页面 | Hero 统计（真实） |
|---|---|
| 齐鲁名士 | 130 名士 / 9 朝 / 195 篇 / 70 景 |
| 文脉长河 | 9 朝 / 130 文人 / 195 诗篇 / 近四千年文脉 |
| 山河图志 | 70 景观 / 130 文人 / 195 名篇 / 9 沿黄城 |

> 朝代诗人真实分布：清 48、明 35、元 15、隋唐 14、宋 14、魏晋 2、秦汉 1、金 1、先秦 0（重头在明清，非唐宋）。
> 沿黄城市真实景点数：菏泽 20 / 济南 15 / 济宁 10 / 聊城 7 / 德州 5 / 泰安 3 / 淄博 2 / 东营 2 / 滨州 1（来自 `/spots/regions`）。

## 三、设计系统细节
- **配色**：不动全局 token（回归风险低）。Hero 内用局部墨色面板 + 朱砂 `#9E2B25` + 金 `#B8860B` + 米色 `#F2EBD9` 文字。real/inkwash 双主题下 Hero 都用墨底（inkwash 本就偏墨）。
- **eyebrow 规则**：弃用 `— 文 字 —` 破折号框（装饰破折号 tell），改朱砂印章框（border + 印字），更中式更克制。全页 eyebrow ≤ 每 3 区块 1 个。
- **破折号规则**：引文署名 `—— 作者` **保留**（中文破折号规范，非英文 AI tell）；其余装饰破折号不用。这是有据可循的上下文豁免，不机械套用 em-dash 禁令。
- **图标**：不引入新图标库（避免与导航手写 SVG 混族，遵守"一族一项目"）。复用现有字符法（`→`、`印`、数字）。
- **动效**：GSAP + ScrollTrigger（gsap 已在 node_modules，需补写入 `package.json`）。
  - Hero 进场：墨晕 + 标题上浮 + 数字 count-up，stagger 0.12s，`power3.out`。
  - 卡片滚动揭示：`ScrollTrigger` `top 85%`，stagger。
  - 统计 count-up：进入视口翻牌。
  - Hero 金粉/河水光带环境（常驻、有动机：卷轴氛围）。
  - 全部包 `prefers-reduced-motion` 降级；ScrollTrigger / timeline 卸载 `kill()`。
- **圆角**：统一 4px（卡片）/ 2px（印章、徽章）/ 100px（chip），与现有一致。

## 四、共享组件（新建 `display-v2/src/components/homepage/`）
- `InkHero.vue` — 墨卷 Hero（props: eyebrow / title / subtitle / stats[] / cta? / ambient?）。替代 spec 的 `HeroBanner`。
- `StatTicker.vue` — count-up 数字（GSAP），墨底/浅底自适应。
- `SectionHeading.vue` — 区块标题（eyebrow 可选，克制）。
- `FeaturedPoemCard.vue` — 今日名句卡（诗句 + 作者 + 朝代 + sentiment 标签）。
- `FeaturedPoetCard.vue` — 名士推荐大卡（bio 或代表句）。
- `FeaturedSpotCard.vue` — 景点推荐卡。
- `CityQuickCard.vue` — 沿黄九城卡（用 `/spots/regions` 真实 spotCount）。
- `DynastyRail.vue` — 横向朝代选择器（Timeline 主用，PoetList 可复用）。
- `SkeletonBlock.vue` / `ErrorState.vue` — 占位 / 错误。

## 五、Composables（新建 `display-v2/src/composables/`）
- `useReveal.js` — GSAP 滚动揭示（spec 版可用，补 cleanup）。
- `useAmbientFx.js` — Hero 金粉 / 河水光带（仅墨卷 Hero 内，动机明确）。
- `useCountUp.js` — 数字翻牌。
- `usePoetEnrichment.js` — 拉全量 poems，构建 `poetId → {poemCount, signaturePoem}` 映射（核心数据补全，替代 spec 依赖后端 `/stats`、`/poets/featured` 等不存在接口）。
- `useTheme.js` / `useImage.js` 不动。

## 六、齐鲁名士 PoetList 改造（重点）

```
┌──────────── 墨卷 HERO（深墨，左对齐）────────────┐
│ [朱砂印] 齐鲁文脉                                  │
│ 齐鲁名士                                           │
│ 副标（≤20字）                                      │
│ 130 名士 · 9 朝 · 195 篇 · 70 景  [count-up]      │
│ [金粉环境动效]                                     │
└───────────────────────────────────────────────────┘
┌── 今日名句（FeaturedPoemCard，横通栏）────────────┐
│ 「海右此亭古，济南名士多」 [幽思 悠远 壮阔 豪放]   │
│ —— 杜甫 · 隋唐 《陪李北海宴历下亭》               │
└───────────────────────────────────────────────────┘
┌── DynastyRail 朝代筛选（9 朝 + 计数）+ 视图切换 ──┐
│ 全部(130) 先秦(0) 秦汉(1) ... 清(48)  [长廊][图谱]│
└───────────────────────────────────────────────────┘
┌── 名士卡墙（代表句填卡，bento 节奏）──────────────┐
│ ┌杜甫──┐ ┌李白──┐ ┌曾巩──┐                          │
│ │隋唐 9│ │隋唐 9│ │宋  4 │  ...                      │
│ │代表句│ │代表句│ │代表句│                          │
│ └──────┘ └──────┘ └──────┘                          │
└───────────────────────────────────────────────────┘
G6 图谱 tab 保留（面板重样式匹配，硬编码数据本轮不动）
```
具体改动：
1. 删现有 `.view-header`（split header），换 `InkHero`（避免重复 hero）。
2. 新增"今日名句"通栏（client-side 选一首 content 丰满 + 有 sentiment_tags 的诗，如杜甫《陪李北海宴历下亭》）。
3. 朝代筛选由硬编码 5 个 → `/timeline` 9 朝代数据驱动，带真实计数；竖排竹简改横向 `DynastyRail`（移动端横滚）。
4. 卡片：bio 有则显 bio，否则显代表句 + 诗数；无头像用朱砂字印章。
5. 卡墙 bento 节奏：有 bio 的 7 位用大卡，其余标准卡（避免 6 张同形左图右文重复）。
6. 动效：Hero 进场、卡墙 stagger 滚动揭示、hover lift（已有）。

## 七、文脉长河 Timeline 改造（最单调，重点）

```
┌──────────── 墨卷 HERO ────────────┐
│ [印] 朝代年轮    文脉长河           │
│ 9 朝 · 130 文人 · 195 篇 · 近四千年 │
│ [河水光带环境动效]                  │
└────────────────────────────────────┘
┌── 朝代年轮 DynastyRail（横向可点选）──────────────┐
│ 先秦 → 秦汉 → 魏晋 → 隋唐 → 宋 → 金 → 元 → 明 → 清│
│  (年份区间 + 诗人计数)                              │
└────────────────────────────────────────────────────┘
┌── 当前选中朝代详情（默认隋唐）────────────────────┐
│ 隋唐  581–907                                     │
│ ┌ 史事 ┐ ┌ 代表诗人 ┐ ┌ 传世诗篇 ┐                │
│ │event │ │ 李白 杜甫 │ │ 《望岳》 │  (2-3 列)     │
│ └──────┘ └──────────┘ └─────────┘                │
└────────────────────────────────────────────────────┘
┌── 诗风演变 跨朝代长条（视觉化）──────────────────┐
│ 诗经·现实 → 楚辞·浪漫 → 唐诗·气象 → 宋词·意趣 → 元曲·民俗│
└────────────────────────────────────────────────────┘
┌── 文脉之最 bento（真实极值）──────────────────────┐
│ 最多诗人朝代：清(48) │ 最长跨度：先秦(1849年) │ ... │
└────────────────────────────────────────────────────┘
```
具体改动：
1. 删现有 `page-hero`，换 `InkHero`。
2. 把"一条长竖列 TimelineItem 列表"改成 **DynastyRail 交互选择器 + 选中朝代详情面板**（被动长滚 → 主动探索，破单调主力）。默认选隋唐（最有名）。
3. 朝代详情用 2-3 列（史事 / 诗人 / 诗篇），数据来自现有 `/timeline`（已含 events/poets/poems，无需改后端）。
4. 底部加"诗风演变"视觉长条 + "文脉之最"bento（真实极值：清 48 最多诗人、先秦近 1849 年最长跨度）。
5. 动效：朝代切换 fade/slide、Hero 进场、河水光带环境。

## 八、山河图志 MapView 轻量改造（次要）
1. 顶部加 `InkHero`（现无 hero，最空的一页）。
2. 3D 沙盘保留不动。
3. 加"本期推荐景点"2 卡（`/spots`）+ 沿黄九城快入墙（`/spots/regions` 真实 spotCount）。
4. 去掉 HUD 与 Hero 的统计重复。

## 九、实施顺序
- **P0 基建**：gsap 写入 `package.json`；建 `homepage/` 与 `composables/`；写 `usePoetEnrichment` / `useReveal` / `useCountUp` / `useAmbientFx`。
- **P1 共享组件**：InkHero、StatTicker、SectionHeading、FeaturedPoem/Poet/SpotCard、CityQuickCard、DynastyRail、Skeleton、ErrorState。
- **P2 齐鲁名士**改造 + 本地验证。
- **P3 文脉长河**改造 + 本地验证。
- **P4 山河图志**轻量 hero + 推荐位。
- **P5 验收**：real + inkwash 双主题、移动端、reduced-motion、ScrollTrigger 无泄漏、数字真实。

## 十、验收 DoD
- [ ] 三页都有墨卷 InkHero（印章 eyebrow / 标题 / 副标 / StatTicker / 朱砂统计）
- [ ] 统计全为真实数（130 / 195 / 9 / 70 / 近四千年），无 200+ / 50+ 假数
- [ ] PoetList 卡片：无 bio 的诗人显示代表句 + 诗数；无头像显示字印章
- [ ] PoetList 朝代筛选 9 朝数据驱动 + 真实计数
- [ ] Timeline 由长列改为 DynastyRail + 朝代详情面板
- [ ] Timeline 底部诗风演变 + 文脉之最
- [ ] real + inkwash 双主题美观
- [ ] GSAP 进场 / 揭示 / count-up 全开且包 reduced-motion
- [ ] 移动端 <768px 可用
- [ ] 卸载无 ScrollTrigger / timeline 泄漏
- [ ] 不改后端契约（仅前端；可选后续加 `/api/public/poets/cards` 省一次请求）

## 十一、范围与风险
- **不改后端**（客户端 join poems 195 首 ~100KB，可接受）。可选后续：加 `/api/public/poets/cards` 富化接口。
- **不动**：router / App.vue / useTheme / useImage / 详情页 / 后端 Java 代码。
- G6 图谱硬编码数据本轮不动（仅重样式），后续可数据驱动。
- 风险：墨卷 Hero 与浅纸内容对比需在 real + inkwash 双主题下验证； poets 全量 join 需确认 `/poems` 分页能一次取 200（PageResult 默认 size 20，需传 size=200）。
