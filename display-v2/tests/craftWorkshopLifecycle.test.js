import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/CraftWorkshop.vue', import.meta.url), 'utf8')

test('工坊在 setup 阶段注册状态机清理，避免异步回调中的生命周期告警', () => {
  const stageReadyIndex = source.indexOf('const onStageReady')
  const cleanupHookIndex = source.indexOf('onBeforeUnmount(')

  assert.notEqual(stageReadyIndex, -1, '应存在舞台 ready 回调')
  assert.notEqual(cleanupHookIndex, -1, '应注册工坊清理钩子')
  assert.ok(cleanupHookIndex < stageReadyIndex, '生命周期钩子必须在异步 ready 回调前注册')
})
