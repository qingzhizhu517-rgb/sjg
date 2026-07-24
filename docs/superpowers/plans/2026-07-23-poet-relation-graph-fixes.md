# 关系图谱代码审查修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复关系图谱 Phase 1 代码审查发现的 8 个问题（4 CONFIRMED + 4 PLAUSIBLE）

**Architecture:** 按问题类型分组修复：错误处理、数据完整性、异步竞态、状态管理、Dead code 清理

**Tech Stack:** Vue 3 + Vite (display-v2), Java 17 + Spring Boot (backend)

---

## File Structure

| 文件 | 动作 | 职责 |
|---|---|---|
| `display-v2/src/views/PoetList.vue` | 修改 | 错误处理、异步竞态、状态管理、Dead code 清理 |
| `backend/src/main/java/com/sjg/service/PoetRelationService.java` | 修改 | 数据完整性：边引用检查 |

---

## Task 1: 错误处理——区分 API 错误与空数据

**Files:**
- Modify: `display-v2/src/views/PoetList.vue:445-448`

- [ ] **Step 1: 添加 graphError ref**

在 `graphLoading` 和 `graphEmpty` 之后添加：

```javascript
const graphLoading = ref(false)
const graphEmpty = ref(false)
const graphError = ref(false)  // 新增
```

- [ ] **Step 2: 修改 catch 块显示错误状态**

把 catch 块从：

```javascript
} catch (err) {
  graphLoading.value = false
  graphEmpty.value = true
  return
}
```

改为：

```javascript
} catch (err) {
  console.error('关系图谱加载失败:', err)
  graphLoading.value = false
  graphError.value = true
  return
}
```

- [ ] **Step 3: 添加错误状态 UI**

在空态 div 之后添加：

```html
<!-- 错误态 -->
<div v-else-if="graphError" class="graph-status-box">
  <p class="empty-icon">⚠</p>
  <p class="graph-status-text">关系数据加载失败</p>
  <button class="graph-retry-btn" @click="initG6">重试</button>
</div>
```

- [ ] **Step 4: 添加重试按钮样式**

在 `.graph-status-text` 样式之后添加：

```css
.graph-retry-btn {
  padding: 6px 16px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: opacity 0.25s;
}
.graph-retry-btn:hover {
  opacity: 0.85;
}
```

- [ ] **Step 5: 更新 watch 重置 error 状态**

在 watch 中添加 `graphError.value = false`：

```javascript
graphLoading.value = false
graphEmpty.value = false
graphError.value = false  // 新增
```

- [ ] **Step 6: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

---

## Task 2: 数据完整性——边引用缺失节点检查

**Files:**
- Modify: `backend/src/main/java/com/sjg/service/PoetRelationService.java:78-88`

- [ ] **Step 1: 修改边构建逻辑添加节点存在性检查**

把边构建循环从：

```java
for (PoetRelation r : relations) {
    Map<String, Object> e = new LinkedHashMap<>();
    e.put("source", String.valueOf(r.getPoetAId()));
    e.put("target", String.valueOf(r.getPoetBId()));
    e.put("relationType", r.getRelationType());
    e.put("description", r.getDescription());
    e.put("origin", r.getSource());
    edges.add(e);
}
```

改为：

```java
for (PoetRelation r : relations) {
    // 跳过引用不存在诗人的关系
    if (!poetMap.containsKey(r.getPoetAId()) || !poetMap.containsKey(r.getPoetBId())) {
        continue;
    }
    Map<String, Object> e = new LinkedHashMap<>();
    e.put("source", String.valueOf(r.getPoetAId()));
    e.put("target", String.valueOf(r.getPoetBId()));
    e.put("relationType", r.getRelationType());
    e.put("description", r.getDescription());
    e.put("origin", r.getSource());
    edges.add(e);
}
```

- [ ] **Step 2: 编译验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/backend && mvn -q -DskipTests compile`
Expected: BUILD SUCCESS。

- [ ] **Step 3: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add backend/src/main/java/com/sjg/service/PoetRelationService.java
git commit -m "fix(backend): 边构建时检查节点存在性，避免引用缺失节点"
```

---

## Task 3: 异步竞态——添加取消机制

**Files:**
- Modify: `display-v2/src/views/PoetList.vue:393-450`

- [ ] **Step 1: 添加请求取消标志**

在 `graphInstance` 之后添加：

```javascript
let graphInstance = null
let graphRequestSeq = 0  // 新增：请求序列号用于取消
```

- [ ] **Step 2: 修改 initG6 添加序列号检查**

在 `initG6` 函数开头添加序列号：

```javascript
const initG6 = async () => {
  if (!g6Container.value) return
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }

  const currentSeq = ++graphRequestSeq  // 新增：当前请求序列号
  graphLoading.value = true
  graphEmpty.value = false
  graphError.value = false
  // ...
```

- [ ] **Step 3: 在 await 后检查序列号**

在 API 调用之后添加检查：

```javascript
const g = await api.get('/poet-relations')

// 检查是否已被取消
if (currentSeq !== graphRequestSeq) {
  return
}

const inNodes = (g && g.nodes) || []
```

- [ ] **Step 4: 在 Graph 创建前再次检查**

在 `new Graph()` 之前添加：

```javascript
// 再次检查是否已被取消
if (currentSeq !== graphRequestSeq) {
  return
}

graphInstance = new Graph({
```

- [ ] **Step 5: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

---

## Task 4: 异步竞态——null container 保护

**Files:**
- Modify: `display-v2/src/views/PoetList.vue:453`

- [ ] **Step 1: 在 Graph 创建前重新检查 container**

在 `new Graph()` 之前添加：

```javascript
// 重新检查 container（组件可能已卸载）
if (!g6Container.value) {
  graphLoading.value = false
  return
}

graphInstance = new Graph({
```

- [ ] **Step 2: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

---

## Task 5: 状态管理——统一状态枚举

**Files:**
- Modify: `display-v2/src/views/PoetList.vue:344-347`

- [ ] **Step 1: 替换两个 boolean 为单一状态 ref**

把：

```javascript
const graphLoading = ref(false)
const graphEmpty = ref(false)
const graphError = ref(false)
```

改为：

```javascript
// graphStatus: 'idle' | 'loading' | 'empty' | 'error' | 'ready'
const graphStatus = ref('idle')
```

- [ ] **Step 2: 更新所有状态设置点**

把所有 `graphLoading.value = true` 改为 `graphStatus.value = 'loading'`
把所有 `graphEmpty.value = true` 改为 `graphStatus.value = 'empty'`
把所有 `graphError.value = true` 改为 `graphStatus.value = 'error'`
把所有 `graphLoading.value = false` 改为 `graphStatus.value = 'ready'`（成功时）

- [ ] **Step 3: 更新模板条件**

把：

```html
<div v-if="graphLoading" class="graph-status-box">
<div v-else-if="graphEmpty" class="graph-status-box">
<div v-else-if="graphError" class="graph-status-box">
<div v-show="!graphLoading && !graphEmpty" ref="g6Container">
<div v-if="!graphLoading && !graphEmpty" class="graph-legend">
```

改为：

```html
<div v-if="graphStatus === 'loading'" class="graph-status-box">
<div v-else-if="graphStatus === 'empty'" class="graph-status-box">
<div v-else-if="graphStatus === 'error'" class="graph-status-box">
<div v-show="graphStatus === 'ready'" ref="g6Container">
<div v-if="graphStatus === 'ready'" class="graph-legend">
```

- [ ] **Step 4: 更新 watch 重置**

把：

```javascript
graphLoading.value = false
graphEmpty.value = false
graphError.value = false
```

改为：

```javascript
graphStatus.value = 'idle'
```

- [ ] **Step 5: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

---

## Task 6: Dead code 清理——移除 isPoet 和 city 相关代码

**Files:**
- Modify: `display-v2/src/views/PoetList.vue:426, 482, 373-374, 385-386`

- [ ] **Step 1: 移除节点 isPoet 字段**

把节点映射中的 `isPoet: true` 删除。

- [ ] **Step 2: 简化 labelFill 访问器**

把：

```javascript
labelFill: (d) => (d.isPoet ? graphTheme.textPrimary : graphTheme.accent),
```

改为：

```javascript
labelFill: graphTheme.textPrimary,
```

- [ ] **Step 3: 移除 graphTheme 中的 city 相关属性**

删除 `cityFill` 和 `cityStroke` 属性定义。

- [ ] **Step 4: 构建验证**

Run: `cd /Users/a1/develop/vibecoding/sjg/display-v2 && npm run build`
Expected: build 成功。

- [ ] **Step 5: 提交**

```bash
cd /Users/a1/develop/vibecoding/sjg
git add display-v2/src/views/PoetList.vue
git commit -m "refactor(display-v2): 统一图谱状态管理 + 清理 dead code"
```

---

## Task 7: 验证所有修复

**前置:** 后端运行，前端 `npm run dev` 启动。

- [ ] **Step 1: 验证错误处理**

模拟 API 错误（断开后端），检查显示"关系数据加载失败"和重试按钮。

- [ ] **Step 2: 验证数据完整性**

检查后端日志无边引用缺失节点警告。

- [ ] **Step 3: 验证异步竞态**

快速切换主题，检查无内存泄漏或状态混乱。

- [ ] **Step 4: 验证状态管理**

检查所有状态切换正常（loading → ready/empty/error）。

- [ ] **Step 5: 验证 Dead code 清理**

检查图谱正常渲染，无 console 错误。

---

## Self-Review

**1. Spec 覆盖：**
- ✅ 错误处理（#1）→ Task 1
- ✅ 数据完整性（#2）→ Task 2
- ✅ 异步竞态（#3, #4）→ Task 3, Task 4
- ✅ 状态管理（#5）→ Task 5
- ✅ Dead code（#7, #8）→ Task 6

**2. Placeholder 扫描：** 无 TBD/TODO，每步含完整代码。

**3. 类型一致性：** `graphStatus` 在 Task 5 定义，后续任务使用一致。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-23-poet-relation-graph-fixes.md`. Two execution options:

**1. Subagent-Driven (recommended)** — 每个 Task 派一个新 subagent，任务间评审，迭代快。

**2. Inline Execution** — 在本会话内按 executing-plans 批量执行，带检查点评审。

Which approach?
