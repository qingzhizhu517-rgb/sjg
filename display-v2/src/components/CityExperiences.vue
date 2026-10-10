<template>
  <section class="city-experiences" aria-labelledby="city-experiences-heading">
    <header class="city-experiences__heading">
      <span aria-hidden="true">游</span>
      <div><p>一城风物 · 循意而行</p><h2 id="city-experiences-heading">特色体验</h2></div>
    </header>
    <div class="city-experiences__layout">
      <a :href="experiences.primary.href" class="experience-main" :aria-label="`${experiences.primary.title}，${experiences.primary.action}`">
        <figure class="experience-main__art">
          <img :src="experiences.primary.image" :alt="experiences.primary.imageAlt" loading="lazy" decoding="async" />
          <figcaption v-if="experiences.imageCredit">{{ experiences.imageCredit }}</figcaption>
        </figure>
        <div class="experience-main__copy">
          <span class="experience-main__eyebrow">本城推荐</span>
          <h3>{{ experiences.primary.title }}</h3>
          <p>{{ experiences.primary.text }}</p>
          <small v-if="pending">{{ preview ? '本城景点预览样本待补充' : '景点资料待审核发布' }}</small>
          <span class="experience-main__action">{{ experiences.primary.action }} <span aria-hidden="true">↑</span></span>
        </div>
      </a>
      <div class="experience-paths">
        <router-link v-for="item in experiences.secondary" :key="item.to" :to="experienceLink(item)" class="experience-path" :aria-label="`${region} · ${item.title}`">
          <span class="experience-path__art" aria-hidden="true">
            <img v-if="item.image" :src="item.image" alt="" loading="lazy" decoding="async" />
            <AtlasGlyph v-else :kind="item.glyph" />
          </span>
          <div class="experience-path__copy"><h3>{{ item.title }}</h3><span>{{ item.text }}</span><b aria-hidden="true">↗</b></div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { cityExperiences } from '../config/cityExperiences'
import { atlasLink } from '../config/atlasPreview'
import AtlasGlyph from './AtlasGlyph.vue'

const props = defineProps({
  region: { type: String, required: true },
  cityImage: { type: String, required: true },
  pending: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
})
const route = useRoute()
const experiences = computed(() => cityExperiences(props.region, props.cityImage))
const experienceLink = (item) => atlasLink(item.to, route)
</script>

<style scoped>
.city-experiences { margin-top: 28px; color: var(--atlas-ink); }
.city-experiences__heading { display: flex; align-items: center; gap: 13px; margin-bottom: 20px; }
.city-experiences__heading > span { display: grid; place-items: center; width: 34px; height: 40px; color: var(--accent); font-family: 'STKaiti', 'KaiTi', serif; font-size: 25px; border: 1px solid var(--atlas-rule); transform: rotate(-5deg); }
.city-experiences__heading p { margin: 0 0 4px; font-size: 10px; letter-spacing: 3px; color: var(--atlas-muted); }
.city-experiences__heading h2 { margin: 0; font-size: 23px; font-weight: 600; letter-spacing: 3px; }
.city-experiences__layout { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(230px, 1fr); gap: 28px; align-items: stretch; }
.experience-main { display: flex; flex-direction: column; color: inherit; text-decoration: none; min-width: 0; background: linear-gradient(140deg, rgba(224, 213, 193, .3), rgba(239, 231, 216, .14)); }
.experience-main__art { position: relative; margin: 0; aspect-ratio: 16 / 10; overflow: hidden; }
.experience-main__art img { display: block; width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; transition: transform .35s ease; }
.experience-main__art figcaption { position: absolute; bottom: 9px; right: 12px; padding: 3px 6px; background: rgba(245, 242, 235, .85); color: var(--atlas-body); font-size: 10px; letter-spacing: .5px; }
.experience-main__copy { padding: 20px 22px 21px; }
.experience-main__eyebrow { color: var(--atlas-gold); font-size: 10px; letter-spacing: 3px; }
.experience-main h3 { margin: 8px 0 7px; font-size: 27px; font-weight: 500; letter-spacing: 3px; }
.experience-main p { margin: 0; color: var(--atlas-body); font-size: 13px; line-height: 1.9; }
.experience-main small { display: block; color: var(--atlas-muted); margin-top: 8px; font-size: 11px; }
.experience-main__action { display: flex; align-items: center; justify-content: space-between; margin-top: 15px; color: var(--reading-green); font-size: 12px; letter-spacing: 1px; }
.experience-main__action > span { font-size: 19px; }
.experience-paths { display: grid; grid-template-rows: repeat(3, minmax(0, 1fr)); }
.experience-path { display: grid; grid-template-columns: 90px minmax(0, 1fr); align-items: center; gap: 15px; min-width: 0; padding: 8px 0; color: inherit; text-decoration: none; }
.experience-path + .experience-path { border-top: 1px solid var(--atlas-rule); }
.experience-path__art { display: flex; align-items: center; justify-content: center; height: 100px; color: var(--atlas-gold); }
.experience-path__art img { width: 100%; height: 100%; object-fit: contain; transition: transform .35s ease; }
.experience-path__art svg { width: 65px; height: 65px; opacity: .75; transition: transform .35s ease; }
.experience-path__copy h3 { margin: 0 0 8px; font-size: 17px; font-weight: 500; letter-spacing: 2px; }
.experience-path__copy > span { display: block; color: var(--atlas-body); font-size: 12px; line-height: 1.8; }
.experience-path__copy b { display: block; margin-top: 7px; font-size: 17px; font-weight: 400; color: var(--reading-green); transition: transform .25s ease; }
.experience-main:hover img { transform: scale(1.025); }
.experience-path:hover img, .experience-path:hover svg { transform: translateY(-3px); }
.experience-path:hover b { transform: translate(2px, -2px); }
.experience-main:focus-visible, .experience-path:focus-visible { outline: 2px solid var(--reading-green); outline-offset: 5px; }
@media (max-width: 1190px) { .city-experiences__layout { grid-template-columns: minmax(0, 1.4fr) minmax(210px, 1fr); gap: 20px; } .experience-path { grid-template-columns: 72px minmax(0, 1fr); gap: 12px; } .experience-main__copy { padding: 17px; } }
@media (max-width: 640px) { .city-experiences__layout { grid-template-columns: minmax(0, 1fr); gap: 15px; } .experience-path { grid-template-columns: 88px minmax(0, 1fr); gap: 18px; padding: 10px 0; } .experience-path__art { height: 90px; } .experience-path__copy h3 { font-size: 18px; } .experience-main__copy { padding: 20px; } }
@media (prefers-reduced-motion: reduce) { .experience-main__art img, .experience-path__art img, .experience-path__art svg, .experience-path__copy b { transition: none; } .experience-main:hover img, .experience-path:hover img, .experience-path:hover svg, .experience-path:hover b { transform: none; } }
</style>
