<template>
  <div class="poet-detail" v-if="poet">
    <!-- Hero -->
    <div class="detail-hero">
      <div class="hero-back">
        <router-link to="/poets" class="back-link">← 返回诗人长廊</router-link>
      </div>

      <div class="hero-layout">
        <div class="hero-portrait">
          <div class="portrait-frame">
            <img :src="avatar" :alt="poet.name" class="portrait-img" />
          </div>
        </div>

        <div class="hero-info">
          <div class="info-dynasty" v-if="dynasty">{{ dynasty.name }}</div>
          <h1 class="info-name">{{ poet.name }}</h1>
          <div class="info-meta">
            <span v-if="poet.birthYear" class="meta-item">
              <span class="meta-label">生卒</span>
              {{ poet.birthYear }} — {{ poet.deathYear || '？' }}
            </span>
            <span v-if="poet.birthplace" class="meta-item">
              <span class="meta-label">籍贯</span>
              {{ poet.birthplace }}
            </span>
          </div>
          <div class="info-style" v-if="poet.style">
            <span class="style-label">诗词风格</span>
            <span class="style-text">{{ poet.style }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Biography -->
    <div class="detail-section" v-if="poet.biography">
      <h2 class="section-heading">生平简介</h2>
      <div class="bio-content">
        <p>{{ poet.biography }}</p>
      </div>
    </div>

    <!-- Poems -->
    <div class="detail-section" v-if="poems.length">
      <h2 class="section-heading">代表诗词</h2>
      <div class="poems-grid">
        <router-link
          v-for="poem in poems"
          :key="poem.id"
          :to="`/poems/${poem.id}`"
          class="poem-card card"
        >
          <h3 class="poem-title">{{ poem.title }}</h3>
          <p class="poem-preview">{{ poem.content?.substring(0, 80) }}…</p>
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
const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)

const avatar = computed(() =>
  isReal.value ? poet.value?.avatarUrl : (poet.value?.avatarAnimeUrl || poet.value?.avatarUrl)
)

onMounted(async () => {
  const data = await api.get(`/poets/${route.params.id}`)
  poet.value = data.poet
  poems.value = data.poems
  dynasty.value = data.dynasty
})
</script>

<style scoped>
.poet-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* Back link */
.detail-hero {
  padding-top: 32px;
}

.hero-back {
  margin-bottom: 32px;
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

/* Hero layout */
.hero-layout {
  display: flex;
  gap: 48px;
  align-items: center;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--border-light);
}

.hero-portrait {
  flex-shrink: 0;
}

.portrait-frame {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
}

.portrait-frame::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  opacity: 0.3;
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  flex: 1;
}

.info-dynasty {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 4px 12px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  margin-bottom: 12px;
}

.info-name {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  line-height: 1.2;
  margin-bottom: 16px;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 14px;
  color: var(--text-secondary);
}

.meta-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-right: 6px;
  letter-spacing: 1px;
}

.info-style {
  display: flex;
  align-items: center;
  gap: 8px;
}

.style-label {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.style-text {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

/* Sections */
.detail-section {
  margin-top: 48px;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
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

/* Biography */
.bio-content p {
  font-size: 15px;
  line-height: 2;
  color: var(--text-primary);
  text-indent: 2em;
}

/* Poems grid */
.poems-grid {
  display: grid;
  gap: 16px;
}

.poem-card {
  display: block;
  padding: 24px 28px;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  .hero-layout {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  .portrait-frame {
    width: 120px;
    height: 120px;
  }
  .info-name {
    font-size: 32px;
    letter-spacing: 4px;
  }
  .info-meta {
    justify-content: center;
  }
  .info-style {
    justify-content: center;
  }
}
</style>
