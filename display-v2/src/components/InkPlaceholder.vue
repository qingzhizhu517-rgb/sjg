<template>
  <!-- 程序化水墨占位：零素材，纯 CSS/SVG。同一 seed 每次渲染确定一致（不用随机）。 -->
  <div class="ink-ph" :style="styleVars" role="img" :aria-label="`${label}占位图`">
    <span class="ink-ph__wash" aria-hidden="true"></span>
    <span class="ink-ph__seal">{{ seal }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 条目 id 或标题，派生确定性纹样
  seed: { type: [String, Number], default: '' },
  // 类目：节/诗/味/艺/文/景，决定印章字
  kind: { type: String, default: '文' },
})

const SEAL_BY_KIND = {
  festival: '节', poem: '诗', craft: '艺', literature: '文', food_opera: '味', spot: '景',
  节: '节', 诗: '诗', 艺: '艺', 文: '文', 味: '味', 景: '景',
}

// 字符串 → 稳定整数哈希
function hashSeed(s) {
  const str = String(s ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const seal = computed(() => SEAL_BY_KIND[props.kind] || String(props.kind).charAt(0) || '文')
const label = computed(() => seal.value)

// 由 seed 派生晕染角度/位置，保证确定性
const styleVars = computed(() => {
  const h = hashSeed(`${props.seed}-${props.kind}`)
  const angle = h % 360
  const px = 20 + (h % 60)          // 20%–80%
  const py = 20 + ((h >> 3) % 60)
  const px2 = 20 + ((h >> 6) % 60)
  const py2 = 20 + ((h >> 9) % 60)
  return {
    '--ph-angle': `${angle}deg`,
    '--ph-x': `${px}%`,
    '--ph-y': `${py}%`,
    '--ph-x2': `${px2}%`,
    '--ph-y2': `${py2}%`,
  }
})
</script>

<style scoped>
.ink-ph {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  overflow: hidden;
}

/* 淡墨晕染 + 留白：两团 radial + 一条斜向渐层，位置由 seed 决定 */
.ink-ph__wash {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at var(--ph-x) var(--ph-y),
      color-mix(in srgb, var(--ink-wash) 22%, transparent) 0%, transparent 42%),
    radial-gradient(circle at var(--ph-x2) var(--ph-y2),
      color-mix(in srgb, var(--ink-wash) 14%, transparent) 0%, transparent 38%),
    linear-gradient(var(--ph-angle),
      color-mix(in srgb, var(--ink-wash) 8%, transparent), transparent 60%);
}

/* 朱砂印章 */
.ink-ph__seal {
  position: relative;
  font-family: var(--font-display);
  font-size: clamp(28px, 12%, 56px);
  font-weight: 600;
  color: var(--accent);
  width: 1.6em;
  height: 1.6em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent);
  border-radius: var(--radius-sm);
  transform: rotate(-6deg);
  background: color-mix(in srgb, var(--card-bg) 60%, transparent);
}
</style>
