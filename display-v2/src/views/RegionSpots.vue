<template>
  <ErrorState v-if="errorMsg" :message="errorMsg" @retry="loadSpots" />

  <div v-else class="region-spots">
    <!-- 城市宣传专题页（单一版式：2026-08-20 删除 anime-container 双布局） -->
    <div class="real-container">
      <CityHero
        :city="region"
        :media="heroMedia"
        :illustration="illustrationData.img"
        :reach="illustrationData.reach"
        :reach-en="illustrationData.reachEn"
        :subtitle="cityData.subtitle"
        :quote="illustrationData.quote"
        :quote-by="illustrationData.quoteBy"
        :stats="heroStats"
      />

      <!-- 城市引言 -->
      <section class="city-intro" ref="introRef">
        <div class="city-intro__inner">
          <div class="city-intro__poetry">
            <span class="poetry-line">{{ illustrationData.quote }}</span>
            <span class="poetry-by">{{ illustrationData.quoteBy }}</span>
          </div>
          <div class="city-intro__desc">
            <p>{{ cityData.desc }}</p>
            <div class="city-intro__meta">
              <span class="meta-item"><strong>地理位置</strong>{{ cityData.geo }}</span>
              <span class="meta-item"><strong>历史文化</strong>{{ cityData.history }}</span>
              <span class="meta-item"><strong>最佳季节</strong>{{ cityData.season }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 加载骨架：精选景观位 -->
      <section v-if="!loaded" class="spots-skeleton" aria-busy="true" aria-label="景点加载中">
        <SkeletonBlock v-for="i in 3" :key="i" height="240px" />
      </section>

      <!-- 精选景点：交错图文 -->
      <section v-if="featuredSpots.length" class="city-features">
        <div class="section-header">
          <span class="section-tag">精选景观</span>
          <h2 class="section-title">一城一境 · 文脉流芳</h2>
        </div>
        <CityFeatureSpot
          v-for="(spot, i) in featuredSpots"
          :key="spot.id"
          :index="i"
          :name="spot.name"
          :description="spot.description"
          :address="spot.address"
          :image="getImage(spot)"
          :tag="getSpotData(spot.name).tag || cityData.tag"
          :stats="getSpotStats(spot)"
          :reversed="i % 2 === 1"
          @click="$router.push(`/spots/${spot.id}`)"
        />
      </section>

      <!-- 更多景点 -->
      <section v-if="moreSpots.length" class="more-spots">
        <div class="section-header">
          <span class="section-tag">更多打卡</span>
          <h2 class="section-title">沿途拾珠</h2>
        </div>
        <div class="more-spots-grid">
          <div
            v-for="(spot, i) in moreSpots"
            :key="spot.id"
            class="more-spot-card card hover-lift"
            :style="{ animationDelay: `${i * 0.06}s` }"
            tabindex="0"
            role="link"
            @click="$router.push(`/spots/${spot.id}`)"
            @keydown.enter="$router.push(`/spots/${spot.id}`)"
          >
            <div class="more-spot__image-wrap">
              <img :src="getImage(spot)" :alt="spot.name" class="more-spot__image" loading="lazy" decoding="async" />
            </div>
            <div class="more-spot__body">
              <h3 class="more-spot__title">{{ spot.name }}</h3>
              <p v-if="spot.address" class="more-spot__address">{{ spot.address }}</p>
              <p v-if="spot.description" class="more-spot__desc">{{ spot.description?.substring(0, 56) }}…</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 空态：数据加载完仍无景点 -->
      <EmptyState
        v-if="loaded && !featuredSpots.length && !moreSpots.length"
        icon="景"
        message="此城景观收录中"
        hint="先去别的城市逛逛"
      />

      <!-- 沿河而下 · 下一站 -->
      <nav v-if="nextCity" class="next-city">
        <router-link :to="`/regions/${nextCity}`" class="next-city__link">
          <span class="next-city__label">沿河而下 · 下一站</span>
          <span class="next-city__name">{{ nextCity }}</span>
          <span class="next-city__arrow">→</span>
        </router-link>
      </nav>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockSpots } from '../config/mockDetailData'
import { resolveContent } from '../content'
import { cityIllustration, nextCityOf, CITY_SLUGS } from '../config/cityIllustrations'
import { resolveCityHeroMedia } from '../utils/cityHeroMedia'
import api from '../api'
import CityHero from '../components/homepage/CityHero.vue'
import CityFeatureSpot from '../components/homepage/CityFeatureSpot.vue'
import SkeletonBlock from '../components/homepage/SkeletonBlock.vue'
import ErrorState from '../components/homepage/ErrorState.vue'
import EmptyState from '../components/homepage/EmptyState.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useFlipTransition } from '../composables/useFlipTransition'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const { theme, resolveAsset } = useTheme()
const { getImageUrl } = useImage()
const region = ref(route.params.region)
const spots = ref([])
const loaded = ref(false)
const errorMsg = ref(null)
const introRef = ref(null)
const cityImageBoxRef = ref(null)
const reduce = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const illustrationData = computed(() => cityIllustration(region.value))
const heroMedia = computed(() =>
  resolveCityHeroMedia({
    slug: CITY_SLUGS[region.value],
    resolveAsset,
    illustration: illustrationData.value?.img,
  }),
)
const cityData = computed(() => getCityData(region.value))

const heroStats = computed(() => {
  const list = [
    { value: spots.value.length, label: '文学景观' },
    { value: cityData.value.tag || '文化重镇', label: '城市标签' }
  ]
  if (illustrationData.value.reachEn && illustrationData.value.reachEn !== 'YELLOW RIVER') {
    list.push({ value: illustrationData.value.reachEn, label: '河段' })
  }
  return list
})

const featuredSpots = computed(() => spots.value.slice(0, 2))
const moreSpots = computed(() => spots.value.slice(2))
const nextCity = computed(() => nextCityOf(region.value))

const getCityData = (cityName) => {
  return resolveContent('cities', cityName, theme.value) || {
    english: 'CITY VIEW',
    subtitle: '古韵齐鲁 · 山东胜景',
    desc: '山东黄河流域历史悠久，山水壮阔，拥有极富人文底蕴的自然与文化遗迹。',
    geo: '山东省境内',
    history: '古齐鲁之地，中华文明摇篮',
    climate: '温带季风气候',
    season: '四季皆宜',
    tag: '文化重镇'
  }
}

const getSpotData = (name) => {
  return mockSpots[name] || {
    verticalText: '黄河九曲，齐鲁揽胜；文脉千载，源远流长。',
    tag: '经典景区',
    history: '',
    play: ''
  }
}

const getSpotStats = (spot) => {
  const data = getSpotData(spot.name)
  const stats = []
  if (data.history) {
    stats.push({ label: '历史文化', value: '深厚', icon: '📜' })
  }
  if (data.play) {
    stats.push({ label: '推荐玩法', value: '丰富', icon: '🎯' })
  }
  stats.push({ label: '文化印记', value: spot.name, icon: '🏛️' })
  return stats.slice(0, 3)
}

const padZero = (num) => num < 10 ? `0${num}` : num

const getImage = (spot) => {
  if (!spot) return ''
  // 单主题后不再按主题挑字段：优先水墨图，缺失回退实景图
  const url = spot.imageAnimeUrl || spot.imageUrl
  return getImageUrl(url, true)
}

const loadSpots = async () => {
  loaded.value = false
  errorMsg.value = null
  try {
    const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
    spots.value = data.records
  } catch (err) {
    console.error('加载地区景点失败:', err)
    errorMsg.value = '加载景点数据失败，请稍后重试'
  } finally {
    loaded.value = true
  }
}

onMounted(async () => {
  await loadSpots()
  await nextTick()

  // P3-2 FLIP: 城市预览卡 → 城市页 Hero 共享元素过渡
  const { animate: animateFlip } = useFlipTransition()
  const flipTarget = document.querySelector('.city-hero__bg-media--img')
  if (flipTarget) {
    animateFlip(flipTarget, region.value, { duration: 0.6 })
  }

  // 城市引言滚动揭示
  if (introRef.value) {
    gsap.fromTo(introRef.value.querySelector('.city-intro__poetry'),
      { x: -40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: introRef.value,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )
    gsap.fromTo(introRef.value.querySelector('.city-intro__desc'),
      { x: 40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: introRef.value,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }
})
</script>

<style scoped>
.region-spots {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

/* Real container: 城市宣传专题 */
.real-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.region-spots:has(.real-container) {
  max-width: 100%;
  padding: 0;
}

/* Section headers */
.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
  text-align: center;
}

.section-tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  background: var(--accent, #9e2b25);
  padding: 5px 12px;
  border-radius: 2px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0;
}

/* City intro */
.city-intro {
  background: var(--page-bg, #fbf8f3);
  padding: 96px 6vw;
}

.city-intro__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 64px;
  align-items: start;
}

.city-intro__poetry {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 24px;
  border-left: 3px solid var(--accent, #9e2b25);
}

.poetry-line {
  font-family: var(--font-heading);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 500;
  letter-spacing: 2px;
  line-height: 1.7;
  color: var(--text-primary);
}

.poetry-by {
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.city-intro__desc {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.city-intro__desc > p {
  font-size: 15px;
  line-height: 2;
  color: var(--text-secondary);
  margin: 0;
  text-align: justify;
  letter-spacing: 0.3px;
}

.city-intro__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.meta-item strong {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* City features */
.city-features {
  background: var(--page-bg, #fbf8f3);
  padding: 48px 6vw 96px;
}

.city-features > .section-header,
.more-spots > .section-header {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.city-features > .city-feature {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* More spots */
.more-spots {
  background: var(--page-bg, #fbf8f3);
  padding: 48px 6vw 96px;
}

.more-spots-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

.more-spot-card {
  cursor: pointer;
  overflow: hidden;
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 4px;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  animation: fadeSlideUp 0.5s ease both;
}

.more-spot-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 40px rgba(31, 26, 22, 0.08);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.more-spot__image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.more-spot__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.more-spot-card:hover .more-spot__image {
  transform: scale(1.05);
}

.more-spot__body {
  padding: 18px 20px 22px;
}

.more-spot__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 2px;
}

.more-spot__address {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.more-spot__desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Next city nav */
.next-city {
  padding: 0 6vw 96px;
  background: var(--page-bg, #fbf8f3);
  display: flex;
  justify-content: center;
}

.next-city__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 64px;
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.next-city__link:hover {
  border-color: var(--accent, #9e2b25);
  background: #fff;
  transform: translateY(-4px);
  box-shadow: 0 18px 48px rgba(31, 26, 22, 0.1);
}

.next-city__link:hover .next-city__arrow {
  transform: translateX(8px);
}

.next-city__label {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-muted);
}

.next-city__name {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 900;
  letter-spacing: 10px;
  color: var(--text-primary);
}

.next-city__arrow {
  font-size: 20px;
  color: var(--accent, #9e2b25);
  transition: transform 0.3s ease;
}

/* 加载骨架 */
.spots-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px 0;
}

/* Anime mode split layout */
.spots-split-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Left column city details */
.city-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
}

.city-header-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 16px;
}

.city-name-vertical {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-primary);
}

.city-name-eng {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 2px;
  margin-top: 2px;
}

.city-subtitle-tag {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: 8px;
}

.city-image-box {
  padding: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.city-landscape-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 2px;
}

.city-intro-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intro-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  border-left: 3px solid var(--accent);
  padding-left: 8px;
}

.intro-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-align: justify;
}

.city-meta-badge-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px dashed var(--border);
  padding-top: 16px;
}

.meta-badge-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.meta-badge-row .badge-icon {
  font-size: 18px;
  margin-top: 2px;
}

.meta-badge-row .badge-txt {
  display: flex;
  flex-direction: column;
}

.meta-badge-row .badge-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.meta-badge-row .badge-val {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}

/* Right column spots details */
.spots-right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.right-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.back-map-btn {
  font-size: 13px;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.3s;
}

.back-map-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.spots-list-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.anime-spot-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.spot-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 8px;
}

.spot-num {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--text-muted);
  font-weight: 700;
}

.spot-name {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.spot-seal-tag {
  font-size: 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 1px 6px;
  border-radius: 2px;
  font-weight: 700;
  margin-left: auto;
}

.spot-card-body-section {
  display: flex;
  gap: 16px;
  height: 140px;
  margin-bottom: 16px;
}

.spot-image-box {
  flex: 1;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.spot-list-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.anime-spot-card:hover .spot-list-img {
  transform: scale(1.06);
}

.spot-vertical-poetry {
  width: 24px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 3px;
  text-align: center;
  border-left: 1px dashed var(--border-light);
  padding-left: 10px;
  line-height: 1.2;
}

.spot-text-details {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.txt-row {
  margin-bottom: 0;
  text-align: justify;
}

.txt-row strong {
  color: var(--text-primary);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .spots-list-grid {
    grid-template-columns: 1fr;
  }

  .city-intro__inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .city-intro__meta {
    grid-template-columns: 1fr;
  }

  .section-title {
    letter-spacing: 4px;
  }
}

@media (max-width: 768px) {
  .city-intro,
  .city-features,
  .more-spots,
  .next-city {
    padding-left: 20px;
    padding-right: 20px;
  }

  .city-intro {
    padding-top: 64px;
    padding-bottom: 64px;
  }

  .city-features,
  .more-spots {
    padding-top: 36px;
    padding-bottom: 64px;
  }

  .city-intro__poetry {
    padding-left: 16px;
  }

  .poetry-line {
    letter-spacing: 1px;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 22px;
    letter-spacing: 3px;
  }

  .region-spots {
    padding: 24px 20px;
  }

  .next-city__link {
    padding: 24px 40px;
  }

  .next-city__name {
    letter-spacing: 6px;
  }
}

</style>

