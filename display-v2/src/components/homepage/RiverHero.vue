<template>
  <section ref="root" class="rh">
    <div class="rh__inner">
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

        <ul v-if="stats && stats.length" ref="statsRef" class="rh__stats">
          <li v-for="(stat, index) in stats" :key="index" class="rh__stat">
            <span class="rh__stat-num">
              {{ stat.value }}<i class="rh__stat-suffix">{{ stat.suffix || '' }}</i>
            </span>
            <span class="rh__stat-label">{{ stat.label }}</span>
          </li>
        </ul>

        <button v-if="ctaLabel" ref="ctaRef" type="button" class="rh__cta" @click="emit('cta')">
          <span>{{ ctaLabel }}</span>
          <span class="rh__cta-arrow" aria-hidden="true">↓</span>
        </button>

        <p class="rh__note">
          <span class="rh__note-mark" aria-hidden="true">印</span>
          <span>沿黄九城 · 四时入卷</span>
        </p>
      </div>

      <SolarTermGallery class="rh__gallery" />
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import SolarTermGallery from './SolarTermGallery.vue'

defineProps({
  eyebrow: { type: String, default: '山东 · 黄河入海' },
  sealChar: { type: String, default: '河' },
  titleLine1: { type: String, default: '山东揽胜' },
  titleLine2: { type: String, default: '黄河入海' },
  subtitle: {
    type: String,
    default: '黄河自菏泽入境，经九城，至东营归海。沿途文脉绵延，名士辈出，名篇千载流芳。',
  },
  stats: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: '沿河而下' },
})

const emit = defineEmits(['cta'])

const root = ref(null)
const headRef = ref(null)
const titleRef = ref(null)
const subRef = ref(null)
const statsRef = ref(null)
const ctaRef = ref(null)
let timeline = null
const motionQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const handleReducedMotionChange = (event) => {
  if (event.matches && timeline) {
    timeline.progress(1).kill()
    timeline = null
  }
}

onMounted(() => {
  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleReducedMotionChange)
    } else {
      motionQuery.addListener(handleReducedMotionChange)
    }
  }

  if (reduceMotion() || !root.value) return

  timeline = gsap.timeline({ delay: 0.12 })
  if (headRef.value) {
    timeline.from(headRef.value.children, {
      opacity: 0,
      y: 12,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power2.out',
    })
  }
  if (titleRef.value) {
    timeline.from(
      titleRef.value.querySelectorAll('.rh__title-line'),
      { opacity: 0, y: 22, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
      '-=0.25',
    )
  }
  if (subRef.value) {
    timeline.from(subRef.value, { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out' }, '-=0.32')
  }
  if (statsRef.value) {
    timeline.from(statsRef.value.children, { opacity: 0, y: 10, duration: 0.35, stagger: 0.05 }, '-=0.24')
  }
  if (ctaRef.value) {
    timeline.from(ctaRef.value, { opacity: 0, y: 8, duration: 0.35 }, '-=0.18')
  }
})

onBeforeUnmount(() => {
  timeline?.kill()
  timeline = null
  if (motionQuery) {
    if (typeof motionQuery.removeEventListener === 'function') {
      motionQuery.removeEventListener('change', handleReducedMotionChange)
    } else {
      motionQuery.removeListener(handleReducedMotionChange)
    }
  }
})
</script>

<style scoped>
.rh {
  min-height: 720px;
  padding: var(--sp-8) var(--sp-5);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.rh__inner {
  width: min(100%, var(--container-max));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(300px, 1fr);
  grid-template-areas: 'gallery content';
  gap: var(--sp-8);
  align-items: center;
}

.rh__gallery {
  grid-area: gallery;
  min-width: 0;
}

.rh__content {
  grid-area: content;
  min-width: 0;
  max-width: 36em;
  padding: var(--sp-4) 0;
}

.rh__head {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}

.rh__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  color: var(--text-on-accent);
  background: var(--accent);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  transform: rotate(-3deg);
}

.rh__eyebrow {
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 4px;
}

.rh__title {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  margin: 0 0 var(--sp-5);
}

.rh__title-line {
  display: block;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(42px, 5.5vw, 76px);
  font-weight: 600;
  letter-spacing: 5px;
  line-height: var(--lh-tight);
}

.rh__subtitle {
  max-width: var(--measure);
  margin: 0 0 var(--sp-6);
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-loose);
}

.rh__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-4);
  max-width: 30em;
  padding: var(--sp-4) 0;
  margin: 0 0 var(--sp-6);
  list-style: none;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.rh__stat {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.rh__stat-num {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  line-height: 1;
}

.rh__stat-suffix {
  margin-left: 2px;
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  font-style: normal;
}

.rh__stat-label {
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 2px;
}

.rh__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  min-height: 44px;
  padding: var(--sp-3) var(--sp-5);
  color: var(--text-on-accent);
  background: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rh__cta:hover {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
  transform: translateY(-2px);
}

.rh__cta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.rh__cta-arrow {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rh__cta:hover .rh__cta-arrow {
  transform: translateY(3px);
}

.rh__note {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-7);
  color: var(--text-muted);
  font-size: var(--fs-caption);
  letter-spacing: 2px;
}

.rh__note-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  transform: rotate(-3deg);
}

/* 短屏桌面：让画廊缩略条和控制行留在首屏可操作范围内。 */
@media (min-width: 981px) and (max-height: 800px) {
  .rh {
    min-height: 0;
    padding: var(--sp-4) var(--sp-5);
  }

  .rh__inner {
    grid-template-columns: minmax(0, 1.8fr) minmax(300px, 1fr);
  }
}

@media (max-width: 980px) {
  .rh {
    min-height: 0;
    padding: var(--sp-6) var(--sp-4);
  }

  .rh__inner {
    grid-template-columns: 1fr;
    grid-template-areas:
      'content'
      'gallery';
    gap: var(--sp-6);
  }

  .rh__content {
    max-width: 44em;
    padding: 0;
  }
}

@media (max-width: 640px) {
  .rh__title-line {
    font-size: clamp(38px, 12vw, 58px);
    letter-spacing: 3px;
  }

  .rh__stats {
    gap: var(--sp-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rh__cta,
  .rh__cta-arrow {
    transition: none;
  }
}
</style>
