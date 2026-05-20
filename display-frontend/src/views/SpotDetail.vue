<template>
  <div class="spot-detail" v-if="spot">
    <div class="detail-top">
      <router-link to="/map" class="back-link">← 返回地图</router-link>
    </div>

    <div class="detail-hero">
      <div class="hero-image-wrap" v-if="imageUrl">
        <img :src="imageUrl" :alt="spot.name" class="hero-image" />
        <div class="image-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-region" v-if="spot.region">{{ spot.region }}</div>
        <h1 class="hero-title">{{ spot.name }}</h1>
        <p v-if="spot.address" class="hero-address">{{ spot.address }}</p>
      </div>
    </div>

    <div class="detail-section" v-if="spot.description">
      <h2 class="section-heading">景点介绍</h2>
      <div class="desc-content">
        <p>{{ spot.description }}</p>
      </div>
    </div>

    <div class="detail-section" v-if="poems.length">
      <h2 class="section-heading">相关诗词</h2>
      <div class="poems-grid">
        <router-link
          v-for="poem in poems"
          :key="poem.id"
          :to="`/poems/${poem.id}`"
          class="poem-card card"
        >
          <h3 class="poem-title">{{ poem.title }}</h3>
          <p class="poem-preview">{{ poem.content?.substring(0, 60) }}…</p>
          <span class="poem-link">阅读全文 →</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import api from '../api'

const route = useRoute()
const { isReal } = useTheme()
const spot = ref(null)
const poems = ref([])

const imageUrl = computed(() => {
  if (!spot.value) return null
  return isReal.value ? spot.value.imageUrl : (spot.value.imageAnimeUrl || spot.value.imageUrl)
})

onMounted(async () => {
  const data = await api.get(`/spots/${route.params.id}`)
  spot.value = data.spot || data
  poems.value = data.poems || []
})
</script>

<style scoped>
.spot-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.detail-top {
  padding: 24px 0;
}

.back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  letter-spacing: 1px;
}

.back-link:hover {
  color: var(--accent);
}

/* Hero */
.detail-hero {
  margin-bottom: 48px;
}

.hero-image-wrap {
  position: relative;
  height: 360px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 24px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%);
}

.hero-content {
  text-align: center;
}

.hero-region {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 3px 12px;
  border: 1px solid var(--accent);
  margin-bottom: 12px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  margin-bottom: 8px;
}

.hero-address {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Sections */
.detail-section {
  margin-bottom: 48px;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  letter-spacing: 2px;
  position: relative;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent);
}

.desc-content p {
  font-size: 15px;
  line-height: 2;
  color: var(--text-primary);
  text-indent: 2em;
}

/* Poems */
.poems-grid {
  display: grid;
  gap: 16px;
}

.poem-card {
  display: block;
  padding: 24px 28px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.poem-card:hover {
  transform: translateX(4px);
}

.poem-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.poem-preview {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 8px;
}

.poem-link {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
}

@media (max-width: 768px) {
  .hero-image-wrap {
    height: 200px;
  }
  .hero-title {
    font-size: 28px;
    letter-spacing: 3px;
  }
}
</style>
