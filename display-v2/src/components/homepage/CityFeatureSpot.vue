<template>
  <article ref="featureRef" class="city-feature" :class="{ 'is-reversed': reversed }">
    <div class="feature__media">
      <div class="feature__image-wrap">
        <img :src="image" :alt="name" class="feature__image" />
        <div class="feature__image-veil"></div>
      </div>
      <span class="feature__num">{{ padNum(index + 1) }}</span>
    </div>

    <div class="feature__body">
      <div class="feature__meta">
        <span v-if="tag" class="feature__tag">{{ tag }}</span>
        <span v-if="address" class="feature__address">{{ address }}</span>
      </div>
      <h3 class="feature__title">{{ name }}</h3>
      <p class="feature__desc">{{ description }}</p>

      <div v-if="stats.length" class="feature__stats">
        <div v-for="(s, i) in stats" :key="i" class="feature__stat">
          <span class="feature__stat-icon" v-if="s.icon">{{ s.icon }}</span>
          <span class="feature__stat-label">{{ s.label }}</span>
          <span class="feature__stat-value">{{ s.value }}</span>
        </div>
      </div>

      <button class="feature__cta" @click="$emit('click')">
        <span>探寻详情</span>
        <span class="cta-arrow">→</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  index: { type: Number, default: 0 },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  image: { type: String, required: true },
  tag: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  reversed: { type: Boolean, default: false }
})

defineEmits(['click'])

const featureRef = ref(null)

const padNum = (n) => n < 10 ? `0${n}` : `${n}`

onMounted(() => {
  const el = featureRef.value
  if (!el) return
  const media = el.querySelector('.feature__media')
  const body = el.querySelector('.feature__body')

  gsap.fromTo(media,
    { x: props.reversed ? 60 : -60, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  )

  gsap.fromTo(body,
    { x: props.reversed ? -40 : 40, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.9,
      delay: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  )

  gsap.fromTo(el.querySelectorAll('.feature__stat'),
    { y: 16, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.06,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    }
  )
})
</script>

<style scoped>
.city-feature {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 64px;
  align-items: center;
  padding: 56px 0;
}

.city-feature.is-reversed {
  grid-template-columns: 0.95fr 1.05fr;
}

.city-feature.is-reversed .feature__media {
  order: 2;
}

.city-feature.is-reversed .feature__body {
  order: 1;
}

.feature__media {
  position: relative;
}

.feature__image-wrap {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  box-shadow: 0 24px 60px rgba(31, 26, 22, 0.12);
}

.feature__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.city-feature:hover .feature__image {
  transform: scale(1.05);
}

.feature__image-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.25) 0%, transparent 45%);
  pointer-events: none;
}

.feature__num {
  position: absolute;
  right: -18px;
  top: -18px;
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 900;
  color: var(--accent, #9e2b25);
  opacity: 0.14;
  line-height: 1;
  z-index: 1;
}

.city-feature.is-reversed .feature__num {
  right: auto;
  left: -18px;
}

.feature__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.feature__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature__tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #fff;
  background: var(--accent, #9e2b25);
  padding: 4px 8px;
  border-radius: 2px;
}

.feature__address {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.feature__title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.feature__desc {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 0.3px;
}

.feature__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.feature__stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 40px;
  font-size: 12px;
  color: var(--text-secondary);
}

.feature__stat-icon {
  font-size: 13px;
}

.feature__stat-label {
  color: var(--text-muted);
}

.feature__stat-value {
  font-weight: 700;
  color: var(--text-primary);
}

.feature__cta {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px 26px;
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature__cta:hover {
  background: var(--accent, #9e2b25);
  border-color: var(--accent, #9e2b25);
  color: #fff;
  padding-right: 20px;
}

.feature__cta:hover .cta-arrow {
  transform: translateX(6px);
}

.cta-arrow {
  transition: transform 0.3s ease;
}

@media (max-width: 1024px) {
  .city-feature,
  .city-feature.is-reversed {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .city-feature.is-reversed .feature__media,
  .city-feature.is-reversed .feature__body {
    order: unset;
  }

  .feature__num {
    right: 12px;
    top: 12px;
    font-size: 56px;
    opacity: 0.18;
  }

  .city-feature.is-reversed .feature__num {
    left: auto;
    right: 12px;
  }
}

@media (max-width: 768px) {
  .city-feature {
    padding: 36px 0;
  }

  .feature__title {
    letter-spacing: 3px;
  }
}
</style>
