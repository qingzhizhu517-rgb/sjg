<template>
  <div class="inkwash-map">
    <div class="map-backdrop">
      <div class="backdrop-grain"></div>
    </div>

    <div class="map-scroll-container">
      <div class="scroll-roller left"></div>
      
      <div class="map-image-wrapper ink-bleed-effect">
        <img :src="'/images/inkwash-map.png'" alt="黄河流域山东段水墨地图" class="map-image" />

        <div
          v-for="label in labels"
          :key="label.name"
          class="region-label"
          :style="{ left: label.x + '%', top: label.y + '%' }"
          @click="$emit('regionClick', label.name)"
          @mouseenter="label.hovered = true"
          @mouseleave="label.hovered = false"
        >
          <div class="label-stamp" :class="{ hovered: label.hovered }">
            <span class="stamp-name">{{ label.name }}</span>
            <span v-if="label.spotCount" class="stamp-count">{{ label.spotCount }} 处</span>
          </div>
          <div class="label-pulse" v-if="label.hovered"></div>
        </div>
      </div>

      <div class="scroll-roller right"></div>
    </div>

    <div class="map-caption">
      <span class="caption-mark">◆</span>
      点击城市印章标签，探索该地区文学景观
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { regionLabels } from '../config/mapLabels'

const props = defineProps({ spotCounts: { type: Object, default: () => ({}) } })
defineEmits(['regionClick'])

const labels = reactive(regionLabels.map(l => ({ ...l, hovered: false, spotCount: 0 })))

watch(() => props.spotCounts, (newCounts) => {
  labels.forEach(l => {
    l.spotCount = newCounts[l.name] || 0
  })
}, { immediate: true, deep: true })
</script>

<style scoped>
.inkwash-map {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - var(--nav-height) - 220px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* Atmospheric backdrop */
.map-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(194, 58, 43, 0.03) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(139, 26, 26, 0.02) 0%, transparent 60%);
  pointer-events: none;
}

.backdrop-grain {
  position: absolute;
  inset: 0;
  opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Scroll Wrapper styling */
.map-scroll-container {
  display: flex;
  align-items: center;
  position: relative;
  max-width: 1060px;
  width: 100%;
  padding: 0 40px;
}

.scroll-roller {
  width: 16px;
  height: 94%;
  background: linear-gradient(90deg, #422f20, #694a32, #422f20);
  border-radius: 4px;
  box-shadow: 2px 8px 24px rgba(0, 0, 0, 0.3), -2px 8px 24px rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 3%;
  z-index: 5;
}

.scroll-roller.left {
  left: 24px;
}

.scroll-roller.right {
  right: 24px;
}

/* Brass Roller Caps */
.scroll-roller::before,
.scroll-roller::after {
  content: '';
  position: absolute;
  left: -2px;
  width: 20px;
  height: 10px;
  background: linear-gradient(90deg, #8a640f, #d4ab43, #8a640f);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.scroll-roller::before {
  top: -10px;
}

.scroll-roller::after {
  bottom: -10px;
}

/* Map image container */
.map-image-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
  border-top: 6px solid #e2dacd;
  border-bottom: 6px solid #e2dacd;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  background: #faf6ee;
}

.map-image {
  width: 100%;
  display: block;
}

/* Region labels */
.region-label {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.label-stamp {
  position: relative;
  background: var(--accent); /* Cinnabar Red */
  border: 1.5px solid var(--accent-dark);
  padding: 6px 12px;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 3px 10px rgba(194, 58, 43, 0.15);
  border-radius: 2px;
}

.label-stamp.hovered {
  transform: scale(1.12) rotate(-2deg);
  box-shadow: 0 8px 24px rgba(194, 58, 43, 0.35);
  border-color: #fff;
  background: var(--accent-dark);
}

.stamp-name {
  display: block;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 900;
  color: #FAF6EE; /* Xuan paper white */
  letter-spacing: 4px;
  line-height: 1.2;
  text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.2);
}

.stamp-count {
  display: block;
  font-size: 10px;
  color: rgba(250, 246, 238, 0.85);
  margin-top: 4px;
  letter-spacing: 1px;
}

/* Pulse animation on hover */
.label-pulse {
  position: absolute;
  inset: -8px;
  border: 1px solid var(--accent);
  opacity: 0;
  animation: pulse-ring 1.2s ease-out infinite;
  pointer-events: none;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
}

/* Caption */
.map-caption {
  margin-top: 32px;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
  z-index: 1;
}

.caption-mark {
  color: var(--accent);
  margin-right: 4px;
  font-size: 10px;
}

@media (max-width: 768px) {
  .map-scroll-container {
    padding: 0 10px;
  }
  .scroll-roller {
    display: none;
  }
  .map-image-wrapper {
    border-width: 3px;
  }
  .stamp-name {
    font-size: 12px;
    letter-spacing: 2px;
  }
  .label-stamp {
    padding: 4px 8px;
  }
}
</style>

