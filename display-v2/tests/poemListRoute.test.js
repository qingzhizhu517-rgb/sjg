import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { atlasLink } from '../src/config/atlasPreview.js'
import { parse } from '@vue/compiler-sfc'
import { createRouter, createMemoryHistory } from 'vue-router'

const routerSource = await readFile(new URL('../src/router/index.js', import.meta.url), 'utf8')
const citySource = await readFile(new URL('../src/views/CityCulture.vue', import.meta.url), 'utf8')

test('诗词列表路由存在且排在诗词详情动态路由之前', () => {
  const listIndex = routerSource.indexOf("path: '/poems'")
  const detailIndex = routerSource.indexOf("path: '/poems/:id'")

  assert.notEqual(listIndex, -1, '应提供 /poems 列表路由')
  assert.notEqual(detailIndex, -1, '应保留 /poems/:id 详情路由')
  assert.ok(listIndex < detailIndex, '列表路由必须先于动态详情路由匹配')
  assert.match(routerSource, /import\('\.\.\/views\/PoemList\.vue'\)/)
})

test('城市页的古诗词入口把当前城市带到可用列表页', () => {
  const { descriptor } = parse(citySource)
  const expression = descriptor.template.content.match(/:to="([^"]*\/poems\?region=[^"]*)"/)?.[1]
  assert.ok(expression, '城市册页须提供诗词筛选入口')
  const to = new Function('atlasLink', 'city', 'route', `return (${expression})`)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/poems', component: {} }] })
  for (const preview of [undefined, 'inkwash']) {
    const resolved = router.resolve(to(atlasLink, '济南', { query: { preview } }))
    assert.equal(resolved.path, '/poems')
    assert.equal(resolved.query.region, '济南')
    assert.equal(resolved.query.preview, preview)
  }
})
