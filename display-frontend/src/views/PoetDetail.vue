<template>
  <div class="poet-detail" v-if="poet">
    <div class="poet-header">
      <img :src="avatar" :alt="poet.name" class="poet-avatar" />
      <div class="poet-meta">
        <h1>{{ poet.name }}</h1>
        <p class="dynasty">{{ dynasty?.name }}</p>
        <p class="years" v-if="poet.birthYear">{{ poet.birthYear }} - {{ poet.deathYear || '?' }}</p>
        <p class="birthplace" v-if="poet.birthplace">籍贯: {{ poet.birthplace }}</p>
        <p class="style" v-if="poet.style">风格: {{ poet.style }}</p>
      </div>
    </div>
    <div class="poet-bio" v-if="poet.biography">
      <h2>生平简介</h2>
      <p>{{ poet.biography }}</p>
    </div>
    <div class="poet-poems" v-if="poems.length">
      <h2>代表诗词</h2>
      <div class="poem-list">
        <div v-for="poem in poems" :key="poem.id" class="poem-item" @click="$router.push(`/poems/${poem.id}`)">
          <h3>{{ poem.title }}</h3>
          <p class="poem-preview">{{ poem.content?.substring(0, 60) }}...</p>
        </div>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.poet-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
  align-items: center;
}
.poet-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}
.poet-meta h1 {
  font-family: var(--font-heading);
  font-size: 36px;
  margin-bottom: 8px;
}
.dynasty { color: var(--accent); font-size: 18px; }
.years, .birthplace, .style { color: var(--text-secondary); margin-top: 4px; }
.poet-bio, .poet-poems { margin-bottom: 40px; }
.poet-bio h2, .poet-poems h2 {
  font-family: var(--font-heading);
  font-size: 24px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}
.poet-bio p { line-height: 1.8; color: var(--text-primary); }
.poem-list { display: grid; gap: 16px; }
.poem-item {
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.poem-item:hover { transform: translateX(4px); border-color: var(--accent); }
.poem-item h3 { font-size: 18px; margin-bottom: 4px; }
.poem-preview { color: var(--text-secondary); font-size: 14px; }
</style>
