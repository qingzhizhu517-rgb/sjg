<template>
  <section class="learning-step">
    <div class="step-kicker">反思表达</div>
    <h2>{{ step.title || '说出你的判断' }}</h2>
    <p v-if="step.prompt" class="step-prompt">{{ step.prompt }}</p>
    <div v-for="question in step.questions || []" :key="question.id" class="reflection-item">
      <label>{{ question.prompt }}</label>
      <textarea :value="answerFor(question.id)" rows="7"
                placeholder="写下你的判断，并注明依据来自哪份材料"
                @input="update(question.id, $event.target.value)" />
      <button type="button" class="feedback-action" :disabled="loading || !answerFor(question.id).trim()"
              @click="requestFeedback(question, answerFor(question.id))">
        {{ loading ? '正在阅读你的回答…' : '请 AI 指出遗漏的证据' }}
      </button>
      <div v-if="feedbackFor(question.id)" class="ai-feedback" v-html="renderFeedback(feedbackFor(question.id))"></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { consumeSseBuffer } from '../../utils/sse.js'
import { normalizeLearningText, normalizeTextMap } from '../../utils/learningTaskApi.js'

const props = defineProps({
  step: { type: Object, required: true },
  modelValue: { type: Object, default: () => ({}) },
  feedbacks: { type: Object, default: () => ({}) },
  resources: { type: Array, default: () => [] },
  taskCode: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'feedback'])
const loading = ref(false)
const localFeedbacks = ref(normalizeTextMap(props.feedbacks))
const answerFor = (questionId) => normalizeLearningText(normalizeTextMap(props.modelValue)[questionId])
const update = (id, value) => emit('update:modelValue', { ...normalizeTextMap(props.modelValue), [id]: normalizeLearningText(value) })
const renderFeedback = (value) => DOMPurify.sanitize(marked.parse(normalizeLearningText(value)))
const feedbackFor = (questionId) => Object.prototype.hasOwnProperty.call(localFeedbacks.value, questionId)
  ? normalizeLearningText(localFeedbacks.value[questionId])
  : normalizeLearningText(normalizeTextMap(props.feedbacks)[questionId])

const requestFeedback = async (question, answer) => {
  const normalizedAnswer = normalizeLearningText(answer)
  if (!question || (typeof question.id !== 'string' && typeof question.id !== 'number') || !normalizedAnswer.trim()) return
  loading.value = true
  localFeedbacks.value = { ...localFeedbacks.value, [question.id]: '' }
  try {
    const response = await fetch(`/api/public/learning-tasks/${encodeURIComponent(props.taskCode)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        questionId: question.id,
        answer: normalizedAnswer,
      }),
    })
    if (!response.ok || !response.body) throw new Error('feedback unavailable')
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    const handleEvent = (data) => {
      if (!data || data === '[DONE]') return
      try {
        const payload = JSON.parse(data)
        if (!payload || typeof payload !== 'object') return
        if (typeof payload.delta === 'string') localFeedbacks.value[question.id] += payload.delta
        if (typeof payload.error === 'string') localFeedbacks.value[question.id] += `\n\n${payload.error}`
      } catch { /* 忽略非 JSON 数据块 */ }
    }
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        consumeSseBuffer(buffer, true).events.forEach(handleEvent)
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const parsed = consumeSseBuffer(buffer)
      parsed.events.forEach(handleEvent)
      buffer = parsed.rest
    }
    emit('feedback', { questionId: question.id, content: normalizeLearningText(localFeedbacks.value[question.id]) })
  } catch {
    localFeedbacks.value[question.id] = '暂时无法获取 AI 反馈，请根据材料自行检查引用是否完整。'
    emit('feedback', { questionId: question.id, content: normalizeLearningText(localFeedbacks.value[question.id]) })
  } finally {
    loading.value = false
  }
}
</script>
