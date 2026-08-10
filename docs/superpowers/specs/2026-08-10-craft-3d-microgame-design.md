# 非遗工艺 3D 微游戏设计（首发：东昌葫芦雕刻）

> 创建：2026-08-10 ｜ 状态：**已批准（brainstorming 三节确认）**
> 关联：`docs/plans/2026-08-08-cultural-expansion-design.md`（③非遗工艺板块）、`.workbuddy/memory/2026-08-08.md`（GLB 六点咨询）

## 1. 目标与范围

在 display-v2 嵌入 Three.js 微游戏：非遗工艺制作流程的步骤导览 + 成品自由把玩。首发垂直切片 = **东昌葫芦雕刻**（聊城，国家级非遗），作为 ③非遗工艺板块的旗舰内容。

**已确认决策**：

| 决策点 | 结论 |
|---|---|
| 首发场景 | 非遗工艺制作流程（非诗人行程/建筑拆解） |
| 游戏深度 | 步骤导览 + 自由把玩（非任务制/完整游戏） |
| GLB 资产 | 待 AI 生成，本规范定义部件命名契约 |
| 页面落点 | 独立路由 `/crafts`（非嵌入详情页/首页） |
| 主题策略 | 3D 场景双风格：real=PBR / inkwash=Toon+描边 |

**架构方案**：单 GLB + 声明式工序编排（方案 A）。一切步 = 读配置执行部件显隐/动画/相机机位，新工艺零代码改动。

## 2. 分层架构

```
views/CraftWorkshop.vue          路由页 /crafts（编排 + 外围 UI 双主题）
  └─ components/craft/
       CraftStage.vue            3D 舞台容器（canvas + 加载态 + 降级静态图）
       StepRail.vue              工序步骤条（上一步/下一步/自动播放/进度印）
       KnowledgeCard.vue         部件知识点卡（hover/click 部件弹出）
  └─ composables/
       useGlbScene.js            通用 GLB 场景：renderer/scene/camera/灯光/
                                GLTFLoader+DRACO/raycaster/resize/dispose
       useCraftProcess.js        工序状态机：读 step config → 驱动部件动画 +
                                相机 tween → 暴露 currentStep/next/prev/autoPlay
       useToonTheme.js           双风格材质切换：traverse 换 Toon 材质 +
                                EdgesGeometry 描边 / 还原 PBR
  └─ content/crafts/
       dongchang-hulu.js         东昌葫芦工序配置（5 步声明式）
```

### 职责边界

- **useGlbScene**：只管 Three.js 生命周期与拾取，不懂"工序"。接口：`load(url)`、`getObject(name)`、`setVisible(names)`、`onPartHover/Click(cb)`、`applyCameraPose(pose)`、`dispose()`
- **useCraftProcess**：只管工序逻辑，不懂渲染细节。输入 step config + scene api，输出 `currentStep`、`stepMeta`、`next()/prev()/toggleAuto()`。纯逻辑部分（步骤归约、部件集合求值）抽纯函数可单测
- **step config**：数据非代码。新工艺 = 新配置文件 + 注册表一行
- **CraftWorkshop.vue**：编排，目标 < 300 行

### 与文化板块衔接

`src/config/culturalCategories.js` 中 craft 条置 `ready: true`、route `/crafts`。后续 `craft_detail` 扩展表数据（传承人/工序文字）喂页面文案层，本轮前端配置兜底。

## 3. 数据流

切一步的完整链路：

```
用户点「下一步」
  → useCraftProcess.next()
    → currentStep+1，读 steps[i] 配置
    → scene.setVisible(step.visibleParts)          显隐
    → GSAP timeline 跑 step.animations[]           部件动画（位移/旋转/缩放/淡入淡出）
    → scene.applyCameraPose(step.camera)           相机 tween 到机位
  → StepRail 高亮当前工序 + 解说文案切换
  → 到达末步 → 解锁 OrbitControls 自由旋转 + 部件 hover 高亮可点
    → 点击部件 → raycaster 命中 → KnowledgeCard 弹出该部件知识点
```

- `autoPlay`：GSAP timeline 串行播放各步；`prefers-reduced-motion` 直接跳终态
- `IntersectionObserver`：滚出视口暂停渲染循环与自动播放（沿用沙盘既有策略）
- GLB 进入视口才拉取（`import()` 动态加载 + LoadingManager 进度条）

## 4. 工序配置契约

`content/crafts/dongchang-hulu.js` 示例（节选 2 步，全 5 步：选料→去皮晾晒→画稿→雕刻→上色成品）：

```js
export const HULU_PROCESS = {
  slug: 'dongchang-hulu',
  title: '东昌葫芦雕刻',
  model: '/media/crafts/dongchang-hulu.glb',
  knowledge: {                    // 自由把玩模式部件知识点卡（key = GLB 部件名）
    gourd_body:  { title: '葫芦坯', body: '选用聊城本地亚腰葫芦，皮厚质密…' },
    knife_rest:  { title: '刻刀',   body: '平刀、圆刀、斜口刀分工不同…' },
  },
  steps: [
    {
      key: 'select', name: '选料', icon: '选',
      desc: '霜降后采摘，取形正、皮厚、无斑者',
      visible: ['gourd_raw', 'scene_*'],
      animations: [{ target: 'gourd_raw', rotateY: Math.PI * 2, duration: 2 }],
      camera: { pos: [0, 1.2, 3.2], target: [0, 0.6, 0] },
    },
    {
      key: 'peel', name: '去皮晾晒', icon: '晾',
      desc: '刮去青皮，阴凉通风处晾晒月余',
      visible: ['gourd_raw', 'gourd_body', 'peel_strips'],
      animations: [
        { target: 'gourd_raw', fadeOut: true },
        { target: 'peel_strips', moveY: -0.5, opacity: 0, duration: 1.5 },
        { target: 'gourd_body', fadeIn: true },
      ],
      camera: { pos: [1.5, 1.0, 2.8], target: [0, 0.6, 0] },
    },
  ],
}
```

动画指令集（GSAP 驱动）：`rotateY/rotateX`、`moveX/moveY/moveZ`、`fadeIn/fadeOut`（opacity）、`scale`、`duration`、`delay`。未知指令 console.warn 跳过。

命名匹配规则：`visible` 支持尾缀通配（`'scene_*'` 匹配 `scene_base`、`scene_prop_dish` 等）；`animations[].target` 与 `knowledge` 的 key 必须精确命名。

## 5. GLB 命名规范（AI 生成契约）

**文件**：`dongchang-hulu.glb`，DRACO 压缩，目标 < 8MB，置 `display-v2/public/media/crafts/`

**部件命名**（`scene.getObjectByName` 直接命中）：

| 名称 | 内容 | 运动需求 |
|---|---|---|
| `gourd_raw` | 带皮生葫芦 | 旋转展示 |
| `gourd_body` | 去皮葫芦本体（主件，各步常驻） | 自转 |
| `peel_strips` | 皮屑条（2-3 片） | 下落 + 淡出 |
| `pattern_draft` | 墨线画稿层（贴合葫芦表面的半透明纹样 mesh） | 淡入 |
| `carved_layer` | 雕刻完成层（镂空/浮雕纹样） | 淡入替换画稿 |
| `knife_rest` | 刻刀·静置位 | — |
| `knife_action` | 刻刀·雕刻位 | 往复运动 |
| `painted_layer` | 上色完成层 | 淡入 |
| `scene_base` | 工作台/底座 | 静止 |
| `scene_prop_*` | 环境道具（可选：颜料碟、毛刷） | 静止 |

**生成要求**：原点在底座中心、Y 轴向上、真实比例（葫芦高约 25cm）；每部件独立命名 node；纹样层与本体共用 UV 空间便于贴合；材质走 PBR 标准（toon 化由前端实时替换，不靠烘焙）。

## 6. 双风格材质策略

| | real | inkwash |
|---|---|---|
| 材质 | GLB 原生 PBR | MeshToonMaterial 替换 + EdgesGeometry 描边 |
| 灯光 | 暖色射灯 + 环境光 + bloom（可选） | 平光 + 宣纸底色背景 |
| 切换 | useToonTheme traverse 全场景替换/还原 | 同左 |

主题切换在 ThemeTransition 遮罩下执行材质 swap，GSAP 动画不中断。

## 7. 降级与错误处理

| 场景 | 策略 |
|---|---|
| GLB 加载失败/404 | CraftStage 显示 ErrorState（复用三态组件），可重试 |
| WebGL 不可用/低端机 | 降级为工序静态图序列（每步一张 AI 图），步骤条照常工作。判定：`hardwareConcurrency < 4` 或 `deviceMemory < 4` 或 WebGL context 创建失败 |
| 部件命名缺失 | loader 校验清单，缺失 console.warn + 知识点卡跳过该件，不阻断流程 |
| 单步动画异常 | catch 后 gsap.set 跳该步终态，不阻塞继续 |
| 弱网 | LoadingManager.onProgress 进度条；DRACO decoder 本地优先、CDN fallback |
| raycaster 未命中 | 静默 |

### 性能预算

- GLB < 8MB（DRACO）；纹理 ≤ 2K；draw call < 30；移动端锁 DPR ≤ 2
- 滚出视口 `cancelAnimationFrame`

## 8. 测试

Node 内置 runner（`display-v2/tests/`）：

- `craftProcess.test.js`：步骤归约（next/prev 边界、首末步钳制）、autoPlay 状态机、部件集合求值（visible ∪ fadeOut 无冲突）
- `craftConfig.test.js`：配置契约——steps 非空、每步 visible/animations 引用部件在命名规范名单内、camera pose 结构合法
- `glbParts.test.js`：命名规范常量
- 3D 渲染层不测（无头无 WebGL），真机走查

## 9. 任务分解（实施计划另文细化）

| 批次 | 内容 | 验收 |
|---|---|---|
| G0 | useGlbScene + 命名规范常量 + 占位 GLB（简易自测模型） | 场景加载/拾取/dispose |
| G1 | useCraftProcess 状态机 + 纯函数单测 | 单测全过 |
| G2 | CraftWorkshop 页面三组件 + 路由 + 注册表 ready | 双主题渲染 |
| G3 | useToonTheme 双风格 + 降级静态图链路 | 切主题/弱机走查 |
| G4 | GLB 生成（用户）+ 5 步工序配置打磨 + 端到端 | 真机验收 |

## 10. 风险与备注

- **GLB 质量**：AI 生成模型的部件拆分/命名需人工核对（Blender 或 gltf-transform 重命名兜底）；首发占位模型先跑通管线
- **YAGNI**：不做任务制判定/评分/排行（二期）；不做多工艺并行开发（首发跑通再复制）
- **与 P2 素材债关系**：降级静态图 5 张并入 P2-M5~M9 批量素材排期
