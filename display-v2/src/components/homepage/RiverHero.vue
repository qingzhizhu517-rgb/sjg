<template>
  <section ref="root" class="rh">
    <!-- 画卷层：当前节气图全屏铺底，交叉淡入 -->
    <div class="rh__stack" aria-hidden="true">
      <Transition name="term-fade" mode="out-in">
        <img
          :key="termIndex"
          class="rh__img"
          :src="termImages[termIndex]"
          :alt="currentTerm"
          decoding="async"
        />
      </Transition>
    </div>
    <div class="rh__veil" aria-hidden="true"></div>

    <!-- 内容：与全站栅格同一左基线（--container-max 居中） -->
    <div class="rh__inner">
      <div class="rh__content">
        <div ref="headRef" class="rh__head">
          <span class="rh__seal">{{ sealChar }}</span>
          <span class="rh__eyebrow">{{ eyebrow }}</span>
        </div>

        <h1 ref="titleRef" class="rh__title">
          <span class="rh__title-line">{{ titleLine1 }}</span>
          <span class="rh__title-line">{{ titleLine2 }}</span>
        </h1>

        <p ref="subRef" class="rh__subtitle">{{ subtitle }}</p>

        <ul ref="statsRef" class="rh__stats" v-if="stats && stats.length">
          <li v-for="(s, i) in stats" :key="i" class="rh__stat">
            <span class="rh__stat-num">
              {{ s.value }}<i class="rh__stat-suffix">{{ s.suffix || '' }}</i>
            </span>
            <span class="rh__stat-label">{{ s.label }}</span>
          </li>
        </ul>

        <button v-if="ctaLabel" ref="ctaRef" class="rh__cta" @click="$emit('cta')">
          <span>{{ ctaLabel }}</span>
          <span class="rh__cta-arrow">↓</span>
        </button>

        <!-- 当前节气题识（流内，不再绝对定位到首屏之外） -->
        <p class="rh__kuan">
          <span class="rh__kuan-seal">{{ currentTerm }}</span>
          <span class="rh__kuan-loc">{{ termLocation }}</span>
        </p>
      </div>
    </div>

    <!-- 右缘竖排节气轨：24 项全部以刻度呈现，激活/悬停时显名。
         改自原底部横向 chip 条 —— 那版 24 个 chip 共约 1290px 却只有 1080px 容器，
         且隐藏了滚动条，导致 4-5 个节气无法发现；且整条位于首屏之下。 -->
    <nav class="rh__terms" aria-label="二十四节气导航">
      <span class="rh__terms-title" aria-hidden="true">黄河二十四节气</span>
      <button
        v-for="(t, i) in SOLAR_TERMS"
        :key="t"
        class="rh__term"
        :class="{ 'is-active': i === termIndex }"
        :aria-current="i === termIndex ? 'true' : undefined"
        @click="seekTerm(i)"
      >
        <span class="rh__term-name">{{ t }}</span>
        <span class="rh__term-tick" aria-hidden="true"></span>
      </button>
      <span class="rh__terms-ctl">
        <button class="rh__ctl" :aria-pressed="autoPlay" :aria-label="autoPlay ? '暂停轮播' : '开始轮播'" @click="toggleAuto">{{ autoPlay ? '停' : '轮' }}</button>
        <button class="rh__ctl" aria-label="上一节气" @click="stepTerm(-1)">‹</button>
        <button class="rh__ctl" aria-label="下一节气" @click="stepTerm(1)">›</button>
      </span>
    </nav>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'

defineProps({
  eyebrow: { type: String, default: '山东 · 黄河入海' },
  sealChar: { type: String, default: '河' },
  titleLine1: { type: String, default: '山东揽胜' },
  titleLine2: { type: String, default: '黄河入海' },
  // 不含具体数量词：数量由下方 stats 从 API 实时给出。
  // 旧默认值写死「三百余处、近百位」，与正下方的实时数字自相矛盾。
  subtitle: {
    type: String,
    default: '黄河自菏泽入境，经九城，至东营归海。沿途文脉绵延，名士辈出，名篇千载流芳。',
  },
  stats: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: '沿河而下' },
})
defineEmits(['cta'])

// ---- 24 节气画卷轮播 ----
const SOLAR_TERMS = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]
// 各节气对应拍摄地（与素材文件名一一对应, 从三江源到入海口）
const TERM_LOCATIONS = {
  立春: '青海 · 三江源', 雨水: '青海 · 扎陵湖', 惊蛰: '四川 · 红原大草原', 春分: '四川 · 若尔盖草原',
  清明: '甘肃 · 玛曲黄河特大桥', 谷雨: '甘肃 · 阿万仓湿地', 立夏: '青海 · 龙羊峡水库', 小满: '青海 · 李家峡水库',
  芒种: '甘肃 · 刘家峡水库', 夏至: '甘肃 · 兰州市区', 小暑: '甘肃 · 三河口天鹅滩', 大暑: '甘肃 · 永泰古城',
  立秋: '甘肃 · 黄河石林', 处暑: '宁夏 · 沙坡头', 白露: '宁夏 · 青铜峡大峡谷', 秋分: '内蒙古 · 河套平原',
  寒露: '山西内蒙古 · 老牛湾', 霜降: '陕西 · 香炉寺', 立冬: '陕西 · 乾坤湾', 小雪: '山西 · 壶口瀑布',
  大雪: '河南 · 小浪底', 冬至: '河南 · 黄河滩地公园', 小寒: '河南 · 东坝头黄河湾', 大寒: '山东 · 黄河入海口',
}
// 构建期扫描: /public/images/solar-terms/term-01..24.jpg 按序映射
const _termGlob = import.meta.glob('/public/images/solar-terms/term-*.jpg', { eager: true, import: 'default' })
const termImages = SOLAR_TERMS.map((_, i) => {
  const key = Object.keys(_termGlob).find((k) => k.endsWith(`term-${String(i + 1).padStart(2, '0')}.jpg`))
  return key ? _termGlob[key] : ''
})

const termIndex = ref(0)
const autoPlay = ref(true)
let autoTimer = null
const currentTerm = computed(() => SOLAR_TERMS[termIndex.value] || '立春')
const termLocation = computed(() => TERM_LOCATIONS[currentTerm.value] || '')

// 预取下一张：单图 170-355KB，冷加载时若不预取，淡入前期会露出底色
watch(termIndex, (i) => {
  const next = termImages[(i + 1) % SOLAR_TERMS.length]
  if (next) new Image().src = next
}, { immediate: true })

const seekTerm = (i) => {
  termIndex.value = (i + SOLAR_TERMS.length) % SOLAR_TERMS.length
  restartAuto()
}
const stepTerm = (dir) => seekTerm(termIndex.value + dir)
const toggleAuto = () => {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) restartAuto()
  else stopAuto()
}
const restartAuto = () => {
  stopAuto()
  if (!autoPlay.value || reduce.value) return
  autoTimer = window.setInterval(() => {
    termIndex.value = (termIndex.value + 1) % SOLAR_TERMS.length
  }, 8000)
}
const stopAuto = () => {
  if (autoTimer) {
    window.clearInterval(autoTimer)
    autoTimer = null
  }
}

const reduce = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const root = ref(null)
const headRef = ref(null)
const titleRef = ref(null)
const subRef = ref(null)
const statsRef = ref(null)
const ctaRef = ref(null)
let tl = null

onMounted(() => {
  restartAuto()
  if (reduce.value || !root.value) return
  tl = gsap.timeline({ delay: 0.15 })
  if (headRef.value)
    tl.from(headRef.value.children, { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
  if (titleRef.value)
    tl.from(
      titleRef.value.querySelectorAll('.rh__title-line'),
      { opacity: 0, y: 30, duration: 0.8, stagger: 0.12, ease: 'power3.out' },
      '-=0.3',
    )
  if (subRef.value)
    tl.from(subRef.value, { opacity: 0, y: 14, duration: 0.5, ease: 'power3.out' }, '-=0.45')
  if (statsRef.value)
    tl.from(statsRef.value.children, { opacity: 0, y: 12, duration: 0.45, stagger: 0.06, ease: 'power3.out' }, '-=0.3')
  if (ctaRef.value)
    tl.from(ctaRef.value, { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' }, '-=0.25')
})

onBeforeUnmount(() => {
  stopAuto()
  if (tl) tl.kill()
  tl = null
})
</script>

<style scoped>
/* 首屏：全铺节气画卷 + 左下题识。
   高度扣掉 header（旧版是裸 100vh，而 .main-content 有 padding-top:64px，
   导致 hero 底边落在 100vh+64px，底部控件整条在首屏之外）。
   用 dvh 避免移动端地址栏收缩时跳变。 */
.rh {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
  min-height: calc(100dvh - var(--nav-height));
  display: flex;
  align-items: flex-end;
}

.rh__stack {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.rh__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* mode="out-in"：旧版进出场并发，两张半透明图叠在深色底上，
   中点合成 alpha≈0.75 → 每 8 秒整屏向近黑下沉再回来 */
.term-fade-enter-active {
  transition: opacity 1.2s ease;
}
.term-fade-leave-active {
  transition: opacity 0.4s ease;
}
.term-fade-enter-from,
.term-fade-leave-to {
  opacity: 0;
}

.rh__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    100deg,
    var(--overlay-strong) 0%,
    color-mix(in srgb, var(--text-primary) 30%, transparent) 46%,
    transparent 72%
  );
}

.rh__inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--sp-9) var(--sp-5) var(--sp-8);
}

.rh__content {
  max-width: var(--measure-wide);
}

.rh__head {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-5);
}
.rh__seal {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  border-radius: var(--radius-sm);
  transform: rotate(-3deg);
  flex-shrink: 0;
}
.rh__eyebrow {
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 5px;
  color: var(--bg-primary);
}

.rh__title {
  margin: 0 0 var(--sp-5) 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.rh__title-line {
  font-family: var(--font-display);
  font-size: var(--fs-display);
  font-weight: 600;
  /* 6px 而非 12px：letter-spacing 会加在末字之后，
     4 字标题右侧多出的空白会破坏与副标题的左对齐感知 */
  letter-spacing: 6px;
  line-height: var(--lh-tight);
  color: var(--bg-primary);
  display: block;
}

.rh__subtitle {
  font-size: var(--fs-body);
  line-height: var(--lh-loose);
  color: color-mix(in srgb, var(--bg-primary) 85%, transparent);
  margin: 0 0 var(--sp-5) 0;
  max-width: var(--measure);
}

/* 数据条：全站唯一一处四联统计（原先首页出现 3 次） */
.rh__stats {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
  padding: var(--sp-4) 0;
  margin: 0 0 var(--sp-5) 0;
  border-top: 1px solid color-mix(in srgb, var(--bg-primary) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--bg-primary) 25%, transparent);
  max-width: var(--measure-wide);
}
.rh__stat {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  text-align: left;
}
.rh__stat-num {
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 600;
  color: var(--bg-primary);
  line-height: 1;
}
.rh__stat-suffix {
  font-style: normal;
  font-size: var(--fs-body-sm);
  margin-left: 2px;
  color: color-mix(in srgb, var(--bg-primary) 70%, transparent);
}
.rh__stat-label {
  font-size: var(--fs-caption);
  letter-spacing: 2px;
  color: color-mix(in srgb, var(--bg-primary) 70%, transparent);
}

/* CTA */
.rh__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--bg-primary);
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, transform 0.3s;
}
.rh__cta:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
  transform: translateY(-2px);
}
.rh__cta-arrow {
  transition: transform 0.3s;
}
.rh__cta:hover .rh__cta-arrow {
  transform: translateY(3px);
}

/* 节气题识（流内，跟随内容） */
.rh__kuan {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: var(--sp-6) 0 0;
}
.rh__kuan-seal {
  padding: 3px var(--sp-2);
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-display);
  font-size: var(--fs-body-sm);
  letter-spacing: 2px;
  border-radius: var(--radius-sm);
  transform: rotate(-2deg);
}
.rh__kuan-loc {
  font-size: var(--fs-caption);
  letter-spacing: 2px;
  color: color-mix(in srgb, var(--bg-primary) 70%, transparent);
}

/* ===== 右缘竖排节气轨 =====
   24 项以刻度形式常驻，激活/悬停显名。旧版是底部横向 chip 条：
   总宽约 1290px 却只有 1080px 容器且隐藏滚动条，末尾数项无法发现。 */
.rh__terms {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding: var(--sp-8) var(--sp-5);
}
.rh__terms-title {
  writing-mode: vertical-rl;
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  letter-spacing: 6px;
  color: color-mix(in srgb, var(--bg-primary) 55%, transparent);
  margin-bottom: var(--sp-4);
}
.rh__term {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-2);
  padding: 1px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: color-mix(in srgb, var(--bg-primary) 55%, transparent);
  transition: color 0.22s;
}
.rh__term-name {
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  letter-spacing: 2px;
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.22s, transform 0.22s;
}
.rh__term-tick {
  width: 14px;
  height: 1px;
  background: currentColor;
  transition: width 0.22s, background 0.22s;
  flex-shrink: 0;
}
.rh__term:hover,
.rh__term:focus-visible {
  color: var(--bg-primary);
}
.rh__term:hover .rh__term-name,
.rh__term:focus-visible .rh__term-name {
  opacity: 1;
  transform: none;
}
.rh__term:hover .rh__term-tick {
  width: 22px;
}
.rh__term.is-active {
  color: var(--accent-light);
}
.rh__term.is-active .rh__term-name {
  opacity: 1;
  transform: none;
}
.rh__term.is-active .rh__term-tick {
  width: 28px;
  background: var(--accent-light);
}

.rh__terms-ctl {
  display: flex;
  gap: var(--sp-1);
  margin-top: var(--sp-4);
}
.rh__ctl {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--text-primary) 30%, transparent);
  border: 1px solid color-mix(in srgb, var(--bg-primary) 35%, transparent);
  border-radius: 50%;
  color: var(--bg-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-caption);
  cursor: pointer;
  transition: background 0.25s, border-color 0.25s;
}
.rh__ctl:hover {
  background: var(--accent);
  border-color: var(--accent);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .rh__inner {
    padding: var(--sp-8) var(--sp-5) var(--sp-7);
  }
  .rh__terms {
    padding: var(--sp-7) var(--sp-4);
  }
  .rh__title-line {
    letter-spacing: 4px;
  }
}
@media (max-width: 640px) {
  .rh {
    align-items: flex-end;
  }
  .rh__inner {
    padding: var(--sp-8) var(--sp-4) var(--sp-6);
  }
  /* 窄屏收为纯刻度条，不占文字宽度 */
  .rh__terms {
    padding: var(--sp-6) var(--sp-2);
    gap: 1px;
  }
  .rh__terms-title,
  .rh__term-name {
    display: none;
  }
  .rh__term-tick {
    width: 10px;
  }
  .rh__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .rh__kuan {
    flex-wrap: wrap;
    gap: var(--sp-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .term-fade-enter-active,
  .term-fade-leave-active,
  .rh__cta,
  .rh__cta-arrow,
  .rh__term,
  .rh__term-name,
  .rh__term-tick,
  .rh__ctl {
    transition: none;
  }
}
</style>
