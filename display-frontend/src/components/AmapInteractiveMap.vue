<template>
  <div ref="mapContainer" class="amap-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({ spots: { type: Array, default: () => [] } })
const emit = defineEmits(['spotClick'])

const mapContainer = ref(null)
let map = null

onMounted(async () => {
  try {
    const AMap = await AMapLoader.load({
      key: 'YOUR_AMAP_KEY',
      version: '2.0',
    })
    map = new AMap.Map(mapContainer.value, {
      zoom: 7,
      center: [117.0, 36.5],
      mapStyle: 'amap://styles/normal',
    })

    props.spots.forEach(spot => {
      if (spot.longitude && spot.latitude) {
        const marker = new AMap.Marker({
          position: [spot.longitude, spot.latitude],
          title: spot.name,
          extData: spot,
        })
        marker.on('click', () => emit('spotClick', spot))
        map.add(marker)
      }
    })
  } catch (e) {
    console.error('Amap load failed:', e)
  }
})

onUnmounted(() => { if (map) map.destroy() })
</script>

<style scoped>
.amap-container { width: 100%; height: 100%; min-height: 600px; }
</style>
