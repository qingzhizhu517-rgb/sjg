<template>
  <div class="empty">
    <svg class="empty__brush" viewBox="0 0 120 48" aria-hidden="true">
      <!-- 单笔水墨远山: 一笔拖出两个山包, 笔锋收尾 -->
      <path
        d="M8,36 C26,18 34,20 48,30 C64,41 74,14 90,24 C100,30 108,30 116,27"
        fill="none"
        stroke="currentColor"
        stroke-width="7"
        stroke-linecap="round"
        opacity="0.75"
      />
      <path
        d="M20,40 C40,30 66,34 100,33"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.4"
      />
    </svg>
    <p class="empty__icon">{{ icon }}</p>
    <p class="empty__text">{{ message }}</p>
    <p v-if="hint" class="empty__hint">{{ hint }}</p>
    <slot />
  </div>
</template>

<script setup>
// 统一空态：水墨远山 SVG(单笔) + 主题化印章单字 + 文案 + 可选引导语/动作插槽
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
.empty__brush {
  display: block;
  width: 120px;
  height: 48px;
  margin: 0 auto 10px;
  color: var(--text-muted);
  opacity: 0.55;
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
