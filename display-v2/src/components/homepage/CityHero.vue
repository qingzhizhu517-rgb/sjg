<template>
  <section ref="heroRef" class="city-hero">
    <!-- 背景媒体层：视频（real 有素材）或图片（插画/实景图） -->
    <div ref="bgRef" class="city-hero__bg" aria-hidden="true">
      <video
        v-if="media?.type === 'video' && !reduce"
        class="city-hero__bg-media"
        :src="media.url"
        :poster="media.poster"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      />
      <div
        v-else
        class="city-hero__bg-media city-hero__bg-media--img"
        :style="{ backgroundImage: `url(${media?.url || illustration})` }"
      ></div>
    </div>
    <div class="city-hero__veil"></div>

    <div class="city-hero__back">
      <router-link to="/map" class="city-hero__back-link">
        <span class="arrow">←</span>
        <span class="txt">返回山河图志</span>
      </router-link>
    </div>

    <div class="city-hero__content">
      <div class="city-hero__eyebrow">
        <span class="eyebrow-chip">{{ reach }}</span>
        <span class="eyebrow-en">{{ reachEn }}</span>
      </div>

      <h1 class="city-hero__title">
        <span class="title-main">{{ city }}</span>
        <span class="title-shadow" aria-hidden="true">{{ city }}</span>
      </h1>

      <p class="city-hero__subtitle">{{ subtitle }}</p>

      <blockquote class="city-hero__quote">
        <span class="quote-mark">“</span>
        <p class="quote-text">{{ quote }}</p>
        <footer class="quote-by">{{ quoteBy }}</footer>
      </blockquote>

      <div class="city-hero__stats">
        <div v-for="(s, i) in stats" :key="i" class="stat-chip">
          <span class="stat-chip__num">{{ s.value }}</span>
          <span class="stat-chip__label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <div class="city-hero__scroll">
      <span class="scroll-line"></span>
      <span class="scroll-txt">向下探寻</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useTheme } from '../../composables/useTheme'

const props = defineProps({
  city: { type: String, required: true },
  illustration: { type: String, required: true },
  reach: { type: String, default: '黄河流域' },
  reachEn: { type: String, default: 'YELLOW RIVER' },
  subtitle: { type: String, default: '' },
  quote: { type: String, default: '' },
  quoteBy: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  media: { type: Object, default: null } // resolveCityHeroMedia 返回值；null 时回退 illustration
})

const heroRef = ref(null)
const { isReal } = useTheme()
const bgRef = ref(null)
const reduce = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const hasQuote = computed(() => !!props.quote)

onMounted(() => {
  const el = heroRef.value
  if (!el) return
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  // inkwash 插画：卷轴横向展开（从左到右揭示）；reduced-motion 跳过
  if (!isReal.value && !reduce.value && bgRef.value) {
    tl.fromTo(
      bgRef.value,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power2.inOut' },
      0,
    )
  }
  tl.fromTo(el.querySelector('.city-hero__veil'), { opacity: 1 }, { opacity: 0.55, duration: 1.2 }, 0)
    .fromTo(el.querySelector('.city-hero__back'), { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.2)
    .fromTo(el.querySelector('.eyebrow-chip'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, 0.4)
    .fromTo(el.querySelector('.title-main'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.45)
    .fromTo(el.querySelector('.city-hero__subtitle'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.7)
    .fromTo(el.querySelectorAll('.stat-chip'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, 0.85)
  if (hasQuote.value) {
    tl.fromTo(el.querySelector('.city-hero__quote'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.95)
  }
})
</script>

<style scoped>
.city-hero {
  position: relative;
  width: 100%;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 120px 6vw 64px;
  box-sizing: border-box;
  overflow: hidden;
}

.city-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.city-hero__bg-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.city-hero__bg-media--img {
  background-size: cover;
  background-position: center 30%;
}

.city-hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(251, 248, 243, 0.28) 0%,
    rgba(251, 248, 243, 0.05) 28%,
    rgba(31, 26, 22, 0.22) 58%,
    rgba(31, 26, 22, 0.62) 100%
  );
  pointer-events: none;
  opacity: 0.55;
}

.city-hero__back {
  position: absolute;
  top: calc(var(--nav-height, 64px) + 24px);
  left: 6vw;
  z-index: 2;
}

.city-hero__back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.92);
  text-decoration: none;
  letter-spacing: 1px;
  padding: 8px 14px 8px 10px;
  background: rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 40px;
  transition: all 0.3s ease;
}

.city-hero__back-link:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateX(-2px);
}

.city-hero__back-link .arrow {
  font-size: 14px;
  opacity: 0.8;
}

.city-hero__content {
  position: relative;
  z-index: 1;
  max-width: 720px;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
}

.city-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.eyebrow-chip {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #fff;
  background: var(--accent, #9e2b25);
  padding: 6px 12px;
  border-radius: 2px;
}

.eyebrow-en {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 11px;
  letter-spacing: 3px;
  opacity: 0.85;
  color: #fff;
}

.city-hero__title {
  position: relative;
  margin: 0 0 12px;
  line-height: 1.05;
}

.title-main {
  position: relative;
  z-index: 1;
  display: block;
  font-family: var(--font-display);
  font-size: clamp(64px, 11vw, 132px);
  font-weight: 900;
  letter-spacing: 18px;
  color: #fff;
}

.title-shadow {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 0;
  display: block;
  font-family: var(--font-display);
  font-size: clamp(64px, 11vw, 132px);
  font-weight: 900;
  letter-spacing: 18px;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.22);
  pointer-events: none;
}

.city-hero__subtitle {
  font-family: var(--font-heading);
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 400;
  letter-spacing: 4px;
  margin: 0 0 24px;
  opacity: 0.95;
  color: #fff;
}

.city-hero__quote {
  margin: 0 0 28px;
  padding: 0;
  border: none;
  position: relative;
}

.quote-mark {
  position: absolute;
  left: -8px;
  top: -22px;
  font-family: var(--font-display);
  font-size: 56px;
  line-height: 1;
  color: var(--accent, #9e2b25);
  opacity: 0.85;
}

.quote-text {
  font-family: var(--font-heading);
  font-size: clamp(18px, 2.4vw, 26px);
  font-weight: 500;
  letter-spacing: 2px;
  line-height: 1.7;
  margin: 0 0 10px 28px;
  color: #fff;
}

.quote-by {
  font-size: 13px;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-left: 28px;
  color: rgba(255, 255, 255, 0.85);
}

.city-hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 92px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  text-align: center;
  transition: transform 0.3s ease, background 0.3s ease;
}

.stat-chip:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.stat-chip__num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}

.stat-chip__label {
  font-size: 11px;
  letter-spacing: 1px;
  opacity: 0.85;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.9);
}

.city-hero__scroll {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.scroll-line {
  width: 1px;
  height: 36px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), transparent);
  animation: scrollPulse 1.8s ease-in-out infinite;
}

.scroll-txt {
  font-size: 11px;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.4; transform: scaleY(0.7); transform-origin: top; }
  50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
}

@media (max-width: 768px) {
  .city-hero {
    padding: 100px 24px 56px;
    min-height: 100svh;
  }

  .city-hero__bg-media--img {
    background-position: 62% center;
  }

  .title-main,
  .title-shadow {
    letter-spacing: 8px;
  }

  .city-hero__subtitle {
    letter-spacing: 2px;
  }

  .quote-text {
    margin-left: 18px;
  }

  .quote-mark {
    left: -6px;
    top: -16px;
    font-size: 38px;
  }

  .city-hero__stats {
    gap: 8px;
  }

  .stat-chip {
    min-width: 78px;
    padding: 10px 12px;
  }

  .stat-chip__num {
    font-size: 18px;
  }
}
</style>
