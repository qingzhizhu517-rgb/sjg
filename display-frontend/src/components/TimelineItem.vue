<template>
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content card">
      <h2 class="dynasty-name">{{ dynasty.name }} ({{ dynasty.startYear }} - {{ dynasty.endYear }})</h2>
      <p v-if="dynasty.description" class="dynasty-desc">{{ dynasty.description }}</p>

      <div v-if="events.length" class="section">
        <h3>历史事件</h3>
        <div v-for="event in events" :key="event.id" class="event-item">
          <span class="event-year">{{ event.year }}</span>
          <span class="event-title">{{ event.title }}</span>
        </div>
      </div>

      <div v-if="poets.length" class="section">
        <h3>代表诗人</h3>
        <div class="poet-tags">
          <span v-for="poet in poets" :key="poet.id" class="poet-tag"
            @click="$router.push(`/poets/${poet.id}`)">
            {{ poet.name }}
          </span>
        </div>
      </div>

      <div v-if="poems.length" class="section">
        <h3>诗词作品</h3>
        <div v-for="poem in poems" :key="poem.id" class="poem-link"
          @click="$router.push(`/poems/${poem.id}`)">
          {{ poem.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dynasty: Object,
  events: { type: Array, default: () => [] },
  poets: { type: Array, default: () => [] },
  poems: { type: Array, default: () => [] },
})
</script>

<style scoped>
.timeline-item {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: -40px;
  width: 2px;
  background: var(--border);
}
.timeline-item:last-child::before { display: none; }
.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  z-index: 1;
}
.timeline-content {
  flex: 1;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.dynasty-name {
  font-family: var(--font-heading);
  font-size: 24px;
  margin-bottom: 8px;
}
.dynasty-desc { color: var(--text-secondary); margin-bottom: 16px; }
.section { margin-top: 16px; }
.section h3 {
  font-size: 16px;
  color: var(--accent);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.event-item { margin-bottom: 6px; }
.event-year {
  color: var(--accent);
  font-weight: bold;
  margin-right: 8px;
}
.poet-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.poet-tag {
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.poet-tag:hover { background: var(--accent); color: #fff; }
.poem-link {
  color: var(--accent-dark);
  cursor: pointer;
  margin-bottom: 4px;
  text-decoration: underline;
}
</style>
