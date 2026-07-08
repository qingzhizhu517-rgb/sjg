<template>
  <div class="poets-all" :class="{ 'anime-layout': isAnime }">
    <div ref="revealRoot" class="poets-all__content">
      <!-- 紧凑页头 -->
      <header class="pa-head">
        <router-link to="/poets" class="pa-back">← 返回名士</router-link>
        <div class="pa-head-main">
          <h1 class="pa-title">全部名士</h1>
          <span class="pa-count">共 {{ poets.length }} 位 · 跨 {{ dynastyCount }} 朝</span>
        </div>
      </header>

      <!-- 朝代筛选 + 视图切换 -->
      <section class="pa-toolbar" data-reveal>
        <DynastyRail
          v-model="selectedDynastyId"
          :dynasties="dynastyItems"
          aria-label="按朝代筛选名士"
        />
        <div class="layout-toggle-group" role="tablist" aria-label="视图切换">
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'gallery' }"
            @click="activeTab = 'gallery'"
          >书卷长廊</button>
          <button
            class="toggle-btn"
            :class="{ active: activeTab === 'graph' }"
            @click="activeTab = 'graph'"
          >关系图谱</button>
        </div>
      </section>

      <Transition name="tab-fade" mode="out-in" @after-enter="onTabAfterEnter">
        <div v-if="activeTab === 'gallery'" key="gallery" class="gallery-tab-content">
          <section class="pa-section" data-reveal>
            <div class="section-bar">
              <span class="section-bar-title">{{ selectedDynastyName }}</span>
              <span class="section-bar-count">{{ filteredEnrichedPoets.length }} 位</span>
            </div>

            <div class="cards-grid-list" v-if="!enrichmentLoaded">
              <SkeletonBlock v-for="n in 6" :key="n" height="200px" />
            </div>
            <div class="cards-grid-list" v-else-if="filteredEnrichedPoets.length">
              <article
                v-for="p in filteredEnrichedPoets"
                :key="p.id"
                class="poet-card-wrap card hover-lift"
                @click="$router.push(`/poets/${p.id}?from=all`)"
                :aria-label="`查看 ${p.name} 详情`"
              >
                <div class="poet-avatar-box">
                  <img
                    v-if="getPoetAvatar(p)"
                    :src="getPoetAvatar(p)"
                    :alt="p.name"
                    class="poet-img"
                    @error="onAvatarError"
                  />
                  <span class="poet-avatar-stamp">{{ p.name ? p.name.charAt(0) : '文' }}</span>
                  <span class="poet-stamp">文</span>
                </div>
                <div class="poet-card-body">
                  <div class="poet-title-row">
                    <h3 class="poet-name-tag">{{ p.name }}</h3>
                    <span class="poet-dynasty-badge">{{ getDynastyName(p.dynastyId) }}</span>
                  </div>
                  <p v-if="p.biography" class="poet-biography">{{ p.biography.substring(0, 80) }}…</p>
                  <blockquote v-else-if="p.signaturePoem && p.signaturePoem.firstLine" class="poet-sigline">
                    「{{ p.signaturePoem.firstLine }}」
                    <cite v-if="p.signaturePoem.title">《{{ p.signaturePoem.title }}》</cite>
                  </blockquote>
                  <p v-else class="poet-biography poet-biography--empty">生平待考，然其诗已传。</p>
                  <div class="poet-style-box">
                    <span class="style-lbl">传世</span>
                    <span class="style-val">{{ p.poemCount || 0 }} 篇</span>
                  </div>
                </div>
              </article>
            </div>

            <div class="empty-card" v-else>
              <p class="empty-icon">∅</p>
              <p>该朝代暂无收录诗人</p>
            </div>
          </section>
        </div>

        <!-- 关系图谱 (AntV G6) -->
        <div v-else key="graph" class="graph-tab-content">
          <div class="graph-panel-inner card">
            <div class="graph-instructions">
              <span class="instruction-tag">互动</span>
              <p class="instruction-desc">
                滚轮缩放 · 拖拽画布 · 点击节点进入专栏。圆圈代表诗人，方框代表城市，连线越粗关系越深。
              </p>
            </div>
            <div ref="g6Container" class="g6-container-canvas"></div>
            <div class="graph-legend">
              <div class="legend-item"><span class="legend-swatch swatch-poet"></span>诗人</div>
              <div class="legend-item"><span class="legend-swatch swatch-city"></span>城市</div>
              <div class="legend-item"><span class="legend-swatch swatch-edge"></span>交往</div>
              <div class="legend-item"><span class="legend-swatch swatch-dash"></span>行迹</div>
            </div>
          </div>
        </div>
      </Transition>

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadPoets" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { usePoetEnrichment } from '../composables/usePoetEnrichment'
import { useReveal } from '../composables/useReveal'
import api from '../api'
import { Graph } from '@antv/g6'
import DynastyRail from '../components/homepage/DynastyRail.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'

const router = useRouter()
const { isAnime } = useTheme()
const { getImageUrl } = useImage()
const { map: enrichMap, build, enrich } = usePoetEnrichment()
const { reveal } = useReveal()

const DYNASTIES = [
  { id: 1, name: '先秦', start: -2070, end: -221 },
  { id: 2, name: '秦汉', start: -221, end: 220 },
  { id: 3, name: '魏晋南北朝', start: 220, end: 589 },
  { id: 4, name: '隋唐', start: 581, end: 907 },
  { id: 5, name: '宋', start: 960, end: 1279 },
  { id: 9, name: '金', start: 1115, end: 1234 },
  { id: 6, name: '元', start: 1271, end: 1368 },
  { id: 7, name: '明', start: 1368, end: 1644 },
  { id: 8, name: '清', start: 1644, end: 1912 },
]

const activeTab = ref('gallery')
const selectedDynastyId = ref(null)
const poets = ref([])
const poetsLoaded = ref(false)
const enrichmentLoaded = ref(false)
const errorMsg = ref(null)
const revealRoot = ref(null)

const getDynastyName = (id) => DYNASTIES.find((d) => d.id === id)?.name || '古代'
const countByDynasty = (id) => poets.value.filter((p) => p.dynastyId === id).length
const dynastyCount = computed(() => DYNASTIES.filter((d) => countByDynasty(d.id) > 0).length)

const dynastyItems = computed(() => [
  { id: null, name: '全部', poetCount: poets.value.length },
  ...DYNASTIES.map((d) => ({
    id: d.id,
    name: d.name,
    startYear: d.start,
    endYear: d.end,
    poetCount: countByDynasty(d.id),
  })),
])

const selectedDynastyName = computed(() => {
  if (selectedDynastyId.value == null) return '全部名士'
  return getDynastyName(selectedDynastyId.value) + '名士'
})

const enrichedPoets = computed(() => poets.value.map((p) => enrich(p)))
const filteredEnrichedPoets = computed(() => {
  if (selectedDynastyId.value == null) return enrichedPoets.value
  return enrichedPoets.value.filter((p) => p.dynastyId === selectedDynastyId.value)
})

const getPoetAvatar = (poet) => {
  if (!poet) return ''
  const url = isAnime.value ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl
  return url ? getImageUrl(url, isAnime.value) : ''
}
const onAvatarError = (e) => {
  e.target.style.display = 'none'
}

// ==========================================
// AntV G6 Graph
// ==========================================
const g6Container = ref(null)
let graphInstance = null

const handleGraphResize = () => {
  if (graphInstance && g6Container.value) {
    const width = g6Container.value.clientWidth || 800
    const height = g6Container.value.clientHeight || 600
    graphInstance.setSize(width, height)
  }
}

const initG6 = () => {
  if (!g6Container.value) return
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }

  const width = g6Container.value.clientWidth || 800
  const height = g6Container.value.clientHeight || 600

  const graphTheme = isAnime.value
    ? {
        poetFill: '#1a1a1a',
        poetStroke: '#c23a2b',
        cityFill: '#faf6ee',
        cityStroke: '#1a1a1a',
        edgeColor: '#7a7a7a',
        textPrimary: '#e8e4d8',
        accent: '#c23a2b',
        textSecondary: '#9a9484',
        cardBg: '#2a2520',
        lineDash: [4, 4],
      }
    : {
        poetFill: '#b8860b',
        poetStroke: '#3d2b1f',
        cityFill: '#ffffff',
        cityStroke: '#b8860b',
        edgeColor: '#c5b8a5',
        textPrimary: '#3d2b1f',
        accent: '#b8860b',
        textSecondary: '#8a7e6b',
        cardBg: '#fdfaf5',
        lineDash: [4, 4],
      }

  const data = {
    nodes: [
      { id: '1', label: '李白', sub: '唐朝 · 诗仙', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '2', label: '杜甫', sub: '唐朝 · 诗圣', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '3', label: '李清照', sub: '宋朝 · 千古才女', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '4', label: '辛弃疾', sub: '宋朝 · 稼轩豪杰', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '5', label: '赵孟頫', sub: '元朝 · 松雪道人', size: 50, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 12 },
      { id: '6', label: '蒲松龄', sub: '清朝 · 聊斋先生', size: 50, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 12 },
      { id: 'c1', label: '济南', sub: '济南名士多', size: 45, isPoet: false, fillColor: graphTheme.cityFill, strokeColor: graphTheme.cityStroke, labelSize: 12 },
      { id: 'c2', label: '泰安', sub: '会当凌绝顶', size: 45, isPoet: false, fillColor: graphTheme.cityFill, strokeColor: graphTheme.cityStroke, labelSize: 12 },
    ],
    edges: [
      { source: '1', target: '2', label: '李杜齐鲁相会', eStroke: graphTheme.poetStroke, eLineWidth: 2, eDashed: false },
      { source: '2', target: 'c1', label: '历下亭同宴', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '1', target: 'c2', label: '游历泰山', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '2', target: 'c2', label: '写《望岳》', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '3', target: 'c1', label: '生平与居所', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true },
      { source: '4', target: 'c1', label: '生平与归宋', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true },
      { source: '3', target: '4', label: '济南二安', eStroke: graphTheme.poetStroke, eLineWidth: 1.5, eDashed: false },
      { source: '5', target: 'c1', label: '出任总管/描摹鹊华', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true },
    ],
  }

  const positions = {
    '1': [width * 0.2, height * 0.3], '2': [width * 0.4, height * 0.15],
    '3': [width * 0.6, height * 0.3], '4': [width * 0.8, height * 0.25],
    '5': [width * 0.3, height * 0.7], '6': [width * 0.5, height * 0.8],
    'c1': [width * 0.7, height * 0.6], 'c2': [width * 0.15, height * 0.55],
  }
  data.nodes.forEach((n) => {
    if (positions[n.id]) {
      n.x = positions[n.id][0]
      n.y = positions[n.id][1]
    }
  })
  graphInstance = new Graph({
    container: g6Container.value,
    width,
    height,
    data,
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSize: 55,
      linkDistance: 180,
      nodeStrength: 30,
      collideStrength: 1,
      alpha: 0.3,
      alphaDecay: 0.02,
      alphaMin: 0.01,
    },
    node: {
      type: 'circle',
      style: (d) => ({
        fill: d.fillColor,
        stroke: d.strokeColor,
        lineWidth: 2,
        size: d.size || 50,
      }),
      labelText: (d) => d.label,
      labelPlacement: 'bottom',
      labelOffsetY: 8,
      labelFontSize: (d) => d.labelSize || 13,
      labelFontWeight: 'bold',
      labelFill: (d) => (d.isPoet ? graphTheme.textPrimary : graphTheme.accent),
    },
    edge: {
      style: (d) => ({
        stroke: d.eStroke || graphTheme.edgeColor,
        lineWidth: d.eLineWidth || 1,
        lineDash: d.eDashed ? graphTheme.lineDash : undefined,
      }),
      labelText: (d) => d.label || '',
      labelAutoRotate: true,
      labelFontSize: 10,
      labelFill: graphTheme.textSecondary,
      labelBackgroundFill: graphTheme.cardBg,
      labelBackgroundPadding: [2, 4],
      labelBackgroundRadius: 2,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  })

  graphInstance.render()

  graphInstance.on('node:click', (evt) => {
    const modelId = evt.target?.id
    if (modelId && ['1', '2', '3', '4', '5', '6'].includes(modelId)) {
      router.push(`/poets/${modelId}?from=all`)
    } else if (modelId === 'c1') {
      router.push('/regions/济南')
    } else if (modelId === 'c2') {
      router.push('/regions/泰安')
    }
  })
}

// out-in 模式下，图谱面板要等画廊 leave(250ms) 完成后才挂载进 DOM。
// 之前用 nextTick+setTimeout(100) 调 initG6，100ms < 250ms，容器仍为 null -> 早退，图谱永不渲染。
// 改用 Transition 的 @after-enter：面板真正进入 DOM 后才初始化，杜绝竞态。
const onTabAfterEnter = () => {
  if (activeTab.value === 'graph') initG6()
}
watch([activeTab, isAnime], () => {
  if (activeTab.value !== 'graph') {
    // 离开图谱 tab：销毁实例释放资源
    if (graphInstance) {
      graphInstance.destroy()
      graphInstance = null
    }
  } else if (graphInstance) {
    // 已在图谱 tab 上切换主题：用新配色重建（切到 graph 的首次初始化交给 @after-enter）
    nextTick(() => initG6())
  }
})

const loadPoets = async () => {
  errorMsg.value = null
  try {
    const data = await api.get('/poets', { params: { size: 200 } })
    poets.value = data.records || []
    poetsLoaded.value = true
  } catch (e) {
    errorMsg.value = '名士数据加载失败，请稍后重试'
    poetsLoaded.value = true
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleGraphResize)
  await loadPoets()
  await build()
  enrichmentLoaded.value = true
  await nextTick()
  if (revealRoot.value) reveal(revealRoot.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleGraphResize)
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }
})
</script>

<style scoped>
.poets-all {
  max-width: 1440px;
  margin: 0 auto;
}
.poets-all__content {
  padding: 48px 48px 96px;
}

/* 紧凑页头 */
.pa-head {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding-bottom: 24px;
  margin-bottom: 36px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.pa-head::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 88px;
  height: 2px;
  background: var(--accent);
}
.pa-back {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-decoration: none;
  transition: color 0.25s;
  flex-shrink: 0;
}
.pa-back:hover {
  color: var(--accent);
}
.pa-head-main {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}
.pa-title {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 5px;
  margin: 0;
  line-height: 1.1;
}
.pa-count {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* toolbar */
.pa-toolbar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 36px;
}
.layout-toggle-group {
  display: inline-flex;
  gap: 0;
  background: var(--card-bg);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--border);
  align-self: flex-start;
}
.toggle-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
  letter-spacing: 1px;
}
.toggle-btn:hover {
  color: var(--text-primary);
  background: rgba(184, 134, 11, 0.05);
}
.theme-inkwash .toggle-btn:hover {
  background: rgba(194, 58, 43, 0.05);
}
.toggle-btn.active {
  background: var(--accent-dark);
  color: #fff;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
}

.pa-section {
  margin-bottom: 24px;
}
.section-bar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
.section-bar-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.section-bar-count {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* cards grid */
.cards-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}
.poet-card-wrap {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 22px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  text-align: left;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 200px;
}
.poet-card-wrap:hover {
  border-color: var(--accent);
}
.poet-avatar-box {
  position: relative;
  width: 80px;
  height: 104px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--border);
  flex-shrink: 0;
  background: #f4efe4;
}
.theme-inkwash .poet-avatar-box {
  background: #2a2520;
}
.poet-img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.poet-card-wrap:hover .poet-img {
  transform: scale(1.05);
}
.poet-avatar-stamp {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #9e2b25, #6b2820);
}
.theme-real .poet-avatar-stamp {
  background: linear-gradient(135deg, #b8860b, #8b6508);
}
.poet-stamp {
  position: absolute;
  bottom: 4px;
  right: 4px;
  z-index: 3;
  width: 18px;
  height: 18px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.poet-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.poet-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.poet-name-tag {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  line-height: 1.1;
}
.poet-dynasty-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
  padding: 2px 8px;
  background: rgba(184, 134, 11, 0.08);
  border-radius: 2px;
  white-space: nowrap;
}
.theme-inkwash .poet-dynasty-badge {
  background: rgba(194, 58, 43, 0.08);
}
.poet-biography {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.poet-biography--empty {
  font-style: italic;
  color: var(--text-muted);
}
.poet-sigline {
  margin: 0 0 12px 0;
  padding: 0;
  border: none;
  flex: 1;
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.poet-sigline cite {
  font-size: 11px;
  font-style: italic;
  color: var(--text-muted);
  font-weight: 400;
}
.poet-style-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  margin-top: auto;
}
.style-lbl {
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 1px;
}
.style-val {
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-card {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 36px;
  font-weight: 900;
  color: var(--border);
  margin-bottom: 12px;
  line-height: 1;
}

/* graph tab */
.graph-panel-inner {
  padding: 28px;
  display: flex;
  flex-direction: column;
}
.graph-instructions {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(184, 134, 11, 0.04);
  border-left: 3px solid var(--accent);
  padding: 12px 18px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  text-align: left;
}
.theme-inkwash .graph-instructions {
  background: rgba(194, 58, 43, 0.04);
}
.instruction-tag {
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  background: var(--accent);
  padding: 3px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.instruction-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}
.g6-container-canvas {
  width: 100%;
  height: 560px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
}
.graph-legend {
  display: flex;
  gap: 24px;
  padding: 14px 0 0;
  border-top: 1px dashed var(--border-light);
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 1px;
}
.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  flex-shrink: 0;
}
.swatch-poet { background: var(--accent); border-color: var(--accent); }
.swatch-city { background: transparent; border-color: var(--text-primary); }
.swatch-edge { background: transparent; border-color: var(--accent); border-radius: 0; height: 2px; width: 18px; }
.swatch-dash {
  background: repeating-linear-gradient(90deg, var(--text-muted) 0 4px, transparent 4px 8px);
  border: none;
  height: 2px;
  width: 18px;
  border-radius: 0;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-8px); }

@media (min-width: 1600px) {
  .poets-all { max-width: 1560px; }
}
@media (max-width: 1024px) {
  .poets-all__content { padding: 36px 32px 80px; }
  .cards-grid-list { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
}
@media (max-width: 640px) {
  .poets-all__content { padding: 28px 16px 64px; }
  .pa-head { flex-direction: column; gap: 12px; }
  .poet-card-wrap { padding: 16px; gap: 14px; min-height: 180px; }
  .poet-avatar-box { width: 64px; height: 84px; }
  .poet-avatar-stamp { font-size: 28px; }
  .poet-name-tag { font-size: 18px; }
  .g6-container-canvas { height: 440px; }
  .graph-legend { flex-wrap: wrap; gap: 12px 18px; }
  .graph-instructions { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
