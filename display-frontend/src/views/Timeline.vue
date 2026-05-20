<template>
  <div class="timeline-page">
    <h1 class="page-title">朝代时间线</h1>
    <div class="timeline">
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import TimelineItem from '../components/TimelineItem.vue'

const timeline = ref([])

onMounted(async () => {
  timeline.value = await api.get('/timeline')
})
</script>

<style scoped>
.timeline-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  text-align: center;
  margin-bottom: 48px;
}
</style>
