<template>
  <section class="learning-step">
    <div class="step-kicker">证据阅读</div>
    <h2>{{ step.title || '先看材料，再形成判断' }}</h2>
    <p v-if="step.prompt" class="step-prompt">{{ step.prompt }}</p>
    <div class="resource-list" v-if="resources.length">
      <article v-for="resource in resources" :key="resource.id || resource.entityId" class="resource-item">
        <div>
          <span class="resource-type">{{ resource.entityType || '资料' }}</span>
          <h3>{{ resource.title }}</h3>
          <p v-if="resource.snippet">{{ resource.snippet }}</p>
          <p v-if="Array.isArray(resource.sourceIds) && resource.sourceIds.length" class="resource-sources">
            来源 ID：{{ resource.sourceIds.join('、') }}
          </p>
        </div>
        <a v-if="safePath(resource.path)" :href="safePath(resource.path)" rel="noopener noreferrer">打开条目</a>
      </article>
    </div>
    <div class="question-list">
      <label v-for="question in step.questions || []" :key="question.id" class="question-item">
        <span>{{ question.prompt }}</span>
        <textarea :value="modelValue[question.id] || ''" rows="3"
                  placeholder="用一两句话记录你从材料中看到的事实"
                  @input="update(question.id, $event.target.value)" />
      </label>
    </div>
  </section>
</template>

<script setup>
import { safeLearningResourcePath } from '../../utils/learningTaskApi.js'

const props = defineProps({
  step: { type: Object, required: true },
  resources: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
const update = (id, value) => emit('update:modelValue', { ...props.modelValue, [id]: value })
const safePath = (value) => safeLearningResourcePath(value)
</script>

<style scoped>
.resource-sources { margin: 8px 0 0; color: var(--text-muted); font-size: 12px; line-height: 1.5; }
</style>
