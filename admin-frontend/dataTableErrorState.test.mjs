import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./src/components/DataTable.vue', import.meta.url), 'utf8')

test('列表请求失败时保留可理解的错误态并提供重试入口', () => {
  assert.match(source, /const error\s*=\s*ref\(['"]['"]\)/)
  assert.match(source, /catch\s*\(e\)\s*\{[\s\S]*error\.value\s*=\s*e\?\.message/)
  assert.match(source, /class="[^"]*table-error[^\"]*"[^>]*role="alert"/)
  assert.match(source, /@click="fetch"[\s\S]*?重试\s*</)
})

test('列表请求恢复后清除旧错误并安全处理空响应', () => {
  assert.match(source, /error\.value\s*=\s*['"]['"][\s\S]*?const result\s*=\s*await props\.fetchFn/)
  assert.match(source, /Array\.isArray\(result\?\.records\)/)
  assert.match(source, /Number\(result\?\.total\)/)
})
