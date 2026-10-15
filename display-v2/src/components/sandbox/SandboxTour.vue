<template>
  <section v-if="engine.tour.status !== 'idle'" class="sandbox-tour" aria-label="九城巡游控制">
    <div class="sandbox-tour__station" role="status" aria-live="polite" aria-atomic="true">
      <span class="sandbox-tour__count">{{ String(engine.tour.index + 1).padStart(2, '0') }} / 09</span>
      <strong>{{ engine.tour.city }}</strong>
      <span>{{
        engine.tour.status === 'complete'
          ? '巡游结束'
          : engine.tour.status === 'playing'
            ? '沿黄九城 · 巡游中'
            : '已暂停 · 自在观览'
      }}</span>
    </div>
    <div class="sandbox-tour__actions" role="group" aria-label="巡游站点">
      <button type="button" :disabled="engine.tour.index === 0" @click="engine.moveTour(-1)">上一站</button>
      <button
        type="button"
        :disabled="engine.tour.status === 'paused' && !engine.tourCanPlay"
        @click="engine.toggleTour()"
      >
        {{
          engine.tour.status === 'playing'
            ? '暂停巡游'
            : engine.tour.status === 'complete'
              ? '重新巡游'
              : '继续巡游'
        }}
      </button>
      <button
        type="button"
        :disabled="engine.tour.index === engine.tour.total - 1"
        @click="engine.moveTour(1)"
      >
        下一站
      </button>
      <button type="button" @click="engine.stopTour()">结束</button>
    </div>
    <p v-if="!engine.tourCanPlay">已关闭动态效果，可用上一站、下一站手动浏览。</p>
  </section>
</template>
<script setup>
defineProps({ engine: { type: Object, required: true } })
</script>
<style scoped>
.sandbox-tour {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 24px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.sandbox-tour__station {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
}
.sandbox-tour__count {
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  color: var(--accent-dark);
}
strong {
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: 3px;
}
.sandbox-tour__actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
button {
  font: inherit;
  font-size: 12px;
  padding: 6px 10px;
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-primary);
  background: var(--bg-primary);
  cursor: pointer;
}
button:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent-dark);
}
button:disabled {
  opacity: 0.45;
  cursor: default;
}
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
p {
  flex-basis: 100%;
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
}
@media (max-width: 600px) {
  .sandbox-tour {
    padding: 10px;
    gap: 8px;
  }
  .sandbox-tour__actions {
    margin-left: 0;
    width: 100%;
  }
  button {
    flex: 1;
    min-height: 42px;
    padding: 6px;
  }
}
</style>
