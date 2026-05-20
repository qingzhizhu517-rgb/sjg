<template>
  <div class="region-spots">
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
        class="spot-card card"
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

    <div v-if="!spots.length && loaded" class="empty-state">
      <p>暂无景点数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'

const route = useRoute()
const { isReal } = useTheme()
const region = ref(route.params.region)
const spots = ref([])
const loaded = ref(false)

const getImage = (spot) => isReal.value ? spot.imageUrl : (spot.imageAnimeUrl || spot.imageUrl)

onMounted(async () => {
  const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
  spots.value = data.records
  loaded.value = true
})
</script>

<style scoped>
.region-spots {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
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

@media (max-width: 768px) {
  .spots-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
}
</style>
