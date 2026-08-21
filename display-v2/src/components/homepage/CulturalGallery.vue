<template>
  <section ref="rootRef" class="cultural-gallery">
    <!-- 五大板块 -->
    <div class="cg-grid">
      <component
        :is="c.ready ? 'router-link' : 'div'"
        v-for="(c, i) in cards"
        :key="c.key"
        :to="c.ready ? c.route : undefined"
        class="cg-card"
        :class="{ disabled: !c.ready }"
        :style="{ animationDelay: `${i * 0.1}s` }"
        :aria-disabled="!c.ready"
        data-reveal
      >
        <!-- 卡片图片区域：水墨风格（印章字 + 淡朱砂底） -->
        <div class="cg-card__image">
          <span class="cg-card__seal-char">{{ c.seal }}</span>
          <div class="cg-card__count">
            <template v-if="c.ready">{{ countOf(c.key) }} 条收录</template>
            <template v-else>筹备中</template>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="cg-card__content">
          <h3 class="cg-card__name">{{ c.name }}</h3>
          <p class="cg-card__desc">{{ c.desc }}</p>
          <div class="cg-card__tags">
            <span v-for="tag in c.tags" :key="tag" class="cg-card__tag">{{ tag }}</span>
          </div>
          <span v-if="c.ready" class="cg-card__arrow">探索更多 →</span>
          <span v-else class="cg-card__badge">敬请期待</span>
        </div>
      </component>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReveal } from '../../composables/useReveal'
import { CULTURAL_CATEGORIES } from '../../config/culturalCategories'
import api from '../../api'

const { reveal } = useReveal()

const rootRef = ref(null)
const cards = ref(CULTURAL_CATEGORIES)
const counts = ref({})

const countOf = (key) => counts.value[key] ?? '—'

const loadCounts = async () => {
  try {
    const stats = await api.get('/cultural/categories')
    const map = {}
    for (const s of stats) map[s.category] = s.count
    counts.value = map
  } catch (err) {
    console.warn('文化类别计数加载失败:', err)
  }
}

onMounted(async () => {
  await loadCounts()
  if (rootRef.value) reveal(rootRef.value)
})
</script>

<style scoped>
.cultural-gallery {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--sp-5) var(--sp-10);
}

/* 卡片网格 */
.cg-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--sp-5);
}

.cg-card {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: fadeSlideUp 0.6s ease both;
}

.cg-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--accent);
}

.cg-card.disabled {
  opacity: 0.6;
  cursor: default;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片图片区域：水墨风格（淡朱砂底 + 印章字） */
.cg-card__image {
  position: relative;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-faint);
}

.cg-card__seal-char {
  font-family: var(--font-display);
  font-size: 80px;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.2;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.cg-card:hover .cg-card__seal-char {
  transform: scale(1.1);
  opacity: 0.3;
}

.cg-card__count {
  position: absolute;
  bottom: var(--sp-4);
  right: var(--sp-4);
  padding: var(--sp-1) var(--sp-3);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 1px;
}

/* 卡片内容 */
.cg-card__content {
  padding: var(--sp-5);
}

.cg-card__name {
  font-family: var(--font-heading);
  font-size: var(--fs-lead);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: 3px;
}

.cg-card__desc {
  font-size: var(--fs-caption);
  line-height: 1.6;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin-bottom: var(--sp-4);
}

.cg-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--sp-4);
}

.cg-card__tag {
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.cg-card__arrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 1px;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
}

.cg-card:hover .cg-card__arrow {
  opacity: 1;
  transform: translateX(0);
}

.cg-card__badge {
  display: inline-block;
  padding: 4px 12px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .cg-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .cultural-gallery {
    padding: 0 var(--sp-4) var(--sp-9);
  }

  .cg-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-4);
  }

  .cg-card__image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .cg-grid {
    grid-template-columns: 1fr;
  }
}
</style>
