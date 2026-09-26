<template>
  <main class="learning-page">
    <div v-if="loading" class="learning-state">正在打开探究任务…</div>
    <div v-else-if="error" class="learning-state error">
      <p>{{ error }}</p>
      <button type="button" class="retry-action" @click="loadTask(route.params.taskCode)">重新加载</button>
    </div>
    <template v-else-if="task">
      <header class="learning-header">
        <div>
          <span class="learning-eyebrow">一城一课<span v-if="task.city"> · {{ task.city }}</span></span>
          <h1>{{ task.title }}</h1>
          <p v-if="task.goal">{{ task.goal }}</p>
        </div>
        <button type="button" class="export-btn" @click="exportResult">导出成果</button>
      </header>
      <section v-if="task.background" class="learning-background">{{ task.background }}</section>
      <nav class="step-nav" aria-label="学习步骤">
        <button v-for="(item, index) in steps" :key="item.type" type="button"
                :class="{ active: index === currentStep, done: index < currentStep }"
                @click="currentStep = index">
          <span>{{ index + 1 }}</span>{{ item.title || labels[item.type] }}
        </button>
      </nav>
      <div class="step-progress"><span :style="{ width: `${progress}%` }"></span></div>
      <component :is="stepComponent" v-model="answers" :step="activeStep" :resources="resources"
                 :task-code="task.taskCode" :feedbacks="feedbacks"
                 @feedback="recordFeedback" />
      <footer class="learning-actions">
        <button type="button" class="secondary-action" :disabled="currentStep === 0" @click="currentStep--">上一步</button>
        <span class="save-state">{{ savedLabel }}</span>
        <button v-if="currentStep < steps.length - 1" type="button" class="primary-action" @click="nextStep">下一步</button>
        <button v-else type="button" class="primary-action" @click="finishTask">完成并保存</button>
      </footer>
      <div v-if="completed" class="completion-note">本次探究已完成，可以导出成果后分享给老师或同学。</div>
    </template>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EvidenceStep from '../components/learning/EvidenceStep.vue'
import CompareStep from '../components/learning/CompareStep.vue'
import ReflectionStep from '../components/learning/ReflectionStep.vue'
import {
  buildLearningSubmissionPayload,
  ensureSuccessfulResponse,
  fetchPublicLearningTask,
  normalizeLearningDraft,
  parseLearningDraft,
  publicLearningSubmissionUrl,
  readLearningStorage,
  writeLearningStorage,
} from '../utils/learningTaskApi.js'
import { buildLearningExportMarkdown } from '../utils/learningExport.js'

const route = useRoute()
const task = ref(null)
const content = ref({ steps: [], resources: [] })
const answers = ref({})
const currentStep = ref(0)
const loading = ref(true)
const error = ref('')
const completed = ref(false)
const feedbacks = ref({})
const savedLabel = ref('尚未保存')
const labels = { evidence: '证据阅读', compare: '比较分析', reflection: '反思表达' }
const storageKey = computed(() => `sjg-learning:${route.params.taskCode}`)
const steps = computed(() => Array.isArray(content.value.steps) ? content.value.steps : [])
const resources = computed(() => Array.isArray(content.value.resources) ? content.value.resources : [])
const activeStep = computed(() => {
  const candidate = steps.value[currentStep.value]
  return candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ? candidate
    : { type: 'evidence', questions: [] }
})
const progress = computed(() => steps.value.length ? Math.round(((currentStep.value + 1) / steps.value.length) * 100) : 0)
const stepComponent = computed(() => ({ evidence: EvidenceStep, compare: CompareStep, reflection: ReflectionStep }[activeStep.value.type] || EvidenceStep))
let saveTimer
let loadSequence = 0

async function loadTask(taskCode = route.params.taskCode) {
  const sequence = ++loadSequence
  loading.value = true
  error.value = ''
  task.value = null
  content.value = { steps: [], resources: [] }
  answers.value = {}
  currentStep.value = 0
  completed.value = false
  feedbacks.value = {}
  savedLabel.value = '尚未保存'
  clearTimeout(saveTimer)

  try {
    const loaded = await fetchPublicLearningTask(fetch, taskCode)
    if (sequence !== loadSequence) return

    const { task: nextTask, content: nextContent } = loaded
    task.value = nextTask
    content.value = nextContent

    const saved = readLearningStorage(`sjg-learning:${taskCode}`)
    const draft = parseLearningDraft(saved)
    if (draft) {
      const restored = normalizeLearningDraft(draft, steps.value.length)
      answers.value = restored.answers
      currentStep.value = restored.currentStep
      completed.value = draft.completed === true
      feedbacks.value = restored.feedbacks
      savedLabel.value = '已恢复本机草稿'
    }
  } catch (e) {
    if (sequence !== loadSequence) return
    error.value = e.message || '任务暂时无法打开'
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}

watch(() => route.params.taskCode, loadTask, { immediate: true })

watch([answers, currentStep, completed, feedbacks], () => {
  if (!task.value) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const persisted = writeLearningStorage(storageKey.value, JSON.stringify({ answers: answers.value, currentStep: currentStep.value, completed: completed.value, feedbacks: feedbacks.value }))
    savedLabel.value = persisted ? '草稿已保存' : '本机暂不可保存'
  }, 250)
}, { deep: true })

const nextStep = () => {
  if (!steps.value.length) return
  currentStep.value = Math.min(currentStep.value + 1, steps.value.length - 1)
}
const recordFeedback = ({ questionId, content } = {}) => {
  if ((typeof questionId !== 'string' && typeof questionId !== 'number') || typeof content !== 'string') return
  feedbacks.value = { ...feedbacks.value, [questionId]: content }
}
const finishTask = async () => {
  completed.value = true
  await saveRemote('submitted')
}
const saveRemote = async (status) => {
  if (!task.value) return
  try {
    const sessionKey = readLearningStorage('sjg-learning-session')
      || globalThis.crypto?.randomUUID?.()
      || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    writeLearningStorage('sjg-learning-session', sessionKey)
    const response = await fetch(publicLearningSubmissionUrl(task.value.taskCode), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildLearningSubmissionPayload({
        sessionKey,
        answers: answers.value,
        currentStep: currentStep.value,
        status,
      })),
    })
    await ensureSuccessfulResponse(response)
    savedLabel.value = '成果已同步'
  } catch {
    const persisted = writeLearningStorage(storageKey.value, JSON.stringify({ answers: answers.value, currentStep: currentStep.value, completed: completed.value, feedbacks: feedbacks.value }))
    savedLabel.value = persisted ? '已保存本机草稿' : '同步失败，本机也无法保存'
  }
}
const exportResult = () => {
  if (!task.value) return
  const markdown = buildLearningExportMarkdown({
    task: task.value,
    steps: steps.value,
    resources: resources.value,
    answers: answers.value,
    feedbacks: feedbacks.value,
  })
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${task.value.taskCode}-学习成果.md`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.learning-page { max-width: 980px; margin: 0 auto; padding: 42px 24px 80px; color: var(--text-primary); }
.learning-state { min-height: 50vh; display: grid; place-items: center; color: var(--text-secondary); }
.learning-state.error { color: var(--accent); }
.learning-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; border-bottom: 1px solid var(--border-light); padding-bottom: 28px; }
.learning-eyebrow, .step-kicker, .resource-type { color: var(--accent); font-size: 12px; letter-spacing: 2px; }
.learning-header h1 { margin: 10px 0; font-family: var(--font-display); font-size: clamp(30px, 5vw, 52px); }
.learning-header p, .learning-background, .step-prompt { color: var(--text-secondary); line-height: 1.8; }
.export-btn, .primary-action, .secondary-action, .feedback-action, .retry-action { border: 1px solid var(--accent); border-radius: 4px; padding: 9px 14px; cursor: pointer; background: transparent; color: var(--accent); }
.primary-action { background: var(--accent); color: #fff; }
.export-btn:hover, .secondary-action:hover, .feedback-action:hover, .retry-action:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }
.learning-background { margin: 24px 0; padding: 18px 20px; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 5%, transparent); }
.step-nav { display: flex; gap: 8px; margin: 28px 0 8px; overflow-x: auto; }
.step-nav button { border: 0; background: transparent; color: var(--text-muted); padding: 10px 12px; cursor: pointer; white-space: nowrap; }
.step-nav button span { display: inline-grid; place-items: center; width: 26px; height: 26px; margin-right: 7px; border: 1px solid currentColor; border-radius: 50%; }
.step-nav button.active { color: var(--accent); font-weight: 700; }
.step-nav button.done { color: var(--text-secondary); }
.step-progress { height: 2px; background: var(--border-light); margin-bottom: 34px; }
.step-progress span { display: block; height: 100%; background: var(--accent); transition: width .25s ease; }
.learning-step h2 { margin: 10px 0; font-family: var(--font-display); font-size: 28px; }
.resource-list, .question-list, .compare-grid { display: grid; gap: 14px; margin-top: 24px; }
.resource-item { display: flex; justify-content: space-between; gap: 18px; padding: 16px; border: 1px solid var(--border-light); background: var(--card-bg); min-width: 0; }
.resource-item h3 { margin: 6px 0; overflow-wrap: anywhere; }
.resource-item p { margin: 0; color: var(--text-secondary); line-height: 1.6; }
.resource-item a { color: var(--accent); white-space: normal; }
.question-item, .compare-item, .reflection-item { display: grid; gap: 8px; }
.question-item span, .compare-item h3, .reflection-item label { font-weight: 600; line-height: 1.6; }
textarea { width: 100%; box-sizing: border-box; resize: vertical; border: 1px solid var(--border); border-radius: 4px; padding: 12px; background: var(--card-bg); color: var(--text-primary); line-height: 1.7; font: inherit; }
.compare-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.question-hint { color: var(--text-muted); font-size: 13px; }
.feedback-action { justify-self: start; }
.ai-feedback { margin-top: 12px; padding: 14px; border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 5%, transparent); line-height: 1.7; }
.learning-actions { display: flex; align-items: center; gap: 12px; margin-top: 36px; border-top: 1px solid var(--border-light); padding-top: 20px; }
.save-state { margin-right: auto; color: var(--text-muted); font-size: 13px; }
.completion-note { margin-top: 18px; color: var(--text-secondary); }
@media (max-width: 680px) { .learning-page { padding: 28px 16px 56px; } .learning-header { display: block; } .export-btn { margin-top: 16px; } .compare-grid { grid-template-columns: 1fr; } .learning-actions { flex-wrap: wrap; } .save-state { order: 3; width: 100%; } }
</style>
