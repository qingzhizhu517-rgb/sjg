<template>
  <div class="ink-timeline" ref="containerRef">
    <!-- 长卷背景 -->
    <div class="ink-timeline__scroll" ref="scrollRef">
      <!-- 长卷底图 -->
      <img
        :src="scrollBase"
        class="ink-timeline__bg"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />

      <!-- 朝代场景层（crossfade）—— 仅挂载当前 + 相邻两张，避免 9 张 15MB 全量拉取 -->
      <div class="ink-timeline__scenes" aria-hidden="true">
        <img
          v-for="d in visibleScenes"
          :key="d.dynasty.id"
          :src="sceneUrl(d.dynasty.id)"
          class="ink-timeline__scene"
          :class="{ 'ink-timeline__scene--active': activeSceneId === d.dynasty.id }"
          :alt="d.dynasty.name + '场景'"
          loading="lazy"
        />
      </div>

      <!-- SVG 路径层 -->
      <svg
        class="ink-timeline__path-layer"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref="pathRef"
          :d="riverPath"
          fill="none"
          stroke="var(--ink-wash)"
          stroke-width="3"
          stroke-dasharray="8 4"
          opacity="0.6"
        />
      </svg>

      <!-- 小舟精灵 -->
      <img
        ref="boatRef"
        :src="boatRower"
        class="ink-timeline__boat"
        alt="拖拽小舟沿河探寻"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
      />

      <!-- 朝代节点（印章）—— tablist 语义，方向键可切换 -->
      <div
        class="ink-timeline__nodes"
        role="tablist"
        aria-label="朝代选择"
      >
        <button
          v-for="node in dynastyNodeList"
          :key="node.index"
          type="button"
          class="ink-timeline__node"
          :class="{
            'ink-timeline__node--active': activeDynastyIndex === node.index,
            'ink-timeline__node--visited': node.index < activeDynastyIndex
          }"
          :style="{ left: node.xPct + '%', top: node.yPct + '%' }"
          role="tab"
          :aria-selected="activeDynastyIndex === node.index ? 'true' : 'false'"
          :tabindex="activeDynastyIndex === node.index ? 0 : -1"
          :aria-label="dynastyList[node.index]?.name || '朝代'"
          @click="selectDynasty(node.index)"
          @keydown="onNodeKeydown($event, node.index)"
        >
          <span class="ink-timeline__seal">{{ dynastyList[node.index]?.name || '' }}</span>
          <span class="ink-timeline__years">{{ formatYears(dynastyList[node.index]) }}</span>
        </button>
      </div>
    </div>

    <!-- 播放/暂停巡航 -->
    <div class="ink-timeline__controls">
      <button type="button" class="ink-timeline__cruise-btn" @click="toggleCruise"
              :aria-label="isCruising ? '暂停自动巡航' : '开始自动巡航'">
        {{ isCruising ? '⏸ 暂停巡航' : '▶ 自动巡航' }}
      </button>
    </div>

    <!-- 信息面板 -->
    <transition name="panel-slide">
      <div v-if="selectedDynasty" class="ink-timeline__panel" :key="selectedDynasty.id" role="tabpanel" aria-live="polite" :aria-label="selectedDynasty.name + '朝代详情'">
        <header class="ink-timeline__panel-head">
          <h3 class="ink-timeline__panel-name">{{ selectedDynasty.name }}</h3>
          <span class="ink-timeline__panel-years">
            {{ formatYear(selectedDynasty.startYear) }} 至 {{ formatYear(selectedDynasty.endYear) }}
          </span>
          <p v-if="selectedDynasty.description" class="ink-timeline__panel-desc">{{ selectedDynasty.description }}</p>
        </header>

        <div class="ink-timeline__panel-stats">
          <span><strong>{{ selectedPoets.length }}</strong> 位名士</span>
          <span class="ink-timeline__panel-sep">·</span>
          <span><strong>{{ selectedPoems.length }}</strong> 篇诗卷</span>
          <span class="ink-timeline__panel-sep">·</span>
          <span><strong>{{ selectedEvents.length }}</strong> 件史事</span>
        </div>

        <div class="ink-timeline__panel-cols">
          <!-- 名士 -->
          <div class="ink-timeline__panel-col">
            <h4 class="ink-timeline__panel-col-title">
              <span class="ink-timeline__panel-icon">人</span>代表名士
            </h4>
            <div v-if="selectedPoets.length" class="ink-timeline__panel-poets">
              <router-link
                v-for="p in selectedPoets.slice(0, 8)"
                :key="p.id"
                :to="`/poets/${p.id}`"
                class="ink-timeline__panel-poet-chip"
              >{{ p.name }}</router-link>
              <span v-if="poetsOverflow > 0" class="ink-timeline__panel-overflow">共 {{ poetsOverflow + 8 }} 位</span>
            </div>
            <p v-else class="ink-timeline__panel-empty">暂无名士录入</p>
          </div>

          <!-- 诗篇 -->
          <div class="ink-timeline__panel-col">
            <h4 class="ink-timeline__panel-col-title">
              <span class="ink-timeline__panel-icon">诗</span>传世诗篇
            </h4>
            <div v-if="selectedPoems.length" class="ink-timeline__panel-poems">
              <router-link
                v-for="pm in selectedPoems.slice(0, 5)"
                :key="pm.id"
                :to="`/poems/${pm.id}`"
                class="ink-timeline__panel-poem-row"
              >
                <span class="ink-timeline__panel-poem-title">{{ pm.title }}</span>
                <span class="ink-timeline__panel-poem-arrow">→</span>
              </router-link>
              <span v-if="poemsOverflow > 0" class="ink-timeline__panel-overflow">共 {{ poemsOverflow + 5 }} 首</span>
            </div>
            <p v-else class="ink-timeline__panel-empty">暂无诗篇录入</p>
          </div>

          <!-- 史事 -->
          <div class="ink-timeline__panel-col">
            <h4 class="ink-timeline__panel-col-title">
              <span class="ink-timeline__panel-icon">事</span>历史事件
            </h4>
            <div v-if="selectedEvents.length" class="ink-timeline__panel-events">
              <div v-for="ev in selectedEvents.slice(0, 3)" :key="ev.id" class="ink-timeline__panel-event">
                <img v-if="parseFirstUrl(ev.imageUrl)" :src="parseFirstUrl(ev.imageUrl)" class="ink-timeline__panel-event-img" :alt="ev.title" loading="lazy" />
                <div class="ink-timeline__panel-event-body">
                  <span class="ink-timeline__panel-event-year">{{ formatYear(ev.year) }}</span>
                  <span class="ink-timeline__panel-event-title">{{ ev.title }}</span>
                  <p v-if="ev.significance" class="ink-timeline__panel-event-sig">{{ ev.significance }}</p>
                  <p v-else-if="ev.description" class="ink-timeline__panel-event-sig">{{ ev.description }}</p>
                </div>
              </div>
              <span v-if="eventsOverflow > 0" class="ink-timeline__panel-overflow">共 {{ eventsOverflow + 3 }} 件</span>
            </div>
            <p v-else class="ink-timeline__panel-empty">暂无史事录入</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- 操作提示 -->
    <div class="ink-timeline__hint">
      <span class="ink-timeline__hint-icon" aria-hidden="true">⛵</span>
      <span>点击朝代印章或拖拽小舟，沿河探寻千年文脉</span>
    </div>

    <!-- 诗风演变（跨朝代文脉，纯静态） -->
    <section class="ink-timeline__evo" data-reveal>
      <h3 class="ink-timeline__section-title">诗风演变 · 跨朝代文脉</h3>
      <div class="ink-timeline__evo-track">
        <div v-for="(s, i) in evolution" :key="i" class="ink-timeline__evo-stage">
          <div class="ink-timeline__evo-inner">
            <span class="ink-timeline__evo-name">{{ s.name }}</span>
            <span class="ink-timeline__evo-style">{{ s.style }}</span>
          </div>
          <span v-if="i < evolution.length - 1" class="ink-timeline__evo-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </section>

    <!-- 文脉之最（从同一份 data 现算，零额外请求） -->
    <section v-if="extremes" class="ink-timeline__most" data-reveal>
      <h3 class="ink-timeline__section-title">文脉之最 · 数据中的齐鲁文脉</h3>
      <div class="ink-timeline__most-grid">
        <div class="ink-timeline__most-card">
          <span class="ink-timeline__most-num">{{ extremes.topDynastyPoets.count }}</span>
          <span class="ink-timeline__most-lbl">{{ extremes.topDynastyPoets.name }} 名士最盛</span>
        </div>
        <div class="ink-timeline__most-card">
          <span class="ink-timeline__most-num">{{ extremes.topDynastyPoems.count }}</span>
          <span class="ink-timeline__most-lbl">{{ extremes.topDynastyPoems.name }} 诗篇最丰</span>
        </div>
        <div class="ink-timeline__most-card">
          <span class="ink-timeline__most-num">{{ extremes.longestSpan.years }}</span>
          <span class="ink-timeline__most-lbl">{{ extremes.longestSpan.name }} 跨度最长</span>
        </div>
        <div class="ink-timeline__most-card">
          <span class="ink-timeline__most-num">{{ extremes.totalPoets }}</span>
          <span class="ink-timeline__most-lbl">齐鲁名士总数</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useBoatJourney } from '../../composables/useBoatJourney'
import { parseFirstUrl } from '../../composables/useImage'

const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const props = defineProps({
  data: { type: Array, default: () => [] },
  initialDynastyId: { type: [Number, String], default: null },
})

const emit = defineEmits(['select-dynasty'])

// 素材：使用绝对服务路径（resolveAsset 需要 manifest 注册，timeline 素材未注册）
// 已由 PNG 转 WebP（15MB → ~0.7MB，满足单页媒体 <3MB 预算），PNG 原图保留备份
const scrollBase = '/media/inkwash/timeline/scroll-map-base.webp'
const boatRower = '/media/inkwash/timeline/boat-rower.webp'

// 场景图（id 与数据库 dynasty.id 对齐；金朝暂无独立素材，复用宋朝场景——宋金同期）
const SCENE_MAP = {
  1: '/media/inkwash/timeline/scene-qin.webp',
  2: '/media/inkwash/timeline/scene-han.webp',
  3: '/media/inkwash/timeline/scene-weijin.webp',
  4: '/media/inkwash/timeline/scene-tang.webp',
  5: '/media/inkwash/timeline/scene-song.webp',
  9: '/media/inkwash/timeline/scene-song.webp', // 金
  6: '/media/inkwash/timeline/scene-yuan.webp',
  7: '/media/inkwash/timeline/scene-ming.webp',
  8: '/media/inkwash/timeline/scene-qing.webp',
}

// 黄河曲线 SVG path（蜿蜒东流）
const riverPath = 'M 50,200 C 150,100 250,300 400,180 S 600,280 750,150 S 950,250 1100,180'

// Refs
const containerRef = ref(null)
const scrollRef = ref(null)
const pathRef = ref(null)
const boatRef = ref(null)

// 划舟引擎
const {
  progress,
  activeDynastyIndex,
  isCruising,
  dynastyNodes,
  init: initBoat,
  goToDynasty,
  autoCruise,
  pauseCruise,
  toggleCruise: _toggleCruise,
  dispose: disposeBoat,
} = useBoatJourney()

// 朝代节点列表
const dynastyNodeList = dynastyNodes

// 从 props.data 派生朝代列表（单源，不依赖 composable 内硬编码）
const dynastyList = computed(() => props.data.map((d) => d.dynasty))

// 当前朝代数据
const selectedDynasty = computed(() => {
  const idx = activeDynastyIndex.value
  if (!props.data.length || idx >= props.data.length) return null
  return props.data[idx]?.dynasty || null
})

const selectedPoets = computed(() => {
  if (!props.data.length || activeDynastyIndex.value >= props.data.length) return []
  return props.data[activeDynastyIndex.value]?.poets || []
})

const selectedPoems = computed(() => {
  if (!props.data.length || activeDynastyIndex.value >= props.data.length) return []
  return props.data[activeDynastyIndex.value]?.poems || []
})

const selectedEvents = computed(() => {
  if (!props.data.length || activeDynastyIndex.value >= props.data.length) return []
  return props.data[activeDynastyIndex.value]?.events || []
})

// 截断提示
const poetsOverflow = computed(() => {
  const total = props.data[activeDynastyIndex.value]?.dynasty?.poetCount ?? selectedPoets.value.length
  return Math.max(0, total - 8)
})
const poemsOverflow = computed(() => {
  const total = props.data[activeDynastyIndex.value]?.dynasty?.poemCount ?? selectedPoems.value.length
  return Math.max(0, total - 5)
})
const eventsOverflow = computed(() => Math.max(0, selectedEvents.value.length - 3))

// 当前活跃场景
const activeSceneId = computed(() => {
  if (!props.data.length || activeDynastyIndex.value >= props.data.length) return 1
  return props.data[activeDynastyIndex.value]?.dynasty?.id || 1
})

const sceneUrl = (id) => SCENE_MAP[id] || SCENE_MAP[1]

// 诗风演变（静态五段，移植自旧 RealTimeline）
const evolution = [
  { name: '诗经', style: '现实主义' },
  { name: '楚辞', style: '浪漫主义' },
  { name: '唐诗', style: '气象万千' },
  { name: '宋词', style: '婉约豪放' },
  { name: '元曲', style: '民俗市井' },
]

// 文脉之最：从 props.data 现算，零额外请求
const extremes = computed(() => {
  if (!props.data.length) return null
  let topPoets = { name: '', count: 0 }
  let topPoems = { name: '', count: 0 }
  let longest = { name: '', years: 0 }
  let totalPoets = 0
  props.data.forEach((t) => {
    const poets = t.poets?.length || 0
    const poems = t.poems?.length || 0
    if (poets > topPoets.count) topPoets = { name: t.dynasty.name, count: poets }
    if (poems > topPoems.count) topPoems = { name: t.dynasty.name, count: poems }
    totalPoets += poets
    const span = (t.dynasty.endYear || 0) - (t.dynasty.startYear || 0)
    if (span > longest.years) longest = { name: t.dynasty.name, years: span }
  })
  return { topDynastyPoets: topPoets, topDynastyPoems: topPoems, longestSpan: longest, totalPoets }
})

// 仅渲染当前 ± 1 朝代的场景图，控制并发拉取（9×~1.5MB → 至多 3 张）
const visibleScenes = computed(() => {
  if (!props.data.length) return []
  const idx = Math.min(activeDynastyIndex.value, props.data.length - 1)
  return props.data.filter((_, i) => Math.abs(i - idx) <= 1)
})

// 格式化年份
const formatYear = (y) =>
  y == null ? '' : y < 0 ? '前' + Math.abs(y) : String(y)

const formatYears = (d) =>
  d ? `${formatYear(d.startYear)}-${formatYear(d.endYear)}` : ''

// 选择朝代
function selectDynasty(index) {
  pauseCruise()
  goToDynasty(index, { duration: prefersReduce ? 0.1 : 1.2 })
  const dynasty = dynastyList.value[index]
  if (dynasty) emit('select-dynasty', dynasty)
}

// 播放/暂停巡航（模板绑定）
function toggleCruise() {
  _toggleCruise()
}

// 拖拽小舟
let _isDragging = false
let _startX = 0
let _startProgress = 0

function onPointerDown(e) {
  if (!boatRef.value?.contains(e.target)) return
  _isDragging = true
  _startX = e.clientX
  _startProgress = progress.value
  boatRef.value.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!_isDragging || !props.data.length) return
  const dx = e.clientX - _startX
  const containerWidth = scrollRef.value?.offsetWidth || 1200
  const delta = dx / containerWidth
  const newProgress = Math.max(0, Math.min(1, _startProgress + delta))
  goToDynasty(Math.min(Math.floor(newProgress * props.data.length), props.data.length - 1), { duration: 0.1 })
}

function onPointerUp() {
  _isDragging = false
}

// 键盘导航：Enter/Space 选中，方向键在朝代间移动
function onNodeKeydown(e, index) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    selectDynasty(index)
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    focusNode(Math.min(index + 1, dynastyList.value.length - 1))
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    focusNode(Math.max(index - 1, 0))
  } else if (e.key === 'Home') {
    e.preventDefault()
    focusNode(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    focusNode(dynastyList.value.length - 1)
  }
}

function focusNode(index) {
  selectDynasty(index)
  // 选中后 tabindex 转移到该节点，下一 tick 聚焦
  requestAnimationFrame(() => {
    const btns = containerRef.value?.querySelectorAll('.ink-timeline__node')
    btns?.[index]?.focus()
  })
}

// 初始化：data 异步到达，需要 watch 触发（onMounted 时 data 可能为空）
let _boatInited = false
function tryInitBoat() {
  if (_boatInited || !pathRef.value || !boatRef.value || !props.data.length) return
  _boatInited = true
  initBoat({
    pathEl: pathRef.value,
    boatEl: boatRef.value,
    dynastyCount: props.data.length,
    viewBoxW: 1200,
    viewBoxH: 400,
    // 巡航自动推进只更新面板（activeDynastyIndex 已是响应式），不写 URL——
    // 否则每过一个朝代都触发 router.replace + scrollBehavior 归顶，页面被反复拽回顶部像卡死，
    // 且 ?dynasty= 被持续写入，刷新后走深链接分支暂停巡航，看起来"刷新也没用"。
    // 只有用户显式点击/键盘选择（selectDynasty）才 emit 写 URL。
    onDynastyChange: null,
  })
  if (!prefersReduce) {
    // 有深链接目标则定位到该朝代，否则自动巡航
    const targetIdx = props.initialDynastyId != null
      ? props.data.findIndex((d) => String(d.dynasty.id) === String(props.initialDynastyId))
      : -1
    if (targetIdx >= 0) {
      selectDynasty(targetIdx)
    } else {
      autoCruise(30)
    }
  } else if (props.initialDynastyId != null) {
    const targetIdx = props.data.findIndex((d) => String(d.dynasty.id) === String(props.initialDynastyId))
    if (targetIdx >= 0) goToDynasty(targetIdx, { duration: 0.1 })
  }
}

onMounted(tryInitBoat)
watch(() => props.data.length, tryInitBoat)

onBeforeUnmount(() => {
  disposeBoat()
})
</script>

<style scoped>
.ink-timeline {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* 长卷容器 */
.ink-timeline__scroll {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

/* 长卷底图 */
.ink-timeline__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  pointer-events: none;
}

/* 场景层 */
.ink-timeline__scenes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ink-timeline__scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.5s ease;
}

.ink-timeline__scene--active {
  opacity: 0.4;
}

/* SVG 路径层 */
.ink-timeline__path-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 小舟 */
.ink-timeline__boat {
  position: absolute;
  width: 60px;
  height: 60px;
  transform-origin: 50% 50%;
  cursor: grab;
  touch-action: pan-y;   /* 纵向滚动优先，横向拖拽由 pointer 事件处理 */
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  z-index: 10;
  transition: filter 0.3s ease;
}

.ink-timeline__boat:hover {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
}

.ink-timeline__boat:active {
  cursor: grabbing;
}

/* 朝代节点 */
.ink-timeline__node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  z-index: 5;
  transition: all 0.3s ease;
  /* button reset */
  background: none;
  border: none;
  padding: 0;
  font: inherit;
}

.ink-timeline__node:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

/* 播放/暂停巡航控制 */
.ink-timeline__controls {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.ink-timeline__cruise-btn {
  padding: 6px 18px;
  font-size: var(--fs-body-sm);
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  cursor: pointer;
  letter-spacing: 1px;
  transition: background 0.25s, color 0.25s;
}

.ink-timeline__cruise-btn:hover {
  background: var(--accent);
  color: var(--text-on-accent);
}

.ink-timeline__node:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.ink-timeline__seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--text-primary) 20%, transparent);
  transition: all 0.3s ease;
}

.ink-timeline__node--active .ink-timeline__seal {
  background: var(--accent-dark);
  transform: scale(1.15);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent);
}

.ink-timeline__node--visited .ink-timeline__seal {
  opacity: 0.6;
}

.ink-timeline__years {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1px;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 信息面板 */
.ink-timeline__panel {
  margin-top: 24px;
  padding: 28px 32px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 4px;
}

.ink-timeline__panel-head {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.ink-timeline__panel-name {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin: 0 0 8px 0;
}

.ink-timeline__panel-desc {
  font-size: var(--fs-body-sm);
  color: var(--text-secondary);
  line-height: var(--lh-body);
  margin: var(--sp-3) 0 0;
}

.ink-timeline__panel-years {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.ink-timeline__panel-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.ink-timeline__panel-stats strong {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--accent);
  margin-right: 2px;
}

.ink-timeline__panel-sep {
  color: var(--border);
}

/* 面板三栏 */
.ink-timeline__panel-cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

.ink-timeline__panel-col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-body-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  letter-spacing: 2px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-light);
}

.ink-timeline__panel-icon {
  font-family: var(--font-display);
  font-size: var(--fs-caption);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text-on-accent);
  border-radius: 2px;
  font-weight: 600;
}

/* 名士芯片 */
.ink-timeline__panel-poets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ink-timeline__panel-poet-chip {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.25s ease;
  font-weight: 600;
  letter-spacing: 1px;
}

.ink-timeline__panel-poet-chip:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}

/* 诗篇行 */
.ink-timeline__panel-poems {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ink-timeline__panel-poem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 2px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.ink-timeline__panel-poem-row:hover {
  background: color-mix(in srgb, var(--accent) 4%, transparent);
  border-color: var(--accent-light);
}

.ink-timeline__panel-poem-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.ink-timeline__panel-poem-arrow {
  font-size: 13px;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}

.ink-timeline__panel-poem-row:hover .ink-timeline__panel-poem-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* 史事 */
.ink-timeline__panel-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ink-timeline__panel-event {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.ink-timeline__panel-event-img {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.ink-timeline__panel-event-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ink-timeline__panel-event-year {
  font-family: var(--font-display);
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--accent);
  min-width: 50px;
  flex-shrink: 0;
}

.ink-timeline__panel-event-title {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

.ink-timeline__panel-empty {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  letter-spacing: 1px;
}

.ink-timeline__panel-event-sig {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.ink-timeline__panel-overflow {
  font-size: 11px;
  color: var(--text-muted);
  padding: 4px 8px;
  letter-spacing: 1px;
}

/* 操作提示 */
.ink-timeline__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.ink-timeline__hint-icon {
  font-size: 16px;
}

/* 诗风演变 + 文脉之最 */
.ink-timeline__evo,
.ink-timeline__most {
  margin-top: var(--sp-8);
}

.ink-timeline__section-title {
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0 0 var(--sp-5);
  padding-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-light);
}

.ink-timeline__evo-track {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 20px 12px;
}
.ink-timeline__evo-stage {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 120px;
  justify-content: center;
}
.ink-timeline__evo-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
}
.ink-timeline__evo-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.ink-timeline__evo-style {
  font-size: 11px;
  color: var(--accent);
  letter-spacing: 1px;
}
.ink-timeline__evo-arrow {
  color: var(--accent);
  font-size: 18px;
  opacity: 0.6;
}

.ink-timeline__most-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.ink-timeline__most-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.ink-timeline__most-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: var(--card-shadow-hover);
}
.ink-timeline__most-num {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}
.ink-timeline__most-lbl {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  line-height: 1.5;
}

/* 面板滑入动画 */
.panel-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ink-timeline__scene {
    transition: none;
  }

  .ink-timeline__node {
    transition: none;
  }

  .ink-timeline__seal {
    transition: none;
  }

  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .ink-timeline__scroll {
    height: 350px;
  }

  .ink-timeline__panel {
    padding: 24px 24px;
  }

  .ink-timeline__panel-name {
    font-size: 28px;
    letter-spacing: 3px;
  }
}

@media (max-width: 768px) {
  .ink-timeline__scroll {
    height: 300px;
  }

  .ink-timeline__panel {
    padding: 20px 16px;
  }

  .ink-timeline__panel-name {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .ink-timeline__panel-cols {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .ink-timeline__seal {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .ink-timeline__evo-track {
    flex-direction: column;
    gap: 4px;
  }
  .ink-timeline__evo-stage {
    flex-direction: row;
    min-width: 0;
  }
  .ink-timeline__evo-arrow {
    transform: rotate(90deg);
  }
  .ink-timeline__most-grid {
    grid-template-columns: 1fr 1fr;
  }
  .ink-timeline__most-num {
    font-size: 28px;
  }
}
</style>
