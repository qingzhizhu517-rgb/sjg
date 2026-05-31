<template>
  <div class="map-view" :class="{ 'anime-layout': isAnime }">
    <!-- Real mode Hero (original) -->
    <div class="map-hero" v-if="isReal">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-main">黄河流域山东段</span>
          <span class="title-sub">文学景观地图</span>
        </h1>
        <p class="hero-desc">探寻九座城市的诗意坐标，触摸千年文脉的地理印记</p>
        <div class="hero-stats" v-if="spots.length">
          <div class="stat-item">
            <span class="stat-num">{{ spots.length }}</span>
            <span class="stat-label">文学景观</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ Object.keys(spotCounts).length }}</span>
            <span class="stat-label">覆盖地区</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Section -->
    <div class="map-main-section">
      <!-- Left Info Column for Anime theme (主页.png left panel) -->
      <aside class="anime-left-panel" v-if="isAnime">
        <div class="calligraphy-header">
          <h1 class="calligraphy-title">山东揽胜</h1>
          <h1 class="calligraphy-title">黄河入海</h1>
          <div class="yellow-river-seal">
            黄河流域 · 山东段
            <span class="cinnabar-dot">天下大观</span>
          </div>
        </div>
        <p class="anime-desc-text">
          黄河在山东境内流长约628公里，流经9市20县区，从济南的温婉到东营的壮阔，沿途孕育了丰富的自然景观与深厚的历史文化，是中华文明的重要发源地之一。
        </p>
        
        <div class="anime-badges-grid">
          <div class="badge-item">
            <div class="badge-icon">🏛️</div>
            <div class="badge-txt">
              <span class="badge-title">世界遗产</span>
              <span class="badge-subtitle">WORLD HERITAGE</span>
            </div>
          </div>
          <div class="badge-item">
            <div class="badge-icon">🏯</div>
            <div class="badge-txt">
              <span class="badge-title">历史名城</span>
              <span class="badge-subtitle">HISTORIC CITY</span>
            </div>
          </div>
          <div class="badge-item">
            <div class="badge-icon">🌳</div>
            <div class="badge-txt">
              <span class="badge-title">自然景观</span>
              <span class="badge-subtitle">NATURAL SCENERY</span>
            </div>
          </div>
          <div class="badge-item">
            <div class="badge-icon">🌊</div>
            <div class="badge-txt">
              <span class="badge-title">黄河流经地</span>
              <span class="badge-subtitle">YELLOW RIVER</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Map Container -->
      <div class="map-container-wrapper">
        <div class="map-container">
          <transition name="map-fade" mode="out-in">
            <AmapInteractiveMap v-if="isReal" key="real" :spots="spots" @spotClick="goToSpot" />
            <InkWashMap v-else key="ink" :spotCounts="spotCounts" @regionClick="goToRegion" />
          </transition>
        </div>
      </div>
    </div>

    <!-- Bottom Showcase (经典景点) -->
    <div class="classic-spots-showcase" v-if="spots.length">
      <div class="showcase-header">
        <h2 class="showcase-title">经典景点</h2>
        <span class="view-all-link" @click="$router.push('/poets')">查看全部景点 &gt;</span>
      </div>

      <div class="spots-horizontal-scroll">
        <div 
          v-for="(spot, index) in featuredSpots" 
          :key="spot.id" 
          class="showcase-card card hover-lift"
          @click="goToSpot(spot)"
        >
          <div class="card-top">
            <span class="card-num">{{ padZero(index + 1) }}</span>
            <span class="card-name">{{ spot.name }}</span>
            <span class="card-seal-tag" v-if="getSpotData(spot.name).tag">{{ getSpotData(spot.name).tag }}</span>
          </div>

          <div class="card-image-content">
            <div class="card-img-box">
              <img :src="getImage(spot)" :alt="spot.name" class="card-image" />
            </div>
            <!-- Calligraphic poetry vertical text on the right -->
            <div class="card-vertical-poetry">
              {{ getSpotData(spot.name).verticalText }}
            </div>
          </div>

          <div class="card-details">
            <p class="detail-row">
              <span class="row-label">简介：</span>
              <span class="row-val">{{ spot.description?.substring(0, 40) }}…</span>
            </p>
          </div>
          
          <div class="card-footer">
            <span class="explore-link">查看详情 →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Special Experiences (特色体验) -->
    <div class="special-experiences-section">
      <div class="special-heading-box">
        <span class="heading-seal">特</span>
        <h3 class="special-heading-text">特色体验</h3>
      </div>
      <div class="experience-badges">
        <div class="exp-badge-item">
          <div class="exp-icon-box">🌅</div>
          <div class="exp-info">
            <span class="exp-title">泰山日出</span>
            <span class="exp-desc">满载旭日出，云海翻腾，壮丽非凡。</span>
          </div>
        </div>
        <div class="exp-badge-item">
          <div class="exp-icon-box">🪨</div>
          <div class="exp-info">
            <span class="exp-title">泰山石刻</span>
            <span class="exp-desc">遍布山间的摩崖石刻，历史与艺术的瑰宝。</span>
          </div>
        </div>
        <div class="exp-badge-item">
          <div class="exp-icon-box">🍲</div>
          <div class="exp-info">
            <span class="exp-title">泰山美食</span>
            <span class="exp-desc">品尝泰安特色美食，如泰山煎饼、豆腐宴等。</span>
          </div>
        </div>
        <div class="exp-badge-item">
          <div class="exp-icon-box">👥</div>
          <div class="exp-info">
            <span class="exp-title">民俗文化</span>
            <span class="exp-desc">体验泰山民俗文化，感受万方风情。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockSpots } from '../config/mockDetailData'
import api from '../api'
import AmapInteractiveMap from '../components/AmapInteractiveMap.vue'
import InkWashMap from '../components/InkWashMap.vue'

const router = useRouter()
const { isReal, isAnime } = useTheme()
const { getImageUrl } = useImage()

const spots = ref([])
const spotCounts = ref({})

const featuredSpots = computed(() => {
  if (!spots.value.length) return []
  // Prefer spots with pictures in mockSpots first, then fallback
  const preferred = ['趵突泉', '大明湖', '泰山', '曲阜三孔', '黄河入海口', '曹州牡丹园']
  const matched = spots.value.filter(s => preferred.includes(s.name))
  const remain = spots.value.filter(s => !preferred.includes(s.name))
  return [...matched, ...remain].slice(0, 6)
})

const padZero = (num) => num < 10 ? `0${num}` : num

const getSpotData = (name) => {
  return mockSpots[name] || {
    verticalText: '黄河九曲，齐鲁揽胜；文脉千载，源远流长。',
    tag: '经典景区'
  }
}

const getImage = (spot) => {
  const url = isReal.value ? spot.imageUrl : (spot.imageAnimeUrl || spot.imageUrl)
  return getImageUrl(url, isAnime.value)
}

onMounted(async () => {
  const data = await api.get('/spots', { params: { size: 1000 } })
  spots.value = data.records
  const counts = {}
  spots.value.forEach(s => { counts[s.region] = (counts[s.region] || 0) + 1 })
  spotCounts.value = counts
})

const goToSpot = (spot) => router.push(`/spots/${spot.id}`)
const goToRegion = (region) => router.push(`/regions/${region}`)
</script>

<style scoped>
.map-view {
  min-height: calc(100vh - var(--nav-height));
  padding-bottom: 40px;
}

/* Hero section */
.map-hero {
  padding: 60px 24px 40px;
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 640px;
  margin: 0 auto;
}

.hero-title {
  margin-bottom: 16px;
}

.title-main {
  display: block;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  line-height: 1.3;
}

.title-sub {
  display: block;
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--accent);
  letter-spacing: 4px;
  margin-top: 8px;
  font-weight: 600;
}

.hero-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 28px;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* 2-Column Layout for Anime mode */
.anime-layout {
  padding-top: 40px;
}

.map-main-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.anime-layout .map-main-section {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.map-container-wrapper {
  width: 100%;
}

/* Left panel under anime theme */
.anime-left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.calligraphy-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calligraphy-title {
  font-family: var(--font-heading);
  font-size: 40px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 4px;
  color: var(--text-primary);
}

.yellow-river-seal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  margin-top: 8px;
  letter-spacing: 1px;
}

.cinnabar-dot {
  background: var(--accent);
  color: #fff;
  padding: 1px 6px;
  font-size: 10px;
  border-radius: 2px;
  font-family: var(--font-display);
}

.anime-desc-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-align: justify;
}

.anime-badges-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-icon {
  font-size: 20px;
}

.badge-txt {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.badge-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.badge-subtitle {
  font-size: 8px;
  color: var(--text-muted);
  font-family: 'Times New Roman', serif;
}

/* Map container */
.map-container {
  width: 100%;
  height: calc(100vh - var(--nav-height) - 240px);
  min-height: 520px;
  transition: all 0.4s ease;
}

.theme-real .map-container {
  border: 12px solid #2b1d12; /* Dark wood border */
  border-radius: var(--radius-md);
  outline: 2px solid #d4a843; /* Gold inner frame */
  outline-offset: -7px;
  box-shadow: 
    0 16px 48px rgba(61, 43, 31, 0.18),
    inset 0 0 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.theme-inkwash .map-container {
  border-radius: var(--radius-md);
  overflow: visible;
  height: auto;
  min-height: auto;
}

.map-fade-enter-active,
.map-fade-leave-active {
  transition: opacity 0.4s ease;
}
.map-fade-enter-from,
.map-fade-leave-to {
  opacity: 0;
}

/* Bottom Showcase */
.classic-spots-showcase {
  max-width: 1400px;
  margin: 56px auto 0;
  padding: 0 40px;
  text-align: left;
}

.showcase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--border-light);
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.theme-inkwash .showcase-header {
  border-bottom-color: var(--border);
}

.showcase-title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
  position: relative;
}

.showcase-title::after {
  content: '';
  position: absolute;
  bottom: -14px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--accent);
}

.view-all-link {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
  transition: color 0.3s;
  cursor: pointer;
}

.view-all-link:hover {
  color: var(--accent);
}

.spots-horizontal-scroll {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.showcase-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  padding: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.35s ease;
}

.theme-inkwash .showcase-card {
  border-color: var(--border);
  border-radius: 4px;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-num {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--text-muted);
  font-weight: 700;
}

.card-name {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.card-seal-tag {
  font-size: 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 1px 6px;
  border-radius: 2px;
  font-weight: 700;
  margin-left: auto;
}

.card-image-content {
  display: flex;
  gap: 16px;
  height: 140px;
  margin-bottom: 16px;
}

.card-img-box {
  flex: 1;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.showcase-card:hover .card-image {
  transform: scale(1.06);
}

.card-vertical-poetry {
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

.theme-inkwash .card-vertical-poetry {
  border-left-color: var(--border);
}

.card-details {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 16px;
  flex-grow: 1;
}

.row-label {
  font-weight: 700;
  color: var(--text-muted);
}

.card-footer {
  margin-top: auto;
  border-top: 1px dashed var(--border-light);
  padding-top: 12px;
  text-align: right;
}

.theme-inkwash .card-footer {
  border-top-color: var(--border);
}

.explore-link {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

/* Special Experiences */
.special-experiences-section {
  max-width: 1400px;
  margin: 56px auto 0;
  padding: 0 40px 40px;
  text-align: left;
}

.special-heading-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 12px;
}

.theme-inkwash .special-heading-box {
  border-bottom-color: var(--border);
}

.heading-seal {
  background: var(--accent);
  color: #fff;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 900;
  border-radius: 2px;
}

.special-heading-text {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.experience-badges {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.exp-badge-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  padding: 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s;
}

.theme-inkwash .exp-badge-item {
  border-radius: 4px;
  background: var(--card-bg);
  border-color: var(--border);
}

.exp-badge-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.exp-icon-box {
  font-size: 24px;
}

.exp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.exp-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .spots-horizontal-scroll {
    grid-template-columns: repeat(2, 1fr);
  }
  .experience-badges {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .map-hero {
    padding: 40px 20px 24px;
  }
  .title-main {
    font-size: 24px;
    letter-spacing: 3px;
  }
  .hero-stats {
    gap: 16px;
  }
  .stat-num {
    font-size: 24px;
  }
  .theme-real .map-container {
    border-width: 6px;
    outline-width: 1px;
    outline-offset: -4px;
  }
  .anime-layout .map-main-section {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
  .spots-horizontal-scroll {
    grid-template-columns: 1fr;
  }
  .experience-badges {
    grid-template-columns: 1fr;
  }
  .classic-spots-showcase {
    padding: 0 20px;
  }
  .special-experiences-section {
    padding: 0 20px 40px;
  }
}
</style>


