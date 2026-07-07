<template>
  <div class="poets-view" :class="{ 'anime-layout': isAnime }">
    <!-- HERO -->
    <header class="view-header">
      <div class="header-left-pane">
        <span class="hero-eyebrow">— 齐 鲁 文 脉 —</span>
        <h1 class="view-title">文人廊</h1>
        <p class="view-subtitle">
          探寻黄河流域历代齐鲁大家之生平轨迹与文学连结，<br class="header-break" />
          自诗经楚辞而下，李杜苏辛薪火相传。
        </p>

        <div class="header-stats">
          <div class="h-stat">
            <span class="h-stat-num">{{ poets.length || '—' }}</span>
            <span class="h-stat-lbl">位文人</span>
          </div>
          <span class="h-stat-sep">·</span>
          <div class="h-stat">
            <span class="h-stat-num">{{ dynasties.length - 1 }}</span>
            <span class="h-stat-lbl">个朝代</span>
          </div>
          <span class="h-stat-sep">·</span>
          <div class="h-stat">
            <span class="h-stat-num">200<span class="h-stat-plus">+</span></span>
            <span class="h-stat-lbl">传世诗篇</span>
          </div>
        </div>
      </div>

      <!-- Layout Switcher: Gallery vs Graph -->
      <div class="layout-toggle-group" role="tablist" aria-label="文人廊视图切换">
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'gallery' }"
          role="tab"
          :aria-selected="activeTab === 'gallery'"
          @click="activeTab = 'gallery'"
        >
          <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>书卷长廊</span>
        </button>
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'graph' }"
          role="tab"
          :aria-selected="activeTab === 'graph'"
          @click="activeTab = 'graph'"
        >
          <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <line x1="7.7" y1="7.2" x2="10.8" y2="16.5" />
            <line x1="16.3" y1="7.2" x2="13.2" y2="16.5" />
            <line x1="8.2" y1="6" x2="15.8" y2="6" />
          </svg>
          <span>关系图谱</span>
        </button>
      </div>
    </header>

    <!-- GALLERY TAB VIEW -->
    <Transition name="tab-fade" mode="out-in">
      <div class="gallery-tab-content" v-if="activeTab === 'gallery'" key="gallery">
        <div class="poets-layout-grid">
          <!-- Left: Bamboo Scrolls filter -->
          <aside class="bamboo-scrolls-aside">
            <div class="aside-head">
              <span class="aside-title">历朝文脉</span>
              <span class="aside-hint">点击筛选</span>
            </div>
            <div class="bamboo-list">
              <button
                v-for="dyn in dynasties"
                :key="dyn.id ?? 'all'"
                class="bamboo-item"
                :class="{ active: selectedDynastyId === dyn.id }"
                @click="selectedDynastyId = dyn.id"
              >
                <span class="bamboo-label">{{ dyn.name }}</span>
                <span class="bamboo-count" v-if="dyn.id !== null">{{ countByDynasty(dyn.id) }}</span>
              </button>
            </div>
          </aside>

          <!-- Right: Poets cards grid -->
          <section class="poets-cards-section">
            <div class="section-bar">
              <span class="section-bar-title">
                {{ selectedDynastyName }}
              </span>
              <span class="section-bar-count">
                {{ filteredPoets.length }} 位
              </span>
            </div>

            <div class="cards-grid-list" v-if="filteredPoets.length">
              <article
                v-for="poet in filteredPoets"
                :key="poet.id"
                class="poet-card-wrap card hover-lift"
                @click="$router.push(`/poets/${poet.id}`)"
                :aria-label="`查看 ${poet.name} 详情`"
              >
                <div class="poet-avatar-box">
                  <img :src="getPoetAvatar(poet)" :alt="poet.name" class="poet-img" />
                  <span class="poet-stamp">文</span>
                </div>
                <div class="poet-card-body">
                  <div class="poet-title-row">
                    <h3 class="poet-name-tag">{{ poet.name }}</h3>
                    <span class="poet-dynasty-badge">{{ getDynastyName(poet.dynastyId) }}</span>
                  </div>
                  <p class="poet-biography">{{ poet.biography?.substring(0, 80) }}…</p>
                  <div class="poet-style-box" v-if="poet.style">
                    <span class="style-lbl">风格</span>
                    <span class="style-val">{{ poet.style }}</span>
                  </div>
                  <div class="poet-card-foot">
                    <span class="foot-arrow">查看详情</span>
                    <span class="foot-arrow-icon">→</span>
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
      </div>

      <!-- RELATIONSHIP GRAPH TAB VIEW (AntV G6) -->
      <div class="graph-tab-content" v-else key="graph">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import api from '../api'
import { Graph } from '@antv/g6'

const router = useRouter()
const { isAnime } = useTheme()
const { getImageUrl } = useImage()

const activeTab = ref('gallery')
const selectedDynastyId = ref(null)

const poets = ref([])
const dynasties = ref([
  { id: null, name: '全部朝代' },
  { id: 4, name: '唐代文豪' },
  { id: 5, name: '宋代词家' },
  { id: 6, name: '元代书画' },
  { id: 8, name: '清代聊斋' }
])

const filteredPoets = computed(() => {
  if (!selectedDynastyId.value) return poets.value
  return poets.value.filter(p => p.dynastyId === selectedDynastyId.value)
})

const selectedDynastyName = computed(() => {
  if (!selectedDynastyId.value) return '全部文人'
  return dynasties.value.find(d => d.id === selectedDynastyId.value)?.name || '文人'
})

const countByDynasty = (dynastyId) => {
  return poets.value.filter(p => p.dynastyId === dynastyId).length
}

const getPoetAvatar = (poet) => {
  if (!poet) return ''
  const url = isAnime.value ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl
  return getImageUrl(url, isAnime.value)
}

const getDynastyName = (dynastyId) => {
  const mapping = {
    1: '先秦', 2: '秦汉', 3: '魏晋南北朝', 4: '唐代',
    5: '宋代', 6: '元代', 7: '明代', 8: '清代'
  }
  return mapping[dynastyId] || '古代'
}

// ==========================================
// AntV G6 Graph implementation
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

  // G6 renders to Canvas, CSS variables won't resolve — compute actual hex colors
  const graphTheme = isAnime.value ? {
    poetFill: '#1a1a1a',
    poetStroke: '#c23a2b',
    cityFill: '#faf6ee',
    cityStroke: '#1a1a1a',
    edgeColor: '#7a7a7a',
    textPrimary: '#e8e4d8',
    accent: '#c23a2b',
    textSecondary: '#9a9484',
    cardBg: '#2a2520',
    lineDash: [4, 4]
  } : {
    poetFill: '#b8860b',
    poetStroke: '#3d2b1f',
    cityFill: '#ffffff',
    cityStroke: '#b8860b',
    edgeColor: '#c5b8a5',
    textPrimary: '#3d2b1f',
    accent: '#b8860b',
    textSecondary: '#8a7e6b',
    cardBg: '#fdfaf5',
    lineDash: [4, 4]
  }

  // G6 v5: data passed via constructor, flat per-node properties instead of nested style/labelCfg
  const data = {
    nodes: [
      { id: '1', label: '李白', sub: '唐朝 · 诗仙', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '2', label: '杜甫', sub: '唐朝 · 诗圣', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '3', label: '李清照', sub: '宋朝 · 千古才女', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '4', label: '辛弃疾', sub: '宋朝 · 稼轩豪杰', size: 55, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 13 },
      { id: '5', label: '赵孟頫', sub: '元朝 · 松雪道人', size: 50, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 12 },
      { id: '6', label: '蒲松龄', sub: '清朝 · 聊斋先生', size: 50, isPoet: true, fillColor: graphTheme.poetFill, strokeColor: graphTheme.poetStroke, labelSize: 12 },
      { id: 'c1', label: '济南', sub: '济南名士多', size: 45, isPoet: false, fillColor: graphTheme.cityFill, strokeColor: graphTheme.cityStroke, labelSize: 12 },
      { id: 'c2', label: '泰安', sub: '会当凌绝顶', size: 45, isPoet: false, fillColor: graphTheme.cityFill, strokeColor: graphTheme.cityStroke, labelSize: 12 }
    ],
    edges: [
      { source: '1', target: '2', label: '李杜齐鲁相会', eStroke: graphTheme.poetStroke, eLineWidth: 2, eDashed: false },
      { source: '2', target: 'c1', label: '历下亭同宴', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '1', target: 'c2', label: '游历泰山', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '2', target: 'c2', label: '写《望岳》', eStroke: graphTheme.poetStroke, eLineWidth: 1, eDashed: true },
      { source: '3', target: 'c1', label: '生平与居所', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true },
      { source: '4', target: 'c1', label: '生平与归宋', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true },
      { source: '3', target: '4', label: '济南二安', eStroke: graphTheme.poetStroke, eLineWidth: 1.5, eDashed: false },
      { source: '5', target: 'c1', label: '出任总管/描摹鹊华', eStroke: graphTheme.edgeColor, eLineWidth: 1, eDashed: true }
    ]
  }

  const positions = {
    '1': [width * 0.2, height * 0.3],  '2': [width * 0.4, height * 0.15],
    '3': [width * 0.6, height * 0.3],  '4': [width * 0.8, height * 0.25],
    '5': [width * 0.3, height * 0.7],  '6': [width * 0.5, height * 0.8],
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
        size: d.size || 50
      }),
      labelText: (d) => d.label,
      labelPlacement: 'bottom',
      labelOffsetY: 8,
      labelFontSize: (d) => d.labelSize || 13,
      labelFontWeight: 'bold',
      labelFill: (d) => d.isPoet ? graphTheme.textPrimary : graphTheme.accent
    },
    edge: {
      style: (d) => ({
        stroke: d.eStroke || graphTheme.edgeColor,
        lineWidth: d.eLineWidth || 1,
        lineDash: d.eDashed ? graphTheme.lineDash : undefined
      }),
      labelText: (d) => d.label || '',
      labelAutoRotate: true,
      labelFontSize: 10,
      labelFill: graphTheme.textSecondary,
      labelBackgroundFill: graphTheme.cardBg,
      labelBackgroundPadding: [2, 4],
      labelBackgroundRadius: 2
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element']
  })

  graphInstance.render()

  graphInstance.on('node:click', (evt) => {
    const modelId = evt.target?.id
    if (modelId && ['1', '2', '3', '4', '5', '6'].includes(modelId)) {
      router.push(`/poets/${modelId}`)
    } else if (modelId === 'c1') {
      router.push('/regions/济南')
    } else if (modelId === 'c2') {
      router.push('/regions/泰安')
    }
  })
}

watch([activeTab, isAnime], () => {
  if (activeTab.value === 'graph') {
    nextTick(() => {
      setTimeout(() => {
        initG6()
      }, 100)
    })
  } else {
    if (graphInstance) {
      graphInstance.destroy()
      graphInstance = null
    }
  }
})

onMounted(async () => {
  window.addEventListener('resize', handleGraphResize)
  const data = await api.get('/poets', { params: { size: 100 } })
  poets.value = data.records
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
/* ============================================
   POETS PAGE — Typeset 2026
   ============================================ */

.poets-view {
  max-width: 1440px;
  margin: 0 auto;
  padding: 56px 48px 96px;
}

/* ---------- HERO ---------- */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 48px;
  padding-bottom: 32px;
  margin-bottom: 48px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.view-header::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 96px;
  height: 2px;
  background: var(--accent);
}

.header-left-pane {
  text-align: left;
  flex: 1;
  min-width: 0;
}

.hero-eyebrow {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 5px;
  color: var(--accent);
  margin-bottom: 16px;
  text-indent: 5px;
}

.view-title {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  line-height: 1;
  margin: 0 0 18px 0;
}

.view-subtitle {
  font-size: 14.5px;
  line-height: 1.9;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin: 0 0 24px 0;
  max-width: 560px;
}

.header-break { display: none; }

.header-stats {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-top: 8px;
}

.h-stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.h-stat-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 0;
  line-height: 1;
}

.h-stat-plus {
  font-size: 14px;
  color: var(--accent);
  margin-left: 1px;
}

.h-stat-lbl {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
  font-weight: 600;
}

.h-stat-sep {
  color: var(--border);
  font-size: 18px;
  user-select: none;
}

/* ---------- Tabs switcher ---------- */
.layout-toggle-group {
  display: inline-flex;
  gap: 0;
  background: var(--card-bg);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
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

.toggle-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ---------- GALLERY LAYOUT ---------- */
.poets-layout-grid {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 48px;
  align-items: start;
}

.bamboo-scrolls-aside {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  position: sticky;
  top: 24px;
}

.aside-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--accent);
}

.aside-title {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.aside-hint {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.bamboo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.bamboo-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 96px;
  width: 100%;
  background: linear-gradient(135deg, #fdf8e6 0%, #eee4c9 100%);
  border: 1px solid #c2b595;
  box-shadow: 1px 1px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  writing-mode: vertical-rl;
  text-orientation: upright;
  padding: 12px 0;
}

.bamboo-item:hover {
  transform: translateX(2px);
  box-shadow: 2px 4px 10px rgba(0,0,0,0.08);
  border-color: var(--accent);
}

.bamboo-item.active {
  background: linear-gradient(135deg, #8e352e 0%, #6b2820 100%);
  border-color: #6b2820;
  color: #fff;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.25), 2px 4px 10px rgba(142, 53, 46, 0.3);
  transform: translateX(2px);
}

.bamboo-label {
  font-family: var(--font-heading);
  font-size: 13px;
  letter-spacing: 3px;
  font-weight: 700;
}

.bamboo-item.active .bamboo-label { color: #fff; }

.bamboo-count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--accent);
  background: #fff;
  padding: 1px 4px;
  border-radius: 1px;
  writing-mode: horizontal-tb;
  letter-spacing: 0;
}

.bamboo-item.active .bamboo-count {
  background: var(--accent);
  color: #fff;
}

/* ---------- SECTION BAR ---------- */
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

/* ---------- CARDS GRID ---------- */
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

.poet-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.poet-card-wrap:hover .poet-img { transform: scale(1.05); }

.poet-stamp {
  position: absolute;
  bottom: 4px;
  right: 4px;
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
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
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

.poet-biography {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.poet-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s;
}

.poet-card-wrap:hover .poet-card-foot {
  opacity: 1;
  transform: translateY(0);
}

.foot-arrow-icon {
  font-size: 14px;
  transition: transform 0.3s;
}

.poet-card-wrap:hover .foot-arrow-icon {
  transform: translateX(4px);
}

/* Empty state inside card area */
.empty-card {
  grid-column: 1 / -1;
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

/* ---------- GRAPH TAB ---------- */
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
  height: 600px;
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

/* ---------- TAB TRANSITION ---------- */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); }
.tab-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

/* ============================================
   RESPONSIVE — three tiers
   ============================================ */

/* Large desktop: keep generous, but cap max */
@media (min-width: 1600px) {
  .poets-view { max-width: 1560px; }
}

/* Tablet portrait: bamboo goes horizontal, header stacks */
@media (max-width: 1024px) {
  .poets-view { padding: 40px 32px 80px; }
  .view-header {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .view-title { font-size: 52px; letter-spacing: 4px; }
  .poets-layout-grid { grid-template-columns: 1fr; gap: 32px; }
  .bamboo-scrolls-aside { position: static; }
  .bamboo-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bamboo-item {
    height: 36px;
    width: auto;
    min-width: 100px;
    writing-mode: horizontal-tb;
    padding: 6px 14px;
  }
  .bamboo-label { font-size: 12px; letter-spacing: 1px; }
  .bamboo-count {
    position: static;
    margin-left: 6px;
  }
  .cards-grid-list { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
}

/* Mobile: single column, smaller stats */
@media (max-width: 640px) {
  .poets-view { padding: 32px 16px 64px; }
  .view-header { padding-bottom: 24px; margin-bottom: 32px; }
  .view-title { font-size: 40px; letter-spacing: 3px; }
  .view-subtitle { font-size: 13.5px; line-height: 1.8; }
  .header-break { display: inline; }
  .header-stats { flex-wrap: wrap; gap: 10px 16px; }
  .h-stat-num { font-size: 18px; }
  .h-stat-lbl { font-size: 11px; }
  .layout-toggle-group { align-self: flex-start; }
  .toggle-btn { padding: 6px 12px; font-size: 12px; }
  .toggle-icon { display: none; }
  .poet-card-wrap { padding: 16px; gap: 14px; min-height: 180px; }
  .poet-avatar-box { width: 64px; height: 84px; }
  .poet-name-tag { font-size: 18px; }
  .g6-container-canvas { height: 460px; }
  .graph-legend { flex-wrap: wrap; gap: 12px 18px; }
  .graph-instructions { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
