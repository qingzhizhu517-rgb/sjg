<template>
  <div class="poet-list-page">
    <h1 class="page-title">诗人长廊</h1>
    <div class="filter-bar">
      <select v-model="dynastyFilter" @change="fetchPoets" class="dynasty-select">
        <option value="">全部朝代</option>
        <option v-for="d in dynasties" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>
    <div class="poet-grid">
      <PoetCard
        v-for="poet in poets"
        :key="poet.id"
        :poet="poet"
        :dynasty="getDynastyName(poet.dynastyId)"
        @click="$router.push(`/poets/${poet.id}`)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import PoetCard from '../components/PoetCard.vue'

const poets = ref([])
const dynasties = ref([])
const dynastyFilter = ref('')

const fetchPoets = async () => {
  const params = { page: 1, size: 100 }
  if (dynastyFilter.value) params.dynastyId = dynastyFilter.value
  const data = await api.get('/poets', { params })
  poets.value = data.records
}

const getDynastyName = (id) => dynasties.value.find(d => d.id === id)?.name || ''

onMounted(async () => {
  const timeline = await api.get('/timeline')
  dynasties.value = timeline.map(t => t.dynasty)
  fetchPoets()
})
</script>

<style scoped>
.poet-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: var(--text-primary);
}
.filter-bar {
  text-align: center;
  margin-bottom: 32px;
}
.dynasty-select {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
  font-size: 14px;
}
.poet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}
</style>
