<template>
  <div v-if="loading" class="spot-skeleton" aria-busy="true" aria-label="景观加载中">
    <SkeletonBlock height="420px" />
    <div class="spot-skeleton__rows">
      <SkeletonBlock height="34px" width="40%" />
      <SkeletonBlock v-for="i in 4" :key="i" height="18px" :width="`${92 - i * 8}%`" />
    </div>
  </div>
  <ErrorState v-else-if="loadError" :message="loadError" @retry="loadSpot" />
  <EmptyState v-else-if="!spot" icon="景" message="此景观暂未收录" hint="返回山河图志，看看别处" />

  <div v-else class="spot-detail atlas-spot">
    <div class="sd-composition">
      <aside class="sd-landscape" aria-labelledby="spot-name">
        <div class="sd-landscape__copy">
          <router-link :to="atlasLink(`/regions/${spot.region || '泰安'}`, route)" class="sd-back">← {{ spot.region || '齐鲁' }}山水</router-link>
          <div class="sd-title-row">
            <h1 id="spot-name">{{ spot.name }}</h1>
            <span class="sd-seal" aria-hidden="true">山水</span>
          </div>
          <p class="sd-tagline">{{ heroLine }}</p>
          <p class="sd-description">{{ spot.description || '此处景观介绍尚待收录。' }}</p>
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
          <h2 id="emotion-heading">诗词情感曲线 <span>· 同一片山水，不同心境</span><i aria-hidden="true">◇</i></h2>
        </header>
        <div class="sd-controls">
          <div class="sd-tabs" role="tablist" aria-label="诗词浏览方式">
            <button v-for="tab in tabs" :id="`spot-tab-${tab.id}`" :key="tab.id" type="button" role="tab" :aria-controls="`spot-panel-${tab.id}`" :aria-selected="activeTab === tab.id" :tabindex="activeTab === tab.id ? 0 : -1" @keydown="onTabKeydown($event, tab.id)" :class="{ 'is-active': activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
          </div>
          <label class="sd-dynasty-filter">
            <span class="sr-only">筛选朝代</span>
            <select v-model="selectedDynasty" aria-label="筛选朝代">
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
        <div class="sd-anthology__heading"><h2 id="poems-heading">代表诗词 <i aria-hidden="true">◇</i></h2><span>{{ filteredPoems.length }} 首吟咏<span v-if="filteredPoems.length > 5"> · {{ showAllPoems ? '已展示全部' : '展示前 5 首' }}</span></span></div>
        <p v-if="poetLoadWarning" class="sd-poet-warning" role="status">{{ poetLoadWarning }}</p>
        <div id="spot-poem-list" class="sd-poems" :class="{ 'is-expanded': showAllPoems }">
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
        <h2 id="distribution-heading">情感分布概览 <i aria-hidden="true">◇</i></h2>
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
    <SourceList :sources="sources" />
    <div class="folio-detail-actions"><p>山水之外，仍有一城文脉。</p><div class="folio-actions"><router-link :to="atlasLink(`/cities/${spot.region || '济南'}`, route)" class="folio-button">探索城市文化</router-link><router-link :to="atlasLink(`/poems?region=${encodeURIComponent(spot.region || '')}`, route)" class="folio-button folio-button--primary">阅读更多诗词 →</router-link></div></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import api from '../api'
import { useImage } from '../composables/useImage'
import { cityIllustration } from '../config/cityIllustrations'
import { isAtlasPreview, atlasLink, findPreviewSpot, previewPoets, previewDynasties } from '../config/atlasPreview'
import { parseEmotionTags, poemEmotionScore, summarizePoemEmotions } from '../utils/atlasEmotion'
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
    yAxis: { type: 'value', min: 0, max: 100, interval: 25, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#a2998b', fontSize: 10, formatter: (value) => ({ 0: '沉静', 25: '幽思', 50: '婉约', 75: '悠远', 100: '豪放' })[value] || '' } },
    series: [{ name: '情感规则均值', type: 'line', smooth: 0.4, connectNulls: false, symbol: 'circle', symbolSize: mobile ? 8 : 11,
      data: rows.map((row) => ({ value: row.value, itemStyle: { color: '#f6f2e9', borderColor: emotionColor(row.value ?? 50), borderWidth: 2 } })),
      lineStyle: { width: 2, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, stops) },
      areaStyle: { opacity: 0.21, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#b6a17e' }, { offset: 0.55, color: '#cfccb7' }, { offset: 1, color: 'rgba(238,233,221,0)' }]) },
      label: { show: !mobile && rows.length <= 8, position: 'top', distance: 17, color: '#776c5a', fontSize: 11, lineHeight: 17, formatter: (params) => { const row = rows[params.dataIndex]; return row.value !== null ? `${row.poet}\n${row.title.length > 10 ? row.title.slice(0, 9) + '…' : row.title}` : '' } },
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
.atlas-spot {
  --sd-paper: #f5f2eb;
  --sd-ink: #3e3428;
  --sd-muted: #8b8171;
  --sd-line: rgba(133, 116, 89, .15);
  max-width: 1600px;
  margin: 0 auto;
  padding: 44px 38px 48px;
  color: var(--sd-ink);
  text-align: left;
  font-family: var(--font-heading, 'Noto Serif SC', 'Songti SC', serif);
}
.sd-composition { display: grid; grid-template-columns: minmax(250px, 30%) minmax(0, 1fr); column-gap: 36px; position: relative; }
.sd-landscape { grid-row: span 2; position: relative; min-width: 0; min-height: 840px; isolation: isolate; }
.sd-landscape__copy { position: relative; z-index: 2; }
.sd-back { display: inline-flex; gap: 8px; align-items: center; font-size: 10px; letter-spacing: 1.5px; color: #9a8b76; text-decoration: none; margin-bottom: 18px; }
.sd-back:hover { color: #715537; }
.sd-title-row { display: flex; gap: 16px; align-items: center; }
.sd-title-row h1 { font-size: clamp(40px, 4.25vw, 66px); font-weight: 600; letter-spacing: 5px; line-height: 1.25; margin: 0; color: #38291e; }
.sd-seal { font-family: 'KaiTi', 'STKaiti', serif; color: #f8eee3; background: #b76459; border: 1px solid #c3796e; outline: 1px solid #b76459; outline-offset: 2px; writing-mode: vertical-rl; font-size: 9px; letter-spacing: 3px; padding: 3px 1px 0; border-radius: 1px; transform: rotate(-3deg); }
.sd-tagline { font-size: clamp(13px, 1.25vw, 18px); letter-spacing: 1px; margin: 15px 0 22px; line-height: 1.75; white-space: normal; }
.sd-description { max-width: 370px; color: #776d5c; font-size: 12px; line-height: 2; letter-spacing: .4px; margin: 0; }
.sd-landscape__art { position: absolute; z-index: -1; left: -50px; right: -42px; top: 216px; bottom: 0; overflow: hidden; mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent); }
.sd-landscape__art img { width: 100%; height: 100%; object-fit: cover; object-position: center; mix-blend-mode: multiply; }
/* 城市插画兜底：四边羽化融入纸面，裁掉底部生成水印，降低饱和以退居背景 */
.sd-landscape__art--city { mask-image: linear-gradient(to bottom, transparent, #000 14%, #000 78%, transparent 92%), linear-gradient(to right, #000 70%, transparent); mask-composite: intersect; -webkit-mask-composite: source-in; }
.sd-landscape__art--city img { height: 112%; object-position: center top; opacity: .7; filter: saturate(.6); }
.sd-landscape__blank { position: absolute; top: 48%; left: 40%; writing-mode: vertical-rl; color: #b6ad9b; font-size: 32px; letter-spacing: 15px; }
.sd-landscape__caption { position: absolute; left: 0; right: 0; bottom: 2px; color: #8f816c; display: flex; justify-content: space-between; font-size: 10px; letter-spacing: 1px; }
.sd-exploration { position: relative; min-width: 0; padding-top: 27px; }
.sd-exploration__vignette { position: absolute; top: -22px; right: -12px; width: 180px; height: 130px; pointer-events: none; background: url('/media/inkwash/atlas/mountain-vignette.webp') center / contain no-repeat; opacity: .58; mix-blend-mode: multiply; }
.sd-section-heading { position: relative; }
.sd-section-heading::after, .sd-distribution__main > h2::after { content: ''; display: block; width: 31px; height: 2px; margin-top: 14px; background: #9d8454; }
.sd-section-heading h2 { position: relative; margin: 0; color: #493d2d; font-size: 21px; font-weight: 600; letter-spacing: 1px; line-height: 1.6; }
.sd-section-heading h2 span { font-size: 14px; font-weight: 400; letter-spacing: 1px; }
.sd-section-heading i, .sd-anthology i, .sd-distribution h2 i { font-size: 12px; color: #aa9274; font-style: normal; margin-left: 6px; vertical-align: middle; }
.sd-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 22px 0 14px; position: relative; }
.sd-tabs { display: flex; gap: 6px; }
.sd-tabs button { min-height: 36px; padding: 5px 18px; background: transparent; border: 1px solid transparent; border-radius: 30px; color: #786c59; font-family: inherit; font-size: 12px; letter-spacing: 1px; cursor: pointer; white-space: nowrap; }
.sd-tabs button.is-active { border-color: #c8bcab; color: #8b6b45; background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 2px rgba(255,255,255,.4); }
.sd-tabs button:hover { color: #4f3e28; }
.sd-tabs button:focus-visible, .sd-dynasty-filter select:focus-visible, .sd-poem:focus-visible, .sd-poet-person:focus-visible, .sd-method summary:focus-visible, .sd-poems-toggle:focus-visible { outline: 2px solid #a0885e; outline-offset: 4px; }
.sd-dynasty-filter select { max-width: 130px; border: 1px solid #d6ccbc; border-radius: 22px; padding: 7px 27px 7px 13px; font-family: inherit; color: #776a58; font-size: 11px; background: rgba(255,255,255,.12); cursor: pointer; }
.sd-chart-intro { margin: 0; font-size: 12px; color: #928574; line-height: 1.85; }
.sd-tab-panel { min-height: 363px; }
.sd-chart { width: 100%; height: 338px; margin-top: 4px; }
.sd-chart-note { display: flex; justify-content: space-between; gap: 10px; font-size: 9px; color: #a89d8b; letter-spacing: .3px; padding: 0 8px 0 44px; margin-top: -2px; }
.sd-place-panel { display: flex; align-items: center; justify-content: center; }
.sd-location-illustration { width: 100%; min-height: 315px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; isolation: isolate; overflow: hidden; }
.sd-location-rings { position: absolute; inset: 0; z-index: -1; display: grid; place-items: center; }
.sd-location-rings span { position: absolute; border: 1px solid rgba(143,151,123,.17); width: 230px; height: 230px; border-radius: 50%; }
.sd-location-rings span:nth-child(2) { width: 340px; height: 340px; }
.sd-location-rings span:nth-child(3) { width: 460px; height: 460px; }
.sd-location-pin { width: 25px; height: 34px; color: #a58957; margin-bottom: 12px; }
.sd-location-illustration h3 { margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 5px; }
.sd-location-illustration p { margin: 10px 0; font-size: 12px; letter-spacing: 1px; color: #938772; }
.sd-location-illustration > span { font-size: 11px; color: #9c8b73; }
.sd-location-illustration small { position: absolute; bottom: 16px; text-align: center; font-size: 10px; color: #a59a87; padding: 0 10px; }
.sd-poet-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; padding: 20px 0; gap: 10px 25px; }
.sd-poet-person { min-width: 0; display: flex; align-items: center; gap: 15px; padding: 12px 0; text-decoration: none; color: inherit; border-bottom: 1px solid var(--sd-line); }
.sd-poet-person img { width: 80px; height: 94px; object-fit: cover; object-position: center 25%; mix-blend-mode: multiply; }
.sd-poet-person__seal { width: 70px; height: 90px; display: grid; place-items: center; font-size: 35px; color: #b3a591; }
.sd-poet-person__dynasty { font-size: 10px; color: #9b8d78; }
.sd-poet-person h3 { font-size: 20px; letter-spacing: 3px; margin: 4px 0 8px; font-weight: 500; }
.sd-poet-person p { font-size: 10px; color: #9b8d78; margin: 0; }
.sd-poet-person__arrow { color: #b7a88f; margin-left: auto; }
.sd-anthology { position: relative; z-index: 1; margin: 30px 0 0; min-width: 0; }
.sd-anthology__heading { display: flex; align-items: center; justify-content: space-between; margin: 0 0 15px; }
.sd-anthology h2, .sd-distribution h2 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: 1px; }
.sd-anthology__heading > span { font-size: 10px; color: #a49680; }
.sd-poet-warning { margin: -3px 0 12px; font-size: 11px; line-height: 1.7; color: #93816a; }
.sd-poems { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; align-items: stretch; }
.sd-poems.is-expanded { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.sd-poems-toggle { display: block; min-height: 40px; margin: 16px auto 0; padding: 7px 18px; border: 1px solid #d2c6b3; border-radius: 22px; background: transparent; color: #8b7657; font-family: inherit; font-size: 11px; letter-spacing: 1px; cursor: pointer; }
.sd-poems-toggle:hover { border-color: #ae9876; color: #5c4930; }
.sd-poems-toggle span { margin-left: 8px; }
.sd-poem { min-width: 0; min-height: 284px; position: relative; display: flex; flex-direction: column; padding: 15px 13px 12px; border: 1px solid rgba(143,124,92,.13); background: rgba(249,246,239,.65); box-shadow: inset 0 0 0 3px rgba(255,255,255,.25); text-decoration: none; color: inherit; transition: transform .2s, border-color .2s, background .2s; }
.sd-poem:hover { transform: translateY(-4px); border-color: #c4b492; background: rgba(251,248,241,.93); }
.sd-poem h3 { font-size: 12px; font-weight: 500; margin: 0 0 8px; line-height: 1.7; color: #665744; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
.sd-poem__byline { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; justify-content: space-between; font-size: 10px; color: #897c66; line-height: 1.6; }
.sd-poem__mood { font-size: 9px; background: rgba(192,176,142,.12); padding: 0 4px; border-radius: 2px; }
.sd-poem__picture { height: 116px; margin: 6px -4px -2px; overflow: hidden; mask-image: linear-gradient(to bottom, #000 78%, transparent); }
.sd-poem__picture img { width: 100%; height: 100%; object-fit: cover; object-position: center 24%; mix-blend-mode: multiply; filter: saturate(.7); }
.sd-poem__portrait-fallback { display: grid; place-items: center; height: 100%; font-size: 57px; color: #b2a38b; opacity: .5; }
.sd-poem__verse { font-size: 11px; line-height: 1.9; white-space: pre-line; color: #736652; margin: 10px 0 12px; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.sd-poem__read { font-size: 9px; color: #a79881; margin-top: auto; display: flex; justify-content: space-between; border-top: 1px solid rgba(143,124,92,.1); padding-top: 8px; }
.sd-distribution { margin: 40px 0 34px; padding-top: 24px; border-top: 1px solid var(--sd-line); display: grid; grid-template-columns: minmax(0, 1fr) 235px; gap: 40px; }
.sd-rings { display: flex; justify-content: space-between; gap: 15px; margin-top: 24px; }
.sd-ring { display: flex; align-items: center; gap: 9px; min-width: 0; }
.sd-ring svg { flex: 0 0 auto; width: clamp(44px, 5.2vw, 68px); height: clamp(44px, 5.2vw, 68px); fill: none; }
.sd-ring circle { stroke-width: 4; }
.sd-ring__track { stroke: rgba(165,155,132,.15); }
.sd-ring h3 { font-size: 12px; font-weight: 500; margin: 0 0 5px; white-space: nowrap; }
.sd-ring p { margin: 0; font-size: 19px; color: #746047; }
.sd-ring p span { font-size: 12px; margin-left: 1px; }
.sd-ring small { display: block; font-size: 8px; color: #a29580; margin-top: 5px; white-space: nowrap; }
.sd-method { border-left: 1px solid var(--sd-line); padding-left: 22px; }
.sd-method h3 { margin: 0 0 9px; font-size: 14px; font-weight: 500; letter-spacing: 1px; }
.sd-method p { margin: 0; font-size: 10px; line-height: 1.9; color: #93856f; }
.sd-method summary { cursor: pointer; margin-top: 11px; color: #967955; font-size: 11px; list-style: none; }
.sd-method summary::-webkit-details-marker { display: none; }
.sd-method summary span { margin-left: 7px; }
.sd-method details p { margin-top: 9px; }
.sd-no-tags { font-size: 12px; color: #a09078; padding: 20px 0; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.spot-skeleton { max-width: 1320px; margin: 30px auto; padding: 0 24px; }
.spot-skeleton__rows { padding-top: 24px; display: grid; gap: 16px; }
@media (min-width: 1500px) {
  .sd-landscape { min-height: 910px; }
  .sd-chart { height: 380px; }
  .sd-poem { min-height: 310px; }
  .sd-poem__picture { height: 135px; }
}
@media (max-width: 1100px) {
  .atlas-spot { padding: 30px 24px 35px; }
  .sd-composition { grid-template-columns: minmax(215px, 29%) minmax(0, 1fr); column-gap: 22px; }
  .sd-section-heading h2 { font-size: 18px; }
  .sd-section-heading h2 span { font-size: 11px; }
  .sd-tabs button { padding: 5px 11px; font-size: 11px; }
  .sd-poems { gap: 8px; grid-template-columns: repeat(auto-fit, minmax(115px, 1fr)); }
  .sd-poem { padding: 12px 10px 10px; }
  .sd-distribution { gap: 24px; grid-template-columns: minmax(0, 1fr) 190px; }
  .sd-rings { gap: 8px; flex-wrap: wrap; justify-content: flex-start; }
  .sd-ring { flex: 1 0 100px; }
}
@media (max-width: 800px) {
  .atlas-spot { padding: 24px 22px 35px; }
  .sd-composition { grid-template-columns: minmax(190px, 31%) minmax(0, 1fr); column-gap: 17px; }
  .sd-landscape { min-height: 610px; grid-row: auto; }
  .sd-title-row { gap: 11px; }
  .sd-title-row h1 { font-size: 39px; letter-spacing: 2px; }
  .sd-tagline { font-size: 13px; }
  .sd-description { font-size: 11px; line-height: 1.95; }
  .sd-landscape__art { top: 245px; left: -35px; right: -20px; }
  .sd-exploration { padding-top: 35px; }
  .sd-section-heading h2 span { display: block; margin-top: 5px; }
  .sd-section-heading h2 i { display: none; }
  .sd-controls { flex-wrap: wrap; gap: 10px; margin-top: 17px; }
  .sd-tabs { gap: 0; }
  .sd-tabs button { padding: 6px 11px; font-size: 11px; }
  .sd-dynasty-filter { margin-left: auto; }
  .sd-chart { height: 300px; }
  .sd-chart-intro { font-size: 11px; }
  .sd-chart-note { padding-left: 30px; font-size: 8px; }
  .sd-tab-panel { min-height: 330px; }
  .sd-poet-list { grid-template-columns: 1fr; max-height: 335px; overflow-y: auto; }
  .sd-poet-person { padding: 5px 0; }
  .sd-poet-person img { height: 60px; width: 60px; }
  .sd-anthology { grid-column: 1 / -1; margin: 25px 0 0; }
  .sd-poems { grid-template-columns: repeat(auto-fit, minmax(125px, 1fr)); }
  .sd-poem__picture { height: 118px; }
  .sd-distribution { grid-template-columns: 1fr; gap: 25px; margin-top: 32px; }
  .sd-method { border-left: none; border-top: 1px solid var(--sd-line); padding: 18px 0 0; }
  .sd-method p { max-width: 670px; }
  .sd-ring { flex: 1 0 100px; }
}
@media (max-width: 580px) {
  .atlas-spot { padding: 20px 20px 30px; }
  .sd-composition { display: block; }
  .sd-landscape { min-height: 480px; padding-top: 2px; }
  .sd-landscape__copy { max-width: 76%; }
  .sd-back { margin-bottom: 13px; font-size: 9px; }
  .sd-title-row h1 { font-size: 50px; letter-spacing: 4px; }
  .sd-tagline { font-size: 14px; margin: 12px 0 15px; max-width: 245px; }
  .sd-description { font-size: 11px; max-width: 260px; }
  .sd-landscape__art { left: 0; right: -20px; top: 172px; bottom: -10px; mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 82%, transparent); }
  .sd-landscape__art img { object-position: center 55%; opacity: .84; }
  .sd-landscape__caption { bottom: 0; font-size: 9px; }
  .sd-exploration { padding-top: 37px; }
  .sd-exploration__vignette { width: 108px; height: 88px; top: 13px; right: 0; opacity: .43; }
  .sd-section-heading h2 { font-size: 20px; }
  .sd-section-heading h2 span { font-size: 12px; }
  .sd-controls { margin: 18px 0 10px; gap: 8px; }
  .sd-tabs { width: 100%; gap: 6px; }
  .sd-tabs button { flex: 1; padding: 6px 8px; font-size: 12px; }
  .sd-dynasty-filter { margin-top: 3px; }
  .sd-chart-intro { font-size: 10px; margin-top: -32px; max-width: 210px; min-height: 35px; padding-top: 2px; }
  .sd-chart { height: 285px; }
  .sd-chart-note { gap: 5px; padding: 0; font-size: 8px; }
  .sd-tab-panel { min-height: 310px; }
  .sd-poet-list { grid-template-columns: 1fr 1fr; gap: 10px; }
  .sd-poet-person { gap: 8px; flex-wrap: wrap; position: relative; }
  .sd-poet-person img { height: 87px; width: 56px; }
  .sd-poet-person h3 { font-size: 17px; letter-spacing: 1px; }
  .sd-poet-person__arrow { display: none; }
  .sd-poet-person p { font-size: 8px; }
  .sd-anthology { margin-top: 25px; }
  .sd-anthology__heading > span { font-size: 9px; }
  .sd-poems, .sd-poems.is-expanded { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .sd-poem { min-height: 282px; padding: 12px 12px 10px; }
  .sd-poem__picture { height: 130px; }
  .sd-poem h3 { font-size: 11px; min-height: 38px; }
  .sd-poem__verse { font-size: 11px; }
  .sd-poems > .sd-poem:last-child:nth-child(odd) { grid-column: 1 / -1; min-height: 200px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 20px; }
  .sd-poems > .sd-poem:last-child:nth-child(odd) .sd-poem__picture { grid-column: 1; grid-row: 2 / span 3; margin: 0; height: 130px; }
  .sd-poems > .sd-poem:last-child:nth-child(odd) h3 { grid-column: 1 / -1; min-height: 0; }
  .sd-poems > .sd-poem:last-child:nth-child(odd) .sd-poem__byline, .sd-poems > .sd-poem:last-child:nth-child(odd) .sd-poem__verse, .sd-poems > .sd-poem:last-child:nth-child(odd) .sd-poem__read { grid-column: 2; }
  .sd-rings { gap: 22px 10px; margin-top: 22px; }
  .sd-ring { flex: 0 0 calc(33.333% - 7px); gap: 6px; }
  .sd-ring svg { width: 42px; height: 42px; }
  .sd-ring h3 { font-size: 11px; }
  .sd-ring p { font-size: 17px; }
  .sd-ring small { font-size: 7px; }
}
@media (prefers-reduced-motion: reduce) { .sd-poem { transition: none; } .sd-poem:hover { transform: none; } }
.sd-back { min-height:44px; font-size:12px; margin-bottom:10px; }
.sd-controls { display:grid; grid-template-columns:1fr auto; align-items:center; gap:14px; padding-bottom:14px; border-bottom:1px solid var(--border-light); }
.sd-tabs { background:var(--bg-secondary); padding:4px; border-radius:3px; width:fit-content; }
.sd-tabs button { min-height:44px; padding:8px 14px; border-radius:2px; font-size:13px; }
.sd-tabs button.is-active { background:var(--card-bg); border-color:var(--border); box-shadow:none; color:var(--accent); }
.sd-dynasty-filter select { min-height:44px; border-radius:3px; font-size:13px; }
.sd-chart-intro { margin-top:0; font-size:12px; }
@media(max-width:800px) { .sd-controls { display:flex; flex-wrap:wrap; } .sd-tabs button { font-size:12px; padding-inline:10px; } }
@media(max-width:580px) { .sd-controls { display:flex; } .sd-tabs { width:100%; } .sd-tabs button { flex:1; } .sd-chart-intro { margin-top:0; max-width:none; min-height:0; } }
</style>
