<!-- display-v2/src/components/craft/KnowledgeCard.vue -->
<!-- 部件知识点卡：hover/click 部件弹出 -->
<template>
  <Transition name="kcard">
    <aside
      v-if="active"
      class="kcard"
      :class="{ 'kcard--anime': isAnime }"
      role="complementary"
      :aria-label="`${info.title} 知识点`"
    >
      <button class="kcard__close" aria-label="关闭" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="kcard__seal">知</div>
      <h4 class="kcard__title">{{ info.title }}</h4>
      <p class="kcard__body">{{ info.body }}</p>
    </aside>
  </Transition>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'

defineProps({
  info: { type: Object, default: null },
  active: { type: Boolean, default: false },
})

defineEmits(['close'])

const { isAnime } = useTheme()
</script>

<style scoped>
.kcard {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: min(280px, calc(100% - 2rem));
  padding: 1.25rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border-radius: 12px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10;
  backdrop-filter: blur(12px);
}

.kcard__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--text-muted, #A0896C);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
}

.kcard__close:hover {
  color: var(--text-primary, #2D2D2D);
}

.kcard__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--accent, #C5A55A);
  color: #fff;
  font-size: 0.75rem;
  font-family: var(--font-heading, serif);
  margin-bottom: 0.5rem;
}

.kcard__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-heading, serif);
  color: var(--text-primary, #2D2D2D);
}

.kcard__body {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-secondary, #666);
}

/* 水墨主题 */
.kcard--anime {
  background: var(--card-bg, rgba(245, 240, 232, 0.95));
  border-color: var(--accent, #8B7355);
}

/* 过渡动画 */
.kcard-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.kcard-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.kcard-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.kcard-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 768px) {
  .kcard {
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
  }
}
</style>
