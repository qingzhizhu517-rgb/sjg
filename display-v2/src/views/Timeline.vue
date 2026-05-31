<template>
  <div class="timeline-page">
    <div class="page-hero">
      <h1 class="page-title">朝代年轮</h1>
      <p class="page-desc">沿着历史的河流，见证诗与时代的交响</p>
      <div class="divider"></div>
    </div>

    <div class="timeline-container">
      <div class="timeline-track">
        <TimelineItem
          v-for="item in timeline"
          :key="item.dynasty.id"
          :dynasty="item.dynasty"
          :events="item.events"
          :poets="item.poets"
          :poems="item.poems"
        />
      </div>
    </div>

    <div v-if="!timeline.length && loaded" class="empty-state">
      <p>暂无朝代数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import TimelineItem from '../components/TimelineItem.vue'

const timeline = ref([])
const loaded = ref(false)

onMounted(async () => {
  timeline.value = await api.get('/timeline')
  loaded.value = true
})
</script>

<style scoped>
.timeline-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* Hero */
.page-hero {
  text-align: center;
  padding: 56px 0 40px;
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

/* Timeline container */
.timeline-container {
  padding-left: 24px;
}

.timeline-track {
  position: relative;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  font-size: 15px;
}
</style>
