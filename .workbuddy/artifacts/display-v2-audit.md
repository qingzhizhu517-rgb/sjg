# display-v2 专项审查与技术提升方案

**审查日期**: 2026-06-17 | **审查文件**: 27 个源文件 | **总代码量**: ~7,500 行

---

## 一、快速判定

display-v2 的整体架构比 v1 清晰（移除了冗余的 Pinia 依赖，用模块级 ref 做了轻量状态管理），比 v3 更贴近实战（v3 完全没有 API 集成）。**核心功能完整，但存在 6 个运行时 Bug 和大量质量债务**，需要系统性修补。

---

## 二、六个性命攸关的 Bug（必须立即修）

### 🐛 Bug 1 — App.vue CSS 语法错误

**位置**: `src/App.vue` 第 263 行

```css
/* ❌ 错误 — "class" 不是合法的 CSS 选择器 */
.theme-inkwash class.main-header,
.theme-inkwash .main-header { ... }

/* ✅ 正确 */
.theme-inkwash.main-header,
.theme-inkwash .main-header { ... }
```

**影响**: 水墨主题下导航栏的某些样式不生效，视觉效果不完整。

---

### 🐛 Bug 2 — @antv/g6 v5 API 不兼容

**位置**: `src/views/PoetList.vue` 第 242-243 行

```javascript
// ❌ 当前代码 — 这是 G6 v4 API，在 v5 中直接报错
graphInstance.data(data)
graphInstance.render()

// ✅ 正确 — G6 v5 的用法
const graph = new G6.Graph({
  container: g6Container.value,
  data,           // data 在构造时传入
  behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  node: { type: 'circle', style: { ... } },
  edge: { style: { ... } }
})
graph.render()
```

**影响**: 诗人关系图谱**完全无法渲染**，用户在诗人列表页看不到图谱。

---

### 🐛 Bug 3 — Three.js linewidth 无效

**位置**: `src/views/MapView.vue` 第 644 行

```javascript
// ❌ Three.js WebGL 渲染器不支持 linewidth > 1
linewidth: 1.5

// ✅ 需要使用 LineBasicMaterial 或自定义 shader
```

**影响**: 3D 地形边界线视觉效果不如预期（虽然不会报错，但线宽始终为 1px）。

---

### 🐛 Bug 4 — 图片路径与磁盘文件不匹配

**位置**: `src/config/mockFallbackDb.js`

```
代码中引用:         磁盘实际文件:
baotu_real.jpg  →  baotu_spring.jpg
daming_real.jpg →  daming_lake.jpg
zhao_mengfu.jpg →  (文件不存在)
```

**影响**: 趵突泉、大明湖的写实主题图片显示为裂图；赵孟頫在任何主题下都没有头像。

---

### 🐛 Bug 5 — Three.js 双重初始化

**位置**: `src/views/MapView.vue` 第 1002-1035 行

```javascript
// ❌ watch(isReal, ...) 和 onMounted 都调用了 initThree()
// 如果页面以写实主题挂载，会创建两套 Three.js 场景
watch(isReal, (v) => { if (v) initThree(geojson.value) })
onMounted(() => { if (isReal.value) initThree(geojson.value) })
```

**影响**: 内存泄漏 + 性能浪费，两个场景叠加渲染。

---

### 🐛 Bug 6 — AiChatBox 路由切换后遗留消息

**位置**: `src/components/AiChatBox.vue` 第 202 行

```javascript
// ❌ 路由切换后 setTimeout 回调仍在运行
setTimeout(() => { messages.value.push({...}) }, 1200)
```

**影响**: 用户在诗人页面触发 AI 回复，然后切换到地图页——1.2 秒后一条幽灵消息会出现在地图页的聊天框里。

---

## 三、需要清理的 8 处死代码

| # | 位置 | 行数 | 说明 |
|---|------|------|------|
| 1 | `src/components/HelloWorld.vue` | 96 | Vite 脚手架残留，从未导入 |
| 2 | `src/config/mockFallbackDb.js` `getFallbackData()` | 95 | 95 行函数从未被调用 |
| 3 | `src/config/mockFallbackDb.js` `mockCities` | - | 导入但未使用 |
| 4 | `src/assets/hero.png`、`vite.svg`、`vue.svg` | - | 仅被 HelloWorld 引用 |
| 5 | `variables.css` `.page-enter-active` | 10 | 从未使用 |
| 6 | `inkwash.css` `.theme-inkwash .seal` | 13 | 从未使用 |
| 7 | `AiChatBox.vue` `onMounted` 导入 | 1 | 声明了但没调用 |
| 8 | `MapView.vue` `computed` 导入 | 1 | 声明了但没调用 |

---

## 四、安全层面的 5 个风险

| # | 问题 | 位置 | 风险等级 |
|---|------|------|---------|
| 1 | OSS Bucket URL 硬编码 | `useImage.js:7` | 🔴 高 |
| 2 | `v-html` 无 XSS 净化 | `AiChatBox.vue:63` | 🔴 高 |
| 3 | `allowedHosts` 允许 cpolar 通配符 | `vite.config.js:10` | 🟡 中 |
| 4 | Google Fonts CDN 缺少 integrity | `index.html:9-11` | 🟡 中 |
| 5 | API 无 CSRF token | `api/index.js` | 🟡 中 |

---

## 五、架构层面的 3 个技术债务

### 5.1 主题系统双重通道

当前主题通过两个独立机制切换：
- `document.documentElement` 上的 `data-theme` 属性 ← `useTheme.js`
- 根 div 上的 `.theme-real` / `.theme-inkwash` CSS 类 ← `App.vue`

导致 `real.css` 和 `inkwash.css` 中的 CSS 变量与 `variables.css` 完全重复。**保留 `data-theme` 方案，删除 class 切换和 `real.css`/`inkwash.css` 中的变量定义**。

### 5.2 缺少数据加载状态

全站 7 个页面中有 5 个完全没有 loading/error 状态：
- `PoetDetail.vue` — API 失败 = 白屏
- `PoemDetail.vue` — 同上
- `Timeline.vue` — 显示"暂无朝代数据"但不区分「加载中」和「真的没有」
- `RegionSpots.vue` — 同上
- `MapView.vue` — GeoJSON 加载失败时静默退化

### 5.3 组件拆分不足

`App.vue` 846 行，`MapView.vue` 1790 行——这两个文件占了总代码量的 35%。App.vue 的 Header/Nav/Footer 应该拆成独立组件，MapView.vue 的 Three.js 逻辑应该抽成 composable。

---

## 六、团队可立即上手的修复清单

### 今日就能修（按优先级排列）

```
P0 — 直接影响用户可用性
  [ ] Bug 2: G6 v5 API — 诗人关系图谱完全不显示
  [ ] Bug 1: CSS 语法错误 — 水墨主题样式残缺
  
P1 — 可见的展示问题  
  [ ] Bug 4: 图片路径修复 — 趵突泉/大明湖裂图
  [ ] Bug 5: 双重初始化 — 内存泄漏

P2 — 代码卫生
  [ ] 删除 HelloWorld.vue 及 3 个无用 assets
  [ ] 删除 getFallbackData() 95 行死代码
  [ ] 删除 aiChatBox 中未使用的 onMounted 导入
  [ ] 删除 MapView 中未使用的 computed 导入
```

### 本周规划

```
P3 — 安全加固
  [ ] OSS URL 改为环境变量 VITE_OSS_BUCKET_URL
  [ ] AiChatBox v-html 替换为文本渲染（接入真实 AI 时再加 XSS 净化）
  [ ] vite.config.js 移除 cpolar 通配符
  
P4 — 错误处理
  [ ] api/index.js 添加统一错误拦截 + toast 提示
  [ ] 5 个缺少 try/catch 的视图添加错误状态 UI
  [ ] useImage.js 添加加载失败灰度占位图
```

### 架构优化（后续迭代）

```
  [ ] 统一主题切换为单一 data-theme 机制
  [ ] 合并 real.css/inkwash.css 到 variables.css
  [ ] 拆分 App.vue → Header/Nav/Footer 独立组件
  [ ] 抽取 MapView Three.js 逻辑为 useThreeMap composable
  [ ] 引入 TypeScript（从新模块开始渐进迁移）
```

---

## 七、display-v2 代码质量评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完整度 | ⭐⭐⭐⭐ 4/5 | 核心功能齐全，3D 地图效果出色 |
| 代码整洁度 | ⭐⭐ 2/5 | 2 个文件占 35% 代码量，死代码多 |
| 错误处理 | ⭐ 1/5 | 几乎全站无错误处理 |
| 安全性 | ⭐⭐ 2/5 | OSS URL 暴露、v-html 风险 |
| 可维护性 | ⭐⭐ 2/5 | 无 TypeScript、无测试、主题双通道 |
| 性能 | ⭐⭐⭐⭐ 4/5 | Three.js 渲染管线合理，无明显性能瓶颈 |

**综合评分: 2.5/5 — 能跑，但需要系统性修缮才能进入生产环境。**

---

## 附录：整改预估工作量

| 阶段 | 内容 | 预估 |
|------|------|------|
| P0-P1 (Bug 修复) | 6 个 Bug | 2-3 小时 |
| P2 (代码卫生) | 8 处死代码清理 | 1 小时 |
| P3 (安全加固) | 3 项修复 | 2 小时 |
| P4 (错误处理) | 全站 try/catch + UI | 3-4 小时 |
| 架构优化 | 主题统一 + 组件拆分 | 1-2 天 |
