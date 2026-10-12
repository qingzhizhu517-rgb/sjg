<template>
  <div v-if="loading" class="spot-skeleton folio-page" aria-busy="true" aria-label="景观加载中">
    <SkeletonBlock height="420px" />
    <div class="spot-skeleton__rows">
      <SkeletonBlock height="34px" width="40%" />
      <SkeletonBlock v-for="i in 4" :key="i" height="18px" :width="`${92 - i * 8}%`" />
    </div>
  </div>
  <ErrorState v-else-if="loadError" :message="loadError" @retry="loadSpot" />
  <EmptyState v-else-if="!spot" icon="景" message="此景观暂未收录" hint="返回山河图志，看看别处" />

  <div v-else class="spot-detail atlas-spot folio-page">
    <div class="sd-composition folio-split">
      <aside class="sd-landscape" aria-labelledby="spot-name">
        <div class="sd-landscape__copy">
          <router-link :to="atlasLink(`/regions/${spot.region || '泰安'}`, route)" class="sd-back">← {{ spot.region || '齐鲁' }}山水</router-link>
          <div class="sd-title-row">
            <h1 id="spot-name">{{ spot.name }}</h1>
            <span class="sd-seal" aria-hidden="true">山水</span>
          </div>
          <p class="sd-tagline">{{ heroLine }}</p>
          <p class="sd-description folio-prose">{{ spot.description || '此处景观介绍尚待收录。' }}</p>
        </div>
        <div v-if="imageUrl" class="sd-landscape__art" :class="{ 'sd-landscape__art--city': usingCityArt }" aria-hidden="true">
          <img :src="imageUrl" alt="" decoding="async" @error="imageFailed = true" />
        </div>
        <div v-else class="sd-landscape__blank" aria-hidden="true">山水有清音</div>
        <div class="sd-landscape__caption"><span>{{ spot.region || '山东' }}</span><span>{{ poems.length }} 首诗词在此相逢</span></div>
      </aside>

      <section class="sd-exploration" aria-labelledby="emotion-heading">
        <div class="sd-exploration__vignette" aria-hidden="true"></div>
        <header class="sd-section-heading">
          <h2 class="folio-section-title" id="emotion-heading">诗词情感曲线 <i aria-hidden="true">◇</i><span>同一片山水，不同心境</span></h2>
        </header>
        <div class="sd-controls">
          <div class="sd-tabs folio-tabs" role="tablist" aria-label="诗词浏览方式">
            <button v-for="tab in tabs" :id="`spot-tab-${tab.id}`" :key="tab.id" type="button" role="tab" :aria-controls="`spot-panel-${tab.id}`" :aria-selected="activeTab === tab.id" :tabindex="activeTab === tab.id ? 0 : -1" @keydown="onTabKeydown($event, tab.id)" :class="{ 'is-active': activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
          </div>
          <label class="sd-dynasty-filter">
            <span class="sr-only">筛选朝代</span>
            <select class="folio-select" v-model="selectedDynasty" aria-label="筛选朝代">
              <option value="all">全部朝代</option>
              <option v-for="dynasty in availableDynasties" :key="dynasty.id" :value="String(dynasty.id)">{{ dynasty.name }}</option>
            </select>
          </label>
        </div>
        <p class="sd-chart-intro">{{ activeTab === 'timeline' ? '沿着诗词的情感起伏，感受历代文人眼中的山水风物。' : activeTab === 'map' ? '循着景点坐标，寻找诗句与山水相遇的地方。' : '一处山水，历代知音。读一位诗人，看一种心境。' }}</p>

        <div v-show="activeTab === 'timeline'" id="spot-panel-timeline" class="sd-tab-panel" role="tabpanel" aria-labelledby="spot-tab-timeline">
          <div v-if="hasChartData" ref="chartRef" class="sd-chart" role="img" :aria-label="chartDescription"></div>
          <EmptyState v-else icon="诗" :message="filteredPoems.length ? '暂无可绘制的情感标签' : '此朝代暂无关联诗篇'" hint="有据可依，方可落笔" />
          <div v-if="hasChartData" class="sd-chart-note"><span>情感标签规则示意</span><span>{{ scoredPoemCount }} / {{ filteredPoems.length }} 首具有可映射标签</span></div>
        </div>

        <div v-if="activeTab === 'map'" id="spot-panel-map" class="sd-tab-panel sd-place-panel" role="tabpanel" aria-labelledby="spot-tab-map">
          <div v-if="coordinates" class="sd-location-illustration">
            <div class="sd-location-rings" aria-hidden="true"><span></span><span></span><span></span></div>
            <svg class="sd-location-pin" viewBox="0 0 32 42" fill="none" aria-hidden="true"><path d="M16 40s14-14.2 14-24A14 14 0 0 0 2 16c0 9.8 14 24 14 24Z" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="15.5" r="5.5" stroke="currentColor" stroke-width="1.4"/></svg>
            <h3>{{ spot.name }}</h3>
            <p>{{ coordinates.latitude }}° N · {{ coordinates.longitude }}° E</p>
            <span>{{ filteredPoems.length }} 首关联诗词</span>
            <small>景点位置示意 · 不代表诗人行旅或作品创作位置</small>
          </div>
          <EmptyState v-else icon="地" message="此景点尚未录入坐标" hint="关联诗词仍可在下方品读" />
        </div>

        <div v-if="activeTab === 'poets'" id="spot-panel-poets" class="sd-tab-panel sd-poet-list" role="tabpanel" aria-labelledby="spot-tab-poets">
          <router-link v-for="poet in relatedPoets" :key="poet.id" :to="atlasLink(`/poets/${poet.id}`, route)" class="sd-poet-person">
            <img v-if="poet.avatar" :src="poet.avatar" :alt="`${poet.name}画像`" loading="lazy" />
            <span v-else class="sd-poet-person__seal" aria-hidden="true">{{ poet.name.charAt(0) }}</span>
            <div><span class="sd-poet-person__dynasty">{{ poet.dynastyName }}</span><h3>{{ poet.name }}</h3><p>{{ poet.count }} 首关联诗词</p></div>
            <span class="sd-poet-person__arrow" aria-hidden="true">↗</span>
          </router-link>
          <EmptyState v-if="!relatedPoets.length" icon="人" message="暂无可关联的诗人资料" hint="诗人信息将随文献收录补全" />
        </div>
      </section>

      <section class="sd-anthology" aria-labelledby="poems-heading">
        <div class="sd-anthology__heading"><h2 class="folio-section-title" id="poems-heading">代表诗词 <i aria-hidden="true">◇</i></h2><span>{{ filteredPoems.length }} 首吟咏<span v-if="filteredPoems.length > 5"> · {{ showAllPoems ? '已展示全部' : '展示前 5 首' }}</span></span></div>
        <p v-if="poetLoadWarning" class="sd-poet-warning" role="status">{{ poetLoadWarning }}</p>
        <div id="spot-poem-list" class="sd-poems folio-grid" :class="{ 'is-expanded': showAllPoems, 'sd-poems--single': visiblePoems.length === 1 }">
          <router-link v-for="poem in visiblePoems" :key="poem.id" :to="atlasLink(`/poems/${poem.id}`, route)" class="sd-poem">
            <h3>《{{ poem.title }}》</h3>
            <div class="sd-poem__byline"><span>{{ poem.dynastyName }} · {{ poem.poet?.name || '作者资料暂缺' }}</span><span v-if="poem.sentimentList[0]" class="sd-poem__mood" :style="{ color: tagColor(poem.sentimentList[0]) }">{{ poem.sentimentList[0] }}</span></div>
            <div class="sd-poem__picture">
              <img v-if="poem.avatar" :src="poem.avatar" :alt="`${poem.poet.name}画像`" loading="lazy" decoding="async" />
              <span v-else class="sd-poem__portrait-fallback" aria-hidden="true">{{ poem.poet?.name?.charAt(0) || '诗' }}</span>
            </div>
            <p class="sd-poem__verse">{{ poem.excerpt || '诗文内容尚待收录' }}</p>
            <span class="sd-poem__read">品读全文 <span aria-hidden="true">↗</span></span>
          </router-link>
          <EmptyState v-if="!enrichedPoems.length" icon="诗" message="此处暂无关联诗篇" hint="待文献考证录入" />
        </div>
        <button v-if="enrichedPoems.length > 5" class="sd-poems-toggle" type="button" :aria-expanded="showAllPoems" aria-controls="spot-poem-list" @click="showAllPoems = !showAllPoems">
          {{ showAllPoems ? '收起' : `展开全部 ${enrichedPoems.length} 首` }} <span aria-hidden="true">{{ showAllPoems ? '↑' : '↓' }}</span>
        </button>
      </section>
    </div>

    <section class="sd-distribution" aria-labelledby="distribution-heading">
      <div class="sd-distribution__main">
        <h2 class="folio-section-title" id="distribution-heading">情感分布概览 <i aria-hidden="true">◇</i></h2>
        <div v-if="sentimentRings.length" class="sd-rings">
          <div v-for="ring in sentimentRings" :key="ring.name" class="sd-ring">
            <svg viewBox="0 0 64 64" aria-hidden="true"><circle class="sd-ring__track" cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="26" :stroke="ring.color" :stroke-dasharray="`${ring.percent * 1.6336} 163.36`" transform="rotate(-90 32 32)"/></svg>
            <div><h3>{{ ring.name }}</h3><p>{{ ring.percent }}<span>%</span></p><small>{{ ring.count }} 次标签</small></div>
          </div>
        </div>
        <p v-else class="sd-no-tags">暂无情感标签，待收录后呈现。</p>
      </div>
      <aside class="sd-method">
        <h3>数据说明</h3>
        <p>当前 {{ filteredPoems.length }} 首诗词，{{ taggedPoemCount }} 首有情感标签。占比按标签出现次数计算；曲线为规则赋分示意，不等同于客观情绪测量。</p>
        <details><summary>了解情感呈现方法 <span aria-hidden="true">→</span></summary><p>仅对已识别标签赋分，按朝代取均值；缺失与未知标签不补分。平滑曲线用于浏览，不代表年代间的连续变化。环图显示频次最高的五种标签，多标签作品会分别计数。</p></details>
      </aside>
    </section>
    <SourceList show-missing :sources="sources" />
    <div class="folio-detail-actions"><p>山水之外，仍有一城文脉。</p><div class="folio-actions"><router-link :to="atlasLink(`/cities/${spot.region || '济南'}`, route)" class="folio-button">探索城市文化</router-link><router-link :to="readingLink" class="folio-button">AI对照阅读 ↗</router-link><router-link :to="atlasLink(`/poems?region=${encodeURIComponent(spot.region || '')}`, route)" class="folio-button folio-button--primary">阅读更多诗词 →</router-link></div></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import echarts from '../charts/spotEcharts.js'
import api from '../api'
import { useImage } from '../composables/useImage'
import { cityIllustration } from '../config/cityIllustrations'
import { isAtlasPreview, atlasLink, findPreviewSpot, previewPoets, previewDynasties } from '../config/atlasPreview'
import { parseEmotionTags, poemEmotionScore, summarizePoemEmotions } from '../utils/atlasEmotion'
import { buildReadingLink } from '../utils/readingLink'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import SourceList from '../components/SourceList.vue'

const route = useRoute()
const router = useRouter()
const updateViewQuery = (key, value) => router.replace({ query: { ...route.query, [key]: value } })
const { resolveFirstImage } = useImage()
const spot = ref(null)
const poems = ref([])
const sources = ref([])
const poetsMap = ref({})
const loading = ref(true)
const loadError = ref('')
const poetLoadWarning = ref('')
const activeTab = computed({ get: () => ['timeline', 'map', 'poets'].includes(route.query.tab) ? route.query.tab : 'timeline', set: value => updateViewQuery('tab', value === 'timeline' ? undefined : value) })
const selectedDynasty = computed({ get: () => availableDynasties.value.some(dynasty => String(dynasty.id) === route.query.dynasty) ? route.query.dynasty : 'all', set: value => updateViewQuery('dynasty', value === 'all' ? undefined : value) })
const showAllPoems = ref(false)
const chartRef = ref(null)
let chartInstance = null
let chartObserver = null
let requestVersion = 0

const onTabKeydown = (event, id) => {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()
  const index = tabs.findIndex(tab => tab.id === id)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  const nextId = tabs[next].id
  activeTab.value = nextId
  nextTick(() => document.getElementById(`spot-tab-${nextId}`)?.focus())
}
const tabs = [{ id: 'timeline', label: '情感时间轴' }, { id: 'map', label: '诗词地图' }, { id: 'poets', label: '诗人列表' }]
const DYNASTIES = [
  { id: 1, name: '先秦' }, { id: 2, name: '秦汉' }, { id: 3, name: '魏晋南北朝' },
  { id: 4, name: '唐' }, { id: 5, name: '宋' }, { id: 9, name: '金' },
  { id: 6, name: '元' }, { id: 7, name: '明' }, { id: 8, name: '清' },
]
const dynasties = computed(() => isAtlasPreview(route) ? previewDynasties : DYNASTIES)
const dynastyIdOf = (poem) => poem.dynastyId ?? poetsMap.value[poem.poetId]?.dynastyId ?? 'unknown'
const dynastyNameOf = (id) => dynasties.value.find((dynasty) => String(dynasty.id) === String(id))?.name || '朝代未录'
const availableDynasties = computed(() => {
  const ids = new Set(poems.value.map((poem) => String(dynastyIdOf(poem))))
  const known = dynasties.value.filter((dynasty) => ids.has(String(dynasty.id)))
  const unknown = [...ids].filter((id) => !known.some((dynasty) => String(dynasty.id) === id))
  return [...known, ...unknown.map((id) => ({ id, name: '朝代未录' }))]
})
const filteredPoems = computed(() => selectedDynasty.value === 'all' ? poems.value : poems.value.filter((poem) => String(dynastyIdOf(poem)) === selectedDynasty.value))
const readingLink = computed(() => {
  const ids = [...new Set(filteredPoems.value.map(poem => poem.id)
    .filter(id => /^[1-9]\d*$/.test(String(id)) && Number.isSafeInteger(Number(id))).map(Number))]
  return buildReadingLink({ poem: ids[0], compare: ids[1], spot: spot.value?.id, region: spot.value?.region, returnTo: route.fullPath }, route)
})
const heroLine = computed(() => spot.value?.name === '大明湖' ? '一城山色半城湖，泉水叮咚，诗意千年' : '山水之间，寻一脉诗意与千年回响')
// 无专属配图（或远程图失效）时借用所在城市的山水插画；绝不把「景」字 SVG 占位铺满整栏
const imageFailed = ref(false)
const ownSpotImage = computed(() => {
  if (spot.value?.name === '大明湖') return '/media/inkwash/atlas/daming-lake.webp'
  return resolveFirstImage([spot.value?.imageAnimeUrl, spot.value?.imageUrl], '景', { placeholder: false })
})
const usingCityArt = computed(() => !ownSpotImage.value || imageFailed.value)
const imageUrl = computed(() => usingCityArt.value
  ? (spot.value?.region ? cityIllustration(spot.value.region)?.img || '' : '')
  : ownSpotImage.value)
watch(() => spot.value?.id, () => { imageFailed.value = false })
const coordinates = computed(() => {
  const lng = spot.value?.longitude
  const lat = spot.value?.latitude
  if (lng === null || lng === undefined || lng === '' || lat === null || lat === undefined || lat === '') return null
  const longitude = Number(lng), latitude = Number(lat)
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null
  return { longitude: longitude.toFixed(4), latitude: latitude.toFixed(4) }
})
const PORTRAITS = { 杜甫: 'dufu', 李清照: 'liqingzhao', 王士禛: 'wangshizhen', 蒲松龄: 'pusongling', 老舍: 'laoshe' }
const poetAvatar = (poet) => poet && PORTRAITS[poet.name] ? `/media/inkwash/atlas/poet-${PORTRAITS[poet.name]}.webp` : poet ? resolveFirstImage([poet.avatarAnimeUrl, poet.avatarUrl], '文') : ''
const parseTags = (poem) => parseEmotionTags(poem.sentimentTags)
const COLORS = { 豪放: '#bb954e', 壮阔: '#b99b58', 激昂: '#bf9860', 豁达: '#889467', 悠远: '#829278', 悠逸: '#829278', 闲适: '#929c79', 清新: '#879881', 写景: '#929a86', 婉约: '#839aa7', 幽思: '#9a84a1', 思乡: '#8b8fa9', 悲凉: '#8f929e', 淡泊: '#97978c' }
const tagColor = (tag) => COLORS[tag] || '#9c9486'
const enrichedPoems = computed(() => filteredPoems.value.map((poem) => {
  const poet = poetsMap.value[poem.poetId] || null
  const lines = (poem.content || '').split(/\n|(?<=[。！？])/).map((line) => line.trim()).filter(Boolean)
  return { ...poem, poet, dynastyName: dynastyNameOf(dynastyIdOf(poem)), avatar: poetAvatar(poet), excerpt: lines.slice(0, 2).join('\n'), sentimentList: parseTags(poem) }
}))
const visiblePoems = computed(() => showAllPoems.value ? enrichedPoems.value : enrichedPoems.value.slice(0, 5))
watch(selectedDynasty, () => { showAllPoems.value = false })
const relatedPoets = computed(() => {
  const counts = new Map()
  filteredPoems.value.forEach((poem) => counts.set(poem.poetId, (counts.get(poem.poetId) || 0) + 1))
  return [...counts].map(([id, count]) => {
    const poet = poetsMap.value[id]
    return poet ? { ...poet, count, dynastyName: dynastyNameOf(poet.dynastyId), avatar: poetAvatar(poet) } : null
  }).filter(Boolean)
})
const chartRows = computed(() => availableDynasties.value.map((dynasty) => {
  const entries = filteredPoems.value.filter((poem) => String(dynastyIdOf(poem)) === String(dynasty.id))
  const scored = entries.map((poem) => ({ poem, score: poemEmotionScore(poem) })).filter((entry) => entry.score !== null)
  const summary = summarizePoemEmotions(entries)
  const representative = scored[0]?.poem
  return {
    name: dynasty.name, count: entries.length, taggedCount: summary.scoredCount,
    value: summary.meanScore === null ? null : Math.round(summary.meanScore),
    title: representative?.title || '', poet: poetsMap.value[representative?.poetId]?.name || '',
  }
}).filter((row) => row.count > 0))
const hasChartData = computed(() => chartRows.value.some((row) => row.value !== null))
const emotionSummary = computed(() => summarizePoemEmotions(filteredPoems.value))
const scoredPoemCount = computed(() => emotionSummary.value.scoredCount)
const taggedPoemCount = computed(() => emotionSummary.value.taggedCount)
const chartDescription = computed(() => `按朝代汇总的情感标签规则示意：${chartRows.value.map((row) => `${row.name}${row.count}首，${row.value === null ? '无可映射标签' : `规则均值${row.value}`}`).join('；')}。缺失标签不补分。`)
const sentimentRings = computed(() => emotionSummary.value.tags.slice(0, 5).map((tag) => ({ ...tag, color: tagColor(tag.name) })))
const emotionColor = (value) => value >= 80 ? '#bc9656' : value >= 55 ? '#8a967d' : value >= 35 ? '#8598a6' : '#9d85a6'
const disposeChart = () => {
  chartObserver?.disconnect()
  chartObserver = null
  chartInstance?.dispose()
  chartInstance = null
}
const renderChart = async () => {
  await nextTick()
  if (activeTab.value !== 'timeline' || !chartRef.value || !hasChartData.value || loading.value) return
  if (chartInstance?.getDom() !== chartRef.value) disposeChart()
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    if (typeof ResizeObserver !== 'undefined') {
      chartObserver = new ResizeObserver(() => chartInstance?.resize())
      chartObserver.observe(chartRef.value)
    }
  }
  const rows = chartRows.value
  const mobile = chartRef.value.clientWidth < 520
  const stops = rows.length > 1 ? rows.map((row, index) => ({ offset: index / (rows.length - 1), color: emotionColor(row.value ?? 50) })) : [{ offset: 0, color: emotionColor(rows[0].value) }, { offset: 1, color: emotionColor(rows[0].value) }]
  chartInstance.setOption({
    animationDuration: 700,
    textStyle: { fontFamily: '"Noto Serif SC", "Songti SC", serif' },
    grid: { left: mobile ? 38 : 45, right: mobile ? 18 : 34, top: mobile ? 66 : 80, bottom: 42 },
    tooltip: { trigger: 'axis', renderMode: 'richText', backgroundColor: '#f8f5ed', borderColor: '#dcd5c7', borderWidth: 1, textStyle: { color: '#574e41', fontSize: 12 }, padding: 12, axisPointer: { type: 'line', lineStyle: { color: '#c5baa8', type: 'dashed' } }, formatter: (params) => {
      const row = rows[params[0]?.dataIndex]
      return row ? `${row.name} · ${row.count} 首吟咏\n可映射标签：${row.taggedCount} 首\n规则均值：${row.value ?? '无'}${row.title ? `\n《${row.title}》 ${row.poet}` : ''}` : ''
    } },
    xAxis: { type: 'category', boundaryGap: rows.length === 1, data: rows.map((row) => row.name), axisTick: { show: true, length: 3, lineStyle: { color: '#c8c0b2' } }, axisLine: { show: true, lineStyle: { color: '#c8c0b2', width: 1 } }, axisLabel: { color: '#655e52', fontSize: mobile ? 11 : 13, margin: 13, interval: 0 } },
    yAxis: { type: 'value', min: 0, max: 100, interval: 25, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#746B60', fontSize: 12, formatter: (value) => ({ 0: '沉静', 25: '幽思', 50: '婉约', 75: '悠远', 100: '豪放' })[value] || '' } },
    series: [{ name: '情感规则均值', type: 'line', smooth: 0.4, connectNulls: false, symbol: 'circle', symbolSize: mobile ? 8 : 11,
      data: rows.map((row) => ({ value: row.value, itemStyle: { color: '#f6f2e9', borderColor: emotionColor(row.value ?? 50), borderWidth: 2 } })),
      lineStyle: { width: 2, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, stops) },
      areaStyle: { opacity: 0.21, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#b6a17e' }, { offset: 0.55, color: '#cfccb7' }, { offset: 1, color: 'rgba(238,233,221,0)' }]) },
      label: { show: !mobile && rows.length <= 8, position: 'top', distance: 17, color: '#61584C', fontSize: 13, lineHeight: 20, formatter: (params) => { const row = rows[params.dataIndex]; return row.value !== null ? `${row.poet}\n${row.title.length > 10 ? row.title.slice(0, 9) + '…' : row.title}` : '' } },
      emphasis: { scale: 1.3, focus: 'series' },
    }],
  }, { notMerge: true })
  chartInstance.resize()
}
watch([chartRows, activeTab, loading], renderChart, { flush: 'post' })
watch(chartRef, (element) => { if (!element) disposeChart() })

const loadSpot = async () => {
  const version = ++requestVersion
  loading.value = true
  loadError.value = ''
  poetLoadWarning.value = ''
  spot.value = null
  poems.value = []
  sources.value = []
  poetsMap.value = {}
  showAllPoems.value = false
  disposeChart()
  if (isAtlasPreview(route)) {
    const specimen = findPreviewSpot(route.params.id)
    spot.value = specimen ? { ...specimen } : null
    poems.value = Array.isArray(specimen?.poems) ? specimen.poems : []
    poetsMap.value = Object.fromEntries(previewPoets.map((poet) => [poet.id, poet]))
    loading.value = false
    return
  }
  try {
    const data = await api.get(`/spots/${route.params.id}`)
    if (version !== requestVersion) return
    spot.value = data && typeof data === 'object' && 'spot' in data ? data.spot : data
    poems.value = Array.isArray(data?.poems) ? data.poems : Array.isArray(spot.value?.poems) ? spot.value.poems : []
    sources.value = Array.isArray(data?.sources) ? data.sources : []
    if (poems.value.length) {
      try {
        const poetsData = await api.get('/poets', { params: { size: 200 } })
        if (version !== requestVersion) return
        const list = Array.isArray(poetsData) ? poetsData : Array.isArray(poetsData?.records) ? poetsData.records : []
        poetsMap.value = Object.fromEntries(list.map((poet) => [poet.id, poet]))
      } catch (error) {
        if (version === requestVersion) {
          poetLoadWarning.value = '作者资料暂未载入，诗词内容仍可阅读。'
          console.warn('诗人资料暂未加载，保留诗词内容', error)
        }
      }
    }
  } catch (error) {
    if (version === requestVersion) loadError.value = error.message || '加载景观详情失败，请稍后重试'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}
watch(() => [route.params.id, route.query.preview], loadSpot)
onMounted(loadSpot)
onBeforeUnmount(() => { requestVersion += 1; disposeChart() })
</script>

<style scoped>
.atlas-spot { color: var(--text-primary); text-align: left; }
.sd-composition { --folio-columns: minmax(0, 1fr) minmax(0, 2fr); }
.sd-landscape { position: relative; min-width: 0; display: flex; flex-direction: column; }
.sd-landscape__copy { position: relative; }
.sd-back { display: inline-flex; align-items: center; min-height: var(--control-height); font-size: var(--fs-meta); color: var(--text-muted); margin-bottom: var(--sp-3); }
.sd-back:hover { color: var(--accent); }
.sd-title-row { display: flex; gap: var(--sp-4); align-items: center; }
.sd-title-row h1 { font: 600 clamp(36px, 4vw, 56px)/1.35 var(--font-display); letter-spacing: .06em; overflow-wrap: anywhere; text-wrap: balance; }
.sd-seal { flex-shrink: 0; color: var(--text-on-accent); background: var(--accent); outline: 1px solid var(--accent-a35); outline-offset: 2px; writing-mode: vertical-rl; font: 12px/1.5 var(--font-display); letter-spacing: 2px; padding: 4px 2px; transform: rotate(-3deg); }
.sd-tagline { font-size: var(--fs-lead); line-height: 1.7; margin: var(--sp-4) 0; text-wrap: pretty; }
.sd-landscape__art { position: relative; width: 100%; height: 280px; margin-top: var(--sp-5); overflow: hidden; mask-image: linear-gradient(to bottom, transparent, #000 10%, #000 85%, transparent); }
.sd-landscape__art img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.sd-landscape__art--city img { height: 112%; object-fit: cover; object-position: center top; opacity: .7; filter: saturate(.6); }
.sd-landscape__blank { display: grid; place-items: center; min-height: 220px; font: 28px var(--font-display); letter-spacing: .2em; color: var(--text-muted); }
.sd-landscape__caption { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-2); padding-top: var(--sp-3); border-top: 1px solid var(--border-light); font-size: var(--fs-caption); color: var(--text-muted); }
.sd-exploration { position: relative; min-width: 0; padding: var(--panel-padding); border: 1px solid var(--border-light); background: var(--accent-faint); }
.sd-exploration__vignette { position: absolute; top: 0; right: 0; width: 150px; height: 110px; pointer-events: none; background: url('/media/inkwash/atlas/mountain-vignette.webp') center / contain no-repeat; opacity: .2; }
.sd-section-heading { position: relative; }
.sd-section-heading h2 span { display: block; color: var(--text-secondary); font: 400 var(--fs-body-sm)/1.8 var(--font-body); letter-spacing: .02em; margin-top: var(--sp-2); }
.sd-section-heading i, .sd-anthology i, .sd-distribution h2 i { font-size: var(--fs-caption); color: var(--text-muted); font-style: normal; margin-left: var(--sp-2); }
.sd-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-3); padding-bottom: var(--sp-4); border-bottom: 1px solid var(--border-light); margin: var(--sp-5) 0 var(--sp-4); }
.sd-tabs { flex-wrap: wrap; }
.sd-tabs button { cursor: pointer; background: transparent; }
.sd-tabs button.is-active { color: var(--accent); }
.sd-dynasty-filter { margin-left: auto; }
.sd-chart-intro { font-size: var(--fs-body-sm); color: var(--text-secondary); line-height: var(--lh-body); }
.sd-tab-panel { min-width: 0; }
.sd-chart { width: 100%; height: 280px; margin-top: var(--sp-2); }
.sd-chart-note { display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-2); font-size: var(--fs-caption); color: var(--text-muted); padding-top: var(--sp-3); border-top: 1px solid var(--border-light); }
.sd-place-panel { display: grid; place-items: center; }
.sd-location-illustration { width: 100%; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; isolation: isolate; overflow: hidden; padding: var(--sp-5) var(--sp-4); text-align: center; }
.sd-location-rings { position: absolute; inset: 0; z-index: -1; display: grid; place-items: center; }
.sd-location-rings span { position: absolute; border: 1px solid var(--border-light); width: 150px; height: 150px; border-radius: 50%; }
.sd-location-rings span:nth-child(2) { width: 240px; height: 240px; }
.sd-location-rings span:nth-child(3) { width: 330px; height: 330px; }
.sd-location-pin { width: 25px; height: 34px; color: var(--accent); margin-bottom: var(--sp-3); }
.sd-location-illustration h3 { font: 600 var(--fs-h3)/1.5 var(--font-display); }
.sd-location-illustration p { font-size: var(--fs-body-sm); margin: var(--sp-3) 0; font-variant-numeric: tabular-nums; }
.sd-location-illustration > span, .sd-location-illustration small { font-size: var(--fs-caption); color: var(--text-muted); }
.sd-location-illustration small { margin-top: var(--sp-5); }
.sd-poet-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-4); padding-top: var(--sp-5); }
.sd-poet-person { min-width: 0; display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) 0; border-bottom: 1px solid var(--border-light); }
.sd-poet-person img { flex: 0 0 auto; width: 64px; height: 84px; object-fit: contain; mix-blend-mode: multiply; }
.sd-poet-person__seal { flex: 0 0 64px; height: 84px; display: grid; place-items: center; font: 36px var(--font-display); color: var(--accent); background: var(--accent-faint); }
.sd-poet-person__dynasty, .sd-poet-person p { font-size: var(--fs-meta); color: var(--text-muted); }
.sd-poet-person h3 { font-size: var(--fs-card-title); font-weight: 600; margin: var(--sp-1) 0; }
.sd-poet-person__arrow { color: var(--accent); margin-left: auto; }
.sd-anthology { grid-column: 1 / -1; min-width: 0; padding-top: var(--sp-5); border-top: 1px solid var(--border-light); }
.sd-anthology__heading { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--sp-3); margin-bottom: var(--sp-5); }
.sd-anthology__heading > span { font-size: var(--fs-meta); color: var(--text-muted); }
.sd-poet-warning { font-size: var(--fs-body-sm); color: var(--text-secondary); margin-bottom: var(--sp-4); }
.sd-poems { --folio-card-min: 220px; }
.sd-poems-toggle { display: block; min-height: var(--control-height); padding: var(--sp-2) var(--sp-5); margin: var(--sp-5) auto 0; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); font: var(--fs-body-sm) var(--font-body); }
.sd-poems-toggle:hover { color: var(--accent); border-color: var(--accent); }
.sd-poems-toggle span { margin-left: var(--sp-2); }
.sd-poem { min-width: 0; display: flex; flex-direction: column; padding: var(--sp-5); border: 1px solid var(--border-light); background: var(--card-bg); transition: border-color .2s, background .2s; }
.sd-poem:hover { border-color: var(--accent-a35); background: var(--bg-secondary); }
.sd-poem h3 { font: 600 var(--fs-card-title)/1.6 var(--font-heading); overflow-wrap: anywhere; margin-bottom: var(--sp-3); }
.sd-poem__byline { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-2); font-size: var(--fs-meta); line-height: 1.8; color: var(--text-secondary); }
.sd-poem__mood { font-size: var(--fs-caption); background: var(--accent-faint); padding: 2px 6px; border-radius: var(--radius-sm); }
.sd-poem__picture { height: 150px; margin-block: var(--sp-4); overflow: hidden; }
.sd-poem__picture img { width: 100%; height: 100%; object-fit: contain; object-position: center; mix-blend-mode: multiply; }
.sd-poem__portrait-fallback { display: grid; place-items: center; height: 100%; font: 56px var(--font-display); color: var(--accent-a35); }
.sd-poem__verse { font-size: var(--fs-body); line-height: var(--lh-body); white-space: pre-line; color: var(--text-secondary); margin-bottom: var(--sp-5); }
.sd-poem__read { margin-top: auto; padding-top: var(--sp-3); border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; gap: var(--sp-3); color: var(--reading-green); font-size: var(--fs-meta); }
/* 单首作品保持阅读行宽，画像独立成列，避免拉伸成一条横向裁切图。 */
.app-root .route-page .sd-poems--single { grid-template-columns: minmax(0, 1fr); max-width: 760px; }
.sd-poems--single .sd-poem { display: grid; grid-template-columns: 160px minmax(0, 1fr); column-gap: var(--sp-5); }
.sd-poems--single .sd-poem__picture { grid-column: 1; grid-row: 1 / 5; height: 200px; margin: 0; align-self: center; }
.sd-poems--single h3, .sd-poems--single .sd-poem__byline, .sd-poems--single .sd-poem__verse, .sd-poems--single .sd-poem__read { grid-column: 2; }
.sd-poems--single .sd-poem__verse { margin-top: var(--sp-4); }
.sd-distribution { margin: var(--section-gap) 0; padding-block: var(--sp-6); border-block: 1px solid var(--border-light); display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, .32fr); gap: var(--layout-gap); }
.sd-distribution__main { min-width: 0; }
.sd-rings { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--sp-5); margin-top: var(--sp-5); }
.sd-ring { display: flex; align-items: center; gap: var(--sp-3); min-width: 0; }
.sd-ring svg { flex: 0 0 56px; width: 56px; height: 56px; fill: none; }
.sd-ring circle { stroke-width: 4; }
.sd-ring__track { stroke: var(--border-light); }
.sd-ring h3 { font-size: var(--fs-body-sm); font-weight: 600; }
.sd-ring p { font-size: var(--fs-h3); line-height: 1.5; font-variant-numeric: tabular-nums; }
.sd-ring p span { font-size: var(--fs-body-sm); }
.sd-ring small { font-size: var(--fs-caption); color: var(--text-muted); }
.sd-method { border-left: 1px solid var(--border-light); padding-left: var(--sp-5); }
.sd-method h3 { font-size: var(--fs-body); font-weight: 600; margin-bottom: var(--sp-3); }
.sd-method p { font-size: var(--fs-body-sm); line-height: var(--lh-body); color: var(--text-secondary); }
.sd-method summary { cursor: pointer; margin-top: var(--sp-4); color: var(--reading-green); font-size: var(--fs-body-sm); min-height: var(--control-height); }
.sd-method details p { margin-top: var(--sp-3); }
.sd-no-tags { font-size: var(--fs-body-sm); color: var(--text-muted); padding-top: var(--sp-5); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.spot-skeleton__rows { padding-top: var(--sp-5); display: grid; gap: var(--sp-4); }
@media (max-width: 960px) {
  .sd-landscape { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: var(--layout-gap); align-items: center; }
  .sd-landscape__art { margin: 0; height: 260px; }
  .sd-landscape__caption { grid-column: 1 / -1; margin-top: var(--sp-4); }
  .sd-anthology { grid-column: auto; }
  .sd-distribution { grid-template-columns: 1fr; }
  .sd-method { border-left: 0; padding: var(--sp-5) 0 0; border-top: 1px solid var(--border-light); }
}
@media (max-width: 600px) {
  .sd-landscape { display: flex; }
  .sd-landscape__art { margin-top: var(--sp-4); height: 220px; }
  .sd-landscape__caption { width: 100%; }
  .sd-tagline { font-size: 18px; }
  .sd-tabs { width: 100%; }
  .sd-tabs button { flex: 1; padding-inline: 8px; font-size: var(--fs-meta); }
  .sd-dynasty-filter { margin-left: 0; }
  .sd-chart { height: 260px; }
  .sd-poet-list { grid-template-columns: 1fr; }
  .sd-poems--single .sd-poem { grid-template-columns: 88px minmax(0, 1fr); gap: var(--sp-3); padding: var(--sp-4); }
  .sd-poems--single .sd-poem__picture { height: 150px; }
  .sd-poems--single h3 { font-size: 18px; }
  .sd-poems--single .sd-poem__verse { font-size: var(--fs-body-sm); }
}
@media (prefers-reduced-motion: reduce) { .sd-poem { transition: none; } }
</style>
