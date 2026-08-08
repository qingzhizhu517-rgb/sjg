<template>
  <div class="map-view scroll-narrative" :class="{ 'anime-layout': isAnime }" @mousemove="handleMouseMove" @mouseleave="resetParallax">

    <!-- ===== S1: 黄河意境 Hero ===== -->
    <section class="sn-section sn-hero">
      <RiverHero
        :stats="heroStats"
        @cta="scrollToMap"
      />

      <!-- 错误状态 -->
      <div v-if="errorMsg" class="map-error-state">
        <div class="error-overlay">
          <p class="error-icon">!</p>
          <p class="error-text">{{ errorMsg }}</p>
          <button class="error-retry-btn" @click="retryLoadMap">重新加载</button>
        </div>
      </div>
    </section>

    <!-- ===== S2: 山河数据 · StatTicker 数字滚动 ===== -->
    <section class="sn-section sn-stats">
      <div class="sn-container">
        <StatTicker v-if="heroStats.length" :stats="heroStats" tone="dark" />
        <div v-else class="sn-stats-placeholder">
          <SkeletonBlock height="52px" width="60%" />
        </div>
      </div>
    </section>

    <!-- ===== S3: 沙盘/长卷 sticky 段落 ===== -->
    <!-- REAL 主题 -->
    <section v-if="isReal" ref="stickyRealRef" class="sn-section sn-sticky-real">
      <div class="sn-sticky-viewport">
        <div class="sn-sticky-media">
          <div class="real-3d-container">
            <div class="map-stage" :class="{ 'map-stage--has-city': selectedCity }">
              <!-- 左：沙盘 3D 地图 -->
              <div class="map-frame">
                <div class="map-frame__title">
                  <span class="map-frame__seal">沙盘</span>
                  <span class="map-frame__name">山河图志</span>
                  <span class="map-frame__sub">山东 · 黄河流域</span>
                </div>
                <div class="canvas-3d-wrap" style="position: relative;">
                  <canvas ref="canvas3d" class="webgl-canvas"></canvas>

                  <!-- 浮动城市标签 -->
                  <div class="labels-overlay-3d" v-show="showLabels">
                    <div
                      v-for="label in cityLabels"
                      :key="label.name"
                      v-show="label.visible"
                      class="city-3d-label"
                      :class="[isReal ? 'label-theme-real' : 'label-theme-inkwash']"
                      :style="{ left: `${label.x}px`, top: `${label.y}px` }"
                      @click="clickLabel(label.name)"
                    >
                      <div class="label-plaque-card">
                        <div class="decor-corner corner-tl"></div>
                        <div class="decor-corner corner-tr"></div>
                        <div class="decor-corner corner-bl"></div>
                        <div class="decor-corner corner-br"></div>
                        <div class="plaque-content">
                          <span class="plaque-name">{{ label.name }}</span>
                          <span class="plaque-divider"></span>
                          <span class="plaque-tag">{{ getCityData(label.name).tag }}</span>
                        </div>
                      </div>
                      <div class="label-connector-line"></div>
                      <div class="label-glow-pin">
                        <span class="ring-pulse pulse-1" :style="{ borderColor: label.colorHex }"></span>
                        <span class="ring-pulse pulse-2" :style="{ borderColor: label.colorHex }"></span>
                        <div class="pin-dot" :style="{ backgroundColor: label.colorHex }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右：册页信息面板 -->
              <aside class="map-album">
                <div class="map-album__hud" v-show="!selectedCity">
                <div class="hud-header">
                  <span class="hud-seal">山河<br/>图志</span>
                  <div class="hud-title-wrap">
                    <span class="hud-eyebrow">数字人文 · 时空交互</span>
                    <h2 class="hud-title">三维地理文脉舱</h2>
                  </div>
                </div>
                <p class="hud-desc">{{ isCoarsePointer ? '双指旋转缩放视角，单指上下滑动浏览页面。' : '拖拽旋转视角，双击节点飞往对应城市。' }}</p>
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
                <div class="hud-actions">
                  <button class="action-btn-toggle" @click="showLabels = !showLabels" :title="showLabels ? '隐藏标签' : '显示标签'">
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
                  <div v-if="selectedCity" class="map-album__card-slot">
                    <div class="map-album__eyebrow">名城档案</div>
                    <CityDetailCard
                      :name="selectedCity"
                      :archive="getCityData(selectedCity)"
                      :detail="cityDetail"
                      :loading="cityLoading"
                      @close="closeCity"
                      @go="onCardGo"
                    />
                    <button class="map-album__back" @click="closeCity">← 返回文脉舱</button>
                  </div>
                </transition>
              </aside>
            </div>
          </div>
        </div>

        <!-- 叙事文字卡片（叠在 sticky 上滚动） -->
        <div class="sn-narrative-panels">
          <div v-for="(panel, i) in narrativePanels.real" :key="i" class="sn-panel">
            <div class="sn-panel__accent"></div>
            <div class="sn-panel__icon">{{ panel.icon }}</div>
            <h2 class="sn-panel__title">{{ panel.title }}</h2>
            <p class="sn-panel__body">{{ panel.body }}</p>
            <div class="sn-panel__footer">
              <span class="sn-panel__tag">{{ panel.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- INKWASH 主题 -->
    <section v-else ref="stickyInkRef" class="sn-section sn-sticky-ink">
      <div class="sn-sticky-viewport">
        <div class="sn-sticky-media">
          <div class="anime-ink-container animate-fade-in">
            <div class="ink-layout-wrap">
              <!-- Left calligraphic panel -->
              <aside class="ink-left-panel">
                <div class="calligraphy-header">
                  <div class="seal-red">天下大观</div>
                  <div class="calligraphy-text">
                    <h1 class="calligraphy-title">山东揽胜</h1>
                    <span class="calligraphy-subtitle">黄河入海</span>
                  </div>
                </div>
                <p class="ink-intro-para">
                  黄河自菏泽入境，经梁山、东平，过济南，北折德州，蜿蜒东营归海。千百年来，诗圣杜甫、诗仙李白同游于此，易安居士、稼轩豪杰吟唱不断。
                </p>
                <div class="ink-categories">
                  <div class="category-stamp">五岳独尊</div>
                  <div class="category-stamp">泉城名胜</div>
                  <div class="category-stamp">运河古都</div>
                  <div class="category-stamp">黄河湿地</div>
                </div>
                <div class="ink-legend">
                  <p class="legend-title">图例</p>
                  <div class="legend-row"><span class="legend-mark mark-stamp"></span>城市节点（点击进入）</div>
                  <div class="legend-row"><span class="legend-mark mark-river"></span>黄河流经</div>
                </div>
              </aside>

              <!-- Right Parallax Scroll Map -->
              <div class="scroll-outer-frame">
                <div class="scroll-wooden-rod left-rod"></div>
                <div class="scroll-middle-paper" ref="scrollPaper">
                  <!-- Background Layer: Ink mountains -->
                  <div class="parallax-layer bg-mountains" :style="getParallaxStyle(0.2)"></div>

                  <!-- Midground Layer: Yellow River -->
                  <div class="parallax-layer river-flow-layer" :style="getParallaxStyle(0.5)">
                    <svg class="ink-river-svg" viewBox="0 0 2000 600" preserveAspectRatio="xMidYMid meet">
                      <path
                        d="M100,520 Q300,420 500,480 T900,320 T1300,260 T1700,100"
                        fill="none"
                        :stroke="svgAccent40"
                        stroke-width="8"
                        stroke-dasharray="10 8"
                        class="svg-river-dash"
                      />
                    </svg>
                  </div>

                  <!-- Foreground Layer: City Stamps -->
                  <div class="parallax-layer stamps-layer" :style="getParallaxStyle(1.0)">
                    <div
                      v-for="city in cities"
                      :key="city"
                      class="city-ink-stamp-box"
                      :style="getCityStampPos(city)"
                      @click="$router.push(`/regions/${city}`)"
                    >
                      <div class="stamp-seal-red">
                        <span class="seal-char">{{ city[0] }}</span>
                        <span class="seal-char">{{ city[1] }}</span>
                      </div>
                      <span class="stamp-lbl-vertical">{{ city }}</span>
                    </div>
                  </div>
                </div>
                <div class="scroll-wooden-rod right-rod"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 叙事文字卡片 -->
        <div class="sn-narrative-panels">
          <div v-for="(panel, i) in narrativePanels.inkwash" :key="i" class="sn-panel">
            <div class="sn-panel__accent"></div>
            <div class="sn-panel__icon">{{ panel.icon }}</div>
            <h2 class="sn-panel__title">{{ panel.title }}</h2>
            <p class="sn-panel__body">{{ panel.body }}</p>
            <div class="sn-panel__footer">
              <span class="sn-panel__tag">{{ panel.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== S4: 沿黄九城 · RiverCityRail 视差 ===== -->
    <section ref="railSectionRef" class="sn-section sn-rail">
      <RiverCityRail :regions="regions" @go="(name) => $router.push(`/regions/${name}`)" />
    </section>

    <!-- ===== S5: 名城精选 ===== -->
    <section class="sn-section sn-featured">
      <FamousCities :cities="featuredCityData" @go="(route) => $router.push(route)" />
    </section>

    <!-- ===== S6: 页尾 CTA ===== -->
    <section class="sn-section sn-footer-cta">
      <FooterCTA @cta="scrollToMap" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { cssVarAlpha } from '../utils/cssToken'
import { resolveContent } from '../content'
import api from '../api'
import RiverHero from '../components/homepage/RiverHero.vue'
import RiverCityRail from '../components/homepage/RiverCityRail.vue'
import CityDetailCard from '../components/homepage/CityDetailCard.vue'
import StatTicker from '../components/homepage/StatTicker.vue'
import FamousCities from '../components/homepage/FamousCities.vue'
import FooterCTA from '../components/homepage/FooterCTA.vue'
import { useCityEnrichment } from '../composables/useCityEnrichment'
import { useThreeSandbox } from '../composables/useThreeSandbox'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import { useScrollNarrative } from '../composables/useScrollNarrative'
import { useFlipTransition } from '../composables/useFlipTransition'
import { narrativePanels } from '../content/scrollNarrative'
import { cityIllustration, CITY_RIVER_ORDER } from '../config/cityIllustrations'

const router = useRouter()
const { isReal, isAnime, theme } = useTheme()

// Three.js 沙盘引擎（从本组件抽出，P1-5；编排通过 ref + 回调与引擎通信）
const three = useThreeSandbox()
const { canvas3d, selectedCity, cityLabels, errorMsg } = three

// SVG accent color computed at runtime for theme reactivity
const svgAccent40 = computed(() => cssVarAlpha('--accent', 0.4))

const showLabels = ref(true)
const regions = ref([])
const heroStats = ref([])

// ===== Scroll 叙事编排 (P3-1) =====
const scrollNarrative = useScrollNarrative()
const { stickyProgress } = scrollNarrative
const stickyRealRef = ref(null)
const stickyInkRef = ref(null)
const railSectionRef = ref(null)

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

const hudStats = computed(() => heroStats.value.slice(0, 3))

// 选中城市：在右册页 dock 显示城市卡，异步补全真实数据
const openCity = async (name) => {
  selectedCity.value = name
  cityDetail.value = null
  cityLoading.value = true
  try {
    cityDetail.value = await enrichCity(name)
  } catch (e) {
    cityDetail.value = null
  } finally {
    cityLoading.value = false
  }
}

const closeCity = () => {
  selectedCity.value = null
  cityDetail.value = null
}

const { capture: captureFlip } = useFlipTransition()

const onCardGo = (route) => {
  if (route) {
    // P3-2 FLIP: 捕获城市预览卡图片位置，供目标页过渡
    const imgEl = document.querySelector('[data-flip-origin]')
    if (imgEl) captureFlip(imgEl, selectedCity.value)
    router.push(route)
  }
  closeCity()
}

const scrollToMap = () => {
  const el = document.querySelector('.sn-stats')
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const loadHeroData = async () => {
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
  openCity(cityName)
  three.flyToCity(cityName)
}

// Mouse parallax coordinate tracking
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
  mouseY.value = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
}

const resetParallax = () => {
  mouseX.value = 0
  mouseY.value = 0
}

const getParallaxStyle = (factor) => {
  const x = mouseX.value * 25 * factor
  const y = mouseY.value * 20 * factor
  return {
    transform: `translate3d(${x}px, ${y}px, 0)`
  }
}

// Cities list and coords for water-ink custom placement
const cities = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '滨州', '淄博', '东营']

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

const getCityStampPos = (city) => {
  // 横向滚动长卷：x 坐标按 200% 宽度分布，保留 y 坐标
  const coords = {
    '菏泽': { left: '6%', top: '78%' },
    '济宁': { left: '13%', top: '72%' },
    '泰安': { left: '21%', top: '60%' },
    '聊城': { left: '12%', top: '48%' },
    '济南': { left: '23%', top: '46%' },
    '德州': { left: '16%', top: '24%' },
    '淄博': { left: '31%', top: '48%' },
    '滨州': { left: '32%', top: '26%' },
    '东营': { left: '40%', top: '22%' }
  }
  return coords[city] || { left: '25%', top: '50%' }
}


// 主题切换 -> 引擎重建(real)/销毁(inkwash)
watch(isReal, (newVal) => three.setTheme(newVal))

// 失败重试入口（template 错误态按钮）
const retryLoadMap = () => {
  three.errorMsg.value = null
  if (isReal.value) three.setTheme(true)
}

onMounted(() => {
  loadHeroData()
  ensurePoets()
  // 始终注入回调（inkwash 时仅注入不启动；切 real 时 setTheme 复用，修复点击失效）
  three.init({
    onPickCity: (name) => openCity(name),
    onDoublePickCity: (name) => router.push(`/regions/${name}`),
  })
  // P3-1: scroll 叙事延迟初始化（等 DOM 就绪）
  scrollNarrative.init({
    isReal,
    sandboxApi: three,
    stickyRealRef: stickyRealRef.value,
    stickyInkRef: stickyInkRef.value,
    railRef: railSectionRef.value,
  })
  // P5-5: 预取关键数据（浏览器空闲时）
  api.prefetch('/timeline')
  api.prefetch('/poet-relations')
})

onBeforeUnmount(() => {
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

/* S2: StatTicker 数字滚动 */
.sn-stats {
  padding: 64px 0;
  text-align: center;
}

.sn-stats-placeholder {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* S3: Sticky 沙盘/长卷 */
.sn-sticky-real,
.sn-sticky-ink {
  width: 100%;
}

.sn-sticky-viewport {
  position: relative;
  width: 100%;
  min-height: 300vh; /* 提供足够 scroll 距离给 pin */
}

.sn-sticky-media {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sn-sticky-real .sn-sticky-media {
  /* real-3d-container 内部已有 layout */
}

.sn-sticky-ink .sn-sticky-media {
  /* anime-ink-container 内部已有 layout */
}

/* 叙事文字面板（叠在 sticky media 上方滚动穿过） */
.sn-narrative-panels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 60vh;
  padding: 120px 48px;
  pointer-events: none;
  z-index: 2;
}

.sn-panel {
  pointer-events: auto;
  max-width: 420px;
  background: var(--card-bg, rgba(253, 250, 245, 0.92));
  backdrop-filter: blur(12px);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 12px 40px rgba(31, 26, 22, 0.08);
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sn-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(31, 26, 22, 0.12);
  border-color: var(--accent);
}

/* 顶部装饰线 */
.sn-panel__accent {
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light, #d4a853));
  width: 100%;
}

/* 图标印章 */
.sn-panel__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  background: var(--accent);
  border-radius: 4px;
  margin: 24px 32px 16px;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
  transform: rotate(-3deg);
}

.sn-sticky-real .sn-panel {
  margin-left: auto;
  margin-right: 48px;
}

.sn-sticky-ink .sn-panel {
  margin-right: auto;
  margin-left: 48px;
}

.sn-panel__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--text-primary);
  margin: 0 8px 10px;
  padding: 0 24px;
}

.sn-panel__body {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-secondary);
  margin: 0;
  padding: 0 32px 20px;
  letter-spacing: 0.3px;
}

/* 底部标签 */
.sn-panel__footer {
  padding: 12px 32px 20px;
  border-top: 1px dashed var(--border-light);
  margin-top: 4px;
}

.sn-panel__tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  padding: 4px 12px;
  border-radius: 100px;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .sn-stats {
    padding: 40px 16px;
  }

  .sn-narrative-panels {
    padding: 80px 20px;
    gap: 40vh;
  }

  .sn-panel {
    max-width: none;
    margin: 0 !important;
  }

  .sn-panel__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin: 20px 24px 12px;
  }

  .sn-panel__title {
    font-size: 18px;
    padding: 0 20px;
    margin: 0 4px 8px;
  }

  .sn-panel__body {
    padding: 0 24px 16px;
  }

  .sn-panel__footer {
    padding: 10px 24px 16px;
  }

  .sn-container {
    padding: 0 16px;
  }
}

/* 沿黄九城 */
.map-cities {
  max-width: 1200px;
  margin: 56px auto;
  padding: 0 40px;
}
.map-cities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .map-cities-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .map-cities { padding: 0 20px; margin: 40px auto; }
  .map-cities-grid { grid-template-columns: 1fr; }
}

/* REAL MODE: 左图右册 框体化布局 */
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
  /* 沙盘为主：右栏固定窄条 280px，仅作说明；选中城市时展开至 400px */
  grid-template-columns: 1fr 280px;
  gap: 24px;
  height: calc(100vh - var(--nav-height) - 76px);
  min-height: 520px;
  transition: grid-template-columns 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.map-stage--has-city {
  grid-template-columns: 1fr 400px;
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
  font-weight: 800;
  color: #fff;
  background: var(--accent);
  padding: 3px 7px;
  border-radius: 2px;
  letter-spacing: 2px;
}

.map-frame__name {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 900;
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
  font-weight: 700;
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
  font-weight: 800;
  color: #fff;
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
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 2px;
  opacity: 0.8;
}

.hud-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 900;
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
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 1px;
}

.action-btn-toggle:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
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
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0;
}

.stat-lbl {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
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
  font-weight: 700;
  margin-left: 1px;
}

/* ==========================================
   ANIME WATER-INK PARALLAX SCROLL THEME
   ========================================== */
.anime-ink-container {
  width: 100%;
  height: calc(100vh - var(--nav-height));
  background: var(--bg-primary); /* Traditional ink wash paper base */
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ink-layout-wrap {
  width: 100%;
  max-width: 1400px;
  height: 100%;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 48px;
  align-items: center;
}

/* Left panel calligraphy */
.ink-left-panel {
  display: flex;
  flex-direction: column;
  gap: 26px;
  text-align: left;
}

.calligraphy-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.seal-red {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--accent);
  padding: 8px 5px;
  border-radius: 2px;
  letter-spacing: 3px;
  box-shadow: 2px 2px 6px color-mix(in srgb, var(--accent) 25%, transparent);
  flex-shrink: 0;
}

.calligraphy-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calligraphy-title {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  line-height: 1.1;
  margin: 0;
}

.calligraphy-subtitle {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 4px;
  text-indent: 4px;
}

.ink-intro-para {
  font-family: var(--font-heading);
  font-size: 14px;
  line-height: 2;
  color: var(--text-secondary);
  text-indent: 2em;
  text-align: justify;
  margin: 0;
  letter-spacing: 0.5px;
}

.ink-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-stamp {
  font-size: 12px;
  font-weight: 700;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  color: var(--accent);
  padding: 6px 14px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--accent) 3%, transparent);
  letter-spacing: 2px;
  transition: all 0.2s;
}

.category-stamp:hover {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  transform: translateY(-1px);
}

/* Legend block under categories */
.ink-legend {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed color-mix(in srgb, var(--accent) 20%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-title {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 4px;
  margin: 0 0 4px 0;
  text-indent: 4px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.legend-mark {
  flex-shrink: 0;
}

.mark-stamp {
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: 1px dashed rgba(255,255,255,0.4);
  border-radius: 1px;
}

.mark-river {
  width: 24px;
  height: 0;
  border-top: 2px dashed color-mix(in srgb, var(--accent) 60%, transparent);
}

/* Right Scroll Frame */
.scroll-outer-frame {
  height: 560px;
  display: flex;
  align-items: center;
  position: relative;
}

.scroll-wooden-rod {
  width: 16px;
  height: 580px;
  background: linear-gradient(to bottom, #3d240e, #73451d, #3d240e);
  border-radius: 8px;
  box-shadow: 4px 0 12px rgba(0,0,0,0.28);
  z-index: 5;
  position: relative;
}

.scroll-wooden-rod::before,
.scroll-wooden-rod::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 18px;
  background: linear-gradient(90deg, #d4af37, #aa7c11, #d4af37);
  border-radius: 2px;
}

.scroll-wooden-rod::before { top: -12px; }
.scroll-wooden-rod::after { bottom: -12px; }

.left-rod { margin-right: -4px; }
.right-rod { margin-left: -4px; }

.scroll-middle-paper {
  flex: 1;
  height: 520px;
  background: var(--bg-primary);
  border-top: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
  box-shadow: inset 0 0 40px rgba(115, 69, 29, 0.06), 0 10px 30px rgba(0,0,0,0.15);
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.scroll-middle-paper::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Parallax Layer core */
.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%; /* 横向滚动长卷 */
  height: 100%;
  pointer-events: none;
  transition: transform 0.1s ease-out;
}

/* Background water-ink mountains */
.bg-mountains {
  background-image: url('/images/inkwash-map.png');
  background-size: cover;
  background-position: center;
  opacity: 0.82;
  filter: contrast(0.95) sepia(0.12);
  z-index: 1;
}

/* Yellow River flowing SVG */
.river-flow-layer {
  z-index: 2;
}

.ink-river-svg {
  width: 100%;
  height: 100%;
}

.svg-river-dash {
  stroke-dasharray: 20;
  animation: riverFlowAnimation 16s linear infinite;
}

@keyframes riverFlowAnimation {
  to {
    stroke-dashoffset: -400;
  }
}

/* Foreground city stamps */
.stamps-layer {
  z-index: 3;
  pointer-events: auto;
}

.city-ink-stamp-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.city-ink-stamp-box:hover {
  transform: translate(-50%, -55%) scale(1.08);
}

/* 朱红泥印章 */
.stamp-seal-red {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 42px;
  background: var(--accent);
  border-radius: 2px;
  color: #fff;
  font-family: var(--font-display);
  font-size: 12px;
  line-height: 1.1;
  font-weight: 900;
  box-shadow: 3px 3px 8px color-mix(in srgb, var(--accent) 40%, transparent);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  padding: 3px 2px;
  letter-spacing: 0;
}

.stamp-lbl-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin-top: 8px;
  background: rgba(251, 248, 242, 0.92);
  padding: 4px 2px;
  border-radius: 2px;
  box-shadow: 0 1px 3px var(--shadow-a6);
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
  .ink-layout-wrap { max-width: 1560px; grid-template-columns: 380px 1fr; gap: 56px; }
  .scroll-outer-frame { height: 620px; }
  .scroll-wooden-rod { height: 640px; }
  .scroll-middle-paper { height: 580px; }
  .real-3d-container { max-width: 1680px; }
}

/* Tablet: map-stage 单列堆叠 */
@media (max-width: 1024px) {
  .ink-layout-wrap {
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: stretch;
  }
  .ink-left-panel {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 18px;
  }
  .calligraphy-header { flex: 1; min-width: 240px; }
  .calligraphy-title { font-size: 40px; }
  .ink-intro-para { flex: 1 1 100%; }
  .ink-categories, .ink-legend { flex: 1 1 auto; }
  .scroll-outer-frame { height: 400px; }
  .scroll-wooden-rod { height: 420px; }
  .scroll-middle-paper { height: 370px; }

  .map-stage {
    grid-template-columns: 1fr;
    height: auto;
  }
  .map-frame { height: 60vh; min-height: 360px; }
}

/* Mobile */
@media (max-width: 640px) {
  .anime-ink-container { padding: 24px 16px; }
  .ink-left-panel { gap: 14px; }
  .calligraphy-title { font-size: 32px; letter-spacing: 3px; }
  .calligraphy-subtitle { font-size: 14px; letter-spacing: 3px; }
  .ink-intro-para { font-size: 13px; line-height: 1.85; }
  .scroll-outer-frame { height: 340px; }
  .scroll-wooden-rod { height: 360px; }
  .scroll-middle-paper { height: 310px; }
  .stamp-seal-red { width: 32px; height: 36px; font-size: 10px; }
  .label-plaque-card { min-width: 110px; padding: 6px 10px; }
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

/* Plaque Card styling */
.label-plaque-card {
  position: relative;
  padding: 7px 14px;
  min-width: 130px;
  max-width: 180px;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Theme specific colors */
.label-theme-real .label-plaque-card {
  background: rgba(253, 250, 245, 0.94);
  border: 1px solid var(--accent-light);
}

.label-theme-inkwash .label-plaque-card {
  background: color-mix(in srgb, var(--text-primary) 92%, transparent);
  border: 1px solid var(--accent);
}

/* Hover effects */
.city-3d-label:hover .label-plaque-card {
  transform: translateY(-5px) scale(1.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.label-theme-real:hover .label-plaque-card {
  border-color: var(--accent);
  background: #ffffff;
}

.label-theme-inkwash:hover .label-plaque-card {
  border-color: #ffffff;
  background: #111111;
}

/* Decorative Chinese Plaque Corners */
.decor-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1.5px solid transparent;
  pointer-events: none;
}

.label-theme-real .decor-corner {
  border-color: var(--accent-light);
}

.label-theme-inkwash .decor-corner {
  border-color: var(--accent);
}

/* TL, TR, BL, BR corners */
.corner-tl { top: 3px; left: 3px; border-right: 0; border-bottom: 0; }
.corner-tr { top: 3px; right: 3px; border-left: 0; border-bottom: 0; }
.corner-bl { bottom: 3px; left: 3px; border-right: 0; border-top: 0; }
.corner-br { bottom: 3px; right: 3px; border-left: 0; border-top: 0; }

.city-3d-label:hover .decor-corner {
  border-color: currentColor;
}

.label-theme-real:hover .decor-corner {
  border-color: var(--accent);
}

.label-theme-inkwash:hover .decor-corner {
  border-color: #ffffff;
}

/* Plaque Content */
.plaque-content {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.plaque-name {
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
}

.label-theme-real .plaque-name {
  color: var(--text-primary);
}

.label-theme-inkwash .plaque-name {
  color: #ffffff;
}

.plaque-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

.label-theme-inkwash .plaque-divider {
  background: rgba(255, 255, 255, 0.2);
}

.plaque-tag {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  letter-spacing: 0.5px;
}

.label-theme-real .plaque-tag {
  color: var(--accent-dark);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.label-theme-inkwash .plaque-tag {
  color: var(--accent-light);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
}

/* Connecting Line */
.label-connector-line {
  width: 1.5px;
  height: 24px;
  background: linear-gradient(to bottom, var(--accent-light), transparent);
  transition: all 0.3s ease;
}

.label-theme-inkwash .label-connector-line {
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.city-3d-label:hover .label-connector-line {
  height: 30px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.label-theme-inkwash:hover .label-connector-line {
  background: linear-gradient(to bottom, #ffffff, transparent);
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
  font-weight: 900;
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

</style>
