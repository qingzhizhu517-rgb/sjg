<template>
  <div ref="root" class="stat-ticker" :class="`tone-${tone}`">
    <div v-for="(s, i) in stats" :key="i" class="stat-ticker__item">
      <span class="stat-ticker__num">
        <span ref="nums" class="stat-ticker__val" :data-target="s.value">0</span><span
          v-if="s.suffix"
          class="stat-ticker__suffix"
        >{{ s.suffix }}</span>
      </span>
      <span class="stat-ticker__lbl">{{ s.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  stats: { type: Array, required: true }, // [{ value: 130, suffix: '位', label: '名士' }]
  tone: { type: String, default: 'light' }, // light | dark（默认 light：宣纸底可读；dark 仅供深底 hero 显式opt-in）
})

const root = ref(null)
const nums = ref([])
let tweens = []

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  nums.value.forEach((el) => {
    if (!el) return
    const target = Number(el.dataset.target) || 0
    if (reduce) {
      el.textContent = String(target)
      return
    }
    el.textContent = '0'
    const obj = { v: 0 }
    const t = gsap.to(obj, {
      v: target,
      duration: 1.2,
      ease: 'power1.inOut',
      snap: { v: 1 },
      onUpdate: () => {
        el.textContent = Math.round(obj.v).toString()
      },
      scrollTrigger: {
        trigger: root.value,
        start: 'top 92%',
        once: true,
      },
    })
    tweens.push(t)
  })
})

onBeforeUnmount(() => {
  tweens.forEach((t) => {
    if (t.scrollTrigger) t.scrollTrigger.kill()
    t.kill()
  })
  tweens = []
})
</script>

<style scoped>
.stat-ticker {
  display: flex;
  flex-wrap: wrap;
  gap: 22px 40px;
  align-items: baseline;
}
.stat-ticker__item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.stat-ticker__num {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: var(--font-display);
  line-height: 1;
}
.stat-ticker__val {
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0;
}
.stat-ticker__suffix {
  font-size: 15px;
  font-weight: 700;
}
.stat-ticker__lbl {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
}

/* dark（墨卷 Hero 内） */
.stat-ticker.tone-dark .stat-ticker__val { color: #e8c674; }
.stat-ticker.tone-dark .stat-ticker__suffix { color: #d4af37; }
.stat-ticker.tone-dark .stat-ticker__lbl { color: rgba(242, 235, 217, 0.6); }

/* light（浅纸区） */
.stat-ticker.tone-light .stat-ticker__val { color: var(--accent); }
.stat-ticker.tone-light .stat-ticker__suffix { color: var(--accent-dark); }
.stat-ticker.tone-light .stat-ticker__lbl { color: var(--text-muted); }

@media (max-width: 640px) {
  .stat-ticker { gap: 16px 26px; }
  .stat-ticker__val { font-size: 27px; }
  .stat-ticker__lbl { font-size: 10px; }
}
</style>
