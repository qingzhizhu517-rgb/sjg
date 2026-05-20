<template>
  <div class="inkwash-map">
    <div class="map-image-wrapper">
      <img src="/images/inkwash-map.jpg" alt="黄河流域山东段" class="map-image" />
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
          <span class="label-name">{{ label.name }}</span>
          <span v-if="label.spotCount" class="label-count">{{ label.spotCount }}景</span>
        </div>
      </div>
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
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}
.map-image-wrapper {
  position: relative;
  max-width: 1000px;
  width: 100%;
}
.map-image {
  width: 100%;
  display: block;
}
.region-label {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.label-stamp {
  background: rgba(250, 246, 238, 0.9);
  border: 2px solid var(--accent);
  border-radius: 4px;
  padding: 6px 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.label-stamp.hovered {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(194, 58, 43, 0.3);
  border-color: var(--accent-dark);
}
.label-name {
  display: block;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: bold;
  color: var(--accent-dark);
}
.label-count {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
