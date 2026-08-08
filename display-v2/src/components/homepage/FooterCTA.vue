<template>
  <section class="footer-cta" :class="`footer-cta--${theme}`">
    <div class="footer-cta__inner">
      <span class="footer-cta__seal">{{ theme === 'inkwash' ? '文' : '览' }}</span>
      <h2 class="footer-cta__title">{{ title }}</h2>
      <p class="footer-cta__sub">{{ subtitle }}</p>
      <button class="footer-cta__btn" @click="$emit('cta')">
        <span>{{ btnText }}</span>
        <span class="footer-cta__arrow">↑</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'

const { theme } = useTheme()

defineProps({
  title: { type: String, default: '沿河而下，发现更多' },
  subtitle: { type: String, default: '齐鲁文脉，千年不绝' },
  btnText: { type: String, default: '返回山河图志' },
})

defineEmits(['cta'])
</script>

<style scoped>
.footer-cta {
  padding: 80px 24px 100px;
  text-align: center;
}

.footer-cta--real {
  background: linear-gradient(to bottom, transparent 0%, rgba(212, 175, 55, 0.06) 60%, rgba(212, 175, 55, 0.12) 100%);
}

.footer-cta--inkwash {
  background: linear-gradient(to bottom, transparent 0%, rgba(158, 43, 37, 0.04) 60%, rgba(158, 43, 37, 0.08) 100%);
}

.footer-cta__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-cta__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 50%;
  opacity: 0.4;
  margin-bottom: 8px;
}

.footer-cta__title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 900;
  letter-spacing: 4px;
  color: var(--text-primary);
  margin: 0;
}

.footer-cta__sub {
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin: 0;
}

.footer-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 14px 36px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.footer-cta__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.footer-cta__arrow {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.footer-cta__btn:hover .footer-cta__arrow {
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .footer-cta {
    padding: 56px 16px 72px;
  }
}
</style>
