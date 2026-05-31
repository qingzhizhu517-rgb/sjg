<template>
  <div class="poet-card card hover-lift" @click="$emit('click')">
    <div class="card-avatar-wrap">
      <img :src="avatar" :alt="poet.name" class="card-avatar" />
    </div>
    <div class="card-body">
      <h3 class="card-name">{{ poet.name }}</h3>
      <p class="card-dynasty" v-if="dynasty">{{ dynasty }}</p>
      <p class="card-style" v-if="poet.style">{{ poet.style }}</p>
    </div>
    <div class="card-accent"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'

const props = defineProps({ poet: Object, dynasty: String })
defineEmits(['click'])
const { isAnime } = useTheme()
const { getImageUrl } = useImage()

const avatar = computed(() => {
  if (!props.poet) return ''
  const url = isAnime.value ? props.poet.avatarAnimeUrl || props.poet.avatarUrl : props.poet.avatarUrl
  return getImageUrl(url, isAnime.value)
})
</script>

<style scoped>
.poet-card {
  cursor: pointer;
  padding: 28px 20px 24px;
  text-align: center;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  position: relative;
  overflow: hidden;
  border-top: 4px solid var(--accent);
}

.theme-real .poet-card {
  border-top-color: var(--accent-light);
}

.poet-card:hover {
  transform: translateY(-6px);
}

/* Bottom roll decoration */
.poet-card::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 15%;
  right: 15%;
  height: 8px;
  background: linear-gradient(90deg, #422f20, #694a32, #422f20);
  border-radius: 4px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: opacity 0.3s;
}

.poet-card:hover::after {
  opacity: 1;
}

.card-avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  padding: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s;
}

.theme-real .card-avatar-wrap {
  border-color: var(--accent-light);
  background: rgba(184, 134, 11, 0.05);
}

.theme-inkwash .card-avatar-wrap {
  border-radius: 4px; /* Calligraphy album style uses square cut */
  border-color: var(--accent);
}

.card-avatar {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.poet-card:hover .card-avatar {
  transform: scale(1.08);
}

.card-body {
  position: relative;
  z-index: 1;
}

.card-name {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 2px;
}

.card-dynasty {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.card-style {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Bottom accent bar */
.card-accent {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.35s ease;
}

.poet-card:hover .card-accent {
  width: 60%;
}
</style>

