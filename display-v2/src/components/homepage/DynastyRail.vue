<template>
  <div class="rail" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="d in dynasties"
      :key="d.id == null ? 'all' : d.id"
      class="rail__chip"
      :class="{ 'is-active': modelValue === d.id, 'is-faded': d.id !== null && d.poetCount === 0 }"
      role="tab"
      :aria-selected="modelValue === d.id"
      @click="$emit('update:modelValue', d.id)"
    >
      <span class="rail__name">{{ d.name }}</span>
      <span v-if="d.id !== null" class="rail__count">{{ d.poetCount }}</span>
      <span v-if="d.startYear" class="rail__year">{{ formatYear(d.startYear) }}-{{ formatYear(d.endYear) }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  dynasties: { type: Array, required: true }, // [{ id, name, startYear, endYear, poetCount }] + { id: null, name: '全部' }
  modelValue: { default: null },
  ariaLabel: { type: String, default: '朝代选择' },
})
defineEmits(['update:modelValue'])

const formatYear = (y) => (y == null ? '' : y < 0 ? '前' + Math.abs(y) : String(y))
</script>

<style scoped>
.rail {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 10px;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}
.rail::-webkit-scrollbar { height: 4px; }
.rail::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.rail__chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 88px;
  padding: 10px 14px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  scroll-snap-align: start;
}
.rail__chip:hover:not(:disabled) {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.rail__chip.is-active {
  background: #9e2b25;
  border-color: #9e2b25;
  box-shadow: 0 4px 14px rgba(158, 43, 37, 0.28);
}
.theme-real .rail__chip.is-active {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
  box-shadow: 0 4px 14px rgba(184, 134, 11, 0.28);
}
.rail__chip.is-faded {
  opacity: 0.5;
}
.rail__name {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.rail__chip.is-active .rail__name {
  color: #fff;
}
.rail__count {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0;
}
.rail__chip.is-active .rail__count {
  color: rgba(255, 255, 255, 0.85);
}
.rail__year {
  font-size: 9.5px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.rail__chip.is-active .rail__year {
  color: rgba(255, 255, 255, 0.7);
}
@media (max-width: 640px) {
  .rail__chip { min-width: 76px; padding: 8px 10px; }
  .rail__name { font-size: 13px; }
}
</style>
