<template>
  <div class="timeline-page">
    <!-- HERO -->
    <header class="page-hero">
      <div class="hero-inner">
        <span class="hero-eyebrow">— 历 朝 年 轮 —</span>
        <h1 class="page-title">文脉长河</h1>
        <p class="page-desc">沿着历史的河流，见证诗与时代的交响。从诗经楚辞到唐诗宋词，<br class="hero-break" />齐鲁文脉一脉相承又各具风姿。</p>

        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">8</span>
            <span class="stat-lbl">朝代</span>
          </div>
          <span class="stat-divider"></span>
          <div class="stat">
            <span class="stat-num">50<span class="stat-plus">+</span></span>
            <span class="stat-lbl">历史事件</span>
          </div>
          <span class="stat-divider"></span>
          <div class="stat">
            <span class="stat-num">6</span>
            <span class="stat-lbl">代表诗人</span>
          </div>
          <span class="stat-divider"></span>
          <div class="stat">
            <span class="stat-num">8</span>
            <span class="stat-lbl">传世名篇</span>
          </div>
        </div>
      </div>
      <div class="hero-rule"></div>
    </header>

    <!-- MAIN -->
    <div class="timeline-container">
      <div class="timeline-axis" aria-hidden="true">
        <span class="axis-tick" v-for="i in 8" :key="i"></span>
      </div>
      <div class="timeline-track">
        <TimelineItem
          v-for="item in timeline"
          :key="item.dynasty.id"
          :dynasty="item.dynasty"
          :events="item.events"
          :poets="item.poets"
          :poems="item.poems"
        />
      </div>
    </div>

    <div v-if="errorMsg" class="error-state">
      <div class="error-content">
        <p class="error-icon">!</p>
        <p class="error-text">{{ errorMsg }}</p>
        <button class="error-retry-btn" @click="loadTimeline">重新加载</button>
      </div>
    </div>

    <div v-else-if="!timeline.length && loaded" class="empty-state">
      <p>暂无朝代数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import TimelineItem from '../components/TimelineItem.vue'

const timeline = ref([])
const loaded = ref(false)
const errorMsg = ref(null)

const loadTimeline = async () => {
  errorMsg.value = null
  try {
    timeline.value = await api.get('/timeline')
  } catch (err) {
    console.error('加载朝代时间线失败:', err)
    errorMsg.value = '加载朝代数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

onMounted(() => {
  loadTimeline()
})
</script>

<style scoped>
/* ============================================
   TIMELINE PAGE — Typeset 2026
   ============================================ */

.timeline-page {
  max-width: 880px;
  margin: 0 auto;
  padding: 0 32px 96px;
}

/* ---------- HERO ---------- */
.page-hero {
  position: relative;
  padding: 80px 0 64px;
  text-align: center;
}

.hero-inner {
  position: relative;
  z-index: 2;
}

.hero-eyebrow {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 6px;
  color: var(--accent);
  margin-bottom: 20px;
  text-indent: 6px; /* compensate for trailing letter-spacing */
}

.page-title {
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;            /* tighter than before (was 8px) */
  line-height: 1.1;
  margin: 0 0 20px 0;
}

.page-desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin: 0 auto 36px;
  max-width: 560px;
  text-align: center;
}

.hero-break { display: none; }

/* Stats row */
.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 32px;
  padding: 18px 36px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 6px 20px rgba(61, 43, 31, 0.04);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0;
}

.stat-plus {
  font-size: 18px;
  color: var(--accent);
  font-weight: 600;
  margin-left: 1px;
}

.stat-lbl {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 2px;
  margin-top: 6px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}

/* Hero bottom rule: brush-stroke feel via gradient dashes */
.hero-rule {
  position: relative;
  margin: 56px auto 0;
  width: 100%;
  max-width: 720px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0,
    transparent 4%,
    var(--border) 4%,
    var(--border) 8%,
    transparent 8%,
    transparent 18%,
    var(--border) 18%,
    var(--border) 22%,
    transparent 22%,
    transparent 100%
  );
}

/* ---------- TIMELINE BODY ---------- */
.timeline-container {
  position: relative;
  padding-left: 40px;
  margin-top: 8px;
}

/* Subtle dotted ruler next to the axis for visual depth */
.timeline-axis {
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 48px;
  width: 1px;
  background-image: linear-gradient(
    to bottom,
    var(--border) 0,
    var(--border) 4px,
    transparent 4px,
    transparent 12px
  );
  background-size: 1px 12px;
  background-repeat: repeat-y;
  opacity: 0.45;
  pointer-events: none;
}

.axis-tick {
  display: none;
}

.timeline-track {
  position: relative;
}

/* ---------- STATES ---------- */
.empty-state {
  text-align: center;
  padding: 96px 0;
  color: var(--text-muted);
  font-size: 15px;
  letter-spacing: 1px;
}

.error-state {
  text-align: center;
  padding: 96px 0;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  font-size: 48px;
  font-weight: 900;
  color: var(--accent);
  margin-bottom: 16px;
  opacity: 0.6;
  line-height: 1;
}

.error-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.error-retry-btn {
  font-size: 13px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  padding: 10px 24px;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.error-retry-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

/* ============================================
   RESPONSIVE — three tiers
   ============================================ */

/* Tablet portrait: tighten padding, keep single column */
@media (max-width: 1024px) {
  .timeline-page { padding: 0 24px 80px; }
  .page-hero { padding: 64px 0 48px; }
  .page-title { font-size: 44px; letter-spacing: 3px; }
  .hero-stats { gap: 24px; padding: 16px 24px; }
  .stat-num { font-size: 24px; }
  .timeline-container { padding-left: 32px; }
}

/* Mobile: stack stats, smaller title, axis narrower */
@media (max-width: 640px) {
  .timeline-page { padding: 0 16px 64px; }
  .page-hero { padding: 48px 0 36px; }
  .hero-eyebrow { font-size: 11px; letter-spacing: 4px; margin-bottom: 14px; }
  .page-title { font-size: 34px; letter-spacing: 2px; }
  .page-desc { font-size: 14px; line-height: 1.8; margin-bottom: 28px; }
  .hero-break { display: inline; }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 0;
    padding: 16px;
    width: 100%;
  }
  .stat-divider { display: none; }
  .hero-rule { margin-top: 40px; }
  .timeline-container { padding-left: 24px; }
  .timeline-axis { left: 6px; }
}
</style>
