<template>
  <div class="map-view scroll-narrative" :class="{ 'sandbox-still': !sandbox.motion }">

    <!-- ===== S1: 黄河意境 Hero ===== -->
    <section class="sn-section sn-hero">
      <PageHeading eyebrow="山河探索 / 黄河地图" title="循河入境，一览九城" description="在三维地图中选择城市，了解山水与文化；也可以直接进入城市册页。"><template #actions><button class="folio-button folio-button--primary" @click="scrollToMap">开始探索地图 ↓</button></template></PageHeading>
    </section>

    <!-- ===== S3: 三维沙盘 sticky 段落 ===== -->
    <!-- 注：原 S2 StatTicker 统计段已删除 —— 四联统计与 hero 内重复且 tone="dark"
         在浅底上不可读，统计只在 hero 出现一次。 -->
    <section ref="stickyRealRef" class="sn-section sn-sticky-real">
      <div class="sn-sticky-viewport">
        <div class="sn-sticky-media">
          <div class="real-3d-container">
            <div class="map-stage" :class="{ 'map-stage--has-city': selectedCity, 'map-stage--editing': isEditing }">
              <!-- 左：沙盘 3D 地图 -->
              <div class="map-frame" :class="{ 'map-frame--tour': sandbox.tour.status !== 'idle' }">
                <div class="map-frame__title">
                  <span class="map-frame__seal">沙盘</span>
                  <span class="map-frame__name">山河图志</span>
                  <span class="map-frame__sub">山东 · 黄河流域</span>
                  <select class="map-city-select" aria-label="选择城市" :value="selectedCity || ''" @change="clickLabel($event.target.value)"><option value="" disabled>九城导览</option><option v-for="city in cities" :key="city" :value="city">{{ city }}</option></select>
                </div>
                <SandboxToolbar :engine="sandbox" :labels="showLabels" :coarse="isCoarsePointer" @toggle-labels="showLabels = !showLabels" />
                <SandboxTour :engine="sandbox" />
                <div class="canvas-3d-wrap" style="position: relative;">
                  <canvas ref="canvas3d" class="webgl-canvas" tabindex="0" aria-label="山东三维山河沙盘，使用工具栏切换视角和编辑模式" @keydown="handleCanvasKey"></canvas>
                  <div v-if="sandbox.loading || errorMsg" class="sandbox-state" role="status">
                    <p>{{ errorMsg || '正在铺展山河…' }}</p>
                    <button v-if="errorMsg" class="folio-button" @click="retryLoadMap">重新加载</button>
                    <router-link v-if="errorMsg" :to="atlasLink('/cities/济南', route)">浏览城市册页 →</router-link>
                  </div>
                  <p class="sandbox-gesture-help">{{ isCoarsePointer ? (sandbox.touchInteraction ? '单指旋转 · 双指缩放平移' : '在「光景与画质」开启触控 · 双指缩放平移') : '拖动旋转 · 滚轮缩放 · 右键平移' }}</p>
                  <p v-if="sandbox.notice" class="sandbox-notice" role="status">{{ sandbox.notice }}</p>
                  <div class="sandbox-map-note">山河微缩景观 · 地形与聚落为艺术示意 · 河道据 Natural Earth</div>

                  <!-- 浮动城市标签 -->
                  <div class="labels-overlay-3d" v-show="showLabels && !isEditing">
                    <svg class="label-leaders" aria-hidden="true"><g v-for="label in cityLabels" :key="label.name" v-show="label.visible"><line :x1="label.x" :y1="label.y" :x2="label.anchorX" :y2="label.anchorY"/><circle :cx="label.anchorX" :cy="label.anchorY" r="3"/></g></svg>
                    <div
                      v-for="label in cityLabels"
                      :key="label.name"
                      v-show="label.visible"
                      class="city-3d-label" :class="{ 'city-3d-label--selected': selectedCity === label.name || sandbox.tour.city === label.name }" :aria-pressed="selectedCity === label.name" role="button" tabindex="0" :aria-label="`预览${label.name}`" @keydown.enter="clickLabel(label.name)" @keydown.space.prevent="clickLabel(label.name)"
                      :style="{ left: `${label.x}px`, top: `${label.y}px` }"
                      @click="clickLabel(label.name)"
                    >
                      <div class="label-plaque-card"><span class="plaque-name">{{ label.name }}</span></div>

                    </div>
                  </div>
                </div>
              </div>

              <!-- 选择城市或编辑时展开侧栏 -->
              <aside v-if="selectedCity || isEditing" class="map-album">
                <SandboxEditor v-if="isEditing" :engine="sandbox" />
                <div class="map-album__hud" v-show="!selectedCity && !isEditing">
                <div class="hud-header">
                  <span class="hud-seal">山河<br/>图志</span>
                  <div class="hud-title-wrap">
                    <span class="hud-eyebrow">数字人文 · 时空交互</span>
                    <h2 class="hud-title">一卷山河，随手入境</h2>
                  </div>
                </div>
                <p class="hud-desc">{{ isCoarsePointer ? '单指浏览页面；在光景与画质中开启操作沙盘后，可单指旋转、双指缩放平移。' : '左键拖动旋转，滚轮缩放；右键或 Shift＋拖动平移。' }}</p>
                <div class="hud-stats">
                  <template v-for="(s, i) in hudStats" :key="i">
                    <span v-if="i > 0" class="stat-divider"></span>
                    <div class="stat-item">
                      <span class="stat-num">{{ s.value || '–' }}<i class="stat-suffix">{{ s.suffix || '' }}</i></span>
                      <span class="stat-lbl">{{ s.label }}</span>
                    </div>
                  </template>
                  <template v-if="!hudStats.length">
                    <div class="stat-item">
                      <span class="stat-num">–</span>
                      <span class="stat-lbl">载入中</span>
                    </div>
                  </template>
                </div>
                <label class="sandbox-city-index">九城索引<select aria-label="选择城市" :value="selectedCity || ''" @change="clickLabel($event.target.value)"><option value="" disabled>选择一座城市</option><option v-for="city in cities" :key="city" :value="city">{{ city }}</option></select></label>
                <div class="hud-actions">
                  <button class="action-btn-toggle folio-button" :aria-pressed="showLabels" @click="showLabels = !showLabels" :title="showLabels ? '隐藏标签' : '显示标签'">
                    <svg v-if="showLabels" class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <span>{{ showLabels ? '隐藏地区标签' : '显示地区标签' }}</span>
                  </button>
                </div>
                <div class="hud-tips">
                  <span class="tip-txt">{{ isCoarsePointer ? '说明：点按发光节点预览城市文学名胜，点卡片「进入景观」进入城市专栏。' : '说明：单击发光节点预览城市文学名胜，双击进入城市专栏。' }}</span>
                </div>
                </div>

                <!-- 点城市 -> 城市卡替换文脉舱 HUD -->
                <transition name="fade">
                  <div v-if="selectedCity && !isEditing" class="map-album__card-slot">
                    <div class="map-album__eyebrow">名城档案</div>
                    <CityDetailCard
                      :name="selectedCity"
                      :archive="getCityData(selectedCity)"
                      :detail="cityDetail"
                      :loading="cityLoading"
                      @close="closeCity"
                      @go="onCardGo"
                    />
                    <button class="map-album__back folio-button folio-button--quiet" @click="closeCity">← 返回文脉舱</button>
                  </div>
                </transition>
              </aside>
            </div>
          </div>
        </div>

      </div>
    </section>


    <!-- ===== S5: 名城精选 ===== -->
    <section class="sn-section sn-featured">
      <FamousCities :cities="featuredCityData" @go="(path) => router.push(atlasLink(path, route))" />
    </section>

    <!-- ===== S6: 页尾 CTA ===== -->
    <section class="sn-section sn-footer-cta">
      <FooterCTA @cta="scrollToMap" />
    </section>
  </div>
</template>

<script setup>
import PageHeading from '../components/ui/PageHeading.vue'
import { ref, computed, onMounted, onBeforeUnmount, proxyRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { atlasLink, isAtlasPreview, previewSpot, previewSpots, previewPoets, previewPoems } from '../config/atlasPreview'
import { useTheme } from '../composables/useTheme'
import { resolveContent } from '../content'
import api from '../api'
import SandboxTour from '../components/sandbox/SandboxTour.vue'
import SandboxToolbar from '../components/sandbox/SandboxToolbar.vue'
import SandboxEditor from '../components/sandbox/SandboxEditor.vue'
import CityDetailCard from '../components/homepage/CityDetailCard.vue'
import FamousCities from '../components/homepage/FamousCities.vue'
import FooterCTA from '../components/homepage/FooterCTA.vue'
import { useCityEnrichment } from '../composables/useCityEnrichment'
import { useThreeSandbox } from '../composables/useThreeSandbox'
import { useScrollNarrative } from '../composables/useScrollNarrative'
import { useFlipTransition } from '../composables/useFlipTransition'
import { cityIllustration, CITY_RIVER_ORDER } from '../config/cityIllustrations'

const router = useRouter()
const route = useRoute()
const { theme } = useTheme()

// Three.js 沙盘引擎（从本组件抽出，P1-5；编排通过 ref + 回调与引擎通信）
const three = useThreeSandbox()
const { canvas3d, selectedCity, cityLabels, errorMsg } = three

const sandbox = proxyRefs(three)
const isEditing = computed(() => sandbox.mode === 'object' || sandbox.mode === 'terrain')
let pageDisposed = false

const showLabels = ref(true)
const regions = ref([])
const heroStats = ref([])

// ===== Scroll 叙事编排 (P3-1) =====
const scrollNarrative = useScrollNarrative()
const stickyRealRef = ref(null)

const featuredCityData = computed(() =>
  CITY_RIVER_ORDER.map((name) => {
    const data = resolveContent('cities', name, theme.value) || {}
    const ill = cityIllustration(name)
    return {
      name,
      image: ill?.img || '',
      desc: data.desc || '',
      tag: data.tag || '',
      geo: data.geo || '',
    }
  }),
)

// 触屏设备：HUD 文案与沙盘交互双态（单击预览、无双击）
const isCoarsePointer = ref(
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
)

// ===== 城市详情卡（点击节点 -> 右册页 dock 显示）=====
const { enrichCity, ensurePoets } = useCityEnrichment()
const cityDetail = ref(null)
const cityLoading = ref(false)
let cityRequest = 0

const hudStats = computed(() => heroStats.value.slice(0, 3))

// 选中城市：在右册页 dock 显示城市卡，异步补全真实数据
const openCity = async (name) => {
  const request = ++cityRequest
  selectedCity.value = name
  cityDetail.value = null
  cityLoading.value = true
  if (isAtlasPreview(route)) {
    const spots = [previewSpot, ...previewSpots].filter(spot => spot.region === name)
    const poems = previewPoems.filter(poem => spots.some(spot => spot.id === poem.spotId))
    const poets = previewPoets.filter(poet => poems.some(poem => poem.poetId === poet.id))
    cityDetail.value = { spotCount: spots.length, poemCount: poems.length, spotNames: spots.map(spot => spot.name), firstSpotId: spots[0]?.id, imageUrl: spots[0]?.imageUrl, poets, firstPoetId: poets[0]?.id, ok: true }
    cityLoading.value = false
    return
  }
  try {
    const detail = await enrichCity(name)
    if (request === cityRequest) cityDetail.value = detail
  } catch (e) {
    if (request === cityRequest) cityDetail.value = null
  } finally {
    if (request === cityRequest) cityLoading.value = false
  }
}

const closeCity = () => {
  cityRequest++
  selectedCity.value = null
  cityDetail.value = null
}

const { capture: captureFlip } = useFlipTransition()

const onCardGo = (path) => {
  if (path) {
    // P3-2 FLIP: 捕获城市预览卡图片位置，供目标页过渡
    const imgEl = document.querySelector('[data-flip-origin]')
    if (imgEl) captureFlip(imgEl, selectedCity.value)
    router.push(atlasLink(path, route))
  }
  closeCity()
}

const scrollToMap = () => {
  // S2 统计段已删除，CTA「沿河而下」滚到三维沙盘段落
  const el = document.querySelector('.sn-sticky-real')
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loadHeroData = async () => {
  if (isAtlasPreview(route)) {
    heroStats.value = [{ value: previewSpots.length + 1, suffix: '处', label: '样本景观' }, { value: previewPoets.length, suffix: '位', label: '样本名士' }, { value: previewPoems.length, suffix: '篇', label: '样本文选' }]
    return
  }
  try {
    const [regionsRes, spotsRes, poetsRes, poemsRes] = await Promise.allSettled([
      api.swrGet('/spots/regions'),
      api.swrGet('/spots', { page: 1, size: 1 }),
      api.swrGet('/poets', { page: 1, size: 1 }),
      api.swrGet('/poems', { page: 1, size: 1 }),
    ])
    if (regionsRes.status === 'fulfilled') regions.value = regionsRes.value?.data || []
    const spots = spotsRes.status === 'fulfilled' ? spotsRes.value?.data?.total : 0
    const poets = poetsRes.status === 'fulfilled' ? poetsRes.value?.data?.total : 0
    const poems = poemsRes.status === 'fulfilled' ? poemsRes.value?.data?.total : 0
    heroStats.value = [
      { value: spots || 0, suffix: '处', label: '文学景观' },
      { value: poets || 0, suffix: '位', label: '文人大家' },
      { value: poems || 0, suffix: '篇', label: '传世名篇' },
      { value: regions.value.length || 9, suffix: '城', label: '沿黄城市' },
    ]
  } catch (e) {
    /* 静默失败，Hero 不阻塞 3D */
  }
}

const clickLabel = (cityName) => {
  three.selectCity(cityName)
}

// Cities list and coords for water-ink custom placement
// 顺序与黄河实际流向一致: 菏泽入境 → ... → 东营归海
const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营']

const getCityData = (cityName) => {
  return resolveContent('cities', cityName, theme.value) || {
    english: 'CITY VIEW',
    subtitle: '古韵齐鲁 · 山东胜景',
    desc: '齐鲁重镇，文脉千秋。',
    geo: '山东省境内',
    history: '古齐鲁之地，中华文明摇篮',
    season: '四季皆宜',
    tag: '文化重镇'
  }
}


// 相机就绪后才建立滚动导览，用户操作由引擎统一接管。
const initializeSandbox = async () => {
  const initialized = await three.init({
    onPickCity: (name) => openCity(name),
    onClearCity: () => { cityRequest++; cityDetail.value = null },
    onDoublePickCity: (name) => router.push(atlasLink(`/regions/${name}`, route)),
  })
  if (initialized && !pageDisposed) scrollNarrative.init({ sandboxApi: three, stickyRealRef: stickyRealRef.value })
}
const retryLoadMap = () => initializeSandbox()
const handleCanvasKey = (event) => {
  if (event.key === 'Escape') { closeCity(); three.setMode('explore'); return }
  const views = { Home: 'overview', '1': 'overview', '2': 'top', '3': 'river' }
  if (views[event.key]) { event.preventDefault(); three.setView(views[event.key]) }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); three.zoom(-0.2) }
  if (event.key === '-') { event.preventDefault(); three.zoom(0.2) }
}
onMounted(() => {
  loadHeroData()
  if (!isAtlasPreview(route)) ensurePoets()
  initializeSandbox()
})

onBeforeUnmount(() => {
  pageDisposed = true
  cityRequest++
  three.dispose()
  scrollNarrative.dispose()
})
</script>

<style scoped>
.map-view {
  width: 100%;
  position: relative;
  overflow: visible;
}

/* ===== Scroll Narrative 分段布局 (P3-1) ===== */
.sn-section {
  position: relative;
}

.sn-container {
  max-width: var(--container-max, 1280px);
  margin: 0 auto;
  padding: 0 24px;
}

/* S3: Sticky 沙盘 */
.sn-sticky-real {
  scroll-margin-top: 140px;
  width: 100%;
}

.sn-sticky-viewport {
  position: relative;
  width: 100%;
  min-height: 0;
}

.sn-sticky-media {
  width: 100%;
  height: auto;
  overflow: visible;
}

/* 左图右册 框体化布局 */
.real-3d-container {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
  padding: 28px 40px 40px;
  position: relative;
  background: var(--bg-primary);
  box-sizing: border-box;
}

.map-stage {
  display: grid;
  /* 观览占满视口，城市资料与编辑器按需展开。 */
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  height: min(780px, calc(100svh - 170px));
  min-height: 520px;
  transition: grid-template-columns 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.map-stage--has-city, .map-stage--editing {
  grid-template-columns: minmax(0, 1fr) 340px;
}

/* 左：沙盘框 */
.map-frame {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
}

.map-frame__title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(180deg, var(--bg-secondary), var(--bg-tertiary));
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.map-frame__seal {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-on-accent);
  background: var(--accent);
  padding: 3px 7px;
  border-radius: 2px;
  letter-spacing: 2px;
}

.map-frame__name {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.map-frame__sub {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-left: auto;
}

.canvas-3d-wrap {
  width: 100%;
  flex: 1;
  min-height: 0;
  position: relative;
}

.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 右：册页信息面板（窄条·仅说明） */
.map-album {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px;
  background: rgba(253, 250, 245, 0.9);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--text-primary) 8%, transparent);
  backdrop-filter: blur(16px);
  text-align: left;
  overflow-y: auto;
  scrollbar-width: thin;
}

.map-album__hud {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-album__card-slot {
  margin: auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.map-album__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 4px;
}

.map-album__eyebrow::before,
.map-album__eyebrow::after {
  content: '';
  width: 28px;
  height: 1px;
  background: var(--border);
}

.map-album__back {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.map-album__back:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 4%, transparent);
}

.hud-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.hud-seal {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-on-accent);
  background: var(--accent);
  padding: 8px 5px;
  border-radius: 2px;
  letter-spacing: 3px;
  box-shadow: 2px 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
  flex-shrink: 0;
  line-height: 1.1;
}

.hud-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hud-eyebrow {
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 2px;
  opacity: 1;
}

.hud-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
  line-height: 1.2;
  margin: 0;
}

.hud-desc {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 14px 0;
  letter-spacing: 0.3px;
}

.hud-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  background: color-mix(in srgb, var(--accent) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 4px;
  padding: 10px 8px;
}

.hud-actions {
  margin-bottom: 12px;
}

.action-btn-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  border-radius: var(--radius-sm);
  color: var(--accent-dark);
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 1px;
}

.action-btn-toggle:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 15%, transparent);
}

.action-icon {
  width: 16px;
  height: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0;
}

.stat-lbl {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 6px;
  letter-spacing: 2px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: color-mix(in srgb, var(--accent) 0.2%, transparent);
  flex-shrink: 0;
}

.hud-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-top: 1px dashed var(--border-light);
  padding-top: 16px;
}

.tip-icon {
  font-size: 16px;
}

.tip-txt {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

.stat-suffix {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  margin-left: 1px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease both;
}

.animate-slide-in {
  animation: slideIn 0.6s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ============================================
   RESPONSIVE — three tiers
   ============================================ */

/* Wide desktop */
@media (min-width: 1600px) {
  .real-3d-container { max-width: 1680px; }
}

/* Tablet: map-stage 单列堆叠 */
@media (max-width: 1024px) {
  .map-stage {
    grid-template-columns: 1fr;
    height: auto;
  }
  .map-frame { height: 60vh; min-height: 360px; }
}

/* Mobile */
@media (max-width: 640px) {
  .label-plaque-card { min-width: 30px; padding: 6px 4px; }
  .real-3d-container { padding: 20px 16px; }
  .map-stage { gap: 16px; }
  .map-frame { height: 52vh; min-height: 320px; }
  .map-album { padding: 18px 16px; }
  .hud-title { font-size: 20px; }
  .stat-num { font-size: 22px; }
}

/* Floating Labels Overlay */
.labels-overlay-3d {
  position: absolute;
  inset: 0;
  pointer-events: none; /* Let clicks pass through to Three.js canvas */
  z-index: 5;
}

.city-3d-label {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: auto; /* Enable hover and clicks on label box */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  animation: labelFadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes labelFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -85%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}

.label-leaders { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.label-leaders line { stroke:#e9c78c; stroke-width:1.2; }
.label-leaders circle { fill:#ffdf93; stroke:#fff2d8; stroke-width:1; }
/* Bronze wayfinding plaques remain legible over the miniature landscape. */
.label-plaque-card {
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  min-width:34px;
  padding:8px 5px;
  border:1px solid #e7bd78;
  border-radius:5px 5px 2px 2px;
  background:linear-gradient(110deg,#775230,#382c20);
  box-shadow:0 3px 12px #0008, inset 0 0 0 2px #bf965c50;
  transition:transform .2s,box-shadow .2s;
}
.plaque-name {
  writing-mode:vertical-rl;
  text-orientation:upright;
  font-family:var(--font-heading);
  font-size:17px;
  line-height:1.2;
  letter-spacing:3px;
  color:#fff1d4;
}
.city-3d-label:hover .label-plaque-card,
.city-3d-label--selected .label-plaque-card {
  transform:translateY(-3px);
  border-color:#ffdc8e;
  box-shadow:0 0 16px #ffc76366,inset 0 0 0 2px #bf965c90;
}
/* Connecting Line */
.label-connector-line {
  width: 1.5px;
  height: 17px;
  background: linear-gradient(to bottom, #e8bd6f, #ffde91);
  transition: height 0.3s ease;
}

.city-3d-label:hover .label-connector-line {
  height: 30px;
}

/* Glow Pin Base */
.label-glow-pin {
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pin-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  z-index: 2;
  transition: transform 0.3s ease;
}

.city-3d-label:hover .pin-dot {
  transform: scale(1.3);
}

/* Breathing Rings */
.ring-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1.5px solid;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.pulse-1 {
  animation: pulseAnimation 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
}

.pulse-2 {
  animation: pulseAnimation 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
  animation-delay: 1s;
}

@keyframes pulseAnimation {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  25% {
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

/* Error state overlay */
.map-error-state {
  position: absolute;
  inset: 0;
  z-index: 50;          /* lower than HUD (z=10) so HUD stays usable on error */
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.error-overlay {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.error-overlay .error-icon {
  font-size: 48px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 16px;
  opacity: 0.6;
  line-height: 1;
}

.error-overlay .error-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-overlay .error-retry-btn {
  display: inline-block;
  font-size: 14px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  padding: 8px 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.error-overlay .error-retry-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 3%, transparent);
}
.sn-hero { min-height:0; height:auto; padding:28px var(--page-gutter) 0; max-width:1360px; margin:auto; } .map-frame,.map-album { border-radius:3px; } .map-album__hud { padding:8px; } .sn-footer-cta { display:none; }

.map-city-select { font:inherit; font-size:12px; padding:4px 8px; border:1px solid var(--border); color:var(--text-primary); background:var(--bg-primary); }
.sandbox-gesture-help { position:absolute; right:14px; bottom:12px; margin:0; padding:6px 9px; color:#eee3c9; background:#17222be6; font-size:11px; pointer-events:none; }
.sandbox-city-index { display:grid; gap:10px; font-size:12px; color:var(--text-secondary); }
.sandbox-city-index select { font:inherit; padding:10px; background:var(--bg-primary); color:var(--text-primary); border:1px solid var(--border); }
.sandbox-notice { position:absolute; top:12px; left:12px; right:12px; padding:10px; font-size:12px; color:var(--text-primary); background:var(--bg-primary); border:1px solid var(--border); z-index:12; }
.sandbox-state { position:absolute; inset:0; z-index:15; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; background:var(--bg-primary); color:var(--text-secondary); font-size:14px; }
.sandbox-map-note { position:absolute; left:14px; bottom:12px; color:var(--text-muted); font-size:10px; letter-spacing:1px; pointer-events:none; background:color-mix(in srgb,var(--bg-primary) 85%,transparent); padding:5px 8px; border-radius:2px; }

.webgl-canvas:focus-visible { outline:2px solid var(--accent); outline-offset:-3px; }
.sandbox-still .city-3d-label,.sandbox-still .ring-pulse { animation:none; }
@media(max-width:900px) {
  .map-stage,.map-stage--has-city,.map-stage--editing { grid-template-columns:minmax(0,1fr); height:auto; min-height:0; }
  .real-3d-container { padding:20px var(--page-gutter); }
  .map-frame { min-height:540px; height:70svh; }
  .map-album { max-height:none; overflow:visible; }
  .map-album__card-slot { margin:0; }
}
@media(max-width:600px) { .sandbox-gesture-help { bottom:45px; font-size:10px; } .sandbox-map-note { max-width:calc(100% - 28px); font-size:9px; } .map-frame { height:620px; min-height:0; } .plaque-tag,.plaque-divider { display:none; } .map-frame__sub { font-size:9px; } }
@media(max-width:600px) { .map-frame--tour { height:780px; } }
@media(prefers-reduced-motion:reduce) { .city-3d-label,.ring-pulse { animation:none; } .map-stage { transition:none; } }
</style>
