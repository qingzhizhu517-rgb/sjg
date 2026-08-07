<template>
  <section ref="root" class="th">
    <!-- 背景：时间长河国画（全幅横卷，低透明） -->
    <div ref="artRef" class="th__art" aria-hidden="true">
      <img :src="riverImg" alt="" class="th__img" decoding="async" />
      <div class="th__art-veil"></div>
    </div>

    <!-- 右侧竖排题款 -->
    <p v-if="kuan" class="th__kuan" aria-hidden="true">{{ kuan }}</p>

    <!-- 前景内容 -->
    <div class="th__inner">
      <div ref="headRef" class="th__head">
        <span class="th__seal" aria-hidden="true">{{ sealChar }}</span>
        <span v-if="eyebrow" class="th__eyebrow">{{ eyebrow }}</span>
      </div>
      <h1 ref="titleRef" class="th__title">{{ title }}</h1>
      <p v-if="subtitle" ref="subRef" class="th__subtitle">{{ subtitle }}</p>

      <ul ref="statsRef" v-if="stats && stats.length" class="th__stats">
        <li v-for="(s, i) in stats" :key="i" class="th__stat">
          <span class="th__stat-num">{{ s.value }}<i class="th__stat-suffix">{{ s.suffix || '' }}</i></span>
          <span class="th__stat-label">{{ s.label }}</span>
        </li>
      </ul>

      <!-- 河流时间线（9 节点，呼应朝代年轮） -->
      <div ref="dotsRef" class="th-river" aria-hidden="true">
        <span class="th-river__line"></span>
        <span v-for="i in 9" :key="i" class="th-river__dot"></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import riverImg from '../../assets/illustrations/11-timeline-river.png'

defineProps({
  eyebrow: { type: String, default: '朝代年轮' },
  title: { type: String, default: '文脉长河' },
  subtitle: { type: String, default: '沿着历史的河流，见证诗与时代的交响。' },
  sealChar: { type: String, default: '文' },
  kuan: { type: String, default: '文脉绵延 近四千年' },
  stats: { type: Array, default: () => [] },
})

const root = ref(null)
const artRef = ref(null)
const headRef = ref(null)
const titleRef = ref(null)
const subRef = ref(null)
const statsRef = ref(null)
const dotsRef = ref(null)
let tl = null

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (prefersReduce() || !root.value) return
  tl = gsap.timeline({ delay: 0.15 })
  if (artRef.value)
    tl.from(artRef.value, { opacity: 0, scale: 1.04, duration: 1.2, ease: 'power2.out' })
  if (headRef.value)
    tl.from(
      headRef.value.children,
      { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.7',
    )
  if (titleRef.value)
    tl.from(titleRef.value, { opacity: 0, y: 26, duration: 0.75, ease: 'power3.out' }, '-=0.3')
  if (subRef.value)
    tl.from(subRef.value, { opacity: 0, y: 14, duration: 0.5, ease: 'power3.out' }, '-=0.45')
  if (statsRef.value)
    tl.from(
      statsRef.value.children,
      { opacity: 0, y: 12, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
      '-=0.3',
    )
  if (dotsRef.value)
    tl.from(
      dotsRef.value.querySelectorAll('.th-river__dot'),
      { opacity: 0, scale: 0, duration: 0.4, stagger: 0.06, ease: 'back.out(2)' },
      '-=0.2',
    )
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
  tl = null
})
</script>

<style scoped>
.th {
  position: relative;
  padding: 96px 56px 80px;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ============ 背景国画 ============ */
.th__art {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.th__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  opacity: 0.32;
}
.th__art-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    transparent 30%,
    transparent 62%,
    var(--bg-primary) 100%
  );
}

/* ============ 题款 ============ */
.th__kuan {
  position: absolute;
  top: 88px;
  right: 56px;
  z-index: 2;
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: 15px;
  letter-spacing: 7px;
  color: var(--text-muted);
  opacity: 0.75;
  max-height: 52vh;
  margin: 0;
}

/* ============ 前景 ============ */
.th__inner {
  position: relative;
  z-index: 2;
  max-width: 820px;
}
.th__head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}
.th__seal {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9e2b25;
  color: #f5efe3;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(-3deg);
  box-shadow: 0 3px 10px rgba(158, 43, 37, 0.28);
  flex-shrink: 0;
}
.theme-real .th__seal {
  background: #b23a2b;
}
.th__eyebrow {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent);
}
.th__title {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 900;
  letter-spacing: 10px;
  line-height: 1.05;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}
.th__subtitle {
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 1px;
  color: var(--text-secondary);
  max-width: 520px;
  margin: 0 0 30px 0;
}

/* 数据 */
.th__stats {
  list-style: none;
  display: flex;
  gap: 36px;
  padding: 18px 0;
  margin: 0 0 8px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.th__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.th__stat-num {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.th__stat-suffix {
  font-style: normal;
  font-size: 13px;
  margin-left: 2px;
  color: var(--text-muted);
}
.th__stat-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

/* 河流时间线 */
.th-river {
  position: relative;
  margin-top: 40px;
  height: 28px;
  width: 100%;
  max-width: 880px;
}
.th-river__line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border) 8%,
    var(--accent) 50%,
    var(--border) 92%,
    transparent
  );
}
.th-river__dot {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  transform: translate(-50%, -50%);
  opacity: 0.75;
}
.th-river__dot:nth-child(2) { left: 5%; }
.th-river__dot:nth-child(3) { left: 17%; }
.th-river__dot:nth-child(4) { left: 29%; }
.th-river__dot:nth-child(5) { left: 41%; }
.th-river__dot:nth-child(6) { left: 53%; }
.th-river__dot:nth-child(7) { left: 65%; }
.th-river__dot:nth-child(8) { left: 77%; }
.th-river__dot:nth-child(9) { left: 89%; }
.th-river__dot:nth-child(10) { left: 96%; }

@media (max-width: 768px) {
  .th {
    padding: 64px 20px 56px;
  }
  .th__title {
    letter-spacing: 5px;
  }
  .th__kuan {
    display: none;
  }
  .th__stats {
    flex-wrap: wrap;
    gap: 20px;
  }
  .th__img {
    opacity: 0.22;
  }
}
@media (prefers-reduced-motion: reduce) {
  .th-river__dot {
    opacity: 0.75;
  }
}
</style>
