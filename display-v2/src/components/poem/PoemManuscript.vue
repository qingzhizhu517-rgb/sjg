<template>
  <article class="manuscript" aria-labelledby="poem-manuscript-title">
    <div
      v-if="moodBg"
      class="manuscript__wash"
      :style="{ backgroundImage: `url(${moodBg})` }"
      aria-hidden="true"
    ></div>

    <header class="manuscript__header">
      <span class="manuscript__seal" aria-hidden="true">{{ dynasty?.name?.charAt(0) || '诗' }}</span>
      <p class="manuscript__eyebrow">{{ dynasty?.name || '佚代' }} · 齐鲁诗笺</p>
      <h1 id="poem-manuscript-title">{{ poem.title }}</h1>
      <p v-if="poet || spot" class="manuscript__byline">
        <router-link v-if="poet" :to="`/poets/${poet.id}`">{{ poet.name }}</router-link>
        <span v-if="poet && spot" aria-hidden="true">·</span>
        <router-link v-if="spot" :to="`/spots/${spot.id}`">{{ spot.name }}</router-link>
      </p>
    </header>

    <div class="manuscript__body" role="group" aria-label="诗词正文">
      <p
        v-for="(line, index) in lines"
        :key="`${index}-${line}`"
        :style="{ animationDelay: `${index * 90}ms` }"
      >
        {{ line }}
      </p>
      <p v-if="!lines.length" class="manuscript__empty">暂无正文</p>
    </div>

    <div v-if="tags.length" class="manuscript__tags" aria-label="情感标签">
      <span v-for="tag in tags" :key="tag">{{ tag }}</span>
    </div>

    <details
      v-if="poem.annotation"
      class="manuscript__annotation"
      :open="showAnnotation"
      @toggle="syncAnnotation"
    >
      <summary :aria-expanded="String(showAnnotation)">
        {{ showAnnotation ? '收起注解' : '展开注解' }}
      </summary>
      <p v-if="showAnnotation">{{ poem.annotation }}</p>
    </details>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { splitPoemLines } from '../../utils/poem'

const props = defineProps({
  poem: { type: Object, required: true },
  poet: { type: Object, default: null },
  dynasty: { type: Object, default: null },
  spot: { type: Object, default: null },
  moodBg: { type: String, default: null },
  tags: { type: Array, default: () => [] },
})

const showAnnotation = ref(Boolean(props.poem.annotation))
const lines = computed(() => splitPoemLines(props.poem.content))

watch(
  () => [props.poem.id, props.poem.annotation],
  () => {
    showAnnotation.value = Boolean(props.poem.annotation)
  },
)

const syncAnnotation = (event) => {
  if (event.currentTarget) showAnnotation.value = event.currentTarget.open
}
</script>

<style scoped>
.manuscript {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: clamp(32px, 6vw, 72px) clamp(20px, 7vw, 88px);
  box-shadow: 0 24px 64px color-mix(in srgb, var(--text-primary) 10%, transparent);
}

.manuscript__wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-position: center;
  background-size: cover;
  filter: grayscale(0.35) saturate(0.75);
  opacity: 0.08;
  pointer-events: none;
}

.manuscript__header,
.manuscript__body,
.manuscript__tags,
.manuscript__annotation {
  position: relative;
  z-index: 1;
}

.manuscript__header {
  max-width: 65ch;
  margin: 0 auto;
  text-align: center;
}

.manuscript__seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: var(--sp-3);
  border: 2px solid var(--accent);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1;
  transform: rotate(-4deg);
}

.manuscript__eyebrow {
  margin: 0 0 var(--sp-2);
  color: var(--text-muted);
  font-size: var(--fs-body-sm);
  letter-spacing: 0.16em;
}

.manuscript h1 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 600;
  letter-spacing: 0.14em;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.manuscript__byline {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin: var(--sp-3) 0 0;
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  letter-spacing: 0.08em;
}

.manuscript__byline a {
  color: var(--accent);
  border-bottom: 1px dashed color-mix(in srgb, var(--accent) 60%, transparent);
}

.manuscript__byline a:hover {
  color: var(--accent-dark);
}

.manuscript__body {
  max-width: 30em;
  margin: var(--sp-7) auto 0;
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.2vw, 24px);
  line-height: 2.1;
  letter-spacing: 0.08em;
}

.manuscript__body p {
  margin: 0;
  animation: manuscript-line-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.manuscript__body p + p {
  margin-top: var(--sp-2);
}

.manuscript__body .manuscript__empty {
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  letter-spacing: 0;
}

.manuscript__tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--sp-2);
  max-width: 65ch;
  margin: var(--sp-6) auto 0;
}

.manuscript__tags span {
  padding: 3px 11px;
  border: 1px solid var(--border-light);
  border-radius: 100px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  color: var(--text-secondary);
  font-size: var(--fs-body-sm);
  letter-spacing: 0.08em;
}

.manuscript__annotation {
  max-width: 65ch;
  margin: var(--sp-7) auto 0;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.manuscript__annotation summary {
  min-height: 44px;
  width: fit-content;
  padding: var(--sp-3) var(--sp-2) var(--sp-3) 0;
  display: inline-flex;
  align-items: center;
  color: var(--accent);
  cursor: pointer;
  font-size: var(--fs-body-sm);
  letter-spacing: 0.12em;
  list-style: none;
}

.manuscript__annotation summary::-webkit-details-marker {
  display: none;
}

.manuscript__annotation summary::before {
  content: '＋';
  display: inline-block;
  margin-right: var(--sp-2);
  transition: transform 0.25s ease;
}

.manuscript__annotation[open] summary::before {
  transform: rotate(45deg);
}

.manuscript__annotation p {
  margin: 0 0 var(--sp-4);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: var(--lh-loose);
}

.manuscript a:focus-visible,
.manuscript summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

@keyframes manuscript-line-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .manuscript {
    padding: 32px 20px 40px;
  }

  .manuscript__body {
    margin-top: var(--sp-6);
    font-size: clamp(18px, 5vw, 20px);
    line-height: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manuscript__body p {
    animation: none;
  }

  .manuscript__annotation summary::before {
    transition: none;
  }
}
</style>
