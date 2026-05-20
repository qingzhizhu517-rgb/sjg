<template>
  <div class="amap-wrapper">
    <div ref="mapContainer" class="amap-container"></div>
    <div class="map-hint" v-if="spots.length">
      <span class="hint-icon">◎</span>
      点击标记查看详情
    </div>
  </div>
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
      key: '001042ee59eb25ad6a0c605882ad9cf3',
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
.amap-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.amap-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.map-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
  pointer-events: none;
}

.hint-icon {
  margin-right: 4px;
  color: var(--accent);
}
</style>
