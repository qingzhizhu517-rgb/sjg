# 非遗工艺 3D 微游戏（东昌葫芦雕刻）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 display-v2 落地 `/crafts` 3D 微游戏页：东昌葫芦雕刻五工序步骤导览 + 成品自由把玩，双主题材质，静态图降级。

**Architecture:** 单 GLB + 声明式工序编排（spec 方案 A）。`useGlbScene`（Three.js 生命周期/拾取）与 `useCraftProcess`（工序状态机）严格分层，纯逻辑抽 `utils/craftProcess.js` 走 TDD；工序内容在 `content/crafts/` 配置文件中声明。

**Tech Stack:** Vue 3 + three ^0.184（GLTFLoader/DRACOLoader）+ GSAP 3 + Node 内置 test runner

**Spec:** `docs/superpowers/specs/2026-08-10-craft-3d-microgame-design.md`

**进度追踪**：`[x]` 已完成 ｜ `[ ]` 未完成 ｜ `[~]` 进行中

---

## 文件结构总览

```
display-v2/
├── public/
│   ├── draco/gltf/                  # DRACO decoder（从 three 包拷贝）
│   └── media/crafts/                # GLB + 降级静态图（用户 AI 生成，本轮占位）
├── src/
│   ├── config/
│   │   ├── glbParts.js              # 部件命名规范常量 + 通配匹配
│   │   └── culturalCategories.js    # 修改：craft ready: true
│   ├── utils/
│   │   └── craftProcess.js          # 纯函数：步骤归约/部件集合/冲突检查
│   ├── composables/
│   │   ├── useGlbScene.js           # GLB 场景生命周期 + raycaster
│   │   ├── useCraftProcess.js       # 工序状态机（薄封装纯函数 + GSAP）
│   │   └── useToonTheme.js          # PBR ↔ Toon+描边 材质切换
│   ├── content/crafts/
│   │   └── dongchang-hulu.js        # 5 步工序配置 + 知识点卡 + 占位场景构建器
│   ├── components/craft/
│   │   ├── CraftStage.vue           # canvas 容器 + 加载/降级/错误三态
│   │   ├── StepRail.vue             # 步骤条
│   │   └── KnowledgeCard.vue        # 部件知识点卡
│   ├── views/
│   │   └── CraftWorkshop.vue        # 路由页编排
│   └── router/index.js              # 修改：注册 /crafts
└── tests/
    ├── glbParts.test.js
    ├── craftProcess.test.js
    └── craftConfig.test.js
```

---

## G0 地基：命名规范 + GLB 场景 composable

### Task 1: 部件命名规范常量

**Files:**
- Create: `display-v2/src/config/glbParts.js`
- Test: `display-v2/tests/glbParts.test.js`

- [ ] **Step 1: 写失败测试**

```js
// display-v2/tests/glbParts.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HULU_PARTS, matchPartName, expandPatterns } from '../src/config/glbParts.js'

test('命名规范含 10 个保留部件名', () => {
  assert.equal(HULU_PARTS.length, 10)
  assert.ok(HULU_PARTS.includes('gourd_body'))
  assert.ok(HULU_PARTS.includes('painted_layer'))
})

test('精确匹配', () => {
  assert.ok(matchPartName('gourd_body', 'gourd_body'))
  assert.ok(!matchPartName('gourd_body', 'gourd_raw'))
})

test('尾缀通配匹配', () => {
  assert.ok(matchPartName('scene_*', 'scene_base'))
  assert.ok(matchPartName('scene_*', 'scene_prop_dish'))
  assert.ok(!matchPartName('scene_*', 'gourd_body'))
})

test('expandPatterns 展开通配为具体部件集合并去重', () => {
  const all = ['gourd_raw', 'scene_base', 'scene_prop_dish', 'knife_rest']
  const out = expandPatterns(['gourd_raw', 'scene_*'], all)
  assert.deepEqual(out.sort(), ['gourd_raw', 'scene_base', 'scene_prop_dish'])
})

test('expandPatterns 对未命中模式静默跳过', () => {
  const all = ['gourd_raw']
  assert.deepEqual(expandPatterns(['nonexistent'], all), [])
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/glbParts.test.js`
Expected: FAIL `Cannot find module '../src/config/glbParts.js'`

- [ ] **Step 3: 实现**

```js
// display-v2/src/config/glbParts.js
// GLB 部件命名规范（spec §5 契约）。AI 生成模型必须按此命名 node。

export const HULU_PARTS = [
  'gourd_raw',      // 带皮生葫芦
  'gourd_body',     // 去皮葫芦本体（主件）
  'peel_strips',    // 皮屑条
  'pattern_draft',  // 墨线画稿层
  'carved_layer',   // 雕刻完成层
  'knife_rest',     // 刻刀·静置位
  'knife_action',   // 刻刀·雕刻位
  'painted_layer',  // 上色完成层
  'scene_base',     // 工作台/底座
  'scene_prop_dish',// 环境道具示例（颜料碟）
]

/**
 * 匹配规则：'scene_*' 尾缀通配 = 前缀匹配；其余精确匹配。
 */
export const matchPartName = (pattern, name) =>
  pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern

/**
 * 把含通配的模式列表展开为具体部件名数组（按 allNames 顺序，去重）。
 */
export const expandPatterns = (patterns, allNames) => {
  const out = []
  for (const p of patterns) {
    for (const n of allNames) {
      if (matchPartName(p, n) && !out.includes(n)) out.push(n)
    }
  }
  return out
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/glbParts.test.js`
Expected: PASS 5 tests

- [ ] **Step 5: Commit**

```bash
git add display-v2/src/config/glbParts.js display-v2/tests/glbParts.test.js
git commit -m "feat(craft): G0-1 GLB 部件命名规范常量 + 通配匹配"
```

---

### Task 2: DRACO decoder 落位

**Files:**
- Create: `display-v2/public/draco/gltf/`（4 个 decoder 文件）

- [ ] **Step 1: 拷贝 decoder**

```bash
cp display-v2/node_modules/three/examples/jsm/libs/draco/gltf/* display-v2/public/draco/gltf/ 2>/dev/null || (mkdir -p display-v2/public/draco/gltf && cp display-v2/node_modules/three/examples/jsm/libs/draco/gltf/* display-v2/public/draco/gltf/)
ls display-v2/public/draco/gltf/
```

Expected: 列出 `draco_decoder.js draco_decoder.wasm draco_wasm_wrapper.js` 等文件

- [ ] **Step 2: Commit**

```bash
git add display-v2/public/draco/
git commit -m "chore(craft): G0-2 DRACO decoder 本地化"
```

---

### Task 3: useGlbScene composable

**Files:**
- Create: `display-v2/src/composables/useGlbScene.js`

无头环境无 WebGL，本任务无单测，验收 = build 通过 + dev 手动冒烟（G2 末统一走查）。

- [ ] **Step 1: 实现 useGlbScene**

```js
// display-v2/src/composables/useGlbScene.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'

/**
 * 通用 GLB 场景：renderer/scene/camera/灯光/加载/拾取/相机机位。
 * 不懂"工序"——工序逻辑在 useCraftProcess。
 *
 * 用法：
 *   const scene = useGlbScene()
 *   await scene.init(canvasEl)
 *   const { partNames } = await scene.load('/media/crafts/x.glb')  // 或 THREE.Group
 *   scene.setVisible(['gourd_body', 'scene_base'])
 *   scene.applyCameraPose({ pos: [0,1,3], target: [0,0.5,0] })
 *   scene.onPartClick((name, point) => ...)
 *   scene.dispose()
 */
export function useGlbScene() {
  let renderer = null
  let scene = null
  let camera = null
  let controls = null
  let root = null            // 当前模型根
  let rafId = null
  let raycaster = null
  let clickCb = null
  let hoverCb = null
  let onProgress = null
  const originalMaterials = new Map()  // mesh.uuid -> material（toon 还原用）

  const init = async (canvas) => {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 1.2, 3.2)

    // 默认暖色射灯（real 风格；inkwash 平光由 useToonTheme 调整）
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.5))
    const key = new THREE.DirectionalLight(0xffe8c0, 1.4)
    key.position.set(3, 5, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xc0d4ff, 0.5)
    rim.position.set(-3, 2, -3)
    scene.add(rim)

    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enabled = false          // 默认锁交互，末步自由把玩才解锁
    controls.target.set(0, 0.6, 0)

    raycaster = new THREE.Raycaster()

    const resize = () => {
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)
    init._resize = resize

    canvas.addEventListener('pointermove', _handlePointer)
    canvas.addEventListener('pointerdown', _handleClick)

    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    tick()
  }

  /** source: GLB url 字符串，或直接给 THREE.Group（占位模型） */
  const load = (source) =>
    new Promise((resolve, reject) => {
      const onLoaded = (obj) => {
        if (root) scene.remove(root)
        root = obj
        scene.add(root)
        root.traverse((m) => {
          if (m.isMesh) originalMaterials.set(m.uuid, m.material)
        })
        resolve({ partNames: _collectNames(root) })
      }
      if (typeof source !== 'string') { onLoaded(source); return }
      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/gltf/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(draco)
      loader.load(
        source,
        (gltf) => onLoaded(gltf.scene),
        (ev) => { if (onProgress && ev.total) onProgress(ev.loaded / ev.total) },
        (err) => reject(err),
      )
    })

  const _collectNames = (obj) => {
    const names = []
    obj.traverse((n) => { if (n.name) names.push(n.name) })
    return names
  }

  const getObject = (name) => root?.getObjectByName(name) || null

  /** 精确名集合显隐：在集合内 visible=true，其余部件 false（scene 灯光等不受影响） */
  const setVisible = (names) => {
    if (!root) return
    const set = names instanceof Set ? names : new Set(names)
    root.traverse((n) => {
      if (n.name && !n.isScene) n.visible = set.has(n.name)
    })
  }

  /** 相机机位 tween（GSAP）。pose = { pos: [x,y,z], target: [x,y,z], duration? } */
  const applyCameraPose = (pose) => {
    if (!camera || !pose) return
    const d = pose.duration ?? 1.2
    gsap.to(camera.position, { x: pose.pos[0], y: pose.pos[1], z: pose.pos[2], duration: d, ease: 'power2.inOut' })
    gsap.to(controls.target, { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration: d, ease: 'power2.inOut' })
  }

  const _pick = (ev) => {
    if (!root || !camera) return null
    const rect = ev.currentTarget.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(root.children, true)
    const hit = hits.find((h) => h.object.visible && _named(h.object))
    return hit ? { name: _named(hit.object), point: hit.point } : null
  }

  /** 向上找最近的有名祖先（纹样层可能挂在本体下） */
  const _named = (obj) => {
    let o = obj
    while (o && !o.name) o = o.parent
    return o?.name || null
  }

  const _handlePointer = (ev) => {
    if (!hoverCb) return
    const hit = _pick(ev)
    hoverCb(hit ? hit.name : null, ev)
  }

  const _handleClick = (ev) => {
    if (!clickCb) return
    const hit = _pick(ev)
    if (hit) clickCb(hit.name, hit.point)
  }

  const onPartClick = (cb) => { clickCb = cb }
  const onPartHover = (cb) => { hoverCb = cb }
  const setOnProgress = (cb) => { onProgress = cb }

  /** 自由把玩开关（末步解锁 OrbitControls） */
  const setFreeRoam = (on) => { if (controls) controls.enabled = !!on }

  const pause = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null } }
  const resume = () => { if (!rafId && renderer) { const tick = () => { controls.update(); renderer.render(scene, camera); rafId = requestAnimationFrame(tick) }; tick() } }

  const getScene = () => scene
  const getRoot = () => root
  const getOriginalMaterials = () => originalMaterials

  const dispose = () => {
    pause()
    window.removeEventListener('resize', init._resize)
    const canvas = renderer?.domElement
    canvas?.removeEventListener('pointermove', _handlePointer)
    canvas?.removeEventListener('pointerdown', _handleClick)
    controls?.dispose()
    root?.traverse((m) => { if (m.isMesh) { m.geometry?.dispose(); [].concat(m.material).forEach((mt) => mt?.dispose?.()) } })
    renderer?.dispose()
    renderer = scene = camera = controls = root = raycaster = null
    clickCb = hoverCb = onProgress = null
    originalMaterials.clear()
  }

  return {
    init, load, getObject, setVisible, applyCameraPose,
    onPartClick, onPartHover, setOnProgress, setFreeRoam,
    pause, resume, dispose,
    getScene, getRoot, getOriginalMaterials,
  }
}

/** 低端机 / WebGL 不可用判定（降级静态图用） */
export const canUseWebGL = () => {
  try {
    const c = document.createElement('canvas')
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return false
    const cores = navigator.hardwareConcurrency || 4
    const mem = navigator.deviceMemory || 4
    return cores >= 4 && mem >= 4
  } catch {
    return false
  }
}
```

- [ ] **Step 2: 构建验证**

Run: `cd display-v2 && npm run build`
Expected: `✓ built`（无 import 报错）

- [ ] **Step 3: Commit**

```bash
git add display-v2/src/composables/useGlbScene.js
git commit -m "feat(craft): G0-3 useGlbScene 通用 GLB 场景 composable"
```

---

## G1 工序状态机（TDD 核心）

### Task 4: 纯函数 craftProcess + 单测

**Files:**
- Create: `display-v2/src/utils/craftProcess.js`
- Test: `display-v2/tests/craftProcess.test.js`

- [ ] **Step 1: 写失败测试**

```js
// display-v2/tests/craftProcess.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  clampStep, nextStep, prevStep, isLastStep,
  resolveStepVisible, findStepConflicts,
} from '../src/utils/craftProcess.js'

const STEPS = [
  { key: 'a', visible: ['gourd_raw', 'scene_*'], animations: [] },
  { key: 'b', visible: ['gourd_body'], animations: [{ target: 'gourd_raw', fadeOut: true }] },
  { key: 'c', visible: ['painted_layer'], animations: [] },
]
const ALL = ['gourd_raw', 'gourd_body', 'painted_layer', 'scene_base', 'scene_prop_dish']

test('clampStep 首末钳制', () => {
  assert.equal(clampStep(-1, 3), 0)
  assert.equal(clampStep(5, 3), 2)
  assert.equal(clampStep(1, 3), 1)
})

test('next/prev 边界', () => {
  assert.equal(nextStep(0, 3), 1)
  assert.equal(nextStep(2, 3), 2)
  assert.equal(prevStep(0, 3), 0)
  assert.equal(prevStep(2, 3), 1)
})

test('isLastStep', () => {
  assert.ok(!isLastStep(0, 3))
  assert.ok(isLastStep(2, 3))
})

test('resolveStepVisible 展开通配并返回 Set', () => {
  const v = resolveStepVisible(STEPS[0], ALL)
  assert.ok(v instanceof Set)
  assert.ok(v.has('gourd_raw'))
  assert.ok(v.has('scene_base'))
  assert.ok(v.has('scene_prop_dish'))
  assert.ok(!v.has('gourd_body'))
})

test('findStepConflicts 检出 fadeOut 目标仍在 visible 的冲突', () => {
  assert.equal(findStepConflicts(STEPS[0], ALL).length, 0)
  const bad = { visible: ['gourd_raw'], animations: [{ target: 'gourd_raw', fadeOut: true }] }
  assert.deepEqual(findStepConflicts(bad, ALL), ['gourd_raw'])
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/craftProcess.test.js`
Expected: FAIL `Cannot find module`

- [ ] **Step 3: 实现纯函数**

```js
// display-v2/src/utils/craftProcess.js
// 工序状态机纯逻辑（无 three/GSAP 依赖，可单测）。
import { expandPatterns } from '../config/glbParts.js'

export const clampStep = (i, len) => Math.max(0, Math.min(len - 1, i))
export const nextStep = (i, len) => clampStep(i + 1, len)
export const prevStep = (i, len) => clampStep(i - 1, len)
export const isLastStep = (i, len) => i === len - 1

/** 当前步可见部件集合（通配展开）。step.visible 缺省 = 全集 */
export const resolveStepVisible = (step, allNames) =>
  new Set(step.visible ? expandPatterns(step.visible, allNames) : allNames)

/** 冲突检查：fadeOut 目标不应仍在 visible 集合（动画与显隐互相打架） */
export const findStepConflicts = (step, allNames) => {
  const visible = resolveStepVisible(step, allNames)
  return (step.animations || [])
    .filter((a) => a.fadeOut && visible.has(a.target))
    .map((a) => a.target)
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/craftProcess.test.js`
Expected: PASS 6 tests

- [ ] **Step 5: Commit**

```bash
git add display-v2/src/utils/craftProcess.js display-v2/tests/craftProcess.test.js
git commit -m "feat(craft): G1-1 工序纯逻辑（步骤归约/可见集/冲突检查）"
```

---

### Task 5: useCraftProcess composable

**Files:**
- Create: `display-v2/src/composables/useCraftProcess.js`

- [ ] **Step 1: 实现**

```js
// display-v2/src/composables/useCraftProcess.js
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import {
  nextStep, prevStep, isLastStep,
  resolveStepVisible, findStepConflicts,
} from '../utils/craftProcess'

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 工序状态机：读 step config → 驱动 useGlbScene（显隐/部件动画/相机）。
 *
 *   const proc = useCraftProcess(config, sceneApi)
 *   await proc.enter(0)          // 进入某步（应用显隐+动画+机位）
 *   proc.next() / proc.prev() / proc.toggleAuto()
 *
 * sceneApi 需要的方法：setVisible / getObject / applyCameraPose / setFreeRoam
 */
export function useCraftProcess(config, sceneApi) {
  const currentStep = ref(0)
  const playing = ref(false)
  let partNames = []
  let autoTimeline = null

  const steps = config.steps
  const stepMeta = computed(() => steps[currentStep.value])
  const isLast = computed(() => isLastStep(currentStep.value, steps.length))

  /** 由页面在模型加载后注入部件清单 */
  const setPartNames = (names) => { partNames = names }

  /** 执行单条动画指令（GSAP）。fadeIn/fadeOut 走 opacity，需材质 transparent */
  const _runAnimation = (anim) => {
    const obj = sceneApi.getObject(anim.target)
    if (!obj) { console.warn('[craft] 部件缺失:', anim.target); return null }
    const d = anim.duration ?? 1
    const props = { duration: d, ease: 'power2.inOut' }
    if (anim.delay) props.delay = anim.delay
    const tl = gsap.timeline()
    if (anim.rotateY != null) tl.to(obj.rotation, { y: `+=${anim.rotateY}`, ...props }, 0)
    if (anim.rotateX != null) tl.to(obj.rotation, { x: `+=${anim.rotateX}`, ...props }, 0)
    if (anim.moveX != null) tl.to(obj.position, { x: `+=${anim.moveX}`, ...props }, 0)
    if (anim.moveY != null) tl.to(obj.position, { y: `+=${anim.moveY}`, ...props }, 0)
    if (anim.moveZ != null) tl.to(obj.position, { z: `+=${anim.moveZ}`, ...props }, 0)
    if (anim.scale != null) tl.to(obj.scale, { x: anim.scale, y: anim.scale, z: anim.scale, ...props }, 0)
    if (anim.fadeOut) tl.to(obj, { ...props, onStart: () => { obj.visible = true }, onComplete: () => { obj.visible = false } }, 0)
    if (anim.fadeIn) tl.fromTo(obj.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, ...props, onStart: () => { obj.visible = true } }, 0)
    return tl
  }

  /** 进入第 i 步：显隐 → 动画 → 相机 */
  const enter = (i) => {
    const step = steps[i]
    if (!step) return
    currentStep.value = i

    for (const c of findStepConflicts(step, partNames)) {
      console.warn('[craft] 步骤冲突（fadeOut 目标仍在 visible）:', c)
    }

    sceneApi.setVisible(resolveStepVisible(step, partNames))
    sceneApi.setFreeRoam(isLastStep(i, steps.length))

    if (!prefersReduce()) {
      for (const anim of step.animations || []) _runAnimation(anim)
    } else {
      // reduced-motion：直接应用终态（fadeOut → 隐藏，fadeIn → 显示）
      for (const anim of step.animations || []) {
        const obj = sceneApi.getObject(anim.target)
        if (!obj) continue
        if (anim.fadeOut) obj.visible = false
        if (anim.fadeIn) obj.visible = true
      }
    }
    sceneApi.applyCameraPose(step.camera)
  }

  const next = () => { stopAuto(); enter(nextStep(currentStep.value, steps.length)) }
  const prev = () => { stopAuto(); enter(prevStep(currentStep.value, steps.length)) }

  const stopAuto = () => {
    playing.value = false
    autoTimeline?.kill()
    autoTimeline = null
  }

  /** 自动播放：从当前步顺序走到末步 */
  const toggleAuto = () => {
    if (playing.value) { stopAuto(); return }
    if (prefersReduce()) { enter(steps.length - 1); return }
    playing.value = true
    autoTimeline = gsap.timeline({
      onComplete: () => { playing.value = false },
    })
    for (let i = currentStep.value; i < steps.length; i++) {
      const idx = i
      autoTimeline.call(() => enter(idx), null, '+=0.2')
      const dur = (steps[idx].animations || []).reduce((m, a) => Math.max(m, (a.duration ?? 1) + (a.delay ?? 0)), 0)
      autoTimeline.to({}, { duration: Math.max(dur, 1.5) })  // 每步驻留
    }
  }

  const dispose = () => stopAuto()

  return { currentStep, stepMeta, isLast, playing, setPartNames, enter, next, prev, toggleAuto, stopAuto, dispose }
}
```

- [ ] **Step 2: 构建验证**

Run: `cd display-v2 && npm run build`
Expected: `✓ built`

- [ ] **Step 3: Commit**

```bash
git add display-v2/src/composables/useCraftProcess.js
git commit -m "feat(craft): G1-2 useCraftProcess 工序状态机"
```

---

## G2 页面：配置 + 组件 + 路由

### Task 6: 东昌葫芦工序配置 + 契约测试

**Files:**
- Create: `display-v2/src/content/crafts/dongchang-hulu.js`
- Test: `display-v2/tests/craftConfig.test.js`

- [ ] **Step 1: 写失败测试**

```js
// display-v2/tests/craftConfig.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HULU_PROCESS } from '../src/content/crafts/dongchang-hulu.js'
import { HULU_PARTS, matchPartName } from '../src/config/glbParts.js'

const knownPattern = (p) =>
  HULU_PARTS.some((n) => matchPartName(p, n)) || p.endsWith('*')

test('工序配置：5 步且 key 唯一', () => {
  assert.equal(HULU_PROCESS.steps.length, 5)
  const keys = HULU_PROCESS.steps.map((s) => s.key)
  assert.equal(new Set(keys).size, 5)
})

test('每步有 name/desc/camera，camera 为两个三元组', () => {
  for (const s of HULU_PROCESS.steps) {
    assert.ok(s.name && s.desc, `${s.key} 缺 name/desc`)
    assert.equal(s.camera.pos.length, 3)
    assert.equal(s.camera.target.length, 3)
  }
})

test('visible 与 animations.target 引用均在命名规范内', () => {
  for (const s of HULU_PROCESS.steps) {
    for (const p of s.visible || []) {
      assert.ok(knownPattern(p), `${s.key} visible 未知模式: ${p}`)
    }
    for (const a of s.animations || []) {
      assert.ok(HULU_PARTS.includes(a.target), `${s.key} 动画目标未知: ${a.target}`)
    }
  }
})

test('knowledge key 精确命中规范部件', () => {
  for (const k of Object.keys(HULU_PROCESS.knowledge)) {
    assert.ok(HULU_PARTS.includes(k), `knowledge 未知部件: ${k}`)
  }
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd display-v2 && node --test tests/craftConfig.test.js`
Expected: FAIL `Cannot find module`

- [ ] **Step 3: 实现配置（含占位场景构建器）**

```js
// display-v2/src/content/crafts/dongchang-hulu.js
// 东昌葫芦雕刻 · 五工序配置。model=null 时用 buildPlaceholder() 占位场景；
// GLB 生成后把 model 改为 '/media/crafts/dongchang-hulu.glb'。
import * as THREE from 'three'

export const HULU_PROCESS = {
  slug: 'dongchang-hulu',
  title: '东昌葫芦雕刻',
  subtitle: '国家级非物质文化遗产 · 聊城',
  model: null, // GLB 就绪后替换为 url
  knowledge: {
    gourd_body: { title: '葫芦坯', body: '选用聊城本地亚腰葫芦，霜降后采摘，皮厚质密者方为上料。' },
    pattern_draft: { title: '墨线画稿', body: '以铅笔或淡墨在葫芦表面起稿，戏曲人物、花鸟虫鱼皆有定式。' },
    carved_layer: { title: '雕刻成型', body: '平刀走线、圆刀作面，针刻片花层层深入，最见功力。' },
    knife_rest: { title: '刻刀', body: '平刀、圆刀、斜口刀分工不同，匠人常自制刀具。' },
    painted_layer: { title: '上色成品', body: '松烟墨或矿物颜料敷色，烙画加深层次，成品可传百年。' },
  },
  steps: [
    {
      key: 'select', name: '选料', icon: '选',
      desc: '霜降后采摘亚腰葫芦，取形正、皮厚、无斑者，是为佳坯。',
      visible: ['gourd_raw', 'scene_*'],
      animations: [{ target: 'gourd_raw', rotateY: Math.PI * 2, duration: 2.5 }],
      camera: { pos: [0, 1.2, 3.2], target: [0, 0.6, 0] },
    },
    {
      key: 'peel', name: '去皮晾晒', icon: '晾',
      desc: '竹刀刮去青皮，置于阴凉通风处晾晒月余，待其通体金黄。',
      visible: ['gourd_raw', 'gourd_body', 'peel_strips', 'scene_*'],
      animations: [
        { target: 'peel_strips', moveY: -0.6, duration: 1.2 },
        { target: 'peel_strips', fadeOut: true, duration: 0.6, delay: 1.0 },
        { target: 'gourd_raw', fadeOut: true, duration: 0.8 },
        { target: 'gourd_body', fadeIn: true, duration: 1.0, delay: 0.6 },
      ],
      camera: { pos: [1.6, 1.0, 2.8], target: [0, 0.6, 0] },
    },
    {
      key: 'draft', name: '画稿', icon: '稿',
      desc: '淡墨起稿，人物花鸟先立意后落笔，一笔不容悔。',
      visible: ['gourd_body', 'pattern_draft', 'scene_*'],
      animations: [{ target: 'pattern_draft', fadeIn: true, duration: 1.4 }],
      camera: { pos: [-1.8, 0.9, 2.6], target: [0, 0.6, 0] },
    },
    {
      key: 'carve', name: '雕刻', icon: '刻',
      desc: '平刀圆刀交替，针刻片花，深浅之间气象万千。',
      visible: ['gourd_body', 'carved_layer', 'knife_action', 'scene_*'],
      animations: [
        { target: 'knife_action', moveX: 0.15, duration: 0.4 },
        { target: 'knife_action', moveX: -0.15, duration: 0.4, delay: 0.4 },
        { target: 'knife_action', moveX: 0.15, duration: 0.4, delay: 0.8 },
        { target: 'carved_layer', fadeIn: true, duration: 1.2, delay: 0.4 },
      ],
      camera: { pos: [0.8, 0.8, 2.2], target: [0, 0.65, 0] },
    },
    {
      key: 'paint', name: '上色成品', icon: '色',
      desc: '松烟敷色、烙画定型，一枚葫芦从此有了姓名。',
      visible: ['gourd_body', 'painted_layer', 'knife_rest', 'scene_*'],
      animations: [
        { target: 'painted_layer', fadeIn: true, duration: 1.4 },
        { target: 'gourd_body', rotateY: Math.PI * 2, duration: 3, delay: 1.2 },
      ],
      camera: { pos: [0, 1.0, 2.6], target: [0, 0.6, 0] },
    },
  ],
}

/**
 * 占位场景：按命名规范用几何体搭简模，GLB 生成前跑通全管线。
 * 返回 THREE.Group，部件名与规范一致。
 */
export function buildPlaceholder() {
  const g = new THREE.Group()
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c })

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.08, 32), mat(0x8b6f47))
  base.position.y = 0.04
  base.name = 'scene_base'
  g.add(base)

  // 葫芦形：两球叠合
  const mkGourd = (name, color) => {
    const grp = new THREE.Group()
    grp.name = name
    const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), mat(color))
    bottom.position.y = 0.42
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), mat(color))
    top.position.y = 0.82
    grp.add(bottom, top)
    return grp
  }

  const raw = mkGourd('gourd_raw', 0x7a9a4e)
  g.add(raw)
  const body = mkGourd('gourd_body', 0xd9a441)
  body.visible = false
  g.add(body)

  const strips = new THREE.Group()
  strips.name = 'peel_strips'
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.01), mat(0x5e7d3a))
    s.position.set(Math.cos(i * 2.1) * 0.4, 0.6, Math.sin(i * 2.1) * 0.4)
    strips.add(s)
  }
  strips.visible = false
  g.add(strips)

  const draft = mkGourd('pattern_draft', 0x3a3a3a)
  draft.children.forEach((m) => { m.material = mat(0x444444); m.material.transparent = true; m.material.opacity = 0.35 })
  draft.visible = false
  g.add(draft)

  const carved = mkGourd('carved_layer', 0xb0762a)
  carved.visible = false
  g.add(carved)

  const knifeA = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), mat(0x888888))
  knifeA.name = 'knife_action'
  knifeA.position.set(0.55, 0.65, 0)
  knifeA.visible = false
  g.add(knifeA)

  const knifeR = knifeA.clone()
  knifeR.name = 'knife_rest'
  knifeR.rotation.z = Math.PI / 2
  knifeR.position.set(0.7, 0.12, 0.3)
  knifeR.visible = false
  g.add(knifeR)

  const painted = mkGourd('painted_layer', 0xa93226)
  painted.visible = false
  g.add(painted)

  return g
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd display-v2 && node --test tests/craftConfig.test.js`
Expected: PASS 4 tests

- [ ] **Step 5: Commit**

```bash
git add display-v2/src/content/crafts/dongchang-hulu.js display-v2/tests/craftConfig.test.js
git commit -m "feat(craft): G2-1 东昌葫芦五工序配置 + 占位场景构建器 + 契约测试"
```

---

### Task 7: 三组件（CraftStage / StepRail / KnowledgeCard）

**Files:**
- Create: `display-v2/src/components/craft/CraftStage.vue`
- Create: `display-v2/src/components/craft/StepRail.vue`
- Create: `display-v2/src/components/craft/KnowledgeCard.vue`

- [ ] **Step 1: CraftStage.vue**

```vue
<!-- display-v2/src/components/craft/CraftStage.vue -->
<template>
  <div ref="wrapRef" class="craft-stage">
    <canvas v-if="!degraded" ref="canvasRef" class="craft-stage__canvas"></canvas>

    <!-- 加载进度 -->
    <div v-if="!degraded && loading" class="craft-stage__overlay">
      <div class="progress-track"><div class="progress-bar" :style="{ width: `${progress * 100}%` }"></div></div>
      <span class="progress-text">工坊备料中… {{ Math.round(progress * 100) }}%</span>
    </div>

    <!-- 错误态 -->
    <ErrorState v-if="errorMsg" :message="errorMsg" @retry="$emit('retry')" />

    <!-- 降级：静态工序图 -->
    <div v-if="degraded" class="craft-stage__fallback">
      <div class="fallback-frame">
        <div class="fallback-seal">{{ stepIcon || '艺' }}</div>
        <p class="fallback-hint">当前设备以画卷形式呈现工序</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ErrorState from '../homepage/ErrorState.vue'

defineProps({
  loading: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  errorMsg: { type: String, default: null },
  degraded: { type: Boolean, default: false },
  stepIcon: { type: String, default: '' },
})
defineEmits(['retry'])

const wrapRef = ref(null)
const canvasRef = ref(null)
defineExpose({ wrapRef, canvasRef })
</script>

<style scoped>
.craft-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 8px;
  overflow: hidden;
  background: var(--card-bg, #fdfaf5);
}

.craft-stage__canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.craft-stage__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--card-bg, #fdfaf5);
}

.progress-track {
  width: 220px;
  height: 4px;
  border-radius: 2px;
  background: var(--border, #e8e0d5);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent, #9e2b25);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.craft-stage__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-frame {
  text-align: center;
}

.fallback-seal {
  width: 72px;
  height: 72px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  background: var(--accent, #9e2b25);
  border-radius: 8px;
}

.fallback-hint {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
}
</style>
```

- [ ] **Step 2: StepRail.vue**

```vue
<!-- display-v2/src/components/craft/StepRail.vue -->
<template>
  <div class="step-rail">
    <div class="step-rail__steps" role="tablist" aria-label="制作工序">
      <button
        v-for="(s, i) in steps"
        :key="s.key"
        class="step-node"
        :class="{ active: i === current, done: i < current }"
        role="tab"
        :aria-selected="i === current"
        @click="$emit('goto', i)"
      >
        <span class="step-node__seal">{{ s.icon }}</span>
        <span class="step-node__name">{{ s.name }}</span>
      </button>
    </div>

    <p class="step-rail__desc">{{ activeStep?.desc }}</p>

    <div class="step-rail__controls">
      <button class="ctl-btn" :disabled="current === 0" @click="$emit('prev')">← 上一步</button>
      <button class="ctl-btn primary" @click="$emit('toggleAuto')">{{ playing ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <button class="ctl-btn" :disabled="current === steps.length - 1" @click="$emit('next')">下一步 →</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 0 },
  playing: { type: Boolean, default: false },
})
defineEmits(['goto', 'prev', 'next', 'toggleAuto'])

const activeStep = computed(() => props.steps[props.current])
</script>

<style scoped>
.step-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.step-rail__steps {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.step-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.step-node__seal {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-muted);
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.step-node.active .step-node__seal {
  color: #fff;
  background: var(--accent, #9e2b25);
  border-color: var(--accent, #9e2b25);
  transform: scale(1.1);
}

.step-node.done .step-node__seal {
  color: var(--accent, #9e2b25);
  border-color: var(--accent, #9e2b25);
}

.step-node__name {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-secondary);
}

.step-node.active .step-node__name {
  color: var(--text-primary);
  font-weight: 700;
}

.step-rail__desc {
  min-height: 44px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
}

.step-rail__controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.ctl-btn {
  font-size: 13px;
  letter-spacing: 1px;
  padding: 8px 18px;
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 20px;
  background: var(--card-bg, #fdfaf5);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.ctl-btn:hover:not(:disabled) {
  border-color: var(--accent, #9e2b25);
  color: var(--accent, #9e2b25);
}

.ctl-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.ctl-btn.primary {
  background: var(--accent, #9e2b25);
  border-color: var(--accent, #9e2b25);
  color: #fff;
}

.ctl-btn.primary:hover {
  color: #fff;
  filter: brightness(1.1);
}

@media (max-width: 640px) {
  .step-node__name { display: none; }
}
</style>
```

- [ ] **Step 3: KnowledgeCard.vue**

```vue
<!-- display-v2/src/components/craft/KnowledgeCard.vue -->
<template>
  <transition name="fade">
    <div v-if="info" class="knowledge-card" :style="posStyle">
      <div class="knowledge-card__seal">{{ info.title[0] }}</div>
      <div class="knowledge-card__body">
        <h4 class="knowledge-card__title">{{ info.title }}</h4>
        <p class="knowledge-card__text">{{ info.body }}</p>
      </div>
      <button class="knowledge-card__close" aria-label="关闭" @click="$emit('close')">×</button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  info: { type: Object, default: null },   // { title, body }
  anchor: { type: Object, default: null }, // { x, y } 相对舞台容器 px
})

defineEmits(['close'])

const posStyle = computed(() => {
  if (!props.anchor) return {}
  return { left: `${Math.min(props.anchor.x + 16, 320)}px`, top: `${props.anchor.y + 12}px` }
})
</script>

<style scoped>
.knowledge-card {
  position: absolute;
  z-index: 5;
  display: flex;
  gap: 12px;
  max-width: 300px;
  padding: 14px 16px;
  background: var(--card-bg, rgba(253, 250, 245, 0.96));
  backdrop-filter: blur(8px);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 8px;
  box-shadow: 0 10px 32px rgba(31, 26, 22, 0.12);
}

.knowledge-card__seal {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  background: var(--accent, #9e2b25);
  border-radius: 5px;
}

.knowledge-card__title {
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.knowledge-card__text {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
}

.knowledge-card__close {
  position: absolute;
  top: 4px;
  right: 8px;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--text-muted);
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 4: 构建验证 + Commit**

Run: `cd display-v2 && npm run build`
Expected: `✓ built`

```bash
git add display-v2/src/components/craft/
git commit -m "feat(craft): G2-2 微游戏三组件（舞台/步骤条/知识点卡）"
```

---

### Task 8: CraftWorkshop 页面 + 路由 + 注册表

**Files:**
- Create: `display-v2/src/views/CraftWorkshop.vue`
- Modify: `display-v2/src/router/index.js`（加 /crafts 路由）
- Modify: `display-v2/src/config/culturalCategories.js`（craft ready: true）

- [ ] **Step 1: CraftWorkshop.vue**

```vue
<!-- display-v2/src/views/CraftWorkshop.vue -->
<template>
  <div class="craft-workshop" :class="{ 'anime-layout': isAnime }">
    <header class="ws-hero">
      <span class="ws-hero__tag">文化长廊 · 非遗工艺</span>
      <h1 class="ws-hero__title">{{ config.title }}</h1>
      <p class="ws-hero__sub">{{ config.subtitle }}</p>
    </header>

    <div class="ws-stage-wrap">
      <CraftStage
        ref="stageRef"
        :loading="loading"
        :progress="progress"
        :error-msg="errorMsg"
        :degraded="degraded"
        :step-icon="proc.stepMeta.value?.icon"
        @retry="boot"
      />
      <KnowledgeCard
        :info="knowledge"
        :anchor="knowledgeAnchor"
        @close="knowledge = null"
      />
    </div>

    <StepRail
      :steps="config.steps"
      :current="proc.currentStep.value"
      :playing="proc.playing.value"
      @goto="(i) => { proc.stopAuto(); proc.enter(i) }"
      @prev="proc.prev"
      @next="proc.next"
      @toggle-auto="proc.toggleAuto"
    />

    <p v-if="proc.isLast.value && !degraded" class="ws-roam-hint">
      拖拽旋转，细观成品；点击部件可览其解。
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useGlbScene, canUseWebGL } from '../composables/useGlbScene'
import { useCraftProcess } from '../composables/useCraftProcess'
import { HULU_PROCESS as config, buildPlaceholder } from '../content/crafts/dongchang-hulu'
import CraftStage from '../components/craft/CraftStage.vue'
import StepRail from '../components/craft/StepRail.vue'
import KnowledgeCard from '../components/craft/KnowledgeCard.vue'

const { isAnime } = useTheme()

const stageRef = ref(null)
const loading = ref(true)
const progress = ref(0)
const errorMsg = ref(null)
const degraded = ref(false)
const knowledge = ref(null)
const knowledgeAnchor = ref(null)

const scene = useGlbScene()
const proc = useCraftProcess(config, scene)
let observer = null

const boot = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    degraded.value = !canUseWebGL()
    if (degraded.value) { loading.value = false; proc.enter(0); return }

    await scene.init(stageRef.value.canvasRef)
    scene.setOnProgress((p) => { progress.value = p })
    const source = config.model || buildPlaceholder()
    const { partNames } = await scene.load(source)
    proc.setPartNames(partNames)

    scene.onPartClick((name, _point, ev) => {
      const info = config.knowledge[name]
      if (!info || !proc.isLast.value) return
      knowledge.value = info
      knowledgeAnchor.value = { x: 24, y: 24 }
    })

    proc.enter(0)
  } catch (err) {
    console.error('工坊加载失败:', err)
    errorMsg.value = '工坊加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await boot()
  // 滚出视口暂停渲染
  if (!degraded.value && stageRef.value?.wrapRef) {
    observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) scene.resume()
      else { scene.pause(); proc.stopAuto() }
    }, { threshold: 0.1 })
    observer.observe(stageRef.value.wrapRef)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  proc.dispose()
  scene.dispose()
})
</script>

<style scoped>
.craft-workshop {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.ws-hero {
  text-align: center;
}

.ws-hero__tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  background: var(--accent, #9e2b25);
  padding: 5px 12px;
  border-radius: 2px;
  margin-bottom: 14px;
}

.ws-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 3.4vw, 36px);
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.ws-hero__sub {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin: 0;
}

.ws-stage-wrap {
  position: relative;
}

.ws-roam-hint {
  text-align: center;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin: 0;
}
</style>
```

- [ ] **Step 2: 注册路由**

`display-v2/src/router/index.js`，在 `/festivals/:id` 行后加：

```js
  { path: '/crafts', name: 'CraftWorkshop', component: () => import('../views/CraftWorkshop.vue') },
```

- [ ] **Step 3: 注册表置 ready**

`display-v2/src/config/culturalCategories.js`，craft 条改为：

```js
  { key: 'craft',      name: '非遗工艺', seal: '艺', route: '/crafts',     ready: true  },
```

- [ ] **Step 4: 全量测试 + 构建**

Run: `cd display-v2 && npm run test:unit && npm run build`
Expected: 0 fail + `✓ built`

- [ ] **Step 5: dev 手动冒烟**

Run: `cd display-v2 && npm run dev`，浏览器开 `http://localhost:5175/crafts`
Expected: 占位葫芦场景渲染；步骤条切步有动画；末步可拖拽旋转；点击部件出知识点卡；双主题切换不报错

- [ ] **Step 6: Commit**

```bash
git add display-v2/src/views/CraftWorkshop.vue display-v2/src/router/index.js display-v2/src/config/culturalCategories.js
git commit -m "feat(craft): G2-3 工坊页 + /crafts 路由 + 注册表 ready"
```

---

## G3 双风格材质 + 降级链路

### Task 9: useToonTheme

**Files:**
- Create: `display-v2/src/composables/useToonTheme.js`
- Modify: `display-v2/src/views/CraftWorkshop.vue`（watch 主题调用）

- [ ] **Step 1: 实现**

```js
// display-v2/src/composables/useToonTheme.js
import * as THREE from 'three'

/**
 * 双风格材质切换：inkwash = MeshToonMaterial + EdgesGeometry 描边；
 * real = 还原 GLB 原生 PBR（靠 useGlbScene.getOriginalMaterials() 快照）。
 */
export function useToonTheme(sceneApi) {
  let edgeLines = []   // 描边线对象，还原时移除

  const applyToon = () => {
    const root = sceneApi.getRoot()
    if (!root) return
    const originals = sceneApi.getOriginalMaterials()
    root.traverse((m) => {
      if (!m.isMesh) return
      if (!originals.has(m.uuid)) originals.set(m.uuid, m.material)
      const src = [].concat(m.material)[0]
      const toon = new THREE.MeshToonMaterial({ color: src?.color?.clone?.() || 0x999999 })
      m.material = toon
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(m.geometry, 30),
        new THREE.LineBasicMaterial({ color: 0x2b2b2b }),
      )
      m.add(edges)
      edgeLines.push(edges)
    })
  }

  const restorePbr = () => {
    const root = sceneApi.getRoot()
    if (!root) return
    const originals = sceneApi.getOriginalMaterials()
    root.traverse((m) => {
      if (m.isMesh && originals.has(m.uuid)) m.material = originals.get(m.uuid)
    })
    for (const line of edgeLines) {
      line.parent?.remove(line)
      line.geometry.dispose()
      line.material.dispose()
    }
    edgeLines = []
  }

  /** theme: 'real' | 'inkwash' */
  const apply = (theme) => (theme === 'inkwash' ? applyToon() : restorePbr())

  return { apply, applyToon, restorePbr }
}
```

- [ ] **Step 2: CraftWorkshop 接入主题 watch**

`display-v2/src/views/CraftWorkshop.vue` script 中：

```js
import { watch } from 'vue'
import { useToonTheme } from '../composables/useToonTheme'
// const { isAnime } = useTheme() 下行替换：
const { isAnime, theme } = useTheme()
const toonTheme = useToonTheme(scene)

// boot() 内 proc.enter(0) 之前（degraded 分支之后、模型加载完成后）加：
//   toonTheme.apply(theme.value)

// onMounted 之后加：
watch(theme, (t) => { if (!degraded.value) toonTheme.apply(t) })
```

- [ ] **Step 3: 构建 + Commit**

Run: `cd display-v2 && npm run build`
Expected: `✓ built`

```bash
git add display-v2/src/composables/useToonTheme.js display-v2/src/views/CraftWorkshop.vue
git commit -m "feat(craft): G3-1 双风格材质（Toon+描边 / PBR 还原）"
```

---

## G4 GLB 生成 + 打磨（用户协作）

### Task 10: GLB 生成与接入

**Files:**
- Create: `display-v2/public/media/crafts/dongchang-hulu.glb`（用户 AI 生成）
- Modify: `display-v2/src/content/crafts/dongchang-hulu.js`（model 字段）

- [ ] **Step 1: 用户按 spec §5 命名规范生成 GLB**（10 部件命名、DRACO 压缩 < 8MB、Y 轴向上、原点底座中心）

- [ ] **Step 2: 部件名核对**

```bash
cd display-v2 && node -e "
const fs = require('fs');
// 简易校验：GLB JSON chunk 中检索命名
const buf = fs.readFileSync('public/media/crafts/dongchang-hulu.glb');
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
const names = (json.nodes || []).map(n => n.name).filter(Boolean);
const spec = ['gourd_raw','gourd_body','peel_strips','pattern_draft','carved_layer','knife_rest','knife_action','painted_layer','scene_base'];
const missing = spec.filter(s => !names.includes(s));
console.log('nodes:', names.join(', '));
console.log(missing.length ? '缺失: ' + missing.join(', ') : '命名全部命中');
"
```
Expected: `命名全部命中`（缺失则用 Blender/gltf-transform 重命名后重导）

- [ ] **Step 3: 接入真实模型**

`dongchang-hulu.js` 中：`model: '/media/crafts/dongchang-hulu.glb',`

- [ ] **Step 4: 真机端到端走查清单**

- [ ] 五工序动画节奏与机位是否合适（调 config 的 camera/animations）
- [ ] 双主题材质观感（inkwash 描边粗细/底色）
- [ ] iOS Safari + Android Chrome：加载、切步、自由把玩、知识点卡
- [ ] 弱网（devtools 3G 节流）：进度条与加载时长
- [ ] reduced-motion：直接跳终态

- [ ] **Step 5: Commit**

```bash
git add display-v2/public/media/crafts/ display-v2/src/content/crafts/dongchang-hulu.js
git commit -m "feat(craft): G4 接入东昌葫芦 GLB 真实模型"
```

---

## 风险与备注

- 占位场景（`buildPlaceholder`）让 G0-G3 全程不阻塞于 GLB 生成；GLB 可随时插入
- 移动端 OrbitControls 手势与页面滚动冲突：沿用沙盘 P3-4 策略（`touchAction: 'pan-y'`，双指操作场景），G4 真机验证
- 降级静态图 5 张（每工序 1 张）并入 P2-M5~M9 素材排期，本轮降级 UI 以印章占位呈现
