<template>
  <div class="timeline-item">
    <div class="timeline-node">
      <div class="node-dot"></div>
      <div class="node-line"></div>
    </div>

    <div class="timeline-content card">
      <div class="content-header">
        <div class="dynasty-badge">
          <span class="badge-name">{{ dynasty.name }}</span>
          <span class="badge-years">{{ dynasty.startYear }} — {{ dynasty.endYear }}</span>
        </div>
        <p v-if="dynasty.description" class="dynasty-desc">{{ dynasty.description }}</p>
      </div>

      <div v-if="events.length" class="content-section">
        <h3 class="section-title">
          <span class="title-icon">事</span>
          历史事件
        </h3>
        <div class="events-grid">
          <div v-for="event in events" :key="event.id" class="event-row">
            <span class="event-year">{{ event.year }}</span>
            <span class="event-title">{{ event.title }}</span>
          </div>
        </div>
      </div>

      <div v-if="poets.length" class="content-section">
        <h3 class="section-title">
          <span class="title-icon">人</span>
          代表诗人
        </h3>
        <div class="poets-row">
          <router-link v-for="poet in poets" :key="poet.id" :to="`/poets/${poet.id}`" class="poet-chip">
            {{ poet.name }}
          </router-link>
        </div>
      </div>

      <div v-if="poems.length" class="content-section">
        <h3 class="section-title">
          <span class="title-icon">诗</span>
          诗词作品
        </h3>
        <div class="poems-list">
          <router-link v-for="poem in poems" :key="poem.id" :to="`/poems/${poem.id}`" class="poem-row">
            <span class="poem-title">{{ poem.title }}</span>
            <span class="poem-arrow">→</span>
          </router-link>
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
  gap: 28px;
  margin-bottom: 0;
  padding-bottom: 40px;
  position: relative;
}

/* Node (dot + line) */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg-primary);
  box-shadow: 0 0 0 2px var(--accent);
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  margin-top: 28px;
}

.node-line {
  flex: 1;
  width: 1px;
  background: var(--border);
  margin-top: 8px;
}

.timeline-item:last-child .node-line {
  display: none;
}

/* Content card */
.timeline-content {
  flex: 1;
  padding: 28px 32px;
  margin-bottom: 0;
}

.content-header {
  margin-bottom: 24px;
}

.dynasty-badge {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.badge-name {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  line-height: 1.2;
}

.badge-years {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.dynasty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Sections */
.content-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  letter-spacing: 1px;
}

.title-icon {
  font-family: var(--font-display);
  font-size: 13px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 4px;
  line-height: 1;
}

/* Events */
.events-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
}

.event-year {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  min-width: 48px;
  flex-shrink: 0;
}

.event-title {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Poets */
.poets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.poet-chip {
  padding: 5px 16px;
  background: var(--bg-secondary);
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.25s ease;
  font-weight: 600;
  letter-spacing: 1px;
}

.poet-chip:hover {
  background: var(--accent);
  color: #fff;
}

/* Poems */
.poems-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.poem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.poem-row:hover {
  background: var(--bg-secondary);
}

.poem-title {
  font-size: 14px;
  font-weight: 600;
}

.poem-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.poem-row:hover .poem-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* Inkwash adjustments */
.theme-inkwash .node-dot {
  border-color: var(--bg-primary);
}

.theme-inkwash .title-icon {
  border-radius: 2px;
}
</style>
