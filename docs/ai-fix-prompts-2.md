# SJG 九城五类数字人文扩展 —— AI 任务提示词（v2）

> 本文件承接 `docs/ai-fix-prompts.md`（v1 七任务已全部完成/部分完成）。
> 本轮任务方向（用户 2026-08 提出）：
> 1. 收集自菏泽入境、至东营归海 **九城** 的信息数据（①民俗节庆 → ②古诗词 → ③非遗工艺 → ④民间文学 → ⑤饮食戏曲）
> 2. 对收集的信息进行前端展示设计（可加载前端设计 skills 提升审美）
> 3. 修复水墨风格中长卷地图：鼠标滑动效果不好、标签坐标对不上大概位置
> 4. 齐鲁名士朝代线可点击但不具备筛选条件
> 5. 美化前端展示样式，提供符合项目的创新建议
>
> **九城顺序（黄河上游→下游）**：菏泽 → 济宁 → 泰安 → 聊城 → 济南 → 德州 → 淄博 → 滨州 → 东营
>
> 当前环境事实（2026-08，分支 `fix/db-data-quality`）：
> - 数据库：本地 MySQL 8.0.46 `sjg01`（127.0.0.1:3306，root/123456），migration 已应用到 **V17**
> - 后端 `backend/`：Spring Boot 3.2.5 + Java 17 + MyBatis-Plus；统一返回 `Result<T>`；`/api/public/**` 公开只读（仅 published），`/api/admin/**` 写操作需 admin 角色
> - 前端 `display-v2/`：Vue3 + Vite + ECharts + AntV G6 v5 + GSAP；双主题 real/inkwash（`useTheme` 零依赖单例，实体双图片字段）
> - 五类与现有载体映射：民俗节庆=`cultural_item.category=festival`（+`festival_detail`）；非遗工艺=`craft`（+`craft_detail`）；民间文学=`literature`（+`literature_detail`）；饮食戏曲=`food_opera`（+`food_opera_detail`）；古诗词=现有 `poem`/`poet`/`scenic_spot` 域（`culturalCategories.js` 中 `poem` 复用 `/poets` 入口）
>
> 使用方式：每个「任务」为独立提示词，可单独或合并发给 AI 执行。执行前先通读「前置约束」。

---

## 前置约束（所有任务通用）

1. **数据只进 migration**：所有新增/修改数据写成幂等 SQL 放入 `backend/src/main/resources/db/migration/`（编号从 **V18** 起；沿用 V12–V16 的 `information_schema` + `PREPARE/EXECUTE/DEALLOCATE` 条件幂等风格）。**不要**直接改库后不落 migration。
2. **数据真实性**：每条信息须基于可查证来源（各级非遗名录、地方志、学术文献、官方文旅资料），不确定的字段留 NULL 或标「待考」，**禁止编造**；每条 migration 顶部注释来源清单。
3. **契约不变**：`Result<T>` 格式、`map-underscore-to-camel-case`、鉴权边界、公开端「仅 published」语义一律不破坏。
4. **双主题同步**：新增媒体素材需同时考虑 real/inkwash 双风格（实体 `imageUrl`/`imageAnimeUrl` 双字段）；新生成图片/音频前先报成本并征得确认（参考 `.workbuddy/skills/sjg-media-assets/SKILL.md`）。
5. **设计类任务先加载 skill**：任务 2/3/5 执行前，先用 `skill` 工具加载 `japanese-minimal`（水墨/文化美学的核心规范：留白、衬线、朱红唯一点缀、1px 细线、禁渐变阴影）与 `bento-grid`（文化板块聚合入口备选），并遵循其「禁用清单」。
6. **每次改动独立 commit**（用户硬性要求）：后端改完跑 `mvn test`（当前 20/20），前端改完跑 `npm run build` + `npm run test:unit`（当前 31/31）。
7. 每个任务完成后报告：改动文件清单、migration 名、验证方式、改动前后数据量/行为对比。

---

## 现状数据覆盖矩阵（2026-08 实测 `sjg01`）

`cultural_item` 按城 × 类（共 19 条，全部 published）：

| 城 | 民俗节庆 | 古诗词 | 非遗工艺 | 民间文学 | 饮食戏曲 | 小计 |
|---|---|---|---|---|---|---|
| 菏泽 | 0 | 待查 | 0 | 0 | 1 | 1 |
| 济宁 | 0 | 待查 | 0 | 2 | 0 | 2 |
| 泰安 | 0 | 待查 | 0 | 2 | 0 | 2 |
| 聊城 | 0 | 待查 | 1 | 1 | 0 | 2 |
| 济南 | 0 | 待查 | 2 | 0 | 2 | 4 |
| 德州 | 0 | 待查 | 0 | 0 | 1 | 1 |
| 淄博 | 0 | 待查 | 1 | 0 | 1 | 2 |
| 滨州 | 0 | 待查 | 0 | 0 | 0 | **0** |
| 东营 | 0 | 待查 | 0 | 1 | 1 | 2 |
| 九城外(潍坊/临沂) | — | — | 2 | 0 | 1 | 3 |

- **民俗节庆全类为 0**（最大缺口）；`festival_detail` 0 行。
- 滨州在文化板块 0 条；菏泽缺 craft/literature/festival。
- 诗词域：`poem` 195 首、`poet` 126 位、`scenic_spot` 70 个（九城景点数：菏泽20/济南15/济宁14/聊城7/德州5/泰安3/淄博2/东营2/滨州1）；**诗词按城归属覆盖待任务 1 先盘点**（通过 `poem.spot_id → scenic_spot.region` 或诗人籍贯链路）。

---

## 任务 1：九城五类数据收集与落库（数据采集）

### 问题描述
九城五类内容覆盖率低且不均：民俗节庆 0 条；滨州全类空白；多城多类缺位；诗词域未做过「按城归属」的覆盖盘点。目标是「每城每类有内容」的九城文化底库。

### 解决目标
1. 产出「每城 × 五类」目标矩阵（某城确无对应文化现象则显式标注「无此项」并说明依据，不硬凑）。
2. 分五类产出 V18+ 幂等 seed migration（可一类一文件），补齐缺口；**民俗节庆（festival）为最高优先级**。
3. 诗词域：先盘点 195 首诗按九城的归属（`spot_id → region` / 诗人籍贯 / 内容指向三条链路，规则写清楚），对覆盖 <3 首/城的城补足（滨州、东营、淄博、泰安优先）。

### 具体要求
- **分类口径**：五类 → DB 映射见文件头；每类条目遵循现有表结构：
  - 公共字段：`cultural_item(id, category, title, summary, content, region, image_url, image_anime_url, tags(JSON), sort_order, status, source, ...)`，seed 一律 `status='published'`、`source='manual'`；
  - 扩展表：festival→`festival_detail`、craft→`craft_detail`、literature→`literature_detail`、food_opera→`food_opera_detail`（1:1，`item_id` 主键）；
  - 参考 `scripts/output/{crafts,literature,food_opera}_seed.sql` 的既有行文风格（title/summary/content 语感、tags 结构、单引号转义规范）。
- **诗词**：新增诗优先挂到对应城市的 `scenic_spot`（先查九城现有景点列表再挂），并补齐 `poem` 必需字段（title/content/poet_id/dynasty_id 等，参照现有行）；若诗人缺失则同步 `poet` 表补齐（`source` 标记）。
- **来源纪律**：每条 migration 头部注释数据来源（如「山东省省级非遗名录（第 X 批）」）；存疑内容标「（待考）」。
- **幂等**：`INSERT` 前用 `INSERT ... SELECT ... WHERE NOT EXISTS` 或 `information_schema` 条件判定（沿 V12 风格），保证可重复执行。
- **media**：`image_url`/`image_anime_url` 先留 NULL 或本地占位路径（`/media/...`），实际生成走任务外流程并需成本确认。

### 验收标准
- 九城 × 五类覆盖矩阵中，除显式标注「无此项」的单元外，每单元 ≥1 条已发布内容（SQL 校验语句随 migration 附上）。
- 每城诗词归属 ≥3 首（或以盘点结论说明理由）；`/api/public/cultural?category=festival&size=100` 返回非空。
- migration 在 `sjg01` 重复执行无副作用。

---

## 任务 2：九城五类前端展示设计

### 问题描述
现有页面：`/festivals`(FestivalList+FestivalDetail 专用组件)、`/crafts`(CraftWorkshop 列表，**无详情路由**)、`/literature` 与 `/food-opera`(共用 `CulturalDetail.vue`)；`src/config/culturalCategories.js` 中 literature/food_opera 仍标 `ready:false`（已过时）；五类入口视觉风格不统一，缺「九城」维度导航。

### 解决目标
1. 设计并实现「九城 × 五类」的展示闭环：任一城市任一类内容可达、详情可看、可回列表。
2. 统一五类列表页与详情页的视觉语言（加载 `japanese-minimal`，结合项目双主题 token）。

### 具体要求
- **先出设计提案再动工**：页面清单（建议含：九城聚合入口页 / 每城文化页 / 五类列表页改造）、路由表、组件结构图、复用清单（`CulturalDetail.vue`、`EmptyState`、`ErrorState`、`SkeletonBlock`、`SectionHeading`、印章组件）、与 `japanese-minimal` 规范的对齐说明；征得确认后实现。
- craft 详情路由补齐（建议 `/crafts/:id` 复用 `CulturalDetail.vue`，与 literature/food_opera 同构；festival 是否迁入统一组件给出建议）。
- 修正 `culturalCategories.js` 的 `ready` 标志与真实路由一致；首页五类入口（若有聚合组件）同步九城维度。
- 双主题（real/inkwash）下均验收，使用 CSS 变量而非硬编码色值；卡片遵守「细线 + 留白」优先于阴影的日式原则（inkwash 主题尤其）。

### 验收标准
- `npm run build` + `npm run test:unit` 全过；九城任一内容可点击到详情且能返回；无 404 死链（`ready` 标志与路由一一对应）。
- 双主题截图对比：inkwash 下符合 japanese-minimal 验收清单（衬线标题、留白 ≥96px、朱红点缀 ≤2 处、无渐变无阴影）。

---

## 任务 3：水墨长卷地图交互与坐标修复

### 问题描述（已定位到代码）
`display-v2/src/views/MapView.vue` inkwash 主题 S3 长卷段落：
1. **标签坐标错位**：`getCityStampPos`（约 431–445 行）硬编码 `left: 6%–40%`，而卷轴纸面 `.scroll-middle-paper` 宽 **200%**、底图横贯全程 → 九城印章全部挤在卷轴左侧 40%，东营（黄河口，应在最右端）只到 40%，与底图地理位置严重不符；且 417 行城市数组顺序为「…德州、滨州、淄博、东营」，与实际流向「德州、淄博、滨州、东营」不符。
2. **滚动交互割裂/打架**：
   - `useScrollNarrative.js` `_initInkSticky`（94–121 行）用 GSAP `pin + scrub` 在 `onUpdate` 里**直接写 `layer.style.transform`**；
   - 而模板里这些层又绑了 `getParallaxStyle()`（408–414 行，鼠标视差 `translate3d`）→ **两处同时写 transform，互相覆盖**：鼠标一动打断 scrub 平移，滚动又覆盖视差，画面抖动/静止异常。
   - `.scroll-middle-paper` 自身带原生横向溢出滚动（`::-webkit-scrollbar` 样式在 1096 行），滚轮悬停其上有浏览器原生横滚行为，与页面纵向 scrub 形成「双重滚动」，体验割裂；无拖拽平移。
3. **响应式断点**：1233/1256/1274 行把 paper 高度压到 580/370/310px，但印章坐标与底图比例未随动。

### 解决目标
1. 统一 transform 写入点：scroll progress 与鼠标视差合并为单一来源（如 `onUpdate` 里同时算 `translateX(-progress*max*ratio) translate3d(mouseX, mouseY, 0)`，或干脆移除该区域的鼠标视差，保留静谧感——给出选型理由）。
2. 重新校准九城印章坐标：以**底图艺术品实测比例**为准（量图：河道路径、城市所在位置），提供校准方法说明（例如在底图上标记九城参考点百分比），坐标覆盖完整 200% 纸面，东营落于河口端；同时修正 417 行城市顺序并同步 188–197 行 `ink-river-svg` 的河道路径视觉（菏泽左下 → 东营右上）。
3. 重做滚动交互（三选一，给出选型理由后实现）：
   - A. 保留 GSAP pin+scrub 驱动，paper 移除原生溢出，加**拖拽平移**（pointer events）与可见进度条；
   - B. 拦截 paper 上滚轮事件（passive:false），将其换算为 scrub progress 平滑驱动（消除双重滚动），保留原生滚动条做拖拽；
   - C. 放弃 pin，paper 原生横向滚动 + 内容吸附（scroll-snap），视差改由原生 scrollLeft 计算。
   - 触屏（双指/滑动）行为必须与桌面一致验收。
4. 断点联动：各响应式高度下用同一坐标比例系统（百分比而非 px），验收坐标不错位。

### 验收标准
- 九城印章落在底图对应地理位置（目测 ±2% 内），东营位于卷轴最右河口；河流走向与九城顺序一致。
- 滚轮/拖拽/触屏三种输入下长卷平移流畅，无 transform 打架（快速晃动鼠标画面不跳、不打断 scrub）。
- 580/370/310px 三种高度断点下坐标不错位；`npm run build` + 单测全过。

---

## 任务 4：齐鲁名士朝代线筛选修复

### 问题描述（已定位到代码）
`display-v2/src/views/PoetList.vue`：
1. 顶部 `DynastyRail` 已绑定 `selectedDynastyId`，「书卷长廊」卡墙（`standardPoets`/`marginalPoets`）与「全名录」确实走了 `filteredEnrichedPoets`，但 **「传世最丰」区 `featuredPoets`（471–479 行）直接用 `enrichedPoets.value`，完全忽略朝代选择** → 用户点「宋」，顶部大卡仍显示全朝代 → 感知上「点了没筛选」。
2. 「关系图谱」tab 用的是另一套 `dynastyFilter` chips（603 行），与顶部 rail **不同步**：用户在长廊选了「宋」切到图谱仍是全量。
3. 无 URL 同步（tab 有 `?view=` 同步、朝代没有），刷新/分享丢失筛选态。
4. `dynastyItems` 过滤掉 0 诗人的朝代（`.filter(d => d.poetCount > 0)`），若某朝代有诗人但完整度都 <40（只出现在折叠层），用户看不到反馈。

### 解决目标
1. `featuredPoets` 尊重 `selectedDynastyId`（选中朝代时只在该朝代内取「传世最丰」，该朝不足 3 位时取该朝全部；未选时维持现逻辑）。
2. 统一朝代筛选数据源：rail 与图谱 tab 的 `dynastyFilter` 联动（点击 rail 同步图谱筛选，或明确设计为两个独立上下文并在 UI 上区分——给出选型）。
3. URL 同步 `?dynasty=<id>`（与现有 `?view=` 的 watch 模式一致，`VALID_VIEWS` 旁加参数解析），刷新/分享保持。
4. 选中朝代后给明确反馈：列表区标题/计数已存在，另将视口滚动回列表顶或加轻量提示；0 结果时 `EmptyState` 文案区分「该朝代暂无收录」与「数据加载失败」。

### 验收标准
- 点任一朝代 chip：三个 tab（长廊/图谱/全名录）内容均为该朝代（图谱按设计选型同步或明确标注独立）。
- `?dynasty=4` 打开页面即处于「隋唐」筛选；切换朝代 URL 同步。
- 「传世最丰」区在朝代筛选下正确缩窄，不再出现其他朝代诗人。

---

## 任务 5：前端美化与创新建议

### 问题描述
整体视觉已具备双主题底子，但与「数字人文」气质仍有距离：部分列表页卡片阴影/圆角偏「SaaS」，五类入口风格不统一，印章/竖排/留白等东方元素零散未成系统。

### 解决目标
1. 以 `japanese-minimal` 为 inkwash 主题的强化基线、real 主题保持现代实景风的克制收敛，输出「美化方案对照表」并分批落地。
2. 给出 ≥5 条符合项目定位的创新建议（不限于以下方向，须具体到组件/路由/交互）：

### 创新建议方向（示例，执行时细化）
- **九城卷轴导航**（首页 S3 长卷旁加九城进度点，点击飞往对应城市内容；与任务 3 修复联动）；
- **一城一册**：每城文化页按「节庆/诗/艺/文/味」五格册页（bento-grid 布局），统一印章与衬线标题；
- **印章系统化**：五类各有印章字（节/诗/艺/文/味），列表卡、详情页、EmptyState 复用同一印章组件，朱红唯一点缀；
- **诗词竖排展示**：`PoemDetail` 提供竖排（`writing-mode: vertical-rl`）阅读模式切换（桌面端），落款用竖排小字；
- **卡片去阴影**：列表卡由「阴影+圆角」改为「1px 细线 + 大留白 + hover 轻移」，inkwash 下先落地；
- **空态水墨 hint**：EmptyState 用单笔水墨图形（本地 SVG，不生成新素材）+ 一句衬线文案；
- **动效克制清单**：梳理全局 GSAP/transition，移除多余动效，保留滚动叙事与入场（参考 skill 禁用清单）。

### 具体要求
- 先产出「美化方案对照表」（列：组件/路由 → 现状 → 目标改动 → 依据（skill 规范条目）），征得确认后按批次实现，每批独立 commit。
- 所有改动使用 CSS 变量（`variables.css` + 主题类），不动后端；若需新素材（印章 SVG 除外）先报成本。
- 遵守 japanese-minimal 验收检查清单逐项自检。

### 验收标准
- 双主题下视觉一致性肉眼可验收；inkwash 通过 japanese-minimal 清单（衬线标题/留白/朱红 ≤2 处/无渐变阴影）。
- `npm run build` + `npm run test:unit` 全过；无回归（map/poets/五类页主流程可走通）。

---

## 附：执行优先级建议

| 优先级 | 任务 | 理由 |
|---|---|---|
| P0 | 任务 3（长卷地图交互+坐标） | 首页核心体验 bug，交互矛盾会抖动 |
| P0 | 任务 4（朝代线筛选） | 名士页核心功能缺陷，改动小见效快 |
| P1 | 任务 1（九城五类数据） | 任务 2 的原料；festival 全空是硬缺口 |
| P1 | 任务 2（展示设计） | 依赖任务 1 数据，可先出提案 |
| P2 | 任务 5（美化+创新） | 分批评审，避免一次性大改 |

建议执行顺序：3 → 4 → 1 → 2 → 5（2 的提案可与 1 并行评审）。

---

## 附2：执行进度

| 任务 | 状态 | 产物 |
|---|---|---|
| 1 九城五类数据 | [x] | `V18__festival_seed.sql`(14条,九城全覆盖)、`V19__craft_seed.sql`(12条)、`V20__literature_seed.sql`(10条)、`V21__food_opera_seed.sql`(8条)、`V22__poems_binzhou_dongying_zibo.sql`(9首:滨州3/东营8/淄博9,含3新诗人+无棣碣石山新景点)；四类文化+诗词九城全覆盖；生成器 `scripts/gen_cultural_migration.mjs` |
| 2 展示设计 | [x] | 提案 `docs/plans/2026-08-15-nine-cities-display-proposal.md`；B1 详情路由统一(`/festivals/:id`+`/crafts/:id`→CulturalDetail, ready 修正, /regions 顺序修复)；B2 `CityCulture.vue`(`/cities/:region` 五格册页)+poems/poets region 参数+印章跳城市页；B3 三列表 `?region=` URL 同步+筛选条 |
| 3 长卷地图修复 | [x] | `633f34f`：单一 transform 来源/河流印章同层对齐/九城坐标全卷校准/九城快捷导航/主题切换重建触发器/reduced-motion 兜底 |
| 4 朝代线筛选 | [x] | `7c37332`：featured 随朝代过滤/图谱与 rail 统一数据源/`?dynasty=` URL 双向同步 |
| 5 美化+创新 | [~] A1-A4 完成 | `docs/plans/2026-08-15-beautify-plan.md`；A1 卡片细线化(inkwash 去阴影+朱红描边, real 阴影减半)；A2 空态水墨远山 SVG+详情页留白 80px；A3 竖排已由 inkwash 主题满足(免实现)；A4 hover-lift 动效克制(3px 去缩放, inkwash 2px 无阴影) |