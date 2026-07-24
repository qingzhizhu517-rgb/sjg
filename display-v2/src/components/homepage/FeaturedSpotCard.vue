<template>
  <article class="spot hover-lift" @click="$emit('click')">
    <div class="spot__cover">
      <img v-if="imageUrl" :src="imageUrl" :alt="spot.name" @error="onImgError" />
      <span v-else class="spot__cover-fallback">{{ spot.name ? spot.name.charAt(0) : '景' }}</span>
      <span class="spot__region">{{ spot.region }}</span>
    </div>
    <div class="spot__body">
      <h3 class="spot__name">{{ spot.name }}</h3>
      <p v-if="spot.description" class="spot__desc">{{ spot.description }}</p>
      <div class="spot__foot">
        <span class="spot__count">{{ spot.poemCount || 0 }} 篇咏景</span>
        <span class="spot__arrow">查看 →</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useImage } from '../../composables/useImage'

const props = defineProps({
  spot: { type: Object, required: true },
})
defineEmits(['click'])

const { getImageUrl } = useImage()
const imageUrl = computed(() =>
  props.spot.imageUrl ? getImageUrl(props.spot.imageUrl, false) : '',
)
const onImgError = (e) => {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.spot {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.spot__cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8e0cc, #d4cab0);
}
.theme-inkwash .spot__cover {
  background: linear-gradient(135deg, #2a2520, #15130f);
}
.spot__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.spot:hover .spot__cover img {
  transform: scale(1.06);
}
.spot__cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.4;
}
.spot__region {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(28, 26, 23, 0.78);
  color: #f2ebd9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 3px 10px;
  border-radius: 2px;
}
.spot__body {
  padding: 18px 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.spot__name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0 0 8px 0;
  line-height: 1.2;
}
.spot__desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.spot__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  font-size: 11px;
  letter-spacing: 1px;
}
.spot__count {
  color: var(--text-muted);
  font-weight: 600;
}
.spot__arrow {
  color: var(--accent);
  font-weight: 700;
}
.hover-lift:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--text-primary) 0.12%, transparent);
}
@media (max-width: 640px) {
  .spot__cover { height: 140px; }
}
</style>
