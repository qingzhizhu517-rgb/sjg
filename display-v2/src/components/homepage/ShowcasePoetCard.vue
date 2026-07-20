<template>
  <article class="sc" :class="{ 'sc--featured': featured }" @click="$emit('click')">
    <div class="sc__top">
      <span class="sc__seal" aria-hidden="true">{{ sealChar }}</span>
      <span class="sc__meta">{{ dynastyName }} · {{ poemCount }} 篇传世</span>
      <span class="sc__link">查看详情 →</span>
    </div>

    <h3 class="sc__name">{{ poet.name }}</h3>

    <blockquote v-if="signature" class="sc__sig">
      <p class="sc__sig-text">「{{ signature.firstLine }}」</p>
      <cite class="sc__sig-cite">—— 《{{ signature.title }}》</cite>
    </blockquote>

    <div v-if="otherTitles.length" class="sc__others">
      <span class="sc__others-lbl">另有诗篇</span>
      <span v-for="t in otherTitles" :key="t" class="sc__other-pill">{{ t }}</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { pickSignaturePoem } from '../../utils/poem'

const props = defineProps({
  poet: { type: Object, required: true },
  poems: { type: Array, default: () => [] },
  dynastyName: { type: String, default: '' },
  featured: { type: Boolean, default: false },
})
defineEmits(['click'])

const sealChar = computed(() => props.poet?.name?.charAt(0) || '名')
const poemCount = computed(() => props.poems.length)

// 代表作：统一用 pickSignaturePoem，与 PoetAllList 卡片 / PoetDetail 三处一致
const signature = computed(() => pickSignaturePoem(props.poems))

const otherTitles = computed(() => {
  const sigId = signature.value?.id
  return props.poems
    .filter((p) => p && p.id !== sigId)
    .slice(0, 4)
    .map((p) => p.title)
    .filter(Boolean)
})
</script>

<style scoped>
.sc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 30px 32px 28px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.theme-real .sc {
  box-shadow: 0 1px 3px color-mix(in srgb, var(--text-primary) 0.04%, transparent);
}
.sc:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 14px 32px color-mix(in srgb, var(--text-primary) 0.12%, transparent);
}

.sc__top {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sc__seal {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9e2b25;
  color: #fff;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(-3deg);
  flex-shrink: 0;
}
.theme-real .sc__seal {
  background: #b23a2b;
}
.sc__meta {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 2px;
}
.sc__link {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s;
}
.sc:hover .sc__link {
  opacity: 1;
  transform: translateX(0);
}

.sc__name {
  font-family: var(--font-display);
  font-size: clamp(34px, 4vw, 48px);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 6px;
  line-height: 1.05;
  margin: 0;
}

.sc__sig {
  margin: 0;
  padding: 0;
  border: none;
  border-left: 2px solid var(--accent);
  padding-left: 16px;
}
.sc__sig-text {
  font-family: var(--font-heading);
  font-size: clamp(17px, 1.6vw, 21px);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.8;
  letter-spacing: 2px;
  margin: 0 0 6px 0;
}
.sc__sig-cite {
  font-size: 12px;
  font-style: italic;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.sc__others {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed var(--border-light);
}
.sc__others-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.sc__other-pill {
  font-size: 12px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 0.06%, transparent);
  border: 1px solid var(--border-light);
  padding: 3px 10px;
  border-radius: 100px;
  letter-spacing: 0.5px;
}
.theme-inkwash .sc__other-pill {
  background: color-mix(in srgb, var(--accent) 0.06%, transparent);
}

/* featured：横跨两列，横向布局，更大字 */
.sc--featured {
  grid-column: span 2;
  padding: 40px 48px 36px;
}
.sc--featured .sc__name {
  font-size: clamp(44px, 5vw, 64px);
  letter-spacing: 8px;
}
.sc--featured .sc__sig-text {
  font-size: clamp(20px, 2vw, 26px);
}

@media (max-width: 768px) {
  .sc { padding: 22px 20px; gap: 14px; }
  .sc--featured { grid-column: span 1; padding: 22px 20px; }
  .sc__name { letter-spacing: 4px; }
  .sc__link { opacity: 1; transform: none; }
}
</style>
