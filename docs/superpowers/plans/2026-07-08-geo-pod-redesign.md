# 三维地理文脉舱 + 城市卡片重设计

> 分支: `feat/geo-pod-redesign`（基于 `a1d9f0a` 干净 tip）
> 范围: 仅前端；不新增后端接口；Three.js 3D 场观（地形/黄河/城市节点）不动

## 决策（已与用户确认）
- **范围**：仅舱体外壳（左侧 HUD 面板 + 城市点击卡 + 浮动标签样式）
- **HUD 美学**：中式水墨古典（去 `DH SYSTEM` 科技徽章 → 印章/竖排/卷轴边饰，与全站一致）
- **城市卡**：丰富内容（真实数据 + 城市档案 + 代表图 + 多入口），就近吸附被点击节点

## 现状痛点
1. HUD 统计硬编码 `10/6/8`，但 `loadHeroData` 已拉到真实总数（71 景点 / 130+ 诗人 / 195 诗篇）——数据过时且自相矛盾。
2. HUD 的 `DH SYSTEM` 科技徽章与全站中式水墨调割裂。
3. 城市卡仅一行 `mockCities[city].desc` + 单按钮，忽略 `mockCities` 富字段（tag/subtitle/geo/history/season）与真实数据（景点数/诗篇数/该市名士），且固定左下、与被点节点无空间关联。

## 数据来源（全部既有接口 + mock）
| 字段 | 来源 |
|---|---|
| 景点数 spotCount | `/spots/regions`（MapView 已加载 `regions` 数组 `{name, spotCount}`） |
| 诗篇数（城市合计） | `/spots?region=X&size=100`，求和 `spot.poemCount` |
| 代表景观图 / 景点名预览 / 首个 spotId | 同上 `records[0]` |
| 城市档案（副标/地理/历史/季节/英文/标签） | `mockCities[X]`（静态，即时） |
| 该市名士（出生地匹配） | `/poets` 全量（模块级缓存，按 `birthplace` 别名模糊匹配） |

## 新增文件
1. `display-v2/src/config/cityAliases.js` — 城市→地名别名映射（出生地模糊匹配用）
2. `display-v2/src/composables/useCityEnrichment.js` — 模块级单例 `loadAllPoets()`（分页循环 + null 失败缓存，仿 `usePoetEnrichment`）+ per-city spots 缓存 + `enrichCity(name)` 返回响应式聚合数据
3. `display-v2/src/components/homepage/CityDetailCard.vue` — 富城市卡组件（从 MapView 内联卡抽取，独立可复用）

## 修改文件
`display-v2/src/views/MapView.vue`
- **HUD 面板**：删 `hud-badge`「DH SYSTEM」→ 改竖排朱红印章（如「山河图志」）；标题保留「三维地理文脉舱」用水墨字体；统计区改用真实 `heroStats`（景点/文人/名篇/城市总数）替代硬编码；加卷轴/印章边饰；保留「显隐标签」按钮（水墨化）、tips。
- **城市卡**：`<CityDetailCard>` 替换内联 `hud-detail-card`；位置由「固定左下」→「就近吸附点击节点」：复用 `cityLabels` 已算好的屏幕 `x/y`，加 viewport 边界 clamp 防溢出；`<768px` 回落固定底部。
- **浮动标签**：轻量水墨化（accent 对齐，可选最小改动）。
- 接入 `useCityEnrichment`；点击节点/标签触发 `enrichCity(name)`。

## CityDetailCard 设计（丰富）
```
┌─ 泰安 ─────────────── ×
│  五岳之首 · 天下泰安          ← subtitle + tag 印章
│ ═══════════════════
│ ┌────────┐ 泰山·岱庙·红门宫…   ← 景点名预览
│ │ 代表景观图│ 3 处景观 · 12 篇咏景  ← spotCount + poemCount
│ └────────┘
│ ═══════════════════
│ 地理  山东中部，泰山脚下        ← mockCities.geo
│ 历史  国家历史文化名城          ← mockCities.history
│ 季节  春秋两季最佳              ← mockCities.season
│ 名士  石介 …                    ← 出生地别名匹配，前 3
│ ═══════════════════
│ [进入景观] [名篇] [名士]        ← 三入口
└────────────────────────────┘
```
- 头部：城市名（大）+ 关闭 × + tag 印章 + 英文小字（mockCities.english）
- 代表图：`spot.imageUrl`，经 `useImage.getImageUrl(url, isAnime)`；失败回落首字朱印（仿 PoetDetail 头像兜底）
- 三入口目标（全部既有路由，城市相关）：
  - `[进入景观]` → `/regions/X`（主，该市全部景点）
  - `[名篇]` → `/spots/{firstSpotId}`（代表景观详情，含其关联诗词）
  - `[名士]` → `/poets/{firstCityPoetId}`（有则启用，无则隐藏）
- 加载态：静态 mock 字段即时显示；真实 stats/图/名士 enrich 完成前用骨架/淡入，不阻塞。
- 关闭：× / Esc / 点击空白。

## 城市→别名映射（cityAliases.js）
```
济南: 济南/历城/齐州/章丘
淄博: 淄博/淄川/益都/新城/桓台/博山
泰安: 泰安/奉符/泰山
济宁: 济宁/曲阜/邹城/兖州
菏泽: 菏泽/曹州/鄄城/东明/巨野
聊城: 聊城/东昌
德州: 德州/陵县/平原
滨州: 滨州/渤海
东营: 东营/利津/垦利
```
（曲阜/邹城虽是独立 DB region，按地理归入济宁做诗人匹配；景点数仍按 DB region 取。）

## 双主题与复用
- 全用 CSS 变量（`--accent`/`--card-bg`/`--border`/`--text-*`/`--font-heading`/`--font-display`）+ 既有 `.hover-lift`/`.card`/`decor-corner` 模式，保证 real/inkwash 双主题可用。
- 复用：`useImage`、`api`、`mockDetailData`、`utils/poem.js`（如需）。
- 仿 `usePoetEnrichment` 的失败缓存纪律：`loadAllPoets` 失败置 `null`（非 `[]`）以便重试。

## 错误处理
- `/spots?region` 失败 → 卡片仍显示 mock 档案 + 失败提示，不阻塞。
- `/poets` 失败 → 名士区省略、`[名士]` 隐藏。
- 图片失败 → 首字朱印回落。
- 某市无诗人/无景点 → 对应区省略、对应按钮隐藏，不报错。

## 验收（DoD）
- [ ] HUD 无 `DH SYSTEM`，水墨印章化；统计为真实总数（非 10/6/8）
- [ ] 点击城市节点/标签弹出富卡，就近吸附、不溢出视口
- [ ] 卡片显示真实景点数/诗篇数/代表图/名士 + mock 城市档案 + 三入口可用
- [ ] × / Esc / 空白 可关闭
- [ ] real + inkwash 双主题美观
- [ ] `<768px` 移动端卡片回落固定底部、可用
- [ ] `npm run build` 通过，无控制台报错
- [ ] 组件卸载清理（无残留监听/定时器）

## 风险
- **就近吸附定位**：节点贴边时 clamp 防溢出；移动端回落固定底部。
- **诗人地名匹配为模糊**：可能漏/误；用别名集控制，首期可接受。
- **不动后端**：所有数据走既有接口 + mock。

## 不在范围
- Three.js 3D 场观（地形/黄河/节点）改造
- inkwash（anime 卷轴）主题
- 底部「沿黄九城」CityQuickCard 网格
- 后端接口
