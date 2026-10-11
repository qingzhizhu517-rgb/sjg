<!-- display-v2/src/components/craft/HuluIllustration.vue -->
<!-- 东昌葫芦五道工序的程序化水墨插画（零素材成本，GLB 缺失时的主舞台）。
     各图层按 step 叠加/淡出：青皮 → 干坯 → 画稿 → 刻线 → 凹槽留色。 -->
<template>
  <svg
    class="hulu"
    :class="[`hulu--step-${step}`, { 'hulu--static': !animated }]"
    viewBox="0 0 400 440"
    role="img"
    :aria-label="`东昌葫芦 · ${STEP_LABELS[step] || ''}`"
  >
    <defs>
      <radialGradient :id="uid('green')" cx="38%" cy="32%" r="78%">
        <stop offset="0" stop-color="#d3e0ad" />
        <stop offset=".45" stop-color="#9cb873" />
        <stop offset="1" stop-color="#5b7a40" />
      </radialGradient>
      <radialGradient :id="uid('dried')" cx="36%" cy="30%" r="80%">
        <stop offset="0" stop-color="#fbf1d6" />
        <stop offset=".5" stop-color="#e6cd96" />
        <stop offset="1" stop-color="#a8824c" />
      </radialGradient>
      <radialGradient :id="uid('wash')" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#e4dccb" stop-opacity=".9" />
        <stop offset="1" stop-color="#e4dccb" stop-opacity="0" />
      </radialGradient>
      <filter :id="uid('soft')" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter :id="uid('ink')" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
      </filter>
      <clipPath :id="uid('body')"><path :d="GOURD" /></clipPath>
    </defs>

    <!-- 背景：淡墨晕 + 地面投影 -->
    <circle cx="200" cy="230" r="178" :fill="url('wash')" />
    <ellipse cx="200" cy="418" rx="118" ry="11" fill="#5a4a36" opacity=".16" :filter="url('soft')" />

    <!-- 晾晒：一轮淡朱日影 -->
    <g class="hulu__layer hulu__sun" :class="{ on: step === 1 }">
      <circle cx="322" cy="82" r="30" fill="#c8553d" opacity=".18" />
      <circle cx="322" cy="82" r="20" fill="#c8553d" opacity=".22" />
    </g>

    <!-- 藤蔓与蒂 -->
    <path d="M200 74 C198 58 203 46 214 38" fill="none" stroke="#6b5233" stroke-width="5" stroke-linecap="round" />
    <path class="hulu__layer" :class="{ on: step === 0 }" d="M212 42 C232 30 252 40 246 54 C241 64 228 58 234 50" fill="none" stroke="#6f8f4e" stroke-width="2" stroke-linecap="round" />
    <path class="hulu__layer" :class="{ on: step === 0 }" d="M210 44 C226 22 258 18 270 30 C252 34 236 44 210 44 Z" fill="#7d9c58" opacity=".85" />

    <!-- 葫芦本体：干葫芦坯常驻，青皮在其上淡出 -->
    <path :d="GOURD" :fill="url('dried')" />
    <path class="hulu__layer" :class="{ on: step === 0 }" :d="GOURD" :fill="url('green')" />

    <g :clip-path="url('body')">
      <!-- 墨线画稿（描线动画） -->
      <g class="hulu__layer hulu__draft" :class="{ on: step === 2 }" fill="none" stroke="#2b2622" stroke-width="1.3" stroke-linecap="round" :filter="url('ink')">
        <path v-for="(d, i) in PATTERN" :key="'d' + i" :d="d" pathLength="1" />
        <circle v-for="(b, i) in BLOSSOMS" :key="'db' + i" :cx="b[0]" :cy="b[1]" r="9" pathLength="1" />
      </g>

      <!-- 刀刻：深槽 + 错位高光，形成阴刻立体感 -->
      <g class="hulu__layer" :class="{ on: step >= 3 }" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#fff6df" stroke-width="3.2" opacity=".7" transform="translate(1.2 1.2)">
          <path v-for="(d, i) in PATTERN" :key="'h' + i" :d="d" />
        </g>
        <g stroke="#5c3c1f" stroke-width="2.6">
          <path v-for="(d, i) in PATTERN" :key="'c' + i" :d="d" />
        </g>
        <g v-for="(b, i) in BLOSSOMS" :key="'cb' + i">
          <circle v-for="(p, j) in petals(b)" :key="j" :cx="p[0]" :cy="p[1]" r="5.2" stroke="#5c3c1f" stroke-width="1.6" />
        </g>
      </g>

      <!-- 擦去浮色后，深色只在刻线中留存 -->
      <g class="hulu__layer" :class="{ on: step >= 4 }" fill="none" stroke="#3c3024" stroke-width="1.8">
        <path v-for="(d, i) in PATTERN" :key="'p' + i" :d="d" stroke-linecap="round" />
        <path v-for="(l, i) in LEAVES" :key="'l' + i" :d="l" />
        <g v-for="(b, i) in BLOSSOMS" :key="'pb' + i">
          <circle v-for="(p, j) in petals(b)" :key="j" :cx="p[0]" :cy="p[1]" r="5.4" />
          <circle :cx="b[0]" :cy="b[1]" r="2.6" />
        </g>
        <path :d="CLOUD" opacity=".55" />
      </g>

      <!-- 高光与暗部，统一体积感 -->
      <ellipse cx="176" cy="122" rx="14" ry="24" fill="#fff" opacity=".28" :filter="url('soft')" />
      <ellipse cx="160" cy="292" rx="26" ry="48" fill="#fff" opacity=".22" :filter="url('soft')" />
      <path :d="GOURD" fill="none" stroke="#3b2a18" stroke-width="10" opacity=".12" :filter="url('soft')" />
    </g>
    <path :d="GOURD" fill="none" stroke="#5a4128" stroke-width="1.4" opacity=".55" />

    <!-- 去皮：青皮卷屑飘落 -->
    <g class="hulu__layer hulu__peel" :class="{ on: step === 1 }" fill="#86a65e">
      <path v-for="(s, i) in SHAVINGS" :key="'s' + i" :transform="s" d="M0 0 C6 -9 18 -8 22 1 C15 -3 7 -2 0 0 Z" />
    </g>

    <!-- 刻刀 -->
    <g class="hulu__layer hulu__knife" :class="{ on: step === 3 }">
      <g transform="translate(318 214) rotate(38)">
        <rect x="-5" y="0" width="10" height="70" rx="3" fill="#8a5a32" />
        <rect x="-5.5" y="-4" width="11" height="8" fill="#b9b2a2" />
        <path d="M-4 -4 L4 -4 L1 -30 L-1 -30 Z" fill="#d9d4c8" stroke="#8d877b" stroke-width=".8" />
      </g>
    </g>

    <!-- 成品：腰系红绳流苏 -->
    <g class="hulu__layer" :class="{ on: step >= 4 }" fill="none" stroke-linecap="round">
      <path d="M170 207 Q200 219 230 207" stroke="#a8291b" stroke-width="4" />
      <path d="M176 212 C168 226 158 234 146 242" stroke="#a8291b" stroke-width="2.4" />
      <circle cx="144" cy="244" r="4" fill="#a8291b" stroke="none" />
      <path d="M141 247 L134 276 M144 248 L142 280 M147 247 L150 276" stroke="#b8352a" stroke-width="1.6" />
    </g>
  </svg>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

defineProps({
  step: { type: Number, default: 0 },
  // 列表页缩略图用静态成品，关闭描线/飘落动画
  animated: { type: Boolean, default: true },
})

const STEP_LABELS = ['选料', '去皮晾晒', '画稿', '雕刻', '上色成品']

// 同页可能渲染多份（列表缩略 + 舞台），defs id 需唯一
const id = `hulu-${getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)}`
const uid = (name) => `${id}-${name}`
const url = (name) => `url(#${uid(name)})`

// 亚腰葫芦剪影：上小下大，束腰
const GOURD = [
  'M200 72',
  'C230 72 260 100 260 140',
  'C260 174 234 190 228 207',
  'C224 226 308 240 308 316',
  'C308 374 260 412 200 412',
  'C140 412 92 374 92 316',
  'C92 240 176 226 172 207',
  'C166 190 140 174 140 140',
  'C140 100 170 72 200 72 Z',
].join(' ')

// 纹样：下腹折枝梅 + 上腹祥云
const CLOUD = 'M166 146 C164 128 188 122 194 136 C198 120 226 122 226 140 C240 138 242 158 228 160 L176 160 C164 160 160 150 166 146 Z'
const PATTERN = [
  'M118 372 C146 344 168 336 188 306 C204 282 228 272 258 264',
  'M188 306 C198 326 222 336 248 338',
  'M164 336 C158 316 148 302 134 294',
  'M222 278 C226 262 236 252 246 246',
  CLOUD,
  'M184 150 C182 142 192 140 194 147',
]
const BLOSSOMS = [[258, 264], [248, 338], [134, 294], [246, 246], [210, 288]]
const LEAVES = [
  'M176 318 C168 306 172 296 184 298 C186 308 184 314 176 318 Z',
  'M226 330 C230 318 242 316 246 324 C240 332 232 334 226 330 Z',
  'M150 316 C140 312 138 302 146 298 C152 304 154 310 150 316 Z',
]
const SHAVINGS = [
  'translate(110 150) rotate(-20)',
  'translate(286 170) rotate(30)',
  'translate(96 270) rotate(12)',
  'translate(304 268) rotate(-35)',
  'translate(128 380) rotate(-8)',
  'translate(276 372) rotate(20)',
]

const petals = ([cx, cy]) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5]
  })
</script>

<style scoped>
.hulu {
  width: 100%;
  height: 100%;
  display: block;
}

.hulu__layer {
  opacity: 0;
  transition: opacity 0.9s ease;
}
.hulu__layer.on {
  opacity: 1;
}

/* 画稿：墨线逐笔描出 */
.hulu__draft path,
.hulu__draft circle {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.hulu__draft.on path,
.hulu__draft.on circle {
  animation: hulu-draw 2.2s ease forwards;
}
.hulu__draft.on :nth-child(2n) { animation-delay: 0.35s; }
.hulu__draft.on :nth-child(3n) { animation-delay: 0.7s; }

@keyframes hulu-draw {
  to { stroke-dashoffset: 0; }
}

/* 去皮：卷屑缓缓落下 */
.hulu__peel.on path {
  animation: hulu-fall 2.6s ease-in infinite;
}
.hulu__peel.on path:nth-child(2n) { animation-delay: 0.9s; }
.hulu__peel.on path:nth-child(3n) { animation-delay: 1.6s; }

@keyframes hulu-fall {
  0% { translate: 0 -10px; opacity: 0; }
  20% { opacity: 1; }
  100% { translate: 6px 30px; opacity: 0; }
}

/* 刻刀：短促往复 */
.hulu__knife.on > g {
  animation: hulu-carve 1.1s ease-in-out infinite;
}
@keyframes hulu-carve {
  0%, 100% { translate: 0 0; }
  50% { translate: -8px 6px; }
}

.hulu--static .hulu__layer { transition: none; }
.hulu--static .hulu__draft path,
.hulu--static .hulu__draft circle { stroke-dashoffset: 0; animation: none; }

@media (prefers-reduced-motion: reduce) {
  .hulu__layer { transition: none; }
  .hulu__draft.on path,
  .hulu__draft.on circle { animation: none; stroke-dashoffset: 0; }
  .hulu__peel.on path,
  .hulu__knife.on > g { animation: none; }
}
</style>
