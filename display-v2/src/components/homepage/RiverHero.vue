<template>
  <section ref="root" class="rh" :class="isReal ? 'rh--real' : 'rh--inkwash'">
    <!-- real：全屏视频背景 + 深色蒙版 -->
    <template v-if="isReal">
      <video
        v-if="!reduce && heroBg?.type === 'video'"
        class="rh__video-bg"
        :src="heroBg.url"
        :poster="heroBg.poster"
        autoplay
        muted
        loop
        playsinline
      />
      <img v-else class="rh__video-bg" :src="heroBg?.poster" alt="" />
      <div class="rh__overlay"></div>
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
        @ended="showScroll = true"
      />
      <img v-else :src="heroBg?.url || heroImg" alt="" class="rh__img" />
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
watch(isReal, () => {
  showScroll.value = false
})

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

/* ============ real：全屏视频背景 ============ */
.rh--real {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72vh;
  padding: 96px 56px;
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
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.55) 100%);
  z-index: 1;
}
.rh--real .rh__content {
  position: relative;
  z-index: 2;
  max-width: 640px;
  text-align: center;
}
.rh--real .rh__head {
  justify-content: center;
}
.rh--real .rh__title {
  align-items: center;
}
.rh--real .rh__title-line {
  color: #f5efe3;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.rh--real .rh__subtitle {
  color: rgba(245, 239, 227, 0.85);
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}
.rh--real .rh__stats {
  border-color: rgba(245, 239, 227, 0.25);
}
.rh--real .rh__stat-label,
.rh--real .rh__stat-suffix {
  color: rgba(245, 239, 227, 0.7);
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
    padding: 72px 32px;
  }
  .rh__content {
    max-width: 640px;
  }
  .rh__title-line {
    letter-spacing: 8px;
  }
}
@media (max-width: 640px) {
  .rh--inkwash {
    padding: 32px 20px 56px;
    gap: 24px;
  }
  .rh--real {
    padding: 56px 20px;
    min-height: 60vh;
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
</style>
