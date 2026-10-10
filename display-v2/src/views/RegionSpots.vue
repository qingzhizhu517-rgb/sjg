<template>
  <div class="city-atlas">
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

      <figure class="city-landscape" :class="{ 'city-landscape--jinan': region === '济南' }">
        <img :src="cityImage" :alt="`${region}山水意象插画`" decoding="async" fetchpriority="high" />
        <figcaption>{{ region === '济南' ? 'AI生成 · 济南山水意象' : region === '泰安' ? '五岳独尊' : illustrationData.reach }}</figcaption>
      </figure>

      <section class="city-profile" aria-labelledby="city-introduction">
        <h2 id="city-introduction" class="atlas-subheading">城市简介</h2>
        <p>{{ cityData.desc }}</p>
      </section>

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

      <div class="city-colophon" aria-hidden="true">
        <span>{{ region === '泰安' ? '泰山' : region }}</span>
        <img src="/media/inkwash/atlas/mountain-vignette.webp" alt="" loading="lazy" />
      </div>
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
        <h2>经典景点 <img class="atlas-heading-vignette" src="/media/inkwash/atlas/mountain-vignette.webp" alt="" aria-hidden="true" /></h2>
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
        v-else class="city-spots-empty" icon="景"
        :message="previewMode ? '此城尚无景点预览样本' : '此城景点资料待审核发布'"
        :hint="previewMode ? '可先阅览城市资料，或前往泰安赏景' : '可先阅览城市资料，或循特色体验探访文脉'"
      >
        <router-link v-if="previewMode" :to="atlasLink('/regions/泰安', route)" class="atlas-preview-return">阅览泰安样张 <span aria-hidden="true">→</span></router-link>
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
  : region.value === '泰安' ? '/media/inkwash/atlas/taian-landscape.webp' : illustrationData.value.img)
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
  ? `/media/inkwash/atlas/spot-${atlasImages[spot.name]}.webp`
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
  --atlas-paper: #f5f2eb;
  --atlas-ink: #332b21;
  --atlas-body: #62584c;
  --atlas-muted: #8e8170;
  --atlas-rule: rgba(104, 87, 63, .15);
  --atlas-gold: #9b8055;
  width: min(100%, 1520px);
  display: grid;
  grid-template-columns: minmax(270px, 27%) minmax(0, 1fr);
  margin: 0 auto;
  color: var(--atlas-ink);
  background: var(--atlas-paper);
  font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  text-align: left;
}
.city-atlas h1, .city-atlas h2, .city-atlas h3, .city-atlas p, .city-atlas figure, .city-atlas dl, .city-atlas dd { margin: 0; }
.city-atlas__portrait {
  position: relative;
  min-width: 0;
  padding: 46px 32px 0;
  border-right: 1px solid var(--atlas-rule);
  background: linear-gradient(100deg, rgba(213, 200, 180, .05), rgba(219, 207, 188, .14));
}
.city-heading__title { display: flex; gap: 12px; align-items: center; }
.city-heading h1 { font-size: clamp(48px, 4.7vw, 72px); font-weight: 700; letter-spacing: -2px; line-height: 1.35; white-space: nowrap; }
.city-seal { writing-mode: vertical-rl; font-size: 9px; letter-spacing: 2px; line-height: 1.2; padding: 4px 2px; color: #f7ece0; border: 1px solid #b45e52; outline: 1px solid #b45e52; outline-offset: 2px; background: #b45e52; opacity: .8; }
.city-heading__english { font-family: Georgia, 'Times New Roman', serif; font-size: 15px; letter-spacing: 3.5px; line-height: 1.5; }
.city-heading__stroke { display: block; width: 30px; height: 2px; margin: 19px 0 17px; background: linear-gradient(90deg, #8e704c, transparent); }
.city-heading__subtitle { color: #524537; letter-spacing: 4px; font-weight: 600; font-size: 18px; line-height: 1.8; }
.city-landscape { position: relative; width: calc(100% + 64px); height: clamp(320px, 32vw, 480px); margin: 12px -32px 15px !important; overflow: hidden; }
.city-landscape img { display: block; width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; mask-image: linear-gradient(to bottom, transparent, #000 5%, #000 86%, transparent); }
.city-landscape figcaption { position: absolute; top: 20%; right: 17%; writing-mode: vertical-rl; color: #8c7054; font-size: 11px; letter-spacing: 4px; }
.atlas-subheading { position: relative; font-size: 20px; font-weight: 600; letter-spacing: 2px; line-height: 1.6; padding: 0 0 10px; border-bottom: 1px solid var(--atlas-rule); }
.city-profile .atlas-subheading::after { content: ''; width: 38px; height: 2px; background: var(--atlas-gold); position: absolute; left: 0; bottom: -1px; }
.city-profile > p { color: var(--atlas-body); font-size: 13px; line-height: 2; margin-top: 16px; text-align: justify; }
.city-facts { display: grid; gap: 20px; margin-top: 27px !important; }
.city-fact { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 15px; align-items: start; }
.city-fact__icon { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid #81705c; border-radius: 50%; color: #75634e; }
.city-fact__icon svg { width: 30px; height: 30px; }
.city-fact dt { font-size: 13px; font-weight: 600; letter-spacing: 1px; line-height: 1.5; }
.city-fact dd { color: var(--atlas-body); font-size: 12px; line-height: 1.6; margin-top: 3px; }
.city-colophon { position: relative; height: 210px; margin: 34px -32px 0; overflow: hidden; }
.city-colophon > span { position: absolute; top: 5px; left: 18%; font-family: 'STKaiti', 'KaiTi', serif; font-size: 83px; letter-spacing: -8px; color: #978e82; opacity: .22; transform: rotate(-7deg); }
.city-colophon > img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; opacity: .42; mask-image: linear-gradient(to bottom, transparent, #000 50%, transparent); }
.city-atlas__pages { min-width: 0; padding: 41px 38px 24px; }
.atlas-section-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 48px; padding-bottom: 10px; border-bottom: 1px solid var(--atlas-rule); }
.atlas-section-header h2 { font-size: 26px; font-weight: 600; letter-spacing: 3px; }
.atlas-heading-vignette { display: inline-block; width: 48px; height: 24px; margin-left: 5px; object-fit: contain; vertical-align: middle; opacity: .4; mix-blend-mode: multiply; filter: grayscale(1); }
.atlas-preview-return { display: inline-flex; align-items: center; gap: 18px; min-height: 44px; margin-top: 22px; padding: 8px 20px; border: 1px solid var(--atlas-rule); border-radius: 24px; color: var(--atlas-body); font-size: 13px; text-decoration: none; }
.atlas-preview-return:hover { color: var(--atlas-gold); border-color: var(--atlas-gold); }
.back-to-map { display: flex; align-items: center; gap: 8px; color: var(--atlas-body); text-align: right; text-decoration: none; font-size: 10px; letter-spacing: 1px; line-height: 1.5; }
.back-to-map:hover { color: var(--atlas-gold); }
.back-to-map svg { width: 30px; height: 30px; }
.atlas-spots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); padding-top: 5px; }
.atlas-spots--loading { gap: 24px; padding-top: 24px; }
.atlas-spot { position: relative; min-width: 0; display: flex; flex-direction: column; color: inherit; text-decoration: none; padding: 20px 23px 23px 0; border-bottom: 1px solid var(--atlas-rule); }
.atlas-spot:nth-child(2n) { padding: 20px 0 23px 23px; }
.atlas-spot:nth-child(2n)::before { content: ''; position: absolute; left: 0; top: 20px; bottom: 23px; width: 1px; background: linear-gradient(transparent, var(--atlas-rule) 10%, var(--atlas-rule) 90%, transparent); }
.atlas-spot__heading { display: flex; align-items: center; flex-wrap: wrap; gap: 5px 7px; }
.atlas-spot__number { font-family: Georgia, 'Times New Roman', serif; font-size: 23px; }
.atlas-spot__heading h3 { font-size: 21px; font-weight: 600; letter-spacing: 1px; }
.atlas-spot__tag { color: #87694e; font-size: 11px; font-weight: 400; line-height: 1.4; letter-spacing: .5px; padding: 0 6px; border: 1px solid #d9cbb6; border-radius: 10px; background: rgba(239, 226, 205, .5); margin-left: 5px; }
.atlas-spot__art { position: relative; height: clamp(180px, 15.5vw, 220px); margin: 8px 0 12px !important; overflow: hidden; }
.atlas-spot__art img { width: 100%; height: 100%; display: block; object-fit: contain; object-position: center; mix-blend-mode: multiply; transition: transform .45s ease; mask-image: linear-gradient(to bottom, transparent, #000 7%, #000 89%, transparent); }
.atlas-spot__art--inscribed { display: grid; grid-template-columns: minmax(0, 1fr) 45px; gap: 6px; align-items: center; }
.atlas-spot__inscription { position: relative; display: flex; flex-direction: row-reverse; justify-content: flex-start; align-items: flex-start; gap: 6px; align-self: start; padding: 8px 0 21px; color: #4d4338; }
.atlas-spot__inscription > span { writing-mode: vertical-rl; text-orientation: upright; font-family: 'STKaiti', 'KaiTi', 'Noto Serif SC', serif; font-size: 13px; line-height: 1.35; letter-spacing: 2px; }
.atlas-spot__inscription > span:nth-child(2) { margin-top: 10px; }
.atlas-spot__inscription small { position: absolute; left: 4px; bottom: 0; writing-mode: vertical-rl; color: #ab6255; border: 1px solid rgba(171,98,85,.65); font-size: 8px; line-height: 1.25; padding: 2px 1px; letter-spacing: 1px; }
.atlas-spot:hover .atlas-spot__art img { transform: scale(1.025); }
.atlas-spot__notes { display: grid; gap: 6px; color: var(--atlas-body); font-size: 13px; letter-spacing: .3px; line-height: 1.8; }
.atlas-spot__notes strong { font-weight: 600; color: #514334; }
.atlas-spot__pending { font-style: italic; color: var(--atlas-muted); }
.atlas-spot__more { display: inline-block; color: #95816a; font-size: 10px; letter-spacing: 1px; margin-top: 8px; }
.atlas-spot__more > span { display: inline-block; transition: transform .25s ease; }
.atlas-spot:hover .atlas-spot__more > span { transform: translate(2px, -2px); }
.atlas-spot:focus-visible, .back-to-map:focus-visible, .atlas-preview-return:focus-visible, .city-atlas__footer a:focus-visible { outline: 2px solid #977951; outline-offset: 5px; }
.city-sources { margin-top: 36px; }
.city-atlas__footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; border-top: 1px solid var(--atlas-rule); margin-top: 33px; padding-top: 17px; color: var(--atlas-muted); font-size: 10px; letter-spacing: 2px; }
.city-atlas__footer a { color: var(--atlas-body); text-decoration: none; }
.city-atlas__footer a > span { margin-left: 8px; }
@media (max-width: 1190px) {
  .city-atlas { grid-template-columns: minmax(235px, 27%) minmax(0, 1fr); }
  .city-atlas__portrait { padding: 35px 24px 0; }
  .city-heading h1 { font-size: 50px; }
  .city-heading__subtitle { font-size: 15px; letter-spacing: 2px; }
  .city-landscape { width: calc(100% + 48px); margin-right: -24px !important; margin-left: -24px !important; height: 355px; }
  .city-atlas__pages { padding: 31px 26px 24px; }
  .atlas-spot { padding-right: 17px; }
  .atlas-spot:nth-child(2n) { padding-left: 17px; }
  .atlas-spot__heading { gap: 5px; }
  .atlas-spot__heading h3 { font-size: 18px; }
  .atlas-spot__number { font-size: 21px; }
  .atlas-spot__tag { font-size: 10px; margin-left: 0; }
  .atlas-spot__inscription > span { font-size: 12px; letter-spacing: 1.5px; }
}
@media (max-width: 900px) {
  .city-atlas { grid-template-columns: 1fr; }
  .city-atlas__portrait { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 15px 26px; padding: 32px 30px 27px; border-right: 0; border-bottom: 1px solid var(--atlas-rule); }
  .city-heading { grid-column: 1; grid-row: 1; }
  .city-heading h1 { font-size: 60px; }
  .city-heading__subtitle { font-size: 17px; }
  .city-landscape { grid-column: 2; grid-row: 1 / 3; width: 100%; height: 335px; margin: 0 !important; }
  .city-profile { grid-column: 1; grid-row: 2; }
  .city-profile > p { margin-top: 10px; }
  .city-facts { grid-column: 1 / -1; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 17px; margin-top: 10px !important; }
  .city-fact { grid-template-columns: 32px minmax(0, 1fr); gap: 8px; }
  .city-fact__icon { width: 30px; height: 30px; }
  .city-fact__icon svg { width: 24px; height: 24px; }
  .city-fact dt { font-size: 12px; }
  .city-fact dd { font-size: 11px; }
  .city-colophon { display: none; }
  .city-atlas__pages { padding: 29px 30px 25px; }
  .atlas-spot__heading h3 { font-size: 20px; }
  .atlas-spot__art { height: 195px; }
}
@media (max-width: 560px) {
  .city-atlas__portrait { position: relative; display: block; padding: 24px 22px 25px; overflow: hidden; }
  .city-heading { position: relative; z-index: 1; min-height: 230px; max-width: 75%; }
  .city-heading h1 { font-size: 50px; }
  .city-heading__title { gap: 10px; }
  .city-heading__english { font-size: 12px; letter-spacing: 2px; }
  .city-heading__stroke { margin: 14px 0 11px; }
  .city-heading__subtitle { max-width: 155px; font-size: 15px; letter-spacing: 2px; }
  .city-landscape { position: absolute; top: 67px; right: 0; width: min(240px, 62%); height: 225px; opacity: .84; }
  .city-landscape figcaption { right: 13%; top: 23%; font-size: 9px; }
  .city-profile { position: relative; z-index: 1; }
  .atlas-subheading { font-size: 18px; letter-spacing: 2px; }
  .city-profile > p { font-size: 12px; }
  .city-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 21px !important; gap: 19px 16px; }
  .city-fact { grid-template-columns: 31px minmax(0, 1fr); gap: 9px; }
  .city-atlas__pages { padding: 24px 22px; }
  .atlas-section-header { min-height: 45px; gap: 10px; }
  .atlas-section-header h2 { font-size: 23px; letter-spacing: 2px; }
  .atlas-heading-vignette { width: 36px; height: 20px; margin-left: 1px; }
  .back-to-map { font-size: 9px; }
  .back-to-map svg { width: 25px; height: 25px; }
  .atlas-spots { grid-template-columns: 1fr; }
  .atlas-spot, .atlas-spot:nth-child(2n) { padding: 21px 0 20px; }
  .atlas-spot:nth-child(2n)::before { display: none; }
  .atlas-spot__heading { gap: 8px; }
  .atlas-spot__heading h3 { font-size: 23px; }
  .atlas-spot__number { font-size: 24px; }
  .atlas-spot__tag { font-size: 11px; margin-left: 5px; }
  .atlas-spot__art { height: 205px; margin-top: 7px !important; }
  .atlas-spot__notes { font-size: 13px; line-height: 1.9; gap: 6px; }
  .city-atlas__footer { letter-spacing: 1px; gap: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .atlas-spot__art img, .atlas-spot__more > span { transition: none; }
  .atlas-spot:hover .atlas-spot__art img, .atlas-spot:hover .atlas-spot__more > span { transform: none; }
}
/* 城市切换：九城横排小签，替代空旷的下拉工具栏 */
.city-switch { display: flex; align-items: center; gap: 18px; padding: 0 0 18px; margin-bottom: 22px; border-bottom: 1px solid var(--atlas-rule); }
.city-switch__label { flex: none; font-size: 12px; letter-spacing: 3px; color: var(--atlas-muted); }
.city-switch__list { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.city-switch__item { padding: 5px 12px; font-size: 14px; letter-spacing: 1px; color: var(--atlas-body); border: 1px solid transparent; border-radius: 2px; text-decoration: none; transition: border-color .2s, color .2s, background .2s; }
.city-switch__item:hover { border-color: var(--atlas-rule); color: var(--atlas-ink); }
.city-switch__item[aria-current="page"] { color: #fff; background: var(--accent); border-color: var(--accent); }
.city-switch__culture { flex: none; font-size: 13px; letter-spacing: 1px; color: var(--reading-green); text-decoration: none; }
.city-switch__culture:hover { color: var(--accent); }
@media (max-width: 900px) { .city-switch { flex-wrap: wrap; gap: 10px; } .city-switch__list { flex-basis: 100%; order: 3; } }
/* 景点卡片：配图铺满统一画框；奇数末张横向通栏，避免右侧空半格 */
.atlas-spot__art { aspect-ratio: 16 / 9; height: auto; background: rgba(226, 216, 199, .35); border: 1px solid var(--atlas-rule); }
.atlas-spot__art img { object-fit: cover; mask-image: none; }
.atlas-spot__art--inscribed { grid-template-columns: minmax(0, 1fr) 52px; background: transparent; border-color: transparent; }
.atlas-spot__art--inscribed img { object-fit: contain; }
.atlas-spot__art--fallback img { opacity: .55; filter: grayscale(.35); }
.atlas-spot__art--fallback::after { content: '景'; position: absolute; right: 12px; bottom: 12px; padding: 2px 5px; font-size: 13px; color: #b45e52; border: 1px solid rgba(180, 94, 82, .6); background: rgba(245, 242, 235, .8); }
.atlas-spot__pending { font-style: normal; font-size: 12px; letter-spacing: 1px; }
@media (min-width: 561px) {
  .atlas-spot:last-child:nth-child(odd) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); grid-template-rows: auto 1fr auto; column-gap: 28px; padding-right: 0; }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__heading { grid-column: 1 / -1; }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__art { grid-row: 2 / 4; margin-bottom: 0 !important; }
  .atlas-spot:last-child:nth-child(odd) .atlas-spot__notes { align-self: center; }
} .atlas-spot__more { display:flex; align-items:center; min-height:44px; font-size:13px; color:var(--reading-green); } .back-to-map { min-height:44px; font-size:12px; }
/* 济南竖幅采用完整 2:3 构图，图注留在画外。 */
.city-landscape--jinan { width: 100%; height: auto; aspect-ratio: 2 / 3; margin: 18px 0 22px !important; padding-bottom: 24px; box-sizing: content-box; }
.city-landscape--jinan img {
  object-fit: contain;
  mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 4%, #000 96%, transparent);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.city-landscape--jinan figcaption { top: auto; bottom: 0; right: 0; writing-mode: horizontal-tb; font-size: 10px; letter-spacing: 1px; }
/* 主导航与分区导航合计约 130px，锚点另留 20px 阅读间距。 */
#city-spots { scroll-margin-top: 150px; }
.city-spots-empty :deep(.empty__brush) { width: 70px; height: 28px; margin-bottom: 6px; }
.city-spots-empty :deep(.empty__icon) { font-size: 25px; margin-bottom: 8px; }
.city-atlas__pages :deep(.city-spots-empty) { padding: 24px 16px; }
.city-switch a:focus-visible { outline: 2px solid var(--reading-green); outline-offset: 3px; }
@media (max-width: 560px) {
  .city-atlas__portrait:has(.city-landscape--jinan) .city-heading { min-height: auto; max-width: 100%; }
  .city-landscape--jinan { position: relative; top: auto; right: auto; width: min(100%, 300px); height: auto; margin: 20px auto 25px !important; opacity: 1; }
}
</style>
