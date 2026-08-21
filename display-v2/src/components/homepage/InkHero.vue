<template>
  <section ref="root" class="ph" :class="`ph--${variant}`">
    <!-- 纸本墨晕（CSS，非粒子/光晕） -->
    <div class="ph__wash" aria-hidden="true"></div>

    <!-- 右侧竖排题款 -->
    <p v-if="kuan" class="ph__kuan" aria-hidden="true">{{ kuan }}</p>

    <div ref="content" class="ph__inner">
      <div class="ph__head">
        <span class="ph__seal" aria-hidden="true">{{ sealChar || title.charAt(0) }}</span>
        <span v-if="eyebrow" class="ph__eyebrow">{{ eyebrow }}</span>
      </div>
      <h1 ref="titleEl" class="ph__title">{{ title }}</h1>
      <p v-if="subtitle" ref="subtitleEl" class="ph__subtitle">{{ subtitle }}</p>
      <StatTicker
        v-if="stats && stats.length"
        ref="ticker"
        class="ph__stats"
        :stats="stats"
        tone="light"
      />
      <button v-if="ctaLabel" ref="ctaEl" class="ph__cta" @click="$emit('cta')">
        <span>{{ ctaLabel }}</span>
        <span class="ph__cta-arrow">→</span>
      </button>

      <!-- river variant: 横向河流时间线 -->
      <div v-if="variant === 'river'" class="ph-river" aria-hidden="true">
        <span class="ph-river__line"></span>
        <span class="ph-river__dot" v-for="i in 9" :key="i"></span>
      </div>
    </div>

    <!-- landscape variant: 横展地平线 + 远山 -->
    <div v-if="variant === 'landscape'" class="ph-horizon" aria-hidden="true">
      <span class="ph-horizon__peak p1"></span>
      <span class="ph-horizon__peak p2"></span>
      <span class="ph-horizon__peak p3"></span>
      <span class="ph-horizon__water"></span>
    </div>

    <!-- roster variant: 右侧诗书画印纵列 -->
    <div v-else-if="variant === 'roster'" class="ph-roster" aria-hidden="true">
      <span class="ph-roster__seal" v-for="c in rosterChars" :key="c">{{ c }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import StatTicker from './StatTicker.vue'

const prefersReduce = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: '' },
  variant: { type: String, default: 'landscape' }, // landscape | roster | river
  sealChar: { type: String, default: '' },
  kuan: { type: String, default: '' },
})
defineEmits(['cta'])

const root = ref(null)
const titleEl = ref(null)
const subtitleEl = ref(null)
const ctaEl = ref(null)
let tl = null

const rosterChars = ['诗', '书', '画', '印']

onMounted(() => {
  if (prefersReduce() || !root.value) return
  tl = gsap.timeline({ delay: 0.12 })
  const seal = root.value.querySelector('.ph__seal')
  if (seal) tl.from(seal, { scale: 0.6, opacity: 0, duration: 0.5, ease: 'power2.out' })
  if (titleEl.value)
    tl.from(
      titleEl.value,
      { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.25',
    )
  if (subtitleEl.value)
    tl.from(
      subtitleEl.value,
      { y: 14, opacity: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.4',
    )
  const statsEl = root.value.querySelector('.ph__stats')
  if (statsEl)
    tl.from(
      statsEl,
      { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.3',
    )
  if (ctaEl.value)
    tl.from(
      ctaEl.value,
      { y: 10, opacity: 0, duration: 0.4, ease: 'power3.out' },
      '-=0.25',
    )
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
  tl = null
})
</script>

<style scoped>
.ph {
  position: relative;
  padding: 88px 48px 72px;
  overflow: hidden;
  background: var(--bg-primary);
}
.ph__wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
      110% 80% at 88% 12%,
      color-mix(in srgb, var(--text-primary) 5%, transparent),
      transparent 55%
    ),
    radial-gradient(90% 70% at 8% 92%, rgba(158, 43, 37, 0.04), transparent 60%);
}
.theme-inkwash .ph__wash {
  background: radial-gradient(
      110% 80% at 88% 12%,
      rgba(0, 0, 0, 0.04),
      transparent 55%
    ),
    radial-gradient(90% 70% at 8% 92%, color-mix(in srgb, var(--accent) 5%, transparent), transparent 60%);
}

.ph__kuan {
  position: absolute;
  top: 80px;
  right: 56px;
  z-index: 2;
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: 15px;
  letter-spacing: 7px;
  color: var(--text-muted);
  opacity: 0.75;
  max-height: 56vh;
  margin: 0;
}

.ph__inner {
  position: relative;
  z-index: 2;
  max-width: 880px;
}
.ph__head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.ph__seal {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(-3deg);
  box-shadow: 0 3px 10px rgba(158, 43, 37, 0.28);
  flex-shrink: 0;
}
.ph__eyebrow {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent);
}
.ph__title {
  font-family: var(--font-display);
  font-size: clamp(48px, 9vw, 104px);
  font-weight: 900;
  letter-spacing: 8px;
  line-height: 1.05;
  color: var(--text-primary);
  margin: 0 0 22px 0;
}
.ph__subtitle {
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 1px;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 0 28px 0;
}
.ph__stats {
  margin-bottom: 8px;
}
.ph__cta {
  margin-top: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 30px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
  border-radius: 2px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.ph__cta:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}
.ph__cta:active {
  transform: translateY(1px);
}
.ph__cta-arrow {
  transition: transform 0.3s;
}
.ph__cta:hover .ph__cta-arrow {
  transform: translateX(4px);
}

/* ============ variant: landscape（山河图志）============ */
.ph--landscape {
  padding-bottom: 96px;
}
.ph-horizon {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 96px;
  pointer-events: none;
  z-index: 1;
}
.ph-horizon__water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--text-primary) 5%, transparent) 60%, color-mix(in srgb, var(--text-primary) 8%, transparent));
}
.theme-inkwash .ph-horizon__water {
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.04) 60%, rgba(0, 0, 0, 0.07));
}
.ph-horizon__peak {
  position: absolute;
  bottom: 36px;
  width: 0;
  height: 0;
  border-left: 90px solid transparent;
  border-right: 90px solid transparent;
  border-bottom: 60px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
}
.theme-inkwash .ph-horizon__peak {
  border-bottom-color: rgba(0, 0, 0, 0.07);
}
.ph-horizon__peak.p1 { left: 12%; border-bottom-color: color-mix(in srgb, var(--text-primary) 0.1%, transparent); }
.ph-horizon__peak.p2 { left: 42%; border-bottom-width: 78px; border-bottom-color: color-mix(in srgb, var(--text-primary) 7%, transparent); }
.ph-horizon__peak.p3 { left: 68%; }

/* ============ variant: roster（齐鲁名士）============ */
.ph--roster .ph__inner {
  max-width: 640px;
}
.ph-roster {
  position: absolute;
  right: 64px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
}
.ph-roster__seal {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(158, 43, 37, 0.1);
  border: 1.5px solid rgba(158, 43, 37, 0.45);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  border-radius: 3px;
}
.theme-inkwash .ph-roster__seal {
  background: color-mix(in srgb, var(--accent) 0.1%, transparent);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  color: var(--accent);
}

/* ============ variant: river（文脉长河）============ */
.ph-river {
  position: relative;
  margin-top: 44px;
  height: 28px;
  width: 100%;
  max-width: 920px;
}
.ph-river__line {
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
.ph-river__dot {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  transform: translate(-50%, -50%);
  opacity: 0.7;
}
.ph-river__dot:nth-child(2) { left: 5%; }
.ph-river__dot:nth-child(3) { left: 17%; }
.ph-river__dot:nth-child(4) { left: 29%; }
.ph-river__dot:nth-child(5) { left: 41%; }
.ph-river__dot:nth-child(6) { left: 53%; }
.ph-river__dot:nth-child(7) { left: 65%; }
.ph-river__dot:nth-child(8) { left: 77%; }
.ph-river__dot:nth-child(9) { left: 89%; }
.ph-river__dot:nth-child(10) { left: 95%; }

@media (max-width: 768px) {
  .ph { padding: 64px 20px 56px; }
  .ph__title { letter-spacing: 4px; }
  .ph__kuan { display: none; }
  .ph-roster { right: 20px; gap: 10px; }
  .ph-roster__seal { width: 42px; height: 42px; font-size: 20px; }
  .ph-horizon__peak { border-left-width: 60px; border-right-width: 60px; border-bottom-width: 44px; }
  .ph-horizon__peak.p2 { border-bottom-width: 56px; }
}
@media (prefers-reduced-motion: reduce) {
  .ph-horizon,
  .ph-river,
  .ph-roster { opacity: 0.9; }
}
</style>
