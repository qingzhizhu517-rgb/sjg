<template>
  <div class="inkwash-map">
    <div class="map-backdrop">
      <div class="backdrop-grain"></div>
    </div>

    <div class="map-image-wrapper">
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

    <div class="map-caption">
      <span class="caption-mark">◆</span>
      点击城市标签，探索该地区文学景观
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { regionLabels } from '../config/mapLabels'

defineProps({ spotCounts: { type: Object, default: () => ({}) } })
defineEmits(['regionClick'])

const labels = reactive(regionLabels.map(l => ({ ...l, hovered: false, spotCount: 0 })))
</script>

<style scoped>
.inkwash-map {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40px 24px;
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

/* Map image container */
.map-image-wrapper {
  position: relative;
  max-width: 1000px;
  width: 100%;
  z-index: 1;
}

.map-image {
  width: 100%;
  display: block;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
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
  background: rgba(250, 246, 238, 0.92);
  backdrop-filter: blur(8px);
  border: 2px solid var(--accent);
  padding: 8px 16px;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.label-stamp.hovered {
  transform: scale(1.12);
  box-shadow: 0 8px 24px rgba(194, 58, 43, 0.2);
  border-color: var(--accent-dark);
  background: rgba(250, 246, 238, 0.98);
}

.stamp-name {
  display: block;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-dark);
  letter-spacing: 3px;
  line-height: 1.2;
}

.stamp-count {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 3px;
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
</style>
