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
                滚轮缩放 · 拖拽画布 · 点击节点进入专栏。节点大小 = 关联关系数；环色区分朝代。
              </p>
            </div>

            <!-- 视图模式 + 中心诗人 (P1) -->
            <div v-if="relationGraph.nodes.length" class="graph-toolbar">
              <div class="layout-toggle-group">
                <button
                  class="toggle-btn"
                  :class="{ active: viewMode === 'force' }"
                  @click="switchView('force')"
                >全局图</button>
                <button
                  class="toggle-btn"
                  :class="{ active: viewMode === 'radial' }"
                  @click="switchView('radial')"
                >辐射图</button>
              </div>
              <button
                class="toggle-btn"
                :class="{ active: pathMode }"
                @click="togglePathMode"
              >{{ pathMode ? '退出路径' : '路径查询' }}</button>
              <label v-if="viewMode === 'radial'" class="radial-center-picker">
                <span class="picker-label">中心</span>
                <select
                  class="picker-select"
                  :value="radialCenterId || defaultRadialCenter?.id || ''"
                  @change="onRadialCenterChange"
                >
                  <option
                    v-for="c in radialCandidates"
                    :key="c.id"
                    :value="c.id"
                  >{{ c.name }} · {{ c.dynasty }}</option>
                </select>
              </label>
            </div>

            <!-- P2#6 路径模式提示 -->
            <div v-if="pathMode" class="path-banner">
              <span class="path-banner-text">
                <span v-if="selectedNodeIds.length === 0">请点击第一个诗人作为起点</span>
                <span v-else-if="selectedNodeIds.length === 1">已选起点，再选一个终点</span>
                <span v-else-if="pathInfo?.reachable">
                  <strong>{{ pathInfo.startName }} ↔ {{ pathInfo.endName }}</strong>
                  · {{ pathInfo.length }} 步可达
                </span>
                <span v-else>
                  <strong>{{ pathInfo.startName }} ↔ {{ pathInfo.endName }}</strong>
                  · 不可达
                </span>
              </span>
              <button
                v-if="selectedNodeIds.length"
                class="path-reset-btn"
                @click="resetPathSelection"
              >清空</button>
            </div>

            <!-- 朝代时间滑块 (P1#4) -->
            <div v-if="relationGraph.nodes.length" class="dynasty-slider">
              <div class="slider-header">
                <span class="slider-label">朝代时间</span>
                <span class="slider-active">{{ activeDynastyNames }}</span>
                <span class="slider-range">{{ dynastyRange[0] }} — {{ dynastyRange[1] }}</span>
              </div>
              <div class="slider-row">
                <div class="slider-track">
                  <input
                    type="range"
                    class="slider-input slider-input--min"
                    :min="DYNASTY_YEAR_RANGE[0]"
                    :max="DYNASTY_YEAR_RANGE[1]"
                    :value="dynastyRange[0]"
                    @input="onSliderMinInput"
                    :step="1"
                    aria-label="朝代起点"
                  />
                  <input
                    type="range"
                    class="slider-input slider-input--max"
                    :min="DYNASTY_YEAR_RANGE[0]"
                    :max="DYNASTY_YEAR_RANGE[1]"
                    :value="dynastyRange[1]"
                    @input="onSliderMaxInput"
                    :step="1"
                    aria-label="朝代终点"
                  />
                </div>
                <transition name="preview-fade" mode="out-in">
                  <img
                    v-if="previewImageUrl"
                    :key="previewImageUrl"
                    :src="previewImageUrl"
                    :alt="previewDynasty?.name || ''"
                    class="slider-preview"
                  />
                  <div v-else class="slider-preview slider-preview--empty">无</div>
                </transition>
              </div>
            </div>

            <div v-if="relationLoading" class="graph-skeleton">关系图谱加载中…</div>
            <div v-else-if="relationError" class="graph-error">{{ relationError }}</div>
            <div v-else-if="!relationGraph.nodes.length" class="graph-empty">尚无关系数据</div>
            <div v-show="!relationLoading && relationGraph.nodes.length" ref="g6Container" class="g6-container-canvas"></div>
            <div class="graph-legend">
              <div class="legend-item">
                <span class="legend-swatch swatch-poet"></span>诗人
              </div>
              <div class="legend-item">
                <span class="legend-swatch swatch-city"></span>城市
              </div>
              <div
                v-for="rt in RELATION_TYPES"
                :key="rt"
                class="legend-item"
              >
                <span
                  class="legend-swatch swatch-edge"
                  :class="`swatch-edge--${rt}`"
                ></span>{{ rt }}
              </div>
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
import { cssVar } from '../utils/cssToken'
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

// P1#4 朝代时间范围: [start, end] (年, 含端点). 全部朝代默认全开.
const DYNASTY_YEAR_RANGE = (() => {
  const starts = DYNASTIES.map((d) => d.start)
  const ends = DYNASTIES.map((d) => d.end)
  return [Math.min(...starts), Math.max(...ends)]
})()
const dynastyRange = ref([DYNASTY_YEAR_RANGE[0], DYNASTY_YEAR_RANGE[1]])

const activeDynastyNames = computed(() => {
  const [min, max] = dynastyRange.value
  return DYNASTIES
    .filter((d) => d.start <= max && d.end >= min)
    .map((d) => d.name)
    .join(' · ') || '无朝代'
})

// 滑块预览图: 优先中间朝代
const previewDynasty = computed(() => {
  const [min, max] = dynastyRange.value
  const mid = Math.round((min + max) / 2)
  return DYNASTIES
    .filter((d) => d.start <= mid && d.end >= mid)
    .sort((a, b) => (b.end - b.start) - (a.end - a.start))[0] || null
})
const previewImageUrl = computed(() => {
  const d = previewDynasty.value
  return d ? (DYNASTY_IMAGE[d.id] || null) : null
})

const getPoetStartYear = (dynastyId) => {
  const d = DYNASTIES.find((x) => x.id === dynastyId)
  return d ? d.start : 0
}

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

// 关系类型 -> 边视觉 (P0 边分型 + P3 水墨主题变体)
// 师承: 实线 + 箭头, 表方向; 交游: 实线无箭头, 中性色; 并称: 粗+虚, 视觉成对; 亲属: 虚线 + 暖红
const RELATION_STYLES_REAL = {
  '师承': { stroke: '#d97757', lineWidth: 2.2, lineDash: null,    endArrow: true,  endArrowSize: 9 },
  '交游': { stroke: '#3b82a0', lineWidth: 2.0, lineDash: null,    endArrow: false, endArrowSize: 0  },
  '并称': { stroke: '#8b5cf6', lineWidth: 2.6, lineDash: [10, 4], endArrow: false, endArrowSize: 0  },
  '亲属': { stroke: '#c2410c', lineWidth: 1.8, lineDash: [4, 4],  endArrow: false, endArrowSize: 0  },
}
// P3 水墨: 飞白笔触 + 印章色系 (朱/墨/赭/土朱)
const RELATION_STYLES_INKWASH = {
  '师承': { stroke: '#8b1a1a', lineWidth: 2.4, lineDash: [10, 3, 2, 3], endArrow: true,  endArrowSize: 10 },
  '交游': { stroke: '#2a2520', lineWidth: 2.2, lineDash: [8, 2, 1, 2],  endArrow: false, endArrowSize: 0  },
  '并称': { stroke: '#6b3a2e', lineWidth: 3.0, lineDash: [12, 4],       endArrow: false, endArrowSize: 0  },
  '亲属': { stroke: '#8b4513', lineWidth: 1.6, lineDash: [3, 3],        endArrow: false, endArrowSize: 0  },
}
const RELATION_TYPES = ['师承', '交游', '并称', '亲属']
// 运行时按主题选择
const getRelationStyles = (inkwash) => inkwash ? RELATION_STYLES_INKWASH : RELATION_STYLES_REAL

// 朝代 -> 节点色环 (保持填色 accent, 用 stroke 区分)
const DYNASTY_STROKE = {
  1: '#a78b6d', 2: '#92785c', 3: '#7d6b58', 4: '#c2410c',
  5: '#3b82a0', 6: '#6b7280', 7: '#92765a', 8: '#a89060', 9: '#9a4d3e',
}

// 朝代 id -> 本地主题图 (P0#1 资产生成)
const DYNASTY_IMAGE = {
  4: '/seedream/dynasty/tang.jpg',
  5: '/seedream/dynasty/song.jpg',
  6: '/seedream/dynasty/yuan.jpg',
  7: '/seedream/dynasty/ming.jpg',
  8: '/seedream/dynasty/qing.jpg',
}

// ==========================================
// AntV G6 Graph (P0: 接后端 PoetRelation + 边按关系类型分型)
// ==========================================
const g6Container = ref(null)
const relationGraph = ref({ nodes: [], edges: [] })
const relationLoading = ref(false)
const relationError = ref(null)
const viewMode = ref('force') // 'force' | 'radial'
const radialCenterId = ref(null) // 辐射图中心节点 id
const graphData = ref({ nodes: [], edges: [] }) // 当前图实例数据 (含派生)
const pathMode = ref(false) // P2#6 路径查询模式
const selectedNodeIds = ref([]) // 路径模式下选中的节点 (0-2)
const hoveredNodeId = ref(null)
let graphInstance = null

// 路径查询 BFS (无向, 沿所有边)
const bfsShortestPath = (startId, endId) => {
  const data = graphData.value
  const adj = new Map()
  for (const e of data.edges) {
    const s = String(e.source), t = String(e.target)
    if (!adj.has(s)) adj.set(s, [])
    if (!adj.has(t)) adj.set(t, [])
    adj.get(s).push(t)
    adj.get(t).push(s)
  }
  if (!adj.has(startId) || !adj.has(endId)) return null
  const queue = [[startId]]
  const visited = new Set([startId])
  while (queue.length) {
    const path = queue.shift()
    const node = path[path.length - 1]
    if (node === endId) return path
    for (const nb of (adj.get(node) || [])) {
      if (!visited.has(nb)) {
        visited.add(nb)
        queue.push([...path, nb])
      }
    }
  }
  return null
}

const pathInfo = computed(() => {
  if (selectedNodeIds.value.length !== 2) return null
  const start = selectedNodeIds.value[0]
  const end = selectedNodeIds.value[1]
  const path = bfsShortestPath(start, end)
  const nameById = new Map(graphData.value.nodes.map((n) => [n.id, n.name]))
  if (!path) {
    return {
      reachable: false,
      startName: nameById.get(start) || start,
      endName: nameById.get(end) || end,
      length: null,
    }
  }
  return {
    reachable: true,
    startName: nameById.get(start),
    endName: nameById.get(end),
    length: path.length - 1,
    nodes: path,
  }
})

// P2#6 应用高亮: hover 邻接高亮, 路径模式时高亮最短路径
const applyHighlight = () => {
  if (!graphInstance || !graphData.value.nodes.length) return
  const hoverId = hoveredNodeId.value
  const sel = selectedNodeIds.value

  const highlightNodes = new Set()
  const highlightEdges = new Set()
  const pathEdgeIds = new Set()

  if (pathMode.value && sel.length === 2) {
    const path = bfsShortestPath(sel[0], sel[1])
    if (path) {
      path.forEach((id) => highlightNodes.add(id))
      // 匹配真实 id 形态: e_X_Y / e_h_X_Y / e_d_X_Y (任意前缀)
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1]
        for (const e of graphData.value.edges) {
          const s = String(e.source), t = String(e.target)
          if ((s === a && t === b) || (s === b && t === a)) {
            pathEdgeIds.add(e.id)
          }
        }
      }
    } else {
      highlightNodes.add(sel[0])
      highlightNodes.add(sel[1])
    }
  } else if (pathMode.value && sel.length === 1) {
    highlightNodes.add(sel[0])
    for (const e of graphData.value.edges) {
      if (String(e.source) === sel[0]) {
        highlightNodes.add(String(e.target))
        highlightEdges.add(e.id)
      }
      if (String(e.target) === sel[0]) {
        highlightNodes.add(String(e.source))
        highlightEdges.add(e.id)
      }
    }
  } else if (!pathMode.value && hoverId) {
    highlightNodes.add(hoverId)
    for (const e of graphData.value.edges) {
      if (String(e.source) === hoverId || String(e.target) === hoverId) {
        const other = String(e.source) === hoverId ? String(e.target) : String(e.source)
        highlightNodes.add(other)
        highlightEdges.add(e.id)
      }
    }
  }

  const dim = highlightNodes.size > 0

  const nodeUpdates = graphData.value.nodes.map((n) => ({
    id: n.id,
    style: {
      opacity: !dim || highlightNodes.has(n.id) ? 1 : 0.12,
      lineWidth: highlightNodes.has(n.id) ? 3.5 : (n.isCity ? 1.5 : 2.5),
    },
  }))

  const edgeUpdates = graphData.value.edges.map((e) => {
    const isPath = pathEdgeIds.has(e.id)
    const isHl = highlightEdges.has(e.id) || isPath
    const baseStroke = e.relStroke
    const baseWidth = e.relLineWidth
    let stroke = baseStroke
    let lineWidth = baseWidth
    let opacity = !dim || isHl ? 1 : 0.05
    if (isPath) {
      stroke = '#d4a574'
      lineWidth = 3
    }
    return { id: e.id, style: { stroke, lineWidth, opacity } }
  })

  try {
    graphInstance.updateNodeData(nodeUpdates)
    graphInstance.updateEdgeData(edgeUpdates)
    graphInstance.render()
  } catch (err) {
    console.warn('[highlight] update failed', err)
  }
}

watch([hoveredNodeId, selectedNodeIds, pathMode], () => {
  if (graphInstance) applyHighlight()
})

const togglePathMode = () => {
  pathMode.value = !pathMode.value
  if (!pathMode.value) {
    selectedNodeIds.value = []
    hoveredNodeId.value = null
  }
}

const resetPathSelection = () => {
  selectedNodeIds.value = []
}

// 辐射图可选中心 (图谱中实际出现的诗人)
const radialCandidates = computed(() => {
  return relationGraph.value.nodes
    .map((n) => ({ id: String(n.id), poetId: n.poetId, name: n.name, dynasty: n.dynasty }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
})

// 默认中心: 度数最高
const defaultRadialCenter = computed(() => {
  const edges = relationGraph.value.edges
  const nodes = relationGraph.value.nodes
  if (!edges.length || !nodes.length) return null
  const deg = new Map()
  for (const e of edges) {
    deg.set(String(e.source), (deg.get(String(e.source)) || 0) + 1)
    deg.set(String(e.target), (deg.get(String(e.target)) || 0) + 1)
  }
  let best = null
  for (const n of nodes) {
    const id = String(n.id)
    const d = deg.get(id) || 0
    if (!best || d > best.d) best = { id, d, name: n.name }
  }
  return best
})

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

  const isInkwash = isAnime.value
  const RELATION_STYLES = getRelationStyles(isAnime.value)
  const graphTheme = isInkwash
    ? {
        // P3 水墨主题: 米黄底 + 浓墨字 + 朱红印章
        poetFill: '#faf6ee',
        poetStroke: '#8b1a1a',
        cityFill: '#2a2520',
        cityStroke: '#a78b6d',
        edgeColor: '#2a2520',
        textPrimary: '#1a1612',
        accent: '#8b1a1a',
        textSecondary: '#5a4f42',
        cardBg: '#faf6ee',
        lineDash: [4, 4],
      }
    : {
        poetFill: cssVar('--accent'),
        poetStroke: cssVar('--text-primary'),
        cityFill: '#ffffff',
        cityStroke: cssVar('--accent'),
        edgeColor: '#c5b8a5',
        textPrimary: cssVar('--text-primary'),
        accent: cssVar('--accent'),
        textSecondary: '#8a7e6b',
        cardBg: cssVar('--bg-primary'),
        lineDash: [4, 4],
      }

  // 后端数据 -> G6 data
  const rawNodes = relationGraph.value.nodes
  const rawEdges = relationGraph.value.edges

  // 节点度(关联边数) -> 节点尺寸
  const degree = new Map()
  for (const e of rawEdges) {
    degree.set(e.source, (degree.get(e.source) || 0) + 1)
    degree.set(e.target, (degree.get(e.target) || 0) + 1)
  }

  // P2#5 派生城市节点: 诗人 birthplace 提取山东相关城市
  // city name -> {id, imageUrl} 映射 (本地 public 资源)
  const CITY_IMAGE_MAP = {
    '济南': '/seedream/city/jinan.jpg',
    '泰安': '/seedream/city/taian.jpg',
    '淄博': '/seedream/city/zibo.jpg',
    '曲阜': '/seedream/city/qufu.jpg',
    '青岛': '/seedream/city/qingdao.jpg',
    '蓬莱': '/seedream/city/penglai.jpg',
  }
  const cityByName = new Map()
  const poetCityMap = new Map() // poetId -> cityId
  for (const n of rawNodes) {
    if (!n.birthplace) continue
    const m = n.birthplace.match(/山东([一-龥]{2,4}?)(?:市|府|县|区|州|郡)?/)
    if (!m) continue
    const cityName = m[1]
    const cityId = `city_${cityName}`
    if (!cityByName.has(cityId)) {
      cityByName.set(cityId, {
        id: cityId,
        name: `${cityName}`,
        poetIds: [],
        imageUrl: CITY_IMAGE_MAP[cityName] || null,
      })
    }
    cityByName.get(cityId).poetIds.push(String(n.id))
    poetCityMap.set(String(n.id), cityId)
  }

  const data = {
    nodes: [
      ...rawNodes.map((n) => {
        const d = degree.get(String(n.id)) || 0
        const size = 38 + Math.min(d, 5) * 6
        return {
          id: String(n.id),
          poetId: n.poetId,
          name: n.name,
          dynasty: n.dynasty,
          dynastyId: n.dynastyId,
          style: n.style,
          size,
          isPoet: true,
          isCity: false,
          fillColor: graphTheme.poetFill,
          strokeColor: DYNASTY_STROKE[n.dynastyId] || graphTheme.poetStroke,
        }
      }),
      ...[...cityByName.values()].map((c) => ({
        id: c.id,
        poetId: null,
        name: c.name,
        dynasty: '',
        dynastyId: null,
        size: [84, 56],
        isPoet: false,
        isCity: true,
        imageUrl: c.imageUrl,
        fillColor: graphTheme.cardBg,
        strokeColor: graphTheme.textSecondary,
      })),
    ],
    edges: rawEdges.map((e) => {
        const rel = RELATION_STYLES[e.relationType] || null
        return {
          id: `e_${e.source}_${e.target}`,
          source: String(e.source),
          target: String(e.target),
          relationType: e.relationType,
          description: e.description,
          relStroke: rel?.stroke || graphTheme.edgeColor,
          relLineWidth: rel?.lineWidth || 1.2,
          relLineDash: rel?.lineDash || undefined,
          relEndArrow: rel?.endArrow || false,
          relEndArrowSize: rel?.endArrowSize || 0,
        }
      }),
  }

  // P2#5 派生边: 籍贯 (诗人 -> 城市)
  for (const [poetId, cityId] of poetCityMap.entries()) {
    data.edges.push({
      id: `e_h_${poetId}_${cityId}`,
      source: poetId,
      target: cityId,
      relationType: '籍贯',
      description: '籍贯',
      relStroke: graphTheme.edgeColor,
      relLineWidth: 1.0,
      relLineDash: [2, 3],
      relEndArrow: false,
      relEndArrowSize: 0,
    })
  }

  // 注: 同朝代聚类边移除 — 当前 seed 关系网已覆盖所有同朝诗人对, 派生无新增信息且视觉冗余

  // 过滤源/目标不存在的边
  const nodeIds = new Set(data.nodes.map((n) => n.id))
  data.edges = data.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
  graphData.value = data
  graphInstance = new Graph({
    container: g6Container.value,
    width,
    height,
    data,
    layout: viewMode.value === 'radial'
      ? (() => {
          const center = radialCenterId.value
            || defaultRadialCenter.value?.id
            || (data.nodes[0] && data.nodes[0].id)
          // 确保中心节点存在, 否则回退 force
          if (!center || !data.nodes.find((n) => n.id === center)) {
            return {
              type: 'force',
              preventOverlap: true,
              nodeSize: 55,
              linkDistance: 180,
              nodeStrength: 30,
              collideStrength: 1,
              alpha: 0.3,
              alphaDecay: 0.02,
              alphaMin: 0.01,
            }
          }
          return {
            type: 'radial',
            focusNode: center,
            unitRadius: 90,
            preventOverlap: true,
            nodeSize: 50,
            strictRadial: false,
          }
        })()
      : {
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
      type: (d) => (d.isCity && d.imageUrl ? 'image' : (d.isCity ? 'rect' : 'circle')),
      style: (d) => {
        if (d.isCity && d.imageUrl) {
          return {
            src: d.imageUrl,
            size: d.size,
            cursor: 'pointer',
            opacity: 1,
          }
        }
        if (d.isCity) {
          return {
            fill: d.fillColor,
            stroke: d.strokeColor,
            lineWidth: 1.5,
            radius: 4,
            size: d.size,
            cursor: 'pointer',
          }
        }
        return {
          fill: d.fillColor,
          stroke: d.strokeColor,
          lineWidth: 2.5,
          size: d.size || 50,
          cursor: 'pointer',
        }
      },
      labelText: (d) => d.isCity ? d.name : `${d.name} · ${d.dynasty || ''}`,
      labelPlacement: 'bottom',
      labelOffsetY: 8,
      labelFontSize: (d) => d.isCity ? 11 : 12,
      labelFontWeight: 600,
      labelFill: graphTheme.textPrimary,
    },
    edge: {
      type: 'line',
      style: (d) => ({
        stroke: d.relStroke,
        lineWidth: d.relLineWidth,
        lineDash: d.relLineDash,
        endArrow: d.relEndArrow
          ? { path: 'M 0,0 L 8,4 L 0,8 Z', size: d.relEndArrowSize, fill: d.relStroke }
          : false,
        endArrowSize: d.relEndArrowSize || 0,
      }),
      labelText: (d) => d.description || d.relationType || '',
      labelAutoRotate: true,
      labelFontSize: 9,
      labelFontWeight: 500,
      labelFill: (d) => d.relStroke,
      labelBackgroundFill: graphTheme.cardBg,
      labelBackgroundPadding: [2, 4],
      labelBackgroundRadius: 2,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
  })

  graphInstance.render()

  // P2#6 hover 邻接高亮
  graphInstance.on('node:hover', (evt) => {
    if (pathMode.value) return // 路径模式不显示 hover 高亮
    hoveredNodeId.value = String(evt.target?.id)
  })
  graphInstance.on('node:hoverleave', () => {
    hoveredNodeId.value = null
  })

  graphInstance.on('node:click', (evt) => {
    const target = evt.target
    const id = String(target?.id)
    if (pathMode.value) {
      // 路径模式: 选 0/1/2 节点
      if (selectedNodeIds.value.includes(id)) {
        selectedNodeIds.value = selectedNodeIds.value.filter((x) => x !== id)
      } else if (selectedNodeIds.value.length < 2) {
        selectedNodeIds.value = [...selectedNodeIds.value, id]
      } else {
        selectedNodeIds.value = [id]
      }
      return
    }
    // 跳路由: G6 v5 target.id = data.id, 从 graphData 查 poetId
    const node = graphData.value.nodes.find((n) => n.id === id)
    const poetId = node?.poetId
    if (poetId) {
      router.push(`/poets/${poetId}?from=all`)
    }
  })

  graphInstance.on('canvas:click', () => {
    if (pathMode.value) selectedNodeIds.value = []
  })
}

// out-in 模式下，图谱面板要等画廊 leave(250ms) 完成后才挂载进 DOM。
// 之前用 nextTick+setTimeout(100) 调 initG6，100ms < 250ms，容器仍为 null -> 早退，图谱永不渲染。
// 改用 Transition 的 @after-enter：面板真正进入 DOM 后才初始化，杜绝竞态。
const onTabAfterEnter = () => {
  if (activeTab.value === 'graph') initG6()
}

// P1: 切换视图模式
const switchView = (mode) => {
  if (viewMode.value === mode) return
  viewMode.value = mode
  if (mode === 'radial' && !radialCenterId.value) {
    radialCenterId.value = defaultRadialCenter.value?.id || null
  }
  if (graphInstance) nextTick(() => initG6())
}

const onRadialCenterChange = (e) => {
  radialCenterId.value = e.target.value || null
  if (graphInstance) nextTick(() => initG6())
}

// P1#4 朝代滑块: 通过 updateNodeData/updateEdgeData 原地改透明度
const applyDynastyFilter = () => {
  if (!graphInstance || !graphData.value.nodes.length) return
  const [min, max] = dynastyRange.value
  // 节点: 含 city. 诗人按朝代起始年, 城市按"至少一个关联诗人在范围内"判定
  const nodeUpdates = graphData.value.nodes.map((n) => {
    let visible
    if (n.isCity) {
      const linkedPoets = graphData.value.edges
        .filter((e) => String(e.source) === n.id || String(e.target) === n.id)
        .map((e) => String(e.source) === n.id ? String(e.target) : String(e.source))
        .map((pid) => graphData.value.nodes.find((x) => x.id === pid))
        .filter((p) => p && p.dynastyId)
      visible = linkedPoets.some((p) => {
        const y = getPoetStartYear(p.dynastyId)
        return y >= min && y <= max
      })
    } else {
      const y = getPoetStartYear(n.dynastyId)
      visible = y != null && y >= min && y <= max
    }
    return {
      id: n.id,
      style: { opacity: visible ? 1 : 0.08 },
    }
  })
  // 边: 两端节点都在范围内才高亮
  const nodeVisible = new Map(nodeUpdates.map((u) => [u.id, u.style.opacity > 0.5]))
  const edgeUpdates = graphData.value.edges.map((e) => {
    const visible = nodeVisible.get(String(e.source)) && nodeVisible.get(String(e.target))
    return {
      id: e.id,
      style: { opacity: visible ? 1 : 0.05 },
    }
  })
  try {
    graphInstance.updateNodeData(nodeUpdates)
    graphInstance.updateEdgeData(edgeUpdates)
    graphInstance.draw()
  } catch (err) {
    // 容错: 滑块拖动期间偶发 G6 内部状态, 重建图
    console.warn('[graph filter] update failed, reinit', err)
    nextTick(() => initG6())
  }
}

watch(dynastyRange, () => {
  if (graphInstance) applyDynastyFilter()
})

const onSliderMinInput = (e) => {
  const v = Number(e.target.value)
  // 保证 min <= max
  dynastyRange.value = [Math.min(v, dynastyRange.value[1]), dynastyRange.value[1]]
}
const onSliderMaxInput = (e) => {
  const v = Number(e.target.value)
  dynastyRange.value = [dynastyRange.value[0], Math.max(v, dynastyRange.value[0])]
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

// 加载诗人关系图谱数据 (P0: 接后端 PoetRelation)
const loadRelations = async () => {
  relationLoading.value = true
  relationError.value = null
  try {
    const data = await api.get('/poet-relations')
    relationGraph.value = {
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      edges: Array.isArray(data?.edges) ? data.edges : [],
    }
  } catch (e) {
    relationError.value = e.message || '关系数据加载失败'
    relationGraph.value = { nodes: [], edges: [] }
  } finally {
    relationLoading.value = false
  }
}

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
  await Promise.all([loadPoets(), loadRelations()])
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
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}
.toggle-btn.active {
  background: var(--accent-dark);
  color: #fff;
  box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 0.2%, transparent);
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
  background: var(--bg-primary);
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
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.theme-real .poet-avatar-stamp {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
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
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-radius: 2px;
  white-space: nowrap;
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
  background: color-mix(in srgb, var(--accent) 4%, transparent);
  border-left: 3px solid var(--accent);
  padding: 12px 18px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  text-align: left;
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
  position: relative;
}
/* P3 水墨主题: 画布底色加宣纸纹理 + 远山晕染 */
.theme-inkwash .g6-container-canvas {
  background:
    radial-gradient(ellipse at 20% 90%, rgba(139, 26, 26, 0.04), transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 37, 32, 0.05), transparent 65%),
    linear-gradient(180deg, #f7f1e3 0%, #ebe0c8 100%);
}
.theme-inkwash .g6-container-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 15% 80%, rgba(139, 26, 26, 0.06) 0%, transparent 12%),
    radial-gradient(circle at 85% 15%, rgba(42, 37, 32, 0.08) 0%, transparent 14%);
  border-radius: 4px;
  z-index: 0;
}
.theme-inkwash .g6-container-canvas > * { position: relative; z-index: 1; }
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
.swatch-city {
  background: transparent;
  border-color: var(--text-secondary);
  border-radius: 2px;
  width: 16px;
  height: 12px;
}
.swatch-edge {
  background: var(--accent);
  border: none;
  border-radius: 0;
  height: 3px;
  width: 22px;
}
.swatch-edge--师承 { background: #d97757; }
.swatch-edge--交游 { background: #3b82a0; }
.swatch-edge--并称 {
  background: repeating-linear-gradient(90deg, #8b5cf6 0 6px, transparent 6px 10px);
  height: 4px;
}
.swatch-edge--亲属 {
  background: repeating-linear-gradient(90deg, #c2410c 0 4px, transparent 4px 8px);
  height: 2px;
}

.graph-skeleton,
.graph-error,
.graph-empty {
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 1px;
  border: 1px dashed var(--border);
  border-radius: 4px;
  background: var(--card-bg);
}
.graph-error { color: #c2410c; }

.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.radial-center-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.picker-label {
  font-weight: 700;
  color: var(--text-muted);
}
.picker-select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 2px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.picker-select:hover,
.picker-select:focus {
  border-color: var(--accent);
}

.dynasty-slider {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px dashed var(--border);
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 3%, transparent);
}
.slider-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.slider-label {
  font-weight: 700;
  color: var(--text-primary);
}
.slider-active {
  color: var(--accent);
  font-weight: 600;
}
.slider-range {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
}
.slider-track {
  position: relative;
  height: 24px;
  flex: 1;
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.slider-preview {
  width: 96px;
  height: 56px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.slider-preview--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 11px;
  background: var(--card-bg);
}
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.25s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to { opacity: 0; }
.slider-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 24px;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
}
.slider-input--min { z-index: 2; }
.slider-input--max { z-index: 1; }
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid #fff;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid #fff;
  cursor: pointer;
  pointer-events: auto;
}
.slider-input::-webkit-slider-runnable-track {
  background: linear-gradient(to right,
    var(--accent) 0%,
    var(--accent) 50%,
    var(--border) 50%,
    var(--border) 100%);
  height: 3px;
  border-radius: 2px;
}

.path-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 16px;
  margin-bottom: 14px;
  border: 1px solid var(--accent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  font-size: 13px;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.path-banner-text { flex: 1; }
.path-banner strong { color: var(--accent); font-weight: 700; }
.path-reset-btn {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.path-reset-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
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
