<template>
  <article class="city-card" @click.stop>
    <!-- 头部：竖排朱印 + 城市名 + 英文 + 关闭 -->
    <header class="city-card__head">
      <div class="city-card__title-wrap">
        <span class="city-card__seal">{{ sealText }}</span>
        <div class="city-card__title-text">
          <h3 class="city-card__name">{{ name }}</h3>
          <span class="city-card__eng">{{ archive.english || '' }}</span>
        </div>
      </div>
      <button class="city-card__close" aria-label="关闭" @click="$emit('close')">×</button>
    </header>

    <p class="city-card__subtitle">{{ archive.subtitle || archive.desc || '' }}</p>

    <!-- 代表景观图 + 景点预览 + 计数 -->
    <div class="city-card__media">
      <div class="city-card__img-wrap">
        <img v-if="imgSrc && imgOk" :src="imgSrc" :alt="name" class="city-card__img" @error="onImgError" />
        <span v-else class="city-card__img-fallback">{{ name ? name.charAt(0) : '城' }}</span>
      </div>
      <div class="city-card__stats">
        <p class="city-card__spot-preview">{{ spotPreview }}</p>
        <div class="city-card__nums">
          <span class="city-card__num"><b>{{ spotCountText }}</b><i>处景观</i></span>
          <span class="city-card__num-sep">·</span>
          <span class="city-card__num"><b>{{ poemCountText }}</b><i>篇咏景</i></span>
        </div>
      </div>
    </div>

    <!-- 城市档案 -->
    <dl class="city-card__archive">
      <div class="city-card__row">
        <dt>地理</dt>
        <dd>{{ archive.geo || '—' }}</dd>
      </div>
      <div class="city-card__row">
        <dt>历史</dt>
        <dd>{{ archive.history || '—' }}</dd>
      </div>
      <div class="city-card__row">
        <dt>季节</dt>
        <dd>{{ archive.season || '—' }}</dd>
      </div>
    </dl>

    <!-- 该市名士 -->
    <div class="city-card__poets" v-if="hasPoets || loading">
      <span class="city-card__poets-lbl">名士</span>
      <span v-if="loading" class="city-card__skel"></span>
      <span v-else class="city-card__poet-names">{{ detail.poets.map((p) => p.name).join(' · ') }}</span>
    </div>

    <!-- 三入口 -->
    <footer class="city-card__actions">
      <button class="city-card__btn city-card__btn--primary" @click="$emit('go', `/regions/${name}`)">进入景观</button>
      <button
        class="city-card__btn"
        :disabled="!detail || !detail.firstSpotId || loading"
        @click="onGo(`/spots/${detail?.firstSpotId}`)"
      >名篇</button>
      <button
        class="city-card__btn"
        :disabled="!detail || !detail.firstPoetId || loading"
        @click="onGo(`/poets/${detail?.firstPoetId}`)"
      >名士</button>
    </footer>
  </article>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useImage } from '../../composables/useImage'

const props = defineProps({
  name: { type: String, required: true },
  // mockCities 静态档案（已合并默认值）
  archive: { type: Object, default: () => ({}) },
  // 真实补全数据：{ spotCount, poemCount, firstSpotId, imageUrl, spotNames, poets, firstPoetId, ok }
  detail: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'go'])

const { getImageUrl } = useImage()

const sealText = computed(() => props.archive.tag || (props.name ? props.name.charAt(0) : '城'))

const imgSrc = computed(() => (props.detail && props.detail.imageUrl ? getImageUrl(props.detail.imageUrl, false) : ''))
const imgOk = ref(true)
watch(imgSrc, () => { imgOk.value = true })
const onImgError = () => { imgOk.value = false }

const spotPreview = computed(() => {
  if (props.loading || !props.detail) return '景观加载中…'
  const names = props.detail.spotNames || []
  if (!names.length) return '暂无景观数据'
  const txt = names.join(' · ')
  return props.detail.spotCount > names.length ? txt + '…' : txt
})

const spotCountText = computed(() => {
  if (props.loading || !props.detail) return '–'
  return props.detail.spotCount
})
const poemCountText = computed(() => {
  if (props.loading || !props.detail) return '–'
  return props.detail.poemCount
})

const hasPoets = computed(() => !!(props.detail && props.detail.poets && props.detail.poets.length))

const onGo = (route) => {
  if (route && !route.endsWith('/undefined') && !route.endsWith('/null')) emit('go', route)
}

// Esc 关闭
const onKeydown = (e) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.city-card {
  width: 100%;
  max-width: 460px;
  background: rgba(253, 250, 245, 0.95);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 4px;
  padding: 18px 20px 16px;
  box-shadow: 0 16px 40px color-mix(in srgb, var(--text-primary) 18%, transparent);
  backdrop-filter: blur(16px);
  text-align: left;
  position: relative;
}

/* 装饰角 */
.city-card::before,
.city-card::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--accent);
  pointer-events: none;
  opacity: 0.5;
}
.city-card::before { top: 6px; left: 6px; border-right: 0; border-bottom: 0; }
.city-card::after { bottom: 6px; right: 6px; border-left: 0; border-top: 0; }

.city-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px dashed var(--border-light);
  padding-bottom: 12px;
  margin-bottom: 10px;
}

.city-card__title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.city-card__seal {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: var(--accent);
  padding: 6px 4px;
  border-radius: 2px;
  letter-spacing: 2px;
  box-shadow: 2px 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
  flex-shrink: 0;
  line-height: 1.1;
  max-height: 92px;
}

.city-card__title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.city-card__name {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 3px;
  margin: 0;
  line-height: 1.1;
}

.city-card__eng {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 1.5px;
}

.city-card__close {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--text-muted);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;
  transition: all 0.2s;
  flex-shrink: 0;
}
.city-card__close:hover {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 0.1%, transparent);
}

.city-card__subtitle {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-dark, var(--accent));
  letter-spacing: 1.5px;
  margin: 0 0 14px 0;
}

.city-card__media {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.city-card__img-wrap {
  width: 96px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 3px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8e0cc, #d4cab0);
  border: 1px solid var(--border-light);
  position: relative;
}
.city-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.city-card:hover .city-card__img {
  transform: scale(1.06);
}
.city-card__img-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.45;
}

.city-card__stats {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
}

.city-card__spot-preview {
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.city-card__nums {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
.city-card__num b {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  color: var(--accent);
  margin-right: 2px;
}
.city-card__num i {
  font-style: normal;
}
.city-card__num-sep {
  color: var(--border);
}

.city-card__archive {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 12px 0;
  padding: 10px 0;
  border-top: 1px dashed var(--border-light);
  border-bottom: 1px dashed var(--border-light);
}
.city-card__row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.5;
}
.city-card__row dt {
  flex-shrink: 0;
  width: 32px;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.city-card__row dd {
  margin: 0;
  color: var(--text-secondary);
  flex: 1;
}

.city-card__poets {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 12px;
}
.city-card__poets-lbl {
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.city-card__poet-names {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.city-card__skel {
  display: inline-block;
  width: 90px;
  height: 12px;
  border-radius: 2px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent) 8%, transparent));
  background-size: 200% 100%;
  animation: cityCardSkel 1.2s ease-in-out infinite;
}
@keyframes cityCardSkel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.city-card__actions {
  display: flex;
  gap: 8px;
}
.city-card__btn {
  flex: 1;
  padding: 9px 8px;
  border: 1px solid var(--border);
  border-radius: 2px;
  background: var(--card-bg, #fff);
  color: var(--text-secondary);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.city-card__btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--accent) 12%, transparent);
}
.city-card__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.city-card__btn--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.city-card__btn--primary:hover:not(:disabled) {
  color: #fff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 25%, transparent);
}

/* 移动端：卡片由父级定位为固定底部时，占满宽度 */
@media (max-width: 640px) {
  .city-card {
    width: 100%;
    max-width: 100%;
  }
}
</style>
