<template>
  <article class="fpoet hover-lift" @click="$emit('click')">
    <div class="fpoet__avatar">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="poet.name" @error="onImgError" />
      <span v-else class="fpoet__stamp">{{ poet.name ? poet.name.charAt(0) : '文' }}</span>
    </div>
    <div class="fpoet__body">
      <div class="fpoet__title-row">
        <h3 class="fpoet__name">{{ poet.name }}</h3>
        <span class="fpoet__dyn">{{ dynastyName }}</span>
      </div>
      <p v-if="poet.biography" class="fpoet__bio">{{ poet.biography }}</p>
      <blockquote v-else-if="poet.signaturePoem" class="fpoet__sig">
        「{{ poet.signaturePoem.firstLine }}」
        <cite v-if="poet.signaturePoem.title">《{{ poet.signaturePoem.title }}》</cite>
      </blockquote>
      <p v-else class="fpoet__bio fpoet__bio--empty">生平待考，然其诗已传。</p>
      <div class="fpoet__foot">
        <span class="fpoet__count">{{ poet.poemCount || 0 }} 篇传世</span>
        <span class="fpoet__arrow">查看详情 →</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useImage } from '../../composables/useImage'

const props = defineProps({
  // poet: 已 enrichment，含 signaturePoem / poemCount
  poet: { type: Object, required: true },
  dynastyName: { type: String, default: '' },
})
defineEmits(['click'])

const { getImageUrl } = useImage()
const avatarUrl = computed(() =>
  props.poet.avatarUrl ? getImageUrl(props.poet.avatarUrl, false) : '',
)

const onImgError = (e) => {
  e.target.style.display = 'none'
  const stamp = e.target.parentElement.querySelector('.fpoet__stamp')
  if (stamp) stamp.style.display = 'flex'
}
</script>

<style scoped>
.fpoet {
  display: flex;
  gap: 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 4px;
  padding: 22px;
  cursor: pointer;
  text-align: left;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.fpoet__avatar {
  flex-shrink: 0;
  width: 88px;
  height: 116px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--bg-primary), #e8e0cc);
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-inkwash .fpoet__avatar {
  background: linear-gradient(135deg, #2a2520, var(--text-primary));
}
.fpoet__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.fpoet:hover .fpoet__avatar img {
  transform: scale(1.05);
}
.fpoet__stamp {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 900;
  color: #fff;
  background: #9e2b25;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-real .fpoet__stamp {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.fpoet__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.fpoet__title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.fpoet__name {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0;
  line-height: 1.1;
}
.fpoet__dyn {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
  padding: 2px 8px;
  background: color-mix(in srgb, var(--accent) 0.08%, transparent);
  border-radius: 2px;
}
.theme-inkwash .fpoet__dyn {
  background: color-mix(in srgb, var(--accent) 0.08%, transparent);
}
.fpoet__bio {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.fpoet__bio--empty {
  font-style: italic;
  color: var(--text-muted);
}
.fpoet__sig {
  margin: 0 0 10px 0;
  padding: 0;
  border: none;
  flex: 1;
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.8;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.fpoet__sig cite {
  font-size: 11px;
  font-style: italic;
  color: var(--text-muted);
  font-weight: 400;
}
.fpoet__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  font-size: 11px;
  letter-spacing: 1px;
}
.fpoet__count {
  color: var(--text-muted);
  font-weight: 600;
}
.fpoet__arrow {
  color: var(--accent);
  font-weight: 700;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s;
}
.fpoet:hover .fpoet__arrow {
  opacity: 1;
  transform: translateX(0);
}
.hover-lift:hover {
  border-color: var(--accent);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
}
@media (max-width: 640px) {
  .fpoet__avatar { width: 72px; height: 96px; }
  .fpoet__stamp { font-size: 32px; }
  .fpoet__name { font-size: 19px; }
}
</style>
