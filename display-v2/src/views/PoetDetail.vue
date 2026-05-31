<template>
  <div class="poet-detail" :class="{ 'anime-layout': isAnime }" v-if="poet">
    <!-- Real Layout (original 2-column or slightly styled) -->
    <div class="real-container" v-if="isReal">
      <div class="detail-back">
        <router-link to="/poets" class="back-link">← 返回诗人长廊</router-link>
      </div>

      <div class="poet-detail-container">
        <!-- Left Column: Portrait & Seals -->
        <aside class="poet-left-col">
          <div class="portrait-frame card">
            <img :src="avatar" :alt="poet.name" class="portrait-img" />
            <div class="frame-border-decor"></div>
          </div>
          
          <div class="poet-quick-info card">
            <h1 class="poet-name">{{ poet.name }}</h1>
            <div class="info-dynasty" v-if="dynasty">{{ dynasty.name }}</div>
            
            <div class="quick-meta-list">
              <div class="meta-row" v-if="poet.birthYear">
                <span class="meta-tag">生卒</span>
                <span class="meta-val">{{ poet.birthYear }} — {{ poet.deathYear || '？' }}</span>
              </div>
              <div class="meta-row" v-if="poet.birthplace">
                <span class="meta-tag">籍贯</span>
                <span class="meta-val">{{ poet.birthplace }}</span>
              </div>
            </div>

            <div class="poet-seal-wrap" v-if="poet.style">
              <div class="cinnabar-seal">{{ poet.style }}</div>
            </div>
          </div>
        </aside>

        <!-- Right Column: Biography & Thread-bound Book Style TOC -->
        <section class="poet-right-col">
          <!-- Biography -->
          <div class="biography-section card" v-if="poet.biography">
            <h2 class="section-heading">生平简介</h2>
            <div class="bio-content ink-bleed-effect">
              <p>{{ poet.biography }}</p>
            </div>
          </div>

          <!-- Representative Poems -->
          <div class="poems-section card" v-if="poems.length">
            <h2 class="section-heading">代表诗词</h2>
            
            <div class="toc-book-list">
              <router-link
                v-for="(poem, index) in poems"
                :key="poem.id"
                :to="`/poems/${poem.id}`"
                class="toc-item hover-lift"
              >
                <div class="toc-lead">
                  <span class="toc-index">卷 {{ index + 1 }}</span>
                  <span class="toc-title">{{ poem.title }}</span>
                </div>
                <div class="toc-dots"></div>
                <div class="toc-preview">{{ poem.content?.split('\n')[0] }}…</div>
                <span class="toc-action">阅览全文 →</span>
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Anime Layout (诗人详情页.png replica) -->
    <div class="anime-container" v-else>
      <div class="detail-back">
        <router-link to="/poets" class="back-link">← 返回诗人长廊</router-link>
      </div>

      <div class="poet-split-layout">
        <!-- Left Column: Big Portrait Cover -->
        <aside class="poet-cover-col animate-slide-in">
          <div class="poet-big-portrait-wrap card">
            <img :src="avatar" :alt="poet.name" class="poet-big-portrait" />
            <div class="cover-calligraphy-overlay">
              <div class="calligraphy-text-vertical">{{ getPoetData(poet.name).verticalPoetry }}</div>
              <div class="calligraphy-signature">
                {{ poet.name }} <span class="signature-seal">印</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Column: Timeline & Works -->
        <section class="poet-details-col">
          <div class="poet-main-header">
            <h1 class="poet-title-large">
              {{ poet.name }}
              <span class="title-seal">印</span>
            </h1>
            <p class="poet-subtitle">{{ getPoetData(poet.name).impact?.substring(0, 32) }}…</p>
          </div>

          <!-- Quick Meta Grid -->
          <div class="poet-meta-grid">
            <div class="meta-grid-cell">
              <span class="cell-label">字</span>
              <span class="cell-val">{{ getPoetData(poet.name).zi || '—' }}</span>
            </div>
            <div class="meta-grid-cell">
              <span class="cell-label">号</span>
              <span class="cell-val">{{ getPoetData(poet.name).hao || '—' }}</span>
            </div>
            <div class="meta-grid-cell">
              <span class="cell-label">生卒年</span>
              <span class="cell-val">{{ getPoetData(poet.name).years || '—' }}</span>
            </div>
            <div class="meta-grid-cell">
              <span class="cell-label">籍贯</span>
              <span class="cell-val">{{ getPoetData(poet.name).place || '—' }}</span>
            </div>
          </div>

          <!-- Biography Section -->
          <div class="poet-intro-block">
            <h3 class="poet-block-title">诗人简介</h3>
            <p class="intro-paragraph">{{ poet.biography }}</p>
          </div>

          <!-- Timeline Milestones -->
          <div class="poet-timeline-block" v-if="getPoetData(poet.name).milestones">
            <h3 class="poet-block-title">生平经历</h3>
            <div class="horizontal-timeline-wrapper">
              <div class="horizontal-timeline-track"></div>
              <div class="horizontal-timeline-nodes">
                <div 
                  v-for="ms in getPoetData(poet.name).milestones" 
                  :key="ms.year"
                  class="timeline-milestone-node"
                >
                  <div class="milestone-dot-box">
                    <div class="milestone-dot"></div>
                  </div>
                  <div class="milestone-text">
                    <span class="milestone-year">{{ ms.year }}</span>
                    <span class="milestone-title">{{ ms.title }}</span>
                    <p class="milestone-desc">{{ ms.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Representative Works -->
          <div class="poet-works-block" v-if="getPoetData(poet.name).works">
            <h3 class="poet-block-title">代表作品</h3>
            <div class="works-cards-grid">
              <div 
                v-for="work in getPoetData(poet.name).works" 
                :key="work.title"
                class="work-quote-card card hover-lift"
              >
                <h4 class="work-title">《{{ work.title }}》</h4>
                <p class="work-quote">“{{ work.quote }}”</p>
              </div>
            </div>
          </div>

          <!-- Historical Impact -->
          <div class="poet-impact-block" v-if="getPoetData(poet.name).impact">
            <h3 class="poet-block-title">历史影响</h3>
            <p class="impact-paragraph">{{ getPoetData(poet.name).impact }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useImage } from '../composables/useImage'
import { mockPoets } from '../config/mockDetailData'
import api from '../api'

const route = useRoute()
const { isReal, isAnime } = useTheme()
const { getImageUrl } = useImage()
const poet = ref(null)
const poems = ref([])
const dynasty = ref(null)

const avatar = computed(() => {
  if (!poet.value) return ''
  const url = isAnime.value ? poet.value.avatarAnimeUrl || poet.value.avatarUrl : poet.value.avatarUrl
  return getImageUrl(url, isAnime.value)
})

const getPoetData = (name) => {
  return mockPoets[name] || {
    zi: '—',
    hao: '—',
    years: '—',
    place: '—',
    verticalPoetry: '大江东去，浪淘尽，千古风流人物。',
    milestones: [],
    works: [],
    impact: ''
  }
}

onMounted(async () => {
  const data = await api.get(`/poets/${route.params.id}`)
  poet.value = data.poet
  poems.value = data.poems
  dynasty.value = data.dynasty
})
</script>

<style scoped>
.poet-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 40px 80px;
}

.detail-back {
  margin-bottom: 24px;
  text-align: left;
}

.back-link {
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--accent);
}

/* 2-Column Layout */
.poet-detail-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  align-items: start;
}

/* Left Column Styling */
.poet-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.portrait-frame {
  position: relative;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.theme-real .portrait-frame {
  border: 6px solid #2b1d12;
  outline: 1px solid #d4a843;
  outline-offset: -4px;
  border-radius: var(--radius-md);
}

.portrait-img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}

.poet-quick-info {
  padding: 24px;
  text-align: center;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.poet-name {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: 4px;
}

.info-dynasty {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 10px;
  border-radius: 2px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.quick-meta-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px dashed var(--border-light);
  border-bottom: 1px dashed var(--border-light);
  padding: 16px 0;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  font-size: 13px;
  line-height: 1.5;
}

.meta-tag {
  width: 60px;
  color: var(--text-muted);
  font-weight: 600;
}

.meta-val {
  flex: 1;
  color: var(--text-primary);
  font-weight: 600;
}

.poet-seal-wrap {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

/* Right Column Styling */
.poet-right-col {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.biography-section,
.poems-section {
  padding: 40px;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.theme-inkwash .biography-section,
.theme-inkwash .poems-section {
  background-image: radial-gradient(circle at 100% 150%, rgba(194,58,43,0.02) 24%, transparent 25%);
}

.bio-content p {
  font-size: 16px;
  line-height: 2;
  color: var(--text-primary);
  text-indent: 2em;
  text-justify: inter-character;
  letter-spacing: 0.5px;
}

/* TOC book list style */
.toc-book-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}

.toc-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px dashed var(--border-light);
  text-decoration: none;
  transition: all 0.3s;
}

.toc-item:hover {
  background: rgba(184, 134, 11, 0.03);
  border-bottom-color: var(--accent);
}

.theme-inkwash .toc-item:hover {
  background: rgba(194, 58, 43, 0.03);
  border-bottom-color: var(--accent);
}

.toc-lead {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.toc-index {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.toc-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.toc-dots {
  flex: 1;
  border-bottom: 1px dotted var(--border);
  margin: 0 16px;
  opacity: 0.6;
}

.toc-preview {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-action {
  font-size: 13px;
  color: var(--accent);
  font-weight: 700;
  margin-left: 20px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.toc-item:hover .toc-action {
  transform: translateX(4px);
}

/* Anime Layout (诗人详情页.png replica) */
.poet-split-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 48px;
  align-items: start;
}

.poet-cover-col {
  width: 100%;
}

.poet-big-portrait-wrap {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}

.poet-big-portrait {
  width: 100%;
  height: 520px;
  object-fit: cover;
  display: block;
  opacity: 0.95;
}

.cover-calligraphy-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
  color: #fff;
  text-align: left;
}

.calligraphy-text-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-heading);
  font-size: 20px;
  line-height: 1.5;
  letter-spacing: 6px;
  color: #faf6ee;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
}

.calligraphy-signature {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
  letter-spacing: 2px;
}

.signature-seal {
  background: var(--accent);
  color: #fff;
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 2px;
  font-family: var(--font-display);
  transform: rotate(-4deg);
}

/* Right details column */
.poet-details-col {
  display: flex;
  flex-direction: column;
  gap: 32px;
  text-align: left;
}

.poet-main-header {
  border-bottom: 2px solid var(--border);
  padding-bottom: 16px;
}

.poet-title-large {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-seal {
  background: var(--accent);
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 2px;
  font-family: var(--font-display);
  letter-spacing: 1px;
  transform: rotate(-3deg);
}

.poet-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 600;
}

/* Meta grid four sections */
.poet-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.meta-grid-cell {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 16px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
}

.cell-val {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 700;
}

/* Content blocks */
.poet-block-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  border-left: 3px solid var(--accent);
  padding-left: 10px;
  letter-spacing: 1px;
}

.intro-paragraph,
.impact-paragraph {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-align: justify;
}

/* Horizontal Timeline */
.poet-timeline-block {
  width: 100%;
}

.horizontal-timeline-wrapper {
  position: relative;
  padding: 24px 0;
  margin-top: 12px;
}

.horizontal-timeline-track {
  position: absolute;
  top: 36px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--border);
  z-index: 1;
}

.horizontal-timeline-nodes {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.timeline-milestone-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.milestone-dot-box {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.milestone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px #fff, 0 0 0 5px var(--accent);
  transition: transform 0.3s;
}

.timeline-milestone-node:hover .milestone-dot {
  transform: scale(1.3);
}

.milestone-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 4px;
}

.milestone-year {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.milestone-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
}

.milestone-desc {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 6px;
  text-align: justify;
}

/* Works cards */
.works-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.work-quote-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 20px;
  border-radius: 4px;
  text-align: left;
}

.work-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}

.work-quote {
  font-size: 13px;
  font-style: italic;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 900px) {
  .poet-detail-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .poet-left-col {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
    align-items: center;
  }
  .portrait-img {
    aspect-ratio: 1;
  }
  .poet-quick-info {
    text-align: left;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .poet-seal-wrap {
    justify-content: flex-start;
  }
  .poet-split-layout {
    grid-template-columns: 1fr;
  }
  .poet-big-portrait {
    height: 380px;
  }
  .horizontal-timeline-nodes {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .horizontal-timeline-track {
    display: none;
  }
  .timeline-milestone-node {
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
  }
  .milestone-dot-box {
    margin-bottom: 0;
  }
  .milestone-text {
    text-align: left;
    align-items: flex-start;
  }
  .works-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .poet-left-col {
    grid-template-columns: 1fr;
  }
  .biography-section,
  .poems-section {
    padding: 24px;
  }
  .toc-dots,
  .toc-preview {
    display: none;
  }
  .toc-item {
    justify-content: space-between;
  }
  .poet-meta-grid {
    grid-template-columns: 1fr 1fr;
  }
  .poet-detail {
    padding: 24px 20px;
  }
}
</style>


