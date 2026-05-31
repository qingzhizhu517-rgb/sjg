<template>
  <div class="poets-view" :class="{ 'anime-layout': isAnime }">
    <div class="view-header">
      <div class="header-left-pane">
        <h1 class="view-title">齐鲁文人廊</h1>
        <p class="view-subtitle">探寻黄河流域历代齐鲁大家之生平轨迹与文学连结</p>
      </div>
      
      <!-- Layout Switcher: Gallery vs Graph -->
      <div class="layout-toggle-group">
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'gallery' }"
          @click="activeTab = 'gallery'"
        >
          书卷长廊
        </button>
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'graph' }"
          @click="activeTab = 'graph'"
        >
          关系图谱
        </button>
      </div>
    </div>

    <!-- GALLERY TAB VIEW -->
    <div class="gallery-tab-content animate-fade-in" v-if="activeTab === 'gallery'">
      <div class="poets-layout-grid">
        <!-- Left: Bamboo Scrolls filter -->
        <aside class="bamboo-scrolls-aside">
          <span class="aside-title">历朝文脉</span>
          <div class="bamboo-list">
            <button
              v-for="dyn in dynasties"
              :key="dyn.id"
              class="bamboo-item"
              :class="{ active: selectedDynastyId === dyn.id }"
              @click="selectedDynastyId = dyn.id"
            >
              <span class="bamboo-label">{{ dyn.name }}</span>
            </button>
          </div>
        </aside>

        <!-- Right: Poets cards grid -->
        <section class="poets-cards-section">
          <div class="cards-grid-list">
            <div
              v-for="poet in filteredPoets"
              :key="poet.id"
              class="poet-card-wrap card hover-lift"
              @click="$router.push(`/poets/${poet.id}`)"
            >
              <div class="poet-avatar-box">
                <img :src="getPoetAvatar(poet)" :alt="poet.name" class="poet-img" />
              </div>
              <div class="poet-card-body">
                <div class="poet-title-row">
                  <h3 class="poet-name-tag">{{ poet.name }}</h3>
                  <span class="poet-dynasty-badge">[{{ getDynastyName(poet.dynastyId) }}]</span>
                </div>
                <p class="poet-biography">{{ poet.biography?.substring(0, 70) }}…</p>
                <div class="poet-style-box" v-if="poet.style">
                  <span class="style-lbl">风格：</span>
                  <span class="style-val">{{ poet.style }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- RELATIONSHIP GRAPH TAB VIEW (AntV G6) -->
    <div class="graph-tab-content animate-fade-in" v-else>
      <div class="graph-panel-inner card">
        <div class="graph-instructions">
          <span class="instruction-tag">互动说明</span>
          <p class="instruction-desc">用鼠标滚轮缩放，按住空白处拖拽画布，拖动圆圈节点调整位置。<strong>点击诗人/城市圆形节点</strong> 可直接进入对应的详情专栏。</p>
        </div>
        <div ref="g6Container" class="g6-container-canvas"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import api from '../api'
import * as G6 from '@antv/g6'

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

const getPoetAvatar = (poet) => {
  if (!poet) return ''
  const url = isAnime.value ? poet.avatarAnimeUrl || poet.avatarUrl : poet.avatarUrl
  return getImageUrl(url, isAnime.value)
}

const getDynastyName = (dynastyId) => {
  const mapping = {
    1: '先秦',
    2: '秦汉',
    3: '魏晋南北朝',
    4: '唐代',
    5: '宋代',
    6: '元代',
    7: '明代',
    8: '清代'
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
    const height = g6Container.value.clientHeight || 520
    graphInstance.changeSize(width, height)
  }
}

const initG6 = () => {
  if (!g6Container.value) return
  if (graphInstance) {
    graphInstance.destroy()
    graphInstance = null
  }

  const width = g6Container.value.clientWidth || 800
  const height = g6Container.value.clientHeight || 520

  // Dynamic theme styling for the graph nodes
  const themeColors = isAnime.value ? {
    poetFill: '#1a1a1a', // deep ink wash
    poetStroke: '#c23a2b', // cinnabar accent
    poetText: '#ffffff',
    cityFill: '#faf6ee', // calligraphic paper color
    cityStroke: '#1a1a1a', // black ink line
    edgeColor: '#7a7a7a',
    lineDash: [4, 4]
  } : {
    poetFill: '#b8860b', // digital heritage gold
    poetStroke: '#3d2b1f', // dark teak wood
    poetText: '#ffffff',
    cityFill: '#ffffff', // pure marble white
    cityStroke: '#b8860b', // gold trim
    edgeColor: '#c5b8a5',
    lineDash: [4, 4]
  }

  // Relationship nodes and edges data
  const data = {
    nodes: [
      { id: '1', label: '李白', sub: '唐朝 · 诗仙', size: 55, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 'bold' } } },
      { id: '2', label: '杜甫', sub: '唐朝 · 诗圣', size: 55, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 13, fontWeight: 'bold' } } },
      { id: '3', label: '李清照', sub: '宋朝 · 千古才女', size: 55, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 13, fontWeight: 'bold' } } },
      { id: '4', label: '辛弃疾', sub: '宋朝 · 稼轩豪杰', size: 55, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 13, fontWeight: 'bold' } } },
      { id: '5', label: '赵孟頫', sub: '元朝 · 松雪道人', size: 50, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 12, fontWeight: 'bold' } } },
      { id: '6', label: '蒲松龄', sub: '清朝 · 聊斋先生', size: 50, style: { fill: themeColors.poetFill, stroke: themeColors.poetStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--text-primary)', fontSize: 12, fontWeight: 'bold' } } },
      // Geographic hubs
      { id: 'c1', label: '济南', sub: '济南名士多', size: 45, style: { fill: themeColors.cityFill, stroke: themeColors.cityStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--accent)', fontWeight: 'bold', fontSize: 12 } } },
      { id: 'c2', label: '泰安', sub: '会当凌绝顶', size: 45, style: { fill: themeColors.cityFill, stroke: themeColors.cityStroke, lineWidth: 2 }, labelCfg: { style: { fill: 'var(--accent)', fontWeight: 'bold', fontSize: 12 } } }
    ],
    edges: [
      { source: '1', target: '2', label: '李杜齐鲁相会', style: { stroke: themeColors.poetStroke, lineWidth: 2 } },
      { source: '2', target: 'c1', label: '历下亭同宴', style: { stroke: themeColors.poetStroke, lineDash: themeColors.lineDash } },
      { source: '1', target: 'c2', label: '游历泰山', style: { stroke: themeColors.poetStroke, lineDash: themeColors.lineDash } },
      { source: '2', target: 'c2', label: '写《望岳》', style: { stroke: themeColors.poetStroke, lineDash: themeColors.lineDash } },
      { source: '3', target: 'c1', label: '生平与居所', style: { stroke: themeColors.edgeColor, lineDash: themeColors.lineDash } },
      { source: '4', target: 'c1', label: '生平与归宋', style: { stroke: themeColors.edgeColor, lineDash: themeColors.lineDash } },
      { source: '3', target: '4', label: '济南二安', style: { stroke: themeColors.poetStroke, lineWidth: 1.5 } },
      { source: '5', target: 'c1', label: '出任总管/描摹鹊华', style: { stroke: themeColors.edgeColor, lineDash: themeColors.lineDash } }
    ]
  }

  graphInstance = new G6.Graph({
    container: g6Container.value,
    width,
    height,
    layout: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 160,
      nodeStrength: -150
    },
    defaultNode: {
      type: 'circle',
      labelCfg: {
        position: 'bottom',
        offset: 8
      }
    },
    defaultEdge: {
      labelCfg: {
        autoRotate: true,
        style: {
          fontSize: 10,
          fill: 'var(--text-secondary)',
          background: {
            fill: 'var(--card-bg)',
            padding: [2, 4],
            radius: 2
          }
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    }
  })

  graphInstance.data(data)
  graphInstance.render()

  // Node clicks navigate directly to subpages
  graphInstance.on('node:click', (evt) => {
    const nodeItem = evt.item
    const model = nodeItem.getModel()
    if (['1', '2', '3', '4', '5', '6'].includes(model.id)) {
      router.push(`/poets/${model.id}`)
    } else if (model.id === 'c1') {
      router.push('/regions/济南')
    } else if (model.id === 'c2') {
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
.poets-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 16px;
  margin-bottom: 32px;
}

.header-left-pane {
  text-align: left;
}

.view-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin: 0 0 6px 0;
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* Tabs switcher styling */
.layout-toggle-group {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.02);
  padding: 4px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.toggle-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: bold;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
}

.toggle-btn:hover {
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--card-bg);
  color: var(--accent);
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

/* poets layout grid */
.poets-layout-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  align-items: start;
}

/* Bamboo scrolls filter list */
.bamboo-scrolls-aside {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.aside-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: bold;
  color: var(--text-muted);
  letter-spacing: 1px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 4px;
  width: 100%;
  text-align: left;
}

.bamboo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.bamboo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  width: 36px;
  background: linear-gradient(135deg, #fdf8e6 0%, #eee4c9 100%);
  border: 1px solid #c2b595;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.06);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.bamboo-item:hover {
  transform: translateY(-4px);
  box-shadow: 2px 6px 12px rgba(0,0,0,0.1);
  border-color: var(--accent);
}

.bamboo-item.active {
  background: #8e352e;
  border-color: #8e352e;
  color: #fff;
  font-weight: bold;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 2px 4px 8px rgba(142, 53, 46, 0.3);
}

.bamboo-label {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 3px;
}

/* Poets Cards Grid */
.poets-cards-section {
  width: 100%;
}

.cards-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.poet-card-wrap {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  text-align: left;
}

.poet-avatar-box {
  width: 72px;
  height: 90px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.04);
}

.poet-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poet-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.poet-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.poet-name-tag {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.poet-dynasty-badge {
  font-size: 12px;
  color: var(--accent);
  font-weight: bold;
}

.poet-biography {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  text-align: justify;
}

.poet-style-box {
  margin-top: auto;
  font-size: 11px;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
}

.style-lbl {
  color: var(--text-muted);
  font-weight: bold;
}

.style-val {
  color: var(--text-secondary);
  font-weight: 600;
}

/* AntV G6 relational graph tab styles */
.graph-panel-inner {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.graph-instructions {
  width: 100%;
  background: rgba(0,0,0,0.01);
  border-left: 3px solid var(--accent);
  padding: 10px 16px;
  margin-bottom: 20px;
  text-align: left;
  border-radius: 0 4px 4px 0;
}

.instruction-tag {
  font-size: 11px;
  font-weight: 800;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 6px;
  border-radius: 2px;
  letter-spacing: 0.5px;
}

.instruction-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin: 6px 0 0 0;
}

.g6-container-canvas {
  width: 100%;
  height: 520px;
  border: 1px dashed var(--border);
  border-radius: 4px;
  background: var(--card-bg);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .poets-layout-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .bamboo-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .bamboo-item {
    height: 36px;
    width: 90px;
    writing-mode: horizontal-tb;
  }
  .bamboo-label {
    letter-spacing: 1px;
  }
  .poets-view {
    padding: 24px 16px;
  }
}
</style>
