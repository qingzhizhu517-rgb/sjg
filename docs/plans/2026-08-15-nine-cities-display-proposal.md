# 九城五类前端展示设计提案（任务 2）

> 配套提示词：`docs/ai-fix-prompts-2.md` 任务 2。本提案先于实现，待确认后分批落地（每批独立 commit）。
> 现状（2026-08 实测）：
> - 路由：`/festivals`+`/festivals/:id`(专用 FestivalDetail)、`/crafts`(列表，**无详情路由**)、`/literature`+`/:id`、`/food-opera`+`/:id`（后两者共用通用 `CulturalDetail.vue`）
> - `src/config/culturalCategories.js`：literature/food_opera 仍标 `ready:false`（过时）
> - 后端：`/api/public/cultural` 支持 `region` 筛选；`/api/public/spots` 支持 `region`；`/api/public/spots/regions` 九城聚合（**城市顺序有误**：滨州在淄博前）；`/api/public/poems`、`/poets` **无 region 参数**
> - 通用组件可用：`CulturalDetail.vue`、`EmptyState`、`ErrorState`、`SkeletonBlock`、`SectionHeading`、`DynastyRail`、印章样式（MapView/PoetList 内多处散落）

## 设计目标

「九城 × 五类」展示闭环：任一城市任一类内容可达 → 详情可看 → 可回列表/回城；双主题（real/inkwash）一致；视觉对齐 `japanese-minimal`（留白、衬线、朱红唯一点缀、1px 细线、禁渐变阴影——inkwash 主题强化，real 主题克制收敛）。

## 页面/路由清单（提案）

| # | 页面 | 路由 | 说明 | 复用 |
|---|---|---|---|---|
| 1 | 详情统一 | `/festivals/:id` 改指 `CulturalDetail.vue`；新增 `/crafts/:id` → 同组件 | festival/craft 字段组加入 `DETAIL_LABELS`；`FestivalDetail.vue` 退役（保留文件待删确认） | `CulturalDetail.vue` |
| 2 | 每城文化页 | 新增 `/cities/:region` → `CityCulture.vue` | 五格册页：节庆/诗词/工艺/文学/饮食五类聚合入口 + 景点速览；bento 布局 | 新组件 + `SectionHeading` |
| 3 | 五类列表页改造 | 现有 `/festivals` `/crafts` `/literature` `/food-opera` | 统一视觉（细线卡片/印章/留白）；`ready` 标志与路由一致；顶部加「九城」横向快捷条（点击 → `/cities/:region`） | 现有 List 组件 |
| 4 | 首页入口 | MapView S3 九城导航（任务 3 已加）| 已有 | — |

## 后端小改（配合 #2）

1. `PublicPoemController.search` 增加可选 `region` 参数：`poem.spot_id → scenic_spot.region` 关联过滤（无 spot 的诗按诗人籍贯 `poet.birthplace LIKE %region%` 兜底，规则写注释）。
2. `PublicSpotController` `/regions` 九城顺序修正为上游→下游：菏泽、济宁、泰安、聊城、济南、德州、淄博、滨州、东营（现为「滨州、淄博」反序）。
3. （可选）`PublicPoetController` 增加 `region`（birthplace LIKE 匹配），供每城文化页展示本城名士——若诗人籍贯字段覆盖率不足则本批跳过，仅用诗词+文化+景点。

## 视觉规范（对齐 japanese-minimal + 双主题 token）

- 列表卡：1px 细线 + 大留白，去阴影/大圆角（inkwash 先行）；印章字复用五类注册表（节/诗/艺/文/味）
- 详情页：衬线标题（`var(--font-heading)` 已有）、朱红仅用于印章与焦点、区块间距 ≥80px
- 空态：单笔水墨 SVG + 一句衬线文案（本地 SVG，不新增素材成本）
- 动效：仅保留 scroll 叙事与入场，卡片 hover 轻移 2px

## 实施批次

| 批 | 内容 | 依赖 |
|---|---|---|
| B1 | 详情统一 + `/crafts/:id` + ready 标志 + `/regions` 顺序修复 | 无 |
| B2 | 后端 poems/poets region 参数 + `CityCulture.vue` + `/cities/:region` | B1 |
| B3 | 五类列表页视觉统一 + 九城快捷条 | B1 |
| B4 | 双主题细节对齐 + 空态水墨 SVG | B1-B3 |

## 验收

- build + test:unit 全过；九城任一内容可达详情可返回；无死链（ready 与路由一致）
- inkwash 主题目测符合 japanese-minimal 清单；real 主题无回归