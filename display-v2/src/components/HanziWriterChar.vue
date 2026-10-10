<template>
  <div class="hanzi-writer-char" :class="{ 'is-visible': visible }" ref="charRef"></div>
</template>

<script>
/**
 * 笔画数据的模块级共享缓存与请求队列。
 *
 * 必须放在普通 <script> 里：写在 <script setup> 中的变量是「每个组件实例各一份」，
 * 一首诗 60 多个字就会发 60 多个并发请求，缓存完全不共享，很容易被 CDN 限流；
 * 一旦失败就降级成普通文字（表现为「有的字不是写出来的，而是直接印上去的，
 * 看起来像素描了一遍」）。这里做三件事：跨实例缓存、同字请求去重、并发上限。
 */
const charDataCache = new Map()
const inflightRequests = new Map()

const MAX_CONCURRENT_REQUESTS = 6
let activeRequests = 0
const requestQueue = []

function runWithLimit(task) {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests += 1
    const settle = () => {
      activeRequests -= 1
      if (requestQueue.length) runWithLimit(requestQueue.shift())
    }
    task().then(settle, settle)
  } else {
    requestQueue.push(task)
  }
}

function loadCharData(char) {
  if (charDataCache.has(char)) return Promise.resolve(charDataCache.get(char))
  if (inflightRequests.has(char)) return inflightRequests.get(char)

  const url = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(char) + '.json'
  const promise = new Promise((resolve, reject) => {
    runWithLimit(() =>
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status)
          return res.json()
        })
        .then((data) => {
          charDataCache.set(char, data)
          resolve(data)
        })
        .catch(reject)
        .finally(() => inflightRequests.delete(char))
    )
  })
  inflightRequests.set(char, promise)
  return promise
}
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import HanziWriter from 'hanzi-writer'

const props = defineProps({
  char: { type: String, required: true },
  size: { type: Number, default: 100 },
  delay: { type: Number, default: 0 },
  autoPlay: { type: Boolean, default: false }
})

const emit = defineEmits(['animation-complete'])

const charRef = ref(null)
/**
 * 是否已经轮到这个字书写。
 * HanziWriter 创建时，笔画的初始显示比例是「完整」的——只有 animateCharacter 跑起来
 * 才会把笔画重置到起点。所以若不遮挡，还没轮到的字会先整字显形，
 * 视觉上就像照着字帖把整首诗的底稿先铺了出来。轮到之前这里整体不可见。
 */
const visible = ref(false)
let writer = null
let playTimer = null
let disposed = false
let loadingToken = 0

onMounted(async () => {
  await nextTick()
  readyPromise = initWriter()
})

watch(() => props.char, async () => {
  await nextTick()
  readyPromise = initWriter()
})

// 自适应尺寸变化（父组件按容器宽度重算字号后同步过来）
watch(() => props.size, (size) => {
  if (writer) writer.updateDimensions({ width: size, height: size })
})

// autoPlay 由 false→true 时播放。
// 「重播」由父组件改变 key 强制重建本组件实现——销毁重建能保证是全新空白字帖，
// 比在旧实例上做重置更可靠（旧实例的笔画停在完成态，很难干净地退回起点）。
watch(() => props.autoPlay, (playing) => {
  if (!playing) return
  schedulePlay()
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(playTimer)
  playTimer = null
  writer = null
})

/** 最近一次初始化的完成信号：播放必须等它就绪，否则可能画到尚未创建的实例 */
let readyPromise = Promise.resolve()

function schedulePlay() {
  clearTimeout(playTimer)
  playTimer = setTimeout(() => {
    readyPromise
      .then(() => {
        // 先让笔画回到起点开始书写，再让这个字显形。两步在同一微任务里完成，
        // 浏览器渲染时看到的直接就是「正在写」，不会闪出完整字形。
        playAnimation()
        visible.value = true
      })
      .catch(() => {})
  }, props.delay || 0)
}

async function initWriter() {
  clearTimeout(playTimer)
  playTimer = null
  writer = null
  visible.value = false
  if (!charRef.value) return

  const char = props.char
  if (!char) return
  const token = ++loadingToken
  charRef.value.innerHTML = ''

  try {
    const data = await loadCharData(char)
    // 异步期间组件可能已卸载或换了字，丢弃过期结果
    if (disposed || token !== loadingToken || !charRef.value || props.char !== char) return

    writer = HanziWriter.create(charRef.value, char, {
      width: props.size,
      height: props.size,
      padding: 4,
      // 关掉描红底稿：showOutline=true 会让每个未写的字先亮出一整幅浅灰轮廓，
      // 整首诗看上去像"照着字帖描一遍"。关掉后未写的笔画完全不可见，
      // 字才是真正一笔一笔浮现出来的。
      showOutline: false,
      // 单字书写速度：默认 1 / 200ms 会让一个多笔画字占时 3s+，
      // 整首 60 字写完要 10s，观感偏拖沓。调快后单字约 1.5s。
      strokeAnimationSpeed: 1.6,
      delayBetweenStrokes: 120,
      strokeColor: '#2f2a24',
      outlineColor: '#dcd5c7',
      radicalColor: '#a95043',
      charDataLoader: (_c, onComplete) => onComplete(data)
    })

    if (props.autoPlay) schedulePlay()
  } catch (error) {
    if (token !== loadingToken) return
    console.warn('[HanziWriterChar] 笔画数据加载失败，降级为静态文字:', char, error && error.message)
    renderFallback()
  }
}

/** 数据不可用时退回普通字，至少保证版面完整 */
function renderFallback() {
  if (!charRef.value) return
  visible.value = true
  charRef.value.innerHTML = ''
  const span = document.createElement('span')
  span.className = 'hanzi-fallback'
  span.textContent = props.char
  span.style.fontSize = `${Math.round(props.size * 0.84)}px`
  charRef.value.appendChild(span)
}

function playAnimation() {
  if (!writer) return
  try {
    writer.animateCharacter({
      onComplete: () => emit('animation-complete', props.char)
    })
  } catch (error) {
    console.warn('[HanziWriterChar] 播放动画失败:', error && error.message)
  }
}

function pauseAnimation() {
  if (writer && writer.pauseAnimation) writer.pauseAnimation()
}

function resumeAnimation() {
  if (writer && writer.resumeAnimation) writer.resumeAnimation()
}

defineExpose({
  playAnimation,
  pauseAnimation,
  resumeAnimation
})
</script>

<style scoped>
.hanzi-writer-char {
  display: block;
  width: 100%;
  height: 100%;
  line-height: 1;
  /* 轮到该字书写前整体不可见，避免 HanziWriter 创建时的完整字形提前露出 */
  opacity: 0;
}

.hanzi-writer-char.is-visible {
  opacity: 1;
}

.hanzi-writer-char :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.hanzi-writer-char :deep(.hanzi-fallback) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-display);
  color: #2f2a24;
  animation: hanzi-fallback-in 0.5s ease both;
}

@keyframes hanzi-fallback-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .hanzi-writer-char :deep(.hanzi-fallback) { animation: none; }
}
</style>
