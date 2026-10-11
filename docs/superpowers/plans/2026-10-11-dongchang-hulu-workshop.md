# 东昌葫芦写实 3D 工坊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 在保留五工序导览的基础上交付可旋转的写实葫芦、表面描刻与擦色、本地作品集和成品导出。

**Architecture:** 制作数据采用独立纯函数模块；器物几何、纹样纹理、WebGL 渲染各自独立。页面只编排实录/观摩/制作/赏鉴四种模式和控件，渲染器消费工作快照并提交 UV 笔迹。观摩进度不等于制作完成。

**Tech Stack:** 现有 Vue 3、Three.js r184、GSAP、Node test runner；不新增付费服务、依赖、后台接口或数据库迁移。

## 文件边界与接口

- `display-v2/src/utils/huluWorkshop.js`：形制和纹样配置、UV 纹样路径、作品校验、评分、本地持久化；没有 Three.js/DOM 依赖。
- `display-v2/src/composables/useHuluWorkshop.js`：制作状态、撤销/重做、选项变更及存储反馈。
- `display-v2/src/craft/gourdGeometry.js`：连续曲面与干蒂、底座、刀具几何。
- `display-v2/src/craft/gourdTextures.js`：自然壳色、微表面、画稿、刻槽和敷色擦色的纹理生成。
- `display-v2/src/craft/huluRenderer.js`：完整三维场景、相机、光照、UV 拾取、笔迹预览、质量档位、暂停与资源释放。
- `display-v2/src/components/craft/HuluStage.vue`：渲染器生命周期、2D 降级与舞台控件。
- `display-v2/src/components/craft/WorkshopPanel.vue`：制作阶段、选坯与布纹、工具、评分、命名与保存控件。
- `display-v2/src/views/CraftWorkshop.vue`：模式与工序编排、来源、知识与作品集。
- `display-v2/src/content/crafts/dongchang-hulu.js` 和资产指南：依据 E01–E05 修正文案，移除无证据固定时间与色谱。
- `display-v2/src/composables/useCraftProcess.js`：隔离位姿快照，取消旧动画、真淡入和清理。

工作快照使用 `{ version: 1, shape, motif, placement: {u,v,scale,rotation}, depth, pigment, practice, name, strokes }`。
笔迹为 `{ kind: 'carve'|'coat'|'wipe', depth, pigment, points: [{u,v}] }`，坐标归一化且有限。
`createHuluRenderer(canvas, {onStroke,onInspect})` 返回 `update({work,mode,step,tool,sideLight,beforeAfter,guideVisible})`、`resetView()`、`zoom(factor)`、`exportImage()`（返回 PNG Blob）、`pause()`、`resume()`、`dispose()`。
模式为 `observe|make|gallery`，工具为 `rotate|carve|coat|wipe`；renderer 在一次完整笔迹结束后通知状态层，拖动中仅做本地纹理预览。

## Task 1：确认设计、保留证据并准备分支

- [x] 保留已确认的设计与证据文档；用户已授权开始实现，不再要求第二次设计批准。
- [x] 核对现有工作树与主目录状态，在现有隔离工作树使用 `codex/dongchang-hulu-workshop` 分支。

```bash
git status --short
git switch -c codex/dongchang-hulu-workshop
```

## Task 2：制作数据与状态（主代理负责）

Files: `src/utils/huluWorkshop.js`、`src/composables/useHuluWorkshop.js`、`tests/huluWorkshop.test.js`。

- [x] 先建立行为测试：旧版/非法作品拒绝，有限坐标和笔迹上限；真实刻线覆盖率，敷色擦色覆盖；观摩跳步不伪造完成；撤销重做；存储失败反馈。
- [x] 验证缺失功能导致测试失败，再实现纯函数与组合状态。
- [x] 用真实作品 JSON 往返测试，限制作品数和笔迹规模，避免本地存储无界增长。

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import * as workshop from '../src/utils/huluWorkshop.js'
test('没有刻线的作品不能完成制作', () => {
  assert.equal(workshop.evaluateWork(workshop.createWorkshopState()).canFinish, false)
})
test('损坏或未知版本的作品不会进入渲染', () => {
  assert.equal(workshop.normalizeWork({ version: 99, strokes: [] }), null)
})
```

Run: `cd display-v2 && node --test tests/huluWorkshop.test.js`。

## Task 3：写实几何、材质、光照与 UV 操作（渲染实现代理负责）

Files: `src/craft/gourdGeometry.js`、`src/craft/gourdTextures.js`、`src/craft/huluRenderer.js`、`tests/gourdGeometry.test.js`。

- [x] 首先测试几何：三种形制、有限顶点与法线、自然腰部连接、三角面预算与形制差异。
- [x] 连续曲面创建主件，干蒂与底痕分件；不依赖缺失 GLB。壳体非金属，带克制细纹与黄褐色变化。
- [x] 环境光、柔和主补光、接触阴影和侧光；微表面与刻线共用 UV，敷色擦色严格由实际笔迹驱动。
- [x] UV 接缝拆线，指针捕获/取消与多触摸处理；操作与 OrbitControls 分离。画稿辅助线不能伪装成玩家刻线。
- [x] 实现渲染器接口、PNG 导出、质量档位、ResizeObserver、离屏/后台暂停、无遗留资源的 dispose。

```js
test('自然葫芦网格的坐标与法线均为有限数', () => {
  const geometry = createGourdGeometry('balanced', 'mobile')
  assert.ok([...geometry.attributes.position.array].every(Number.isFinite))
  assert.ok([...geometry.attributes.normal.array].every(Number.isFinite))
  assert.ok(geometry.index.count / 3 < 30000)
  geometry.dispose()
})
```

Run: `node --test tests/gourdGeometry.test.js`；浏览器验收体积、雕刻与纹理，不能仅以 Node 测试代替视觉检查。

## Task 4：舞台、制作面板与页面整合

Files: `HuluStage.vue`、`WorkshopPanel.vue`、`CraftWorkshop.vue`、`HuluIllustration.vue`、`tests/huluStage.test.js`、`tests/craftWorkshopInteraction.test.js`。

- [x] 测试先行：成功初始化后才发送 ready；异步离页不发送迟到事件；真实降级能力说明；制作笔迹进入状态并可撤销。
- [x] 集成三种模式。观摩保留原步骤条与连续播放；制作五阶段独立门槛；赏鉴支持侧光、原坯对比与本地作品恢复。
- [x] 工具按钮、方向/缩放与复位均可触摸/键盘操作；平面降级仍提供描线练习，隐藏不支持的 3D 提示。
- [x] 保存失败有明确反馈；作品有标题、纹样、日期和再编辑入口。制作中的换坯/换纹样由页内明确操作确认清除旧笔迹。
- [x] 页面共用 folio 容器、间距和字体；390/768/1440px 无横向溢出。

Run: `node --test tests/huluStage.test.js tests/craftWorkshopInteraction.test.js`；`npm run build`。

## Task 5：工艺内容与原状态机修正

Files: `dongchang-hulu.js`、`GLB-GENERATION-GUIDE.md`、`useCraftProcess.js`、`tests/craftProcessLifecycle.test.js`。

- [x] 用真实独立实例测试位姿快照、快速切步、真淡入/取消和 reduced-motion 终态。
- [x] 基准 Map 改为实例内部；旧动画切步和卸载时取消；还原原始比例而不是单位缩放。
- [x] 简介、列表入口、知识、降级插画一致改为自然壳色与着色擦色；五教学章节保留，标明演示与实际时长不同。
- [x] 来源通过 SourceList 显示 E02/E03/E05；技术文档只留开发文档，不混成文化来源。

Run: `node --test tests/craftProcess*.test.js tests/craftStageFallback.test.js tests/craftWorkshop*.test.js`。

## 用户追加：匠人实录到网页制作

- [x] 核查人民周刊网／人民视频与央视的东昌府葫芦视频，记录具体出处、日期、内容和证据边界。
- [x] 新增可复用 CraftVideoPreview，按明确的原页和媒体链接配置；默认实录入口，点击后加载、切来源及离页停止，失败保留原页链接。
- [x] 提供制作与五工序演示入口，保持笔迹和独立进度；不下载视频、不新增后台和依赖。
- [x] 真实浏览器核对页内播放、手机布局及制作保存导出闭环。

## Task 6：复核、浏览器验收、完整质量关卡与交付

- [x] 实现任务完成后先做规格符合性复核，再做代码质量复核，修复发现的问题。
- [x] 真 WebGL 首次进入、五工序、自动播放、旋转/缩放/复位、描刻/擦色/撤销/保存/恢复/导出逐项验证；截图近景检查高光、槽纹、轮廓和阴影。
- [x] 浏览器模拟手机触摸、三个屏宽、多个作品差异、低能力降级、快速离页返回与后台暂停验证。
- [x] `npm run test:unit` 和 `npm run build`；最后用 JDK 17 执行仓库 `npm run verify:all`。
- [x] 记录实际结果与性能观测，避免将目标帧率写成已达到；新运行时源文件全部纳入提交，截图与构建产物不提交。

```bash
JAVA_HOME=/Users/a1/Library/Java/JavaVirtualMachines/ms-17.0.19/Contents/Home npm run verify:all
git diff --check
git status --short
```

首期交付范围是推荐方案 B 的基础 3D 与完整制作闭环。复杂自由透雕、工具实体切削及公开社区仍是设计文档中明确的后续扩展，不冒充已交付功能。

实际结果与未覆盖硬件范围见 [验收记录](../specs/2026-10-11-dongchang-hulu-acceptance.md)。
