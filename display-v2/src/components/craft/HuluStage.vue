<template>
  <figure class="hulu-stage" :data-capability="capability">
    <div ref="viewportRef" class="hulu-stage__viewport">
      <canvas v-show="capability !== '2d'" ref="canvasRef" class="hulu-stage__canvas" tabindex="0" aria-label="东昌葫芦三维舞台，方向键转动，加减键缩放" @keydown="onKey" />
      <HuluIllustration v-if="capability === '2d' && mode === 'observe'" :step="step" class="hulu-stage__illustration" />
      <canvas v-show="capability === '2d' && mode !== 'observe'" ref="flatRef" class="hulu-stage__canvas" aria-label="平面纹样练习画布" @pointerdown="flatDown" @pointermove="flatMove" @pointerup="flatUp" @pointercancel="flatCancel" @lostpointercapture="flatCancel" />
      <span class="hulu-stage__badge">{{ capability === 'loading' ? '正在布置工坊' : capability === '3d' ? '立体器物' : '平面预览' }}</span>
      <div v-if="capability === 'loading'" class="hulu-stage__loading" role="status">正在生成器物与材质…</div>
      <div v-if="capability === '3d'" class="hulu-stage__view-controls" aria-label="观看操作">
        <button type="button" aria-label="放大器物" @click="zoom(1.2)">＋</button>
        <button type="button" aria-label="缩小器物" @click="zoom(1 / 1.2)">－</button>
        <button type="button" @click="resetView">复位</button>
      </div>
    </div>
    <figcaption class="hulu-stage__caption">
      <template v-if="capability === '2d'">此设备使用平面预览，可继续工序导览与纹样练习；平面模式不支持旋转和侧光。</template>
      <template v-else-if="tool === 'rotate'">拖动转动 · 滚轮或双指缩放 · 点击器物查看知识</template>
      <template v-else>{{ tool === 'carve' ? '沿参考线拖动描刻' : tool === 'coat' ? '拖动把色料敷入刻线' : '拖动清去浮色，保留槽内色' }} · 切换「旋转」检查另一面</template>
    </figcaption>
  </figure>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { createHuluRenderer, resolveHuluPresentation } from '../../craft/huluRenderer.js'
import { createGourdTextures } from '../../craft/gourdTextures.js'
import HuluIllustration from './HuluIllustration.vue'

const props = defineProps({
  work: { type: Object, required: true }, mode: { type: String, default: 'observe' }, step: { type: Number, default: 0 },
  tool: { type: String, default: 'rotate' }, sideLight: Boolean, beforeAfter: Boolean,
  guideVisible: { type: Boolean, default: undefined },
})
const emit = defineEmits(['ready', 'stroke', 'inspect', 'error'])
const canvasRef = ref(null), flatRef = ref(null), viewportRef = ref(null)
const capability = ref('loading')
let api = null, flatTextures = null, resizeObserver = null, disposed = false, draft = null
const pointers = new Set()
const snapshot = () => ({ work: props.work, mode: props.mode, step: props.step, tool: props.tool, sideLight: props.sideLight, beforeAfter: props.beforeAfter, guideVisible: props.guideVisible })
const crop = () => {
  const u = props.work.placement.u, v = props.work.placement.v
  return { u0: Math.max(0, u - .25), u1: Math.min(1, u + .25), v0: Math.max(0, v - .28), v1: Math.min(1, v + .28) }
}
const drawFlat = () => {
  const canvas = flatRef.value
  if (!canvas || !flatTextures || props.mode === 'observe') return
  const rect = canvas.getBoundingClientRect(), context = canvas.getContext('2d')
  if (!context || !rect.width || !rect.height) return
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 1.5)
  const width = Math.round(rect.width * ratio), height = Math.round(rect.height * ratio)
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
  const { u0, u1, v0, v1 } = crop(), size = flatTextures.size
  context.drawImage(flatTextures.map.image, u0 * size, (1 - v1) * size, (u1 - u0) * size, (v1 - v0) * size, 0, 0, width, height)
}
const refreshFlat = () => {
  if (!flatRef.value || disposed || capability.value !== '2d') return
  const appearance = resolveHuluPresentation(snapshot())
  if (!flatTextures) flatTextures = createGourdTextures(props.work, { size: 512, ...appearance })
  else flatTextures.update(props.work, appearance)
  drawFlat()
}
const activateFallback = async error => {
  if (disposed) return
  api?.dispose(); api = null; capability.value = '2d'; draft = null
  if (error) emit('error', error)
  emit('ready', null)
  await nextTick()
  refreshFlat()
}
onBeforeUnmount(() => {
  disposed = true; api?.dispose(); flatTextures?.dispose(); resizeObserver?.disconnect()
  pointers.clear(); draft = null
})
onMounted(async () => {
  if (typeof ResizeObserver === 'function' && viewportRef.value) { resizeObserver = new ResizeObserver(drawFlat); resizeObserver.observe(viewportRef.value) }
  try {
    const created = await createHuluRenderer(canvasRef.value, {
      onStroke: stroke => { if (!disposed) emit('stroke', stroke) },
      onInspect: info => { if (!disposed) emit('inspect', info) },
      onError: activateFallback,
    })
    if (disposed || capability.value === '2d') { created.dispose(); return }
    api = created
    api.update(snapshot())
    capability.value = '3d'
    emit('ready', api)
  } catch (error) { await activateFallback(error) }
})
watch(snapshot, async () => {
  if (disposed) return
  draft = null
  if (api) { try { api.update(snapshot()) } catch (error) { await activateFallback(error) } }
  else if (capability.value === '2d') { await nextTick(); refreshFlat() }
}, { deep: true })

const zoom = factor => api?.zoom(factor)
const resetView = () => api?.resetView()
const onKey = event => {
  if (!api) return
  const turns = { ArrowLeft: [-25, 0], ArrowRight: [25, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }
  if (turns[event.key]) { event.preventDefault(); api.rotate(...turns[event.key]) }
  else if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); zoom(event.key === '-' ? 1 / 1.2 : 1.2) }
  else if (event.key.toLowerCase() === 'r') resetView()
}
const paintAllowed = () => props.mode === 'make' && !props.beforeAfter && (props.step === 2 && props.tool === 'carve' || props.step === 3 && ['coat', 'wipe'].includes(props.tool))
const flatPoint = event => {
  const rect = flatRef.value.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height
  if (x < 0 || x > 1 || y < 0 || y > 1) return null
  const { u0, u1, v0, v1 } = crop()
  return { u: u0 + x * (u1 - u0), v: v1 - y * (v1 - v0) }
}
const appendFlat = event => {
  if (!draft) return
  const point = flatPoint(event)
  if (!point) { draft.gap = true; return }
  let segment = draft.segments.at(-1), previous = segment?.at(-1)
  if (previous && Math.hypot(point.u - previous.u, point.v - previous.v) < .0011) return
  const jump = previous && Math.hypot(point.u - previous.u, point.v - previous.v) > .12
  if (!segment || draft.gap || jump || segment.length >= 256) { segment = previous && !draft.gap && !jump ? [previous] : []; draft.segments.push(segment) }
  segment.push(point); draft.gap = false
  flatTextures?.preview({ kind: props.tool, depth: props.work.depth, pigment: props.work.pigment, points: segment }, Math.max(0, segment.length - 2))
  drawFlat()
}
const flatDown = event => {
  if (event.button > 0) return
  pointers.add(event.pointerId); event.currentTarget.setPointerCapture?.(event.pointerId)
  if (pointers.size > 1 || !paintAllowed()) { draft = null; refreshFlat(); return }
  draft = { segments: [], gap: false }; appendFlat(event)
}
const flatMove = event => { if (draft && pointers.has(event.pointerId) && pointers.size === 1) appendFlat(event) }
const flatUp = async event => {
  if (!pointers.has(event.pointerId)) return
  if (draft && pointers.size === 1) {
    appendFlat(event)
    for (const points of draft.segments) if (points.length >= 2) emit('stroke', { kind: props.tool, depth: props.work.depth, pigment: props.work.pigment, points })
  }
  draft = null; pointers.delete(event.pointerId)
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  await nextTick(); refreshFlat()
}
const flatCancel = event => {
  if (!pointers.has(event.pointerId)) return
  pointers.delete(event.pointerId); draft = null; refreshFlat()
}
const exportImage = async () => {
  if (api) return api.exportImage()
  if (!flatRef.value || props.mode === 'observe') throw new Error('请先完成一件作品再导出图片。')
  if (!flatTextures) refreshFlat()
  flatTextures.update(props.work, resolveHuluPresentation({ ...snapshot(), mode: 'gallery', beforeAfter: false, guideVisible: false }))
  drawFlat()
  const blob = await new Promise(resolve => flatRef.value.toBlob(resolve, 'image/png'))
  refreshFlat()
  if (!blob) throw new Error('平面作品图片导出失败。')
  return blob
}
const getSceneApi = () => api
const getStats = () => api?.getStats() || { capability: capability.value }
defineExpose({ getSceneApi, getStats, exportImage, resetView, zoom })
</script>

<style scoped>
.hulu-stage { margin:0; border:1px solid var(--border); background:var(--bg-secondary); border-radius:var(--radius-sm); overflow:hidden; }
.hulu-stage__viewport { position:relative; width:100%; aspect-ratio:6/5; max-height:620px; min-height:300px; }
.hulu-stage__canvas { display:block; width:100%; height:100%; touch-action:none; }
.hulu-stage__illustration { display:block; width:100%; height:100%; padding:16px; }
.hulu-stage__badge { position:absolute; left:20px; top:18px; font-size:var(--fs-caption); color:var(--text-secondary); letter-spacing:2px; pointer-events:none; }
.hulu-stage__loading { position:absolute; inset:0; display:grid; place-items:center; color:var(--text-secondary); font-size:var(--fs-body-sm); background:var(--bg-secondary); }
.hulu-stage__view-controls { position:absolute; right:16px; bottom:16px; display:flex; gap:6px; }
.hulu-stage__view-controls button { min-width:44px; min-height:44px; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--glass-bg); color:var(--text-primary); cursor:pointer; }
.hulu-stage__caption { border-top:1px solid var(--border); padding:12px 18px; color:var(--text-secondary); font-size:var(--fs-caption); line-height:1.8; }
@media (max-width:600px) { .hulu-stage__viewport { aspect-ratio:1/1; min-height:280px; } .hulu-stage__badge { left:14px; top:14px; } }
</style>
