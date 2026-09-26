import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const routerSource = fs.readFileSync(new URL('./src/router/index.js', import.meta.url), 'utf8')
const apiSource = fs.readFileSync(new URL('./src/api/index.js', import.meta.url), 'utf8')

test('管理端父路由统一要求管理员权限', () => {
  assert.match(
    routerSource,
    /path: '\/',\s*\n\s*component:[\s\S]*?redirect: '\/poets',[\s\S]*?meta:\s*\{\s*requireAdmin:\s*true\s*\},\s*\n\s*children:/,
    '管理父路由应声明 requireAdmin，让所有子路由继承权限约束'
  )
})

test('普通用户访问管理页跳转到登录提示且不会经过根路由循环', () => {
  assert.match(
    routerSource,
    /to\.meta\.requireAdmin[\s\S]*?next\(\{\s*path:\s*'\/login',[\s\S]*?reason:\s*'forbidden'/,
    '权限不足时应跳到带 forbidden 原因的登录页'
  )
  assert.doesNotMatch(
    routerSource,
    /else if \(to\.meta\.requireAdmin[\s\S]*?next\('\/'\)/,
    '权限不足不能重定向到会再次命中默认管理页的根路由'
  )
})

test('403 响应不清除 token，只有 401 才触发登录失效处理', () => {
  const forbiddenBranch = apiSource.match(
    /(?:if|else if) \((?:status|error\.response\?\.status) === 403\)\s*\{([\s\S]*?)\n\s*\}/
  )
  assert.ok(forbiddenBranch, '请求拦截器应显式处理 403')
  assert.doesNotMatch(forbiddenBranch[1], /removeItem\(['"]token['"]\)/)
  assert.match(apiSource, /(?:status|error\.response\?\.status) === 401[\s\S]*?removeItem\(['"]token['"]\)/)
})
