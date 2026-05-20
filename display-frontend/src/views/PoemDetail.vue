<template>
  <div class="poem-detail" v-if="poem">
    <div class="poem-header">
      <h1>{{ poem.title }}</h1>
      <div class="poem-meta">
        <span v-if="poet" @click="$router.push(`/poets/${poet.id}`)" class="poet-link">{{ poet.name }}</span>
        <span v-if="dynasty" class="dynasty-tag">{{ dynasty.name }}</span>
        <span v-if="spot" class="spot-link" @click="$router.push(`/spots/${spot.id}`)">{{ spot.name }}</span>
      </div>
    </div>

    <div class="poem-content">
      <div class="poem-text">
        <p v-for="(line, i) in poemLines" :key="i" class="poem-line">
          {{ line }}
        </p>
      </div>
      <button class="annotation-toggle" @click="showAnnotation = !showAnnotation">
        {{ showAnnotation ? '隐藏注解' : '显示注解' }}
      </button>
      <div v-if="showAnnotation && poem.annotation" class="annotation-box">
        <h3>注解</h3>
        <p>{{ poem.annotation }}</p>
      </div>
    </div>

    <div v-if="poem.background" class="poem-background">
      <h2>创作背景</h2>
      <p>{{ poem.background }}</p>
    </div>

    <div v-if="poem.videoUrl" class="poem-media">
      <h2>诗词赏析视频</h2>
      <video :src="poem.videoUrl" controls class="media-player" />
    </div>

    <div v-if="poem.audioUrl" class="poem-media">
      <h2>诗词朗读</h2>
      <audio :src="poem.audioUrl" controls class="audio-player" />
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
  padding: 40px 20px;
}
.poem-header {
  text-align: center;
  margin-bottom: 40px;
}
.poem-header h1 {
  font-family: var(--font-heading);
  font-size: 36px;
  margin-bottom: 12px;
}
.poem-meta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.poet-link {
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
}
.dynasty-tag {
  background: var(--accent);
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.spot-link {
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: underline;
}
.poem-content {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 32px;
}
.poem-text {
  text-align: center;
  font-size: 20px;
  line-height: 2;
  font-family: var(--font-body);
}
.poem-line { margin-bottom: 4px; }
.annotation-toggle {
  display: block;
  margin: 20px auto 0;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--accent);
}
.annotation-box {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 4px;
}
.annotation-box h3 { font-size: 16px; margin-bottom: 8px; }
.poem-background, .poem-media { margin-bottom: 32px; }
.poem-background h2, .poem-media h2 {
  font-family: var(--font-heading);
  font-size: 22px;
  margin-bottom: 12px;
}
.poem-background p { line-height: 1.8; }
.media-player { width: 100%; max-width: 600px; border-radius: 8px; }
.audio-player { width: 100%; max-width: 400px; }
</style>
