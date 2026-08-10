<template>
  <section ref="rootRef" class="cultural-gallery" :class="{ 'anime-layout': isAnime }">
    <div class="section-header">
      <span class="section-tag">文化长廊</span>
      <h2 class="section-title">{{ isAnime ? '五脉流芳 · 齐鲁大观' : '不止诗词 · 五大文化板块' }}</h2>
      <p class="section-desc">
        {{ isAnime ? '节令风物、诗词歌赋、百工之艺、闾巷传说、食味梨园。' : '民俗节庆、古诗词、非遗工艺、民间文学、饮食戏曲，沿黄文化全景在此徐徐展开。' }}
      </p>
    </div>

    <div class="gallery-grid">
      <component
        :is="c.ready ? 'router-link' : 'div'"
        v-for="(c, i) in cards"
        :key="c.key"
        :to="c.ready ? c.route : undefined"
        class="gallery-card"
        :class="{ disabled: !c.ready }"
        :style="{ animationDelay: `${i * 0.07}s` }"
        :aria-disabled="!c.ready"
        data-reveal
      >
        <div class="gallery-card__seal">{{ c.seal }}</div>
        <h3 class="gallery-card__name">{{ c.name }}</h3>
        <p class="gallery-card__count">
          <template v-if="c.ready">{{ countOf(c.key) }} 条收录</template>
          <template v-else>筹备中</template>
        </p>
        <span v-if="!c.ready" class="gallery-card__badge">敬请期待</span>
      </component>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { useReveal } from '../../composables/useReveal'
import { CULTURAL_CATEGORIES } from '../../config/culturalCategories'
import api from '../../api'

const { isAnime } = useTheme()
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
    // 计数失败不阻塞入口渲染
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-tag {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  background: var(--accent, #9e2b25);
  padding: 5px 12px;
  border-radius: 2px;
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin: 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.gallery-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 36px 20px 28px;
  background: var(--card-bg, #fdfaf5);
  border: 1px solid var(--border, #e8e0d5);
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  animation: fadeSlideUp 0.5s ease both;
}

.gallery-card:hover:not(.disabled) {
  transform: translateY(-6px);
  border-color: var(--accent, #9e2b25);
  box-shadow: 0 16px 44px rgba(31, 26, 22, 0.1);
}

.gallery-card.disabled {
  cursor: default;
  opacity: 0.62;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.gallery-card__seal {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  background: var(--accent, #9e2b25);
  border-radius: 8px;
}

.anime-layout .gallery-card__seal {
  border-radius: 4px;
  box-shadow: 3px 3px 0 rgba(169, 50, 38, 0.25);
}

.gallery-card.disabled .gallery-card__seal {
  background: var(--text-muted, #6e5d52);
}

.gallery-card__name {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text-primary);
  margin: 0;
}

.gallery-card__count {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin: 0;
}

.gallery-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  letter-spacing: 1px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px dashed var(--border, #e8e0d5);
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .cultural-gallery {
    padding: 64px 20px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .section-title {
    letter-spacing: 3px;
  }
}
</style>
