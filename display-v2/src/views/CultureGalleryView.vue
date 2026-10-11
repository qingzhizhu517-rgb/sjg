<template>
  <div ref="rootRef" class="culture-view folio-page">
    <PageHeading eyebrow="齐鲁文化 / 文化总览" title="风物有情，文脉相连" description="从节令、工艺、故事与乡音出发，走近黄河岸边的文化日常。">
      <a href="#culture-cities" class="folio-button folio-button--secondary culture-city-jump">按城市探索 ↓</a>
    </PageHeading>
    <!-- 五大板块入口(复用首页聚合组件, 计数来自 /cultural/categories) -->
    <CulturalGallery />

    <!-- 沿黄九城文化册页入口 -->
    <section id="culture-cities" class="cv-cities">
      <SectionHeading
        eyebrow="沿黄文化"
        title="九城文脉 · 一城一册"
        subtitle="黄河自菏泽入境、至东营归海，点击城市进入五格文化册页"
      />
      <div class="cv-cities__grid">
        <router-link
          v-for="(c, i) in NINE_CITIES"
          :key="c"
          :to="atlasLink(`/cities/${c}`, route)"
          class="cv-city"
          data-reveal
        >
          <span class="cv-city__seal">{{ c[0] }}</span>
          <span class="cv-city__name">{{ c }}</span>
          <span class="cv-city__idx">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="cv-city__arrow" aria-hidden="true">→</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeading from '../components/ui/PageHeading.vue'
import { atlasLink } from '../config/atlasPreview'
const route = useRoute()
import { useReveal } from '../composables/useReveal'
import CulturalGallery from '../components/homepage/CulturalGallery.vue'
import SectionHeading from '../components/homepage/SectionHeading.vue'
import { NINE_CITIES } from '../config/nineCities'

const { reveal } = useReveal()

const rootRef = ref(null)

onMounted(() => {
  if (rootRef.value) reveal(rootRef.value)
})
</script>

<style scoped>
.culture-city-jump { margin-top: var(--sp-4); }

.cv-cities {
  margin-top: var(--section-gap);
  /* html 已预留固定导航的滚动偏移，这里只补阅读间距。 */
  scroll-margin-top: var(--sp-2);
}
.cv-cities__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-4) var(--card-gap);
  margin-top: var(--sp-5);
}
.cv-city {
  min-width: 0;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto 20px;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: border-color .2s ease, background-color .2s ease;
}
.cv-city:hover,
.cv-city:focus-visible {
  border-color: var(--accent);
  background: var(--bg-primary);
}
.cv-city__seal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  color: var(--reading-green);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  border-radius: 2px;
}
.cv-city__name {
  font-family: var(--font-heading);
  font-size: var(--fs-card-title);
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-primary);
  white-space: nowrap;
}
.cv-city__idx {
  font-size: var(--fs-meta);
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}
.cv-city__arrow {
  color: var(--reading-green);
  text-align: right;
}

@media (max-width: 1279px) {
  .cv-cities__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .cv-city { gap: var(--sp-2); padding: var(--sp-4); }
  .cv-city__name { font-size: var(--fs-lead); letter-spacing: 0; }
}
@media (max-width: 479px) {
  .cv-cities__grid { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .cv-city { transition: none; }
}
</style>
