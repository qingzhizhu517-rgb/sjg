<template>
  <section class="rcr">
    <SectionHeading
      eyebrow="Yellow River · Shandong"
      title="沿黄九城"
      subtitle="自菏泽入境，至东营归海，九城如珠缀于河上"
    />

    <div ref="railRef" class="rcr__rail">
      <!-- 背景黄河曲线 -->
      <svg
        class="rcr__river"
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#C27B38" stop-opacity="0.2" />
            <stop offset="50%" stop-color="#C27B38" stop-opacity="0.55" />
            <stop offset="100%" stop-color="#3d85c6" stop-opacity="0.5" />
          </linearGradient>
        </defs>
        <!-- 主河道：粗金色 -->
        <path
          class="rcr__river-main"
          d="M 60 380 Q 180 320 280 360 Q 380 400 460 340 Q 540 280 640 320 Q 740 360 830 300 Q 920 240 1010 290 Q 1100 340 1150 310"
          fill="none"
          stroke="url(#riverGrad)"
          stroke-width="6"
          stroke-linecap="round"
        />
        <!-- 次河道：细虚线，模拟水纹 -->
        <path
          class="rcr__river-dash"
          d="M 60 380 Q 180 320 280 360 Q 380 400 460 340 Q 540 280 640 320 Q 740 360 830 300 Q 920 240 1010 290 Q 1100 340 1150 310"
          fill="none"
          stroke="#C27B38"
          stroke-width="1.2"
          stroke-dasharray="6 10"
          opacity="0.5"
        />
        <!-- 入海口波纹 -->
        <g class="rcr__sea" transform="translate(1150 310)">
          <path d="M 0 0 Q 12 -6 24 0 Q 36 6 48 0" fill="none" stroke="#3d85c6" stroke-width="1.2" opacity="0.6"/>
          <path d="M -4 10 Q 10 4 24 10 Q 38 16 52 10" fill="none" stroke="#3d85c6" stroke-width="1" opacity="0.4"/>
          <path d="M -8 20 Q 8 14 24 20 Q 40 26 56 20" fill="none" stroke="#3d85c6" stroke-width="0.8" opacity="0.25"/>
        </g>
      </svg>

      <!-- 城市卡：沿河错落 -->
      <div class="rcr__cities">
        <article
          v-for="(c, i) in citiesWithMeta"
          :key="c.name"
          class="rcr__city"
          :class="[`rcr__city--${c.key}`, { 'rcr__city--major': c.major }]"
          :style="{ '--delay': `${i * 0.08}s` }"
          @click="$emit('go', c.name)"
        >
          <div class="rcr__city-frame">
            <img :src="c.img" :alt="c.name" class="rcr__city-img" loading="lazy" />
          </div>
          <div class="rcr__city-info">
            <span class="rcr__city-tag">{{ c.tag }}</span>
            <h3 class="rcr__city-name">{{ c.name }}</h3>
            <span class="rcr__city-count" v-if="c.spotCount">{{ c.spotCount }} 处景观</span>
          </div>
          <span class="rcr__city-stamp" :style="{ background: c.color }">{{ c.name.charAt(0) }}</span>
        </article>
      </div>
    </div>

    <p class="rcr__hint">
      <span class="rcr__hint-seal">注</span>
      九城按黄河实际流向排布，自西向东，越近入海口城卡越大 —— 溪流汇海。
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'
import imgHeze from '../../assets/illustrations/01-city-heze.png'
import imgJining from '../../assets/illustrations/02-city-jining.png'
import imgTaian from '../../assets/illustrations/03-city-taian.png'
import imgLiaocheng from '../../assets/illustrations/04-city-liaocheng.png'
import imgJinan from '../../assets/illustrations/05-city-jinan.png'
import imgDezhou from '../../assets/illustrations/06-city-dezhou.png'
import imgZibo from '../../assets/illustrations/07-city-zibo.png'
import imgBinzhou from '../../assets/illustrations/08-city-binzhou.png'
import imgDongying from '../../assets/illustrations/09-city-dongying.png'

const props = defineProps({
  regions: { type: Array, default: () => [] }, // [{name, spotCount}, ...]
})
defineEmits(['go'])

const railRef = ref(null)

// 城市元数据（沿黄河流向自西向东）
const CITY_META = [
  { key: 'heze', name: '菏泽', tag: '入境 · 牡丹之都', img: imgHeze, color: '#C23A2B', major: false, pos: { left: '4%', top: '58%' } },
  { key: 'jining', name: '济宁', tag: '孔孟之乡', img: imgJining, color: '#8e352e', major: false, pos: { left: '14%', top: '32%' } },
  { key: 'taian', name: '泰安', tag: '五岳独尊', img: imgTaian, color: '#674ea7', major: true, pos: { left: '24%', top: '55%' } },
  { key: 'liaocheng', name: '聊城', tag: '运河古都', img: imgLiaocheng, color: '#8e352e', major: false, pos: { left: '35%', top: '28%' } },
  { key: 'jinan', name: '济南', tag: '泉城', img: imgJinan, color: '#3d85c6', major: true, pos: { left: '46%', top: '52%' } },
  { key: 'dezhou', name: '德州', tag: '九达天衢', img: imgDezhou, color: '#674ea7', major: false, pos: { left: '57%', top: '26%' } },
  { key: 'zibo', name: '淄博', tag: '齐都陶韵', img: imgZibo, color: '#6aa84f', major: false, pos: { left: '67%', top: '50%' } },
  { key: 'binzhou', name: '滨州', tag: '黄河湿地', img: imgBinzhou, color: '#5b8c85', major: false, pos: { left: '78%', top: '30%' } },
  { key: 'dongying', name: '东营', tag: '入海 · 河海交汇', img: imgDongying, color: '#008080', major: true, pos: { left: '86%', top: '52%' } },
]

const citiesWithMeta = computed(() => {
  // 合并 API 返回的 spotCount 到本地元数据
  const countMap = {}
  props.regions.forEach((r) => {
    if (r && r.name) countMap[r.name] = r.spotCount || r.count || 0
  })
  return CITY_META.map((c) => ({
    ...c,
    spotCount: countMap[c.name] || 0,
  }))
})
</script>

<style scoped>
.rcr {
  position: relative;
  padding: 80px 56px 64px;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ============ 铁路（长卷）容器 ============ */
.rcr__rail {
  position: relative;
  width: 100%;
  aspect-ratio: 1200 / 560;
  margin-top: 24px;
}

.rcr__river {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.rcr__river-dash {
  animation: riverFlow 24s linear infinite;
}
@keyframes riverFlow {
  to {
    stroke-dashoffset: -160;
  }
}

/* ============ 城市卡 ============ */
.rcr__cities {
  position: absolute;
  inset: 0;
}

.rcr__city {
  position: absolute;
  width: 11%;
  min-width: 90px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: cityIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay, 0s);
}
@keyframes cityIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(16px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) scale(1);
  }
}

/* 定位（与 CITY_META.pos 对齐） */
.rcr__city--heze { left: 4%; top: 58%; }
.rcr__city--jining { left: 14%; top: 32%; }
.rcr__city--taian { left: 24%; top: 55%; }
.rcr__city--liaocheng { left: 35%; top: 28%; }
.rcr__city--jinan { left: 46%; top: 52%; }
.rcr__city--dezhou { left: 57%; top: 26%; }
.rcr__city--zibo { left: 67%; top: 50%; }
.rcr__city--binzhou { left: 78%; top: 30%; }
.rcr__city--dongying { left: 86%; top: 52%; }

/* 大小节奏：入境小、入海口大 */
.rcr__city--heze,
.rcr__city--jining,
.rcr__city--liaocheng { width: 9%; }
.rcr__city--taian,
.rcr__city--dezhou,
.rcr__city--zibo,
.rcr__city--binzhou { width: 10.5%; }
.rcr__city--jinan { width: 12.5%; }
.rcr__city--dongying { width: 14%; }

.rcr__city-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.05),
    0 12px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.rcr__city-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.rcr__city:hover {
  transform: translate(-50%, -50%) translateY(-6px) scale(1.04);
  z-index: 5;
}
.rcr__city:hover .rcr__city-frame {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 24px 56px rgba(158, 43, 37, 0.15);
  border-color: var(--accent);
}
.rcr__city:hover .rcr__city-img {
  transform: scale(1.08);
}

.rcr__city-info {
  margin-top: 10px;
  text-align: center;
}
.rcr__city-tag {
  display: block;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--text-muted);
  margin-bottom: 3px;
}
.rcr__city-name {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 3px;
  margin: 0;
  line-height: 1.2;
}
.rcr__city-count {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-top: 2px;
}

.rcr__city-stamp {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5efe3;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 900;
  border-radius: 3px;
  transform: rotate(3deg);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s;
}
.rcr__city:hover .rcr__city-stamp {
  transform: rotate(8deg) scale(1.1);
}

/* ============ 提示 ============ */
.rcr__hint {
  margin: 32px auto 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.rcr__hint-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 1024px) {
  .rcr {
    padding: 64px 32px 48px;
  }
  .rcr__rail {
    aspect-ratio: auto;
    height: auto;
    padding-bottom: 0;
  }
  .rcr__river {
    position: relative;
    height: 60px;
    margin-bottom: 24px;
  }
  .rcr__cities {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .rcr__city,
  .rcr__city--heze,
  .rcr__city--jining,
  .rcr__city--taian,
  .rcr__city--liaocheng,
  .rcr__city--jinan,
  .rcr__city--dezhou,
  .rcr__city--zibo,
  .rcr__city--binzhou,
  .rcr__city--dongying {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    transform: none;
    animation: none;
  }
  .rcr__city:hover {
    transform: translateY(-4px);
  }
}
@media (max-width: 640px) {
  .rcr {
    padding: 48px 20px 32px;
  }
  .rcr__cities {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .rcr__hint {
    font-size: 11px;
    letter-spacing: 0.5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rcr__river-dash {
    animation: none;
  }
  .rcr__city,
  .rcr__city-frame,
  .rcr__city-img,
  .rcr__city-stamp {
    animation: none;
    transition: none;
  }
}
</style>
