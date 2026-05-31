<template>
  <div class="region-spots" :class="{ 'anime-layout': isAnime }">
    <!-- Real Layout (original simple grid style) -->
    <div class="real-container" v-if="isReal">
      <div class="page-hero">
        <div class="hero-back">
          <router-link to="/map" class="back-link">← 返回地图</router-link>
        </div>
        <h1 class="page-title">{{ region }}</h1>
        <p class="page-desc">该地区的文学景观</p>
        <div class="divider"></div>
      </div>

      <div class="spots-grid">
        <div
          v-for="(spot, i) in spots"
          :key="spot.id"
          class="spot-card card hover-lift"
          :style="{ animationDelay: `${i * 0.06}s` }"
          @click="$router.push(`/spots/${spot.id}`)"
        >
          <div class="card-image-wrap">
            <img :src="getImage(spot)" :alt="spot.name" class="card-image" />
            <div class="image-overlay"></div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ spot.name }}</h3>
            <p v-if="spot.address" class="card-address">{{ spot.address }}</p>
            <p v-if="spot.description" class="card-desc">{{ spot.description?.substring(0, 60) }}…</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Anime Layout (景点详情页.png replica) -->
    <div class="anime-container" v-else>
      <div class="spots-split-layout">
        <!-- Left Column: City Info -->
        <aside class="city-left-col animate-slide-in">
          <div class="city-header-box">
            <h1 class="city-name-vertical">{{ region }}市</h1>
            <span class="city-name-eng">{{ getCityData(region).english }}</span>
            <div class="city-subtitle-tag">{{ getCityData(region).subtitle }}</div>
          </div>

          <div class="city-image-box card">
            <img :src="cityRepresentativeImage" :alt="region" class="city-landscape-img" />
          </div>

          <div class="city-intro-section">
            <h3 class="intro-title">城市简介</h3>
            <p class="intro-text">{{ getCityData(region).desc }}</p>
          </div>

          <div class="city-meta-badge-list">
            <div class="meta-badge-row">
              <div class="badge-txt">
                <span class="badge-label">地理位置</span>
                <span class="badge-val">{{ getCityData(region).geo }}</span>
              </div>
            </div>
            <div class="meta-badge-row">
              <div class="badge-txt">
                <span class="badge-label">历史文化</span>
                <span class="badge-val">{{ getCityData(region).history }}</span>
              </div>
            </div>
            <div class="meta-badge-row">
              <div class="badge-txt">
                <span class="badge-label">气候特点</span>
                <span class="badge-val">{{ getCityData(region).climate }}</span>
              </div>
            </div>
            <div class="meta-badge-row">
              <div class="badge-txt">
                <span class="badge-label">最佳旅游季节</span>
                <span class="badge-val">{{ getCityData(region).season }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Column: Spots Grid -->
        <section class="spots-right-col">
          <div class="right-col-header">
            <h2 class="right-title">经典景点</h2>
            <button class="back-map-btn" @click="$router.push('/map')">
              点击其他区域 <strong>返回地图</strong>
            </button>
          </div>

          <div class="spots-list-grid">
            <div 
              v-for="(spot, index) in spots" 
              :key="spot.id" 
              class="anime-spot-card card hover-lift"
              @click="$router.push(`/spots/${spot.id}`)"
            >
              <div class="spot-card-header">
                <span class="spot-num">{{ padZero(index + 1) }}</span>
                <h3 class="spot-name">{{ spot.name }}</h3>
                <span class="spot-seal-tag" v-if="getSpotData(spot.name).tag">{{ getSpotData(spot.name).tag }}</span>
              </div>

              <div class="spot-card-body-section">
                <div class="spot-image-box">
                  <img :src="getImage(spot)" :alt="spot.name" class="spot-list-img" />
                </div>
                <div class="spot-vertical-poetry">
                  {{ getSpotData(spot.name).verticalText }}
                </div>
              </div>

              <div class="spot-text-details">
                <p class="txt-row">
                  <strong>简介：</strong>{{ spot.description?.substring(0, 100) }}
                </p>
                <p class="txt-row" v-if="getSpotData(spot.name).history">
                  <strong>历史文化：</strong>{{ getSpotData(spot.name).history?.substring(0, 100) }}
                </p>
                <p class="txt-row" v-if="getSpotData(spot.name).play">
                  <strong>推荐玩法：</strong>{{ getSpotData(spot.name).play }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockCities, mockSpots } from '../config/mockDetailData'
import api from '../api'

const route = useRoute()
const { isReal, isAnime } = useTheme()
const { getImageUrl } = useImage()
const region = ref(route.params.region)
const spots = ref([])
const loaded = ref(false)

const getCityData = (cityName) => {
  return mockCities[cityName] || {
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

const padZero = (num) => num < 10 ? `0${num}` : num

const getImage = (spot) => {
  if (!spot) return ''
  const url = isReal.value ? spot.imageUrl : (spot.imageAnimeUrl || spot.imageUrl)
  return getImageUrl(url, isAnime.value)
}

const cityRepresentativeImage = computed(() => {
  if (!spots.value.length) return ''
  return getImage(spots.value[0])
})

onMounted(async () => {
  const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
  spots.value = data.records
  loaded.value = true
})
</script>

<style scoped>
.region-spots {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

/* Hero */
.page-hero {
  text-align: center;
  padding: 32px 0 40px;
}

.hero-back {
  margin-bottom: 24px;
}

.back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  letter-spacing: 1px;
}

.back-link:hover {
  color: var(--accent);
}

.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

/* Grid */
.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.spot-card {
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  animation: fadeSlideUp 0.5s ease both;
}

.spot-card:hover {
  transform: translateY(-6px);
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

/* Image */
.card-image-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.spot-card:hover .card-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* Body */
.card-body {
  padding: 20px 24px;
}

.card-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 2px;
}

.card-address {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 15px;
}

/* Anime mode split layout */
.spots-split-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.anime-layout .spots-split-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  align-items: start;
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
}

@media (max-width: 768px) {
  .spots-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
  .anime-layout .spots-split-layout {
    grid-template-columns: 1fr;
  }
  .region-spots {
    padding: 24px 20px;
  }
}
</style>

