<template>
  <section ref="root" class="ink-hero" :style="{ minHeight }">
    <!-- 背景层：墨渐变 + 山脉剪影 + 金粉 -->
    <div class="ink-hero__bg" aria-hidden="true">
      <svg class="ink-hero__range" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path
          d="M0,200 L0,150 L170,80 L320,125 L470,55 L620,135 L780,45 L940,115 L1120,65 L1280,120 L1440,85 L1440,200 Z"
        />
      </svg>
      <span
        v-for="(p, i) in particles"
        :key="i"
        class="ink-hero__particle"
        :style="{
          left: p.left + '%',
          top: p.top + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          animationDelay: p.delay + 's',
          animationDuration: p.dur + 's',
        }"
      ></span>
    </div>

    <!-- 左轴金线 -->
    <span class="ink-hero__rail" aria-hidden="true"></span>

    <!-- 内容 -->
    <div ref="content" class="ink-hero__inner">
      <span v-if="eyebrow" class="ink-hero__eyebrow">{{ eyebrow }}</span>
      <h1 ref="titleEl" class="ink-hero__title">{{ title }}</h1>
      <p v-if="subtitle" ref="subtitleEl" class="ink-hero__subtitle">{{ subtitle }}</p>
      <StatTicker
        v-if="stats && stats.length"
        class="ink-hero__stats"
        :stats="stats"
        tone="dark"
      />
      <button v-if="ctaLabel" ref="ctaEl" class="ink-hero__cta" @click="$emit('cta')">
        <span>{{ ctaLabel }}</span>
        <span class="ink-hero__cta-arrow">→</span>
      </button>
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
const isDesktop = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(min-width: 768px)').matches

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: '' },
  minHeight: { type: String, default: '58vh' },
})
defineEmits(['cta'])

const root = ref(null)
const titleEl = ref(null)
const subtitleEl = ref(null)
const ctaEl = ref(null)
let tl = null

// 金粉粒子（仅桌面 + 非 reduced-motion）
const particleCount = isDesktop() && !prefersReduce() ? 16 : 0
const particles = Array.from({ length: particleCount }, (_, i) => ({
  left: (i * 7.3 + 4) % 100,
  top: (i * 13.7 + 8) % 88,
  delay: ((i * 0.7) % 6).toFixed(2),
  dur: (6 + (i % 5) * 2.2).toFixed(2),
  size: 2 + (i % 3),
}))

onMounted(() => {
  if (prefersReduce() || !root.value) return
  tl = gsap.timeline({ delay: 0.18 })
  if (titleEl.value)
    tl.from(titleEl.value, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' })
  if (subtitleEl.value)
    tl.from(
      subtitleEl.value,
      { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4',
    )
  const tickerEl = root.value.querySelector('.ink-hero__stats')
  if (tickerEl)
    tl.from(
      tickerEl,
      { y: 14, opacity: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.3',
    )
  if (ctaEl.value)
    tl.from(
      ctaEl.value,
      { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.25',
    )
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
  tl = null
})
</script>

<style scoped>
.ink-hero {
  position: relative;
  display: flex;
  align-items: center;
  padding: 88px 48px 72px;
  overflow: hidden;
  background: linear-gradient(135deg, #1c1a17 0%, #2a2620 55%, #15130f 100%);
  color: #f2ebd9;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
}

.ink-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.ink-hero__bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
      120% 80% at 16% 28%,
      rgba(212, 175, 55, 0.1),
      transparent 55%
    ),
    radial-gradient(100% 70% at 86% 92%, rgba(158, 43, 37, 0.12), transparent 60%);
}
.ink-hero__range {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  width: 100%;
  height: 40%;
  fill: rgba(18, 16, 12, 0.92);
}
.ink-hero__particle {
  position: absolute;
  border-radius: 50%;
  background: #d4af37;
  opacity: 0;
  box-shadow: 0 0 6px rgba(212, 175, 55, 0.55);
  animation-name: ink-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes ink-float {
  0% { opacity: 0; transform: translateY(12px); }
  25% { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(-52px); }
}

.ink-hero__rail {
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  background: linear-gradient(180deg, transparent, #d4af37 28%, #9e2b25 72%, transparent);
  z-index: 1;
}

.ink-hero__inner {
  position: relative;
  z-index: 2;
  max-width: 880px;
  text-align: left;
}
.ink-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #f0d9a0;
  border: 1px solid rgba(212, 175, 55, 0.5);
  background: rgba(158, 43, 37, 0.2);
  padding: 5px 14px;
  border-radius: 2px;
  margin-bottom: 22px;
}
.ink-hero__title {
  font-family: var(--font-display);
  font-size: clamp(40px, 7vw, 80px);
  font-weight: 900;
  letter-spacing: 6px;
  line-height: 1.05;
  margin: 0 0 18px 0;
  color: #f2ebd9;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
}
.ink-hero__subtitle {
  font-size: 15px;
  line-height: 1.9;
  letter-spacing: 1px;
  color: rgba(242, 235, 217, 0.72);
  max-width: 560px;
  margin: 0 0 28px 0;
}
.ink-hero__stats {
  margin-bottom: 8px;
}
.ink-hero__cta {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background: #9e2b25;
  color: #fff;
  border: 1px solid #c23a2b;
  border-radius: 2px;
  font-family: var(--font-heading);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.ink-hero__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(158, 43, 37, 0.4);
  background: #b23a2e;
}
.ink-hero__cta:active {
  transform: translateY(0);
}
.ink-hero__cta-arrow {
  transition: transform 0.3s;
}
.ink-hero__cta:hover .ink-hero__cta-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .ink-hero {
    padding: 72px 20px 56px;
  }
  .ink-hero__title {
    letter-spacing: 3px;
  }
  .ink-hero__subtitle {
    font-size: 14px;
  }
  .ink-hero__rail {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ink-hero__particle {
    animation: none;
    opacity: 0.25;
  }
}
</style>
