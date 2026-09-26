import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./src/views/ContentGovernance.vue', import.meta.url), 'utf8')
const learningTaskSource = fs.readFileSync(new URL('./src/views/LearningTaskList.vue', import.meta.url), 'utf8')
const layoutSource = fs.readFileSync(new URL('./src/views/Layout.vue', import.meta.url), 'utf8')
const traditionalCss = fs.readFileSync(new URL('./src/styles/traditional.css', import.meta.url), 'utf8')

test('新增来源会清除上一次编辑残留的 id', () => {
  assert.match(source, /const openSourceDialog = \(row\) => \{[\s\S]*delete sourceForm\[key\]/)
})

test('任务编辑器内置 compare 示例绑定两个不同来源', () => {
  const compareBlock = learningTaskSource.match(/type: 'compare',[\s\S]*?questions: \[\{[\s\S]*?\}\]\s*\},\s*\{ type: 'reflection'/)
  assert.ok(compareBlock, '任务示例应包含 compare 步骤')
  assert.match(compareBlock[0], /sourceIds:\s*\[1,\s*2\]/,
    'compare 示例必须绑定两个不同来源，避免管理员直接按示例发布时失败')
})

test('管理端窄屏使用可关闭的移动侧栏，并允许主区和数据表横向承载', () => {
  assert.match(layoutSource, /mobile-menu-toggle/, '移动端应提供打开导航的入口')
  assert.match(layoutSource, /mobileMenuOpen/, '移动端侧栏需要可控的打开状态')
  assert.match(layoutSource, /aria-label="打开导航"/, '导航按钮需要可访问名称')
  assert.match(traditionalCss, /\.main-content[\s\S]*?overflow:\s*auto/, '主区不能用 overflow:hidden 裁切窄屏内容')
  assert.match(traditionalCss, /\.data-table-wrapper[\s\S]*?overflow-x:\s*auto/, '列表容器应允许横向承载固定列和操作列')
  assert.match(traditionalCss, /\.sidebar\.is-mobile-open/, '移动侧栏应有打开状态样式')
})

test('来源治理读取失败显示页面错误并提供重试，不伪装成空数据', () => {
  assert.match(source, /const sourceError\s*=\s*ref\(['"]['"]\)/)
  assert.match(source, /sourceError[\s\S]*?重试/)
  assert.match(source, /const linkError\s*=\s*ref\(['"]['"]\)/)
  assert.match(source, /!linkError[\s\S]*?暂无来源关联/)
  assert.match(source, /const reviewError\s*=\s*ref\(['"]['"]\)/)
  assert.match(source, /reviewError[\s\S]*?重试/)
})

test('审核取消不被当成接口失败，接口失败保留可重试状态', () => {
  assert.match(source, /const isUserCancel\s*=\s*\(error\)/)
  assert.match(source, /if \(isUserCancel\(error\)\) return/)
  assert.match(source, /reviewActionError/)
})

test('探究任务编辑、复制、发布和下架失败保留页面上下文及重试入口', () => {
  assert.match(learningTaskSource, /const operationError\s*=\s*ref\(['"]['"]\)/)
  assert.match(learningTaskSource, /operationError[\s\S]*?重试/)
  assert.match(learningTaskSource, /const retryOperation\s*=\s*async/)
  assert.match(learningTaskSource, /const retrySubmit\s*=\s*async[\s\S]*dialogVisible\.value\s*=\s*false/)
  assert.match(learningTaskSource, /openEdit[\s\S]*?catch \(error\)[\s\S]*?setOperationError/)
  assert.match(learningTaskSource, /copyTask[\s\S]*?catch \(error\)[\s\S]*?setOperationError/)
  assert.match(learningTaskSource, /changeStatus[\s\S]*?catch \(error\)[\s\S]*?setOperationError/)
})
