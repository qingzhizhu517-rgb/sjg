<template>
  <div class="empty" :class="{ 'empty--compact': compact }" :role="compact ? 'status' : undefined">
    <svg v-if="!compact" class="empty__brush" viewBox="0 0 120 48" aria-hidden="true">
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
    <div v-if="$slots.default" class="empty__actions"><slot /></div>
  </div>
</template>

<script setup>
// 统一空态：水墨远山 SVG(单笔) + 主题化印章单字 + 文案 + 可选引导语/动作插槽
// 与 ErrorState 同族设计语言（var(--accent) 印章字 40% 透明度）
defineProps({
  icon: { type: String, default: '空' },
  message: { type: String, default: '此处暂无内容' },
  hint: { type: String, default: '' },
  compact: { type: Boolean, default: false },
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
.empty__actions { margin-top: var(--sp-4); }
.empty--compact {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  gap: var(--sp-2) var(--sp-4);
  align-items: center;
  padding: var(--sp-5) 0;
  text-align: left;
}
.empty--compact .empty__icon { grid-column: 1; grid-row: 1 / 3; margin: 0; font-size: 28px; font-weight: 600; opacity: .8; }
.empty--compact .empty__text { grid-column: 2; margin: 0; font-size: var(--fs-body); letter-spacing: 0; }
.empty--compact .empty__hint { grid-column: 2; margin: 0; font-size: var(--fs-meta); letter-spacing: 0; line-height: 1.8; }
.empty--compact .empty__actions { grid-column: 3; grid-row: 1 / 3; margin: 0; }
@media (max-width: 600px) { .empty--compact { grid-template-columns: 28px minmax(0, 1fr); } .empty--compact .empty__actions { grid-column: 2; grid-row: auto; } }
</style>
