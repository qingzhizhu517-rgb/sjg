import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const viewSource = fs.readFileSync(new URL('../src/views/LearningTaskView.vue', import.meta.url), 'utf8')
const componentSource = fs.readFileSync(new URL('../src/components/learning/ReflectionStep.vue', import.meta.url), 'utf8')

test('学习任务把按题目保存的反馈传给反思步骤', () => {
  assert.match(viewSource, /:feedbacks="feedbacks"/)
  assert.match(componentSource, /feedbacks:\s*\{\s*type:\s*Object/)
})

test('反思步骤按 question id 展示反馈，避免多个问题串用同一条反馈', () => {
  assert.match(componentSource, /feedbackFor\(question\.id\)/)
  assert.doesNotMatch(componentSource, /v-if="feedback"/)
})

test('反思步骤声明 feedback 事件作为父子组件契约', () => {
  assert.match(componentSource, /defineEmits\(\[[^\]]*['"]feedback['"]/) 
})

test('重新请求反馈时，空的本地值不会回退显示旧反馈', () => {
  assert.match(componentSource, /hasOwnProperty\.call\(localFeedbacks\.value, questionId\)/)
})

test('反思反馈只提交题目 ID 和回答，不信任客户端证据文本', () => {
  assert.match(componentSource, /questionId:\s*question\.id/)
  assert.doesNotMatch(componentSource, /evidence:\s*formatEvidenceForQuestion/)
})

test('反思输入和 Markdown 渲染都经过字符串边界归一化', () => {
  assert.match(componentSource, /answerFor\s*=.*normalizeTextMap\(props\.modelValue\)/s)
  assert.match(componentSource, /marked\.parse\(normalizeLearningText\(value\)\)/)
  assert.match(componentSource, /normalizeTextMap\(props\.feedbacks\)/)
})
