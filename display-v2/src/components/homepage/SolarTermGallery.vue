<template>
  <section
    ref="galleryRef"
    class="solar-gallery"
    role="region"
    aria-label="黄河二十四节气画廊"
    aria-keyshortcuts="ArrowLeft ArrowRight"
    tabindex="0"
    @mouseenter="handlePointerEnter"
    @mouseleave="handlePointerLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @keydown.left.prevent="step(-1)"
    @keydown.right.prevent="step(1)"
  >
    <figure class="solar-gallery__frame">
      <Transition name="solar-fade" mode="out-in">
        <img
          v-if="!imageFailed"
          :key="activeTerm.index"
          class="solar-gallery__image"
          :src="activeTerm.image"
          :alt="`${activeTerm.name}，${activeTerm.location}`"
          decoding="async"
          fetchpriority="high"
          @error="imageFailed = true"
        />
        <div v-else :key="`missing-${activeTerm.index}`" class="solar-gallery__missing">
          <span>{{ activeTerm.name }}</span>
          <small>画卷暂缺</small>
        </div>
      </Transition>
      <figcaption class="solar-gallery__caption">
        <span>第 {{ String(activeTerm.index + 1).padStart(2, '0') }} 节气</span>
        <strong>{{ activeTerm.name }}</strong>
        <span>{{ activeTerm.location }}</span>
      </figcaption>
    </figure>

    <nav class="solar-gallery__thumbs" aria-label="选择节气">
      <button
        v-for="term in visibleTerms"
        :key="term.name"
        type="button"
        class="solar-gallery__thumb"
        :class="{ 'is-active': term.index === activeIndex }"
        :aria-current="term.index === activeIndex ? 'true' : undefined"
        :aria-label="`${term.name}，${term.location}`"
        @click="seek(term.index)"
      >
        <span class="solar-gallery__thumb-image">
          <img :src="term.image" alt="" loading="lazy" decoding="async" />
        </span>
        <span class="solar-gallery__thumb-name">{{ term.name }}</span>
      </button>
    </nav>

    <div class="solar-gallery__controls" role="group" aria-label="画廊控制">
      <button type="button" class="solar-gallery__control" aria-label="上一节气" @click="step(-1)">
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        class="solar-gallery__control solar-gallery__control--toggle"
        :disabled="reducedMotion"
        :aria-pressed="autoPlay"
        :aria-label="reducedMotion ? '系统已停用轮播' : autoPlay ? '暂停轮播' : '继续轮播'"
        :title="reducedMotion ? '已按系统设置停用轮播' : undefined"
        @click="toggleAutoPlay"
      >
        <span aria-hidden="true">{{ reducedMotion ? '—' : autoPlay ? 'Ⅱ' : '▶' }}</span>
        <span>{{ reducedMotion ? '系统停用' : isRotating ? '轮播中' : autoPlay ? '交互暂停' : '已暂停' }}</span>
      </button>
      <button type="button" class="solar-gallery__control" aria-label="下一节气" @click="step(1)">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SOLAR_TERMS } from '../../config/solarTerms.js'
import { shouldAutoRotate, visibleTermIndexes, wrapTermIndex } from '../../utils/solarTermGallery.js'

const galleryRef = ref(null)
const activeIndex = ref(0)
const imageFailed = ref(false)
const pointerInside = ref(false)
const focusWithin = ref(false)
const pageVisible = ref(typeof document === 'undefined' ? true : !document.hidden)
const windowFocused = ref(typeof document === 'undefined' ? true : document.hasFocus())
const motionQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null
const reducedMotion = ref(Boolean(motionQuery?.matches))
const autoPlay = ref(!reducedMotion.value)
let autoTimer = null

const activeTerm = computed(() => SOLAR_TERMS[activeIndex.value] || SOLAR_TERMS[0])
const visibleTerms = computed(() =>
  visibleTermIndexes(activeIndex.value, SOLAR_TERMS.length).map((index) => SOLAR_TERMS[index]),
)
const isRotating = computed(() =>
  shouldAutoRotate({
    autoPlay: autoPlay.value,
    reducedMotion: reducedMotion.value,
    pageVisible: pageVisible.value,
    windowFocused: windowFocused.value,
    pointerInside: pointerInside.value,
    focusWithin: focusWithin.value,
  }),
)

const stopTimer = () => {
  if (autoTimer !== null) {
    window.clearInterval(autoTimer)
    autoTimer = null
  }
}

const restartTimer = () => {
  stopTimer()
  if (
    typeof window === 'undefined' ||
    !shouldAutoRotate({
      autoPlay: autoPlay.value,
      reducedMotion: reducedMotion.value,
      pageVisible: pageVisible.value,
      windowFocused: windowFocused.value,
      pointerInside: pointerInside.value,
      focusWithin: focusWithin.value,
    })
  ) return
  autoTimer = window.setInterval(() => {
    activeIndex.value = wrapTermIndex(activeIndex.value + 1, SOLAR_TERMS.length)
    imageFailed.value = false
  }, 8000)
}

const pauseTimer = () => stopTimer()

const preloadImage = (term) => {
  if (typeof window === 'undefined' || !term?.image) return
  const image = new window.Image()
  image.decoding = 'async'
  image.src = term.image
}

watch(
  activeIndex,
  (index) => {
    preloadImage(SOLAR_TERMS[wrapTermIndex(index + 1, SOLAR_TERMS.length)])
  },
  { immediate: true },
)

const handlePointerEnter = () => {
  pointerInside.value = true
  pauseTimer()
}

const handlePointerLeave = () => {
  pointerInside.value = false
  restartTimer()
}

const handleFocusIn = () => {
  focusWithin.value = true
  pauseTimer()
}

const seek = (index, { restart = true } = {}) => {
  activeIndex.value = wrapTermIndex(index, SOLAR_TERMS.length)
  imageFailed.value = false
  if (restart) restartTimer()
}

const step = (delta) => seek(activeIndex.value + delta)

const toggleAutoPlay = () => {
  if (reducedMotion.value) return
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) restartTimer()
  else stopTimer()
}

const handleReducedMotionChange = (event) => {
  reducedMotion.value = event.matches
  if (event.matches) {
    autoPlay.value = false
    stopTimer()
  } else {
    restartTimer()
  }
}

const handleFocusOut = (event) => {
  const nextTarget = event.relatedTarget
  if (!nextTarget || !galleryRef.value?.contains(nextTarget)) {
    focusWithin.value = false
    restartTimer()
  }
}

const handleVisibilityChange = () => {
  pageVisible.value = !document.hidden
  if (document.hidden) stopTimer()
  else restartTimer()
}

const handleWindowFocus = () => {
  windowFocused.value = true
  restartTimer()
}

const handleWindowBlur = () => {
  windowFocused.value = false
  stopTimer()
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('blur', handleWindowBlur)
  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleReducedMotionChange)
    } else {
      motionQuery.addListener(handleReducedMotionChange)
    }
  }
  restartTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('blur', handleWindowBlur)
  if (motionQuery) {
    if (typeof motionQuery.removeEventListener === 'function') {
      motionQuery.removeEventListener('change', handleReducedMotionChange)
    } else {
      motionQuery.removeListener(handleReducedMotionChange)
    }
  }
})
</script>

<style scoped>
.solar-gallery {
  --gallery-ink: var(--text-primary);
  --gallery-muted: var(--text-secondary);
  --gallery-line: color-mix(in srgb, var(--text-primary) 18%, transparent);
  width: 100%;
  min-width: 0;
}

.solar-gallery__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  margin: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  box-shadow: 0 16px 36px color-mix(in srgb, var(--text-primary) 10%, transparent);
}

.solar-gallery__frame::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border: 8px solid color-mix(in srgb, var(--bg-primary) 25%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text-primary) 18%, transparent);
}

.solar-gallery__frame::before {
  content: '';
  position: absolute;
  inset: 36% 0 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--text-primary) 68%, transparent) 100%
  );
}

.solar-gallery__image,
.solar-gallery__missing {
  width: 100%;
  height: 100%;
}

.solar-gallery__image {
  position: relative;
  z-index: 0;
  display: block;
  object-fit: contain;
  object-position: center;
  background: var(--bg-secondary);
}

.solar-gallery__missing {
  position: relative;
  z-index: 0;
  display: grid;
  place-content: center;
  gap: var(--sp-2);
  text-align: center;
  color: var(--gallery-muted);
  background:
    linear-gradient(135deg, transparent 49%, color-mix(in srgb, var(--text-primary) 8%, transparent) 50%, transparent 51%),
    var(--bg-secondary);
}

.solar-gallery__missing span {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  color: var(--gallery-ink);
}

.solar-gallery__missing small {
  font-size: var(--fs-caption);
  letter-spacing: 2px;
}

.solar-gallery__caption {
  position: absolute;
  right: var(--sp-5);
  bottom: var(--sp-4);
  left: var(--sp-5);
  z-index: 3;
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  padding-top: var(--sp-3);
  color: var(--bg-primary);
  text-shadow: 0 1px 8px color-mix(in srgb, var(--text-primary) 80%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--bg-primary) 55%, transparent);
}

.solar-gallery__caption span {
  font-size: var(--fs-caption);
  letter-spacing: 2px;
}

.solar-gallery__caption strong {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  font-weight: 600;
  letter-spacing: 3px;
}

.solar-gallery__caption span:last-child {
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solar-gallery__thumbs {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--sp-2);
  margin-top: var(--sp-4);
}

.solar-gallery__thumb {
  display: grid;
  grid-template-rows: auto auto;
  min-width: 0;
  min-height: 44px;
  padding: 0;
  color: var(--gallery-muted);
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.solar-gallery__thumb.is-active {
  grid-column: span 2;
  color: var(--gallery-ink);
  border-color: var(--accent);
  transform: translateY(-3px);
}

.solar-gallery__thumb-image {
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-secondary);
}

.solar-gallery__thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.solar-gallery__thumb:hover img,
.solar-gallery__thumb:focus-visible img {
  transform: scale(1.04);
}

.solar-gallery__thumb-name {
  padding: var(--sp-1) var(--sp-1) 0;
  overflow: hidden;
  font-size: var(--fs-caption);
  line-height: 1.4;
  letter-spacing: 1px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.solar-gallery__controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
}

.solar-gallery__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  min-width: 44px;
  min-height: 44px;
  padding: 0 var(--sp-3);
  color: var(--gallery-ink);
  border: 1px solid var(--gallery-line);
  background: color-mix(in srgb, var(--bg-primary) 55%, transparent);
  font-size: var(--fs-body-sm);
  transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.solar-gallery__control:not(:disabled):hover {
  color: var(--text-on-accent);
  border-color: var(--accent);
  background: var(--accent);
}

.solar-gallery__control:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.solar-gallery__control--toggle {
  min-width: 96px;
}

.solar-gallery__control span:first-child {
  font-size: var(--fs-body);
  line-height: 1;
}

.solar-gallery :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.solar-gallery:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

.solar-fade-enter-active,
.solar-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.solar-fade-enter-from,
.solar-fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .solar-gallery__caption {
    right: var(--sp-3);
    bottom: var(--sp-3);
    left: var(--sp-3);
    gap: var(--sp-2);
  }

  .solar-gallery__caption strong {
    font-size: var(--fs-h3);
  }

  .solar-gallery__caption span:last-child {
    display: none;
  }

  .solar-gallery__thumbs {
    display: flex;
    gap: var(--sp-2);
    overflow-x: auto;
    padding: var(--sp-1) 0 var(--sp-2);
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
  }

  .solar-gallery__thumb,
  .solar-gallery__thumb.is-active {
    flex: 0 0 92px;
    grid-column: auto;
    scroll-snap-align: start;
    transform: none;
  }

  .solar-gallery__thumb-name {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .solar-gallery__thumb,
  .solar-gallery__thumb img,
  .solar-gallery__control,
  .solar-gallery__frame::before,
  .solar-fade-enter-active,
  .solar-fade-leave-active {
    transition: none;
  }
}
</style>
