<template>
  <div class="city-atlas folio-page">
    <aside class="city-atlas__portrait" aria-labelledby="city-name">
      <header class="city-heading">
        <div class="city-heading__title">
          <h1 id="city-name">{{ region }}市</h1>
          <span class="city-seal" aria-hidden="true">山河图志</span>
        </div>
        <p class="city-heading__english">{{ cityData.english }}</p>
        <span class="city-heading__stroke" aria-hidden="true"></span>
        <p class="city-heading__subtitle">{{ cityData.subtitle }}</p>
      </header>

      <section class="city-profile" aria-labelledby="city-introduction">
        <h2 id="city-introduction" class="atlas-subheading folio-section-title">城市简介</h2>
        <p>{{ cityData.desc }}</p>
      </section>

      <figure class="city-landscape" :class="{ 'city-landscape--jinan': region === '济南' }">
        <img :src="cityImage" :alt="`${region}山水意象插画`" decoding="async" fetchpriority="high" />
        <figcaption>AI生成 · {{ region }}山水意象</figcaption>
      </figure>

      <dl class="city-facts">
        <div v-for="fact in cityFacts" :key="fact.label" class="city-fact">
          <span class="city-fact__icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(path, index) in fact.paths" :key="index" :d="path" />
            </svg>
          </span>
          <div><dt>{{ fact.label }}</dt><dd>{{ fact.value }}</dd></div>
        </div>
      </dl>

    </aside>

    <section class="city-atlas__pages" aria-label="城市景观册页">
      <nav class="city-switch" aria-label="切换城市">
        <span class="city-switch__label">沿河九城</span>
        <div class="city-switch__list">
          <router-link v-for="name in CITY_RIVER_ORDER" :key="name" :to="atlasLink(`/regions/${name}`, route)" :aria-current="name === region ? 'page' : undefined" class="city-switch__item">{{ name }}</router-link>
        </div>
        <router-link :to="atlasLink(`/cities/${region}`, route)" class="city-switch__culture">读{{ region }}文化 <span aria-hidden="true">↗</span></router-link>
      </nav>
      <header id="city-spots" class="atlas-section-header">
        <h2 class="folio-section-title">经典景点 <img class="atlas-heading-vignette" src="/media/inkwash/atlas/mountain-vignette.webp" alt="" aria-hidden="true" /></h2>
        <router-link :to="atlasLink('/', route)" class="back-to-map">
          <span>阅览其他区域<br />返回地图</span>
          <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="15" cy="15" r="12" /><path d="M15 7v16M15 15l-5-4M15 13l6-5M15 19l5-4" /></svg>
        </router-link>
      </header>

      <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadSpots" />
      <div v-else-if="!loaded" class="atlas-spots atlas-spots--loading" aria-busy="true" aria-label="景点加载中">
        <SkeletonBlock v-for="i in 6" :key="i" height="310px" />
      </div>
      <div v-else-if="spots.length" class="atlas-spots">
        <router-link
          v-for="(spot, index) in spots"
          :key="spot.id"
          :to="atlasLink(`/spots/${spot.id}`, route)"
          class="atlas-spot"
          :aria-label="`查看${spot.name}详情`"
        >
          <header class="atlas-spot__heading">
            <span class="atlas-spot__number">{{ String(index + 1).padStart(2, 0) }}</span>
            <h3>{{ spot.name }}</h3>
            <span class="atlas-spot__tag">{{ spot.tag || spotTags[spot.name] || cityData.tag || '山水胜景' }}</span>
          </header>
          <figure class="atlas-spot__art" :class="{ 'atlas-spot__art--inscribed': getInscription(spot.name).length, 'atlas-spot__art--fallback': !hasOwnImage(spot) }">
            <img :src="getImage(spot)" @error="failedImages.add(spot.id)" :alt="`${spot.name}意象插画`" loading="lazy" decoding="async" />
            <figcaption v-if="getInscription(spot.name).length" class="atlas-spot__inscription" aria-label="景观题款，装饰引导文案" title="景观题款 · 装饰引导文案">
              <span v-for="(line, lineIndex) in getInscription(spot.name)" :key="lineIndex">{{ line }}</span>
              <small aria-hidden="true">山水</small>
            </figcaption>
          </figure>
          <div class="atlas-spot__notes">
            <p v-if="spot.description"><strong>简介：</strong>{{ excerpt(spot.description, 66) }}</p>
            <p v-if="spot.history || getSpotData(spot.name).history"><strong>历史文化：</strong>{{ excerpt(spot.history || getSpotData(spot.name).history, 72) }}</p>
            <p v-if="spot.travelTips || getSpotData(spot.name).play"><strong>推荐玩法：</strong>{{ excerpt(spot.travelTips || getSpotData(spot.name).play, 60) }}</p>
            <p v-if="!spot.description && !spot.history && !getSpotData(spot.name).history" class="atlas-spot__pending">景观资料持续整理中</p>
          </div>
          <span class="atlas-spot__more">阅览详情 <span aria-hidden="true">↗</span></span>
        </router-link>
      </div>
      <EmptyState
        v-else compact class="city-spots-empty" icon="景"
        :message="previewMode ? '当前预览未提供本城景点样本' : '当前暂无已发布的景点资料'"
        :hint="previewMode ? '此提示仅说明预览样本范围，不代表正式景点收录数量。' : '可先阅读城市文化，或浏览其他城市。'"
      >
        <router-link v-if="previewMode" :to="atlasLink('/regions/泰安', route)" class="folio-button folio-button--quiet">阅览泰安样张 <span aria-hidden="true">→</span></router-link>
      </EmptyState>

      <CityExperiences v-if="!errorMsg" :region="region" :city-image="cityImage" :pending="loaded && !spots.length" :preview="previewMode" />

      <SourceList v-if="sources.length" :sources="sources" class="city-sources" />
      <footer class="city-atlas__footer">
        <p>齐鲁山河 · 一城一卷</p>
        <router-link v-if="nextCity" :to="atlasLink(`/regions/${nextCity}`, route)">下一站 · {{ nextCity }} <span aria-hidden="true">→</span></router-link>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useImage } from '../composables/useImage'
import { mockSpots } from '../config/mockDetailData'
import { resolveContent } from '../content'
import { cityIllustration, nextCityOf, CITY_RIVER_ORDER } from '../config/cityIllustrations'
import { isAtlasPreview, atlasLink, previewSpots, previewCity } from '../config/atlasPreview'
import api from '../api'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import SourceList from '../components/SourceList.vue'
import CityExperiences from '../components/CityExperiences.vue'

const route = useRoute()
const router = useRouter()
const { resolveFirstImage } = useImage()
const region = computed(() => String(route.params.region || '').replace(/市$/, ''))
const previewMode = computed(() => isAtlasPreview(route))
const spots = ref([])
const sources = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const illustrationData = computed(() => cityIllustration(region.value))
const cityImage = computed(() => region.value === '济南'
  ? '/media/inkwash/city-experiences/jinan-portrait-v1.webp'
  : region.value === '泰安' ? '/media/inkwash/atlas/taian-landscape-v2.webp' : illustrationData.value.img)
const nextCity = computed(() => nextCityOf(region.value))
const cityData = computed(() => {
  if (previewMode.value && region.value === '泰安') return {
    english: previewCity.englishName,
    subtitle: previewCity.subtitle,
    desc: previewCity.description,
    geo: previewCity.location,
    history: previewCity.history,
    climate: previewCity.climate,
    season: previewCity.season,
    tag: '岱宗',
  }
  const content = resolveContent('cities', region.value, 'inkwash') || {
    english: 'CITY', subtitle: '古韵齐鲁 · 山东胜景',
    desc: '黄河流域历史悠久，山水壮阔，自然景观与文化遗迹交相辉映。',
    geo: '山东省境内', history: '齐鲁文脉，源远流长',
    climate: '温带季风气候', season: '四季皆宜', tag: '山水胜景',
  }
  return { ...content, english: `${content.english} CITY` }
})
const cityFacts = computed(() => [
  { label: '地理位置', value: cityData.value.geo, paths: ['M16 4a7 7 7 1 0 0 14 7 7 7 0 0 0-14Z', 'M16 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M10 16l6 11 6-11', 'M9 23l-4 4h7M23 23l4 4h-7'] },
  { label: '历史文化', value: cityData.value.history, paths: ['M5 12l11-7 11 7H5ZM8 14v11M13 14v11M19 14v11M24 14v11M5 26h22', 'M16 2v3M5 12v2h22v-2'] },
  { label: '气候特点', value: cityData.value.climate, paths: ['M9 20a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8H9Z', 'M11 23l-1 3M17 23l-1 3M23 23l-1 3', 'M20 5V2M25 7l2-2'] },
  { label: '最佳旅游季节', value: cityData.value.season, paths: ['M9 8a4 4 0 0 1 7-3 4 4-1 0 1 7 4 4 4 0 0 1 2 7 4 5 0 0 1-6 7 4 4 0 0 1-7 0 4 4 0 0 1-6-5 4 4 0 0 1 3-10Z', 'M16 12v16M16 19l-5-4M16 23l6-6'] },
])
const spotTags = {
  泰山: '五岳之首', 泰山风景区: '五岳之首', 岱庙: '天下第一庙',
  红门: '泰山第一行宫', 红门宫: '泰山第一行宫', 中天门: '登天门户', 南天门: '天门锁钥', 玉皇顶: '泰山之巅',
}
const atlasImages = {
  泰山: 'taishan', 泰山风景区: 'taishan', 岱庙: 'daimiao',
  红门: 'hongmen', 红门宫: 'hongmen', 中天门: 'zhongtianmen', 南天门: 'nantianmen', 玉皇顶: 'yuhuangding',
}
const getSpotData = (name) => mockSpots[name] || {}
// 复用现有景观文案作为装饰题款，不添加诗人署名或文献归属。
const getInscription = (name) => {
  const phrases = (getSpotData(name).verticalText || '').split(/[，。；！？]/).filter(Boolean)
  const middle = Math.ceil(phrases.length / 2)
  return [phrases.slice(0, middle).join(''), phrases.slice(middle).join('')]
    .filter(Boolean).map((line) => line.slice(0, 10))
}
const ownImage = (spot) => atlasImages[spot.name]
  ? `/media/inkwash/atlas/spot-${atlasImages[spot.name]}${['taishan', 'yuhuangding'].includes(atlasImages[spot.name]) ? '-v2' : ''}.webp`
  : resolveFirstImage([spot.imageAnimeUrl, spot.imageUrl], '景', { placeholder: false })
// 远程图可能已失效（OSS 404），加载失败同样回落
const failedImages = ref(new Set())
const hasOwnImage = (spot) => Boolean(ownImage(spot)) && !failedImages.value.has(spot.id)
// 无专属配图时借用本城山水插画，而不是红色「景」字印章
const getImage = (spot) => (hasOwnImage(spot) && ownImage(spot)) || illustrationData.value.img
const excerpt = (value, limit) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return text.length > limit ? `${text.slice(0, limit).replace(/[，、；：]$/, '')}…` : text
}

let requestVersion = 0
const loadSpots = async () => {
  const version = ++requestVersion
  loaded.value = false
  errorMsg.value = null
  spots.value = []
  sources.value = []
  if (previewMode.value) {
    spots.value = region.value === '泰安' ? previewSpots : []
    loaded.value = true
    return
  }
  try {
    const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
    if (version !== requestVersion) return
    spots.value = Array.isArray(data?.records) ? data.records : []
    sources.value = Array.isArray(data?.sources) ? data.sources : []
  } catch (error) {
    if (version !== requestVersion) return
    errorMsg.value = error.message || '加载景点数据失败，请稍后重试'
  } finally {
    if (version === requestVersion) loaded.value = true
  }
}
watch([region, previewMode], loadSpots, { immediate: true })
</script>

<style scoped>
.city-atlas {
  --atlas-paper: var(--bg-primary);
  --atlas-ink: var(--text-primary);
  --atlas-body: var(--text-secondary);
  --atlas-muted: var(--text-muted);
  --atlas-rule: var(--border-light);
  --atlas-gold: var(--ink-wash);
  display: grid;
  grid-template-columns: minmax(0, 28fr) minmax(0, 72fr);
  gap: var(--layout-gap);
  align-items: start;
  color: var(--text-primary);
  text-align: left;
}
.city-atlas__portrait { min-width: 0; padding-right: var(--sp-5); border-right: 1px solid var(--border-light); }
.city-heading__title { display: flex; gap: var(--sp-3); align-items: center; }
.city-heading h1 { font: 600 clamp(40px, 4.5vw, 60px)/1.3 var(--font-display); letter-spacing: .02em; text-wrap: balance; }
.city-seal { flex-shrink: 0; writing-mode: vertical-rl; font: 12px/1.3 var(--font-display); letter-spacing: 2px; padding: 4px 2px; background: var(--accent); color: var(--text-on-accent); outline: 1px solid var(--accent-a35); outline-offset: 2px; }
.city-heading__english { font: 13px/1.8 Georgia, serif; letter-spacing: .16em; margin-top: var(--sp-2); }
.city-heading__stroke { display: block; width: 32px; height: 2px; margin: var(--sp-4) 0; background: var(--ink-wash); }
.city-heading__subtitle { font-size: var(--fs-lead); line-height: 1.7; text-wrap: pretty; }
.city-profile { margin-top: var(--sp-5); }
.atlas-subheading { padding-bottom: var(--sp-3); border-bottom: 1px solid var(--border-light); }
.city-profile > p { margin-top: var(--sp-4); font-size: var(--fs-body); line-height: var(--lh-body); color: var(--text-secondary); text-wrap: pretty; }
.city-landscape { position: relative; width: 100%; aspect-ratio: 1; margin: var(--sp-5) 0; }
.city-landscape img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.city-landscape figcaption { margin-top: var(--sp-2); font-size: var(--fs-caption); line-height: 1.8; color: var(--text-muted); }
.city-landscape--jinan { aspect-ratio: 2 / 3; }
.city-facts { display: grid; gap: var(--sp-4); margin-top: var(--sp-6); }
.city-fact { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: var(--sp-3); align-items: start; }
.city-fact__icon { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 50%; color: var(--ink-wash); }
.city-fact__icon svg { width: 28px; height: 28px; }
.city-fact dt { font-size: var(--fs-body-sm); font-weight: 600; line-height: 1.7; }
.city-fact dd { font-size: var(--fs-body-sm); line-height: 1.8; color: var(--text-secondary); margin-top: var(--sp-1); }
.city-atlas__pages { min-width: 0; }
.city-switch { display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-3); padding-bottom: var(--sp-4); margin-bottom: var(--sp-5); border-bottom: 1px solid var(--border-light); }
.city-switch__label { font-size: var(--fs-meta); color: var(--text-muted); }
.city-switch__list { display: flex; flex: 1 1 100%; order: 3; gap: var(--sp-1); min-width: 0; overflow-x: auto; padding: var(--sp-1); scrollbar-width: thin; }
.city-switch__item { display: inline-flex; justify-content: center; align-items: center; min-height: var(--control-height); flex: 0 0 auto; padding: var(--sp-2) var(--sp-3); font-size: var(--fs-body-sm); border: 1px solid transparent; border-radius: var(--radius-sm); }
.city-switch__item:hover { border-color: var(--border); }
.city-switch__item[aria-current="page"] { color: var(--text-on-accent); background: var(--accent); }
.city-switch__culture { margin-left: auto; display: inline-flex; align-items: center; min-height: var(--control-height); font-size: var(--fs-body-sm); color: var(--reading-green); }
.atlas-section-header { display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; gap: var(--sp-3); padding-bottom: var(--sp-3); border-bottom: 1px solid var(--border-light); }
.atlas-section-header h2 { display: flex; align-items: center; gap: var(--sp-2); }
.atlas-heading-vignette { width: 48px; height: 32px; object-fit: contain; opacity: .5; }
.back-to-map { display: flex; align-items: center; gap: var(--sp-2); min-height: var(--control-height); font-size: var(--fs-meta); color: var(--text-secondary); line-height: 1.7; }
.back-to-map svg { width: 28px; height: 28px; }
.atlas-spots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--card-gap); margin-top: var(--sp-5); }
.atlas-spot { min-width: 0; position: relative; display: flex; flex-direction: column; padding-bottom: var(--sp-5); border-bottom: 1px solid var(--border-light); }
.atlas-spot__heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--sp-2); }
.atlas-spot__number { font: 20px/1.5 Georgia, serif; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.atlas-spot__heading h3 { font-size: var(--fs-card-title); line-height: 1.5; font-weight: 600; }
.atlas-spot__tag { padding: 2px 6px; font-size: var(--fs-caption); line-height: 1.8; color: var(--text-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
.atlas-spot__art { position: relative; aspect-ratio: 16 / 9; margin: var(--sp-4) 0; min-width: 0; background: var(--accent-faint); overflow: hidden; }
.atlas-spot__art img { width: 100%; height: 100%; object-fit: cover; mix-blend-mode: multiply; }
.atlas-spot__art--inscribed { display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: var(--sp-2); background: transparent; }
.atlas-spot__art--inscribed img { object-fit: contain; }
.atlas-spot__inscription { position: relative; display: flex; flex-direction: row-reverse; gap: var(--sp-1); align-self: start; padding: var(--sp-2) 0 var(--sp-5); }
.atlas-spot__inscription > span { writing-mode: vertical-rl; font: 14px/1.5 var(--font-display); letter-spacing: 2px; }
.atlas-spot__inscription > span:nth-child(2) { margin-top: var(--sp-2); }
.atlas-spot__inscription small { position: absolute; bottom: 0; left: 0; writing-mode: vertical-rl; color: var(--accent); font-size: var(--fs-caption); }
.atlas-spot__art--fallback img { opacity: .55; }
.atlas-spot__art--fallback::after { content: '景'; position: absolute; right: var(--sp-3); bottom: var(--sp-3); color: var(--accent); background: var(--glass-bg); font: 14px var(--font-display); padding: 4px 6px; }
.atlas-spot__notes { display: grid; gap: var(--sp-2); font-size: var(--fs-body-sm); line-height: var(--lh-body); color: var(--text-secondary); }
.atlas-spot__notes strong { font-weight: 600; color: var(--text-primary); }
.atlas-spot__pending { font-style: normal; color: var(--text-muted); }
.atlas-spot__more { display: flex; align-items: center; justify-content: space-between; min-height: var(--control-height); margin-top: auto; padding-top: var(--sp-4); color: var(--reading-green); font-size: var(--fs-body-sm); }
.city-sources { margin-top: var(--section-gap); }
.city-atlas__footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-3); border-top: 1px solid var(--border-light); margin-top: var(--sp-6); padding-top: var(--sp-4); font-size: var(--fs-meta); color: var(--text-muted); }
.city-atlas__footer a { display: inline-flex; align-items: center; min-height: var(--control-height); color: var(--reading-green); }
#city-spots { scroll-margin-top: 150px; }
@media (min-width: 768px) {
  .atlas-spot:last-child:nth-child(odd) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); column-gap: var(--sp-5); }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__heading { grid-column: 1 / -1; }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__art { grid-row: 2 / 4; }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__notes { align-self: center; }
}
@media (max-width: 1199px) {
  .city-atlas { grid-template-columns: 1fr; }
  .city-atlas__portrait { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--sp-5) var(--layout-gap); border-right: 0; border-bottom: 1px solid var(--border-light); padding: 0 0 var(--sp-6); }
  .city-heading { grid-column: 1; grid-row: 1; }
  .city-profile { grid-column: 1; grid-row: 2; margin: 0; }
  .city-landscape { grid-column: 2; grid-row: 1 / 3; width: 100%; height: 280px; aspect-ratio: auto; margin: 0; align-self: start; }
  .city-facts { grid-column: 1 / -1; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: var(--sp-4); }
}
@media (max-width: 767px) {
  .city-atlas__portrait { display: flex; flex-direction: column; gap: var(--sp-5); }
  .city-heading h1 { font-size: 44px; }
  .city-profile { margin: 0; }
  .city-landscape { height: 240px; margin-bottom: var(--sp-5); }
  .city-landscape--jinan { height: 360px; }
  .city-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 0; }
  .city-switch__list { order: 3; }
  .atlas-spots { grid-template-columns: 1fr; }
}
</style>
