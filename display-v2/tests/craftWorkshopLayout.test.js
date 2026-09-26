import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/views/CraftWorkshop.vue', import.meta.url), 'utf8')

test('旗舰工坊知识卡挂在舞台定位上下文内，避免脱离 3D 舞台', () => {
  const stageStart = source.indexOf('<div class="cw-stage-wrap">')
  const stageEnd = source.indexOf('\n      </div>\n\n      <!-- 右侧控制面板 -->', stageStart)
  const cardIndex = source.indexOf('<KnowledgeCard', stageStart)

  assert.notEqual(stageStart, -1, '应存在工坊舞台容器')
  assert.notEqual(cardIndex, -1, '应渲染知识卡')
  assert.ok(cardIndex < stageEnd, '知识卡必须作为舞台容器的子节点')
})
