<template>
  <div class="empty">
    <p class="empty__icon">{{ icon }}</p>
    <p class="empty__text">{{ message }}</p>
    <p v-if="hint" class="empty__hint">{{ hint }}</p>
    <slot />
  </div>
</template>

<script setup>
// 统一空态：主题化印章单字 + 文案 + 可选引导语/动作插槽
// 与 ErrorState 同族设计语言（var(--accent) 印章字 40% 透明度）
defineProps({
  icon: { type: String, default: '空' },
  message: { type: String, default: '此处暂无内容' },
  hint: { type: String, default: '' },
})
</script>

<style scoped>
.empty {
  text-align: center;
  padding: 56px 20px;
}
.empty__icon {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.4;
  margin: 0 0 14px 0;
  line-height: 1;
}
.empty__text {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}
.empty__hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 1px;
}
</style>
