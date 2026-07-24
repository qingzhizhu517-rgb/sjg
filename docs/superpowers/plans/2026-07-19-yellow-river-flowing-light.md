# P1 #3: 首页黄河流光 + 沿河联动

> 路线图 `2026-07-19-display-v2-next-phase-roadmap.md` 的 #3。首页 = MapView(不新增页), 在现有 Three.js 地图场景给黄河加流光 + 沿河城市联动。
> 分支: `feat/map-frame-layout`(承接 #1/#2 提交)。

## 1. 现状(已探明)

- **河流已存在**(MapView.vue, 移植自 display-v3 `RiverPath.js`):
  - `riverGeoPoints`: 真实 lon/lat(菏泽->聊城->德州->济南->淄博->滨州->东营->渤海口)。
  - `riverCurve` = CatmullRomCurve3(terrain-following), `riverGeom` = TubeGeometry(curve, 64, r=0.15, 8, false)。
  - `riverMat` = **MeshBasicMaterial(0xc27b38 金, opacity 0.85)静态**, 无流光。
  - 80 个流动粒子点(tick 里 `dotOffsets[i] = (dotOffsets[i] + 0.001) % 1.0`, L1036 区)。
  - 地形凿河谷(guidePoints in `getTerrainHeight`) + 2D SVG 视差河层。
- **城市联动已完备**: `selectedCity` ref(L393) -> 右侧城市卡(L120-130); label 点击(L50->L259) & 3D 针点击(raycaster L958, 仅匹配城市针 L979)都 flyTo + 选城。**raycaster 不命中 `riverMesh`** -> 点河无反应, 是新增量。
- **9 城**: 菏泽/济宁/泰安/聊城/济南/德州/淄博/滨州/东营。**7 沿河**(菏泽/聊城/德州/济南/淄博/滨州/东营, 据 riverGeoPoints 注释), 无 river 标记。图例已有"黄河流经"(L161)。
- **tick 循环**: L1031 `elapsedTime = clock.getElapsedTime()`, L1107 `renderer.render`。

## 2. 目标(路线图 #3 验收: 地图可见流动黄河 + 沿河城市可交互联动右侧卡 + 桌面性能稳定)

1. **流光 shader**(核心): 河管 `MeshBasicMaterial` -> `ShaderMaterial`, 沿管长动画 UV 的流动光带。
2. **沿河城市点亮**: 7 沿河城视觉差异化(光晕/标记)。
3. **点河联动**: raycaster 增 `riverMesh` 命中 -> 最近沿河城 -> 复用 flyTo/selectCity。
4. **性能守卫**: pixelRatio cap + 低端降级。

## 3. 方案

### 3.1 流光 shader(T1, 核心)
`riverMat` 换 `THREE.ShaderMaterial`:
- **uniforms**: `uTime`(float), `uColor`(0xc27b38), `uHighlight`(0xffe896), `uFlowSpeed`(~0.6)。
- **vertex**: 传 `uv`(TubeGeometry 沿管长 uv.x ∈ [0,1]) + 法线; 标准 modelView 投影。
- **fragment**: 沿管长流动光带 `brightness = 0.6 + 0.4 * sin(uv.x * 18.0 - uTime * uFlowSpeed * 6.0)`; 颜色 `mix(uColor, uHighlight, brightness)`; 入海端(uv.x→1)略提亮; alpha 随亮度脉动(0.7~0.95)。
- `transparent: true, depthWrite: false, blending: AdditiveBlending` 营造发光。
- tick(L1031-1107 间)加: `if (riverMat.uniforms) riverMat.uniforms.uTime.value = elapsedTime`。
- **保留 80 流动粒子点**(粒子+流光双层更丰富, 已动画, 零额外成本)。
- **兼容**: ShaderMaterial 标准 three.js, 无新依赖; GLSL ~10 行。

### 3.2 第二层 glow 管(T2, 可选, 看效果)
若单层流光不够亮: 叠一层大半径(r=0.28)低透明(opacity 0.25) additive 管做光晕。**默认先不加**, T6 看效果再定。

### 3.3 沿河城市点亮(T3)
- `cityGeoCoords` 7 个沿河城加 `river: true`。
- 渲染城市针(L876 区)时, 沿河城加一道更亮/暖的光晕环(复用现有 ripple 或加一圈), 与非沿河城(济宁/泰安)区分; 呼应图例"黄河流经"。

### 3.4 点河联动(T4)
- `riverMesh.name = 'yellow-river'`。
- `onPointerDown`(L958) raycaster: 优先匹配城市针(现有 L979 不变); **未命中城市针时**, 查 `riverMesh` 命中 -> 找 `river:true` 城里距命中点最近者 -> `flyToCity(name)`(复用 L311)。
- canvas 鼠标悬停河流时 `cursor: pointer`(hover 检测同 raycaster)。

### 3.5 性能守卫(T5)
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`(若未设)。
- 低端降级: `navigator.hardwareConcurrency <= 4 || matchMedia('(prefers-reduced-motion: reduce)').matches` 时, `riverMat` 退回静态 MeshBasicMaterial(用 ref/flag 标记, tick 跳过 uTime)。

## 4. 任务分解

- **T1** `riverMat` 换 ShaderMaterial + GLSL 流光; tick 加 uTime 更新。
- **T2** (可选) 第二层 glow 管 - T6 看效果决定。
- **T3** `cityGeoCoords` 加 `river` 标记; 沿河城光晕差异化。
- **T4** raycaster 加 `riverMesh` 命中 -> 最近沿河城 flyTo; hover cursor。
- **T5** pixelRatio cap + 低端降级 flag。
- **T6** 验证: `npm run dev` 看流光动画流向(入海方向) + 点河选城 + 沿河城高亮 + 移动端不卡; 提交(1 commit: `feat(display-v2): 黄河流光 shader + 沿河城市联动`)。

## 5. 待定/决策

- **流光强度**: 默认中等, uHighlight/uFlowSpeed 可调。
- **glow 第二层(T2)**: 默认不加, 看效果。
- **沿河城点亮形式**: 光晕环(倾向, 与现有针风格一致) vs 小水滴标记。
- **移动端降级阈值**: hardwareConcurrency≤4 或 prefers-reduced-motion。

## 6. 风险

- **TubeGeometry uv.x 方向**: 需确认流向(应朝入海/东营方向)。若反向, fragment 里翻转 `sin(uv.x...)` -> `sin((1.0-uv.x)...)`。T6 目测确认。
- **AdditiveBlending 过曝**: 控制 brightness/uHighlight, 避免全白; T6 调。
- **raycaster 城市针/河流冲突**: 优先城市针(L979 不变), 未命中再查 riverMesh。
- **ShaderMaterial 与双主题**: 河流是地理要素, 主题无关, shader 颜色固定金(不随 real/inkwash 切), 与 #2 token 体系不冲突。

## 7. 不在范围

- 不新增页面(首页仍 MapView)。
- 不改河流路径坐标(数据已就绪, 精度待定项暂接受现状)。
- display-v3 不动(只借思路, 已移植)。
- #8 沿河民俗节点(后期挂, 本期不做)。
