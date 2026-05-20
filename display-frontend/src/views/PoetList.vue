<template>
  <div class="poet-list-page">
    <div class="page-hero">
      <h1 class="page-title">诗人长廊</h1>
      <p class="page-desc">跨越千年的诗魂，在齐鲁大地留下不朽篇章</p>
      <div class="divider"></div>
    </div>

    <div class="page-toolbar">
      <div class="toolbar-inner">
        <div class="filter-group">
          <button
            class="filter-btn"
            :class="{ active: !dynastyFilter }"
            @click="dynastyFilter = ''; fetchPoets()"
          >全部</button>
          <button
            v-for="d in dynasties"
            :key="d.id"
            class="filter-btn"
            :class="{ active: dynastyFilter === d.id }"
            @click="dynastyFilter = d.id; fetchPoets()"
          >{{ d.name }}</button>
        </div>
        <span class="poet-count" v-if="poets.length">{{ poets.length }} 位诗人</span>
      </div>
    </div>

    <div class="poets-grid">
      <PoetCard
        v-for="(poet, i) in poets"
        :key="poet.id"
        :poet="poet"
        :dynasty="getDynastyName(poet.dynastyId)"
        :style="{ animationDelay: `${i * 0.05}s` }"
        class="poet-enter"
        @click="$router.push(`/poets/${poet.id}`)"
      />
    </div>

    <div v-if="!poets.length && loaded" class="empty-state">
      <p>暂无诗人数据</p>
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
const loaded = ref(false)

const fetchPoets = async () => {
  const params = { page: 1, size: 100 }
  if (dynastyFilter.value) params.dynastyId = dynastyFilter.value
  const data = await api.get('/poets', { params })
  poets.value = data.records
  loaded.value = true
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
  padding: 0 24px 80px;
}

/* Hero */
.page-hero {
  text-align: center;
  padding: 56px 0 32px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 8px;
  margin-bottom: 12px;
}

.page-desc {
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

/* Toolbar */
.page-toolbar {
  margin-bottom: 36px;
  position: sticky;
  top: var(--nav-height);
  z-index: 50;
  background: var(--bg-primary);
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}

.filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.poet-count {
  font-size: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Grid */
.poets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.poet-enter {
  animation: fadeSlideUp 0.5s ease both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 15px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
  .poets-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .toolbar-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
