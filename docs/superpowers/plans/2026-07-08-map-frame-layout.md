# 3D 地图框体化 · 左图右册布局

> 分支: `feat/map-frame-layout`（基于 `feat/geo-pod-redesign` 4054d90）
> 范围: 仅前端 `MapView.vue`；3D 场观不动；inkwash 主题不动

## 决策（已确认）
布局 = **左图右册**：左 ~62% 沙盘框裹 3D 地图；右 ~38% 册页信息面板（HUD + 图例/操作 + 城市卡 dock）。城市卡与 HUD 不再浮在 3D 上，有固定停靠位。

## 结构
`.real-3d-container` 由「整屏 100vh」改为居中带内边距的区块，内含 2 列网格 `.map-stage`：
- 左 `.map-frame`（沙盘）：标题条「山河图志 · 沙盘」+ `canvas-3d-wrap`（3D canvas + 浮动标签 overlay）。
- 右 `.map-album`（册页）：印章标题/eyebrow + 真实统计 + 描述 + 显隐标签 + tips + 城市卡 dock。
- 下方（全宽，in-flow）：沿黄九城（不变）。

## 改动（单文件 MapView.vue）
### Template
- 新建 `.map-stage > [.map-frame, .map-album]`；把现 `.hud-panel` 内容迁入 `.map-album`。
- 删除浮动 `.city-card-anchor`；`<CityDetailCard>` 改 dock 在 `.map-album__dock`（未选城市时占位「单击发光节点预览城市…」）。
### Script
- 删除 `cardPos` / `isMobile` / `anchorStyle`（不再浮动吸附）。
- `openCity` 简化为：置 `selectedCity` + 异步补全 `detail`（去掉就近吸附定位数学）。
- 保留 `closeCity` / `onCardGo` / `ensurePoets`；`handleResize` 去掉 isMobile 行。
### CSS
- `.real-3d-container`：去 `height:100vh-nav; overflow:hidden` → `max-width:1320px; margin:0 auto; padding:32px 40px;`。
- `.map-stage`：`display:grid; grid-template-columns:1.6fr 1fr; gap:24px; height:calc(100vh - var(--nav-height) - 80px); min-height:520px;`。
- `.map-frame`（flex 列）：标题条(auto) + `canvas-3d-wrap`(flex:1)；纸本底 + 墨边 + 四角印章装饰 + 内阴影 + `overflow:hidden`。
- `.map-album`（flex 列）：墨边 + 内边距 + `overflow-y:auto`；含 head/stats/desc/actions/tips/dock。
- 复用 `.hud-seal/.hud-title/.hud-stats/.stat-*` 等类（在册页内重排，去 absolute 定位）。
- 响应式：`<=1024px` 单列（地图上、册页下，地图高度缩短）；`<=640px` 内边距收窄。

## 可行性
3D canvas 自适应父容器尺寸（`initThree`/`handleResize` 读 `parentElement.clientWidth/Height`）；框体化只需父级有确定尺寸（grid cell stretch + flex:1 给 canvas-3d-wrap 实高）。`handleResize` 仍按窗口 resize 更新 `camera.aspect` + `renderer.setSize`。**Three.js 场观零改动。**

## 验收
- [ ] 3D 地图在左侧沙盘框内，不再整屏
- [ ] 右册页显示 印章标题/真实统计/图例/城市卡 dock
- [ ] 点城市节点 → 城市卡在右侧 dock 显示（不浮在 3D 上）
- [ ] 拖拽旋转/缩放正常；窗口 resize 地图自适应
- [ ] real+inkwash 双主题；`<=1024` 单列、`<=640` 移动端可用
- [ ] `npm run build` 通过

## 不在范围
- 3D 场观（地形/黄河/节点）改造
- inkwash（anime 卷轴）主题
- 后端接口
