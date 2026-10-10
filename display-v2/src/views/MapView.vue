<template>
  <div class="river-atlas">
    <section class="atlas-hero" aria-labelledby="atlas-title">
      <div class="atlas-hero__copy">
        <h1 id="atlas-title" class="atlas-hero__title"><span>山东揽胜</span><span>黄河入海</span></h1>
        <p class="atlas-hero__subtitle">黄河流域 <span>·</span> 山东段 <i class="atlas-seal" aria-hidden="true">山河大地</i></p>
        <p class="atlas-hero__description">从巍巍泰山，到黄河入海。<br />沿着一条河，走进齐鲁大地的山川风物，<br />循着一首诗，遇见千年文脉的悠远回响。</p>
        <div class="atlas-hero__actions folio-actions"><router-link :to="atlasLink('/regions/泰安', route)" class="folio-button folio-button--primary">开始山河之旅 →</router-link><router-link :to="atlasLink('/poems', route)" class="folio-button folio-button--quiet">循诗而行 ↗</router-link></div>
        <div class="atlas-categories">
          <router-link v-for="category in categories" :key="category.title" :to="atlasLink(category.path, route)">
            <AtlasGlyph :kind="category.icon" /><span>{{ category.title }}<small>{{ category.en }}</small></span>
          </router-link>
        </div>
      </div>
      <div class="atlas-hero__painting">
        <div class="atlas-stage">
          <img class="river-painting" src="/media/inkwash/atlas/river-landscape-v2.webp" width="2400" height="1536" alt="青绿山峦间，金色黄河蜿蜒奔向海湾的水墨长卷" fetchpriority="high" />
          <router-link v-for="point in points" :key="point.city" :to="atlasLink(`/regions/${point.city}`, route)" :class="['atlas-map-point', `atlas-map-point--${point.side}`]" :style="{ left: `${point.x}%`, top: `${point.y}%` }" :aria-label="`探索${point.city}`"><span class="atlas-map-point__dot">{{ point.index }}</span><b>{{ point.city }}</b></router-link>
        </div>
        <span class="atlas-compass" aria-hidden="true"><b>N</b><svg viewBox="0 0 32 48"><ellipse cx="16" cy="28" rx="12" ry="17"/><path d="m16 8-6 31 6-9 6 9-6-31Z"/><path d="M16 1v44"/></svg></span>
        <router-link :to="atlasLink('/river-sandbox', route)" class="atlas-sandbox-entry"><span class="atlas-sandbox-entry__icon" aria-hidden="true">◈</span><span><strong>三维沙盘</strong><small>沿黄九市 · 立体漫游</small></span><span aria-hidden="true">→</span></router-link>
      </div>
    </section>

    <section class="atlas-sights" aria-labelledby="sights-title">
      <header class="atlas-heading"><h2 id="sights-title">九城胜迹 <img src="/media/inkwash/atlas/mountain-vignette.webp" alt="" /></h2><router-link :to="atlasLink('/river-sandbox', route)">沿河九市 <span aria-hidden="true">⊙</span></router-link></header>
      <div class="atlas-sights__grid">
        <article v-for="(sight, index) in sights" :key="sight.slug" class="atlas-sight">
          <div class="atlas-sight__heading"><span class="atlas-sight__index">{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ sight.name }}</h3><span class="atlas-sight__tag">{{ sight.city }} · {{ sight.tag }}</span></div>
          <div class="atlas-sight__image"><img :src="`/media/inkwash/sights/${sight.slug}.webp`" :alt="`${sight.city}${sight.name}水墨小景`" width="1024" height="683" :loading="index < 3 ? 'eager' : 'lazy'" decoding="async" /></div>
          <blockquote class="atlas-sight__poetry"><p>{{ sight.verse }}</p><cite>{{ sight.dynasty }} · {{ sight.poet }}《{{ sight.poem }}》</cite></blockquote>
          <p class="atlas-sight__description">{{ sight.description }}</p>
          <router-link class="atlas-pill folio-button folio-button--secondary" :to="atlasLink(`/spots/${sight.spotId}`, route)">查看详情 <span aria-hidden="true">→</span></router-link>
        </article>
      </div>
    </section>

    <section class="atlas-experiences" aria-labelledby="experience-title">
      <h2 id="experience-title"><span aria-hidden="true">❧</span> 特色体验 <img src="/media/inkwash/atlas/mountain-vignette.webp" alt="" /></h2>
      <router-link v-for="experience in experiences" :key="experience.title" :to="atlasLink(experience.path, route)" class="atlas-experience"><span class="atlas-experience__art"><AtlasGlyph :kind="experience.icon" /></span><span><strong>{{ experience.title }}</strong><small>{{ experience.description }}</small></span></router-link>
    </section>

    <section class="atlas-journeys" aria-labelledby="journey-title">
      <header class="atlas-heading"><h2 id="journey-title">一河九城 <span class="atlas-heading__english">NINE CITIES · ONE RIVER</span></h2><span class="atlas-journeys__hint">由山水入人文</span></header>
      <nav class="atlas-city-rail" aria-label="沿黄九市"><router-link v-for="(city, i) in cities" :key="city" :to="atlasLink(`/regions/${city}`, route)"><small>{{ String(i + 1).padStart(2, '0') }}</small><span>{{ city }}</span><i aria-hidden="true">↗</i></router-link></nav>
      <div class="atlas-reading-links"><router-link :to="atlasLink(isAtlasPreview(route) ? '/poets/2' : '/poets', route)"><span>循诗访人</span><strong>会当凌绝顶，一览众山小。</strong><small>走近齐鲁名士 <span aria-hidden="true">→</span></small></router-link><router-link :to="atlasLink(isAtlasPreview(route) ? '/spots/2' : '/regions/济南', route)"><span>湖山有情</span><strong>同一片山水，不同的心境。</strong><small>品读湖畔诗意 <span aria-hidden="true">→</span></small></router-link></div>
    </section>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AtlasGlyph from '../components/AtlasGlyph.vue'
import { NINE_SIGHTS } from '../config/nineSights'
import { NINE_CITIES } from '../config/nineCities'
import { atlasLink, isAtlasPreview } from '../config/atlasPreview'

const route = useRoute()
const cities = NINE_CITIES
const categories = [
  { title: '世界遗产', en: 'WORLD HERITAGE', icon: 'heritage', path: '/regions/泰安' },
  { title: '历史文化名城', en: 'HISTORIC CITIES', icon: 'temple', path: '/regions/济宁' },
  { title: '自然景观', en: 'NATURAL SCENERY', icon: 'mountain', path: '/regions/济南' },
  { title: '黄河源韵', en: 'YELLOW RIVER', icon: 'river', path: '/river-sandbox' },
]
// Art-directed links, not geographic coordinates. The geographic map is a separate view.
// Positions are % of the river-landscape-v2 stage (2400×1536), following the painted river upstream → sea.
const points = [
  { city: '菏泽', x: 47, y: 83, side: 'left' },
  { city: '济宁', x: 52, y: 71, side: 'right' },
  { city: '聊城', x: 48, y: 58, side: 'left' },
  { city: '泰安', x: 66, y: 61, side: 'right' },
  { city: '济南', x: 59, y: 50, side: 'right' },
  { city: '德州', x: 45, y: 40, side: 'left' },
  { city: '淄博', x: 65, y: 42, side: 'right' },
  { city: '滨州', x: 54, y: 28, side: 'left' },
  { city: '东营', x: 61, y: 17, side: 'right' },
].map((point) => ({ ...point, index: cities.indexOf(point.city) + 1 }))
// 九城各一处预设景点：静态数据，不请求接口；诗句均为 poem 表中的真实原句（见 config/nineSights.js）。
const sights = NINE_SIGHTS
const experiences = [
  { title: '泰山日出', description: '清晨登顶，观日出云海，揽群山入怀。', icon: 'sunrise', path: '/regions/泰安' },
  { title: '泰山石刻', description: '沿石阶品读摩崖，遇见历史与书法。', icon: 'inscription', path: '/regions/泰安' },
  { title: '齐鲁风味', description: '在一餐一食中，品味山川与人间。', icon: 'food', path: '/food-opera' },
  { title: '民俗文化', description: '走进节庆与乡土，感受绵延的日常。', icon: 'festival', path: '/festivals' },
]
</script>

<style scoped>
.river-atlas { max-width: 1480px; margin: 0 auto; padding: 0 34px 52px; }
.atlas-hero { position: relative; min-height: 640px; height: min(48vw, 690px); }
.atlas-hero__copy { position: relative; z-index: 2; width: 302px; padding: 65px 0 0 13px; pointer-events: none; }
.atlas-hero__copy a { pointer-events: auto; }
.atlas-hero h1 { margin: 0; width: 295px; font: 400 clamp(48px, 4.4vw, 62px)/1.35 var(--font-display); letter-spacing: .08em; color: #433d30; }
.atlas-hero__title span { display: block; white-space: nowrap; }
.atlas-hero__title span + span { color: #59674f; }
.atlas-hero__subtitle { display: flex; align-items: center; gap: 17px; margin-top: 27px; font-size: 22px; font-weight: 600; letter-spacing: 3px; white-space: nowrap; }
.atlas-hero__subtitle > span { font-weight: 400; }
.atlas-seal { display: inline-flex; writing-mode: vertical-rl; font-family: var(--font-display); font-size: 10px; font-style: normal; color: #fff4e7; background: #b15e50; letter-spacing: 1px; padding: 5px 2px; outline: 1px solid #bc786a; outline-offset: 2px; line-height: 1.2; margin-left: 3px; }
.atlas-hero__description { margin-top: 27px; font-size: 13px; line-height: 2.05; color: #71675a; letter-spacing: .035em; }
.atlas-categories { display: grid; grid-template-columns: 1fr 1fr; gap: 23px 18px; margin-top: 61px; width: 302px; }
.atlas-categories a { display: flex; gap: 9px; align-items: center; color: #71614d; font-size: 12px; line-height: 1.6; }
.atlas-categories a:hover { color: var(--accent); }
.atlas-categories svg { width: 31px; height: 31px; flex-shrink: 0; }
.atlas-categories small { display: block; font: 7px/1.8 Georgia, serif; letter-spacing: .04em; color: #968772; }
.atlas-hero__painting { position: absolute; left: 22%; top: 0; right: -15px; height: 100%; container-type: size; }
/* Stage keeps the painting's 25:16 ratio so city points stay pinned to the river at any viewport. */
.atlas-stage { position: absolute; inset: 0; margin: auto; width: min(100cqw, 100cqh * 1.5625); aspect-ratio: 2400 / 1536; }
.river-painting { display: block; width: 100%; height: 100%; mix-blend-mode: multiply; --fade: linear-gradient(90deg, transparent, #000 9%, #000 93%, transparent), linear-gradient(180deg, transparent, #000 8%, #000 90%, transparent); -webkit-mask-image: var(--fade); -webkit-mask-composite: source-in; mask-image: var(--fade); mask-composite: intersect; }
.atlas-compass { position: absolute; top: 16px; right: 16px; width: 30px; text-align: center; color: #74624f; }
.atlas-compass b { font: 12px/1 Georgia, serif; }
.atlas-compass svg { width: 100%; stroke: currentColor; stroke-width: 1; fill: none; }
.atlas-compass path:nth-child(2) { fill: currentColor; }
.atlas-map-point { position: absolute; z-index: 1; display: flex; align-items: center; gap: 6px; transform: translate(-11px, -50%); color: #3f3527; font-size: 14px; letter-spacing: 2px; transition: transform .2s; }
.atlas-map-point--left { flex-direction: row-reverse; transform: translate(calc(-100% + 11px), -50%); }
.atlas-map-point__dot { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #b15e50; color: #fff6ea; font: 11px/1 Georgia, serif; letter-spacing: 0; outline: 1px solid #b15e5080; outline-offset: 3px; box-shadow: 0 2px 6px #5a3a2a40; }
.atlas-map-point b { font-family: var(--font-display); font-weight: 400; padding: 2px 9px; background: #f8f4eceb; border: 1px solid #b15e5059; border-radius: 2px; box-shadow: 0 1px 4px #5a463014; }
.atlas-map-point:hover b, .atlas-map-point:focus-visible b { background: #b15e50; color: #fff6ea; border-color: #b15e50; }
.atlas-map-point:hover .atlas-map-point__dot, .atlas-map-point:focus-visible .atlas-map-point__dot { outline-offset: 5px; }
.atlas-sandbox-entry { position: absolute; right: 18px; bottom: 22px; z-index: 2; display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: #4b3f30; background: #f8f4ecee; border: 1px solid #9b8b72; box-shadow: 3px 3px 0 #b15e5026; transition: background .2s, box-shadow .2s; }
.atlas-sandbox-entry strong { display: block; font-size: 15px; font-weight: 600; letter-spacing: 3px; }
.atlas-sandbox-entry small { display: block; font-size: 11px; color: #85755f; letter-spacing: 1px; }
.atlas-sandbox-entry__icon { color: #b15e50; font-size: 22px; }
.atlas-sandbox-entry:hover { background: #fffaf2; box-shadow: 4px 4px 0 #b15e5040; }
.atlas-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; border-bottom: 1px solid #d2c8b852; padding-bottom: 13px; }
.atlas-heading h2 { position: relative; display: flex; align-items: center; gap: 14px; font-size: 24px; letter-spacing: 2px; font-weight: 600; }
.atlas-heading h2::after { content: ''; position: absolute; width: 44px; height: 2px; background: #9d7d52; bottom: -14px; left: 0; }
.atlas-heading h2 > img { width: 64px; height: 30px; object-fit: cover; opacity: .38; mix-blend-mode: multiply; }
.atlas-heading > a { color: #8a7a65; font-size: 11px; padding: 4px 0; }
.atlas-heading > a > span { padding-left: 4px; }
.atlas-sights__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 18px; }
.atlas-sight { position: relative; min-width: 0; display: flex; flex-direction: column; padding: 17px 13px 18px; border: 1px solid #ded6c766; background: #fbf9f438; box-shadow: 3px 3px 0 #76644304; }
.atlas-sight::before { content: ''; position: absolute; inset: 3px; border: 1px solid #e5ded442; pointer-events: none; }
.atlas-sight__heading { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; min-height: 30px; }
.atlas-sight__index { font: italic 19px/1.2 Georgia, serif; color: #9b907e; margin-right: 3px; }
.atlas-sight h3 { font-size: 19px; font-weight: 600; white-space: nowrap; }
.atlas-sight__tag { margin-left: auto; font-size: 10px; color: #9c8061; background: #e8dcc74a; padding: 1px 4px; border-radius: 2px; white-space: nowrap; }
.atlas-sight__image { display: block; margin: 11px -7px 7px; }
.atlas-sight__image { aspect-ratio: 3 / 2; overflow: hidden; }
.atlas-sight__image :deep(img) { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .45s; }
.atlas-sight__image:hover :deep(img) { transform: translateY(-3px); }
.atlas-sight__poetry { margin: 6px 0 0; min-height: 52px; color: #6f604b; font-family: var(--font-display); font-size: 15px; letter-spacing: 1.5px; line-height: 1.8; }
.atlas-sight__poetry p { margin: 0; }
.atlas-sight__poetry cite { display: block; margin-top: 4px; font: normal 11px/1.6 var(--font-body, inherit); letter-spacing: 1px; color: #9a8a72; }
.atlas-sight__description { margin-top: 8px; font-size: 12px; line-height: 1.9; color: #776b5d; padding-bottom: 22px; }
.atlas-pill { position: relative; align-self: start; display: inline-flex; align-items: center; gap: 9px; margin-top: auto; padding: 2px 10px; border: 1px solid #9b8b72; border-radius: 20px; color: #7d6a50; font-size: 10px; line-height: 1.6; }
.atlas-pill:hover { background: #ede5d7; }
.atlas-index-note { font-size: 11px; color: var(--text-muted); margin-top: 10px; }
.atlas-index-note button { color: var(--accent); background: none; border: 0; padding: 4px 8px; cursor: pointer; }
.atlas-experiences { display: grid; grid-template-columns: 1.12fr repeat(4, 1fr); gap: 30px; align-items: center; padding: 26px 28px; margin-top: 25px; border: 1px solid #ded6c76b; background: #e9e2d426; }
.atlas-experiences h2 { position: relative; display: flex; align-items: center; gap: 8px; font-size: 23px; letter-spacing: 1px; white-space: nowrap; }
.atlas-experiences h2 > span { color: #9c794c; font-size: 24px; }
.atlas-experiences h2 > img { width: 90px; height: 45px; position: absolute; left: 55px; bottom: -35px; mix-blend-mode: multiply; opacity: .35; }
.atlas-experience { display: flex; gap: 12px; align-items: center; }
.atlas-experience__art { width: 57px; height: 57px; color: #817250; flex-shrink: 0; }
.atlas-experience__art svg { display: block; width: 100%; height: 100%; }
.atlas-experience strong { display: block; font-size: 13px; font-weight: 600; letter-spacing: 1px; }
.atlas-experience small { display: block; font-size: 10px; line-height: 1.8; color: #807361; margin-top: 4px; }
.atlas-journeys { margin-top: 63px; }
.atlas-heading__english { color: #9b8b75; font: 9px Georgia, serif; letter-spacing: 2px; margin-left: 8px; }
.atlas-journeys__hint { font-size: 11px; color: #93816b; letter-spacing: 2px; }
.atlas-city-rail { display: grid; grid-template-columns: repeat(9, minmax(0,1fr)); padding: 24px 0; border-bottom: 1px solid var(--border-light); }
.atlas-city-rail a { display: flex; gap: 11px; justify-content: center; align-items: center; border-right: 1px solid var(--border-light); padding: 14px 0; }
.atlas-city-rail a:last-child { border: 0; }
.atlas-city-rail small { color: #a39075; font: italic 12px Georgia,serif; }
.atlas-city-rail span { font-size: 18px; letter-spacing: 3px; }
.atlas-city-rail i { color: #9d8a6c; font-style: normal; font-size: 13px; }
.atlas-city-rail a:hover { background: #e8ddc933; }
.atlas-reading-links { display: grid; grid-template-columns: 1fr 1fr; }
.atlas-reading-links > a { display: flex; flex-direction: column; align-items: start; gap: 12px; padding: 34px 6%; }
.atlas-reading-links > a + a { border-left: 1px solid var(--border-light); }
.atlas-reading-links > a > span { font-size: 10px; color: #9a856b; letter-spacing: 3px; }
.atlas-reading-links strong { font: 25px/1.7 var(--font-display); letter-spacing: 2px; }
.atlas-reading-links small { font-size: 11px; color: #82735e; }
@media (min-width: 1450px) { .atlas-hero__copy { padding-top: 90px; } }
@media (max-width: 1150px) {
  .river-atlas { padding-inline: 25px; }
  .atlas-hero { min-height: 540px; }
  .atlas-hero__copy { width: 260px; padding-top: 40px; padding-left: 4px; }
  .atlas-hero h1 { width: 245px; font-size: 50px; }
  .atlas-hero__subtitle { font-size: 19px; gap: 12px; }
  .atlas-hero__description { font-size: 12px; }
  .atlas-categories { width: 266px; margin-top: 37px; gap: 19px 12px; }
  .atlas-categories a { font-size: 11px; }
  .atlas-hero__painting { left: 23%; }
  .atlas-sights__grid { gap: 10px; grid-template-columns: repeat(3,minmax(0,1fr)); }
  .atlas-sight { padding: 18px; }
  .atlas-sight__heading { gap: 7px; }
  .atlas-sight h3 { font-size: 20px; }
  .atlas-sight__tag { font-size: 9px; }
  .atlas-sight__description { font-size: 12px; }
  .atlas-experiences { gap: 20px; padding: 23px 18px; grid-template-columns: repeat(4,1fr); }
  .atlas-experiences h2 { grid-column: 1 / -1; }
  .atlas-experiences h2 > img { position: static; height: 32px; }
  .atlas-city-rail a { gap: 5px; }
  .atlas-city-rail span { font-size: 16px; }
}
@media (max-width: 760px) {
  .river-atlas { padding-inline: 20px; }
  .atlas-hero { height: auto; min-height: 0; padding-top: 23px; }
  .atlas-hero__copy { padding: 8px 0 0; width: 100%; }
  .atlas-hero h1 { width: 224px; font-size: 46px; }
  .atlas-hero__subtitle { font-size: 17px; margin-top: 17px; }
  .atlas-hero__description { margin-top: 17px; font-size: 12px; }
  .atlas-categories { position: absolute; top: 43px; right: 0; width: 190px; grid-template-columns: 1fr; gap: 13px; }
  .atlas-hero__painting { position: relative; left: auto; right: auto; height: auto; margin: 4px -13px 10px; container-type: normal; }
  .atlas-stage { position: relative; inset: auto; width: 100%; }
  .atlas-compass { right: 8px; top: 4px; width: 24px; }
  .atlas-sandbox-entry { position: static; margin: 8px 13px 0; justify-content: space-between; }
  .atlas-map-point { font-size: 11px; letter-spacing: 1px; gap: 4px; transform: translate(-8px, -50%); }
  .atlas-map-point--left { transform: translate(calc(-100% + 8px), -50%); }
  .atlas-map-point__dot { width: 16px; height: 16px; font-size: 9px; outline-offset: 2px; }
  .atlas-map-point b { padding: 1px 5px; }
  .atlas-heading h2 { font-size: 22px; }
  .atlas-heading__english { display: none; }
  .atlas-sights__grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-top: 15px; }
  .atlas-sight { padding: 14px 11px; }
  .atlas-sight h3 { font-size: 16px; }
  .atlas-sight__tag { font-size: 8px; }
  .atlas-experiences { grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px 15px; }
  .atlas-experience { gap: 8px; }
  .atlas-experience__art { width: 46px; height: 46px; }
  .atlas-city-rail { grid-template-columns: repeat(3,minmax(0,1fr)); }
  .atlas-city-rail a { gap: 16px; border-bottom: 1px solid var(--border-light); }
  .atlas-city-rail a:nth-child(3n) { border-right: 0; }
  .atlas-reading-links { grid-template-columns: 1fr; }
  .atlas-reading-links > a + a { border-left: 0; border-top: 1px solid var(--border-light); }
  .atlas-reading-links strong { font-size: 22px; }
  .atlas-journeys { margin-top: 40px; }
}
@media (max-width: 480px) {
  .atlas-map-point b { display: none; }
  .atlas-map-point, .atlas-map-point--left { transform: translate(-50%, -50%); }
  .atlas-categories { position: static; grid-template-columns: 1fr 1fr; width: 100%; margin-top: 25px; gap: 17px 24px; }
  .atlas-categories a { font-size: 12px; }
  .atlas-hero h1 { width: 245px; }
  .atlas-hero__painting { margin-top: 15px; }
  .atlas-sight__heading { gap: 4px; }
  .atlas-sight__tag { margin-left: 24px; }
  .atlas-sight__poetry { font-size: 11px; letter-spacing: .5px; }
  .atlas-sight__description { font-size: 11px; }
  .atlas-experiences { column-gap: 16px; }
}
@media (prefers-reduced-motion: reduce) { .atlas-sight__image :deep(img), .atlas-map-point, .atlas-sandbox-entry { transition: none; } }
.atlas-hero__actions { pointer-events:auto; margin-top:25px; gap:8px; }
.atlas-hero__actions .folio-button { padding-inline:14px; font-size:13px; }
.atlas-categories { margin-top:28px; }
.atlas-sights__grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
.atlas-sight { padding:24px; }
.atlas-sight h3 { font-size:21px; }
.atlas-sight__tag { font-size:11px; margin-left:auto; }
.atlas-sight__poetry { font-size:15px; min-height:30px; }
.atlas-sight__description { font-size:13px; padding-bottom:20px; }
.atlas-heading > a { font-size:13px; min-height:44px; display:inline-flex; align-items:center; }
.atlas-experiences { margin-top:28px; }
@media(max-width:760px) { .atlas-categories { position:static; grid-template-columns:repeat(2,1fr); width:100%; margin-top:26px; } .atlas-sights__grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; } .atlas-sight { padding:18px; } .atlas-sight__tag { margin:0; } .atlas-sight h3 { font-size:19px; } }
@media(max-width:480px) { .atlas-sights__grid { grid-template-columns:1fr; } .atlas-sight { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; } .atlas-sight__heading { grid-column:1/-1; } .atlas-sight__image { grid-row:2 / 5; margin:0; align-self:center; } .atlas-sight__poetry { font-size:13px; } .atlas-sight__description { padding:0; margin:0; font-size:12px; } .atlas-pill { justify-self:start; font-size:12px; padding-inline:12px; } }
</style>
