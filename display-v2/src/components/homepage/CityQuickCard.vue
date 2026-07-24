<template>
  <article class="city hover-lift" @click="$emit('click')">
    <span class="city__stamp">{{ city.name ? city.name.charAt(0) : '城' }}</span>
    <div class="city__body">
      <h3 class="city__name">{{ city.name }}</h3>
      <span class="city__count">{{ city.spotCount || 0 }} 处景观</span>
    </div>
    <span class="city__arrow">→</span>
  </article>
</template>

<script setup>
defineProps({
  city: { type: Object, required: true }, // { name, spotCount }
})
defineEmits(['click'])
</script>

<style scoped>
.city {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.city__stamp {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  border-radius: 2px;
}
.theme-real .city__stamp {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.city__body {
  flex: 1;
  min-width: 0;
}
.city__name {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0 0 3px 0;
  line-height: 1.1;
}
.city__count {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.city__arrow {
  color: var(--text-muted);
  font-size: 16px;
  transition: transform 0.3s;
}
.hover-lift:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--text-primary) 0.1%, transparent);
}
.hover-lift:hover .city__arrow {
  transform: translateX(4px);
  color: var(--accent);
}
</style>
