<template>
  <div class="amap-wrapper">
    <div ref="mapContainer" class="amap-container"></div>
    <div class="map-hint" v-if="spots.length">
      <span class="hint-icon">◎</span>
      点击标志性景观打卡，探索齐鲁文脉
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { useImage } from '../composables/useImage'

const props = defineProps({ spots: { type: Array, default: () => [] } })
const emit = defineEmits(['spotClick'])

const { getImageUrl } = useImage()

const mapContainer = ref(null)
let map = null
let currentInfoWindow = null

// Expose navigation function to window so the raw HTML click in InfoWindow can trigger Vue router
onMounted(() => {
  window.goToShowSpotDetail = (id) => {
    if (currentInfoWindow) currentInfoWindow.close()
    emit('spotClick', { id })
  }
  window.closeAMapInfoWindow = () => {
    if (currentInfoWindow) currentInfoWindow.close()
  }
})

onUnmounted(() => {
  delete window.goToShowSpotDetail
  delete window.closeAMapInfoWindow
  if (map) map.destroy()
})

onMounted(async () => {
  try {
    window._AMapSecurityConfig = {
      securityJsCode: '844a978b907c2ddf9f8e4c9203277800',
    }
    const AMap = await AMapLoader.load({
      key: 'dbfdc8b27a784b3defa5bff9ac795ee0',
      version: '2.0',
    })
    map = new AMap.Map(mapContainer.value, {
      zoom: 7.5,
      center: [118.0, 36.6],
      mapStyle: 'amap://styles/whitesmoke',
    })

    props.spots.forEach(spot => {
      if (spot.longitude && spot.latitude) {
        // Create custom HTML content for Marker
        const markerContent = `
          <div class="custom-marker-wrapper">
            <div class="marker-pin"></div>
            <div class="marker-label">${spot.name}</div>
          </div>
        `

        const marker = new AMap.Marker({
          position: [spot.longitude, spot.latitude],
          content: markerContent,
          offset: new AMap.Pixel(-12, -24),
          extData: spot,
        })

        // Custom InfoWindow content
        const infoWindowContent = `
          <div class="custom-info-card">
            <button class="info-close-btn" onclick="window.closeAMapInfoWindow()">×</button>
            ${spot.imageUrl ? `<div class="info-img-box"><img src="${getImageUrl(spot.imageUrl, false)}" class="info-img" /></div>` : ''}
            <div class="info-body">
              <span class="info-tag">${spot.region}</span>
              <h3 class="info-title">${spot.name}</h3>
              <p class="info-desc">${spot.description ? spot.description.substring(0, 56) + '...' : '暂无详细介绍'}</p>
              <button class="info-btn" onclick="window.goToShowSpotDetail(${spot.id})">探索文学景观 →</button>
            </div>
          </div>
        `

        const infoWindow = new AMap.InfoWindow({
          content: infoWindowContent,
          offset: new AMap.Pixel(0, -32),
          isCustom: true
        })

        marker.on('click', () => {
          if (currentInfoWindow) currentInfoWindow.close()
          infoWindow.open(map, marker.getPosition())
          currentInfoWindow = infoWindow
        })

        map.add(marker)
      }
    })
  } catch (e) {
    console.error('Amap load failed:', e)
  }
})
</script>

<style>
/* Global styles for AMap custom HTML elements (isCustom: true hides original elements) */
.custom-marker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.marker-pin {
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(184, 134, 11, 0.4);
  transition: all 0.3s ease;
}

.custom-marker-wrapper:hover .marker-pin {
  transform: scale(1.3);
  background: var(--accent-dark);
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.6);
}

.marker-label {
  margin-top: 4px;
  background: rgba(61, 43, 31, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  font-family: var(--font-body);
}

/* InfoWindow Card */
.custom-info-card {
  width: 280px;
  background: rgba(253, 250, 245, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 40px rgba(61, 43, 31, 0.15);
  overflow: hidden;
  position: relative;
  animation: infoCardShow 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes infoCardShow {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.info-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 16px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.info-close-btn:hover {
  background: var(--accent);
  color: #fff;
}

.info-img-box {
  width: 100%;
  height: 120px;
  overflow: hidden;
  position: relative;
}

.info-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.custom-info-card:hover .info-img {
  transform: scale(1.08);
}

.info-body {
  padding: 16px;
}

.info-tag {
  display: inline-block;
  font-size: 10px;
  color: var(--accent-dark);
  border: 1px solid var(--accent);
  padding: 1px 6px;
  border-radius: 2px;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.info-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 14px;
}

.info-btn {
  width: 100%;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: var(--font-body);
  letter-spacing: 1px;
}

.info-btn:hover {
  background: var(--accent-dark);
}
</style>

<style scoped>
.amap-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.amap-container {
  width: 100%;
  height: 100%;
  min-height: 540px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-light);
}

.map-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: rgba(253, 250, 245, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-light);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.hint-icon {
  color: var(--accent);
  animation: pulseHint 2s infinite;
}

@keyframes pulseHint {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}
</style>
