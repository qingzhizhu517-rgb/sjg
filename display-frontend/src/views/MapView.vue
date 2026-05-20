<template>
  <div class="map-view">
    <div class="map-hero">
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

    <div class="map-container">
      <transition name="map-fade" mode="out-in">
        <AmapInteractiveMap v-if="isReal" key="real" :spots="spots" @spotClick="goToSpot" />
        <InkWashMap v-else key="ink" :spotCounts="spotCounts" @regionClick="goToRegion" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'
import AmapInteractiveMap from '../components/AmapInteractiveMap.vue'
import InkWashMap from '../components/InkWashMap.vue'

const router = useRouter()
const { isReal } = useTheme()
const spots = ref([])
const spotCounts = ref({})

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

/* Map container */
.map-container {
  width: 100%;
  height: calc(100vh - var(--nav-height) - 220px);
  min-height: 500px;
}

.map-fade-enter-active,
.map-fade-leave-active {
  transition: opacity 0.4s ease;
}
.map-fade-enter-from,
.map-fade-leave-to {
  opacity: 0;
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
}
</style>
