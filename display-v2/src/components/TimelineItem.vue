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
  padding-bottom: 48px;
  position: relative;
}

/* Node (stamp + ink track) */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
}

.node-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(194, 58, 43, 0.35);
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.timeline-item:hover .node-dot {
  transform: scale(1.18) rotate(-4deg);
}

.node-dot::after {
  content: '印';
  font-family: var(--font-display);
  font-size: 11px;
  color: #fff;
  font-weight: 900;
}

.node-line {
  flex: 1;
  width: 4px;
  background: linear-gradient(180deg, var(--accent), var(--border), var(--accent));
  margin-top: 10px;
  border-radius: 2px;
  opacity: 0.6;
}

.timeline-item:last-child .node-line {
  display: none;
}

/* Content card */
.timeline-content {
  flex: 1;
  padding: 32px 36px;
  margin-bottom: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.theme-real .timeline-content {
  border-top: 6px solid #2b1d12; /* Wood topper */
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
}

.theme-inkwash .timeline-content {
  border-top: 4px solid var(--accent); /* Cinnabar topper */
  border-radius: var(--radius-sm);
  background-image: radial-gradient(circle at 100% 0%, rgba(194,58,43,0.01) 20%, transparent 21%);
}

.timeline-item:hover .timeline-content {
  box-shadow: var(--card-shadow-hover);
}

.content-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 16px;
}

.dynasty-badge {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.badge-name {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  line-height: 1.2;
}

.badge-years {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
  font-weight: 600;
}

.dynasty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  text-align: justify;
}

/* Sections */
.content-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed var(--border-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.title-icon {
  font-family: var(--font-display);
  font-size: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  border-radius: 4px;
  line-height: 1;
  font-weight: 700;
}

.theme-inkwash .title-icon {
  border-radius: 2px;
}

/* Events */
.events-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 4px 0;
}

.event-year {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  min-width: 54px;
  flex-shrink: 0;
}

.event-title {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Poets */
.poets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.poet-chip {
  padding: 6px 18px;
  background: var(--bg-secondary);
  border-radius: 100px;
  font-size: 13px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid transparent;
}

.poet-chip:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}

.theme-inkwash .poet-chip {
  border-radius: 2px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
}

/* Poems */
.poems-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.poem-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.poem-row:hover {
  background: var(--bg-secondary);
  border-color: var(--border-light);
}

.theme-inkwash .poem-row:hover {
  background: rgba(194, 58, 43, 0.03);
  border-color: var(--accent-light);
}

.poem-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.poem-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}

.poem-row:hover .poem-arrow {
  transform: translateX(4px);
  color: var(--accent);
}

/* Inkwash adjustments */
.theme-inkwash .node-dot {
  border-color: var(--bg-primary);
}
</style>

