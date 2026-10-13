import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  clampDockPosition,
  defaultDockPosition,
  getAssistantDrawerRect,
  normalizeDockPosition,
  normalizeViewport,
  parseDockPosition,
  restoreDockPosition,
  serializeDockPosition,
} from '../src/utils/assistantDock.js'

test('默认角色距离右边 16px、底边 20px，越界拖动保留安全间距', () => {
  const viewport = { width: 1200, height: 800 }
  assert.deepEqual(defaultDockPosition(viewport), { x: 1096, y: 684 })
  assert.deepEqual(clampDockPosition({ x: -800, y: 4000 }, viewport), { x: 12, y: 692 })
  assert.deepEqual(clampDockPosition({ x: NaN, y: Infinity }, viewport), { x: 1100, y: 692 })
})

test('已保存相对位置在缩放与软键盘可见区域中保持比例', () => {
  const source = { width: 1200, height: 800 }
  const saved = normalizeDockPosition({ x: 556, y: 352 }, source)
  assert.deepEqual(saved, { x: 0.5, y: 0.5 })
  const shrunk = { width: 390, height: 350, offsetLeft: 20, offsetTop: 160 }
  assert.deepEqual(restoreDockPosition(saved, shrunk), { x: 171, y: 287 })
  const extreme = { width: 70, height: 80, offsetLeft: 4, offsetTop: 7 }
  assert.deepEqual(restoreDockPosition(saved, extreme), { x: 4, y: 7 })
})

test('存储仅接受指定版本与合法比例，损坏数据安全忽略', () => {
  const stored = serializeDockPosition({ x: 556, y: 352 }, { width: 1200, height: 800 })
  assert.deepEqual(parseDockPosition(stored), { x: 0.5, y: 0.5 })
  for (const bad of [null, '', '{', '[]', 'null', '{"version":2,"x":0.5,"y":0.5}', '{"version":1,"x":"0.5","y":0}', '{"version":1,"x":-1,"y":0}', '{"version":1,"x":0,"y":1.1}', ' '.repeat(201)]) {
    assert.equal(parseDockPosition(bad), null)
  }
})

test('桌面对话框在角色左侧或右侧打开，上下位置始终可见', () => {
  const viewport = { width: 1200, height: 800 }
  assert.deepEqual(getAssistantDrawerRect({ x: 1096, y: 684 }, viewport), { left: 694, top: 220, width: 390, height: 560 })
  assert.deepEqual(getAssistantDrawerRect({ x: 12, y: 12 }, viewport), { left: 112, top: 12, width: 390, height: 560 })
  const constrained = getAssistantDrawerRect({ x: 300, y: 600 }, { width: 640, height: 680 })
  assert.equal(constrained.width, 390)
  assert.ok(constrained.left >= 12 && constrained.left + constrained.width <= 628)
  assert.ok(constrained.top >= 12 && constrained.top + constrained.height <= 668)
})

test('移动端贴合可见区域，键盘出现后输入区不会落到键盘下方', () => {
  assert.deepEqual(getAssistantDrawerRect({ x: 200, y: 700 }, { width: 390, height: 844 }), { left: 12, top: 272, width: 366, height: 560 })
  assert.deepEqual(getAssistantDrawerRect({ x: 200, y: 700 }, { width: 390, height: 300, offsetTop: 200 }), { left: 12, top: 212, width: 366, height: 276 })
})

test('无效视口参数使用可用默认值，防止 NaN 进入样式', () => {
  assert.deepEqual(normalizeViewport({ width: 0, height: NaN, offsetLeft: -20, offsetTop: Infinity }), { width: 1024, height: 768, offsetLeft: 0, offsetTop: 0 })
})
