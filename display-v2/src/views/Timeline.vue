<template>
  <div class="timeline-page">
    <InkHero
      eyebrow="朝代年轮"
      title="文脉长河"
      subtitle="沿着历史的河流，见证诗与时代的交响。"
      :stats="heroStats"
    />

    <div ref="revealRoot" class="timeline-content">
      <!-- 朝代年轮选择器 -->
      <section class="tl-section" data-reveal>
        <SectionHeading
          title="朝代年轮"
          subtitle="点选朝代，纵览其史事、名士与诗篇"
        />
        <DynastyRail
          v-model="selectedDynastyId"
          :dynasties="dynastyItems"
          aria-label="朝代年轮"
        />
      </section>

      <!-- 选中朝代详情 -->
      <section v-if="selected" :key="selected.dynasty.id" class="tl-section tl-detail" data-reveal>
        <header class="tl-detail-head">
          <div class="tl-detail-title-row">
            <h2 class="tl-detail-name">{{ selected.dynasty.name }}</h2>
            <span class="tl-detail-years">{{ formatYear(selected.dynasty.startYear) }} — {{ formatYear(selected.dynasty.endYear) }}</span>
          </div>
          <p v-if="selected.dynasty.description" class="tl-detail-desc">{{ selected.dynasty.description }}</p>
          <div class="tl-detail-stats">
            <span><b>{{ selected.poets.length }}</b> 位名士</span>
            <span class="tl-detail-sep">·</span>
            <span><b>{{ selected.poems.length }}</b> 篇诗卷</span>
            <span class="tl-detail-sep">·</span>
            <span><b>{{ selected.events.length }}</b> 件史事</span>
          </div>
        </header>

        <div class="tl-detail-grid">
          <!-- 史事 -->
          <div class="tl-col">
            <h3 class="tl-col-title"><span class="tl-col-icon">事</span>历史事件</h3>
            <div v-if="selected.events.length" class="tl-events">
              <div v-for="ev in selected.events" :key="ev.id" class="tl-event">
                <span class="tl-event-year">{{ ev.year != null ? formatYear(ev.year) : '—' }}</span>
                <div class="tl-event-body">
                  <p class="tl-event-title">{{ ev.title }}</p>
                  <p v-if="ev.significance" class="tl-event-sig">{{ ev.significance }}</p>
                </div>
              </div>
            </div>
            <p v-else class="tl-empty">暂无史事录入</p>
          </div>

          <!-- 名士 -->
          <div class="tl-col">
            <h3 class="tl-col-title"><span class="tl-col-icon">人</span>代表名士</h3>
            <div v-if="selected.poets.length" class="tl-poets">
              <router-link
                v-for="p in selected.poets.slice(0, 12)"
                :key="p.id"
                :to="`/poets/${p.id}`"
                class="tl-poet-chip"
              >{{ p.name }}</router-link>
              <span v-if="selected.poets.length > 12" class="tl-more">等 {{ selected.poets.length }} 位</span>
            </div>
            <p v-else class="tl-empty">暂无名士录入</p>
          </div>

          <!-- 诗篇 -->
          <div class="tl-col">
            <h3 class="tl-col-title"><span class="tl-col-icon">诗</span>传世诗篇</h3>
            <div v-if="selected.poems.length" class="tl-poems">
              <router-link
                v-for="pm in selected.poems.slice(0, 8)"
                :key="pm.id"
                :to="`/poems/${pm.id}`"
                class="tl-poem-row"
              >
                <span class="tl-poem-title">{{ pm.title }}</span>
                <span class="tl-poem-arrow">→</span>
              </router-link>
            </div>
            <p v-else class="tl-empty">暂无诗篇录入</p>
          </div>
        </div>
      </section>

      <!-- 诗风演变 -->
      <section class="tl-section tl-evo" data-reveal>
        <SectionHeading
          eyebrow="诗风演变"
          title="跨朝代文脉"
          subtitle="从诗经现实主义到元曲民俗，一脉相承又各具风姿"
        />
        <div class="tl-evo-track">
          <div v-for="(s, i) in evolution" :key="i" class="tl-evo-stage">
            <div class="tl-evo-stage-inner">
              <span class="tl-evo-name">{{ s.name }}</span>
              <span class="tl-evo-style">{{ s.style }}</span>
            </div>
            <span v-if="i < evolution.length - 1" class="tl-evo-arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </section>

      <!-- 文脉之最 -->
      <section v-if="extremes" class="tl-section tl-most" data-reveal>
        <SectionHeading title="文脉之最" subtitle="数据中的齐鲁文脉" />
        <div class="tl-most-grid">
          <div class="tl-most-card">
            <span class="tl-most-num">{{ extremes.topDynastyPoets.count }}</span>
            <span class="tl-most-lbl">{{ extremes.topDynastyPoets.name }} 名士最盛</span>
          </div>
          <div class="tl-most-card">
            <span class="tl-most-num">{{ extremes.topDynastyPoems.count }}</span>
            <span class="tl-most-lbl">{{ extremes.topDynastyPoems.name }} 诗篇最丰</span>
          </div>
          <div class="tl-most-card">
            <span class="tl-most-num">{{ extremes.longestSpan.years }}</span>
            <span class="tl-most-lbl">{{ extremes.longestSpan.name }} 跨度最长</span>
          </div>
          <div class="tl-most-card">
            <span class="tl-most-num">{{ extremes.totalPoets }}</span>
            <span class="tl-most-lbl">齐鲁名士总数</span>
          </div>
        </div>
      </section>

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadTimeline" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '../api'
import InkHero from '../components/homepage/InkHero.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import DynastyRail from '../components/homepage/DynastyRail.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import { useReveal } from '../composables/useReveal'

const { reveal } = useReveal()
const timeline = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const selectedDynastyId = ref(4) // 默认隋唐
const revealRoot = ref(null)

const formatYear = (y) =>
  y == null ? '—' : y < 0 ? '前' + Math.abs(y) : String(y)

const dynastyItems = computed(() =>
  timeline.value.map((t) => ({
    id: t.dynasty.id,
    name: t.dynasty.name,
    startYear: t.dynasty.startYear,
    endYear: t.dynasty.endYear,
    poetCount: t.poets.length,
  })),
)

const selected = computed(
  () =>
    timeline.value.find((t) => t.dynasty.id === selectedDynastyId.value) ||
    timeline.value[0] ||
    null,
)

const evolution = [
  { name: '诗经', style: '现实主义' },
  { name: '楚辞', style: '浪漫主义' },
  { name: '唐诗', style: '气象万千' },
  { name: '宋词', style: '婉约豪放' },
  { name: '元曲', style: '民俗市井' },
]

const extremes = computed(() => {
  if (!timeline.value.length) return null
  let topPoets = { name: '', count: 0 }
  let topPoems = { name: '', count: 0 }
  let longest = { name: '', years: 0 }
  let totalPoets = 0
  timeline.value.forEach((t) => {
    if (t.poets.length > topPoets.count)
      topPoets = { name: t.dynasty.name, count: t.poets.length }
    if (t.poems.length > topPoems.count)
      topPoems = { name: t.dynasty.name, count: t.poems.length }
    totalPoets += t.poets.length
    const span = (t.dynasty.endYear || 0) - (t.dynasty.startYear || 0)
    if (span > longest.years)
      longest = { name: t.dynasty.name, years: span }
  })
  return {
    topDynastyPoets: topPoets,
    topDynastyPoems: topPoems,
    longestSpan: longest,
    totalPoets,
  }
})

const heroStats = computed(() => {
  if (!loaded.value || !timeline.value.length) return []
  const totalPoets = timeline.value.reduce((s, t) => s + t.poets.length, 0)
  const totalPoems = timeline.value.reduce((s, t) => s + t.poems.length, 0)
  const firstStart = Math.min(...timeline.value.map((t) => t.dynasty.startYear || 0))
  const lastEnd = Math.max(...timeline.value.map((t) => t.dynasty.endYear || 0))
  const span = lastEnd - firstStart
  return [
    { value: timeline.value.length, suffix: '朝', label: '朝代跨度' },
    { value: totalPoets, suffix: '位', label: '历代名士' },
    { value: totalPoems, suffix: '篇', label: '传世诗卷' },
    { value: span, suffix: '年', label: '文脉绵延' },
  ]
})

const loadTimeline = async () => {
  errorMsg.value = null
  try {
    timeline.value = await api.get('/timeline')
  } catch (e) {
    console.error('加载朝代时间线失败:', e)
    errorMsg.value = '加载朝代数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

onMounted(async () => {
  await loadTimeline()
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})
</script>

<style scoped>
.timeline-page {
  max-width: 1280px;
  margin: 0 auto;
}
.timeline-content {
  padding: 56px 48px 96px;
}

.tl-section {
  margin-bottom: 56px;
}

/* ---------- detail ---------- */
.tl-detail {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 4px;
  padding: 32px 36px;
}
.theme-real .tl-detail {
  box-shadow: var(--card-shadow);
}
.tl-detail-head {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}
.tl-detail-title-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.tl-detail-name {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  margin: 0;
  line-height: 1.1;
}
.tl-detail-years {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
  font-weight: 600;
}
.tl-detail-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0 0 14px 0;
}
.tl-detail-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.tl-detail-stats b {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  color: var(--accent);
  margin-right: 2px;
}
.tl-detail-sep {
  color: var(--border);
}

.tl-detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 32px;
}
.tl-col {
  min-width: 0;
}
.tl-col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  letter-spacing: 2px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border-light);
}
.tl-col-icon {
  font-family: var(--font-display);
  font-size: 12px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 2px;
  font-weight: 700;
}

/* events */
.tl-events {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tl-event {
  display: flex;
  gap: 14px;
  padding: 4px 0;
}
.tl-event-year {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  min-width: 60px;
  flex-shrink: 0;
}
.tl-event-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.5;
}
.tl-event-sig {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* poets */
.tl-poets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tl-poet-chip {
  padding: 6px 16px;
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.25s ease;
  font-weight: 600;
  letter-spacing: 1px;
}
.tl-poet-chip:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}
.theme-inkwash .tl-poet-chip {
  background: var(--bg-tertiary);
  border-color: var(--border);
}
.tl-more {
  font-size: 11px;
  color: var(--text-muted);
  align-self: center;
  letter-spacing: 1px;
}

/* poems */
.tl-poems {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tl-poem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 2px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s ease;
  border: 1px solid transparent;
}
.tl-poem-row:hover {
  background: var(--bg-secondary);
  border-color: var(--border-light);
}
.theme-inkwash .tl-poem-row:hover {
  background: rgba(194, 58, 43, 0.04);
  border-color: var(--accent-light);
}
.tl-poem-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.tl-poem-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}
.tl-poem-row:hover .tl-poem-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

.tl-empty {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  letter-spacing: 1px;
}

/* ---------- evolution ---------- */
.tl-evo-track {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex-wrap: wrap;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px 12px;
}
.tl-evo-stage {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 120px;
  justify-content: center;
}
.tl-evo-stage-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
}
.tl-evo-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.tl-evo-style {
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 1px;
}
.tl-evo-arrow {
  color: var(--accent);
  font-size: 18px;
  font-weight: 700;
  opacity: 0.6;
}

/* ---------- 文脉之最 ---------- */
.tl-most-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.tl-most-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.tl-most-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(61, 43, 31, 0.1);
}
.tl-most-num {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.tl-most-lbl {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  line-height: 1.5;
}

/* ---------- responsive ---------- */
@media (max-width: 1024px) {
  .timeline-content { padding: 40px 32px 80px; }
  .tl-detail-grid { grid-template-columns: 1fr 1fr; }
  .tl-most-grid { grid-template-columns: repeat(2, 1fr); }
  .tl-detail { padding: 28px 28px; }
  .tl-detail-name { font-size: 32px; letter-spacing: 4px; }
}
@media (max-width: 640px) {
  .timeline-content { padding: 32px 16px 64px; }
  .tl-section { margin-bottom: 40px; }
  .tl-detail-grid { grid-template-columns: 1fr; gap: 24px; }
  .tl-detail { padding: 22px 18px; }
  .tl-detail-name { font-size: 28px; letter-spacing: 3px; }
  .tl-evo-track { flex-direction: column; gap: 4px; }
  .tl-evo-stage { flex-direction: row; min-width: 0; }
  .tl-evo-arrow { transform: rotate(90deg); }
  .tl-most-grid { grid-template-columns: 1fr 1fr; }
  .tl-most-num { font-size: 28px; }
}
</style>
