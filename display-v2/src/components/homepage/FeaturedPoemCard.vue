<template>
  <article class="poem-card hover-lift" tabindex="0" role="link" @click="$emit('click')" @keydown.enter="$emit('click')">
    <span class="poem-card__seal" aria-hidden="true">印</span>
    <blockquote class="poem-card__quote">
      <p class="poem-card__text">「{{ poem.line || poem.content }}」</p>
    </blockquote>
    <div v-if="poem.sentimentTags && poem.sentimentTags.length" class="poem-card__tags">
      <span v-for="tag in poem.sentimentTags.slice(0, 5)" :key="tag" class="poem-card__tag">{{ tag }}</span>
    </div>
    <div class="poem-card__meta">
      <span class="poem-card__author">—— {{ poem.poetName || '佚名' }}<span v-if="poem.dynastyName"> · {{ poem.dynastyName }}</span></span>
      <span v-if="poem.title" class="poem-card__title">《{{ poem.title }}》</span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  // poem: { id, line, content?, title, poetName, dynastyName, sentimentTags[] }
  poem: { type: Object, required: true },
})
defineEmits(['click'])
</script>

<style scoped>
.poem-card {
  position: relative;
  background: linear-gradient(135deg, #fdf8ec 0%, #f4eed8 100%);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 4px;
  padding: 28px 30px 22px;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.theme-inkwash .poem-card {
  background: linear-gradient(135deg, #2a2520 0%, #1f1c18 100%);
  border-left-color: var(--accent);
}
.poem-card__seal {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(158, 43, 37, 0.12);
  border: 1px solid rgba(158, 43, 37, 0.4);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 900;
  border-radius: 2px;
  transform: rotate(-3deg);
}
.theme-inkwash .poem-card__seal {
  color: var(--accent-light);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--accent) 0.4%, transparent);
}
.poem-card__quote {
  margin: 0;
  padding: 0;
  border: none;
  max-width: 88%;
}
.poem-card__text {
  font-family: var(--font-heading);
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.9;
  letter-spacing: 2px;
  margin: 0 0 16px 0;
}
.poem-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.poem-card__tag {
  font-size: 10.5px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid var(--border-light);
  padding: 2px 8px;
  border-radius: 100px;
  letter-spacing: 1px;
}
.theme-inkwash .poem-card__tag {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}
.poem-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
.poem-card__author {
  font-weight: 600;
  letter-spacing: 1px;
}
.poem-card__title {
  font-style: italic;
  color: var(--text-muted);
  white-space: nowrap;
}
.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
  border-color: var(--accent);
}
@media (max-width: 640px) {
  .poem-card { padding: 22px 20px 18px; }
  .poem-card__text { font-size: 17px; letter-spacing: 1px; }
}
</style>
