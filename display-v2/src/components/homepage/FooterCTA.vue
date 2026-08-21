<template>
  <section class="footer-cta">
    <div class="footer-cta__inner">
      <span class="footer-cta__seal">文</span>
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
defineProps({
  title: { type: String, default: '沿河而下，发现更多' },
  subtitle: { type: String, default: '齐鲁文脉，千年不绝' },
  btnText: { type: String, default: '返回山河图志' },
})

defineEmits(['cta'])
</script>

<style scoped>
.footer-cta {
  padding: var(--sp-9) var(--sp-5);
  text-align: center;
  background: linear-gradient(to bottom, transparent 0%, var(--accent-a1) 100%);
}

.footer-cta__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
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
  margin-bottom: var(--sp-2);
}

.footer-cta__title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--text-primary);
  margin: 0;
}

.footer-cta__sub {
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
  letter-spacing: 2px;
  margin: 0;
}

.footer-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-4);
  padding: var(--sp-3) var(--sp-7);
  font-family: var(--font-heading);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-on-accent);
  background: var(--accent);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.footer-cta__btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
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
    padding: var(--sp-7) var(--sp-4);
  }
}
</style>
