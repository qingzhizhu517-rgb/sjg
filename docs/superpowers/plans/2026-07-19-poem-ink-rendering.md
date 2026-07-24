# P2 #5: AI 写诗渲染模块 — 逐字落墨动效

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #5「AI 写诗渲染模块」。
> 范围: 诗以逐字落墨动效"写"出, 配水墨意境。CSS mask / clip-path + GSAP stagger, 避开笔顺字形数据依赖。
> 分支: `feat/map-frame-layout`(承接 #1/#2/#3/#4 提交)。

## 1. 现状(已探明)

- **无此功能**: 用户期望"一笔一画写出诗"。
- **技术栈**: `gsap@^3.15`(已装), 可做 stagger 动效。
- **水墨调性**: 纸本水墨杂志式语言已锁定, 逐字落墨需匹配。
- **诗源**: 现有 195 首, 可精选经典起步。

## 2. 目标(路线图 #5 验收: 选定诗可逐字落墨写出; 动效流畅; 桌面/移动降级合理)

1. **逐字落墨渲染**: 每字水墨晕染 + mask 按方向揭示(CSS mask / clip-path + GSAP stagger)。
2. **诗源先精选起步**: 从现有 195 首精选经典 + AI 配题跋/赏析。
3. **预生成 + 前端播放动画**: 诗内容固定, 前端纯动画播放。

## 3. 方案

### 3.1 核心: 逐字落墨动效

**思路**: 每个字用 `<span class="ink-char">` 包裹, 初始 `opacity:0` + `filter:blur(4px)`, GSAP stagger 依次:
1. `opacity: 0→1` + `filter: blur(4px)→blur(0)` (墨迹显现)
2. `transform: scale(0.8→1)` (微弹)
3. 可选: `clip-path` 从圆形展开(更像墨滴扩散)

**GSAP timeline**:
```javascript
const tl = gsap.timeline({ paused: true })
tl.from('.ink-char', {
  opacity: 0,
  scale: 0.8,
  filter: 'blur(4px)',
  stagger: 0.15, // 每字间隔
  duration: 0.6,
  ease: 'power2.out'
})
```

### 3.2 组件: `InkPoemRenderer.vue`

- Props: `poem`(对象), `autoPlay`(bool), `speed`(number)
- 模板: 逐字拆分 `poem.content` → `<span class="ink-char">字</span>`
- 挂载后: `tl.play()` 或按钮触发
- 控制: 播放/暂停/重播按钮

### 3.3 样式: 水墨意境

- 字体: `font-family: var(--font-display)`(楷体/宋体)
- 背景: 宣纸纹理(`background-image: url(...)`) 或纯色 `var(--bg-primary)`
- 墨色: `color: var(--text-primary)`(深墨)
- 纸本装饰: 左右 `「」` 引号(复用 PoemDetail 现有)

### 3.4 模块位置

**本轮**: 独立"即兴赋诗"页(`/ink-poem`), 精选 10-20 首经典 + AI 配题跋。
**后期可选**: 首页 hero 动画 / 诗详情页装饰。

### 3.5 诗源数据

- 从现有 195 首精选经典(李白/杜甫/苏轼/李清照等名家名篇)。
- 新增 `poem.is_featured` 字段标记精选, 或独立 `featured_poem` 表。
- AI 配题跋(可选): 调 LLM 为每首诗生成一句赏析题跋。

## 4. 任务分解

- **T1** `InkPoemRenderer.vue` 组件骨架(逐字拆分 + GSAP timeline)。
- **T2** 水墨样式(字体/背景/墨色/装饰)。
- **T3** 控制按钮(播放/暂停/重播)。
- **T4** 精选诗数据(标记 `is_featured` 或独立表)。
- **T5** `/ink-poem` 路由 + 页面(诗列表 + 选择 → 播放)。
- **T6** 移动端降级(`prefers-reduced-motion` 时跳过动画, 直接展示)。
- **T7** 验证(`npm run dev` 看逐字落墨 + 移动端), 提交(2 commit: 组件 + 页面)。

## 5. 待定/决策

- **模块位置**: 独立"即兴赋诗"页(`/ink-poem`) vs 首页 hero 动画 vs 诗详情页装饰。本轮先做独立页。
- **诗源**: 精选 10-20 首经典 vs 全量 195 首。本轮先精选。
- **AI 题跋**: 可选, 本轮先不含(后期加)。
- **多首轮播**: 本轮先单首播放, 后期可加轮播。

## 6. 风险

- **GSAP 性能**: 195 字全 stagger 可能卡 → 精选短诗(< 50 字) + 移动端降级。
- **水墨风格匹配**: 需与纸本水墨杂志式语言一致 → 复用现有字体/颜色 token。
- **诗源质量**: 精选需人工筛(李白/杜甫/苏轼等名家名篇), 避免冷门诗。

## 7. 不在范围

- 真笔顺动画(需 HanziWriter + 笔顺数据, 风格不符)。
- AI 自写诗(LLM 古诗质量不稳, 避免首页翻车)。
- 首页 hero 动画(后期可选)。
