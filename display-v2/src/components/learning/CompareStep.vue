<template>
  <section class="learning-step">
    <div class="step-kicker">比较分析</div>
    <h2>{{ step.title || '把两份材料放在一起看' }}</h2>
    <p v-if="step.prompt" class="step-prompt">{{ step.prompt }}</p>
    <div class="compare-grid">
      <article v-for="question in step.questions || []" :key="question.id" class="compare-item">
        <h3>{{ question.prompt }}</h3>
        <p v-if="question.hint" class="question-hint">{{ question.hint }}</p>
        <textarea :value="modelValue[question.id] || ''" rows="5"
                  placeholder="至少引用一条材料，再写你的比较"
                  @input="update(question.id, $event.target.value)" />
      </article>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  step: { type: Object, required: true },
  modelValue: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
const update = (id, value) => emit('update:modelValue', { ...props.modelValue, [id]: value })
</script>
