<template>
  <div class="poem-detail" v-if="poem">
    <!-- Back -->
    <div class="detail-top">
      <button class="back-link" @click="$router.back()">← 返回</button>
    </div>

    <!-- Poem Header -->
    <div class="poem-header">
      <div class="header-dynasty" v-if="dynasty">{{ dynasty.name }}</div>
      <h1 class="poem-title">{{ poem.title }}</h1>
      <div class="header-meta">
        <router-link v-if="poet" :to="`/poets/${poet.id}`" class="meta-poet">{{ poet.name }}</router-link>
        <span v-if="spot" class="meta-spot">创作于
          <router-link :to="`/regions/${spot.region}`" class="spot-link">{{ spot.name }}</router-link>
        </span>
      </div>
    </div>

    <!-- Poem Body -->
    <div class="poem-body card">
      <div class="body-ornament top-left">「</div>
      <div class="body-ornament bottom-right">」</div>

      <div class="poem-text">
        <p v-for="(line, i) in poemLines" :key="i" class="poem-line"
           :style="{ animationDelay: `${i * 0.08}s` }">
          {{ line }}
        </p>
      </div>

      <button class="annotation-btn" @click="showAnnotation = !showAnnotation">
        <span class="btn-icon">{{ showAnnotation ? '合' : '注' }}</span>
        {{ showAnnotation ? '隐藏注解' : '显示注解' }}
      </button>

      <transition name="annotation-slide">
        <div v-if="showAnnotation && poem.annotation" class="annotation-panel">
          <h3 class="panel-title">注解</h3>
          <p class="panel-text">{{ poem.annotation }}</p>
        </div>
      </transition>
    </div>

    <!-- Background -->
    <div v-if="poem.background" class="detail-section">
      <h2 class="section-heading">创作背景</h2>
      <div class="background-content">
        <p>{{ poem.background }}</p>
      </div>
    </div>

    <!-- Media -->
    <div v-if="poem.videoUrl" class="detail-section">
      <h2 class="section-heading">诗词赏析视频</h2>
      <div class="media-wrap">
        <video :src="poem.videoUrl" controls class="video-player" />
      </div>
    </div>

    <div v-if="poem.audioUrl" class="detail-section">
      <h2 class="section-heading">诗词朗读</h2>
      <div class="audio-wrap">
        <audio :src="poem.audioUrl" controls class="audio-player" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const poem = ref(null)
const poet = ref(null)
const dynasty = ref(null)
const spot = ref(null)
const showAnnotation = ref(false)

const poemLines = computed(() => poem.value?.content?.split('\n').filter(l => l.trim()) || [])

onMounted(async () => {
  const data = await api.get(`/poems/${route.params.id}`)
  poem.value = data.poem
  poet.value = data.poet
  dynasty.value = data.dynasty
  spot.value = data.spot
})
</script>

<style scoped>
.poem-detail {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* Top bar */
.detail-top {
  padding: 24px 0;
}

.back-link {
  font-size: 13px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.2s;
  font-family: inherit;
}

.back-link:hover {
  color: var(--accent);
}

/* Header */
.poem-header {
  text-align: center;
  padding: 24px 0 48px;
}

.header-dynasty {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 3px 12px;
  border: 1px solid var(--accent);
  margin-bottom: 16px;
}

.poem-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 16px;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.meta-poet {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 2px;
  transition: opacity 0.2s;
}

.meta-poet:hover {
  opacity: 0.7;
}

.spot-link {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid var(--accent);
  transition: opacity 0.2s;
}

.spot-link:hover {
  opacity: 0.7;
}

/* Poem Body */
.poem-body {
  position: relative;
  padding: 48px 40px;
  text-align: center;
  margin-bottom: 48px;
}

.body-ornament {
  position: absolute;
  font-family: var(--font-display);
  font-size: 48px;
  color: var(--accent);
  opacity: 0.12;
  line-height: 1;
  user-select: none;
}

.body-ornament.top-left {
  top: 16px;
  left: 20px;
}

.body-ornament.bottom-right {
  bottom: 16px;
  right: 20px;
}

.poem-text {
  margin-bottom: 32px;
}

.poem-line {
  font-size: 20px;
  line-height: 2.2;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 4px;
  animation: lineReveal 0.6s ease both;
}

@keyframes lineReveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Annotation button */
.annotation-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}

.annotation-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-icon {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
}

/* Annotation panel */
.annotation-panel {
  margin-top: 24px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: left;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.panel-text {
  font-size: 14px;
  line-height: 2;
  color: var(--text-primary);
}

.annotation-slide-enter-active,
.annotation-slide-leave-active {
  transition: all 0.3s ease;
}
.annotation-slide-enter-from,
.annotation-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Sections */
.detail-section {
  margin-bottom: 40px;
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

.background-content p {
  font-size: 15px;
  line-height: 2;
  color: var(--text-primary);
  text-indent: 2em;
}

/* Media */
.media-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-width: 640px;
  display: block;
}

.audio-player {
  width: 100%;
  max-width: 400px;
}

/* Inkwash specific */
.theme-inkwash .poem-line {
  letter-spacing: 6px;
}

.theme-inkwash .body-ornament {
  opacity: 0.08;
}

@media (max-width: 768px) {
  .poem-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
  .poem-body {
    padding: 32px 20px;
  }
  .poem-line {
    font-size: 17px;
    letter-spacing: 2px;
  }
  .body-ornament {
    display: none;
  }
}
</style>
