import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./src/api/index.js', import.meta.url), 'utf8')

test('已由统一 Result 分支处理的错误不会在 rejected 拦截器重复提示', () => {
  assert.match(source, /handledError\.__sjgHandled = true/)
  assert.match(source, /if \(error\?\.__sjgHandled\) return Promise\.reject\(error\)/)
})
