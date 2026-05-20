<template>
  <div class="map-view">
    <transition name="map-fade" mode="out-in">
      <AmapInteractiveMap v-if="isReal" key="real" :spots="spots" @spotClick="goToSpot" />
      <InkWashMap v-else key="anime" :spotCounts="spotCounts" @regionClick="goToRegion" />
    </transition>
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
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.map-fade-enter-active, .map-fade-leave-active {
  transition: opacity 0.4s ease;
}
.map-fade-enter-from, .map-fade-leave-to {
  opacity: 0;
}
</style>
