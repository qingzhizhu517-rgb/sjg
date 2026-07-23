# P2 #6: 数字化可视面板 `/dashboard`

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #6「数字化可视面板」。
> 范围: 站内 `/dashboard` 看板页, 现代大屏观感, 复用 echarts + g6, 参考 DataV-Vue3 视觉风格。
> 分支: `feat/map-frame-layout`(承接 #1/#2/#3/#4/#5 提交)。

## 1. 现状(已探明)

- **echarts + g6 已装**: `echarts@^6` + `@antv/g6@^5`, 可直接用。
- **数据可讲故事**: 朝代分布、情感分布(sentimentTags)、景点地理密度、时间线诗词量、黄河流经城市文化密度。
- **无 `/dashboard` 路由**: 需新增。

## 2. 目标(路线图 #6 验收: /dashboard 可访问; 各图正确渲染; 视觉现代统一)

1. **站内 `/dashboard` 看板页**: 新增路由, 非展厅大屏。
2. **内容**: 朝代分布、诗词情感分布、景点地理密度、时间线诗词量、黄河流经城市文化密度。
3. **视觉**: 现代大屏观感, 参考 DataV-Vue3(仅参考, 不强引重框架)。

## 3. 方案

### 3.1 数据 API — `PublicDashboardController`

- `GET /api/public/dashboard/stats` 返回:
  ```json
  {
    "dynasty_distribution": [{"dynasty":"唐","count":15}, ...],
    "sentiment_distribution": [{"tag":"豪放","count":30}, ...],
    "spot_density": [{"region":"济南","count":12}, ...],
    "timeline_poems": [{"year":618,"count":3}, ...],
    "yellow_river_cities": [{"city":"济南","poet_count":20,"poem_count":50}, ...]
  }
  ```
- 后端: 聚合查询 `poem`/`poet`/`scenic_spot` 表, 返回统计 JSON。

### 3.2 前端 — `Dashboard.vue` 页面

- 布局: 2x2 或 3x2 网格, 每格一个图表。
- 图表:
  1. **朝代分布**: echarts 饼图/环形图。
  2. **情感分布**: echarts 词云或柱状图(sentiment_tags JSON 解析)。
  3. **景点地理密度**: echarts 地图散点(山东地图) 或 柱状图(按 region)。
  4. **时间线诗词量**: echarts 折线图(按 dynasty 时间轴)。
  5. **黄河流经城市文化密度**: echarts 柱状图(7 沿河城 poet/poem 数)。
- 样式: 深色背景(`#1a1a1a`) + 亮色图表, 现代大屏观感。

### 3.3 路由 — `/dashboard`

```javascript
{ path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') }
```

### 3.4 视觉参考 — DataV-Vue3

- 仅参考视觉风格(深色背景/亮色图表/边框装饰), 不强引重框架。
- 如需轻量组件(如装饰边框), 可引 `@kjgl77/datav-vue3`(MIT, 体积小)。

## 4. 任务分解

- **T1** `PublicDashboardController` + 聚合查询 API。
- **T2** 后端重启 + curl 验证返回统计数据。
- **T3** `Dashboard.vue` 页面骨架(网格布局 + 图表容器)。
- **T4** echarts 朝代分布饼图。
- **T5** echarts 情感分布柱状图。
- **T6** echarts 景点地理密度图。
- **T7** echarts 时间线诗词量折线图。
- **T8** echarts 黄河流经城市文化密度图。
- **T9** 样式美化(深色背景/亮色图表/边框装饰)。
- **T10** 路由 `/dashboard` + 导航入口(可选)。
- **T11** 验证(`npm run dev` 看 `/dashboard`), 提交(2 commit: 后端 + 前端)。

## 5. 待定/决策

- **是否引 DataV-Vue3**: 先不引, 纯 echarts + CSS 实现; 如需装饰边框再引。
- **移动端适配**: 看板通常桌面, 移动端可简化(单列布局)。
- **数据刷新频率**: 静态快照(进页加载一次) vs 实时(WebSocket)。本轮先静态。
- **导航入口**: 是否在主导航加"数据看板"链接。本轮先不加(直接访问 `/dashboard`)。

## 6. 风险

- **聚合查询性能**: 126 诗人 + 195 诗 + 70 景点, 量小无压力。
- **echarts 体积**: `echarts@^6` 已装, 按需引入(`echarts/core` + 所需图表)。
- **视觉一致性**: 需与 real/inkwash 双主题兼容 → 用 CSS 变量控制图表颜色。

## 7. 不在范围

- 展厅大屏(独立项目)。
- 实时数据刷新(后期可选)。
- DataV-Vue3 深度集成(仅参考视觉)。
