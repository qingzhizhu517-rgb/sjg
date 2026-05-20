<template>
  <div class="region-spots">
    <h1 class="page-title">{{ region }} - 文学景观</h1>
    <div class="spots-grid">
      <div v-for="spot in spots" :key="spot.id" class="spot-card card"
        @click="$router.push(`/spots/${spot.id}`)">
        <img :src="getImage(spot)" :alt="spot.name" class="spot-image" />
        <div class="spot-info">
          <h3>{{ spot.name }}</h3>
          <p v-if="spot.address" class="address">{{ spot.address }}</p>
        </div>
      </div>
    </div>
    <p v-if="!spots.length" class="empty">暂无景点数据</p>
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

const getImage = (spot) => isReal.value ? spot.imageUrl : (spot.imageAnimeUrl || spot.imageUrl)

onMounted(async () => {
  const data = await api.get('/spots', { params: { region: region.value, size: 100 } })
  spots.value = data.records
})
</script>

<style scoped>
.region-spots {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
}
.spots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.spot-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.3s ease;
}
.spot-card:hover { transform: translateY(-4px); }
.spot-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.spot-info {
  padding: 16px;
  background: var(--card-bg);
}
.spot-info h3 { font-size: 18px; margin-bottom: 4px; }
.address { color: var(--text-secondary); font-size: 13px; }
.empty { text-align: center; color: var(--text-secondary); margin-top: 40px; }
</style>
