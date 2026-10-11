<template>
  <section class="city-experiences" aria-labelledby="city-experiences-heading">
    <header class="city-experiences__heading">
      <span aria-hidden="true">游</span>
      <div><p>一城风物 · 循意而行</p><h2 id="city-experiences-heading" class="folio-section-title">特色体验</h2></div>
      <router-link :to="readingLink" class="folio-button folio-button--quiet city-experiences__reading">AI对照阅读 ↗</router-link>
    </header>
    <div class="city-experiences__layout">
      <component :is="pending ? RouterLink : 'a'" v-bind="pending ? { to: cityCultureLink } : { href: experiences.primary.href }" class="experience-main" :aria-label="`${experiences.primary.title}，${primaryAction}`">
        <figure v-if="showPrimaryImage" class="experience-main__art">
          <img :src="experiences.primary.image" :alt="experiences.primary.imageAlt" loading="lazy" decoding="async" />
          <figcaption v-if="experiences.imageCredit">{{ experiences.imageCredit }}</figcaption>
        </figure>
        <div class="experience-main__copy">
          <span class="experience-main__eyebrow">本城推荐</span>
          <h3>{{ experiences.primary.title }}</h3>
          <p>{{ experiences.primary.text }}</p>
          <small v-if="pending">{{ preview ? '当前预览未提供本城景点样本，可先阅读城市文化。' : '当前暂无已发布的景点资料，可先阅读城市文化。' }}</small>
          <span class="experience-main__action">{{ primaryAction }} <span aria-hidden="true">{{ pending ? '↗' : '↑' }}</span></span>
        </div>
      </component>
      <div class="experience-paths">
        <router-link v-for="item in experiences.secondary" :key="item.to" :to="experienceLink(item)" class="experience-path" :aria-label="`${region} · ${item.title}`">
          <span class="experience-path__art" aria-hidden="true">
            <img v-if="item.image" :src="item.image" alt="" loading="lazy" decoding="async" />
            <AtlasGlyph v-else :kind="item.glyph" />
          </span>
          <div class="experience-path__copy"><h3>{{ item.title }}</h3><span>{{ item.text }}</span></div>
          <span class="experience-path__arrow" aria-hidden="true">↗</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { cityExperiences } from '../config/cityExperiences'
import { atlasLink } from '../config/atlasPreview'
import { buildReadingLink } from '../utils/readingLink'
import AtlasGlyph from './AtlasGlyph.vue'

const props = defineProps({
  region: { type: String, required: true },
  cityImage: { type: String, required: true },
  pending: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
})
const route = useRoute()
const readingLink = computed(() => buildReadingLink({ region: props.region, returnTo: route.fullPath }, route))
const experiences = computed(() => cityExperiences(props.region, props.cityImage))
const experienceLink = (item) => atlasLink(item.to, route)
const showPrimaryImage = computed(() => experiences.value.primary.image !== props.cityImage)
const cityCultureLink = computed(() => atlasLink(`/cities/${props.region}`, route))
const primaryAction = computed(() => props.pending ? '走进城市文化' : experiences.value.primary.action)
</script>

<style scoped>
.city-experiences { margin-top: var(--sp-6); color: var(--text-primary); }
.city-experiences__heading { display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-5); }
.city-experiences__reading { margin-left: auto; }
.city-experiences__heading > span { display: grid; place-items: center; flex: 0 0 34px; height: 40px; color: var(--accent); font: 25px var(--font-display); border: 1px solid var(--border); transform: rotate(-5deg); }
.city-experiences__heading p { margin: 0 0 var(--sp-1); font-size: var(--fs-caption); letter-spacing: .12em; color: var(--text-muted); }
.city-experiences__layout { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: var(--sp-5); align-items: stretch; }
.experience-main { display: flex; flex-direction: column; min-width: 0; background: var(--accent-faint); border: 1px solid var(--border-light); color: inherit; }
.experience-main__art { position: relative; margin: 0; aspect-ratio: 16 / 10; overflow: hidden; }
.experience-main__art img { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; transition: transform .25s ease; }
.experience-main__art figcaption { position: absolute; bottom: var(--sp-3); right: var(--sp-3); padding: var(--sp-1) var(--sp-2); background: var(--glass-bg); font-size: var(--fs-caption); color: var(--text-secondary); }
.experience-main__copy { display: flex; flex-direction: column; justify-content: center; flex: 1; padding: var(--panel-padding); }
.experience-main__eyebrow { font-size: var(--fs-meta); color: var(--reading-green); letter-spacing: .1em; }
.experience-main h3 { margin: var(--sp-3) 0; font: 600 var(--fs-h3)/1.5 var(--font-display); letter-spacing: .06em; }
.experience-main p { margin: 0; font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-secondary); }
.experience-main small { display: block; margin-top: var(--sp-3); font-size: var(--fs-meta); color: var(--text-muted); line-height: 1.8; }
.experience-main__action { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); min-height: var(--control-height); padding-top: var(--sp-3); margin-top: var(--sp-5); border-top: 1px solid var(--border-light); color: var(--reading-green); font-size: var(--fs-body-sm); }
.experience-paths { display: grid; grid-template-rows: repeat(3, minmax(0, 1fr)); }
.experience-path { display: grid; grid-template-columns: 64px minmax(0, 1fr) 20px; gap: var(--sp-4); align-items: center; min-width: 0; min-height: 100px; padding: var(--sp-4) 0; color: inherit; }
.experience-path + .experience-path { border-top: 1px solid var(--border-light); }
.experience-path__art { display: grid; place-items: center; height: 72px; color: var(--ink-wash); }
.experience-path__art img, .experience-path__art svg { width: 64px; height: 64px; object-fit: contain; transition: transform .2s ease; }
.experience-path__copy { min-width: 0; }
.experience-path__copy h3 { margin: 0 0 var(--sp-2); font-size: var(--fs-card-title); font-weight: 600; line-height: 1.5; }
.experience-path__copy > span { display: block; color: var(--text-secondary); font-size: var(--fs-body-sm); line-height: 1.8; }
.experience-path__arrow { justify-self: end; color: var(--reading-green); font-size: 20px; transition: transform .2s ease; }
.experience-main:hover { border-color: var(--accent-a35); }
.experience-path:hover h3 { color: var(--accent); }
.experience-main:hover img { transform: scale(1.02); }
.experience-path:hover .experience-path__arrow { transform: translate(2px, -2px); }
.experience-main:focus-visible, .experience-path:focus-visible { outline: 2px solid var(--reading-green); outline-offset: 4px; }
@media (max-width: 767px) {
  .city-experiences__layout { grid-template-columns: 1fr; gap: var(--sp-4); }
  .city-experiences__reading { padding-left: 0; }
  .experience-path { grid-template-columns: 56px minmax(0, 1fr) 20px; }
  .experience-path__art img, .experience-path__art svg { width: 56px; height: 56px; }
}
@media (prefers-reduced-motion: reduce) { .experience-main__art img, .experience-path__art img, .experience-path__art svg, .experience-path__arrow { transition: none; transform: none; } }
</style>
