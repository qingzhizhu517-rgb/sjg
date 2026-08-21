# display-v2 整体风格与排版重构规格（2026-08-20）

> 本文是执行规格，不是提案。所有「现状」结论均来自代码实测，附 `文件:行号`；执行时先核对行号再改。
> 前置决策（已确认）：① 主题收敛到单一水墨；② 文化长廊先零成本程序化视觉，AI 生图另行报价；③ sjg-datav 仅把入口挪进导航栏，不合并工程。

## 执行顺序与依赖

```
阶段 0  token 层与主题收敛        ← 必须先做，后续所有批次依赖它
  ↓
批次 A  导航栏 + Hero + 统计去重 + datav 入口
批次 B  诗人详情 + 诗词详情          （A/B/C/D 之间无依赖，可并行）
批次 C  文化长廊（六页）
批次 D  文脉长河
  ↓
阶段 E  验收
```

每批次独立提交。改完一批跑 `npm run build` + `npm run test:unit`，不要攒着一次性验证。

---

## 阶段 0：token 层与主题收敛

### 0.1 为什么必须先做

审计实测：首页**一屏内可数出 4 种朱红 + 5 种金 + 1 个蓝紫渐变**，且都不等于 token 里的 `--accent`。

| 色系 | 散落的字面量 | 出处 |
|---|---|---|
| 朱红 | `#9e2b25` / `#b23a2b` / `rgba(178,58,43,.88)` / `rgba(158,43,37,*)` | RiverHero.vue:526,612,623,407,481 等 |
| 金 | `#B8860B`(token) / `#D4A843`(token) / `#c9a568` / `rgba(200,164,92,*)` / `#d4af37` / `#aa7c11` | RiverHero.vue:509,800；FooterCTA.vue:36；MapView.vue:1078 |
| 离群 | `#667eea → #764ba2` | MapView.vue:1654 |

同时 **10 个 CSS 变量全仓无定义**，所有使用处都在吃 fallback 或渲染成无效值：
`--border-color`（6 处）、`--text-on-accent`（4 处）、`--bg-hover`、`--line`、`--ink-river`、`--ink-scroll-bg`、`--ink-seal-active`、`--accent-glow`、`--craft-stage-bg`、`--craft-stage-fallback-bg`。

其中 `--text-on-accent` 未定义的后果是可见的：`PoemAnalysis.vue:238` 激活页签 `background:var(--accent)` 生效但 `color` 失效 → 深底深字；`LiteratureList`/`FoodOperaList` 的印章白字同理。

反过来，**已定义的 13 个派生透明度 token 有 6 个零引用**（`--accent-a25`/`--accent-a15`/`--shadow-a8`/`--shadow-soft`/`--shadow-color`/`--overlay`），5 个只用 1 次——组件里到处手写 `color-mix(in srgb, var(--accent) N%, transparent)` 重新发明。

### 0.2 目标 token 表

以现有 `.theme-inkwash`（inkwash.css:12-34）为唯一主题，提到 `:root`。新增缺失项：

```
/* 基础色 —— 沿用 inkwash 现值 */
--bg-primary   #F4EFE4   宣纸
--bg-secondary #EBE5D8
--bg-tertiary  #DDD6C6
--text-primary #1A1A1A
--text-secondary #4A4A4A
--text-muted   #535353
--accent       #A93226   朱砂（唯一强调色）
--accent-dark  #8B1A1A
--accent-light #E85D4F
--border       #C8C0B0
--border-light #D8D0C0
--card-bg      #FAF6EE

/* 新增：补齐无定义变量 */
--text-on-accent  #FAF6EE   朱砂底上的前景（4 处在用）
--ink-wash        #6B6252   淡墨（河流线/次级描边，替代 --ink-river #8B7355）
--seal-active     var(--accent)          替代 --ink-seal-active #c23a2b
--surface-sunken  var(--bg-tertiary)     替代 --craft-stage-bg #1a1a1a
--overlay-strong  color-mix(in srgb, var(--text-primary) 55%, transparent)
```

`--border-color` / `--bg-hover` / `--line` / `--accent-glow` **不新增**，改为把使用处替换成既有 token（`--border` / `--accent-faint` / `--border-light` / `--accent-soft`）。

### 0.3 排版与间距标度（新增，当前完全没有）

审计实测：段落纵向 padding 是 `0 / 64 / 0 / 72 / 80,100 / 56`，六个相邻值互不成比例；`--page-padding: 80px` 全项目 **0 次引用**；`RiverHero.vue` 里有 16 个独立 font-size 字面量、6 组互不成比例的 padding 组合。

```
/* 间距：4px 基数 */
--sp-1: 4px    --sp-2: 8px    --sp-3: 12px   --sp-4: 16px
--sp-5: 24px   --sp-6: 32px   --sp-7: 48px   --sp-8: 64px
--sp-9: 96px   --sp-10: 128px

/* 字号：1.25 比例，中文可读性优先 */
--fs-caption: 12px   --fs-body-sm: 14px   --fs-body: 16px
--fs-lead: 20px      --fs-h3: 24px        --fs-h2: 32px
--fs-h1: clamp(40px, 5vw, 64px)
--fs-display: clamp(56px, 7vw, 96px)      /* 仅 hero 主标题 */

/* 行高 */
--lh-tight: 1.25   --lh-body: 1.9   --lh-loose: 2.2

/* 正文行宽（关键，见批次 B） */
--measure: 34em          /* ≈34 汉字，中文舒适区 */
--measure-wide: 42em

/* 圆角、层级 */
--radius-sm: 4px   --radius-md: 8px   --radius-lg: 16px
--z-header: 100   --z-float: 200   --z-drawer: 300   --z-mask: 900
```

### 0.4 具体动作

1. `variables.css` 重写 `:root`：并入 inkwash 值 + 上述新增 token。删除 real 专属值。
2. 删除 `styles/real.css`（85 行，只有 `.theme-real` 装饰）。`App.vue:197-198` 去掉对它的 import。
3. `inkwash.css` 的装饰规则（纸纹 `::before`、`.card`、`.divider`、`.section-heading`、`.hover-lift`）从 `.theme-inkwash` 作用域提到无前缀全局，文件可改名 `theme.css`。
4. `useTheme.js`：保留 `theme` / `themeClass` / `resolveAsset` / `resolveContent` 的**导出签名不变**（避免一次性改 8 个消费方），但内部恒返回 `'inkwash'`；`isReal` 恒 `false`、`isAnime` 恒 `true`；`switchTheme` 变为 no-op。**同时清掉 `localStorage['sjg-theme']`**，否则老用户浏览器里存的 `'real'` 会让恒等判断和持久值不一致。
5. 删除 `ThemeSwitcher.vue`、`ThemeTransition.vue` 及 `App.vue:78,83` 两处挂载点。
6. 全局替换：4 种朱红 → `var(--accent)`；5 种金 → 删除（金色不再是主题色，仅保留 `--accent-light` 用于极少数高亮）；`#f5efe3`（8 处）→ `var(--bg-primary)`；`#101820`（RiverHero.vue:275）→ `var(--bg-tertiary)`。
7. **补齐 `.theme-real` 分支删除后的 fallback**：约 20 个 SFC 有 `.theme-real .foo` 作用域规则（`CityQuickCard`/`FeaturedPoemCard`/`InkHero`/`SkeletonBlock`/`TimelineHero` 等），逐个确认删掉后是否留下无样式元素。

### 0.5 验收

- `grep -rn "theme-real\|isReal\|ThemeSwitcher" display-v2/src` 零命中
- `grep -rEn "#[0-9a-fA-F]{6}|rgba?\(" display-v2/src --include=*.vue` 结果 < 30 处（当前 200+），且每处有注释说明为何不能 token 化
- 全仓无定义变量清零：对 10 个变量名逐个 grep，使用处必须已替换
- 视觉回归：`/map` `/poets` `/poets/:id` `/poems/:id` `/culture` `/timeline` 六页截图，确认无未着色元素

---

## 批次 A：导航栏 + Hero + 统计去重 + datav 入口

### A.1 导航栏（你说的「有点丑」，可归因原因）

现状实测（App.vue:406-680）：

| 问题 | 事实 | 行号 |
|---|---|---|
| **三个字族 token 在 Windows 上塌缩成同一字体** | `--font-heading`/`--font-display` 回退链是 `'Songti SC'`(仅 macOS) → Georgia → serif，中文 Windows 下 generic serif = SimSun，与 `--font-body` 同源。**real 主题事实上不存在标题字面**，层级只能靠字号字重 | variables.css:36-38 |
| **`font-weight:900` 全站合成加粗** | SimSun 无粗体，浏览器做 synthetic bold（笔画涂抹）。命中品牌方块、drawer 标题、hero 标题、印章、统计数字 | App.vue:459；RiverHero.vue:642 |
| 4 项导航共 528px，占容器 41% | 每项 = 36px padding + 16px 图标 + 8px gap + 4 汉字，视觉上是 4 个「小卡片」而非 4 个链接 | App.vue:507-520 |
| 下划线只有 24px | 占链接宽 20%，居中后读作游离短横 | App.vue:555 |
| **active 态叠了 4-5 种提示** | 变色 + 背景 + inset shadow + 24px 下划线 + inkwash 下 `font-weight:600→800`。合成加粗使激活项**变宽**，路由切换时导航项横向抖动 | App.vue:532,536,537,542,561 |
| hover 动画不同构 | 第 2 项 `wiggle 0.6s **infinite**`，其余三项一次性 | App.vue:585 |
| **header 用 `transition:all` 动画 height** | 滚过 20px 触发 64→54px，整行垂直位移 5px；`all` 把 `backdrop-filter:blur(20px) saturate(180%)` 也纳入过渡，每帧重合成 | App.vue:419,426 |
| **scrolled 后留 10px 裸露带** | header 缩到 54px，但 `.main-content{padding-top:64px}` 不变 | App.vue:929 |
| **≤1024px 一次性砍掉全部导航** | 实测品牌 116 + 导航 528 + 右侧 194 + padding 80 = 918px 才真溢出，**769–1024px（含多数平板横屏）明明放得下却只剩汉堡** | App.vue:978-980 |
| 探索按钮与 ThemeSwitcher 是两套胶囊 | 高度差 1.7px、圆角 20px vs 100px、描边 accent vs border、填充 transparent vs card-bg、一个有 shadow+backdrop-filter 一个没有 | App.vue:633-639 vs ThemeSwitcher.vue:38-46 |
| `▼` 是 8px 全角字符 | 与 13px 文字基线不齐，应为 SVG | App.vue:654 |
| **`.explore-menu` 双重卡片样式** | 模板带 `card` 类命中全局 `.card`，scoped 又设一遍，特异性相同胜者取决注入顺序；inkwash 下 `.card::before` 再叠一圈 inset 边框 → 双描边 | App.vue:63,662-680 |
| **毛玻璃完全无效** | 同时写了不透明 `background:var(--card-bg)` 与 `backdrop-filter:blur(20px)`，只留一个白付费的合成层 | App.vue:668,679 |
| 1%/2% 纯黑硬编码 | `rgba(0,0,0,0.01)` / `rgba(0,0,0,0.02)`，肉眼不可辨且不随主题 | App.vue:713,894 |

### A.2 导航栏改法

**字体先解决。** 这是「丑」的根因——没有标题字，所有层级只能靠字号堆。两个选项择一：

- 方案甲（推荐，零网络依赖）：本地打包一个衬线中文字重字体子集（仅导航/标题用到的约 200 字），`@font-face` + `font-display:swap`。项目已有先例：`index.html:8` 注释说明外部字体请求「已全部移除（国内网络下渲染阻塞/间歇挂起）」，所以**不要引 Google Fonts**。
- 方案乙：接受无标题字，改为**用字号 + 字距 + 朱砂印章**建立层级，`font-weight` 全站降到 400/600 两档，**禁用 700+**（避免 synthetic bold 涂抹）。

**结构改动：**

1. 品牌区：删掉「SHANDONG / YELLOW RIVER」两行 `'Times New Roman'`（全项目唯一处该字族，与宋体正文混排）。改为**单行中文站名 + 朱砂方印**。方块 `border-radius` 用 `--radius-sm`，字号从 18px 提到 20px（当前 18/32 = 56% 填充率，方块显得空），去掉 `line-height:1`（CJK 字形 em 盒不对称会视觉偏下）。
2. 导航项：**去掉 4 个 SVG 图标**，只留中文标签。项宽从 120px 降到约 76px，4 项从 528px 降到约 330px。
3. active 态：**只保留一种提示**——文字变 `--accent` + 下划线加宽到与文字等宽（`::after{left:18px;right:18px;width:auto}`）。删掉背景填充、inset shadow、字重变化。
4. hover：统一为 `color` + 下划线 `scaleX`，**删掉 4 个 keyframes 图标动画**。
5. header 高度：**取消 scrolled 变高**。改为固定 64px，滚动后只加 `border-bottom-color` + 极轻 shadow。`transition` 从 `all` 改为 `border-color .3s, box-shadow .3s`（不再动 `backdrop-filter`）。这同时消掉 10px 裸露带。
6. 断点：`.desktop-only` 的隐藏阈值从 1024px **降到 768px**。769–1024px 区间保留 4 项导航（此时项宽已降到 76px，总宽约 700px，放得下）。
7. 「探索山东」下拉：与新增的「数据大屏」入口一起，统一成同一种胶囊——共用一个 `.pill` 基类，`--radius-lg`、`1px solid var(--border)`、`background:transparent`。`▼` 改 8×8 SVG。
8. `.explore-menu`：模板去掉 `card` 类（避免双描边），只留 scoped 样式；**去掉 `backdrop-filter`**（不透明底下它无效）。

### A.3 Hero 是否全屏 —— 直接回答：**real 分支「几乎全屏但溢出 64px」，inkwash 分支「完全不是全屏」**

| | real 分支 | inkwash 分支 |
|---|---|---|
| 高度 | `min-height:100vh`（RiverHero.vue:267） | **无任何 height**（:464-470），由内容撑开 |
| 实际 | **100vh 没扣 header**，而 `.main-content{padding-top:64px}` → hero 底边落在 `100vh + 64px`，比首屏低 64px | 由 `.rh__art{aspect-ratio:4/3}`（:475）决定 |

**这个 64px 的后果是可见的功能损失**：`.rh__solar-terms`（24 节气时间轴）定位 `bottom:30px`（:427），chip 高约 30px → **整条时间轴在不滚动时完全位于首屏之下**；节气印章（`bottom:108px`）也被切掉约一半。首屏最重要的两个交互件默认不可见。

对比：全站唯一扣 header 的地方在 MapView 内部（`calc(100vh - var(--nav-height) - 76px)`，MapView.vue:592），hero 自己没扣——同一页两套视口高度约定。

**图片裁切**：素材 `term-01..24.jpg` 全部 1600×900（16:9），容器 `object-fit:cover`。1920×950 视口（2.02）下上下各裁约 12%；21:9 超宽屏纵向裁 38%。inkwash 侧更糟：把 1.778 的开卷视频塞进 1.333 的框，左右各裁 12.5%；标称「长卷」的 `hero-scroll.png`（1216×764，1.592）裁掉约 16% 宽度。

### A.4 Hero 改法

1. 高度改 `min-height: calc(100dvh - var(--nav-height))`。用 `dvh` 而非 `vh`（移动端地址栏收缩不跳变），并统一 MapView 内部的算式。
2. **24 节气时间轴移出 hero 底部**，改为 hero 右侧竖排轨（与 `.rh__film-kuan` 竖排题字同侧，形成一列）。当前它 24 个 chip 共约 1290px 却只有 1080px 容器，溢出 210px，且 `scrollbar-width:none` + `::-webkit-scrollbar{display:none}` **把滚动条藏了** → 有 4-5 个节气完全无法发现。竖排后改为可见的分段指示器。
3. hero 容器加 `max-width:var(--container-max)` 居中。当前 hero 无容器约束，文字栏起自 `padding-left:56px`，而 S5 `.famous-cities` 是 1280 居中 → **1920px 屏上两者左边界差 288px**。
4. 交叉淡入修 fix：`Transition` 加 `mode="out-in"`。当前进出场同时执行 `opacity 1.4s`，两张半透明图叠在 `#101820` 上，中点合成 alpha=0.75 → **每 8 秒整个 hero 向近黑下沉 25% 再回来**。
5. 加**预载**：当前 `import.meta.glob(eager:true)` 只拿 URL 不预取，单图 170–355KB 冷加载 → 淡入前期是空图叠深底。改为提前 `new Image().src` 预取下一张。
6. 字号层级：当前 92px 标题到 14px 正文是 6.6× 跨度，中间空档（eyebrow 12 / stat-label 11 / term-loc 13 全挤在 11-15px）。按 0.3 的标度重排，补 `--fs-lead: 20px` 中间层。
7. `letter-spacing:12px`（:643）降到 6px。CSS 字距会加在**最后一字之后**，4 字标题右侧多出 12px 视觉留白，破坏与副标题的左对齐感知。
8. inkwash 网格 `55% 45% + gap:48px` = 100%+48px **超出容器**，靠 `.rh{overflow:hidden}` 藏住 → 改 `1fr 1fr` 或用 `calc`。
9. 挂轴木杆当前被 `.rh__art{overflow:hidden}` 把上下 8px、左右 4px 出挑全裁掉，「挂轴」立体感在几何上被消除 → 木杆移到 `.rh__art` 外层兄弟节点。
10. `.rh__art-seal` 的 `top:calc(32px + 9em)`（:584）中 `9em` 绑的是自身 16px 字号（=144px），与题款 14px 无关；≤640px 题款改 12px 而印章不动 → 改用同一变量或 `ch` 单位。
11. 删除 `.yellow-river-animation`：real 下被全铺图片彻底盖住（同 z-index、DOM 靠前），是纯白付费的 8s infinite 动画；inkwash 下它的 `rgba(200,164,92,*)` 是第五种金色。

### A.5 统计四联去重（你说的「重复在多页面出现」）

审计确认**确实重复，而且比你察觉的更严重**——数据源只有一个（MapView.vue:377-382），渲染了 6 处：

| # | 位置 | 内容 | 视觉 |
|---|---|---|---|
| 1 | `/map` **S1 hero 内** | 4 项全出 | num 24px |
| 2 | `/map` **S2 独立段落** | **同一个 `heroStats`，同 4 标签同 4 数值** | num 34px |
| 3 | `/map` S3 沙盘 HUD | `heroStats.slice(0,3)` 前 3 项 | num 20px |
| 4 | `/regions/:city` | 仅「文学景观」一项，值是该城 spots 数 | num 22px |
| 5 | `/map` hero 副标题散文 | **硬编码**「三百余处、近百位」 | 14px 正文 |
| 6 | header 下拉 / 抽屉 / 页脚 | 静态文案 | — |

即 **real 主题下「文学景观/文人大家/传世名篇」在同一页出现 3 次**，`沿黄城市` 出现 2 次。且 **#5 与 #1 自相矛盾**：散文写死「三百余处」，正下方 200px 是 API 实时数字，只要真实值 ≠ 300 左右，同屏就有两个互斥陈述。

**外加一个确定的可读性 bug**：`MapView.vue:24` 给 StatTicker 传 `tone="dark"`，但 `.sn-stats` **没有背景**（MapView.vue:510-513），继承 `--bg-primary` #F4EFE4。而 `tone-dark` 是 num `#e8c674`、label `rgba(242,235,217,0.6)`（StatTicker.vue:104-106）→ **34px 浅金数字打在奶油白上（对比度约 1.6:1），11px 标签是 60% 不透明近白色 → 四个标签实际不可读**。组件本身有 `tone="light"`（:109-111）但首页没用（`InkHero.vue:21` 用的是 light）。

**改法：**

1. **删除 S2 整段**（MapView.vue:22-29）。四联统计只在 hero 内出现一次。这同时消掉 tone 误用。
2. hero 副标题散文里的「三百余处、近百位、千载流芳」三个数量词删掉，改成不含数字的意境句（RiverHero.vue:123）。
3. S3 沙盘 HUD 的 3 项改为**该视图特有的维度**（如当前选中城市的景点数/诗人数），不复用全站总量。
4. `/regions/:city`、`/poets`、`/timeline` 的 hero 统计条保留，但**每页至少有一项是本页特有维度**。顺带修 `PoetList.vue:526-531`——`跨越朝代` 与 `有录可考` 绑的是**同一个变量 `dynastiesWithPoets`**，同一个数字配两个标签占两格。

### A.6 datav 入口（按你的决策：只挪入口）

**必须修的遮挡 bug**：`.datav-float-button` 是 `fixed; bottom:24; right:24; 56×56; z-index:1000`（MapView.vue:1648-1663），而 `.ai-chat-wrapper` 是 `fixed; bottom:24; right:24; z-index:100`（AiChatBox.vue:408-413），内含 54×54 按钮。**同一锚点、datav 更大且 z 更高 → 首页上 AI 小文入口被完全遮蔽、不可点击。**

1. 删除 `MapView.vue:249-260`（悬浮按钮）及 `:1648-1670` 样式。AI 入口自然恢复。
2. `App.vue` 导航栏加第 5 项「数据大屏」，`<a href target="_blank" rel="noopener">` + 外链角标 SVG，与前 4 项同一 `.nav-link` 样式但**加视觉区分**（末尾 ↗ 角标 + 不参与 active 态）。
3. URL 从硬编码 `http://localhost:5180`（MapView.vue:250）改为 `import.meta.env.VITE_DATAV_URL`，`.env.example` 加该项默认 `http://localhost:5180`。当前硬编码在任何部署/隧道环境下必然 404。
4. 蓝紫渐变 `#667eea → #764ba2` 随按钮一并删除（阶段 0 的离群色清零）。
5. 移动端抽屉（`App.vue:143` 附近）同步加该项。

### A.7 首页纵向节奏

现状：段落 padding 为 `0 / 64 / 0 / 72 / 80,100 / 56`，且**首屏后连续三段都是整屏高**（S1 100vh+64 → S3 pin real 2.2 屏 / ink 2.0 屏），中间只夹 128px 的 S2。用户在前 3.2 屏只经过 2 个内容块，随后 S5 **一次性倾泻 9 个结构完全相同的 `CityFeatureSpot`**，单项约 572px、9 项约 5150px ≈ 5 屏连续同一版式，无分组、无背景切换、无节奏断点。

收尾还连着两个居中低信息量块：FooterCTA（80/100px padding）→ 立刻 `.main-footer`（56px），都居中、都是结束语、合计约 330px。

**改法：**

1. 全部段落 padding 收到 `--sp-*` 标度：S2 删除后序列变为 `hero / sticky / featured(--sp-9) / cta(--sp-9)`。
2. S5 九城**分组**：按黄河流向切三组（上游菏泽济宁、中游泰安聊城济南德州、下游淄博滨州东营），每组前插一个轻量分隔（朱砂细线 + 组名 + 里程标）。
3. S5 单项 `padding:56px 0` 降到 `--sp-6`(32px)，图片 `aspect-ratio` 从 4/3 改 16/10 降低单项高度。9 项总高从 5150px 降到约 3400px。
4. **删除 `.map-cities` / `.map-cities-grid` 死 CSS**（MapView.vue:558-574，模板零引用，S4 段落被删但 CSS 留着）。
5. FooterCTA 与 `.main-footer` 合并为一块。
6. **修 `prefers-reduced-motion` 下的功能缺失**：`useScrollNarrative.js:39` 在降低动效时直接 `return`，pin 完全不建立 → S3 退化为普通 100vh 段落，**横向长卷的 transform 永不更新，inkwash 下长卷 50%-100% 段永远看不到**。应改为：不建 pin，但把长卷改成原生横向可滚容器。

---

## 批次 B：诗人详情 + 诗词详情

### B.0 先看清一件事：PoetDetail 的未提交改动已经推翻过一轮版式

`git diff display-v2/src/views/PoetDetail.vue` = **+426 / -272**。这不是微调，是**把「人物小传卷 / 竖排水墨」整体换成通用 hero + 卡片网格**：

- 删掉：`.ink-scroll-layout` 两栏（左 120px sticky 竖排信息栏）、`.ink-portrait-frame` 100×130 印章头像、`.ink-info-vertical`（`writing-mode:vertical-rl` 竖排姓名/朝代）、`.ink-sig-text-vertical`
- 新增：`.pd-hero` **60vh 深棕渐变横幅**、头像 280×380、姓名 `clamp(48px,6vw,72px)`、玻璃拟态数字卡、`repeat(auto-fill,minmax(320px,1fr))` 诗篇网格

**副作用（必须处理）：**
1. **竖排从 PoetDetail 彻底消失**（`grep writing-mode` 零命中），而 PoemDetail 仍有 6 处竖排 → **两页视觉语言分裂**。
2. hero 底色 `linear-gradient(135deg, #2C1810, #4A3728, #6B4F3A)`（PoetDetail.vue:214）是**硬编码深棕**，配套一整套 `rgba(255,255,255,*)` 白色系半透明只在深底上成立 → **切主题时 hero 不变色，与页面其余部分（#F4EFE4 宣纸）脱节**。
3. 头像取值从 `isAnime ? avatarAnimeUrl || avatarUrl : avatarUrl` 改回只读 `avatarUrl`，丢弃 anime 字段（阶段 0 单主题后此改动反而正确，保留）。
4. 删掉了原文件全部解释性中文注释。

**决策**：单主题化后，深棕 hero 与宣纸主题冲突。**保留新版的信息架构（hero + 卡片网格），但把 hero 配色改为宣纸+朱砂**，并把竖排作为「点睛」而非「通版」——只用于姓名/朝代题款，正文横排。这样两页语言重新统一：**竖排用于题识，横排用于阅读**。

### B.1 两页共有的硬伤

| 问题 | 事实 | 行号 |
|---|---|---|
| **正文行宽近 1000px** | PoetDetail `.pd-bio` 有效宽 1022px ≈ **64 汉字/行**；PoemDetail `.background-content p` 952px ≈ 60 字。中文舒适区 30-45 字 | PoetDetail.vue:486-499；PoemDetail.vue:218-224 |
| 而内容量极小 | biography 中位 **112 字**（最长 162），background 中位 48 字 → 1022px 宽下只有 2-3 行，却裹在 `padding:40px 48px` + 4px 左边框的大卡里，**卡片装饰重量远超内容体量** | SQL 实测 |
| **style 文本塞进数字槽** | `poet.style` 是文本（中位 9 字，最长 16 字如「北宋古文运动（唐宋八大家）」），却套 `.pd-stat__num` 的 28px + `font-family:var(--font-display)` + `line-height:1` → 16 字在 24px 内边距间强行换行且行行紧贴 | PoetDetail.vue:38-41,358-365 |
| **装饰权重压过内容** | `.pd-signature::before` 200px「诗」水印、`.pd-poem-card__num` 48px 序号、`.pd-portrait__stamp` 120px 首字；而真正的层级信号 `.pd-section__subtitle` 只有 13px，内容还是写死营销话术（「诗人的生平事迹与历史贡献」），每个诗人页都一样 | PoetDetail.vue:392-403,545-555,479 |
| **`.pd-back` 盖住导航栏** | `position:fixed; top:24px; left:24px; z-index:100`，与 `.main-header`（同 fixed、同 z-index:100、height 64px）**完全重叠**；页面在 router-view 内后渲染 → **返回按钮压在导航栏上** | PoetDetail.vue:175-180 vs App.vue:406-415 |
| 返回导航三种写法 | PoetDetail 是 `router-link` + computed `backTo`（fixed 药丸）；PoemDetail 是 `button @click="$router.back()"`（流内裸文字，外部直链进入会退出站点）；SpotDetail 是第三种 | PoetDetail.vue:6；PoemDetail.vue:20；SpotDetail.vue:28 |
| `hover-lift` 的 `!important` 冲突 | `variables.css:180-186` 的 `.hover-lift:hover{transform:translateY(-3px)!important}` **压掉** scoped 的 `translateY(-8px)` | PoetDetail.vue:86,536 |
| 骨架屏形状不符 | PoetDetail 只一块 220px（真实页面是 60vh hero + 三段）；PoemDetail 骨架容器 800px 而内容 1000px → **加载完成瞬间宽度跳变 200px** | PoetDetail.vue:105；PoemDetail.vue:279 vs 330 |
| style 块占 3/4 | PoetDetail 486 行（74.3%）、PoemDetail 472 行（75.6%） | — |

### B.2 PoemDetail 竖排诗笺 —— 无任何溢出治理（最严重）

实现细节：`writing-mode:vertical-rl`（`.ink-poem-line`，PoemDetail.vue:458）+ **flex `row-reverse`**（:452）模拟古籍右起 → 两种机制叠加：字符由 writing-mode 上→下，段落由 flex 右→左。列宽由 `line-height:2` × 24px = 48px 决定，列间 `gap:24px` → 列心距 72px。**无 `text-orientation`**（默认 mixed → 拉丁字母/数字侧躺 90°），**无标点专门处理**（无 `font-feature-settings: vert`）。

三个量级的失控（SQL 实测 195 首）：

| 情形 | 占比 | 后果 |
|---|---|---|
| **单列诗**（content 不含 `\n`） | **122/195 = 62.6%** | 只渲染 1 列 ≈ 36px 宽，居中在 668px 诗文区里 → **左右各留 316px 纯空白**，外加 `min-height:500px` 强撑 |
| **超长单段** | 最长 270 字（《郓州谿堂诗》），>200 字 4 首 | 每 `<p>` 一整列，**无 max-height、无 overflow** → 24px 字 + 6px 字距 ≈ 每字 30px → **270 字 ≈ 8100px 一列**，把页面拉成 8000+px 高的竖条 |
| **多段诗** | 最多 51 段 | 51 列 × 72px ≈ 2754px 远超 668px 容器；`.ink-poem-text` 无 `flex-wrap` 也无 `overflow-x` → **被 body 的 `overflow-x:hidden` 直接裁掉，`row-reverse` 下最先几列不可达** |

另：`.ink-annotation-panel` 是竖排 + `max-height:400px; overflow-y:auto`（:534,539-540）——**竖排文字的溢出轴是横向，`overflow-y` 管不住它**，106 字竖排会排成 8 列 ≈ 240px 宽，向左横向溢出 60px 的 sidebar。

### B.3 数据侧的三个「有位无货」

1. **`audioUrl` 195/195 全为 NULL** → 音频区块（PoemDetail.vue:94-99 + 54 行 CSS）永不出现。
2. **`videoUrl` 160/195 NULL，剩余 35 条全是 JSON 数组字符串**（`["https://...mp4", ...]`），而 `:90` 直接 `<video :src="poem.videoUrl">` **未解析** → 拿到 `[\"https...` 整串当 URL，**那 35 首必然加载失败**。项目里 `useImage.js:9-27` 的 `parseFirstUrl` 正是干这个的，没用上。
3. **`avatarUrl` 87%（109/126）为空**，本地兜底 `LOCAL_PORTRAITS` **只有杜甫一人**（PoetDetail.vue:122-124）→ **87% 的诗人 hero 左侧是一块 280×380 纯色首字方块**。
4. **诗词页完全不显示作者头像**（`grep avatar|useImage` 零命中），后端返回了完整 `poet` 对象含 `avatarUrl`，前端只取 `id` 和 `name`（:32），作者名是 80px 侧栏里 18px 竖排小字——而**朝代首字 48px、落款「诗」32px**，装饰印章字号是作者名的 2.7 倍。
5. `.ink-tag` **11px 是全页最小字号**（:572），而 `sentimentTags` 是最完整的字段之一（0/195 空，中位 5 个）。
6. **`annotation` 195/195 全有数据**（中位 29 字）却默认隐藏（`showAnnotation = ref(false)`，:120），要点一个写着「注」的 40×40 圆钮（无 `aria-label`、无 `aria-expanded`、无 title）。

### B.4 AI 赏析组件：在用的那份比死文件落后

**在用 `PoemAnalysis.vue`**（PoemDetail.vue:84,111）。`PoemAnalysisEnhanced.vue`（396 行）**零引用**——**而它才是修好 bug 的那份**：

| bug | PoemAnalysis.vue（在用） | Enhanced（未引用） |
|---|---|---|
| **响应解包层级错** | `:185` `analysis.value = data`，但后端返回 `{analysis:{...}, model, generatedAt}` → **所有 `analysis.lines`/`sentiment` 读到 undefined → 六个页签全部落空态** | `:186` `analysis.value = (data && data.analysis) \|\| data` |
| null 崩溃 | `:32` 裸 `v-else`，`analysis===null` 时 `analysis.lines?.length` 抛 `TypeError` | `:31` `v-else-if="analysis"` + 空态 |
| `sentiment` 类型错配 | `:169` 读 `analysis.value?.sentiment_detail` 并按 `{tone,progression,imagery}` 对象渲染，但后端 schema 里 `sentiment` **是字符串、没有 `sentiment_detail` 键** | `:172` 按字符串渲染 |
| 多余参数 | `:183` `params:{dimensions:'all'}`，后端只接 `@PathVariable` | — |

另：`PoemAnalysis.vue` 引用 **3 个全仓无定义的 CSS 变量**——`--border-color`（3 处，无 fallback → 属性 invalid → 退回 `currentColor`，边框变文字色）、`--bg-hover`、`--text-on-accent`（2 处 → **激活页签 `background:var(--accent)` 生效但文字色退回继承的 `--text-secondary` → 深底深字**）。

**动作：改用 Enhanced 的实现**（或把三处修复移植进 PoemAnalysis 后删掉 Enhanced），并补齐 CSS 变量（阶段 0 已加 `--text-on-accent`）。这条**优先级高于任何排版调整**——当前六个页签是全空的。

### B.5 改法

**共同：**
1. 抽 `components/detail/DetailBackLink.vue`：统一三页返回导航。语义用 `<router-link>`（不用 `$router.back()`），目标由 props 给确定路由，**定位改为文档流内**（在 header 之下，不 fixed），彻底消掉 z-index 冲突。
2. 抽 `components/detail/SectionHead.vue`：统一两页的区块标题。当前 PoetDetail 是「48px 图标 + 28px 标题 + 13px 副标题」三件套，PoemDetail 是「20px + 下边框 + 40×2px 短线」，而全局 `.section-heading` 在 `real.css:63-82`/`inkwash.css:105-124` 已有定义却被 PoemDetail 在 scoped 里重写一遍。**删掉写死的营销副标题**。
3. 抽 `components/detail/SealMark.vue`：印章目前有 6 份独立实现（120px 实底 / 48px 色字 / 32px 描边方框 / 80×80 朝代章 / 76×76 / 92px），统一为一个带 `size` + `variant` prop 的组件。
4. 正文一律 `max-width: var(--measure)`（34em ≈ 34 字），在宽容器内**左对齐而非居中**（保持与标题同一左基线）。删掉 `.pd-bio` 的卡片装饰（padding 40/48 + 4px 左边框 + 阴影），改为仅一条朱砂细线起首。
5. 骨架屏按各页真实骨架重画，且**容器宽度与内容一致**。
6. 删掉 `hover-lift` 类的使用（或去掉 `variables.css:180-186` 的 `!important`），保留 scoped 的 hover 定义。

**PoetDetail：**
7. hero 底色改宣纸系：`--bg-secondary` 底 + 朱砂细线框 + 纸纹，删掉深棕渐变与整套 `rgba(255,255,255,*)`。
8. hero 高度从 `min-height:60vh` 降到 `auto`（内容撑开）。当前 1080p 下 648px 首屏只承载「一张图 + 一个名字 + 一行生卒 + 1-2 个数字卡」，**首屏完全看不到任何诗**。改为 hero 压缩到约 360px，让第一首诗进入首屏。
9. `.pd-stats` 拆开：**`poet.style` 从数字卡移出**，改为姓名下方的一行「风格题识」（横排，`--fs-body`）；数字卡只留「传世 N 篇」。
10. 头像缺失时（87%）的占位改为**程序化水墨印章**（复用批次 C 的 `InkPlaceholder`），而非 280×380 纯色块。
11. 补 `biography` 缺失（37%）的兜底文案——`PoetList.vue:121` 已有「生平待考，然其诗已传」可复用。
12. 补 `poems.length === 0` 空态（当前整段消失，SpotDetail.vue:854-856 有 `.empty-poems` 可参考）。
13. 展示当前丢弃的 `dynasty.startYear/endYear`（朝代起止年），删掉朝代名的**两处重复**（80×80 方章 + 药丸标签，相距不到 100px 显示同一个 `dynasty.name`）。
14. 诗篇卡加 `sentimentTags`（PoemDetail 有、PoetDetail 无，两页不一致）。
15. hero 与代表作卡加 `data-reveal`（当前只有两个 section 有，最抢眼的两块无入场动效）。
16. 删除未使用的 `parseTags` import（:117）。

**PoemDetail：**
17. **竖排诗文加溢出治理**（本批次最关键）：
    - 列高上限 `max-height: calc(100dvh - 240px)`，超出**自动折列**——把长段按上限字数切分成多列，而非无限拉伸。
    - `.ink-poem-text` 加 `overflow-x: auto` + 可见的滚动提示（不要重复 hero 那个隐藏滚动条的错误）。
    - 单列时（62.6%）诗文区宽度收到 `fit-content`，消掉左右 316px 空白，`min-height:500px` 改 `min-height: fit-content`。
    - 加 `text-orientation: upright`（中文竖排应正立）+ `font-feature-settings: 'vert' 1`（标点竖排变体）。
18. `.ink-annotation-panel` 的 `overflow-y:auto` 改 `overflow-x:auto`（竖排溢出轴是横向）。
19. **作者提到主位**：hero 区加作者头像（复用 `getImageUrl`）+ 姓名 `--fs-h3` 横排，侧栏只留朝代题识。
20. `.ink-tag` 从 11px 提到 `--fs-body-sm`(14px)。
21. `annotation` 默认展开（195/195 都有数据）；折叠钮补 `aria-expanded` + `aria-controls`。
22. **视频 `src` 走 `parseFirstUrl`**（修那 35 首必然失败的）；`audioUrl` 100% 为空 → 音频区块暂时删除（连 54 行 CSS），待 P3 TTS 落地再加回。
23. 「创作背景」当前**同屏出现两次不同源**：`.detail-section` 渲染 DB 的 `poem.background`，PoemAnalysis 的「综合赏析」页签又渲染 LLM 的 `analysis.background` → 两个同名标题不同源。改为 DB 那份标题为「诗题背景」，AI 那份标注「AI 生成」。
24. `.mood-bg` 有**三份等价规则**（:295-304 / :336-339 / `:global(.theme-inkwash)` :306-309），且 SpotDetail.vue:486-495 有第四份且 opacity 不一致（0.14 vs 0.16）→ 抽成公共 util。
25. 修 3 处 `color-mix` 比例误写：`0.1%`（:242）、`0.015%`（:446,447）应为 `0.1` / `0.015`，当前这三处阴影与「水墨纹理」**渲染上等于不存在**。
26. 景点链接当前跳 `/regions/:region`（区域列表）而非 `/spots/:id`，尽管路由存在且后端已返回完整 spot 对象 → 改为跳景点详情。
27. 补「同一诗人其他作品」「上一首/下一首」（当前只有藏在 AI 赏析第 6 页签里的 LLM 生成 `related_poems`，不是数据库关联）。
28. 删除死代码 `.poem-hero-anchor` / `.poem-hero-anchor__veil`（:312-325，模板零引用）；删除未调用的 `useTheme` import（:110）。

---

## 批次 C：文化长廊（六页）

### C.1 「缺少图片素材」的真实情况比你以为的更糟

逐文件 grep `<img` / `background-image` / `imageUrl`：

| 文件 | 实体图片 |
|---|---|
| `CultureGalleryView.vue` | **零** |
| `CulturalGallery.vue` | 仅 `:139` 两层 `radial-gradient` 噪点，不是图片 |
| `FestivalList.vue` | **零** |
| `LiteratureList.vue` | **零** |
| `CulturalDetail.vue` | **零**（四条路由共用的详情页，全文零 `<img>`） |
| `CityCulture.vue` | **零** |
| `FoodOperaList.vue` | 唯一：`:48` `<img v-if="item.imageUrl">` |

**六页里五页零图片。而且那唯一一处也不生效：**

1. `FoodOperaList.vue:48` **只读 `imageUrl`，从不读 `imageAnimeUrl`**，且直接把裸 URL 塞进 `src`，**绕过 `useImage()` 的占位兜底**。61/63 条 `imageUrl` 为 NULL → `v-if` 假 → 图片区（固定 180px）变成**空的 180px 空白块**，只剩左上角徽标浮在虚空里。
2. 而库里那 2 条有值的记录，写的正是 `image_anime_url`（历史生成 SQL 已随旧素材流程归档，当前对应 `public/images/cultural/` 下的两张 png）——**恰好是前端唯一不读的字段** → 已有配图 100% 不可见。
3. `imageAnimeUrl` 在**整个 display-v2 的 cultural 域零消费**（grep 命中仅在景点/诗人域）。

所以当前卡片靠三样东西撑视觉：**印章字**（`LiteratureList` 的印章字是 `['传','说','故','事','民','间'][id % 6]`，**与条目内容零语义关联，纯装饰**）、**撞色渐变 + emoji**（工作区新增，见下）、**细线 + 留白**。

### C.2 工作区未提交的 CulturalGallery 改动引入了新问题

`git diff` = +350/-231，纯视觉重做。它新增了：`gradients[5]`（`#E74C3C→#C0392B`、`#8E44AD→#9B59B6` 紫、`#27AE60→#2ECC71` 亮绿、`#F39C12→#E67E22` 橙）、`icons[5]` emoji、`descriptions[5]`、`tags[5][3]` —— **15 条描述 + 15 个标签全是前端硬编码字面量，与数据库无关**；五套撞色渐变与宣纸/朱砂色系正面冲突且**不响应主题**。

另外两处：
- `cg-hero` 与宿主页 `CultureGalleryView.vue:4-10` 的 `cv-hero` **文案完全重复**（同一句「节令风物、诗词歌赋…徐徐展开」），且用 `margin-bottom:-60px` 让卡片压上英雄区 → **双页头叠加**。
- `max-width:1400px` 与宿主页的 1280px 冲突，也与 `--container-max` 不一致。
- `CultureGalleryView.vue:51-55` 声明 `rootRef` 并调 `reveal(rootRef.value)`，**但模板里没有任何元素绑 `ref="rootRef"`** → reveal 是死代码，`data-reveal` 永不被扫描。

**决策**：这轮改动的**信息架构可留**（卡片有图区、描述、标签、箭头），但撞色渐变换成程序化水墨、硬编码文案迁到内容配置层、删掉重复页头。

### C.3 交互深度的断层

| | Festival / Literature / FoodOpera | CraftWorkshop |
|---|---|---|
| 交互总量 | 一排 region chip + hover 位移 + 点击跳转 | 3 个 composable + 3 专用组件 + 5 步声明式内容配置 + 2 个单测 |
| 具体 | — | WebGL + Draco GLB、三点光照、Raycaster 部件拾取（含 6px 拖拽阈值区分点击/拖拽）、GSAP 相机机位补间、按名集合显隐、IntersectionObserver 滚出暂停、`canUseWebGL()` 低端机判定 → 降级 5 张 SVG、5 步工序状态机（基准位姿快照保证 enter 幂等）、声明式动画指令解释器、步骤冲突检测、末步解锁自由把玩 + 点击部件弹 7 条知识卡 |

且 **CraftWorkshop 是唯一不读数据库的文化页**（数据全在 `src/content/crafts/dongchang-hulu.js`）→ **库里的 `craft` 类条目在长廊里没有任何列表入口**（`/crafts` 被 3D 专题页占用，`CulturalDetail.vue:69-75` 注释记录了这点）。

其他缺陷：
- `FestivalList.vue:86` 的 `dateCache` **整个文件从未被写入**，`festivalDateOf` 恒返回 `''`，日期展示位（:47）是**死结构**。注释（:85）承认「列表接口不含扩展字段」。
- `FoodOperaList.vue:122` 用**标题正则** `/吕剧|柳子|快书|梆子|戏曲|京剧|琴书|戏/` 猜饮食/戏曲分类，而 `FoodOperaDetail.subCategory` 有权威值——列表接口不返回它。
- `LiteratureList.vue:45` 直接输出 `item.category` → 页面上显示**英文 `literature`**（`CulturalDetail.vue:82` 有中文映射表没用上）。
- `FoodOperaList.vue:13-16` 有两个 `--static` **假 tab**（`cursor:default`，不可点）。
- `LiteratureList.vue:223-226` hover 时 `box-shadow:none` —— **hover 阴影被显式关掉**。
- `CulturalDetail.vue:15` 是 `v-else-if="item"`，`loaded && !errorMsg && item===null` 时**整页空白**只剩返回链接（无空态分支）。
- 四张 detail 扩展表字段前端 **100% 覆盖无遗漏**（已逐一比对 `FestivalDetail`/`CraftDetail`/`LiteratureDetail`/`FoodOperaDetail` 四个实体），缺口全在主表：`imageUrl`/`imageAnimeUrl`/`source` 无展示位。

### C.4 重复与死代码

- **`NINE_CITIES` 常量 5 处重复定义**（`CultureGalleryView.vue:49`、`CityCulture.vue:138` + 三个列表页各一份）
- `tagsOf` / `setRegion` / `load` 在三个列表页各实现一遍，无共享 composable
- **五类类目元数据（印章字/名称）三处硬编码**：`culturalCategories.js`、`CulturalGallery.vue`、`CityCulture.vue`
- **六套手写页头**（`fest-` / `lit-` / `fo-` / `cw-` / `cv-` / `cg-hero`），结构几乎相同（tag + title + desc），CSS 各写一遍；`SectionHeading` 在这些核心页**零使用**
- `CityCulture.vue` 是同一批数据的**第二套展示**：五个 tile 的类目 = 同一套五类，`更多 →` 直接跳回列表页并带 region，与列表页 chip 筛选是**两条通往同一结果的路径**；tile 只展示 `title` + `summary`，是列表卡字段的子集，**无信息增量**
- 死文件 `FestivalDetail.vue`（288 行，路由被 `CulturalDetail.vue` 接管，零引用），但它有**更丰富的四区块布局**（origin/customs/food 各配印章小标题）值得移植
- `CraftWorkshop.vue:134` 用 `setInterval(syncState, 100)` 轮询同步 composable 状态，而非 `watch`
- `CraftWorkshop.vue` 系列的 fallback 色来自**另一套金色/暗色配色**（`#C5A55A` / `#1a1a1a` / `rgba(255,255,255,0.06)`），`--craft-stage-bg` 未定义 → **3D 舞台底恒为 `#1a1a1a` 纯黑**，与浅色主题不协调

### C.5 改法（P0 零成本程序化视觉）

1. **新建 `components/InkPlaceholder.vue`**：程序化水墨占位，纯 CSS/SVG 零素材。输入 `seed`（条目 id 或标题）+ `kind`（节/诗/味/艺/文），输出确定性的水墨纹样——`conic-gradient` 或内联 SVG 的淡墨晕染 + 留白 + 朱砂印章 + 该类目的印章字。同一条目每次渲染必须一致（用 seed 派生角度/密度，不用随机）。
   - 同时替换 `useImage.js` 的 `getPlaceholder`（当前是硬编码 240×240 SVG 方框 + 单字），两处统一。
2. **修图片链路**（这是「已有图不显示」的根因）：
   - `FoodOperaList.vue:48` 改走 `useImage().resolveImage(item.imageUrl || item.imageAnimeUrl, kind)`；无图时渲染 `<InkPlaceholder>` 而非留 180px 空白。
   - **所有 cultural 消费方补读 `imageAnimeUrl`**（单主题后两个字段合一，优先 `imageAnimeUrl` 再 `imageUrl`——因为库里现有数据在 anime 字段）。
   - `CulturalDetail.vue` **新增图片展示位**（当前详情页零 `<img>`），顶部 hero 图或 `InkPlaceholder`。
3. 抽 `composables/useCulturalList.js`：统一三个列表页的 `NINE_CITIES` / `setRegion`（含 `?region=` URL 双向同步）/ `tagsOf` / `load` / 三态。三处重复实现收敛为一。
4. 类目元数据**单一来源**：`config/culturalCategories.js` 增加 `seal` / `label` / `desc` / `tags` / `route` 字段，`CulturalGallery` 与 `CityCulture` 都从这里读。删掉 `CulturalGallery.vue:67-94` 的四个硬编码数组。
5. 六套页头 → 统一用 `SectionHeading` + 一个 `PageHero` 组件（tag / title / desc / 可选统计）。删掉 `cg-hero`（与宿主 `cv-hero` 重复）。
6. `CulturalDetail.vue` 补空态分支；移植 `FestivalDetail.vue` 的四区块布局做法（按类目给详情字段分组 + 印章小标题），然后**删掉那个死文件**。
7. 撞色渐变全删，改 `InkPlaceholder` + `--accent`。`max-width` 统一 `--container-max`。
8. `LiteratureList.vue:45` 用中文映射（把 `CulturalDetail.vue:82` 的 `CATEGORY_LABELS` 提到 config 共享）。
9. `LiteratureList` 印章字改用**条目标题首字**（当前 `id % 6` 取字与内容无关）。
10. `FestivalList` 的死日期结构：要么后端列表接口带上 `festival_detail.date_desc`（推荐，一次 join），要么删掉展示位。**不要留着永远为空的槽**。
11. `FoodOperaList` 分类改读 `subCategory`（需后端列表接口返回），删掉标题正则；删掉两个假 tab。
12. `LiteratureList:223` 恢复 hover 阴影，三个列表页 hover 位移统一（当前 -5 / -2 / -2 / -12px 四种）。
13. `CityCulture` 定位重新明确：**改为「城市 × 五类」的交叉入口**，tile 内展示列表页没有的信息（该城该类的条目数 + 最具代表的一条摘要 + 关联景点），消掉纯子集重复。
14. **库里 craft 条目的列表入口**：`/culture` 的工艺卡改为跳新路由 `/crafts/list`（列表），3D 专题页从列表页内某个条目进入；或在 `/crafts` 3D 页底部加「全部工艺条目」区。
15. `CraftWorkshop`：`setInterval` 改 `watch`；`--craft-stage-bg` 用 `--surface-sunken`（阶段 0 已加），3D 舞台底从纯黑改宣纸深色。
16. 空态统一用 `EmptyState` 组件（当前 `CityCulture` 有 5 处内联 `.cc-tile__empty`、`InkTimeline` 有 3 处内联）。
17. `CultureGalleryView.vue` 的死 reveal：给根元素绑 `ref="rootRef"`。
18. `CulturalGallery.vue:104-106` 的静默 `console.warn` 加可见降级（计数失败显示 `—` 时给出提示）。

**P1（本次不做，待报价）**：61 条 cultural 配图 AI 生成。生成前按 `.workbuddy/skills/sjg-media-assets/SKILL.md` 出清单 + 积分报价；四步后处理（裁水印 1536×1024→1216×764、压缩、归位 `media/{real,inkwash}/`、V25 幂等 migration 回填）。

---

## 批次 D：文脉长河

### D.1 三个**功能性 bug**（不是排版问题，优先修）

1. **10 张素材全部 404。** `InkTimeline.vue:163-176` 用 `new URL('../../public/media/inkwash/timeline/xxx.png', import.meta.url)`。文件在 `src/components/timeline/`，`../../` 回到 `src/` → 拼出 `src/public/media/...`，而 **`src/public/` 目录不存在**（`public/` 在项目根）。实测解析为 `http://localhost:5175/src/public/media/inkwash/timeline/scene-qin.png` → 404。**长卷底图、小舟、9 张朝代场景图全部加载失败。**
   - 正确服务路径是 `/media/inkwash/timeline/xxx.png`。且项目已有 `themes/manifest.js` 的 `resolveAsset(key, theme)` 统一解析层，这里绕过了它。
   - 顺带：10 张图共约 15MB，9 张 scene 图**全部同时挂在 DOM**（只靠 opacity 切换，`loading="lazy"` 对已在视口元素无效），`scroll-map-base` 还是 `loading="eager"`。

2. **SVG 用户坐标被当 CSS 像素用。** `useBoatJourney.js:49-53` 用 `getPointAtLength` 取 viewBox `0 0 1200 400` 内的点，`InkTimeline.vue:63` 直接 `left: node.x + 'px'`。而 SVG 是 `preserveAspectRatio="xMidYMid meet"` + `width:100%` → **只有容器恰好 1200×400 时才对齐**。1280px 页宽下内容区约 1184px → 节点相对虚线路径整体偏移，`meet` 模式的纵向 letterbox 再加一层偏差。移动端 375×300 时最严重。小舟同理。

3. **事件 `image_url` 无任何展示位。** `InkTimeline.vue:130-137` 事件块只有 year + title 两个 span，无 `<img>` → **V24 刚回填的 3 条事件配图不可见**（`V24__imagegen_asset_backfill.sql:58-59` 自己已注明这点）。

### D.2 「长卷」是隐喻而非实现

`.ink-timeline__scroll`（:302-310）是**固定 `height:400px`**（1024↓350、768↓300）、`width:100%`、`overflow:hidden` 的**单屏容器**。全组件**零 `ScrollTrigger`、零 pin、零 scrub**（已 grep 确认）。9 个朝代全部同时挤在不足 400px 高的框里，靠 `getPointAtLength` 等分（`t=(i+0.5)/9`）绝对定位。

移动端 300px 高 × 375px 宽里塞 9 个 40px 印章 + 年份文字 → **必然重叠**；小舟仍是 60px 固定不缩放。

### D.3 数据丢弃与截断无提示

| 实体 | 后端返回 | 前端渲染 | 丢弃 |
|---|---|---|---|
| Dynasty | id/name/startYear/endYear/**description** | name、起止年 | **description 完全未渲染**（死文件 `RealTimeline.vue:31` 有展示位） |
| Event | id/title/**description**/year/**significance**/**imageUrl** | year、title | **description、significance、imageUrl 全丢**（RealTimeline.vue:50 有 significance 位） |
| Poet | 全部字段 | 仅 name、id | 其余全丢 |
| Poem | 全部字段 | 仅 title、id | 其余全丢 |

截断：名士 `slice(0,8)`、诗词 `slice(0,5)`、事件 `slice(0,3)`，**三处都无「等 N 位」提示**，而计数区显示的是**未截断的真实总数** → 会出现「32 位名士」下面只列 8 个 chip 且无任何说明。

**朝代数据双源冲突**：`useBoatJourney.js:22-32` **硬编码 9 个朝代**（含 `{id:9,name:'金'}`），节点年份取硬编码值（`:67`），面板年份取接口值（`:77`）→ **同一朝代两处可显示不同年份**。后端 `dynasty` 表增删或 id 变更时前端不跟随。

### D.4 交互与可达性

- **键盘完全不可达**：朝代节点是裸 `<div>` + `@click`（:56-65），**无 tabindex、无 role、无 keydown**。小舟 `<img>` 同样不可聚焦，拖拽无键盘替代。面板内 router-link 可聚焦，但通往它们的路（选朝代）键盘走不通。整块无 `role="region"`、朝代切换无 `aria-live`。**同项目列表页均已正确实现**（`FestivalList.vue:38-41` 有 `tabindex/role/keydown`）→ 这是回归。
- **`autoCruise(30)` 无限循环无暂停 UI**（`useBoatJourney.js:132` `repeat:-1`）：用户不操作时页面也在自己动，持续触发面板重挂载 + 场景 crossfade。而**点一次印章后 `goToDynasty` 内部 `_tween.kill()` 会永久杀掉巡航，无恢复入口**。
- **拖拽是离散跳格**：`:263` `Math.floor(newProgress * 9)` 只 snap 到整数索引；`_startProgress` 取自 `progress.value` 但目标算的是含 `+0.5` 偏移的 `goToDynasty` → 起手一次跳变。未设 `touch-action` → 拖小舟与页面纵向滚动冲突。
- **无深链接、无 URL 状态**：组件与 `Timeline.vue` 都不读 `route`，URL 恒为 `/timeline`，无法定位某朝代，刷新回到先秦并重启 30s 巡航。而三个文化列表页都实现了 `?region=` 双向同步 → 时间轴是唯一无 URL 状态的交互页。
- **`/timeline` 无骨架屏**：`loaded` 只守卫 `heroStats`。加载期间 InkTimeline 已挂载但 `data` 为空 → 长卷/小舟/9 印章照常渲染，面板因 `?? dynasty` 兜底显示「暂无名士/诗篇/史事录入」三连 → **加载中与真空数据视觉上无法区分**。`ErrorState` 还放在 InkTimeline **之后**（`Timeline.vue:9`）→ 错误时空长卷与错误提示并存。
- `onSelectDynasty`（`Timeline.vue:58-61`）只有一句 `console.log`。
- `MotionPathPlugin` 注册了但**从未使用**（`useBoatJourney.js:3-5`），实际是手写 `getPointAtLength` + `gsap.set` + 对临时对象 `{t}` 补间。

### D.5 死文件 `RealTimeline.vue`（561 行）有 13 项 InkTimeline 缺失的能力

值得移植的：① `DynastyRail` 组件化朝代选择（原生 `<button>` + `role="tablist"` + `aria-selected` + `scroll-snap` + 每 chip 显示 poetCount 徽标 + `is-faded` 标记零数据朝代）② 朝代 `description` 展示位 ③ 事件 `significance` 展示位且**事件不截断** ④ 「等 N 位」溢出提示 ⑤ 更宽配额（poets 12 / poems 8 / events 全量）⑥ 加载骨架（120px + 三块 260px，带 `aria-busy`）⑦ **「诗风演变」区块**（诗经→楚辞→唐诗→宋词→元曲 五段横轨，移动端转竖排）⑧ **「文脉之最」派生统计**（名士最盛/诗篇最丰/跨度最长朝代，从同一份 data 现算零额外请求）⑨ `SectionHeading` 复用 3 处 ⑩ 默认选中隋唐而非空 ⑪ 三档响应式栅格。

### D.6 改法

1. **先修三个 bug**：素材路径改走 `resolveAsset`（或至少改成 `/media/...` 绝对服务路径）；坐标改用**百分比**（`getPointAtLength` 结果除以 viewBox 宽高再转 `%`，与 `preserveAspectRatio` 无关）；事件块加配图位（V24 的 3 条立即可见）。
2. **长卷做成真长卷**：`.ink-timeline__scroll` 改为横向可滚容器（`overflow-x:auto` + `scroll-snap-type:x mandatory`），9 个朝代按内容宽度自然展开而非挤在 400px 内。桌面可选 pin+scrub（复用 `useScrollNarrative` 的 ink 分支模式），但**必须保证 `prefers-reduced-motion` 下退化为原生横滚而非静止**（这正是 A.7 第 6 条要修的同类问题）。
3. **可达性补齐**：朝代节点改 `<button>` + `role="tab"` + `aria-selected` + `aria-controls`，左右方向键切换；面板 `role="tabpanel"` + `aria-live="polite"`。直接移植 `DynastyRail.vue` 作为移动端/键盘的等价入口。
4. `autoCruise` 加暂停/播放按钮；点击印章后**暂停而非 kill**，保留恢复入口。加 `touch-action: pan-y` 让纵向滚动优先。
5. **深链接**：`?dynasty=tang` 双向同步（复用批次 C 的 URL 同步做法）。
6. 补骨架屏；`ErrorState` 移到 `InkTimeline` **之前**并互斥。
7. **朝代数据单源**：删掉 `useBoatJourney.js:22-32` 的硬编码，改为从 `props.data` 派生节点（`data.map(d => d.dynasty)`）。年份统一取接口值。
8. 补展示 `dynasty.description`、`event.significance`、`event.description`；截断处加「等 N 位/首」提示。
9. 移植 `RealTimeline` 的「诗风演变」与「文脉之最」两个区块（零额外请求，纯派生），然后**删掉 `RealTimeline.vue`**。
10. 9 张 scene 图改按需加载（只挂当前 + 相邻两张），`scroll-map-base` 改 `lazy`。15MB 需压缩到符合「单页媒体增量 < 3MB」预算（`.workbuddy/memory/2026-08-05.md` 记录的已确认预算）。
11. 移动端：印章改横向 rail（不再绝对定位重叠），小舟随容器缩放。
12. 删掉未使用的 `MotionPathPlugin` 注册。
13. `Timeline.vue` 的 padding 走 `--sp-*`（当前 `56px 48px` / `40px 32px` / `32px 16px` 无标度）。
14. 空态改用 `EmptyState`（当前 3 处内联）。

---

## 阶段 E：验收

### 每批次必跑
```
cd display-v2
npm run build          # 必须零错误
npm run test:unit      # 当前 31 passing，不得减少
```

### 视觉与功能验收清单

**阶段 0**
- [ ] `grep -rn "theme-real\|isReal\|ThemeSwitcher"` 零命中
- [ ] 10 个无定义 CSS 变量的使用处全部已替换或已补定义
- [ ] 硬编码颜色 < 30 处且每处有注释理由
- [ ] 六页视觉回归无未着色元素

**批次 A**
- [ ] 首屏（不滚动）能看到 24 节气交互件——当前完全在首屏之下
- [ ] 1920px 屏上 hero 标题左边界与「名城精选」左边界对齐（当前差 288px）
- [ ] 滚动时 header 不再有 5px 垂直位移、无 10px 裸露带
- [ ] 769–1024px 宽度下 4 项导航仍可见
- [ ] 四联统计全站每页最多出现一次；hero 副标题不含与 API 冲突的数量词
- [ ] AI 小文悬浮入口可点击（当前被 datav 按钮完全遮蔽）
- [ ] `VITE_DATAV_URL` 生效，无硬编码 localhost

**批次 B**
- [ ] AI 赏析六个页签有内容（当前因解包层级错**全部为空**）
- [ ] 正文行宽 ≤ 34em
- [ ] 270 字长诗不再拉出 8000px 竖条；51 段诗不再被裁掉列
- [ ] 单列诗（62.6%）不再左右各留 316px 空白
- [ ] 那 35 首 JSON 数组 `videoUrl` 能正常播放
- [ ] 返回按钮不再压住导航栏
- [ ] 缺 biography（37%）/ 缺头像（87%）时页面不塌陷

**批次 C**
- [ ] `/culture` 与五类列表页每张卡都有视觉（图或 `InkPlaceholder`），无 180px 空白块
- [ ] 库里那 2 条 `image_anime_url` 配图在页面上可见（当前 100% 不可见）
- [ ] `CulturalDetail` 有图片展示位与空态
- [ ] `NINE_CITIES` 全仓一处定义
- [ ] `FestivalList` 日期位有数据或已删除（不留空槽）
- [ ] 库里 craft 条目有列表入口

**批次 D**
- [ ] 10 张 timeline 素材加载成功（当前全 404）
- [ ] 朝代节点与虚线路径在 375 / 1280 / 1920 三档宽度下都对齐
- [ ] V24 回填的 3 条事件配图可见
- [ ] 键盘 Tab + 方向键可切换朝代
- [ ] `?dynasty=` 深链接可用，刷新保持
- [ ] `prefers-reduced-motion` 下长卷内容仍可完整浏览
- [ ] timeline 页媒体总量 < 3MB

### 建议的截图对比点
`/map`（首屏 + 滚动到名城精选）、`/poets/17`（苏轼，有头像）、`/poets/93`（韩愈，V24 刚补的头像）、`/poems/149`（多段诗）、`/poems` 里任一单列诗、`/culture`、`/festivals`、`/timeline`。每处 1920×1080 与 390×844 两个尺寸。
