<template>
  <section ref="rootRef" class="cultural-gallery">
    <!-- 五大板块 -->
    <div class="cg-grid">
      <component
        :is="c.ready ? 'router-link' : 'div'"
        v-for="c in cards"
        :key="c.key"
        :to="c.ready ? atlasLink(c.route, route) : undefined"
        class="cg-card"
        :class="{ disabled: !c.ready }"
        :aria-disabled="!c.ready"
        data-reveal
      >
        <!-- 类别图形与真实计数；装饰不参与链接名称。 -->
        <div class="cg-card__image">
          <AtlasGlyph :kind="c.glyph" class="cg-card__glyph" />
          <div class="cg-card__count">
            <template v-if="c.ready">{{ countOf(c.key) }} {{ isAtlasPreview(route) ? '项样本' : '条收录' }}</template>
            <template v-else>筹备中</template>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="cg-card__content">
          <h3 class="cg-card__name">{{ c.name }}</h3>
          <p class="cg-card__desc">{{ c.desc }}</p>
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
import { useRoute } from 'vue-router'
import { atlasLink, isAtlasPreview } from '../../config/atlasPreview'
import { culturePreviewItems } from '../../config/culturePreview'
import AtlasGlyph from '../AtlasGlyph.vue'
const route = useRoute()

const { reveal } = useReveal()

const rootRef = ref(null)
const cards = ref(CULTURAL_CATEGORIES)
const counts = ref({})

const countOf = (key) => counts.value[key] ?? '—'

const loadCounts = async () => {
  if (isAtlasPreview(route)) { counts.value = Object.fromEntries(CULTURAL_CATEGORIES.map(c => [c.key, c.key === 'poem' ? 9 : culturePreviewItems.filter(i => i.category === c.key).length])); return }
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
  width: 100%;
  margin: 0 auto;
}

.cg-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--card-gap);
}

.cg-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-5);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
  transition: border-color .2s ease, background-color .2s ease, transform .2s ease;
}

.cg-card:hover:not(.disabled),
.cg-card:focus-visible {
  border-color: var(--accent);
  background: var(--bg-primary);
}

.cg-card:active:not(.disabled) { transform: translateY(1px); }
.cg-card.disabled { opacity: .6; }

.cg-card__image {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.cg-card__glyph {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  color: var(--reading-green);
}

.cg-card__count {
  font-size: var(--fs-meta);
  line-height: 1.5;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cg-card__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cg-card__name {
  margin: 0 0 var(--sp-2);
  font-family: var(--font-heading);
  font-size: var(--fs-card-title);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.cg-card__desc {
  margin: 0;
  font-size: var(--fs-reading);
  line-height: 1.7;
  color: var(--text-secondary);
  text-wrap: pretty;
  overflow-wrap: anywhere;
}

.cg-card__arrow,
.cg-card__badge {
  min-height: 44px;
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: var(--sp-2);
  font-size: var(--fs-body-sm);
  line-height: 1.5;
  color: var(--reading-green);
}
.cg-card__badge { color: var(--text-secondary); }

/* 平板两列，奇数项改为通栏图文，不留孤立半行。 */
@media (min-width: 768px) and (max-width: 1279px) {
  .cg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cg-card:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 144px minmax(0, 1fr);
    gap: var(--sp-5);
  }
  .cg-card:last-child:nth-child(odd) .cg-card__image {
    flex-direction: column;
    justify-content: center;
    gap: var(--sp-3);
    border-right: 1px solid var(--border-light);
  }
  .cg-card:last-child:nth-child(odd) .cg-card__glyph {
    flex-basis: auto;
    width: 56px;
    height: 56px;
  }
}

/* 手机紧凑图文行；文字完整换行，入口始终可见。 */
@media (max-width: 767px) {
  .cg-grid { grid-template-columns: minmax(0, 1fr); gap: var(--sp-4); }
  .cg-card {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    gap: var(--sp-4);
    padding: var(--sp-4);
  }
  .cg-card__image {
    flex-direction: column;
    justify-content: flex-start;
    gap: var(--sp-3);
    padding-top: var(--sp-1);
  }
  .cg-card__glyph { flex-basis: auto; width: 48px; height: 48px; }
  .cg-card__count { font-size: var(--fs-meta); }
  .cg-card__name { letter-spacing: .5px; }
}

@media (prefers-reduced-motion: reduce) {
  .cg-card { transition: none; }
  .cg-card:active:not(.disabled) { transform: none; }
}
</style>
