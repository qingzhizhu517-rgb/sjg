<template>
  <section ref="root" class="rh" :class="isReal ? 'rh--real' : 'rh--inkwash'">
    <!-- 黄河流水动画背景 -->
    <div class="yellow-river-animation" aria-hidden="true"></div>
    <!-- real：全屏长片背景（161s 黄河二十四节气）+ 节气叙事层 -->
    <template v-if="isReal">
      <video
        ref="videoRef"
        v-if="!reduce && !videoErr && heroBg?.type === 'video'"
        class="rh__video-bg"
        :src="heroBg.url"
        :poster="heroBg.poster"
        autoplay
        muted
        loop
        playsinline
        aria-hidden="true"
        @error="videoErr = true"
        @loadedmetadata="onMeta"
        @timeupdate="onTimeUpdate"
      />
      <img v-else class="rh__video-bg" :src="heroBg?.poster || heroImg" alt="" decoding="async" />
      <div class="rh__overlay"></div>

      <!-- 右缘竖排题款 -->
      <p class="rh__film-kuan" aria-hidden="true">黄河二十四节气</p>

      <!-- 播放控制 -->
      <div class="rh__controls">
        <button class="rh__ctl" :aria-pressed="!muted" @click="toggleMuted">{{ muted ? '静' : '声' }}</button>
        <button class="rh__ctl" @click="toggleFullscreen">全屏</button>
      </div>

      <!-- 当前节气印章 -->
      <div class="rh__term-seal" aria-hidden="true">
        <span>{{ currentTerm }}</span>
      </div>

      <!-- 底部 24 节气时间轴（点击跳转播放位） -->
      <nav class="rh__solar-terms" aria-label="二十四节气导航">
        <button
          v-for="(t, i) in SOLAR_TERMS"
          :key="t"
          class="rh__term-chip"
          :class="{ 'is-active': i === termIndex }"
          @click="seekTerm(i)"
        >{{ t }}</button>
      </nav>
    </template>

    <!-- inkwash：左 art 区（开场晕染视频 -> 定格长卷） -->
    <div v-else ref="artRef" class="rh__art" aria-hidden="true">
      <video
        v-if="!reduce && !showScroll && inkOpen?.type === 'video'"
        class="rh__img"
        :src="inkOpen.url"
        :poster="inkOpen.poster"
        autoplay
        muted
        playsinline
        aria-hidden="true"
        @ended="showScroll = true"
        @error="showScroll = true"
      />
      <img v-else :src="heroBg?.url || heroImg" alt="" class="rh__img" decoding="async" />
      <div class="rh__art-frame"></div>
      <!-- 画轴左侧题款 -->
      <p class="rh__art-kuan">黄河之水天上来</p>
      <p class="rh__art-kuan rh__art-kuan--2">奔流到海不复回</p>
      <span class="rh__art-seal"></span>
    </div>

    <!-- 右：分行大标题 + 数据 + CTA（双布局共用） -->
    <div class="rh__content">
      <div ref="headRef" class="rh__head">
        <span class="rh__seal">{{ sealChar }}</span>
        <span class="rh__eyebrow">{{ eyebrow }}</span>
      </div>

      <h1 ref="titleRef" class="rh__title">
        <span class="rh__title-line">{{ titleLine1 }}</span>
        <span class="rh__title-line">{{ titleLine2 }}</span>
      </h1>

      <p ref="subRef" class="rh__subtitle">{{ subtitle }}</p>

      <ul ref="statsRef" class="rh__stats" v-if="stats && stats.length">
        <li v-for="(s, i) in stats" :key="i" class="rh__stat">
          <span class="rh__stat-num">
            {{ s.value }}<i class="rh__stat-suffix">{{ s.suffix || '' }}</i>
          </span>
          <span class="rh__stat-label">{{ s.label }}</span>
        </li>
      </ul>

      <button v-if="ctaLabel" ref="ctaRef" class="rh__cta" @click="$emit('cta')">
        <span>{{ ctaLabel }}</span>
        <span class="rh__cta-arrow">↓</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import heroImg from '../../assets/illustrations/00-hero-yellow-river.png'
import { useTheme } from '../../composables/useTheme'

defineProps({
  eyebrow: { type: String, default: '山东 · 黄河入海' },
  sealChar: { type: String, default: '河' },
  titleLine1: { type: String, default: '山东揽胜' },
  titleLine2: { type: String, default: '黄河入海' },
  subtitle: {
    type: String,
    default:
      '黄河自菏泽入境，经九城，至东营归海。沿途孕育文学景观三百余处，文人大家近百位，传世名篇千载流芳。',
  },
  stats: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: '沿河而下' },
})
defineEmits(['cta'])

const { isReal, resolveAsset } = useTheme()

// 媒体解析：real -> hero-map 视频（+poster）；inkwash -> hero-scroll 长卷图 + hero-open 开场视频
const heroBg = computed(() => (isReal.value ? resolveAsset('hero-map') : resolveAsset('hero-scroll')))
const inkOpen = computed(() => (!isReal.value ? resolveAsset('hero-open') : null))

// inkwash 开场视频播完定格长卷
const showScroll = ref(false)
// real 视频加载失败降级 poster/插画
const videoErr = ref(false)
watch(isReal, () => {
  showScroll.value = false
  videoErr.value = false
})

// ---- real 长片节气叙事（161s 黄河二十四节气）----
const SOLAR_TERMS = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]
const videoRef = ref(null)
const duration = ref(0)
const currentTime = ref(0)
const muted = ref(true)
// 每节气约占时长 1/24, 按当前播放位换算
const termIndex = computed(() =>
  duration.value ? Math.min(SOLAR_TERMS.length - 1, Math.floor((currentTime.value / duration.value) * SOLAR_TERMS.length)) : 0,
)
const currentTerm = computed(() => SOLAR_TERMS[termIndex.value] || '立春')

const onMeta = (e) => {
  duration.value = e.target.duration || 0
}
const onTimeUpdate = (e) => {
  currentTime.value = e.target.currentTime || 0
}
const seekTerm = (i) => {
  const v = videoRef.value
  if (v && duration.value) {
    // +0.02 偏移避开节界抖动
    v.currentTime = ((i + 0.02) * duration.value) / SOLAR_TERMS.length
  }
}
const toggleMuted = () => {
  const v = videoRef.value
  if (!v) return
  v.muted = !v.muted
  muted.value = v.muted
}
const toggleFullscreen = () => {
  const v = videoRef.value
  if (!v) return
  try {
    if (document.fullscreenElement) document.exitFullscreen()
    else v.requestFullscreen?.()
  } catch {
    /* 不支持全屏时静默 */
  }
}

const reduce = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const root = ref(null)
const artRef = ref(null)
const headRef = ref(null)
const titleRef = ref(null)
const subRef = ref(null)
const statsRef = ref(null)
const ctaRef = ref(null)
let tl = null

onMounted(() => {
  if (reduce.value || !root.value) return
  tl = gsap.timeline({ delay: 0.15 })
  if (!isReal.value && artRef.value)
    tl.from(artRef.value, { opacity: 0, x: -28, duration: 0.9, ease: 'power3.out' })
  if (headRef.value)
    tl.from(
      headRef.value.children,
      { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.55',
    )
  if (titleRef.value)
    tl.from(
      titleRef.value.querySelectorAll('.rh__title-line'),
      { opacity: 0, y: 30, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
      '-=0.3',
    )
  if (subRef.value)
    tl.from(subRef.value, { opacity: 0, y: 14, duration: 0.5, ease: 'power3.out' }, '-=0.45')
  if (statsRef.value)
    tl.from(
      statsRef.value.children,
      { opacity: 0, y: 12, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
      '-=0.3',
    )
  if (ctaRef.value)
    tl.from(ctaRef.value, { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' }, '-=0.25')
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
  tl = null
})
</script>

<style scoped>
.rh {
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ============ real：全屏长片 + 节气叙事 ============ */
.rh--real {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 120px 56px 132px;
}
.rh__video-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.rh__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.18) 45%, rgba(0, 0, 0, 0.62) 100%);
  z-index: 1;
}
.rh--real .rh__content {
  max-width: 560px;
  text-align: left;
}
.rh--real .rh__head {
  justify-content: flex-start;
}
.rh--real .rh__title {
  align-items: flex-start;
}
.rh--real .rh__title-line {
  color: #f5efe3;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.rh--real .rh__subtitle {
  color: rgba(245, 239, 227, 0.85);
  margin-left: 0;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}
.rh--real .rh__stats {
  border-color: rgba(245, 239, 227, 0.25);
}
.rh--real .rh__stat-label,
.rh--real .rh__stat-suffix {
  color: rgba(245, 239, 227, 0.7);
}
.rh--real .rh__stat-num {
  color: #f5efe3;
}
.rh--real .rh__cta {
  background: #f5efe3;
  color: #1a1206;
  border-color: #f5efe3;
}
.rh--real .rh__cta:hover {
  background: var(--accent);
  color: #f5efe3;
  border-color: var(--accent);
}

/* 右缘竖排题款 */
.rh__film-kuan {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: 15px;
  letter-spacing: 8px;
  color: rgba(245, 239, 227, 0.55);
  margin: 0;
  z-index: 2;
  pointer-events: none;
}

/* 播放控制 */
.rh__controls {
  position: absolute;
  top: 22px;
  right: 22px;
  display: flex;
  gap: 10px;
  z-index: 3;
}
.rh__ctl {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(245, 239, 227, 0.35);
  border-radius: 50%;
  color: #f5efe3;
  font-family: var(--font-heading);
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.25s ease;
}
.rh__ctl:hover {
  background: var(--accent);
  border-color: var(--accent);
}

/* 当前节气印章 */
.rh__term-seal {
  position: absolute;
  right: 44px;
  bottom: 108px;
  width: 58px;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(178, 58, 43, 0.88);
  border-radius: 3px;
  transform: rotate(-3deg);
  z-index: 2;
  pointer-events: none;
}
.rh__term-seal span {
  writing-mode: vertical-rl;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #f5efe3;
}

/* 底部 24 节气时间轴 */
.rh__solar-terms {
  position: absolute;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  max-width: calc(100% - 200px);
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 2px;
  z-index: 3;
}
.rh__solar-terms::-webkit-scrollbar {
  display: none;
}
.rh__term-chip {
  flex-shrink: 0;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.26);
  border: 1px solid rgba(245, 239, 227, 0.22);
  border-radius: 2px;
  color: rgba(245, 239, 227, 0.68);
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.22s ease;
}
.rh__term-chip:hover {
  color: #f5efe3;
  border-color: rgba(245, 239, 227, 0.6);
}
.rh__term-chip.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-2px);
}

/* ============ inkwash：左右分栏 ============ */
.rh--inkwash {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 48px;
  align-items: center;
  padding: 64px 56px 96px;
}

/* ============ 左：国画/媒体 ============ */
.rh__art {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.04),
    0 24px 64px rgba(158, 43, 37, 0.08);
}
.rh__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rh__art-frame {
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(158, 43, 37, 0.18);
  pointer-events: none;
}
.rh__art-frame::before,
.rh__art-frame::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: rgba(158, 43, 37, 0.5);
  border-style: solid;
}
.rh__art-frame::before {
  top: -1px;
  left: -1px;
  border-width: 1.5px 0 0 1.5px;
}
.rh__art-frame::after {
  bottom: -1px;
  right: -1px;
  border-width: 0 1.5px 1.5px 0;
}

.rh__art-kuan {
  position: absolute;
  top: 32px;
  left: 32px;
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 6px;
  color: rgba(61, 43, 31, 0.7);
  margin: 0;
  text-shadow: 0 1px 0 rgba(245, 239, 227, 0.6);
}
.rh__art-kuan--2 {
  left: 60px;
  top: 48px;
}
.rh__art-seal {
  position: absolute;
  left: 30px;
  top: calc(32px + 9em);
  width: 22px;
  height: 22px;
  background: #9e2b25;
  border-radius: 2px;
  opacity: 0.9;
  transform: rotate(-2deg);
}

/* ============ 右：文字 ============ */
.rh__content {
  position: relative;
  z-index: 2;
  max-width: 460px;
}

.rh__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.rh__seal {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9e2b25;
  color: #f5efe3;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(-3deg);
  box-shadow: 0 3px 10px rgba(158, 43, 37, 0.28);
  flex-shrink: 0;
}
.theme-real .rh__seal {
  background: #b23a2b;
}
.rh__eyebrow {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent);
}

.rh__title {
  margin: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rh__title-line {
  font-family: var(--font-display);
  font-size: clamp(56px, 6.2vw, 92px);
  font-weight: 900;
  letter-spacing: 12px;
  line-height: 1.05;
  color: var(--text-primary);
  display: block;
}

.rh__subtitle {
  font-size: 14px;
  line-height: 2;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin: 0 0 28px 0;
  max-width: 420px;
}

/* 数据条 */
.rh__stats {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 18px 0;
  margin: 0 0 26px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.rh__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
.rh__stat-num {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.rh__stat-suffix {
  font-style: normal;
  font-size: 13px;
  margin-left: 2px;
  color: var(--text-muted);
}
.rh__stat-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

/* CTA */
.rh__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 30px;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 1px solid var(--text-primary);
  border-radius: 2px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.rh__cta:hover {
  background: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(158, 43, 37, 0.25);
}
.rh__cta-arrow {
  transition: transform 0.3s;
}
.rh__cta:hover .rh__cta-arrow {
  transform: translateY(3px);
}

/* ============ 响应式 ============ */
@media (max-width: 1024px) {
  .rh--inkwash {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 48px 32px 72px;
  }
  .rh--real {
    padding: 96px 32px 128px;
  }
  .rh__content {
    max-width: 640px;
  }
  .rh__title-line {
    letter-spacing: 8px;
  }
  .rh__solar-terms {
    max-width: calc(100% - 32px);
  }
}
@media (max-width: 640px) {
  .rh--inkwash {
    padding: 32px 20px 56px;
    gap: 24px;
  }
  .rh--real {
    padding: 88px 20px 124px;
    min-height: 100svh;
  }
  .rh__film-kuan {
    display: none;
  }
  .rh__term-seal {
    right: 20px;
    bottom: 92px;
    width: 44px;
    height: 58px;
  }
  .rh__term-seal span {
    font-size: 17px;
    letter-spacing: 3px;
  }
  .rh__title-line {
    font-size: clamp(40px, 11vw, 56px);
    letter-spacing: 6px;
  }
  .rh__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .rh__art-kuan {
    font-size: 12px;
    letter-spacing: 4px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rh__cta,
  .rh__cta-arrow {
    transition: none;
  }
}
/* 黄河流水动画 */
.yellow-river-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(200, 164, 92, 0.1) 20%, rgba(200, 164, 92, 0.3) 50%, rgba(200, 164, 92, 0.1) 80%, transparent 100%);
  background-size: 200% 100%;
  animation: riverFlow 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes riverFlow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

</style>
