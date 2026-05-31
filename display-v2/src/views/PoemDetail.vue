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
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}

/* Top bar */
.detail-top {
  padding: 16px 0;
}

.back-link {
  font-size: 14px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.3s;
  font-family: inherit;
  font-weight: 600;
}

.back-link:hover {
  color: var(--accent);
}

/* Header */
.poem-header {
  text-align: center;
  padding: 32px 0 48px;
}

.header-dynasty {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  padding: 3px 14px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  margin-bottom: 20px;
}

.poem-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 20px;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 15px;
  color: var(--text-secondary);
}

.meta-poet {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 2px;
  transition: opacity 0.3s;
  border-bottom: 1px dashed var(--accent);
}

.meta-poet:hover {
  opacity: 0.7;
}

.spot-link {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1.5px solid var(--accent);
  font-weight: 600;
  transition: opacity 0.3s;
}

.spot-link:hover {
  opacity: 0.7;
}

/* Poem Body */
.poem-body {
  position: relative;
  padding: 60px 48px;
  text-align: center;
  margin-bottom: 56px;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.theme-real .poem-body {
  background-image: linear-gradient(rgba(184, 134, 11, 0.02) 1px, transparent 1px);
  background-size: 100% 3em;
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
}

.theme-inkwash .poem-body {
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(194,58,43,0.015) 30%, transparent 31%),
    radial-gradient(circle at 100% 100%, rgba(194,58,43,0.015) 30%, transparent 31%);
  border-radius: var(--radius-sm);
}

.body-ornament {
  position: absolute;
  font-family: var(--font-display);
  font-size: 64px;
  color: var(--accent);
  opacity: 0.16;
  line-height: 1;
  user-select: none;
  transition: all 0.3s;
}

.body-ornament.top-left {
  top: 24px;
  left: 28px;
}

.body-ornament.bottom-right {
  bottom: 24px;
  right: 28px;
}

.poem-text {
  margin-bottom: 40px;
}

.poem-line {
  font-size: 24px;
  line-height: 2.5;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 6px;
  animation: lineReveal 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) both;
}

@keyframes lineReveal {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* Annotation button */
.annotation-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  letter-spacing: 2px;
  font-weight: 600;
}

.annotation-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.btn-icon {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 900;
  color: var(--accent);
}

/* Annotation panel (Sayings of the Sages fold-out panel) */
.annotation-panel {
  margin-top: 32px;
  padding: 32px;
  background: #f7f2e8;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: left;
  position: relative;
  /* Concertina fold visual lines */
  background-image: 
    linear-gradient(90deg, rgba(61,43,31,0.03) 1px, transparent 1px),
    linear-gradient(180deg, rgba(61,43,31,0.02) 1px, transparent 1px);
  background-size: 40px 100%, 100% 24px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.04);
}

.theme-inkwash .annotation-panel {
  background: #f2ebd9;
  border: 1px double var(--accent);
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 16px;
  letter-spacing: 3px;
  border-bottom: 1.5px solid var(--accent);
  padding-bottom: 6px;
  display: inline-block;
}

.panel-text {
  font-size: 15px;
  line-height: 2.2;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.annotation-slide-enter-active,
.annotation-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.annotation-slide-enter-from,
.annotation-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
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

.background-content p {
  font-size: 16px;
  line-height: 2.2;
  color: var(--text-primary);
  text-indent: 2em;
  text-align: justify;
}

/* Media styling */
.media-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 8px solid #2b1d12; /* Mahogany frame */
  outline: 1px solid #d4a843;
  outline-offset: -3px;
  background: #000;
  max-width: 640px;
  margin: 0 auto;
}

.theme-inkwash .media-wrap {
  border: 2px solid var(--accent);
  outline: none;
  box-shadow: 0 4px 16px rgba(194, 58, 43, 0.1);
  border-radius: var(--radius-sm);
}

.video-player {
  width: 100%;
  max-width: 640px;
  display: block;
}

.audio-wrap {
  background: var(--bg-secondary);
  padding: 20px 24px;
  border-radius: var(--radius-md);
  border: 2px solid #2b1d12;
  box-shadow: var(--card-shadow);
  display: flex;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  justify-content: center;
  position: relative;
}

.theme-inkwash .audio-wrap {
  border: 1px solid var(--accent);
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

.audio-player {
  width: 100%;
}

/* Inkwash specific */
.theme-inkwash .poem-line {
  letter-spacing: 8px;
}

.theme-inkwash .body-ornament {
  opacity: 0.12;
}

@media (max-width: 768px) {
  .poem-title {
    font-size: 32px;
    letter-spacing: 4px;
  }
  .poem-body {
    padding: 40px 20px;
  }
  .poem-line {
    font-size: 18px;
    letter-spacing: 3px;
    line-height: 2.2;
  }
  .body-ornament {
    display: none;
  }
}
</style>

