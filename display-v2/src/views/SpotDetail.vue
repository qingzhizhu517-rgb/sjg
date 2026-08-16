<template>
  <!-- 加载骨架 -->
  <div v-if="loading" class="spot-skeleton" aria-busy="true" aria-label="景观加载中">
    <SkeletonBlock height="420px" />
    <div class="spot-skeleton__rows">
      <SkeletonBlock height="34px" width="40%" />
      <SkeletonBlock v-for="i in 4" :key="i" height="18px" :width="`${92 - i * 8}%`" />
    </div>
  </div>
  <ErrorState v-else-if="loadError" :message="loadError" @retry="loadSpot" />
  <EmptyState v-else-if="!spot" icon="景" message="此景观暂未收录" hint="返回地图看看别处" />

  <!-- 景观详情: 全屏宽版式 -->
  <div class="spot-detail" :class="themeClass" v-else>
    <div v-if="moodBg" class="mood-bg" :style="{ backgroundImage: `url(${moodBg})` }" aria-hidden="true"></div>

    <!-- ===== 全宽 Hero: 景观主图 + 大标题 ===== -->
    <header class="sd-hero">
      <div class="sd-hero__media" v-if="imageUrl">
        <img :src="imageUrl" :alt="spot.name" class="sd-hero__img" decoding="async" />
        <div class="sd-hero__veil"></div>
      </div>
      <div class="sd-hero__media sd-hero__media--fallback" v-else aria-hidden="true">
        <span class="sd-hero__fallback-seal">{{ spot.name ? spot.name.charAt(0) : '景' }}</span>
      </div>

      <div class="sd-hero__content">
        <router-link to="/map" class="back-link">← 返回地图</router-link>
        <div class="sd-hero__titlebox">
          <h1 class="sd-name">{{ spot.name }}</h1>
          <span class="sd-seal">{{ isAnime ? (getSpotData(spot.name).tag || '胜迹') : (spot.region || '齐鲁') }}</span>
        </div>
        <p class="sd-tagline">{{ heroLine }}</p>
        <div class="sd-facts">
          <div class="sd-fact">
            <span class="sd-fact__label">地理位置</span>
            <span class="sd-fact__value">{{ spot.address || '山东省 ' + spot.region }}</span>
          </div>
          <div class="sd-fact">
            <span class="sd-fact__label">所属区域</span>
            <span class="sd-fact__value">{{ spot.region }} 市</span>
          </div>
          <div class="sd-fact">
            <span class="sd-fact__label">历代吟咏</span>
            <span class="sd-fact__value">{{ poems.length }} 首</span>
          </div>
        </div>
      </div>
    </header>

    <main class="sd-main">
      <!-- ===== 历代诗词情感波澜曲线(真实数据, 重点) ===== -->
      <section class="sd-chart card">
        <div class="sd-sec-head">
          <span class="title-seal">图</span>
          <div class="sd-sec-head__text">
            <h2 class="sd-sec-title">历代诗词情感波澜曲线</h2>
            <p class="sd-sec-sub">以历代吟咏此景之作的情感标签实测绘制：金柱为各代吟咏篇数，朱线为情感波澜（豪放居上、悲凉居下）</p>
          </div>
        </div>
        <div v-if="chartRows.length" ref="chartRef" class="sd-chart__canvas"></div>
        <div v-else class="sd-chart__empty">
          <EmptyState icon="图" message="此处暂无关联诗篇" hint="情感波澜随吟咏篇目呈现" />
        </div>
      </section>

      <div class="sd-cols">
        <!-- ===== 左列: 名片/沿革/玩法/情感维度 ===== -->
        <aside class="sd-left">
          <section class="card sd-block">
            <h2 class="sd-block__title">景点名片</h2>
            <p class="sd-block__text">{{ spot.description }}</p>
          </section>

          <section class="card sd-block" v-if="getSpotData(spot.name).history">
            <h2 class="sd-block__title">历史沿革</h2>
            <p class="sd-block__text">{{ getSpotData(spot.name).history }}</p>
          </section>

          <section class="card sd-block" v-if="getSpotData(spot.name).play">
            <h2 class="sd-block__title">推荐玩法</h2>
            <p class="sd-block__text">{{ getSpotData(spot.name).play }}</p>
          </section>

          <section class="card sd-block">
            <h2 class="sd-block__title">情感维度分布</h2>
            <p class="sd-block__sub">源于本景历代吟咏的情感标签统计</p>
            <div class="sd-rings">
              <div v-for="ring in sentimentRings" :key="ring.name" class="ring-item">
                <div class="ring-circle" :style="getRingStyle(ring.percent, ring.color)">
                  <div class="ring-inner"><span class="ring-value">{{ ring.percent }}%</span></div>
                </div>
                <span class="ring-name">{{ ring.name }}</span>
              </div>
              <p v-if="!sentimentRings.length" class="sd-block__text">暂无情感标签数据</p>
            </div>
          </section>
        </aside>

        <!-- ===== 右列: 经典吟咏名篇 ===== -->
        <section class="sd-right">
          <div class="sd-sec-head">
            <span class="title-seal">诗</span>
            <div class="sd-sec-head__text">
              <h2 class="sd-sec-title">经典吟咏名篇</h2>
              <p class="sd-sec-sub">点击卡片品读全文</p>
            </div>
          </div>
          <div class="sd-poems">
            <article
              v-for="poem in enrichedPoems.slice(0, 12)"
              :key="poem.id"
              class="sd-poem hover-lift"
              tabindex="0"
              role="link"
              @click="$router.push(`/poems/${poem.id}`)"
              @keydown.enter="$router.push(`/poems/${poem.id}`)"
            >
              <div class="sd-poem__head">
                <h3 class="sd-poem__title">《{{ poem.title }}》</h3>
                <span class="sd-poem__author" v-if="poem.poet">〔{{ poem.poet.dynastyName || '朝代' }}〕{{ poem.poet.name }}</span>
              </div>
              <p class="sd-poem__excerpt">{{ poem.excerpt }}</p>
              <div class="sd-poem__foot">
                <div class="sd-poem__tags" v-if="poem.sentimentList.length">
                  <span v-for="tag in poem.sentimentList.slice(0, 4)" :key="tag" class="sentiment-seal-tag">{{ tag }}</span>
                </div>
                <span class="read-more-txt">品读全文 →</span>
              </div>
            </article>
            <div v-if="!enrichedPoems.length" class="empty-poems">
              <EmptyState icon="诗" message="此处暂无关联诗篇" hint="待学者考证录入" />
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockSpots } from '../config/mockDetailData'
import * as echarts from 'echarts'
import api from '../api'
import { cssVar, cssVarAlpha } from '../utils/cssToken'
import { pickMoodBackdrop } from '../utils/moodBackdrop'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'

const route = useRoute()
const { themeClass, isReal, isAnime } = useTheme()
const { getImageUrl } = useImage()
const spot = ref(null)
const poems = ref([])
const poetsMap = ref({})
const chartRef = ref(null)
const loading = ref(true)
const loadError = ref('')
let chartInstance = null

const imageUrl = computed(() => {
  if (!spot.value) return null
  const url = isReal.value ? spot.value.imageUrl : (spot.value.imageAnimeUrl || spot.value.imageUrl)
  return getImageUrl(url, isAnime.value)
})

const moodBg = computed(() => pickMoodBackdrop(imageUrl.value))

const heroLine = computed(() => {
  const desc = spot.value?.description || ''
  return desc.length > 60 ? desc.slice(0, 60) + '…' : desc
})

const getSpotData = (name) => {
  return mockSpots[name] || { verticalText: '', tag: '经典景区', history: '', play: '' }
}

const getDynastyName = (dynastyId) => {
  const mapping = { 1: '先秦', 2: '秦汉', 3: '魏晋南北朝', 4: '隋唐', 5: '宋', 9: '金', 6: '元', 7: '明', 8: '清' }
  return mapping[dynastyId] || '古代'
}

// ---- 情感标签 → 情感强度分值(0-100, 豪放居上/悲凉居下) ----
const EMOTION_SCORES = {
  豪放: 92, 壮阔: 88, 激昂: 86, 边塞: 84, 豁达: 80, 悠远: 72, 清新: 66, 闲适: 56,
  怀古: 58, 写景: 55, 哲理: 50, 淡泊: 48, 婉约: 40, 惜别: 32, 幽思: 26, 思乡: 24, 悲凉: 16, 孤寂: 14,
}
const EMOTION_DEFAULT = 55

const poemEmotionScore = (poem) => {
  const tags = parseTagsOf(poem)
  if (!tags.length) return EMOTION_DEFAULT
  const scores = tags.map((t) => EMOTION_SCORES[t] ?? EMOTION_DEFAULT)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

const parseTagsOf = (poem) => {
  let tags = poem.sentimentTags
  if (!tags) return []
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags) } catch { return tags.split(',').map((s) => s.trim()).filter(Boolean) }
  }
  return Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : []
}

const getPoetAvatar = (poetObj) => {
  if (!poetObj) return ''
  const url = isAnime.value ? poetObj.avatarAnimeUrl || poetObj.avatarUrl : poetObj.avatarUrl
  return getImageUrl(url, isAnime.value)
}

const enrichedPoems = computed(() => {
  return poems.value.map((poem) => {
    const poetObj = poetsMap.value[poem.poetId] || null
    const poetWithDynasty = poetObj ? { ...poetObj, dynastyName: getDynastyName(poetObj.dynastyId) } : null
    let excerpt = ''
    if (poem.content) {
      const lines = poem.content.split('\n').filter((l) => l.trim())
      excerpt = lines.slice(0, 2).join(' / ')
      if (lines.length > 2) excerpt += ' …'
    }
    return { ...poem, poet: poetWithDynasty, excerpt, sentimentList: parseTagsOf(poem) }
  })
})

// ---- 朝代顺序(与全站一致) ----
const DYNASTY_ORDER = [
  { id: 1, name: '先秦' }, { id: 2, name: '秦汉' }, { id: 3, name: '魏晋南北朝' },
  { id: 4, name: '隋唐' }, { id: 5, name: '宋' }, { id: 9, name: '金' },
  { id: 6, name: '元' }, { id: 7, name: '明' }, { id: 8, name: '清' },
]

// ---- 情感波澜曲线: 真实数据(按朝代聚合吟咏篇目与情感均值) ----
const chartRows = computed(() => {
  const byDynasty = {}
  poems.value.forEach((p) => {
    const did = p.dynastyId ?? poetsMap.value[p.poetId]?.dynastyId
    const name = getDynastyName(did)
    if (!byDynasty[name]) byDynasty[name] = { sum: 0, n: 0, best: null, bestScore: -1 }
    const score = poemEmotionScore(p)
    byDynasty[name].sum += score
    byDynasty[name].n += 1
    if (score > byDynasty[name].bestScore) {
      byDynasty[name].bestScore = score
      byDynasty[name].best = p
    }
  })
  return DYNASTY_ORDER.filter((d) => byDynasty[d.name]).map((d) => {
    const g = byDynasty[d.name]
    const poetName = poetsMap.value[g.best?.poetId]?.name || ''
    return {
      name: d.name,
      count: g.n,
      value: Math.round(g.sum / g.n),
      bestTitle: g.best?.title || '',
      bestPoet: poetName,
    }
  })
})

// ---- 情感维度分布: 真实数据(全部标签计数 Top5) ----
const sentimentRings = computed(() => {
  const counts = new Map()
  poems.value.forEach((p) => {
    parseTagsOf(p).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
  })
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  if (!total) return []
  const palette = { 豪放: '#8e352e', 悠远: '#c27b38', 婉约: '#5b8c85', 幽思: '#7a5a8f', 淡泊: '#688c5b', 思乡: '#4f7a94', 惜别: '#8f6f8f', 壮阔: '#b3542f', 清新: '#5f9e7e' }
  return Array.from(counts.entries())
    .map(([name, c]) => ({ name, count: c, percent: Math.round((c / total) * 100), color: palette[name] || '#8f8a7a' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const getRingStyle = (percent, color) => {
  const degrees = (percent / 100) * 360
  return { background: `conic-gradient(${color} 0deg, ${color} ${degrees}deg, var(--border-light) ${degrees}deg, var(--border-light) 360deg)` }
}

// 情感分值 → 颜色(悲凉青灰 → 豪放朱红)
const emotionColor = (v) => {
  if (v >= 85) return '#c23a2b'
  if (v >= 70) return '#c27b38'
  if (v >= 55) return '#c9a227'
  if (v >= 40) return '#5b8c85'
  return '#5a6b74'
}

const initChart = () => {
  if (!chartRef.value || !spot.value || !chartRows.value.length) return
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  chartInstance = echarts.init(chartRef.value)

  const rows = chartRows.value
  const lineColor = cssVar('--accent') || '#c23a2b'
  const areaStart = cssVarAlpha('--accent', 0.18)
  const areaEnd = cssVarAlpha('--accent', 0.01)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'var(--border)' } },
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border)',
      textStyle: { color: 'var(--text-primary)', fontSize: 13 },
      formatter: (params) => {
        const row = rows[params[0]?.dataIndex]
        if (!row) return ''
        const emotion = row.value <= 20 ? '悲凉' : row.value <= 40 ? '幽思' : row.value <= 60 ? '婉约' : row.value <= 80 ? '悠远' : '豪放'
        return `<strong>${row.name} · 吟咏 ${row.count} 首</strong><br/>情感均值：${row.value}（${emotion}）<br/>代表篇：《${row.bestTitle}》 ${row.bestPoet}`
      },
    },
    grid: { top: 30, left: 60, right: 30, bottom: 46 },
    legend: {
      data: ['吟咏篇数', '情感波澜'],
      top: 0,
      right: 0,
      textStyle: { color: 'var(--text-secondary)', fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8,
    },
    xAxis: {
      type: 'category',
      data: rows.map((r) => r.name),
      axisLabel: { color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700 },
      axisLine: { lineStyle: { color: 'var(--border)' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '情感',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          color: 'var(--text-muted)',
          fontSize: 12,
          formatter: (v) => (v <= 20 ? '悲凉' : v <= 40 ? '幽思' : v <= 60 ? '婉约' : v <= 80 ? '悠远' : '豪放'),
        },
        splitLine: { lineStyle: { type: 'dashed', color: 'var(--border-light)' } },
      },
      {
        type: 'value',
        name: '篇数',
        min: 0,
        axisLabel: { color: 'var(--text-muted)', fontSize: 12 },
        splitLine: { show: false },
      },
    ],
    series: [
      // 金柱: 各代吟咏篇数(右轴)
      {
        name: '吟咏篇数',
        type: 'bar',
        yAxisIndex: 1,
        data: rows.map((r) => r.count),
        barWidth: 14,
        barGap: '-100%',
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(201,162,39,0.5)' },
              { offset: 1, color: 'rgba(201,162,39,0.08)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
        animationDuration: 1100,
        animationEasing: 'cubicOut',
      },
      // 朱线: 情感波澜(左轴), 节点随情感值着色
      {
        name: '情感波澜',
        type: 'line',
        data: rows.map((r, i) => ({
          value: r.value,
          symbolSize: Math.min(22, 10 + r.count * 1.6),
          itemStyle: { color: emotionColor(r.value), borderColor: 'var(--card-bg)', borderWidth: 2 },
        })),
        smooth: 0.35,
        lineStyle: { color: lineColor, width: 3, shadowColor: areaStart, shadowBlur: 10 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: areaStart }, { offset: 1, color: areaEnd }]) },
        label: {
          show: true,
          position: 'top',
          distance: 12,
          color: 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 700,
          formatter: (p) => `《${rows[p.dataIndex].bestTitle}》`,
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 44,
          itemStyle: { color: lineColor },
          label: { show: false },
          data: rows
            .map((r, i) => ({ coord: [i, r.value], name: r.bestTitle }))
            .filter((_, i) => rows[i].value >= 80), // 仅豪放/悠远高点立 pin
        },
        animationDuration: 1400,
        animationEasing: 'cubicOut',
      },
    ],
  }

  chartInstance.setOption(option)
}

const handleResize = () => {
  if (chartInstance) chartInstance.resize()
}

watch([isAnime, chartRows], () => {
  nextTick(() => {
    setTimeout(() => initChart(), 120)
  })
})

const loadSpot = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await api.get(`/spots/${route.params.id}`)
    spot.value = data.spot || data
    poems.value = data.poems || []
  } catch (err) {
    console.error('加载景观详情失败:', err)
    loadError.value = '加载景观详情失败，请稍后重试'
    loading.value = false
    return
  }
  loading.value = false

  try {
    const poetsData = await api.get('/poets', { params: { size: 200 } })
    const map = {}
    ;(poetsData.records || poetsData || []).forEach((p) => { map[p.id] = p })
    poetsMap.value = map
  } catch (e) {
    console.error('Error loading poets map:', e)
  }

  nextTick(() => {
    setTimeout(() => initChart(), 120)
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadSpot()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
/* ===== 全屏宽版式 ===== */
.spot-detail {
  width: 100%;
  padding-bottom: 96px;
}

/* 意境背景 */
.mood-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  filter: blur(60px) saturate(0.85);
  opacity: 0.14;
  pointer-events: none;
}

/* ===== Hero ===== */
.sd-hero {
  position: relative;
  min-height: 460px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.sd-hero__media {
  position: absolute;
  inset: 0;
}
.sd-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sd-hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%);
}
.sd-hero__media--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 10%, var(--bg-primary));
}
.sd-hero__fallback-seal {
  font-family: var(--font-display);
  font-size: 120px;
  font-weight: 900;
  color: color-mix(in srgb, var(--accent) 30%, transparent);
}
.sd-hero__content {
  position: relative;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 48px 44px;
  text-align: left;
  color: #f5efe3;
}
.sd-hero__content .back-link {
  color: rgba(245, 239, 227, 0.85);
}
.sd-hero__content .back-link:hover {
  color: var(--accent-light, #e5c96b);
}
.sd-hero__titlebox {
  display: flex;
  align-items: flex-end;
  gap: 22px;
  margin-top: 16px;
}
.sd-name {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(40px, 5.5vw, 72px);
  font-weight: 700;
  letter-spacing: 8px;
  color: #f5efe3;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.45);
}
.sd-seal {
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: 15px;
  letter-spacing: 4px;
  padding: 8px 6px;
  border: 1px solid rgba(245, 239, 227, 0.7);
  background: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  margin-bottom: 8px;
}
.sd-tagline {
  margin: 14px 0 0;
  max-width: 640px;
  font-size: 16px;
  line-height: 1.9;
  letter-spacing: 1px;
  color: rgba(245, 239, 227, 0.9);
}
.sd-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 36px;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid rgba(245, 239, 227, 0.25);
}
.sd-fact {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.sd-fact__label {
  font-size: 13px;
  letter-spacing: 2px;
  color: rgba(245, 239, 227, 0.65);
}
.sd-fact__value {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #f5efe3;
}

/* ===== 正文 ===== */
.sd-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 48px 0;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* 情感波澜曲线(重点) */
.sd-chart {
  padding: 28px 32px 20px;
}
.sd-chart__canvas {
  width: 100%;
  height: 400px;
}
.sd-chart__empty {
  padding: 20px 0 8px;
}

.sd-sec-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 10px;
}
.sd-sec-head__text {
  text-align: left;
}
.sd-sec-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text-primary);
}
.sd-sec-sub {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
.title-seal {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 900;
  border-radius: 2px;
  flex-shrink: 0;
  transform: rotate(-3deg);
  margin-top: 2px;
}

/* 双栏 */
.sd-cols {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 36px;
  align-items: start;
}

.sd-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sd-block {
  padding: 26px 28px;
}
.sd-block__title {
  margin: 0 0 12px;
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-primary);
  border-left: 3px solid var(--accent);
  padding-left: 12px;
}
.sd-block__sub {
  margin: -6px 0 16px;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.sd-block__text {
  margin: 0;
  font-size: 15px;
  line-height: 2;
  color: var(--text-secondary);
  text-align: justify;
  text-indent: 2em;
}

/* 情感维度分布环 */
.sd-rings {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 18px 10px;
  padding-top: 6px;
}
.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.ring-circle {
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}
.ring-circle:hover {
  transform: scale(1.06);
}
.ring-inner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.ring-name {
  font-size: 13px;
  font-family: var(--font-heading);
  color: var(--text-secondary);
  font-weight: 700;
  letter-spacing: 1px;
}

/* 名篇卡片 */
.sd-right .sd-sec-head {
  margin-bottom: 18px;
}
.sd-poems {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.sd-poem {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: left;
  transition: all 0.25s ease;
}
.sd-poem:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.sd-poem__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-light);
}
.sd-poem__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
}
.sd-poem__author {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.sd-poem__excerpt {
  flex: 1;
  margin: 14px 0;
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  font-family: var(--font-heading);
  text-align: justify;
}
.sd-poem__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-light);
}
.sd-poem__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sentiment-seal-tag {
  font-size: 12px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 2px;
  font-weight: 700;
  background: color-mix(in srgb, var(--accent) 4%, transparent);
}
.read-more-txt {
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
}

.back-link {
  display: inline-block;
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 1px;
  transition: color 0.2s;
}
.back-link:hover {
  color: var(--accent);
}

.empty-poems {
  grid-column: span 2;
}

/* 加载骨架 */
.spot-skeleton {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 48px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.spot-skeleton__rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .sd-cols { grid-template-columns: 1fr; }
  .sd-hero__content, .sd-main { padding-left: 28px; padding-right: 28px; }
}
@media (max-width: 768px) {
  .sd-hero { min-height: 340px; }
  .sd-poems { grid-template-columns: 1fr; }
  .sd-hero__content { padding: 28px 20px 32px; }
  .sd-main { padding: 24px 20px 0; }
  .sd-chart__canvas { height: 320px; }
}
</style>