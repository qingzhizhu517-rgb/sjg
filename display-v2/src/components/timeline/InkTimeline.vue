<template>
  <div class="ink-timeline" ref="containerRef">
    <!-- 长卷背景 -->
    <div class="ink-timeline__scroll" ref="scrollRef">
      <!-- 长卷底图 -->
      <img
        :src="scrollBase"
        class="ink-timeline__bg"
        alt="水墨长卷"
        loading="eager"
      />

      <!-- 朝代场景层（crossfade） -->
      <div class="ink-timeline__scenes">
        <img
          v-for="scene in scenes"
          :key="scene.id"
          :src="scene.url"
          class="ink-timeline__scene"
          :class="{ 'ink-timeline__scene--active': activeScene === scene.id }"
          :alt="scene.name + '场景'"
          loading="lazy"
        />
      </div>

      <!-- SVG 路径层 -->
      <svg
        class="ink-timeline__path-layer"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref="pathRef"
          :d="riverPath"
          fill="none"
          stroke="var(--ink-river, #8B7355)"
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
        alt="小舟"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
      />

      <!-- 朝代节点（印章） -->
      <div
        v-for="node in dynastyNodeList"
        :key="node.id"
        class="ink-timeline__node"
        :class="{
          'ink-timeline__node--active': activeDynastyIndex === node.index,
          'ink-timeline__node--visited': node.index < activeDynastyIndex
        }"
        :style="{ left: node.x + 'px', top: node.y + 'px' }"
        @click="selectDynasty(node.index)"
      >
        <span class="ink-timeline__seal">{{ node.name }}</span>
        <span class="ink-timeline__years">{{ formatYears(node) }}</span>
      </div>
    </div>

    <!-- 信息面板 -->
    <transition name="panel-slide">
      <div v-if="selectedDynasty" class="ink-timeline__panel" :key="selectedDynasty.id">
        <header class="ink-timeline__panel-head">
          <h3 class="ink-timeline__panel-name">{{ selectedDynasty.name }}</h3>
          <span class="ink-timeline__panel-years">
            {{ formatYear(selectedDynasty.startYear) }} 至 {{ formatYear(selectedDynasty.endYear) }}
          </span>
        </header>

        <div class="ink-timeline__panel-stats">
          <span><b>{{ selectedPoets.length }}</b> 位名士</span>
          <span class="ink-timeline__panel-sep">·</span>
          <span><b>{{ selectedPoems.length }}</b> 篇诗卷</span>
          <span class="ink-timeline__panel-sep">·</span>
          <span><b>{{ selectedEvents.length }}</b> 件史事</span>
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
                <span class="ink-timeline__panel-event-year">{{ formatYear(ev.year) }}</span>
                <span class="ink-timeline__panel-event-title">{{ ev.title }}</span>
              </div>
            </div>
            <p v-else class="ink-timeline__panel-empty">暂无史事录入</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- 操作提示 -->
    <div class="ink-timeline__hint">
      <span class="ink-timeline__hint-icon">⛵</span>
      <span>点击朝代印章或拖拽小舟，沿河探寻千年文脉</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useBoatJourney } from '../../composables/useBoatJourney'

const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-dynasty'])

// 素材导入
const scrollBase = new URL('../../public/media/inkwash/timeline/scroll-map-base.png', import.meta.url).href
const boatRower = new URL('../../public/media/inkwash/timeline/boat-rower.png', import.meta.url).href

// 场景图（金朝暂无独立素材，复用宋朝场景——宋金同期）
const scenes = [
  { id: 'qin', name: '秦', url: new URL('../../public/media/inkwash/timeline/scene-qin.png', import.meta.url).href },
  { id: 'han', name: '汉', url: new URL('../../public/media/inkwash/timeline/scene-han.png', import.meta.url).href },
  { id: 'weijin', name: '魏晋', url: new URL('../../public/media/inkwash/timeline/scene-weijin.png', import.meta.url).href },
  { id: 'tang', name: '唐', url: new URL('../../public/media/inkwash/timeline/scene-tang.png', import.meta.url).href },
  { id: 'song', name: '宋', url: new URL('../../public/media/inkwash/timeline/scene-song.png', import.meta.url).href },
  { id: 'jin', name: '金', url: new URL('../../public/media/inkwash/timeline/scene-song.png', import.meta.url).href },
  { id: 'yuan', name: '元', url: new URL('../../public/media/inkwash/timeline/scene-yuan.png', import.meta.url).href },
  { id: 'ming', name: '明', url: new URL('../../public/media/inkwash/timeline/scene-ming.png', import.meta.url).href },
  { id: 'qing', name: '清', url: new URL('../../public/media/inkwash/timeline/scene-qing.png', import.meta.url).href },
]

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
  dynasties,
  dynastyNodes,
  init: initBoat,
  goToDynasty,
  autoCruise,
  dispose: disposeBoat,
} = useBoatJourney()

// 朝代节点列表（dynastyNodes 已是 ref，直接使用）
const dynastyNodeList = dynastyNodes

// 当前朝代数据
const selectedDynasty = computed(() => {
  const dynasty = dynasties[activeDynastyIndex.value]
  if (!dynasty || !props.data.length) return null
  return props.data.find((d) => d.dynasty.id === dynasty.id)?.dynasty || dynasty
})

const selectedPoets = computed(() => {
  const dynasty = dynasties[activeDynastyIndex.value]
  if (!dynasty || !props.data.length) return []
  return props.data.find((d) => d.dynasty.id === dynasty.id)?.poets || []
})

const selectedPoems = computed(() => {
  const dynasty = dynasties[activeDynastyIndex.value]
  if (!dynasty || !props.data.length) return []
  return props.data.find((d) => d.dynasty.id === dynasty.id)?.poems || []
})

const selectedEvents = computed(() => {
  const dynasty = dynasties[activeDynastyIndex.value]
  if (!dynasty || !props.data.length) return []
  return props.data.find((d) => d.dynasty.id === dynasty.id)?.events || []
})

// 当前活跃场景
const activeScene = computed(() => dynasties[activeDynastyIndex.value]?.id || 'qin')

// 格式化年份
const formatYear = (y) =>
  y == null ? '' : y < 0 ? '前' + Math.abs(y) : String(y)

const formatYears = (node) =>
  `${formatYear(node.startYear)}-${formatYear(node.endYear)}`

// 选择朝代
function selectDynasty(index) {
  goToDynasty(index, { duration: prefersReduce ? 0.1 : 1.2 })
  emit('select-dynasty', dynasties[index])
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
  if (!_isDragging) return
  const dx = e.clientX - _startX
  const containerWidth = scrollRef.value?.offsetWidth || 1200
  const delta = dx / containerWidth
  const newProgress = Math.max(0, Math.min(1, _startProgress + delta))
  goToDynasty(Math.min(Math.floor(newProgress * dynasties.length), dynasties.length - 1), { duration: 0.1 })
}

function onPointerUp() {
  _isDragging = false
}

// 初始化
onMounted(() => {
  if (pathRef.value && boatRef.value) {
    initBoat({
      pathEl: pathRef.value,
      boatEl: boatRef.value,
      onDynastyChange: (index, dynasty) => {
        emit('select-dynasty', dynasty)
      },
    })

    // 自动巡航（非 reduced-motion）
    if (!prefersReduce) {
      autoCruise(30)
    }
  }
})

// 清理
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
  background: var(--ink-scroll-bg, #f5f0e8);
  border: 1px solid var(--border);
  border-radius: 4px;
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
  color: #fff;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.ink-timeline__node--active .ink-timeline__seal {
  background: var(--ink-seal-active, #c23a2b);
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(194, 58, 43, 0.4);
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
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  margin: 0 0 8px 0;
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

.ink-timeline__panel-stats b {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
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
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  letter-spacing: 2px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-light);
}

.ink-timeline__panel-icon {
  font-family: var(--font-display);
  font-size: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 2px;
  font-weight: 700;
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
  color: #fff;
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

.ink-timeline__panel-event-year {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
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
}
</style>
