import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const viewPath = (name) => resolve(__dirname, '../views', name)
const readView = (name) => readFileSync(viewPath(name), 'utf8')

test('required admin form fields declare matching Element Plus prop bindings', () => {
  const cases = [
    ['PoetList.vue', '姓名', 'name'],
    ['EventList.vue', '标题', 'title'],
    ['PoemList.vue', '标题', 'title'],
    ['PoemList.vue', '内容', 'content'],
    ['SpotList.vue', '名称', 'name'],
    ['SpotList.vue', '地区', 'region'],
    ['SpotList.vue', '经度', 'longitude'],
    ['SpotList.vue', '纬度', 'latitude'],
    ['UserList.vue', '新密码', 'newPassword'],
  ]

  for (const [file, label, prop] of cases) {
    const source = readView(file)
    assert.match(
      source,
      new RegExp(`<el-form-item[^>]*label="${label}"[^>]*prop="${prop}"`),
      `${file} ${label} should bind validation prop="${prop}"`
    )
  }
})

test('SpotList uses the same video model for upload preview and submit payload', () => {
  const source = readView('SpotList.vue')

  assert.match(source, /<VideoUpload v-model="form\.videoUrl"/)
  assert.match(source, /videoUrl: normalizeMediaValue\(form\.videoUrl\)/)
})

test('UserList initializes approval tabs from the status query parameter', () => {
  const source = readView('UserList.vue')

  assert.match(source, /import \{ useRoute \} from 'vue-router'/)
  assert.match(source, /const route = useRoute\(\)/)
  assert.match(source, /const statusFilter = ref\(readStatusQuery\(route\.query\.status\)\)/)
})
