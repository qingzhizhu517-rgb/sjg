<!-- display-v2/src/components/craft/StepRail.vue -->
<!-- 工序步骤条：步骤图标 + 名称 + 进度印 + 上一步/下一步 + 自动播放 -->
<template>
  <nav class="step-rail" :class="{ 'step-rail--anime': isAnime }" aria-label="工序步骤">
    <!-- 步骤列表 -->
    <ol class="step-rail__steps">
      <li
        v-for="(step, i) in steps"
        :key="step.key"
        class="step-rail__item"
        :class="{
          'step-rail__item--active': i === currentStep,
          'step-rail__item--done': i < currentStep,
        }"
        :aria-current="i === currentStep ? 'step' : undefined"
      >
        <button
          class="step-rail__btn"
          :title="step.name"
          @click="$emit('jumpTo', i)"
        >
          <span class="step-rail__icon">{{ step.icon }}</span>
          <span class="step-rail__name">{{ step.name }}</span>
        </button>
        <!-- 连接线 -->
        <span v-if="i < steps.length - 1" class="step-rail__line" />
      </li>
    </ol>

    <!-- 控制栏 -->
    <div class="step-rail__controls">
      <button
        class="step-rail__ctrl"
        :disabled="currentStep <= 0"
        aria-label="上一步"
        @click="$emit('prev')"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <button
        class="step-rail__ctrl step-rail__ctrl--play"
        :aria-label="playing ? '暂停' : '自动播放'"
        @click="$emit('toggleAuto')"
      >
        <svg v-if="!playing" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4L16 10L6 16V4Z" fill="currentColor"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="4" width="3" height="12" rx="1" fill="currentColor"/><rect x="12" y="4" width="3" height="12" rx="1" fill="currentColor"/></svg>
      </button>

      <button
        class="step-rail__ctrl"
        :disabled="currentStep >= steps.length - 1"
        aria-label="下一步"
        @click="$emit('next')"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <!-- 当前步骤解说 -->
    <p v-if="stepMeta" class="step-rail__desc">
      <span class="step-rail__desc-icon">{{ stepMeta.icon }}</span>
      {{ stepMeta.desc }}
    </p>
  </nav>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'

defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  stepMeta: { type: Object, default: null },
  playing: { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'toggleAuto', 'jumpTo'])

const { isAnime } = useTheme()
</script>

<style scoped>
.step-rail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.step-rail__steps {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
}

.step-rail__item {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-rail__item:last-child {
  flex: 0;
}

.step-rail__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 8px;
  transition: background 0.2s;
  color: var(--text-muted, #A0896C);
}

.step-rail__btn:hover {
  background: var(--hover-bg, rgba(0, 0, 0, 0.04));
}

.step-rail__item--active .step-rail__btn {
  color: var(--accent, #C5A55A);
}

.step-rail__item--done .step-rail__btn {
  color: var(--text-secondary, #6B8E4E);
}

.step-rail__icon {
  font-size: 1.25rem;
  font-family: var(--font-heading, serif);
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid currentColor;
  transition: all 0.3s;
}

.step-rail__item--active .step-rail__icon {
  background: var(--accent, #C5A55A);
  color: #fff;
  border-color: var(--accent, #C5A55A);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(197, 165, 90, 0.25));
}

.step-rail__item--done .step-rail__icon {
  background: var(--text-secondary, #6B8E4E);
  color: #fff;
  border-color: var(--text-secondary, #6B8E4E);
}

.step-rail__name {
  font-size: 0.75rem;
  white-space: nowrap;
}

.step-rail__line {
  flex: 1;
  height: 2px;
  background: var(--border, rgba(0, 0, 0, 0.12));
  margin: 0 0.25rem;
  align-self: flex-start;
  margin-top: 1.5rem;
  transition: background 0.3s;
}

.step-rail__item--done + .step-rail__item .step-rail__line,
.step-rail__item--done .step-rail__line {
  background: var(--text-secondary, #6B8E4E);
}

/* 控制栏 */
.step-rail__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.step-rail__ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.12));
  background: var(--card-bg, #fff);
  color: var(--text-primary, #2D2D2D);
  cursor: pointer;
  transition: all 0.2s;
}

.step-rail__ctrl:hover:not(:disabled) {
  background: var(--accent, #C5A55A);
  color: #fff;
  border-color: var(--accent, #C5A55A);
}

.step-rail__ctrl:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.step-rail__ctrl--play {
  width: 2.75rem;
  height: 2.75rem;
  border-color: var(--accent, #C5A55A);
  color: var(--accent, #C5A55A);
}

.step-rail__ctrl--play:hover {
  background: var(--accent, #C5A55A);
  color: #fff;
}

/* 解说文案 */
.step-rail__desc {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-secondary, #666);
  background: var(--desc-bg, rgba(0, 0, 0, 0.02));
  border-radius: 8px;
  border-left: 3px solid var(--accent, #C5A55A);
}

.step-rail__desc-icon {
  font-family: var(--font-heading, serif);
  font-size: 1rem;
  margin-right: 0.25rem;
  color: var(--accent, #C5A55A);
}

/* 移动端 */
@media (max-width: 768px) {
  .step-rail__name {
    display: none;
  }

  .step-rail__icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1rem;
  }

  .step-rail__line {
    margin-top: 1.1rem;
  }

  .step-rail__desc {
    font-size: 0.8125rem;
  }
}
</style>
