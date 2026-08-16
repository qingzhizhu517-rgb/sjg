<template>
  <div class="culture-view">
    <!-- 页头 -->
    <header class="cv-hero">
      <span class="cv-hero__tag">数字人文 · 文化长廊</span>
      <h1 class="cv-hero__title">五脉流芳 · 齐鲁大观</h1>
      <p class="cv-hero__desc">
        节令风物、诗词歌赋、百工之艺、闾巷传说、食味梨园——沿黄九城的文化全景，在此徐徐展开。
      </p>
    </header>

    <!-- 五大板块入口(复用首页聚合组件, 计数来自 /cultural/categories) -->
    <CulturalGallery />

    <!-- 沿黄九城文化册页入口 -->
    <section class="cv-cities">
      <SectionHeading
        eyebrow="沿黄文化"
        title="九城文脉 · 一城一册"
        subtitle="黄河自菏泽入境、至东营归海，点击城市进入五格文化册页"
      />
      <div class="cv-cities__grid">
        <router-link
          v-for="(c, i) in NINE_CITIES"
          :key="c"
          :to="`/cities/${c}`"
          class="cv-city"
          :style="{ animationDelay: `${i * 0.05}s` }"
          data-reveal
        >
          <span class="cv-city__seal">{{ c[0] }}</span>
          <span class="cv-city__name">{{ c }}</span>
          <span class="cv-city__idx">{{ String(i + 1).padStart(2, '0') }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReveal } from '../composables/useReveal'
import CulturalGallery from '../components/homepage/CulturalGallery.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'

const { reveal } = useReveal()

// 黄河上游→下游九城(与全局一致)
const NINE_CITIES = ['菏泽', '济宁', '泰安', '聊城', '济南', '德州', '淄博', '滨州', '东营']

const rootRef = ref(null)

onMounted(() => {
  if (rootRef.value) reveal(rootRef.value)
})
</script>

<style scoped>
.culture-view {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 40px 120px;
}

/* 页头: 日式留白 + 衬线大标题 */
.cv-hero {
  text-align: center;
  padding: 64px 20px 24px;
}
.cv-hero__tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  background: var(--accent);
  padding: 5px 14px;
  border-radius: 2px;
  margin-bottom: 18px;
}
.cv-hero__title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 500;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0 0 14px;
}
.cv-hero__desc {
  max-width: 620px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 2;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

/* 九城入口: 3×3 细线卡, 印章 + 序号 */
.cv-cities {
  margin-top: 88px;
}
.cv-cities__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 28px;
}
.cv-city {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  background: var(--card-bg);
  border: 1px solid var(--line, var(--border));
  border-radius: 2px;
  text-decoration: none;
  transition: all 0.25s ease;
}
.cv-city:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.cv-city__seal {
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
  flex-shrink: 0;
}
.cv-city__name {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text-primary);
}
.cv-city__idx {
  margin-left: auto;
  font-family: Georgia, serif;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .culture-view { padding: 24px 16px 88px; }
  .cv-cities__grid { grid-template-columns: 1fr; }
}
</style>